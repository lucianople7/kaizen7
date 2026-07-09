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

if (require.main === module) {
  const blueprint = buildAnythingNextBlueprint();
  if (process.argv.includes("--json")) process.stdout.write(`${JSON.stringify(blueprint, null, 2)}\n`);
  else process.stdout.write(`${formatAnythingNextBlueprint(blueprint)}\n`);
}

module.exports = {
  BLUEPRINT,
  buildAnythingNextBlueprint,
  formatAnythingNextBlueprint,
};
