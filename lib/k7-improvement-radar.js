function buildImprovementRadar(objective = "", options = {}) {
  const goal = String(objective || "").trim() || "find a better current route before locking the next execution path";
  const safeGoal = shellSafeText(goal);

  return {
    schema: "kaizen7.improvement_radar.v1",
    objective: goal,
    identity: "KAIZEN7 improvement radar",
    doctrine: "Do not freeze around today's tools. Re-check the market, keep proof, and adapt only when the route is better.",
    currentness_required: true,
    reminder_rule: "Before promoting, repeating or hardening any route, ask what exists today that makes this simpler, safer or more verifiable.",
    scan_triggers: [
      "starting a new project route",
      "reusing a receipt older than the local freshness window",
      "an API, CLI, MCP or app flow fails",
      "a route requires too much context, too many steps or too many tokens",
      "an agent is about to build a wrapper from scratch",
      "before promoting a route into a skill or metaskill",
    ],
    scan_targets: [
      "agent browsers and repo-intelligence tools",
      "Anything CLI / CLI-Anything / cli-hub adapters",
      "official APIs, SDKs, CLIs and MCP servers",
      "browser automation frameworks",
      "desktop app control tools",
      "model and agent orchestration frameworks",
      "verification and artifact inspection tools",
      "memory, receipt and knowledge graph stores",
      "high-signal GitHub repositories and examples",
    ],
    search_protocol: [
      "Check local receipts first so proven routes are not discarded by hype.",
      "Search current official docs for selected APIs, CLIs, SDKs or MCPs.",
      "Search active repositories for maintained adapters or examples.",
      "Compare candidates against output fit, setup cost, verification, safety and maintenance.",
      "Adopt only when the new route reduces steps, tokens, context, risk or verification ambiguity.",
      "Record why the old route was kept, refreshed or retired.",
    ],
    candidate_scorecard: {
      must_improve_one_of: [
        "fewer steps",
        "less context",
        "lower token cost",
        "clearer verification",
        "lower setup cost",
        "better safety gates",
        "higher reuse value",
      ],
      reject_if: [
        "new but not maintained",
        "requires unapproved credentials or billing",
        "cannot produce a verifiable artifact",
        "adds platform weight without repeated value",
        "duplicates a proven route without measurable gain",
      ],
    },
    agent_prompts: [
      "What has improved since the last receipt for this route?",
      "Is there a stronger current agent browser, MCP, CLI, adapter or repo pattern for this objective?",
      "Can the current route be replaced by a smaller official interface?",
      "If the current route still wins, what proof justifies keeping it?",
      "What should be refreshed, promoted, retired or watched next?",
    ],
    output_contract: {
      selected_action: "keep | refresh | replace | retire | watch",
      old_route: "",
      candidate_route: "",
      evidence_checked: [],
      reason: "",
      verification: "",
      memory_update_recommendation: "",
    },
    next_commands: [
      `npm.cmd run k7 -- radar "${safeGoal}" --json`,
      `npm.cmd run k7 -- adapt "${safeGoal}"`,
      `npm.cmd run k7 -- mesh "${safeGoal}"`,
    ],
  };
}

function formatImprovementRadar(radar = buildImprovementRadar()) {
  return [
    "# KAIZEN7 IMPROVEMENT RADAR",
    "",
    `Objective: ${radar.objective}`,
    `Doctrine: ${radar.doctrine}`,
    `Reminder: ${radar.reminder_rule}`,
    "",
    "## Scan Triggers",
    ...radar.scan_triggers.map((item) => `- ${item}`),
    "",
    "## Scan Targets",
    ...radar.scan_targets.map((item) => `- ${item}`),
    "",
    "## Search Protocol",
    ...radar.search_protocol.map((item) => `- ${item}`),
    "",
    "## Candidate Scorecard",
    `Must improve one of: ${radar.candidate_scorecard.must_improve_one_of.join(", ")}`,
    "Reject if:",
    ...radar.candidate_scorecard.reject_if.map((item) => `- ${item}`),
    "",
    "## Agent Prompts",
    ...radar.agent_prompts.map((item) => `- ${item}`),
    "",
    "## Output Contract",
    ...Object.keys(radar.output_contract).map((key) => `${key}:`),
    "",
    "## Next Commands",
    ...radar.next_commands.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

function shellSafeText(value = "") {
  return String(value).replace(/"/g, "'").trim();
}

module.exports = {
  buildImprovementRadar,
  formatImprovementRadar,
};
