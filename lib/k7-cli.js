#!/usr/bin/env node
const {
  buildAnythingNextBlueprint,
  buildAnythingRoute,
  formatAnythingNextBlueprint,
  formatAnythingRoute,
} = require("./k7-anything-next");
const { buildBestReport, formatAgentHandoff, formatBestReport } = require("./k7-best");
const { buildMarketAdaptationPack, formatMarketAdaptationPack } = require("./k7-market-adaptation-pack");
const { buildMetaskillCard, formatMetaskillCard } = require("./k7-metaskill-card");
const { buildToolMeshPack, formatToolMeshPack } = require("./k7-tool-mesh-pack");
const { buildK7Status, formatK7Status } = require("./k7-status");
const { buildMissionControl, formatMissionControl } = require("./mission-control");
const { buildSelfImprovementLoop, formatSelfImprovementLoop } = require("./self-improvement-loop");
const { buildSmokeReport, formatSmokeReport } = require("./k7-smoke");
const packageJson = require("../package.json");

const COMMANDS = [
  {
    name: "help",
    usage: "npm.cmd run k7 -- help",
    value: "Show the KAIZEN7 tool surface.",
  },
  {
    name: "status",
    usage: "npm.cmd run k7 -- status",
    aliases: ["s"],
    value: "Show branch, readiness, repo shape, risks and next mission.",
  },
  {
    name: "doctor",
    usage: "npm.cmd run k7 -- doctor",
    aliases: ["d"],
    value: "Check the professional tool surface and readiness contract.",
  },
  {
    name: "version",
    usage: "npm.cmd run k7 -- version",
    aliases: ["v", "--version"],
    value: "Show package version, command count and schema.",
  },
  {
    name: "best",
    usage: "npm.cmd run k7 -- best",
    aliases: ["b"],
    value: "Show the best current operating view and agent handoff.",
  },
  {
    name: "handoff",
    usage: "npm.cmd run k7 -- handoff",
    aliases: ["h"],
    value: "Give another agent the smallest useful execution packet.",
  },
  {
    name: "mission",
    usage: "npm.cmd run k7 -- mission \"<objective>\"",
    aliases: ["m"],
    value: "Turn an objective into Growth Gate, route, Mission Brief and receipt template.",
  },
  {
    name: "solve",
    usage: "npm.cmd run k7 -- solve \"<objective>\"",
    aliases: ["key", "llave"],
    value: "Return the KAIZEN7 metaskill card: minimal memory, route, tool ladder, API escape, verification and learning.",
  },
  {
    name: "anything",
    usage: "npm.cmd run k7 -- anything \"<objective>\"",
    aliases: ["a"],
    value: "Build an agent-agnostic Anything CLI route, or show the blueprint with no objective.",
  },
  {
    name: "mesh",
    usage: "npm.cmd run k7 -- mesh \"<objective>\"",
    aliases: ["frontier", "steroids"],
    value: "Return the stronger KAIZEN7 Tool Mesh Pack: pillars, adapter pack, scoring, frontier modules and acceptance tests.",
  },
  {
    name: "adapt",
    usage: "npm.cmd run k7 -- adapt \"<objective>\"",
    aliases: ["market", "evolve"],
    value: "Return the modular market adaptation pack: open connection contracts, signal sources, evolution gates and retire/refresh rules.",
  },
  {
    name: "improve",
    usage: "npm.cmd run k7 -- improve \"<friction>\"",
    aliases: ["i"],
    value: "Run KAIZEN7 against KAIZEN7 and return a controlled self-improvement pass.",
  },
  {
    name: "receipt",
    usage: "npm.cmd run k7 -- receipt",
    aliases: ["r"],
    value: "Show the closeout fields every mission should return.",
  },
  {
    name: "check",
    usage: "npm.cmd run k7 -- check",
    aliases: ["c"],
    value: "Run the compact KAIZEN7 smoke report. Use npm.cmd run k7:check for the full suite.",
  },
];

function buildK7Tool() {
  return {
    schema: "kaizen7.tool.v1",
    name: "k7",
    identity: "KAIZEN7 official agent-agnostic project improvement tool",
    promise: "Turn any project objective into minimal context, an Anything CLI route, verified execution and reusable learning.",
    principle: "Human decides. KAIZEN7 coordinates. Agents execute. Projects grow.",
    flow: [
      "objective",
      "metaskill",
      "minimal memory",
      "route",
      "Anything CLI discovery",
      "skill/metaskill",
      "executor",
      "verification",
      "receipt",
      "memory recommendation",
    ],
    commands: COMMANDS,
  };
}

function formatK7ToolHelp(tool = buildK7Tool()) {
  return [
    "# KAIZEN7 TOOL",
    "",
    tool.promise,
    "",
    tool.principle,
    "",
    "## Flow",
    tool.flow.join(" -> "),
    "",
    "## Commands",
    ...tool.commands.map((command) => {
      const aliases = command.aliases?.length ? ` [${command.aliases.join(", ")}]` : "";
      return `- ${command.usage}${aliases}: ${command.value}`;
    }),
    "",
    "## Start Here",
    "- npm.cmd run k7 -- status",
    "- npm.cmd run k7 -- solve \"<objective>\"",
    "- npm.cmd run k7 -- mission \"<objective>\"",
    "- npm.cmd run k7 -- mesh \"<objective>\"",
    "- npm.cmd run k7 -- adapt \"<objective>\"",
    "- npm.cmd run k7 -- improve \"<friction>\"",
    "- npm.cmd run k7 -- handoff",
    "",
  ].join("\n");
}

function parseCommand(argv = []) {
  const [command = "help", ...rest] = argv;
  return {
    command: resolveCommandName(command.toLowerCase()),
    args: rest,
    wantsJson: rest.includes("--json"),
  };
}

function resolveCommandName(input = "help") {
  const normalized = String(input || "help").toLowerCase();
  if (normalized === "-h" || normalized === "--help") return "help";
  const match = COMMANDS.find((command) => (
    command.name === normalized || (command.aliases || []).includes(normalized)
  ));
  return match?.name || normalized;
}

function suggestCommandName(input = "") {
  const normalized = String(input || "").toLowerCase();
  if (!normalized) return "help";
  const names = COMMANDS.flatMap((command) => [command.name, ...(command.aliases || [])]);
  return names
    .map((name) => ({
      name,
      score: commonPrefixLength(normalized, name),
    }))
    .sort((left, right) => right.score - left.score || left.name.localeCompare(right.name))[0]?.name || "help";
}

function commonPrefixLength(left, right) {
  let count = 0;
  while (count < left.length && count < right.length && left[count] === right[count]) count += 1;
  return count;
}

function commandText(args = []) {
  return args.filter((arg) => !arg.startsWith("--")).join(" ").trim();
}

function buildVersionPacket(tool = buildK7Tool()) {
  return {
    schema: "kaizen7.version.v1",
    name: packageJson.name,
    version: packageJson.version,
    tool: tool.name,
    command_count: tool.commands.length,
    commands: tool.commands.map((command) => command.name),
    node: process.version,
  };
}

function formatVersionPacket(packet = buildVersionPacket()) {
  return [
    "# KAIZEN7 VERSION",
    "",
    `Package: ${packet.name}`,
    `Version: ${packet.version}`,
    `Tool: ${packet.tool}`,
    `Commands: ${packet.command_count}`,
    `Node: ${packet.node}`,
    "",
  ].join("\n");
}

function buildDoctorReport(root = process.cwd()) {
  const tool = buildK7Tool();
  const status = buildK7Status(root);
  const requiredCommands = ["status", "mission", "solve", "handoff", "anything", "mesh", "adapt", "improve", "receipt", "check"];
  const checks = [
    {
      ok: tool.schema === "kaizen7.tool.v1",
      label: "tool surface schema",
    },
    {
      ok: requiredCommands.every((name) => tool.commands.some((command) => command.name === name)),
      label: "tool surface commands",
    },
    {
      ok: status.readiness.status === "ready",
      label: "readiness",
      detail: status.readiness.status,
    },
    {
      ok: status.next_mission.route === "mission_brief",
      label: "route language",
      detail: status.next_mission.route,
    },
    {
      ok: buildAnythingRoute("improve this project").schema === "kaizen7.anything_route.v1",
      label: "anything route contract",
    },
    {
      ok: buildMetaskillCard("connect to an app without an API").schema === "kaizen7.metaskill_card.v1",
      label: "metaskill card contract",
    },
    {
      ok: buildToolMeshPack("connect to apps without APIs").schema === "kaizen7.tool_mesh_pack.v1",
      label: "tool mesh pack contract",
    },
    {
      ok: buildMarketAdaptationPack("keep connectors modular").schema === "kaizen7.market_adaptation_pack.v1",
      label: "market adaptation contract",
    },
    {
      ok: packageJson.bin?.k7 === "lib/k7-cli.js",
      label: "k7 binary entrypoint",
      detail: packageJson.bin?.k7,
    },
  ];
  return {
    schema: "kaizen7.doctor.v1",
    status: checks.every((check) => check.ok) ? "pass" : "fail",
    checks,
    next_command: "npm.cmd run k7 -- mission \"<objective>\"",
  };
}

function formatDoctorReport(report = buildDoctorReport()) {
  return [
    "# KAIZEN7 DOCTOR",
    "",
    `Status: ${report.status}`,
    "",
    "## Checks",
    ...report.checks.map((check) => `- ${check.ok ? "PASS" : "FAIL"} ${check.label}${check.detail ? ` (${check.detail})` : ""}`),
    "",
    "## Next",
    `- ${report.next_command}`,
    "",
  ].join("\n");
}

function buildReceiptTemplate() {
  return {
    schema: "kaizen7.receipt_template.v1",
    title: "Mission Outcome Receipt",
    fields: {
      summary: "",
      changed_files: [],
      tests: [],
      risks: [],
      reuse_next_time: "",
      discard: [],
      memory_update_recommendation: "",
      next_action: "",
    },
  };
}

function buildSelfImprovementPass(loop) {
  const goal = loop.goal || "mejorar KAIZEN7";
  return {
    schema: "kaizen7.self_improvement_pass.v1",
    mode: "controlled_self_improvement",
    status: loop.status,
    subject: loop.subject,
    goal,
    friction: `Improve KAIZEN7 against this friction: ${goal}`,
    decision: loop.verdict,
    improvement_rule: "Patch only one kernel friction at a time, prove it with a test, then run the check suite.",
    selected_metaskills: [
      "k7-self-evolution-loop",
      "kaizen7-evolution-engine",
      "test-driven-development",
      "verification-before-completion",
    ],
    actions: [
      "Identify one concrete friction from current command output.",
      "Write or update the smallest failing test for that friction.",
      "Patch only the module that owns the behavior.",
      "Run focused tests, then npm.cmd run k7:check.",
      "Close with a Mission Outcome Receipt and memory recommendation.",
    ],
    commands: [
      "npm.cmd run k7 -- improve \"<friction>\"",
      "node tests/k7-cli.test.js",
      "npm.cmd run k7 -- check",
      "npm.cmd run k7:check",
    ],
    gates: loop.gates,
    next_action: "Pick the smallest friction in the k7 command surface and convert it into a tested patch.",
    receipt: {
      summary: "",
      changed_files: [],
      tests: [],
      risks: loop.gates,
      reuse_next_time: "Start with k7 improve for tool-surface friction before broad refactors.",
      discard: ["broad autonomous rewrites", "unverified improvement claims", "memory noise"],
      memory_update_recommendation: "Record only if the pass reduces future steps, context or errors.",
    },
  };
}

function formatSelfImprovementPass(pass) {
  return [
    "# KAIZEN7 SELF IMPROVEMENT PASS",
    "",
    `Status: ${pass.status}`,
    `Goal: ${pass.goal}`,
    `Decision: ${pass.decision}`,
    "",
    "## Friction",
    `- ${pass.friction}`,
    "",
    "## Rule",
    `- ${pass.improvement_rule}`,
    "",
    "## Metaskills",
    ...pass.selected_metaskills.map((skill) => `- ${skill}`),
    "",
    "## Actions",
    ...pass.actions.map((action) => `- ${action}`),
    "",
    "## Commands",
    ...pass.commands.map((command) => `- ${command}`),
    "",
    "## Gates",
    ...pass.gates.map((gate) => `- ${gate}`),
    "",
    "## Receipt",
    ...Object.keys(pass.receipt).map((key) => `${key}:`),
    "",
  ].join("\n");
}

function formatReceiptTemplate(receipt = buildReceiptTemplate()) {
  return [
    "# Mission Outcome Receipt",
    "",
    ...Object.keys(receipt.fields).map((field) => `${field}:`),
    "",
  ].join("\n");
}

function runK7ToolCommand(argv = [], root = process.cwd()) {
  const parsed = parseCommand(argv);
  const tool = buildK7Tool();

  if (parsed.command === "help" || parsed.command === "--help" || parsed.command === "-h") {
    return {
      exitCode: 0,
      output: parsed.wantsJson ? `${JSON.stringify(tool, null, 2)}\n` : `${formatK7ToolHelp(tool)}\n`,
    };
  }

  if (parsed.command === "status") {
    const status = buildK7Status(root);
    return {
      exitCode: status.readiness.status === "ready" ? 0 : 1,
      output: parsed.wantsJson ? `${JSON.stringify(status, null, 2)}\n` : `${formatK7Status(status)}\n`,
    };
  }

  if (parsed.command === "doctor") {
    const report = buildDoctorReport(root);
    return {
      exitCode: report.status === "pass" ? 0 : 1,
      output: parsed.wantsJson ? `${JSON.stringify(report, null, 2)}\n` : `${formatDoctorReport(report)}\n`,
    };
  }

  if (parsed.command === "version") {
    const packet = buildVersionPacket(tool);
    return {
      exitCode: 0,
      output: parsed.wantsJson ? `${JSON.stringify(packet, null, 2)}\n` : `${formatVersionPacket(packet)}\n`,
    };
  }

  if (parsed.command === "best") {
    const report = buildBestReport(root);
    return {
      exitCode: report.status === "pass" ? 0 : 1,
      output: parsed.wantsJson ? `${JSON.stringify(report, null, 2)}\n` : `${formatBestReport(report)}\n`,
    };
  }

  if (parsed.command === "handoff") {
    const report = buildBestReport(root);
    return {
      exitCode: report.status === "pass" ? 0 : 1,
      output: parsed.wantsJson ? `${JSON.stringify(report.agent_handoff, null, 2)}\n` : `${formatAgentHandoff(report.agent_handoff)}\n`,
    };
  }

  if (parsed.command === "mission") {
    const goal = commandText(parsed.args);
    const control = buildMissionControl({ goal: goal || "prepare KAIZEN7 mission" });
    return {
      exitCode: 0,
      output: parsed.wantsJson ? `${JSON.stringify(control, null, 2)}\n` : `${formatMissionControl(control)}\n`,
    };
  }

  if (parsed.command === "solve") {
    const goal = commandText(parsed.args);
    const card = buildMetaskillCard(goal || "improve this project with fewer steps", { json: parsed.wantsJson });
    return {
      exitCode: 0,
      output: parsed.wantsJson ? `${JSON.stringify(card, null, 2)}\n` : `${formatMetaskillCard(card)}\n`,
    };
  }

  if (parsed.command === "anything") {
    const goal = commandText(parsed.args);
    const output = goal
      ? buildAnythingRoute(goal, { json: parsed.wantsJson })
      : buildAnythingNextBlueprint();
    return {
      exitCode: 0,
      output: parsed.wantsJson
        ? `${JSON.stringify(output, null, 2)}\n`
        : `${goal ? formatAnythingRoute(output) : formatAnythingNextBlueprint(output)}\n`,
    };
  }

  if (parsed.command === "mesh") {
    const goal = commandText(parsed.args);
    const pack = buildToolMeshPack(goal || "make KAIZEN7 solve harder external tool problems", { json: parsed.wantsJson });
    return {
      exitCode: 0,
      output: parsed.wantsJson ? `${JSON.stringify(pack, null, 2)}\n` : `${formatToolMeshPack(pack)}\n`,
    };
  }

  if (parsed.command === "adapt") {
    const goal = commandText(parsed.args);
    const pack = buildMarketAdaptationPack(goal || "keep KAIZEN7 useful as tools and markets change", { json: parsed.wantsJson });
    return {
      exitCode: 0,
      output: parsed.wantsJson ? `${JSON.stringify(pack, null, 2)}\n` : `${formatMarketAdaptationPack(pack)}\n`,
    };
  }

  if (parsed.command === "improve") {
    const goal = commandText(parsed.args);
    const loop = buildSelfImprovementLoop({
      root,
      goal: goal || "mejorar KAIZEN7 usando KAIZEN7",
    });
    if (parsed.args.includes("--raw")) {
      return {
        exitCode: loop.status === "blocked" ? 1 : 0,
        output: parsed.wantsJson ? `${JSON.stringify(loop, null, 2)}\n` : `${formatSelfImprovementLoop(loop)}\n`,
      };
    }
    const pass = buildSelfImprovementPass(loop);
    return {
      exitCode: loop.status === "blocked" ? 1 : 0,
      output: parsed.wantsJson ? `${JSON.stringify(pass, null, 2)}\n` : `${formatSelfImprovementPass(pass)}\n`,
    };
  }

  if (parsed.command === "receipt") {
    const receipt = buildReceiptTemplate();
    return {
      exitCode: 0,
      output: parsed.wantsJson ? `${JSON.stringify(receipt, null, 2)}\n` : `${formatReceiptTemplate(receipt)}\n`,
    };
  }

  if (parsed.command === "check") {
    const report = buildSmokeReport(root);
    return {
      exitCode: report.status === "pass" ? 0 : 1,
      output: parsed.wantsJson ? `${JSON.stringify(report, null, 2)}\n` : `${formatSmokeReport(report)}\n`,
    };
  }

  return {
    exitCode: 2,
    output: [
      `Unknown command: ${parsed.command}`,
      `Did you mean: ${suggestCommandName(parsed.command)}`,
      "",
      formatK7ToolHelp(tool),
    ].join("\n"),
  };
}

if (require.main === module) {
  const result = runK7ToolCommand(process.argv.slice(2), process.cwd());
  process.stdout.write(result.output);
  process.exitCode = result.exitCode;
}

module.exports = {
  buildDoctorReport,
  buildSelfImprovementPass,
  buildK7Tool,
  buildMarketAdaptationPack,
  buildMetaskillCard,
  buildToolMeshPack,
  buildReceiptTemplate,
  buildVersionPacket,
  formatK7ToolHelp,
  formatMarketAdaptationPack,
  formatMetaskillCard,
  formatToolMeshPack,
  formatDoctorReport,
  formatReceiptTemplate,
  formatSelfImprovementPass,
  formatVersionPacket,
  commandText,
  resolveCommandName,
  suggestCommandName,
  parseCommand,
  runK7ToolCommand,
};
