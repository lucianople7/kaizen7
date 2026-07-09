const BLUEPRINT = {
  schema: "kaizen7.anything_cli_next.v1",
  identity: "Anything CLI next generation for KAIZEN7",
  north_star: "Any useful software becomes one safe, repeatable, agent-native command.",
  doctrine: [
    "KAIZEN7 decides the objective and route.",
    "Anything CLI discovers or forges the executor.",
    "The adapter returns structured evidence.",
    "The receipt teaches the next run.",
  ],
  architecture: [
    {
      layer: "intent_router",
      role: "Turns the human objective into output type, constraints, tool class and stop conditions.",
    },
    {
      layer: "tool_graph",
      role: "Ranks existing scripts, receipts, APIs, CLIs, MCPs, local apps, cli-hub adapters and repo patterns.",
    },
    {
      layer: "adapter_forge",
      role: "Creates the smallest wrapper only when no clean route exists.",
    },
    {
      layer: "execution_contract",
      role: "Normalizes every tool call into command, inputs, outputs, logs, metrics, errors and JSON receipt.",
    },
    {
      layer: "sandbox_guard",
      role: "Blocks credentials, installs, publishing, billing, destructive actions and broad filesystem effects without approval.",
    },
    {
      layer: "evidence_recorder",
      role: "Captures proof, timing, artifacts and failure modes so the result can be trusted.",
    },
    {
      layer: "memory_promoter",
      role: "Promotes repeated receipts into skills and discards weak tools with reasons.",
    },
  ],
  lifecycle: [
    "define_output",
    "search_receipts",
    "rank_existing_routes",
    "discover_tool",
    "forge_adapter_if_needed",
    "dry_run",
    "execute",
    "verify_artifact",
    "write_receipt",
    "promote_or_discard",
  ],
  adapter_contract: {
    command: "",
    input_schema: {},
    output_schema: {},
    required_tools: [],
    permissions: [],
    dry_run: "",
    verify: "",
    failure_modes: [],
    reuse_rule: "",
    discard_rule: "",
  },
  scoring: {
    prefer: [
      "existing receipt",
      "official API or CLI",
      "stable MCP",
      "local script",
      "cli-hub adapter",
      "small generated wrapper",
    ],
    score_fields: [
      "output_fit",
      "setup_cost",
      "repeatability",
      "json_quality",
      "safety",
      "speed",
      "maintenance",
    ],
  },
  safety_gates: [
    "credentials_required",
    "install_required",
    "paid_service_required",
    "external_publish_required",
    "destructive_action_required",
    "broad_filesystem_write_required",
    "claims_or_commerce_risk",
  ],
  build_phases: [
    {
      phase: "v0",
      output: "Blueprint, metaskill and JSON command for agents.",
    },
    {
      phase: "v1",
      output: "Local registry of tool receipts and discarded routes.",
    },
    {
      phase: "v2",
      output: "Adapter forge templates for CLI, browser, desktop and render tools.",
    },
    {
      phase: "v3",
      output: "Sandboxed dry-run runner with artifact verification.",
    },
    {
      phase: "v4",
      output: "Promotion loop from repeated receipt to skill/metaskill.",
    },
    {
      phase: "v5",
      output: "Tool mesh that can hand the same route to Codex, OpenClaw, ECC or another agent.",
    },
  ],
  receipt_template: {
    objective: "",
    selected_route: "",
    candidates_checked: [],
    adapter_used: "",
    command: "",
    inputs: {},
    outputs: {},
    verification: "",
    metrics: {},
    safety_gates: [],
    reuse_next_time: "",
    discard: [],
    promote_to_skill: false,
    memory_update_recommendation: "",
  },
};

function buildAnythingNextBlueprint() {
  return BLUEPRINT;
}

function buildAnythingRoute(objective = "", options = {}) {
  const goal = String(objective || "").trim() || "improve this project with the smallest verified action";
  const outputType = inferOutputType(goal);
  const safeGoal = shellSafeText(goal);

  return {
    schema: "kaizen7.anything_route.v1",
    objective: goal,
    identity: "KAIZEN7 Anything CLI project improvement route",
    agent_agnostic: true,
    route: "anything_cli.project_improvement",
    output_type: outputType,
    executor_priority: [
      "existing KAIZEN7 receipt or script",
      "official API, CLI or MCP",
      "local script, Playwright, FFmpeg or Remotion",
      "Anything CLI / CLI-Anything / cli-hub adapter",
      "small generated wrapper with dry-run and receipt",
    ],
    context_contract: {
      read_first: [
        "AGENTS.md",
        "KAIZEN7_CONTEXT.md",
        "docs/KAIZEN7_TOOL.md",
        ".agents/skills/kaizen7-metaskill/SKILL.md",
        ".agents/skills/cli-anything-operator/SKILL.md",
      ],
      avoid: [
        "broad repo loading before route resolution",
        "project implementation inside the KAIZEN7 kernel",
        "credentials, billing, installs, publishing or destructive actions without approval",
      ],
    },
    command_plan: [
      {
        id: "define_output",
        action: "Name the smallest useful project improvement and stop condition.",
        proof: "one concrete output target",
      },
      {
        id: "inspect_kernel",
        action: "Check the current KAIZEN7 tool surface before choosing an executor.",
        command: "npm.cmd run k7 -- status",
        proof: "status output or structured blocker",
      },
      {
        id: "resolve_mission",
        action: "Reduce the objective into route, files and acceptance checks.",
        command: `npm.cmd run k7 -- mission "${safeGoal}"`,
        proof: "Mission Brief fields are present",
      },
      {
        id: "discover_executor",
        action: "Search for the smallest existing executor before forging anything new.",
        command: `cli-hub search "${safeGoal}"`,
        fallback: "Use an existing local script, official CLI/API/MCP, or record an adapter contract without executing external software.",
        proof: "candidate list, selected executor and rejection reasons",
      },
      {
        id: "dry_run",
        action: "Run the selected executor in probe, dry-run or read-only mode first.",
        proof: "command, exit code, expected output shape and no uncontrolled side effects",
      },
      {
        id: "execute",
        action: "Apply one scoped improvement only after safety gates are clear.",
        proof: "changed files or generated artifact",
      },
      {
        id: "verify",
        action: "Run focused verification plus the KAIZEN7 check surface.",
        command: "npm.cmd run k7:check",
        proof: "passing checks or explicit blocker",
      },
      {
        id: "receipt",
        action: "Close with a Mission Outcome Receipt and memory recommendation.",
        command: "npm.cmd run k7 -- receipt",
        proof: "receipt fields completed",
      },
    ],
    safety_gates: BLUEPRINT.safety_gates,
    adapter_contract: {
      tool_goal: goal,
      tool_chosen: "",
      why_this_tool: "",
      command: "",
      inputs: {},
      outputs: {},
      dry_run: "",
      verification: "",
      failure_mode: "",
      discard_if: "",
      reuse_next_time: "",
      memory_update_recommendation: "",
    },
    receipt_template: {
      summary: "",
      changed_files: [],
      tests: [],
      risks: BLUEPRINT.safety_gates,
      reuse_next_time: "Reuse this route only when it reduced steps, context or execution errors.",
      discard: ["unverified tool wrappers", "broad rewrites", "external effects without approval"],
      promote_to_skill: false,
      memory_update_recommendation: "Promote only repeated, verified routes into skills or metaskills.",
    },
    next_command: options.json
      ? `npm.cmd run k7 -- anything "${safeGoal}" --json`
      : `npm.cmd run k7 -- anything "${safeGoal}"`,
  };
}

function inferOutputType(objective = "") {
  const text = String(objective).toLowerCase();
  if (/\b(video|render|renderizar|rendering)\b/.test(text)) return "verified_media_or_render_artifact";
  if (/\b(web|ui|frontend)\b/.test(text)) return "verified_app_or_interface_change";
  if (text.includes("skill") || text.includes("metaskill")) return "verified_skill_or_metaskill_route";
  if (text.includes("repo") || text.includes("clean") || text.includes("separa")) return "verified_repository_structure_change";
  if (text.includes("test") || text.includes("bug") || text.includes("fix")) return "verified_code_change";
  return "verified_project_improvement";
}

function shellSafeText(value = "") {
  return String(value).replace(/"/g, "'").trim();
}

function formatAnythingNextBlueprint(blueprint = BLUEPRINT) {
  return [
    "# KAIZEN7 ANYTHING CLI NEXT",
    "",
    blueprint.north_star,
    "",
    "## Doctrine",
    ...blueprint.doctrine.map((item) => `- ${item}`),
    "",
    "## Architecture",
    ...blueprint.architecture.map((item) => `- ${item.layer}: ${item.role}`),
    "",
    "## Lifecycle",
    blueprint.lifecycle.join(" -> "),
    "",
    "## Adapter Contract",
    ...Object.keys(blueprint.adapter_contract).map((key) => `- ${key}`),
    "",
    "## Scoring",
    `Prefer: ${blueprint.scoring.prefer.join(" -> ")}`,
    `Score fields: ${blueprint.scoring.score_fields.join(", ")}`,
    "",
    "## Safety Gates",
    ...blueprint.safety_gates.map((gate) => `- ${gate}`),
    "",
    "## Build Phases",
    ...blueprint.build_phases.map((item) => `- ${item.phase}: ${item.output}`),
    "",
    "## Receipt Template",
    ...Object.keys(blueprint.receipt_template).map((key) => `${key}:`),
    "",
  ].join("\n");
}

function formatAnythingRoute(route = buildAnythingRoute()) {
  return [
    "# KAIZEN7 ANYTHING ROUTE",
    "",
    `Objective: ${route.objective}`,
    `Route: ${route.route}`,
    `Output type: ${route.output_type}`,
    `Agent agnostic: ${route.agent_agnostic}`,
    "",
    "## Executor Priority",
    ...route.executor_priority.map((item) => `- ${item}`),
    "",
    "## Read First",
    ...route.context_contract.read_first.map((item) => `- ${item}`),
    "",
    "## Command Plan",
    ...route.command_plan.map((step) => {
      const command = step.command ? ` Command: ${step.command}.` : "";
      const fallback = step.fallback ? ` Fallback: ${step.fallback}.` : "";
      return `- ${step.id}: ${step.action}${command}${fallback} Proof: ${step.proof}.`;
    }),
    "",
    "## Safety Gates",
    ...route.safety_gates.map((gate) => `- ${gate}`),
    "",
    "## Adapter Contract",
    ...Object.keys(route.adapter_contract).map((key) => `${key}:`),
    "",
    "## Receipt Template",
    ...Object.keys(route.receipt_template).map((key) => `${key}:`),
    "",
    "## Next",
    `- ${route.next_command}`,
    "",
  ].join("\n");
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const wantsJson = args.includes("--json");
  const objective = args.filter((arg) => !arg.startsWith("--")).join(" ").trim();
  const output = objective
    ? buildAnythingRoute(objective, { json: wantsJson })
    : buildAnythingNextBlueprint();
  if (wantsJson) process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
  else if (objective) process.stdout.write(`${formatAnythingRoute(output)}\n`);
  else process.stdout.write(`${formatAnythingNextBlueprint(output)}\n`);
}

module.exports = {
  BLUEPRINT,
  buildAnythingRoute,
  buildAnythingNextBlueprint,
  formatAnythingRoute,
  formatAnythingNextBlueprint,
  inferOutputType,
};
