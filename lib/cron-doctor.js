const fs = require("node:fs");
const path = require("node:path");

const SAFE_POLICY = "propose-by-default";
const SAFE_MODE = "propose";
const KNOWN_CADENCES = new Set(["daily", "weekly", "manual"]);

function issue(code, message, cronId = "") {
  return { code, message, cronId };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function reviewCronManifest(manifest) {
  const issues = [];
  const repairable = [];
  const seen = new Set();

  if (manifest.policy !== SAFE_POLICY) {
    const item = issue("unsafe_policy", `Manifest policy must be ${SAFE_POLICY}`);
    issues.push(item);
    repairable.push(item);
  }

  for (const cron of manifest.crons || []) {
    if (!cron.id) {
      issues.push(issue("missing_id", "Cron is missing id"));
      continue;
    }
    if (seen.has(cron.id)) {
      const item = issue("duplicate_id", `Duplicate cron id: ${cron.id}`, cron.id);
      issues.push(item);
      repairable.push(item);
    }
    seen.add(cron.id);

    if (cron.mode !== SAFE_MODE) {
      const item = issue("unsafe_mode", `Cron ${cron.id} must default to propose mode`, cron.id);
      issues.push(item);
      repairable.push(item);
    }
    if (!cron.description) {
      const item = issue("missing_description", `Cron ${cron.id} needs a description`, cron.id);
      issues.push(item);
      repairable.push(item);
    }
    if (!KNOWN_CADENCES.has(cron.cadence)) {
      const item = issue("unknown_cadence", `Cron ${cron.id} has unknown cadence`, cron.id);
      issues.push(item);
      repairable.push(item);
    }
  }

  return { issues, repairable };
}

function repairCronManifest(manifest) {
  const repaired = clone(manifest);
  const changes = [];
  const seen = new Set();

  if (repaired.policy !== SAFE_POLICY) {
    repaired.policy = SAFE_POLICY;
    changes.push(`Set manifest policy to ${SAFE_POLICY}`);
  }

  repaired.crons = (repaired.crons || []).filter((cron) => {
    if (seen.has(cron.id)) {
      changes.push(`Removed duplicate cron ${cron.id}`);
      return false;
    }
    seen.add(cron.id);
    return true;
  });

  for (const cron of repaired.crons) {
    if (cron.mode !== SAFE_MODE) {
      cron.mode = SAFE_MODE;
      changes.push(`Changed ${cron.id} mode to ${SAFE_MODE}`);
    }
    if (!cron.description) {
      cron.description = `Review ${cron.title || cron.id} and propose the minimum safe action.`;
      changes.push(`Added description to ${cron.id}`);
    }
    if (!KNOWN_CADENCES.has(cron.cadence)) {
      cron.cadence = "manual";
      changes.push(`Changed ${cron.id} cadence to manual`);
    }
  }

  return { manifest: repaired, changes };
}

function suggestCronFromSignal(signal) {
  const text = String(signal || "").toLowerCase();
  if (text.includes("ai index") || text.includes("assistant")) {
    return {
      id: "thefocux-ai-index",
      title: "THE FOCUX AI Index Check",
      cadence: "weekly",
      mode: SAFE_MODE,
      description: "Review THE FOCUX AI index, MCP public surface and assistant readiness.",
    };
  }
  if (text.includes("skill")) {
    return {
      id: "skill-validation",
      title: "Skill Validation Check",
      cadence: "weekly",
      mode: SAFE_MODE,
      description: "Validate local skills and propose repairs for invalid frontmatter or stale metadata.",
    };
  }
  return {
    id: "manual-review",
    title: "Manual Review",
    cadence: "manual",
    mode: SAFE_MODE,
    description: "Review repeated signal and decide whether a smart cron is justified.",
  };
}

function buildDoctorMemory(report) {
  const issues = report.review.issues.length
    ? report.review.issues.map((item) => `- ${item.code}: ${item.message}`).join("\n")
    : "- No issues.";
  const actions = report.actions.length
    ? report.actions.map((action) => `- ${action.title}`).join("\n")
    : "- No action.";
  return [
    "## Cron Doctor",
    "",
    "### Issues",
    "",
    issues,
    "",
    "### Actions",
    "",
    actions,
    "",
  ].join("\n");
}

function runCronDoctor(options = {}) {
  const manifest = options.manifest || JSON.parse(fs.readFileSync(options.manifestPath, "utf8"));
  const review = reviewCronManifest(manifest);
  const actions = [];
  let repair = null;

  if (review.repairable.length) {
    repair = repairCronManifest(manifest);
    actions.push({
      type: "repair_manifest",
      title: "Repair internal smart cron manifest guardrails",
      changes: repair.changes,
    });
  }

  if (options.signal) {
    actions.push({
      type: "suggest_cron",
      title: "Suggest new smart cron from repeated signal",
      cron: suggestCronFromSignal(options.signal),
    });
  }

  const report = { id: "cron-doctor", review, repair, actions };
  report.memory = buildDoctorMemory(report);
  return report;
}

function repairManifestFile(filePath) {
  const manifest = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const repair = repairCronManifest(manifest);
  fs.writeFileSync(filePath, `${JSON.stringify(repair.manifest, null, 2)}\n`);
  return repair;
}

if (require.main === module) {
  const manifestPath = process.argv[2] || path.join(__dirname, "..", "data", "smart-crons.json");
  const signalArg = process.argv.find((arg) => arg.startsWith("--signal="));
  const writeRepair = process.argv.includes("--write-repair");
  const report = runCronDoctor({
    manifestPath,
    signal: signalArg ? signalArg.slice("--signal=".length) : "",
  });
  if (writeRepair && report.repair) report.repair = repairManifestFile(manifestPath);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

module.exports = {
  reviewCronManifest,
  repairCronManifest,
  suggestCronFromSignal,
  runCronDoctor,
  repairManifestFile,
};
