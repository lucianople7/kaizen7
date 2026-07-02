const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

function slugify(value = "context-evidence") {
  return String(value || "context-evidence")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "context-evidence";
}

function tokenize(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/g)
    .filter((token) => token.length > 2);
}

function compactText(text, maxChars = 480) {
  return String(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .slice(0, maxChars);
}

function evidenceDir(root = ROOT) {
  return path.join(root, "content_library", "context_firewall", "evidence");
}

function saveContextEvidence(label, rawOutput, options = {}) {
  const root = options.root || ROOT;
  const id = `${slugify(label)}-${Buffer.from(String(rawOutput)).toString("base64url").slice(0, 10)}`;
  const dir = evidenceDir(root);
  const file = path.join(dir, `${id}.json`);
  const payload = {
    schema: "kaizen7.context_evidence.v1",
    id,
    label,
    source: options.source || "unknown",
    created_at: new Date().toISOString(),
    bytes: Buffer.byteLength(String(rawOutput), "utf8"),
    summary: compactText(rawOutput),
    tokens: tokenize(`${label} ${rawOutput}`),
    raw: String(rawOutput),
  };
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return {
    schema: "kaizen7.context_evidence_ref.v1",
    kind: "context_evidence",
    id,
    label,
    source: payload.source,
    file,
    bytes: payload.bytes,
    summary: payload.summary,
  };
}

function buildContextCapsule(label, rawOutput, options = {}) {
  const ref = saveContextEvidence(label, rawOutput, options);
  return {
    schema: "kaizen7.context_capsule.v1",
    version: 1,
    mode: "reference_not_raw_dump",
    ref,
    prompt_payload: [
      `Evidence saved: ${ref.id}`,
      `Source: ${ref.source}`,
      `Bytes: ${ref.bytes}`,
      `Summary: ${ref.summary}`,
      `Retrieve with: k7 context search ${ref.id}`,
    ].join("\n"),
  };
}

function readEvidenceFiles(root = ROOT) {
  const dir = evidenceDir(root);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => {
      const file = path.join(dir, name);
      return { file, payload: JSON.parse(fs.readFileSync(file, "utf8")) };
    });
}

function scoreEvidence(queryTokens, payload) {
  const tokenSet = new Set(payload.tokens || []);
  let score = 0;
  for (const token of queryTokens) {
    if (tokenSet.has(token)) score += 10;
    for (const candidate of tokenSet) {
      if (candidate.includes(token) || token.includes(candidate)) score += 1;
    }
  }
  return score;
}

function searchContextEvidence(query, options = {}) {
  const root = options.root || ROOT;
  const queryTokens = tokenize(query);
  return readEvidenceFiles(root)
    .map(({ file, payload }) => ({
      id: payload.id,
      label: payload.label,
      file,
      score: scoreEvidence(queryTokens, payload),
      summary: payload.summary,
      bytes: payload.bytes,
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, options.limit || 5);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || "help";
  if (command === "save") {
    const label = args[1] || "context evidence";
    const raw = args.slice(2).join(" ");
    process.stdout.write(`${JSON.stringify(buildContextCapsule(label, raw), null, 2)}\n`);
  } else if (command === "search") {
    process.stdout.write(`${JSON.stringify(searchContextEvidence(args.slice(1).join(" ")), null, 2)}\n`);
  } else {
    process.stdout.write("Usage: node lib/context-firewall.js save <label> <raw> | search <query>\n");
  }
}

module.exports = {
  buildContextCapsule,
  saveContextEvidence,
  searchContextEvidence,
};
