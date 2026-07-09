const { buildAnythingRoute, inferOutputType } = require("./k7-anything-next");

function buildMetaskillCard(objective = "", options = {}) {
  const goal = String(objective || "").trim() || "improve this project with fewer steps";
  const safeGoal = shellSafeText(goal);
  const anythingRoute = buildAnythingRoute(goal, options);

  return {
    schema: "kaizen7.metaskill_card.v1",
    objective: goal,
    identity: "KAIZEN7 metaskill execution card",
    doctrine: "Less steps. Less tokens. Better route. Real memory.",
    output_type: inferOutputType(goal),
    primary_route: classifyRoute(goal),
    agent_agnostic: true,
    context_budget: {
      max_files_first_pass: 7,
      max_memory_items: 5,
      stop_loading_when: "route, executor, acceptance checks and safety gates are clear",
      required_first_reads: [
        "AGENTS.md",
        "KAIZEN7_CONTEXT.md",
        ".agents/skills/kaizen7-metaskill/SKILL.md",
      ],
      read_only_if_needed: [
        ".agents/skills/cli-anything-operator/SKILL.md",
        "docs/KAIZEN7_TOOL.md",
        "previous Mission Outcome Receipts",
        "project-local AGENTS.md or README",
      ],
    },
    memory_loop: {
      recall: [
        "known working skill or route",
        "previous receipt for the same tool, app, repo or output type",
        "discarded tools and failure modes",
      ],
      write_back: [
        "command that worked",
        "inputs and outputs",
        "verification result",
        "reuse rule",
        "discard rule",
      ],
      do_not_store: [
        "conversation noise",
        "unverified guesses",
        "temporary paths without reuse value",
      ],
    },
    tool_ladder: [
      {
        rank: 1,
        route: "existing_skill_or_receipt",
        use_when: "KAIZEN7 already has a proven route.",
      },
      {
        rank: 2,
        route: "official_api_cli_or_mcp",
        use_when: "The service exposes a stable interface and credentials are already approved.",
      },
      {
        rank: 3,
        route: "local_script_or_browser_automation",
        use_when: "The task can be done with a small repeatable script, Playwright, FFmpeg or Remotion.",
      },
      {
        rank: 4,
        route: "anything_cli_or_cli_hub",
        use_when: "The app or tool has no clean API, MCP or stable CLI.",
      },
      {
        rank: 5,
        route: "adapter_forge",
        use_when: "No tool exists and a tiny wrapper can create one reusable command.",
      },
    ],
    api_escape_route: {
      use_when: [
        "API is missing, blocked, unstable, too expensive or requires unapproved credentials",
        "the useful workflow exists only in a desktop app, browser app or local tool",
      ],
      allowed_paths: [
        "official export/import",
        "existing local CLI",
        "browser automation with explicit selectors",
        "Anything CLI / cli-hub adapter",
        "small wrapper with dry-run and receipt",
      ],
      blocked_without_approval: [
        "credentials",
        "paid services",
        "publishing",
        "destructive writes",
        "broad filesystem access",
      ],
    },
    execution_plan: [
      {
        id: "compress",
        action: "Restate the output, route, constraints and stop condition in one compact card.",
        proof: "metaskill card exists",
      },
      {
        id: "recall",
        action: "Check only the smallest relevant memory, receipt or skill before reading more.",
        proof: "reused or rejected memory named",
      },
      {
        id: "route",
        action: "Create the mission route and Anything CLI route.",
        commands: [
          `npm.cmd run k7 -- mission "${safeGoal}"`,
          `npm.cmd run k7 -- anything "${safeGoal}"`,
        ],
        proof: "route contains executor, gates and acceptance checks",
      },
      {
        id: "execute",
        action: "Use the highest ranked available tool from the ladder, starting read-only or dry-run.",
        proof: "command, exit code and output artifact",
      },
      {
        id: "verify",
        action: "Run focused verification and the KAIZEN7 check surface.",
        commands: ["npm.cmd run k7 -- check", "npm.cmd run k7:check"],
        proof: "passing checks or explicit blocker",
      },
      {
        id: "learn",
        action: "Write a receipt that teaches the next run what to reuse and what to discard.",
        command: "npm.cmd run k7 -- receipt",
        proof: "receipt fields completed",
      },
    ],
    anything_route: {
      schema: anythingRoute.schema,
      route: anythingRoute.route,
      output_type: anythingRoute.output_type,
      next_command: anythingRoute.next_command,
      safety_gates: anythingRoute.safety_gates,
    },
    success_metrics: [
      "same or better outcome with fewer steps",
      "less context loaded before execution",
      "fewer repeated tool decisions",
      "one reusable command or route",
      "receipt improves the next run",
    ],
    receipt_template: {
      objective: goal,
      route: "",
      memory_reused: [],
      tools_checked: [],
      executor: "",
      command: "",
      verification: "",
      reuse_next_time: "",
      discard: [],
      memory_update_recommendation: "",
    },
    next_command: options.json
      ? `npm.cmd run k7 -- solve "${safeGoal}" --json`
      : `npm.cmd run k7 -- solve "${safeGoal}"`,
  };
}

function classifyRoute(objective = "") {
  const text = String(objective).toLowerCase();
  if (/\b(api|endpoint|oauth|credential|credencial|connect|conectar|app|desktop)\b/.test(text)) {
    return "api_escape_to_tool_route";
  }
  if (/(token|pasos|context|contexto|memoria|memory|recuerdo|recuerdos|eficaz|efficien)/.test(text)) {
    return "context_memory_compression_route";
  }
  if (/(cli|anything|tool|herramienta|adapter|adaptador)/.test(text)) {
    return "anything_cli_operator_route";
  }
  return "metaskill_project_improvement_route";
}

function shellSafeText(value = "") {
  return String(value).replace(/"/g, "'").trim();
}

function formatMetaskillCard(card = buildMetaskillCard()) {
  return [
    "# KAIZEN7 METASKILL CARD",
    "",
    `Objective: ${card.objective}`,
    `Primary route: ${card.primary_route}`,
    `Output type: ${card.output_type}`,
    `Doctrine: ${card.doctrine}`,
    "",
    "## Context Budget",
    `- First-pass files: ${card.context_budget.max_files_first_pass}`,
    `- Memory items: ${card.context_budget.max_memory_items}`,
    `- Stop loading when: ${card.context_budget.stop_loading_when}`,
    "",
    "## Read First",
    ...card.context_budget.required_first_reads.map((item) => `- ${item}`),
    "",
    "## Tool Ladder",
    ...card.tool_ladder.map((item) => `- ${item.rank}. ${item.route}: ${item.use_when}`),
    "",
    "## API Escape Route",
    ...card.api_escape_route.allowed_paths.map((item) => `- ${item}`),
    "",
    "## Execution Plan",
    ...card.execution_plan.map((step) => {
      const commands = step.commands?.length ? ` Commands: ${step.commands.join(" ; ")}.` : "";
      const command = step.command ? ` Command: ${step.command}.` : "";
      return `- ${step.id}: ${step.action}${commands}${command} Proof: ${step.proof}.`;
    }),
    "",
    "## Learn",
    ...card.memory_loop.write_back.map((item) => `- ${item}`),
    "",
    "## Success Metrics",
    ...card.success_metrics.map((item) => `- ${item}`),
    "",
    "## Receipt Template",
    ...Object.keys(card.receipt_template).map((key) => `${key}:`),
    "",
    "## Next",
    `- ${card.next_command}`,
    "",
  ].join("\n");
}

module.exports = {
  buildMetaskillCard,
  classifyRoute,
  formatMetaskillCard,
};
