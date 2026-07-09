const fs = require("node:fs");
const path = require("node:path");

const LEDGER_RELATIVE_PATH = path.join("data", "receipts", "ledger.jsonl");

function getLedgerPath(root = process.cwd()) {
  return path.join(root, LEDGER_RELATIVE_PATH);
}

function stableId(record = {}) {
  const source = [
    record.objective,
    record.route,
    record.tool,
    record.verification,
    record.reuse_next_time,
  ].filter(Boolean).join("|");
  let hash = 0;
  for (const char of source || "kaizen7-receipt") {
    hash = ((hash << 5) - hash + char.charCodeAt(0)) >>> 0;
  }
  return `k7r_${hash.toString(16).padStart(8, "0")}`;
}

function asArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  return [String(value)];
}

function parseReceiptInput(value) {
  if (typeof value === "object" && value !== null) return value;
  if (!String(value || "").trim()) {
    throw new Error("k7 remember needs a receipt JSON object.");
  }
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Receipt JSON must be an object.");
    }
    return parsed;
  } catch (error) {
    throw new Error(`Invalid receipt JSON: ${error.message}`);
  }
}

function buildReceiptRecord(input = {}) {
  const record = parseReceiptInput(input);
  const normalized = {
    schema: "kaizen7.receipt_record.v1",
    id: record.id || stableId(record),
    recorded_at: record.recorded_at || new Date().toISOString(),
    objective: String(record.objective || record.goal || "unspecified objective"),
    project: String(record.project || "KAIZEN7"),
    route: String(record.route || "unknown"),
    skill_used: String(record.skill_used || record.skill || ""),
    metaskill_used: String(record.metaskill_used || "kaizen7-metaskill"),
    tool: String(record.tool || record.executor || ""),
    command: String(record.command || ""),
    output: String(record.output || ""),
    verification: String(record.verification || ""),
    worked: record.worked !== false,
    reuse_next_time: String(record.reuse_next_time || ""),
    discard: asArray(record.discard || record.discard_if),
    tags: asArray(record.tags),
    memory_update_recommendation: String(record.memory_update_recommendation || record.memory_update || ""),
  };
  return normalized;
}

function appendReceipt(input = {}, options = {}) {
  const root = options.root || process.cwd();
  const record = buildReceiptRecord(input);
  const ledger = getLedgerPath(root);
  fs.mkdirSync(path.dirname(ledger), { recursive: true });
  fs.appendFileSync(ledger, `${JSON.stringify(record)}\n`, "utf8");
  return {
    schema: "kaizen7.receipt_append.v1",
    status: "stored",
    ledger_path: LEDGER_RELATIVE_PATH.replaceAll("\\", "/"),
    record,
    next_command: `npm.cmd run k7 -- recall "${record.objective}"`,
  };
}

function readLedger(options = {}) {
  const root = options.root || process.cwd();
  const ledger = getLedgerPath(root);
  if (!fs.existsSync(ledger)) return [];
  return fs.readFileSync(ledger, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return {
          schema: "kaizen7.receipt_record.v1",
          id: "corrupt-line",
          objective: "unreadable receipt",
          route: "discard",
          worked: false,
          discard: ["corrupt receipt line"],
        };
      }
    });
}

function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);
}

function receiptHaystack(record = {}) {
  return [
    record.objective,
    record.project,
    record.route,
    record.skill_used,
    record.metaskill_used,
    record.tool,
    record.command,
    record.output,
    record.verification,
    record.reuse_next_time,
    ...(record.tags || []),
    ...(record.discard || []),
  ].join(" ").toLowerCase();
}

function scoreReceipt(record = {}, terms = []) {
  const haystack = receiptHaystack(record);
  const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
  return record.worked === false ? score - 0.5 : score;
}

function buildReceiptRecall(objective = "", options = {}) {
  const receipts = readLedger(options);
  const terms = tokenize(objective);
  const scored = receipts
    .map((record) => ({ record, score: terms.length ? scoreReceipt(record, terms) : 1 }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, options.limit || 5);
  const matches = scored.map((entry) => entry.record);
  return {
    schema: "kaizen7.receipt_recall.v1",
    objective: objective || "unspecified objective",
    ledger_path: LEDGER_RELATIVE_PATH.replaceAll("\\", "/"),
    total_receipts: receipts.length,
    matches,
    reuse_candidates: matches.map((record) => record.reuse_next_time).filter(Boolean),
    discard_warnings: matches.flatMap((record) => record.discard || []),
    next_command: matches.length
      ? "Use the highest-scoring receipt before opening broad context."
      : "No matching local receipt yet. After verification, run k7 remember with a compact receipt.",
  };
}

function formatReceiptAppend(packet = {}) {
  const record = packet.record || {};
  return [
    "# KAIZEN7 RECEIPT STORED",
    "",
    `Status: ${packet.status || "stored"}`,
    `Ledger: ${packet.ledger_path || LEDGER_RELATIVE_PATH.replaceAll("\\", "/")}`,
    `Objective: ${record.objective || ""}`,
    `Route: ${record.route || ""}`,
    `Tool: ${record.tool || ""}`,
    `Verification: ${record.verification || ""}`,
    "",
    "## Reuse Next Time",
    record.reuse_next_time ? `- ${record.reuse_next_time}` : "- No reuse rule provided.",
    "",
    "## Discard",
    ...(record.discard || []).map((item) => `- ${item}`),
    ...(record.discard || []).length ? [] : ["- No discard rule provided."],
    "",
    "## Next",
    `- ${packet.next_command || ""}`,
    "",
  ].join("\n");
}

function formatReceiptRecall(recall = {}) {
  return [
    "# KAIZEN7 RECEIPT RECALL",
    "",
    `Objective: ${recall.objective || ""}`,
    `Ledger: ${recall.ledger_path || LEDGER_RELATIVE_PATH.replaceAll("\\", "/")}`,
    `Total receipts: ${recall.total_receipts || 0}`,
    `Matches: ${(recall.matches || []).length}`,
    "",
    "## Reuse Candidates",
    ...(recall.reuse_candidates || []).map((item) => `- ${item}`),
    ...(recall.reuse_candidates || []).length ? [] : ["- No reusable receipt found."],
    "",
    "## Discard Warnings",
    ...(recall.discard_warnings || []).map((item) => `- ${item}`),
    ...(recall.discard_warnings || []).length ? [] : ["- No discard warning found."],
    "",
    "## Next",
    `- ${recall.next_command || ""}`,
    "",
  ].join("\n");
}

module.exports = {
  LEDGER_RELATIVE_PATH,
  appendReceipt,
  buildReceiptRecall,
  buildReceiptRecord,
  formatReceiptAppend,
  formatReceiptRecall,
  getLedgerPath,
  parseReceiptInput,
  readLedger,
};
