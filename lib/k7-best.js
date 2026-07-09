const { buildAgentBrowser } = require("./agent-browser");
const { buildK7Status } = require("./k7-status");
const { buildNowCard } = require("./k7-now");
const { buildSmokeReport } = require("./k7-smoke");
const { buildTheFocuxOsStatus } = require("./thefocux-os-status");

function unique(items = []) {
  return [...new Set(items.filter(Boolean))];
}

function classifyWarnings(warnings = []) {
  return {
    env: warnings.filter((warning) => warning.startsWith("env:")),
    repo: warnings.filter((warning) => warning.startsWith("working_tree")),
    product_split: warnings.filter((warning) => warning.startsWith("product_split:")),
    project: warnings.filter((warning) => warning.startsWith("the_focux:")),
    other: warnings.filter((warning) => !/^env:|^working_tree|^product_split:|^the_focux:/.test(warning)),
  };
}

function projectRiskGuardrails(risks = []) {
  const guardedPatterns = [
    /claims/i,
    /credential/i,
    /ecommerce/i,
    /medical/i,
    /publish/i,
    /external_source/i,
  ];

  return risks.filter((risk) => guardedPatterns.some((pattern) => pattern.test(risk)));
}

function buildOperatingDecision(report) {
  const blockers = report.repo.blockers || [];
  const projectGuardrails = projectRiskGuardrails(report.the_focux_os.risks || []);

  if (report.status !== "pass" || blockers.length > 0) {
    return {
      decision: "blocked",
      reason: "Core health check failed or production readiness has blockers.",
      allowed_scope: "fix_health_or_readiness_only",
      blocked_by: blockers,
      guardrails: projectGuardrails,
    };
  }

  if (projectGuardrails.length > 0 && report.next_mission.lane !== "KAIZEN7 Execution Quality") {
    return {
      decision: "review_first",
      reason: "Project-facing work touches claims, publishing, credentials, ecommerce, medical or evidence risks.",
      allowed_scope: "review_contracts_and_handoffs_only",
      blocked_by: [],
      guardrails: projectGuardrails,
    };
  }

  if (projectGuardrails.length > 0) {
    return {
      decision: "execute_with_guardrails",
      reason: "KAIZEN7 kernel work can continue; project-facing risks must stay behind review gates.",
      allowed_scope: "kaizen7_kernel_routes_receipts_memory_and_verification",
      blocked_by: [],
      guardrails: projectGuardrails,
    };
  }

  return {
    decision: "execute",
    reason: "Core checks pass and no project guardrail is active.",
    allowed_scope: "focused_mission_brief_execution",
    blocked_by: [],
    guardrails: [],
  };
}

function buildActionPlan(report) {
  if (report.operating_decision?.decision === "blocked" || report.status !== "pass") {
    return [
      "Fix k7:smoke failure before execution.",
      "Run npm.cmd run k7:smoke again.",
      "Only then continue to k7:now.",
    ];
  }

  const actions = [
    "Run npm.cmd run k7:now.",
    "Use the returned Mission Brief instead of loading broad repo context.",
    "Execute one focused change.",
    "Run npm.cmd run k7:check.",
    "Close with Mission Outcome Receipt and memory recommendation.",
  ];

  if (report.operating_decision?.guardrails?.length) {
    actions.unshift("Keep project-facing claims, ecommerce, credentials and publishing behind review gates.");
  }

  return actions;
}

function buildAgentHandoff(report) {
  const decision = report.operating_decision;
  const blocked = decision.decision === "blocked";
  const closeWith = [
    "summary",
    "changed_files",
    "tests",
    "risks",
    "reuse_next_time",
    "memory_update_recommendation",
  ];

  return {
    goal: report.next_mission.goal,
    lane: report.next_mission.lane,
    decision: decision.decision,
    allowed_scope: decision.allowed_scope,
    read_first: report.next_mission.files_to_read,
    command_sequence: blocked
      ? ["npm.cmd run k7:smoke", "npm.cmd run k7:ready"]
      : ["npm.cmd run k7:now", "npm.cmd run k7:check"],
    stop_if: [
      "credentials_required",
      "external_publish_required",
      "ecommerce_or_claims_change_required",
      "destructive_delete_required",
      "mission_scope_expands_beyond_allowed_scope",
      "acceptance_tests_cannot_run",
    ],
    close_with: closeWith,
    receipt_template: Object.fromEntries(closeWith.map((key) => [key, ""])),
  };
}

function buildBestReport(root = process.cwd()) {
  const smoke = buildSmokeReport(root);
  const k7 = buildK7Status(root);
  const browser = buildAgentBrowser(root);
  const now = buildNowCard();
  const focux = buildTheFocuxOsStatus(root);

  const bestAssets = [
    {
      name: "KAIZEN7 Metaskill",
      path: ".agents/skills/kaizen7-metaskill/SKILL.md",
      value: "Turns broad objectives into minimal context, route, executor, receipt and memory.",
    },
    {
      name: "CLI-Anything Operator",
      path: ".agents/skills/cli-anything-operator/SKILL.md",
      value: "Turns missing external software execution into a controlled adapter route without growing the kernel.",
    },
    {
      name: "One Command Entry",
      path: "docs/KAIZEN7_ONE_COMMAND.md",
      value: "Gives agents the fastest safe start before touching files.",
    },
    {
      name: "Mission Control",
      command: "npm.cmd run k7:jarvis -- \"<objective>\"",
      value: "Applies growth gate, route resolver, Mission Brief and receipt template.",
    },
    {
      name: "THE FOCUX OS Status",
      command: "npm.cmd run thefocux:status",
      value: "Shows ECC foundation, dossier state, claims risk, public bundle and next action.",
    },
    {
      name: "KAIZEN7 Smoke",
      command: "npm.cmd run k7:smoke",
      value: "Compact readiness and warning check for humans and agents.",
    },
  ];

  const warnings = unique(smoke.warnings);
  const report = {
    schema: "kaizen7.best.v1",
    generated_at: new Date().toISOString(),
    status: smoke.status,
    principle: "Less steps. Less tokens. Better route. Reusable learning.",
    identity: "KAIZEN7 best current operating view",
    repo: {
      branch: k7.git.working_tree.branch,
      changed_files: k7.git.working_tree.changed_files,
      untracked_files: k7.git.working_tree.untracked_files,
      readiness: k7.readiness.status,
      checks: k7.readiness.checks,
      blockers: k7.readiness.blockers,
    },
    best_assets: bestAssets,
    best_commands: [
      "npm.cmd run k7:best",
      "npm.cmd run k7:smoke",
      "npm.cmd run k7:now",
      "npm.cmd run k7:jarvis -- \"<objective>\"",
      "npm.cmd run k7:check",
    ],
    best_route_now: [
      "k7:best",
      "k7:smoke",
      "k7:now",
      "Mission Brief",
      "focused execution",
      "k7:check",
      "Mission Outcome Receipt",
      "memory recommendation",
    ],
    next_mission: {
      goal: now.mission.goal,
      lane: now.growth_gate.lane,
      output: now.growth_gate.output,
      route: now.route,
      next_action: now.next_action,
      files_to_read: now.files_to_read,
    },
    the_focux_os: {
      phase: focux.phase,
      foundation: focux.foundation?.name || focux.foundation?.id || "unknown",
      next_action: focux.next_action,
      public_bundle: focux.public_bundle.status,
      risks: focux.risks,
    },
    agent_browser: {
      docs: browser.counts.docs,
      tests: browser.counts.tests,
      routes: browser.counts.routes,
      skills: browser.counts.skills,
      scripts: browser.counts.scripts,
      canonical_files: browser.canonical_files,
    },
    warnings,
    warning_groups: classifyWarnings(warnings),
    use_next: smoke.status === "pass" ? "npm.cmd run k7:now" : "fix_smoke_failure_before_execution",
  };

  report.operating_decision = buildOperatingDecision(report);
  report.action_plan = buildActionPlan(report);
  report.agent_handoff = buildAgentHandoff(report);
  report.top_recommendation = report.action_plan[0];
  return report;
}

function formatBestReport(report) {
  return [
    "# KAIZEN7 BEST NOW",
    "",
    report.principle,
    "",
    `Status: ${report.status}`,
    `Branch: ${report.repo.branch}`,
    `Readiness: ${report.repo.readiness} (${report.repo.checks} checks, ${report.repo.blockers.length} blockers)`,
    `Changed files: ${report.repo.changed_files}`,
    `Untracked files: ${report.repo.untracked_files}`,
    "",
    "## Decision",
    `- decision: ${report.operating_decision.decision}`,
    `- reason: ${report.operating_decision.reason}`,
    `- allowed scope: ${report.operating_decision.allowed_scope}`,
    ...(report.operating_decision.guardrails.length ? [
      "- guardrails:",
      ...report.operating_decision.guardrails.map((risk) => `  - ${risk}`),
    ] : ["- guardrails: none"]),
    "",
    "## Best Assets",
    ...report.best_assets.map((asset) => {
      const location = asset.path || asset.command;
      return `- ${asset.name}: ${location} -> ${asset.value}`;
    }),
    "",
    "## Best Commands",
    ...report.best_commands.map((command) => `- ${command}`),
    "",
    "## Best Route Now",
    report.best_route_now.join(" -> "),
    "",
    "## Action Plan",
    ...report.action_plan.map((action) => `- ${action}`),
    "",
    "## Agent Handoff",
    `- goal: ${report.agent_handoff.goal}`,
    `- decision: ${report.agent_handoff.decision}`,
    `- allowed scope: ${report.agent_handoff.allowed_scope}`,
    "- commands:",
    ...report.agent_handoff.command_sequence.map((command) => `  - ${command}`),
    "- stop if:",
    ...report.agent_handoff.stop_if.map((condition) => `  - ${condition}`),
    "- close with:",
    ...report.agent_handoff.close_with.map((item) => `  - ${item}`),
    "- receipt template:",
    ...Object.keys(report.agent_handoff.receipt_template).map((key) => `  - ${key}:`),
    "",
    "## Next Mission",
    `- goal: ${report.next_mission.goal}`,
    `- lane: ${report.next_mission.lane}`,
    `- output: ${report.next_mission.output}`,
    `- route: ${report.next_mission.route}`,
    `- next action: ${report.next_mission.next_action}`,
    "",
    "## THE FOCUX OS",
    `- phase: ${report.the_focux_os.phase}`,
    `- foundation: ${report.the_focux_os.foundation}`,
    `- public bundle: ${report.the_focux_os.public_bundle}`,
    `- next action: ${report.the_focux_os.next_action}`,
    "",
    "## Read First",
    ...report.next_mission.files_to_read.map((file) => `- ${file}`),
    "",
    "## Warnings",
    ...(report.warnings.length ? [
      ...Object.entries(report.warning_groups)
        .filter(([, warnings]) => warnings.length)
        .flatMap(([group, warnings]) => [`- ${group}:`, ...warnings.map((warning) => `  - ${warning}`)]),
    ] : ["- none"]),
    "",
    "## Use Next",
    `- ${report.use_next}`,
    "",
  ].join("\n");
}

function formatAgentHandoff(handoff) {
  return [
    "# KAIZEN7 AGENT HANDOFF",
    "",
    `Goal: ${handoff.goal}`,
    `Lane: ${handoff.lane}`,
    `Decision: ${handoff.decision}`,
    `Allowed scope: ${handoff.allowed_scope}`,
    "",
    "## Read First",
    ...handoff.read_first.map((file) => `- ${file}`),
    "",
    "## Commands",
    ...handoff.command_sequence.map((command) => `- ${command}`),
    "",
    "## Stop If",
    ...handoff.stop_if.map((condition) => `- ${condition}`),
    "",
    "## Close With",
    ...handoff.close_with.map((item) => `- ${item}`),
    "",
    "## Receipt Template",
    ...Object.keys(handoff.receipt_template).map((key) => `${key}:`),
    "",
  ].join("\n");
}

if (require.main === module) {
  const report = buildBestReport(process.cwd());
  const wantsJson = process.argv.includes("--json");
  const wantsHandoff = process.argv.includes("--handoff");

  if (wantsJson && wantsHandoff) process.stdout.write(`${JSON.stringify(report.agent_handoff, null, 2)}\n`);
  else if (wantsJson) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else if (wantsHandoff) process.stdout.write(`${formatAgentHandoff(report.agent_handoff)}\n`);
  else process.stdout.write(`${formatBestReport(report)}\n`);
  process.exitCode = report.status === "pass" ? 0 : 1;
}

module.exports = {
  buildBestReport,
  buildActionPlan,
  buildAgentHandoff,
  buildOperatingDecision,
  classifyWarnings,
  formatAgentHandoff,
  formatBestReport,
  projectRiskGuardrails,
};
