const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  appendMetaskillOutcome,
  buildLedgerSummary,
  loadMetaskillLedger,
  rankMetaskills,
} = require("../lib/metaskill-ledger");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-metaskill-ledger-"));
const ledgerPath = path.join(root, "data", "metaskill-ledger.json");

const empty = loadMetaskillLedger(ledgerPath);
assert.equal(empty.version, 1);
assert.deepEqual(empty.outcomes, []);
assert(fs.existsSync(ledgerPath), "ledger file should be created on first load");

appendMetaskillOutcome({
  root,
  date: "2026-06-28",
  goal: "fix failing connector tests",
  objectiveType: "bugfix",
  activated: ["systematic-debugging", "verification-before-completion"],
  fitnessScore: 0.91,
  signals: ["tests_passed", "no_rework"],
});
appendMetaskillOutcome({
  root,
  date: "2026-06-28",
  goal: "fix flaky runner",
  objectiveType: "bugfix",
  activated: ["test-driven-development", "verification-before-completion"],
  fitnessScore: 0.67,
  signals: ["tests_passed"],
});
appendMetaskillOutcome({
  root,
  date: "2026-06-28",
  goal: "implement feature",
  objectiveType: "implementation",
  activated: ["test-driven-development", "verification-before-completion"],
  fitnessScore: 0.86,
  signals: ["tests_passed", "context_reused"],
});

const loaded = loadMetaskillLedger(ledgerPath);
assert.equal(loaded.outcomes.length, 3);

const summary = buildLedgerSummary(loaded);
assert.equal(summary.totalOutcomes, 3);
assert.equal(summary.byObjectiveType.bugfix.sampleSize, 2);
assert(summary.byObjectiveType.bugfix.bestMetaskills[0].averageFitness >= summary.byObjectiveType.bugfix.bestMetaskills[1].averageFitness);
assert.equal(summary.byObjectiveType.implementation.bestMetaskills[0].skill, "test-driven-development");

const bugfixRank = rankMetaskills(loaded, {
  objectiveType: "bugfix",
  candidates: ["test-driven-development", "systematic-debugging", "verification-before-completion"],
});

assert.equal(bugfixRank[0].skill, "systematic-debugging");
assert.equal(bugfixRank[0].sampleSize, 1);
assert(bugfixRank[0].averageFitness > bugfixRank[1].averageFitness);

console.log("metaskill ledger tests passed");
