const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  appendReceipt,
  buildReceiptRecall,
  buildReceiptRecord,
  formatReceiptAppend,
  formatReceiptRecall,
  getLedgerPath,
  isReceiptFresh,
  parseReceiptInput,
  readLedger,
} = require("../lib/k7-receipt-ledger");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-ledger-"));

const receipt = {
  objective: "mejorar agente browser con menos tokens",
  project: "KAIZEN7",
  route: "radar",
  skill_used: "kaizen7-metaskill",
  tool: "k7 radar",
  command: "npm.cmd run k7 -- radar \"agente browser\"",
  output: "better currentness route",
  verification: "node tests/k7-cli.test.js",
  worked: true,
  reuse_next_time: "Start with k7 radar before creating a new browser adapter.",
  discard: ["Do not hardcode an old browser route without a currentness check."],
  tags: ["agent-browser", "radar", "tokens"],
};

const parsed = parseReceiptInput(JSON.stringify(receipt));
assert.equal(parsed.objective, receipt.objective);

const record = buildReceiptRecord(receipt);
assert.equal(record.schema, "kaizen7.receipt_record.v1");
assert.equal(record.objective, receipt.objective);
assert.equal(record.metaskill_used, "kaizen7-metaskill");
assert.deepEqual(record.discard, receipt.discard);
assert.equal(isReceiptFresh(record, "2026-07-18T00:00:00.000Z"), true);

const expiring = buildReceiptRecord({
  ...receipt,
  id: "fresh-route",
  verified_at: "2026-07-18T00:00:00.000Z",
  expires_at: "2026-08-18T00:00:00.000Z",
});
assert.equal(expiring.expires_at, "2026-08-18T00:00:00.000Z");

const freshnessRoot = fs.mkdtempSync(path.join(os.tmpdir(), "k7-ledger-freshness-"));
appendReceipt({
  ...receipt,
  id: "stale-route",
  objective: "elegir agente browser actual",
  reuse_next_time: "Use the old browser route.",
  expires_at: "2026-07-01T00:00:00.000Z",
}, { root: freshnessRoot });

const freshness = buildReceiptRecall("agente browser actual", {
  root: freshnessRoot,
  now: "2026-07-18T00:00:00.000Z",
});
assert.equal(freshness.stale_matches.length, 1);
assert(!freshness.reuse_candidates.includes("Use the old browser route."));
assert(freshness.refresh_reasons.some((reason) => reason.includes("expired")));

const append = appendReceipt(receipt, { root });
assert.equal(append.schema, "kaizen7.receipt_append.v1");
assert.equal(append.status, "stored");
assert(fs.existsSync(getLedgerPath(root)));

const records = readLedger({ root });
assert.equal(records.length, 1);
assert.equal(records[0].route, "radar");

const recall = buildReceiptRecall("agente browser tokens radar", { root });
assert.equal(recall.schema, "kaizen7.receipt_recall.v1");
assert.equal(recall.total_receipts, 1);
assert.equal(recall.matches.length, 1);
assert(recall.reuse_candidates[0].includes("k7 radar"));
assert(recall.discard_warnings[0].includes("old browser route"));

const emptyRecall = buildReceiptRecall("video render", { root });
assert.equal(emptyRecall.matches.length, 0);
assert(emptyRecall.next_command.includes("No matching local receipt"));

assert(formatReceiptAppend(append).includes("# KAIZEN7 RECEIPT STORED"));
assert(formatReceiptRecall(recall).includes("# KAIZEN7 RECEIPT RECALL"));
assert.throws(() => parseReceiptInput("{bad-json"), /Invalid receipt JSON/);

console.log("k7 receipt ledger tests passed");
