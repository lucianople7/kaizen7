const { buildMissionControl } = require("./mission-control");
const { buildAgentBrowser } = require("./agent-browser");

const DEFAULT_NOW_MISSION = {
  goal: "Definir y publicar KAIZEN7 como producto kernel para agentes.",
  why: "KAIZEN7 necesita una superficie clara, ejecutable y verificable antes de coordinar proyectos externos.",
  project: "KAIZEN7",
  route: "mission_brief",
  capability: "kernel.mission_brief_generator",
  context_files: [
    "KAIZEN7_CONTEXT.md",
    "docs/PRODUCT.md",
    "docs/PROJECT_STRUCTURE.md",
    "docs/REPOSITORIES.md",
  ],
  constraints: [
    "No publicar automaticamente.",
    "No mezclar implementacion de THE FOCUX, Flowmatik o Mr. Kaizen.",
    "No tocar credenciales, billing, deploys o repos externos.",
  ],
  acceptance_tests: [
    "KAIZEN7 queda definido como producto en README y docs/PRODUCT.md.",
    "Los entrypoints documentados existen o el bloqueo queda visible.",
    "El repo conserva frontera clara entre kernel y proyectos externos.",
  ],
  risks: [
    "Scope creep hacia proyectos externos.",
    "Documentar comandos que no ejecutan.",
  ],
  expected_output: [
    "Definicion de producto KAIZEN7.",
    "Entrypoints conectados.",
    "Checklist de separacion de repos.",
    "Mission Outcome Receipt.",
  ],
  priority: "P1 - high",
  estimated_scope: "S",
};

function parseArgs(argv = []) {
  const flags = new Set();
  const goalParts = [];
  let project = "";

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--project") project = argv[++index] || "";
    else if (arg.startsWith("--")) flags.add(arg);
    else goalParts.push(arg);
  }

  const customGoal = goalParts.join(" ").trim();
  return {
    flags,
    mission: customGoal
      ? {
        ...DEFAULT_NOW_MISSION,
        goal: customGoal,
        project: project || DEFAULT_NOW_MISSION.project,
      }
      : DEFAULT_NOW_MISSION,
  };
}

function buildNowCard(mission = DEFAULT_NOW_MISSION) {
  const control = buildMissionControl(mission);
  const browser = buildAgentBrowser(process.cwd());
  return {
    schema: "kaizen7.now_card.v1",
    question: "What can we launch today that grows the ecosystem?",
    agent_browser: {
      entrypoint: browser.current_entrypoint,
      repo_counts: browser.counts,
      rules: browser.agent_rules,
    },
    mission: control.mission,
    growth_gate: control.growth_gate,
    route: control.mission_brief.route || control.mission_brief.capability,
    files_to_read: control.mission_brief.files_to_read,
    constraints: control.mission_brief.constraints,
    acceptance_tests: control.mission_brief.acceptance_tests,
    stop_conditions: control.mission_brief.stop_conditions,
    next_action: control.next_action,
    close_with: "Mission Outcome Receipt",
  };
}

function formatNowCard(card) {
  return [
    "# KAIZEN7 NOW",
    "",
    "Human decides. KAIZEN7 coordinates. Agents execute. Projects grow.",
    "",
    `Pregunta: ${card.question}`,
    "",
    `Lanzar ahora: ${card.mission.goal}`,
    `Por que importa: ${card.mission.why || "Debe producir crecimiento visible."}`,
    "",
    `Growth lane: ${card.growth_gate.lane}`,
    `Growth output: ${card.growth_gate.output}`,
    `Route: ${card.route}`,
    `Next action: ${card.next_action}`,
    "",
    "## Leer Solo Esto",
    ...card.files_to_read.map((file) => `- ${file}`),
    "",
    "## Agent Browser",
    `- entrypoint: ${card.agent_browser.entrypoint}`,
    `- docs: ${card.agent_browser.repo_counts.docs}`,
    `- tests: ${card.agent_browser.repo_counts.tests}`,
    `- routes: ${card.agent_browser.repo_counts.routes || card.agent_browser.repo_counts.capabilities}`,
    ...card.agent_browser.rules.slice(0, 3).map((rule) => `- ${rule}`),
    "",
    "## Reglas",
    ...card.constraints.map((item) => `- ${item}`),
    "",
    "## Exito",
    ...card.acceptance_tests.map((item) => `- ${item}`),
    "",
    "## Parar Si",
    ...card.stop_conditions.map((item) => `- ${item}`),
    "",
    "## Cierre",
    `- ${card.close_with}`,
    "",
  ].join("\n");
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const card = buildNowCard(args.mission);
  if (args.flags.has("--json")) process.stdout.write(`${JSON.stringify(card, null, 2)}\n`);
  else process.stdout.write(`${formatNowCard(card)}\n`);
}

module.exports = {
  DEFAULT_NOW_MISSION,
  buildNowCard,
  formatNowCard,
  parseArgs,
};
