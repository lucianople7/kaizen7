const fs = require("node:fs");
const path = require("node:path");
const { buildLitePlan, formatLitePlan, runLiteCli } = require("./k7-lite-module");

function loadSignals(root) {
  const filePath = path.join(root || process.cwd(), "data", "signal-inbox.json");
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function buildEvolutionInbox(options = {}) {
  const root = options.root || process.cwd();
  const signals = options.signals || loadSignals(root);
  return {
    ...buildLitePlan("evolution-inbox", {
      ...options,
      action: "Collect incoming signals and convert the strongest ones into reviewable evolution candidates.",
      verification: ["signals_listed", "candidate_count_present"],
      risks: [],
    }),
    signals,
    candidates: signals.filter((signal) => signal?.signals?.hasNext || signal?.confidence === "high"),
  };
}

function formatEvolutionInbox(plan) {
  return [
    formatLitePlan(plan, "KAIZEN7 Evolution Inbox"),
    `Signals: ${plan.signals.length}`,
    `Candidates: ${plan.candidates.length}`,
  ].join("\n");
}

if (require.main === module) runLiteCli(buildEvolutionInbox, formatEvolutionInbox);

module.exports = { buildEvolutionInbox, formatEvolutionInbox };
