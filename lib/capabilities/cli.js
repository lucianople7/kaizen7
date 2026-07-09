#!/usr/bin/env node

const { buildCapabilityQualityReport, formatCapabilityQualityReport } = require("./capability-quality");
const { buildMissionBrief, formatMissionBrief } = require("./mission-brief");
const { buildMissionOutcomeReceipt, formatMissionOutcomeReceipt } = require("./mission-outcome-receipt");
const { resolveMissionContext } = require("./resolver");

function parseArgs(argv = []) {
  const flags = new Set();
  let evidence = "";
  const fields = {};

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--evidence") evidence = argv[++index] || "";
    else if (arg === "--goal") fields.goal = argv[++index] || "";
    else if (arg === "--project") fields.project = argv[++index] || "";
    else if (arg === "--route") fields.route = argv[++index] || "";
    else if (arg === "--capability") fields.capability = argv[++index] || "";
    else if (arg.startsWith("--")) flags.add(arg);
  }

  return { flags, evidence, fields };
}

function parseEvidence(raw = "") {
  if (!raw.trim()) return {};
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Invalid --evidence JSON: ${error.message}`);
  }
}

function writeOutput(value, formatter, asJson) {
  const output = asJson ? JSON.stringify(value, null, 2) : formatter(value);
  process.stdout.write(`${output}\n`);
}

function main(argv = process.argv.slice(2)) {
  const { flags, evidence, fields } = parseArgs(argv);
  const asJson = flags.has("--json") || !flags.has("--markdown");
  const input = Object.keys(fields).length ? fields : parseEvidence(evidence);

  if (flags.has("--resolve-mission")) {
    writeOutput(resolveMissionContext(input), (value) => JSON.stringify(value, null, 2), true);
    return;
  }

  if (flags.has("--mission-brief")) {
    const brief = buildMissionBrief(input);
    writeOutput(brief, formatMissionBrief, asJson);
    return;
  }

  if (flags.has("--mission-outcome")) {
    const receipt = buildMissionOutcomeReceipt(input);
    writeOutput(receipt, formatMissionOutcomeReceipt, asJson);
    return;
  }

  if (flags.has("--quality")) {
    const report = buildCapabilityQualityReport();
    writeOutput(report, formatCapabilityQualityReport, asJson);
    return;
  }

  process.stderr.write([
    "Usage:",
    "  node lib/capabilities/cli.js --resolve-mission --evidence \"<mission-json>\"",
    "  node lib/capabilities/cli.js --mission-brief [--markdown] --evidence \"<mission-json>\"",
    "  node lib/capabilities/cli.js --mission-brief --goal \"<goal>\" --project KAIZEN7 --route mission_brief",
    "  node lib/capabilities/cli.js --mission-outcome [--markdown] --evidence \"<outcome-json>\"",
    "  node lib/capabilities/cli.js --quality [--markdown]",
    "",
  ].join("\n"));
  process.exitCode = 1;
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}

module.exports = {
  main,
  parseArgs,
  parseEvidence,
};
