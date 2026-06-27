const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_INBOX = path.join(__dirname, "..", "data", "signal-inbox.json");
const SOURCE_TYPES = new Set(["web", "github", "huggingface", "paper", "ocr", "ecommerce", "supplier", "text"]);
const TOOL_PATTERNS = [
  /\b(browser-use)\b/gi,
  /\b(crawl4ai)\b/gi,
  /\b(firecrawl)\b/gi,
  /\b(bge-m3)\b/gi,
  /\b(playwright)\b/gi,
  /\b(remotion)\b/gi,
  /\b(gradio)\b/gi,
  /\b(shopify)\b/gi,
];

function normalizeSource(input = {}) {
  const type = SOURCE_TYPES.has(input.type) ? input.type : "text";
  const url = input.url || "";
  let domain = input.domain || "";
  if (!domain && url) {
    try {
      domain = new URL(url).hostname;
    } catch {
      domain = "";
    }
  }
  return {
    type,
    url,
    domain,
    fetchedAt: input.fetchedAt || new Date().toISOString(),
  };
}

function cleanMarkdown(text = "") {
  return String(text)
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function titleFrom(text) {
  const markdown = cleanMarkdown(text);
  const heading = markdown.split("\n").find((line) => /^#\s+/.test(line));
  if (heading) return heading.replace(/^#\s+/, "").trim();
  const firstLine = markdown.split("\n").find((line) => line.trim());
  return (firstLine || "Untitled signal").replace(/^[-*]\s+/, "").slice(0, 90);
}

function sentencesFrom(text) {
  return cleanMarkdown(text)
    .replace(/^#+\s+/gm, "")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function summarizeText(text, options = {}) {
  const maxSentences = options.maxSentences || 3;
  return sentencesFrom(text).slice(0, maxSentences).join(" ");
}

function unique(items) {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function uniqueCaseInsensitive(items) {
  const seen = new Set();
  const result = [];
  for (const item of items.map((entry) => entry.trim()).filter(Boolean)) {
    const key = item.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item.toLowerCase());
    }
  }
  return result;
}

function extractPrices(text) {
  return unique(String(text).match(/(?:[$€£]\s?\d+(?:[.,]\d+)?)|(?:\b\d+(?:[.,]\d+)?\s?(?:usd|eur|gbp)\b)/gi) || []);
}

function extractTools(text) {
  const tools = [];
  for (const pattern of TOOL_PATTERNS) {
    for (const match of String(text).matchAll(pattern)) tools.push(match[1]);
  }
  return uniqueCaseInsensitive(tools);
}

function extractLines(text, matcher) {
  return unique(cleanMarkdown(text).split("\n").filter((line) => matcher.test(line)).map((line) => line.replace(/^[-*#\s]+/, "")));
}

function extractSignals(text) {
  const lowerText = String(text).toLowerCase();
  return {
    claims: extractLines(text, /\b(claims?|improves?|reduce|fewer|less|better|supports?|automation|retrieval|benchmark)\b/i).slice(0, 8),
    entities: unique((String(text).match(/\b[A-Z][A-Za-z0-9.-]{2,}(?:\s+[A-Z][A-Za-z0-9.-]{2,})?\b/g) || [])).slice(0, 12),
    prices: extractPrices(text),
    ingredients: extractLines(text, /\b(ingredient|formula|mg|caffeine|creatine|nootropic|peptide)\b/i).slice(0, 8),
    tools: extractTools(text),
    risks: extractLines(text, /\b(risk|requires?|credential|secret|license|agpl|gpl|medical|legal|compliance|claim)\b/i).slice(0, 8),
    marketSignals: extractLines(text, /\b(ecommerce|supplier|customer|conversion|seo|tiktok|shorts|reels|market)\b/i).slice(0, 8),
    hasNext: /\b(next|prototype|benchmark|implement|adopt|test)\b/i.test(lowerText),
  };
}

function classifyDestination({ source, signals, text }) {
  if (signals.risks.some((risk) => /\bagpl|gpl|medical|legal|compliance\b/i.test(risk))) return "decision";
  if (signals.hasNext || signals.tools.length) return "task";
  if (source.type === "github" || source.type === "huggingface" || source.type === "paper") return "research";
  if (/\bspec|architecture|contract|api\b/i.test(text)) return "spec";
  return "signal_bowl";
}

function confidenceFor({ source, signals, text }) {
  let score = 0;
  if (source.url || source.domain) score += 1;
  if (signals.tools.length || signals.entities.length) score += 1;
  if (signals.claims.length) score += 1;
  if (signals.hasNext) score += 1;
  if (cleanMarkdown(text).length > 120) score += 1;
  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}

function nextActionFor({ destination, signals }) {
  if (destination === "decision") return "review license, claims or credential risk before implementation";
  if (signals.hasNext && signals.tools.length) return `prototype ${signals.tools[0]} as a supervised KAIZEN7 adapter`;
  if (signals.tools.length) return `score ${signals.tools[0]} in Hunter implementation queue`;
  if (destination === "research") return "capture as research and compare against existing registry";
  return "store in Signal Bowl until it links to a concrete task";
}

function buildSignalPacket({ source = {}, text = "" } = {}) {
  const normalizedSource = normalizeSource(source);
  const markdown = cleanMarkdown(text);
  const signals = extractSignals(markdown);
  const destination = classifyDestination({ source: normalizedSource, signals, text: markdown });
  return {
    source: normalizedSource,
    content: {
      title: titleFrom(markdown),
      markdown,
      summary: summarizeText(markdown),
    },
    signals,
    confidence: confidenceFor({ source: normalizedSource, signals, text: markdown }),
    destination,
    nextAction: nextActionFor({ destination, signals }),
    tokenPolicy: "compact packet first; load full source only when selected for execution",
  };
}

function appendSignalPacket(packet, inboxPath = DEFAULT_INBOX) {
  fs.mkdirSync(path.dirname(inboxPath), { recursive: true });
  const existing = fs.existsSync(inboxPath) ? JSON.parse(fs.readFileSync(inboxPath, "utf8")) : [];
  const next = [...existing, packet];
  fs.writeFileSync(inboxPath, `${JSON.stringify(next, null, 2)}\n`);
  return next;
}

function parseCli(argv) {
  const args = [...argv];
  const source = {};
  let text = "";
  let write = false;
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--text") text = args[++index] || "";
    else if (arg === "--url") source.url = args[++index] || "";
    else if (arg === "--type") source.type = args[++index] || "text";
    else if (arg === "--write") write = true;
  }
  return { source, text, write };
}

module.exports = {
  appendSignalPacket,
  buildSignalPacket,
  classifyDestination,
  cleanMarkdown,
  extractSignals,
  normalizeSource,
  summarizeText,
};

if (require.main === module) {
  const { source, text, write } = parseCli(process.argv.slice(2));
  const packet = buildSignalPacket({ source, text });
  if (write) appendSignalPacket(packet);
  process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
}
