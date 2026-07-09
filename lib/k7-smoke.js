const { buildK7Status } = require("./k7-status");
const { buildNowCard } = require("./k7-now");
const { buildMissionControl } = require("./mission-control");
const { buildTheFocuxOsStatus } = require("./thefocux-os-status");

function assertCheck(condition, label, detail = "") {
  return {
    ok: Boolean(condition),
    label,
    detail,
  };
}

function buildSmokeReport(root = process.cwd()) {
  const k7 = buildK7Status(root);
  const focux = buildTheFocuxOsStatus(root);
  const now = buildNowCard();
  const missionControl = buildMissionControl({
    goal: "renderizar video con menos pasos",
    project: "Flowmatik",
    expected_output: ["video route"],
  });

  const checks = [
    assertCheck(k7.schema === "kaizen7.status.v1", "k7:status schema", k7.schema),
    assertCheck(k7.readiness.status === "ready", "k7 readiness", k7.readiness.status),
    assertCheck(focux.schema === "the_focux.os_status.v1", "thefocux:status schema", focux.schema),
    assertCheck(Boolean(focux.foundation), "THE FOCUX OS foundation", focux.foundation?.id || focux.foundation?.name),
    assertCheck(now.schema === "kaizen7.now_card.v1", "k7:now schema", now.schema),
    assertCheck(Array.isArray(now.files_to_read) && now.files_to_read.length > 0, "k7:now read list", String(now.files_to_read.length)),
    assertCheck(missionControl.schema === "kaizen7.mission_control.v1", "k7:jarvis schema", missionControl.schema),
    assertCheck(missionControl.next_action === "hand_mission_brief_to_agent", "mission growth gate", missionControl.next_action),
  ];

  return {
    schema: "kaizen7.smoke.v1",
    generated_at: new Date().toISOString(),
    status: checks.every((check) => check.ok) ? "pass" : "fail",
    checks,
    warnings: [
      ...k7.readiness.warnings,
      ...(k7.git.working_tree.clean ? [] : [`working_tree_dirty:${k7.git.working_tree.changed_files}`]),
      ...k7.git.product_split.risks.map((risk) => `product_split:${risk}`),
      ...k7.git.product_split.extraction_deletion_warnings.map((warning) => `product_split:${warning}`),
      ...focux.risks.map((risk) => `the_focux:${risk}`),
    ],
    summary: {
      branch: k7.git.working_tree.branch,
      changed_files: k7.git.working_tree.changed_files,
      untracked_files: k7.git.working_tree.untracked_files,
      k7_readiness: k7.readiness.status,
      the_focux_phase: focux.phase,
      next_mission: now.mission.goal,
      route_sample: missionControl.mission_brief.route || missionControl.mission_brief.capability,
      next_command: "npm.cmd run k7:now",
    },
  };
}

function formatSmokeReport(report) {
  return [
    "# KAIZEN7 SMOKE",
    "",
    `Status: ${report.status}`,
    `Branch: ${report.summary.branch}`,
    `Changed files: ${report.summary.changed_files}`,
    `Untracked files: ${report.summary.untracked_files}`,
    `K7 readiness: ${report.summary.k7_readiness}`,
    `THE FOCUX phase: ${report.summary.the_focux_phase}`,
    `Next mission: ${report.summary.next_mission}`,
    `Route sample: ${report.summary.route_sample}`,
    `Next command: ${report.summary.next_command}`,
    "",
    "## Checks",
    ...report.checks.map((check) => `- ${check.ok ? "PASS" : "FAIL"} ${check.label}${check.detail ? ` (${check.detail})` : ""}`),
    "",
    "## Warnings",
    ...(report.warnings.length ? report.warnings.map((warning) => `- ${warning}`) : ["- none"]),
    "",
  ].join("\n");
}

if (require.main === module) {
  const report = buildSmokeReport(process.cwd());
  if (process.argv.includes("--json")) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else process.stdout.write(`${formatSmokeReport(report)}\n`);
  process.exitCode = report.status === "pass" ? 0 : 1;
}

module.exports = {
  buildSmokeReport,
  formatSmokeReport,
};
