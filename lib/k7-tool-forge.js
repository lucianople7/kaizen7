const FORGE_LANES = [
  {
    id: "video-tool",
    triggers: ["video", "render", "ffmpeg", "remotion", "huggingface", "modelo"],
    search_zones: ["local receipts", "Hugging Face Spaces/models", "GitHub repos", "existing CLI tools"],
    adapter_shape: "input manifest -> command/script -> artifact path -> media probe -> receipt",
    memory_key: "video_route_pattern",
  },
  {
    id: "browser-tool",
    triggers: ["browser", "web", "app", "click", "sin api", "no api"],
    search_zones: ["local receipts", "Playwright scripts", "MCP browser tools", "GitHub repos"],
    adapter_shape: "objective -> bounded browser steps -> DOM/screenshot evidence -> approval gate -> receipt",
    memory_key: "browser_route_pattern",
  },
  {
    id: "repo-tool",
    triggers: ["repo", "github", "open source", "repos"],
    search_zones: ["local receipts", "GitHub repos", "papers with code", "awesome lists"],
    adapter_shape: "candidate scorecard -> pattern summary -> smallest local wrapper -> tests -> receipt",
    memory_key: "repo_pattern_route",
  },
  {
    id: "cli-tool",
    triggers: ["cli", "terminal", "comando", "anything", "desktop"],
    search_zones: ["local commands", "Anything CLI routes", "user-provided executables", "repo scripts"],
    adapter_shape: "tool manifest -> dry-run command -> bounded execution -> verification -> receipt",
    memory_key: "cli_adapter_route",
  },
  {
    id: "memory-tool",
    triggers: ["memoria", "memory", "recordar", "contexto", "aprende", "reutilizar"],
    search_zones: ["receipt ledger", "agent context journal", "Obsidian memory", "local pattern notes"],
    adapter_shape: "need -> relevant memory -> route decision -> reusable learning -> approved writeback",
    memory_key: "memory_reuse_route",
  },
];

function buildToolForgePlan(objective = "", options = {}) {
  const goal = String(objective || "").trim() || "forge an agent-ready tool route from free/open patterns";
  const safeGoal = shellSafeText(goal);
  const lane = selectForgeLane(goal);
  return {
    schema: "kaizen7.tool_forge_plan.v1",
    objective: goal,
    identity: "KAIZEN7 tool forge loop",
    doctrine: "Discover free/open tools, learn their pattern, forge the smallest agent-ready adapter, verify it, then remember only reusable learning.",
    agent_agnostic: true,
    free_first: true,
    selected_lane: lane,
    loop: [
      {
        step: "radar",
        output: "find current free/open/local candidates before paid providers",
      },
      {
        step: "recall",
        output: "load prior receipts and discarded routes for this need",
      },
      {
        step: "learn_pattern",
        output: "extract command shape, inputs, outputs, failure modes and verification",
      },
      {
        step: "forge_adapter",
        output: "create the smallest manifest, wrapper, checklist or skill contract for agents",
      },
      {
        step: "dry_run",
        output: "prove the adapter can run without secrets, billing or destructive actions",
      },
      {
        step: "verify",
        output: "check artifact, tests, logs, screenshots or probes depending on the lane",
      },
      {
        step: "remember",
        output: "store route, command, reuse rule and discard rule in receipt memory",
      },
      {
        step: "promote",
        output: "after repeated verified receipts, propose a real skill or adapter",
      },
    ],
    search_zones: lane.search_zones,
    adapter_contract: {
      name: "",
      source_tool: "",
      license: "",
      cost: "free | user-provided | paid-approved",
      inputs: [],
      outputs: [],
      command_or_route: "",
      dry_run: "",
      verification: "",
      failure_modes: [],
      secrets_policy: "never store keys, tokens, cookies or billing credentials",
      receipt_required: true,
      memory_key: lane.memory_key,
    },
    promotion_gate: {
      promote_after_verified_receipts: 3,
      requires: [
        "same route solved repeated real needs",
        "verification is deterministic enough for another agent",
        "adapter reduces steps, context or breakage",
        "license and cost remain acceptable",
      ],
      promote_to: ["skill", "metaskill route", "CLI wrapper", "MCP manifest", "project handoff contract"],
      do_not_promote_when: [
        "one-off task",
        "paid-only dependency",
        "credentials required without approval",
        "verification is unclear",
        "existing local skill already solves it",
      ],
    },
    next_commands: [
      `npm.cmd run k7 -- recall "${safeGoal}"`,
      `npm.cmd run k7 -- commons "${safeGoal}"`,
      `npm.cmd run k7 -- radar "${safeGoal}"`,
      `npm.cmd run k7 -- trust "${safeGoal}"`,
      "npm.cmd run k7 -- remember \"<verified-receipt-json>\"",
    ],
    options_seen: Object.keys(options || {}).sort(),
  };
}

function selectForgeLane(goal = "") {
  const normalized = normalize(goal);
  const scored = FORGE_LANES
    .map((lane, index) => ({
      ...lane,
      index,
      score: lane.triggers.reduce((total, trigger) => total + (normalized.includes(normalize(trigger)) ? 1 : 0), 0),
    }))
    .sort((left, right) => right.score - left.score || left.index - right.index);
  return scored[0].score > 0 ? scored[0] : FORGE_LANES.find((lane) => lane.id === "repo-tool");
}

function formatToolForgePlan(plan = buildToolForgePlan()) {
  return [
    "# KAIZEN7 TOOL FORGE",
    "",
    `Objective: ${plan.objective}`,
    `Doctrine: ${plan.doctrine}`,
    `Lane: ${plan.selected_lane.id}`,
    "",
    "## Search Zones",
    ...plan.search_zones.map((zone) => `- ${zone}`),
    "",
    "## Loop",
    ...plan.loop.map((item) => `- ${item.step}: ${item.output}`),
    "",
    "## Adapter Contract",
    ...Object.keys(plan.adapter_contract).map((key) => `${key}:`),
    "",
    "## Promotion Gate",
    `- Promote after verified receipts: ${plan.promotion_gate.promote_after_verified_receipts}`,
    ...plan.promotion_gate.requires.map((item) => `- Requires: ${item}`),
    ...plan.promotion_gate.do_not_promote_when.map((item) => `- Do not promote: ${item}`),
    "",
    "## Next Commands",
    ...plan.next_commands.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

function normalize(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function shellSafeText(value = "") {
  return String(value).replace(/"/g, "'").trim();
}

module.exports = {
  FORGE_LANES,
  buildToolForgePlan,
  formatToolForgePlan,
  selectForgeLane,
};
