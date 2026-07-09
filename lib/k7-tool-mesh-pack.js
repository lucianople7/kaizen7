const { buildAnythingRoute, inferOutputType } = require("./k7-anything-next");
const { buildMetaskillCard } = require("./k7-metaskill-card");

function buildToolMeshPack(objective = "", options = {}) {
  const goal = String(objective || "").trim() || "make any project easier to improve with external tools";
  const safeGoal = shellSafeText(goal);
  const metaskill = buildMetaskillCard(goal, options);
  const anything = buildAnythingRoute(goal, options);
  const modules = buildFrontierModules();

  return {
    schema: "kaizen7.tool_mesh_pack.v1",
    objective: goal,
    identity: "KAIZEN7 tool mesh pack",
    thesis: "KAIZEN7 is the missing metaskill layer between agents, memory, CLIs, apps without APIs and verified project improvement.",
    output_type: inferOutputType(goal),
    agent_agnostic: true,
    flagship_command: `npm.cmd run k7 -- mesh "${safeGoal}"`,
    core_loop: [
      "compress objective",
      "recall only reusable memory",
      "rank routes and tools",
      "escape broken APIs through controlled adapters",
      "execute dry-run first",
      "verify artifact",
      "write receipt",
      "promote repeated success into skill",
    ],
    product_pillars: [
      {
        pillar: "metaskill_router",
        why: "Every agent starts with less context, fewer steps and a clearer route.",
        already_present: ["k7 solve", "mission control", "Anything route"],
        next_build: "route scoring against receipts and local project shape",
      },
      {
        pillar: "tool_mesh",
        why: "Any CLI, app, browser flow, desktop tool or local script can become one reusable command.",
        already_present: ["Anything CLI route contract", "adapter contract"],
        next_build: "local tool graph with scored candidates, rejected tools and reuse counts",
      },
      {
        pillar: "adapter_forge",
        why: "Blocked APIs should not stop execution when an app can be controlled safely another way.",
        already_present: ["API escape route", "sandbox gates"],
        next_build: "adapter templates for cli, browser, desktop, file import/export and render workflows",
      },
      {
        pillar: "receipt_memory",
        why: "The next agent should start from proof, not from a repeated conversation.",
        already_present: ["Mission Outcome Receipt", "memory recommendation"],
        next_build: "append-only local receipt ledger with promotion and discard rules",
      },
      {
        pillar: "verification_runner",
        why: "A tool is not useful unless it proves the result.",
        already_present: ["k7 check", "k7 doctor", "readiness"],
        next_build: "artifact-specific verifier contracts and replayable evidence packets",
      },
    ],
    adapter_pack: buildAdapterPack(goal, safeGoal),
    scoring_model: {
      fields: [
        "output_fit",
        "setup_cost",
        "approval_cost",
        "repeatability",
        "dry_run_quality",
        "artifact_verifiability",
        "receipt_value",
        "maintenance_cost",
      ],
      reject_if: [
        "requires unapproved credentials",
        "requires paid service or publishing",
        "writes broadly outside declared workspace",
        "cannot produce a verifiable artifact",
        "duplicates a proven local route",
      ],
    },
    frontier_modules: modules,
    build_order: modules.map((module) => module.id),
    metaskill_contract: {
      schema: metaskill.schema,
      primary_route: metaskill.primary_route,
      context_budget: metaskill.context_budget,
      success_metrics: metaskill.success_metrics,
    },
    anything_contract: {
      schema: anything.schema,
      route: anything.route,
      output_type: anything.output_type,
      next_command: anything.next_command,
      safety_gates: anything.safety_gates,
    },
    acceptance_tests: [
      "Given an objective, return route, adapter contract, safety gates and receipt template.",
      "Given an API-blocked app, return a non-API escape route without executing external effects.",
      "Given repeated success, recommend promotion to skill only with verification evidence.",
      "Given a risky action, block credentials, billing, publishing and destructive writes.",
    ],
    risks: [
      "Do not become a generic automation mega-system.",
      "Do not execute external apps without explicit approval and a dry-run path.",
      "Do not store memory that is not reusable.",
      "Do not add dependencies until a repeated route proves value.",
    ],
    next_commands: [
      `npm.cmd run k7 -- solve "${safeGoal}"`,
      `npm.cmd run k7 -- anything "${safeGoal}"`,
      "npm.cmd run k7 -- doctor",
    ],
  };
}

function buildAdapterPack(goal, safeGoal) {
  return {
    schema: "kaizen7.adapter_pack.v1",
    goal,
    adapter_types: [
      {
        type: "cli",
        command_shape: "<tool> --input <path-or-json> --output <artifact> --dry-run",
        use_when: "A local command exists or can be wrapped without new platform code.",
      },
      {
        type: "browser",
        command_shape: "playwright flow with explicit selectors and screenshot evidence",
        use_when: "The workflow exists in a web app but the API is missing or blocked.",
      },
      {
        type: "desktop",
        command_shape: "Anything CLI / cli-hub launches app, performs bounded action, captures proof",
        use_when: "The useful workflow exists only in a local desktop app.",
      },
      {
        type: "file_exchange",
        command_shape: "export/import files with checksum, transform step and verifier",
        use_when: "The app supports reliable files but no clean API.",
      },
      {
        type: "render",
        command_shape: "render command, artifact path, media probe and receipt",
        use_when: "The output is image, audio, video or document artifact.",
      },
    ],
    manifest: {
      name: slugify(goal),
      objective: goal,
      dry_run_required: true,
      permissions: [],
      inputs: {},
      outputs: {},
      verify: "",
      command: "",
      fallback: `npm.cmd run k7 -- anything "${safeGoal}"`,
      receipt_required: true,
    },
  };
}

function buildFrontierModules() {
  return [
    {
      id: "receipt-ledger",
      priority: 1,
      build_now: true,
      reason: "KAIZEN7 needs durable proof of what worked, failed and should be reused.",
      output: "append-only JSONL receipt ledger plus search by route, tool, project and output type",
    },
    {
      id: "tool-graph",
      priority: 2,
      build_now: true,
      reason: "The router should rank local scripts, skills, CLIs, APIs, MCPs and adapters before execution.",
      output: "scored candidate graph with rejection reasons",
    },
    {
      id: "adapter-forge-templates",
      priority: 3,
      build_now: true,
      reason: "Apps without APIs need repeatable wrappers, not fresh improvisation.",
      output: "templates for cli, browser, desktop, file exchange and render adapters",
    },
    {
      id: "sandbox-runner-contract",
      priority: 4,
      build_now: false,
      reason: "Real execution needs permission gates and dry-run evidence before side effects.",
      output: "runner contract for permissions, logs, artifacts and exit codes",
    },
    {
      id: "skill-promoter",
      priority: 5,
      build_now: false,
      reason: "Only repeated verified receipts should become skills or metaskills.",
      output: "promotion rule that generates a skill proposal from repeated receipts",
    },
    {
      id: "agent-export-pack",
      priority: 6,
      build_now: false,
      reason: "Other agents need the same compact route without reading this repo.",
      output: "single JSON packet with route, adapter, checks, receipt and memory recommendation",
    },
  ];
}

function formatToolMeshPack(pack = buildToolMeshPack()) {
  return [
    "# KAIZEN7 TOOL MESH PACK",
    "",
    `Objective: ${pack.objective}`,
    `Thesis: ${pack.thesis}`,
    `Flagship command: ${pack.flagship_command}`,
    "",
    "## Core Loop",
    pack.core_loop.join(" -> "),
    "",
    "## Product Pillars",
    ...pack.product_pillars.map((item) => `- ${item.pillar}: ${item.why} Next: ${item.next_build}.`),
    "",
    "## Adapter Pack",
    `Schema: ${pack.adapter_pack.schema}`,
    ...pack.adapter_pack.adapter_types.map((item) => `- ${item.type}: ${item.use_when} Command: ${item.command_shape}.`),
    "",
    "## Scoring Model",
    `Fields: ${pack.scoring_model.fields.join(", ")}`,
    "Reject if:",
    ...pack.scoring_model.reject_if.map((item) => `- ${item}`),
    "",
    "## Frontier Modules",
    ...pack.frontier_modules.map((item) => `- ${item.priority}. ${item.id}: ${item.output}`),
    "",
    "## Acceptance Tests",
    ...pack.acceptance_tests.map((item) => `- ${item}`),
    "",
    "## Next Commands",
    ...pack.next_commands.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

function slugify(value = "") {
  const slug = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return slug || "kaizen7-adapter";
}

function shellSafeText(value = "") {
  return String(value).replace(/"/g, "'").trim();
}

module.exports = {
  buildAdapterPack,
  buildFrontierModules,
  buildToolMeshPack,
  formatToolMeshPack,
  slugify,
};
