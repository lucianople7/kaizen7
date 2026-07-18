const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const cases = require("../data/preflight-eval-cases.json");
const { appendReceipt } = require("../lib/k7-receipt-ledger");
const {
  buildPreflight,
  evaluateRecommendationFit,
  formatPreflight,
} = require("../lib/k7-preflight");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-preflight-"));
for (const item of cases.cases) {
  const card = buildPreflight(item.objective, {
    root,
    now: "2026-07-18T00:00:00.000Z",
    budget: 300,
  });
  assert.equal(card.route, item.expected_route, item.id);
  assert.equal(card.research_needed, item.research_needed, item.id);
  assert.equal(card.approval_needed, item.approval_needed, item.id);
  assert(card.estimated_tokens <= 300, item.id);
}

appendReceipt({
  objective: "elegir plantilla de vídeo vertical",
  route: "flowmatik.template_selection",
  verification: "10 renders passed",
  reuse_next_time: "Reuse template urban-gold-v1.",
  expires_at: "2026-08-18T00:00:00.000Z",
}, { root });
const reused = buildPreflight("elegir plantilla de vídeo vertical", {
  root,
  now: "2026-07-18T00:00:00.000Z",
});
assert.equal(reused.route, "reuse_receipt");
assert(reused.memory_reused.includes("Reuse template urban-gold-v1."));

const mismatch = evaluateRecommendationFit(
  "decidir cuándo preguntar al usuario en un workflow",
  "prototipar BAAI/bge-m3 como modelo de embeddings",
);
assert.equal(mismatch.accepted, false);

const match = evaluateRecommendationFit(
  "crear memoria semántica con embeddings",
  "prototipar un modelo de embeddings local",
);
assert.equal(match.accepted, true);

const text = formatPreflight(reused, { budget: 300 });
assert(text.includes("Route: reuse_receipt"));
assert(text.length <= 1200);

console.log("k7 preflight tests passed");
