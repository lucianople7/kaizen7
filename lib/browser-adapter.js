const fs = require("node:fs");
const path = require("node:path");
const { appendSignalPacket, buildSignalPacket } = require("./signal-ingestion");
const { htmlToText } = require("./metabrowser");

const SENSITIVE_ACTION = /\b(access token|api key|password|login|oauth|credential|secret|publish|checkout|pay|delete|deploy)\b/i;

function parseBrowserUrl(input) {
  const raw = String(input || "").trim();
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Invalid browser URL");
  }
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Invalid browser URL");
  return {
    url: url.toString(),
    domain: url.hostname,
  };
}

function extractTitle(html = "") {
  const match = String(html).match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return htmlToText(match?.[1] || "");
}

function extractMetaDescription(html = "") {
  const match = String(html).match(/<meta\s+[^>]*(?:name=["']description["'][^>]*content=["']([^"']*)["']|content=["']([^"']*)["'][^>]*name=["']description["'])[^>]*>/i);
  return htmlToText(match?.[1] || match?.[2] || "");
}

function compactPageText(html = "", limit = 5000) {
  return htmlToText(html)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function inferLevel(options = {}) {
  if (options.scriptName || options.level === 3 || options.level === "script") return 3;
  if (options.objective || options.action || options.level === 2 || options.level === "action") return 2;
  return 1;
}

function safeScriptName(value = "") {
  return String(value || "browser-signal")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "browser-signal";
}

function buildReusableScriptSpec({ parsed, objective = "", snapshot = {}, action = "" }) {
  return {
    version: 1,
    type: "metabrowser-script-spec",
    url: parsed.url,
    domain: parsed.domain,
    objective,
    backend: "browser-adapter",
    steps: [
      "open url",
      "read DOM snapshot",
      "extract title, description and relevant visible text",
      "return signal packet to k7:run",
    ],
    action: action || objective || "read page",
    gates: [
      "read-only by default",
      "human approval before login, credential, payment, publish, delete or deploy",
      "save only reusable public signals; never save cookies, tokens or private page data",
    ],
    lastSnapshot: {
      title: snapshot.title || "",
      description: snapshot.description || "",
      excerpt: String(snapshot.text || "").slice(0, 800),
    },
  };
}

function saveReusableScript(spec, options = {}) {
  const root = options.root || process.cwd();
  const scriptsDir = options.scriptsDir || path.join(root, "data", "metabrowser-scripts");
  fs.mkdirSync(scriptsDir, { recursive: true });
  const name = safeScriptName(options.scriptName || spec.domain || "browser-signal");
  const filePath = path.join(scriptsDir, `${name}.json`);
  fs.writeFileSync(filePath, `${JSON.stringify(spec, null, 2)}\n`);
  return filePath;
}

function buildBrowserSignalText({ parsed, snapshot = {}, objective = "", level = 1, action = "", result = "", scriptPath = "" }) {
  return [
    "# Browser page signal",
    "",
    `URL: ${parsed.url}`,
    `Domain: ${parsed.domain}`,
    `Level: ${level}`,
    `Backend: browser-adapter`,
    `Title: ${snapshot.title || "unknown"}`,
    `Description: ${snapshot.description || "none"}`,
    `Objective: ${objective || "read page and extract reusable signal"}`,
    `Action: ${action || (level >= 2 ? "safe read + route to k7:run" : "DOM snapshot read")}`,
    `Result: ${result || "signal packet generated for KAIZEN7"}`,
    scriptPath ? `Reusable script: ${scriptPath}` : "",
    "",
    "Claim: evaluate whether this page reduces steps, tokens, friction or implementation time for KAIZEN7.",
    "Safety: browser adapter is read-only by default; external actions, credentials, publishing, checkout, deletion and deploys require human approval.",
    "Next: route this packet through k7:run and choose the smallest safe action.",
    "",
    "## Page excerpt",
    snapshot.text || "No page text available.",
  ].filter(Boolean).join("\n");
}

function buildBrowserSignalPacket({ url, html = "", objective = "", level, action = "", result = "", scriptPath = "" } = {}) {
  const parsed = parseBrowserUrl(url);
  const resolvedLevel = inferLevel({ level, objective, action, scriptName: scriptPath });
  const snapshot = {
    title: extractTitle(html),
    description: extractMetaDescription(html),
    text: compactPageText(html),
  };
  const packet = buildSignalPacket({
    source: { type: "browser", url: parsed.url, domain: parsed.domain },
    text: buildBrowserSignalText({ parsed, snapshot, objective, level: resolvedLevel, action, result, scriptPath }),
  });
  const sensitive = SENSITIVE_ACTION.test(`${objective} ${action}`);
  return {
    ...packet,
    destination: sensitive ? "decision" : packet.destination,
    nextAction: sensitive
      ? "prepare supervised browser plan; require approval before credentials or external account action"
      : resolvedLevel === 3
        ? "reuse saved MetaBrowser script through k7:run"
        : "score browser signal and select one safe next action",
    browser: {
      url: parsed.url,
      domain: parsed.domain,
      level: resolvedLevel,
      backend: "browser-adapter",
      title: snapshot.title,
      description: snapshot.description,
      objective,
      action: action || "",
      result: result || "",
      scriptPath,
      sensitive,
      gates: sensitive
        ? ["approval_required_before_credentials_or_account_action", "read_only_until_approved"]
        : ["read_only", "write_signal_packet_only"],
    },
  };
}

async function defaultFetchText(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Browser request failed ${response.status}: ${url}`);
  return response.text();
}

async function fetchBrowserSignal(input, options = {}) {
  const parsed = parseBrowserUrl(input);
  const fetchText = options.fetchText || defaultFetchText;
  const html = options.html || await fetchText(parsed.url, {
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": "kaizen7-browser-adapter",
    },
  });
  let scriptPath = "";
  if (options.scriptName || options.level === 3 || options.level === "script") {
    const snapshot = {
      title: extractTitle(html),
      description: extractMetaDescription(html),
      text: compactPageText(html),
    };
    const spec = buildReusableScriptSpec({
      parsed,
      objective: options.objective || "",
      action: options.action || "",
      snapshot,
    });
    scriptPath = saveReusableScript(spec, options);
  }
  return buildBrowserSignalPacket({
    url: parsed.url,
    html,
    objective: options.objective || "",
    level: options.level,
    action: options.action || "",
    result: options.result || "",
    scriptPath,
  });
}

function parseCli(argv) {
  const args = [...argv];
  const url = args.find((arg) => !arg.startsWith("--"));
  let objective = "";
  let level = "";
  let scriptName = "";
  let write = false;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--objective" || arg === "--goal") objective = args[++index] || "";
    else if (arg === "--level") level = args[++index] || "";
    else if (arg === "--script") scriptName = args[++index] || "browser-signal";
    else if (arg === "--write") write = true;
  }
  return { url, objective, level, scriptName, write };
}

module.exports = {
  buildBrowserSignalPacket,
  buildBrowserSignalText,
  buildReusableScriptSpec,
  fetchBrowserSignal,
  parseBrowserUrl,
};

if (require.main === module) {
  const { url, objective, level, scriptName, write } = parseCli(process.argv.slice(2));
  if (!url) {
    process.stderr.write("Usage: node lib/browser-adapter.js <url> [--objective <goal>] [--level 1|2|3] [--script <name>] [--write]\n");
    process.exit(1);
  }
  fetchBrowserSignal(url, { objective, level, scriptName })
    .then((packet) => {
      if (write) appendSignalPacket(packet);
      process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
    })
    .catch((error) => {
      process.stderr.write(`${error.message}\n`);
      process.exit(1);
    });
}
