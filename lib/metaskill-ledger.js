const fs = require("node:fs");
const path = require("node:path");

function defaultLedgerPath(root = process.cwd()) {
  return path.join(root, "data", "metaskill-ledger.json");
}

function emptyLedger() {
  return {
    version: 1,
    outcomes: [],
  };
}

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeLedger(filePath, ledger) {
  ensureParent(filePath);
  fs.writeFileSync(filePath, `${JSON.stringify(ledger, null, 2)}\n`);
  return ledger;
}

function loadMetaskillLedger(filePath = defaultLedgerPath()) {
  ensureParent(filePath);
  if (!fs.existsSync(filePath)) return writeLedger(filePath, emptyLedger());
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return {
      version: 1,
      outcomes: Array.isArray(parsed.outcomes) ? parsed.outcomes : [],
    };
  } catch {
    return writeLedger(filePath, emptyLedger());
  }
}

function normalizeList(items) {
  return [...new Set((items || []).map((item) => String(item || "").trim()).filter(Boolean))];
}

function normalizeOutcome(input = {}) {
  return {
    date: String(input.date || new Date().toISOString()),
    goal: String(input.goal || "").trim(),
    objectiveType: String(input.objectiveType || "unknown").trim() || "unknown",
    activated: normalizeList(input.activated || input.metaskills),
    fitnessScore: Number.isFinite(Number(input.fitnessScore)) ? Number(Number(input.fitnessScore).toFixed(2)) : 0,
    signals: normalizeList(input.signals),
  };
}

function appendMetaskillOutcome(input = {}) {
  const filePath = input.filePath || defaultLedgerPath(input.root || process.cwd());
  const ledger = loadMetaskillLedger(filePath);
  const outcome = normalizeOutcome(input);
  ledger.outcomes.push(outcome);
  writeLedger(filePath, ledger);
  return outcome;
}

function average(values) {
  if (!values.length) return 0;
  return Number((values.reduce((total, value) => total + value, 0) / values.length).toFixed(2));
}

function statsForOutcomes(outcomes = []) {
  const bySkill = new Map();
  for (const outcome of outcomes) {
    for (const skill of outcome.activated || []) {
      if (!bySkill.has(skill)) bySkill.set(skill, []);
      bySkill.get(skill).push(Number(outcome.fitnessScore || 0));
    }
  }
  return [...bySkill.entries()]
    .map(([skill, scores]) => ({
      skill,
      averageFitness: average(scores),
      sampleSize: scores.length,
    }))
    .sort((a, b) => b.averageFitness - a.averageFitness || b.sampleSize - a.sampleSize || a.skill.localeCompare(b.skill));
}

function buildLedgerSummary(ledger = emptyLedger()) {
  const outcomes = Array.isArray(ledger.outcomes) ? ledger.outcomes : [];
  const objectiveTypes = [...new Set(outcomes.map((item) => item.objectiveType || "unknown"))].sort();
  const byObjectiveType = {};
  for (const objectiveType of objectiveTypes) {
    const scoped = outcomes.filter((item) => (item.objectiveType || "unknown") === objectiveType);
    byObjectiveType[objectiveType] = {
      sampleSize: scoped.length,
      averageFitness: average(scoped.map((item) => Number(item.fitnessScore || 0))),
      bestMetaskills: statsForOutcomes(scoped),
    };
  }
  return {
    version: 1,
    totalOutcomes: outcomes.length,
    averageFitness: average(outcomes.map((item) => Number(item.fitnessScore || 0))),
    bestMetaskills: statsForOutcomes(outcomes),
    byObjectiveType,
  };
}

function rankMetaskills(ledger = emptyLedger(), options = {}) {
  const candidates = normalizeList(options.candidates);
  const outcomes = (ledger.outcomes || []).filter((item) => (
    !options.objectiveType || item.objectiveType === options.objectiveType
  ));
  const ranked = statsForOutcomes(outcomes);
  const bySkill = new Map(ranked.map((item) => [item.skill, item]));
  return candidates.map((skill) => bySkill.get(skill) || {
    skill,
    averageFitness: 0,
    sampleSize: 0,
  }).sort((a, b) => b.averageFitness - a.averageFitness || b.sampleSize - a.sampleSize || candidates.indexOf(a.skill) - candidates.indexOf(b.skill));
}

function formatLedgerSummary(summary) {
  const lines = [
    "## KAIZEN7 Metaskill Ledger",
    "",
    `Outcomes: ${summary.totalOutcomes}`,
    `Average fitness: ${summary.averageFitness}`,
    "",
    "### Best Metaskills",
    ...(summary.bestMetaskills.length
      ? summary.bestMetaskills.map((item) => `- ${item.skill}: ${item.averageFitness} (${item.sampleSize})`)
      : ["- none"]),
    "",
  ];
  return lines.join("\n");
}

function parseArgs(argv = []) {
  const flags = new Set(argv.filter((arg) => arg.startsWith("--")));
  return {
    json: flags.has("--json"),
    summary: flags.has("--summary") || argv.length === 0,
  };
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const ledger = loadMetaskillLedger();
  const summary = buildLedgerSummary(ledger);
  if (args.json) process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  else process.stdout.write(`${formatLedgerSummary(summary)}\n`);
}

module.exports = {
  appendMetaskillOutcome,
  buildLedgerSummary,
  defaultLedgerPath,
  formatLedgerSummary,
  loadMetaskillLedger,
  rankMetaskills,
};
