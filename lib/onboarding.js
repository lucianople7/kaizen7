const { buildConnectorKernel } = require("./connector-kernel");

const PRESETS = [
  {
    id: "codex",
    project: "Codex",
    kind: "agent",
    domain: "coding",
    capabilities: ["read_files", "edit_files", "run_tests"],
    goal: "mejorar codigo con tests y verificacion",
  },
  {
    id: "flowmatik",
    project: "Flowmatik",
    kind: "project",
    domain: "automation",
    capabilities: ["read_files", "edit_files", "run_tests"],
    goal: "orquestar automatizaciones, contenido y memoria",
  },
  {
    id: "defocus",
    project: "DeFocus",
    kind: "agent",
    domain: "focus",
    capabilities: ["read_files", "run_tests"],
    goal: "mejorar foco operativo con memoria y acciones minimas",
  },
  {
    id: "social",
    project: "Social",
    kind: "workflow",
    domain: "social",
    capabilities: ["read_files"],
    goal: "crear contenido para redes con aprobacion antes de publicar",
  },
  {
    id: "commerce",
    project: "Commerce",
    kind: "workflow",
    domain: "commerce",
    capabilities: ["read_files"],
    goal: "mejorar ecommerce, producto, proveedores y Shopify",
  },
  {
    id: "research",
    project: "Research",
    kind: "workflow",
    domain: "research",
    capabilities: ["read_files"],
    goal: "buscar repos, papers, modelos y señales actuales",
  },
  {
    id: "memory",
    project: "Memory",
    kind: "workflow",
    domain: "memory",
    capabilities: ["read_files"],
    goal: "recuperar contexto y escribir aprendizaje verificable",
  },
];

function listPresets() {
  return PRESETS.map((preset) => ({ ...preset, capabilities: [...preset.capabilities] }));
}

function presetById(id = "") {
  return listPresets().find((preset) => preset.id === String(id).toLowerCase());
}

function buildOnboarding(options = {}) {
  const connectorBuilder = options.connector || buildConnectorKernel;
  const preset = presetById(options.preset) || {
    id: "custom",
    project: "Custom",
    kind: options.kind || "project",
    domain: options.domain || "general",
    capabilities: Array.isArray(options.capabilities) ? options.capabilities : [],
    goal: "connect custom system to KAIZEN7",
  };
  const goal = String(options.goal || preset.goal).trim() || preset.goal;
  const connection = connectorBuilder({
    root: options.root || process.cwd(),
    project: options.project || preset.project,
    kind: options.kind || preset.kind,
    domain: options.domain || preset.domain,
    capabilities: options.capabilities?.length ? options.capabilities : preset.capabilities,
    goal,
  });

  return {
    version: 1,
    status: connection.status,
    mode: "onboarding",
    preset,
    goal,
    connection,
    commands: [
      `npm.cmd run k7:onboard -- --preset ${preset.id} "${goal}"`,
      ...connection.commands,
    ],
    next: `Run the first command, inspect approval gates, then execute only the verified next action.`,
  };
}

function parseArgs(argv = []) {
  const flags = new Set();
  const capabilities = [];
  const goalParts = [];
  let preset = "codex";
  let project = "";
  let kind = "";
  let domain = "";
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--preset") preset = argv[++index] || preset;
    else if (arg === "--project") project = argv[++index] || "";
    else if (arg === "--kind") kind = argv[++index] || "";
    else if (arg === "--domain") domain = argv[++index] || "";
    else if (arg === "--capability") capabilities.push(argv[++index] || "");
    else if (arg.startsWith("--")) flags.add(arg);
    else goalParts.push(arg);
  }
  return {
    json: flags.has("--json"),
    compact: flags.has("--compact"),
    list: flags.has("--list"),
    preset,
    project,
    kind,
    domain,
    capabilities: capabilities.filter(Boolean),
    goal: goalParts.join(" ").trim(),
  };
}

function formatList(items, fallback = "- none") {
  return items?.length ? items.map((item) => `- ${typeof item === "string" ? item : JSON.stringify(item)}`) : [fallback];
}

function formatOnboarding(result) {
  return [
    "## KAIZEN7 Onboarding",
    "",
    `Status: ${result.status}`,
    `Preset: ${result.preset.id}`,
    `Project: ${result.connection.profile.name}`,
    `Route: ${result.connection.route.name}`,
    `Goal: ${result.goal}`,
    "",
    "### Metaskills",
    ...formatList(result.connection.metaskills),
    "",
    "### Connectors",
    ...formatList(result.connection.connectors?.map((connector) => `${connector.name}: ${connector.command}`)),
    "",
    "### Approval Gates",
    ...formatList(result.connection.approvalGates),
    "",
    "### Commands",
    ...formatList(result.commands),
    "",
    "### Next",
    result.next,
    "",
  ].join("\n");
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  if (args.list) {
    process.stdout.write(`${JSON.stringify({ presets: listPresets() }, null, 2)}\n`);
  } else {
    const result = buildOnboarding(args);
    if (args.compact) {
      process.stdout.write(`${JSON.stringify({
        status: result.status,
        preset: result.preset.id,
        route: result.connection.route,
        next: result.next,
        commands: result.commands,
      }, null, 2)}\n`);
    } else if (args.json) {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    } else {
      process.stdout.write(`${formatOnboarding(result)}\n`);
    }
  }
}

module.exports = {
  buildOnboarding,
  formatOnboarding,
  listPresets,
  parseArgs,
};
