const { buildToolMeshPack } = require("./k7-tool-mesh-pack");

function buildMarketAdaptationPack(objective = "", options = {}) {
  const goal = String(objective || "").trim() || "keep KAIZEN7 useful as tools and markets change";
  const safeGoal = shellSafeText(goal);
  const mesh = buildToolMeshPack(goal, options);

  return {
    schema: "kaizen7.market_adaptation_pack.v1",
    objective: goal,
    identity: "KAIZEN7 modular market adaptation pack",
    doctrine: "Adapters change. Receipts decide. The kernel stays small.",
    anti_obsolescence_rule: "Never hard-code today's winning tool as tomorrow's route; store the decision rule, proof and discard condition.",
    agent_agnostic: true,
    connection_policy: {
      open_to: [
        "official APIs",
        "local CLIs",
        "MCP servers",
        "browser automation",
        "desktop app adapters",
        "file import/export workflows",
        "webhooks",
        "repo-derived scripts",
        "agent-to-agent handoff packets",
        "manual human approval steps",
      ],
      closed_to_without_approval: [
        "credentials",
        "billing",
        "external publishing",
        "destructive writes",
        "broad filesystem access",
        "claims, legal or commerce outputs without review",
      ],
      connection_contract: {
        name: "",
        type: "api | cli | mcp | browser | desktop | file_exchange | webhook | agent | manual",
        objective: goal,
        command_or_endpoint: "",
        auth_required: false,
        dry_run: "",
        verify: "",
        inputs: {},
        outputs: {},
        failure_modes: [],
        expires_when: "",
        reuse_rule: "",
        discard_rule: "",
      },
    },
    signal_sources: [
      {
        source: "local_receipts",
        use: "Detect what worked, failed, repeated or became obsolete.",
        cadence: "every mission",
      },
      {
        source: "project_repo",
        use: "Detect scripts, dependencies, docs, tests and local tools before external search.",
        cadence: "before route selection",
      },
      {
        source: "official_docs",
        use: "Verify current APIs, CLIs, MCPs and deprecations before relying on them.",
        cadence: "when a connector is selected or refreshed",
      },
      {
        source: "repo_hunter",
        use: "Find mature patterns and adapters before building from scratch.",
        cadence: "when no local route exists",
      },
      {
        source: "market_watch",
        use: "Track tool shifts, new providers and obsolete routes as candidates, not truth.",
        cadence: "scheduled or human-triggered",
      },
    ],
    adaptation_loop: [
      "state objective",
      "recall proven receipts",
      "run improvement radar before hardening the route",
      "scan local project routes",
      "rank connector candidates",
      "verify current docs or local command",
      "dry-run selected route",
      "execute only scoped action",
      "write receipt",
      "promote repeated route or discard weak route",
    ],
    evolution_gates: {
      promote_to_skill_when: [
        "same route succeeds at least 3 times",
        "verification is repeatable",
        "the route saves context, steps or tool confusion",
        "failure modes and discard rules are known",
      ],
      refresh_when: [
        "official docs changed",
        "command output shape changed",
        "auth, pricing or permission model changed",
        "receipt failure rate increases",
        "a simpler route appears",
      ],
      retire_when: [
        "connector requires unapproved risk",
        "route is slower and less reliable than alternatives",
        "verification cannot prove output",
        "maintenance cost exceeds reuse value",
      ],
    },
    improvement_radar: {
      command: `npm.cmd run k7 -- radar "${safeGoal}"`,
      required_before: [
        "building a new adapter",
        "promoting a route into a skill",
        "reusing stale receipts",
        "locking a provider or agent-browser choice",
      ],
      asks: [
        "what current tool makes this route simpler",
        "what current repo proves a better pattern",
        "what should be refreshed, retired or watched",
      ],
    },
    modular_surfaces: [
      {
        module: "connector-registry",
        contract: "stores connection manifests, not credentials",
        first_artifact: "data/connectors/registry.json",
      },
      {
        module: "signal-router",
        contract: "turns market/project signals into route refresh proposals",
        first_artifact: "k7 adapt JSON packet",
      },
      {
        module: "adapter-versioning",
        contract: "tracks route version, evidence, expiry and discard rules",
        first_artifact: "adapter manifest version field",
      },
      {
        module: "self-evolution-gate",
        contract: "allows proposals, blocks uncontrolled rewrites",
        first_artifact: "promotion/refresh/retire rules",
      },
      {
        module: "agent-portability",
        contract: "exports compact instructions for any agent",
        first_artifact: "single JSON handoff packet",
      },
    ],
    decision_matrix: [
      {
        condition: "local receipt proves a route",
        action: "reuse it before searching",
      },
      {
        condition: "API is current, stable and approved",
        action: "prefer official API or MCP",
      },
      {
        condition: "API is blocked, expensive, unstable or missing",
        action: "use CLI, browser, desktop or file-exchange adapter",
      },
      {
        condition: "tool changed since last receipt",
        action: "refresh adapter in dry-run and update expiry/discard rule",
      },
      {
        condition: "new market tool appears",
        action: "evaluate as candidate; do not replace proven route without evidence",
      },
    ],
    mesh_contract: {
      schema: mesh.schema,
      build_order: mesh.build_order,
      scoring_fields: mesh.scoring_model.fields,
    },
    acceptance_tests: [
      "Given any new tool type, produce a connector manifest without changing kernel code.",
      "Given a stale adapter, mark refresh or retire instead of reusing blindly.",
      "Given a market signal, evaluate it as candidate evidence, not automatic truth.",
      "Given repeated verified success, propose skill promotion with receipt evidence.",
      "Given risky permissions, stop before credentials, billing, publishing or destructive writes.",
    ],
    next_commands: [
      `npm.cmd run k7 -- radar "${safeGoal}"`,
      `npm.cmd run k7 -- adapt "${safeGoal}" --json`,
      `npm.cmd run k7 -- mesh "${safeGoal}"`,
      `npm.cmd run k7 -- solve "${safeGoal}"`,
    ],
  };
}

function formatMarketAdaptationPack(pack = buildMarketAdaptationPack()) {
  return [
    "# KAIZEN7 MARKET ADAPTATION PACK",
    "",
    `Objective: ${pack.objective}`,
    `Doctrine: ${pack.doctrine}`,
    `Rule: ${pack.anti_obsolescence_rule}`,
    "",
    "## Open Connections",
    ...pack.connection_policy.open_to.map((item) => `- ${item}`),
    "",
    "## Signal Sources",
    ...pack.signal_sources.map((item) => `- ${item.source}: ${item.use} Cadence: ${item.cadence}.`),
    "",
    "## Adaptation Loop",
    pack.adaptation_loop.join(" -> "),
    "",
    "## Evolution Gates",
    "Promote:",
    ...pack.evolution_gates.promote_to_skill_when.map((item) => `- ${item}`),
    "Refresh:",
    ...pack.evolution_gates.refresh_when.map((item) => `- ${item}`),
    "Retire:",
    ...pack.evolution_gates.retire_when.map((item) => `- ${item}`),
    "",
    "## Modular Surfaces",
    ...pack.modular_surfaces.map((item) => `- ${item.module}: ${item.contract}. Artifact: ${item.first_artifact}.`),
    "",
    "## Decision Matrix",
    ...pack.decision_matrix.map((item) => `- If ${item.condition}: ${item.action}.`),
    "",
    "## Acceptance Tests",
    ...pack.acceptance_tests.map((item) => `- ${item}`),
    "",
    "## Next Commands",
    ...pack.next_commands.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

function shellSafeText(value = "") {
  return String(value).replace(/"/g, "'").trim();
}

module.exports = {
  buildMarketAdaptationPack,
  formatMarketAdaptationPack,
};
