const METASKILLS = [
  {
    layer: "director",
    name: "kaizen7-metaskill",
    path: ".agents/skills/kaizen7-metaskill/SKILL.md",
    role: "Focus objective, choose route, enforce less steps/tokens, require receipt.",
    use_when: "Any broad KAIZEN7, THE FOCUX, Flowmatik, repo, memory, video or tool-routing task.",
  },
  {
    layer: "memory",
    name: "k7-hive-memory",
    path: ".agents/skills/k7-hive-memory/SKILL.md",
    role: "Read minimal canonical memory and write only reusable learning.",
    use_when: "A task needs prior decisions, project memory, Obsidian context or reusable learning.",
  },
  {
    layer: "operator_adapter_factory",
    name: "cli-anything-operator",
    path: ".agents/skills/cli-anything-operator/SKILL.md",
    role: "Turn external software without a clean API, MCP or CLI into a small agent-native executor route.",
    use_when: "A task needs desktop/pro software, render tools, local apps or repeatable tool execution and KAIZEN7 has no clean executor.",
  },
  {
    layer: "evolution",
    name: "kaizen7-evolution-engine",
    path: ".agents/skills/kaizen7-evolution-engine/SKILL.md",
    role: "Convert external tools, repos and ideas into small KAIZEN7 improvements.",
    use_when: "A repo, tool, framework, MCP, CLI, agent or pattern may improve the system.",
  },
  {
    layer: "repo_discovery",
    name: "repo-hunter-github",
    path: ".agents/skills/repo-hunter-github/SKILL.md",
    role: "Find mature repo patterns before building from scratch.",
    use_when: "A capability is missing and a proven open-source pattern may exist.",
  },
  {
    layer: "self_improvement",
    name: "k7-self-evolution-loop",
    path: ".agents/skills/k7-self-evolution-loop/SKILL.md",
    role: "Run KAIZEN7 against KAIZEN7, find friction, patch and verify.",
    use_when: "KAIZEN7 must improve itself with tests and evidence.",
  },
  {
    layer: "project_memory",
    name: "obsidian-memory",
    path: ".agents/skills/obsidian-memory/SKILL.md",
    role: "Preserve project decisions, hypotheses and notes in Obsidian.",
    use_when: "Work touches Flowmatik, THE FOCUX, research, SOPs, decisions or accumulated notes.",
  },
  {
    layer: "project_director",
    name: "flowmatik-master",
    path: ".agents/skills/flowmatik-master/SKILL.md",
    role: "Coordinate Flowmatik/THE FOCUX external production routes.",
    use_when: "The task coordinates external project production instead of KAIZEN7 kernel work.",
  },
];

function buildMetaskillsMap() {
  return {
    schema: "kaizen7.metaskills_map.v1",
    principle: "Skills do work. Metaskills decide how work should be focused, routed, learned, improved and handed off.",
    default_chain: [
      "kaizen7-metaskill",
      "k7-hive-memory",
      "existing skill or receipt",
      "cli-anything-operator when missing executor",
      "repo-hunter-github when missing pattern",
      "kaizen7-evolution-engine when adapting external patterns",
      "executor",
      "receipt",
      "memory",
    ],
    metaskills: METASKILLS,
    creation_rule: "If it only performs a task, it is a skill, not a metaskill.",
  };
}

function formatMetaskillsMap(map = buildMetaskillsMap()) {
  return [
    "# KAIZEN7 METASKILLS MAP",
    "",
    map.principle,
    "",
    "## Default Chain",
    map.default_chain.join(" -> "),
    "",
    "## Metaskills",
    ...map.metaskills.map((item) => [
      `- ${item.name} (${item.layer})`,
      `  - role: ${item.role}`,
      `  - use when: ${item.use_when}`,
      `  - file: ${item.path}`,
    ].join("\n")),
    "",
    "## Creation Rule",
    `- ${map.creation_rule}`,
    "",
  ].join("\n");
}

if (require.main === module) {
  const map = buildMetaskillsMap();
  if (process.argv.includes("--json")) process.stdout.write(`${JSON.stringify(map, null, 2)}\n`);
  else process.stdout.write(`${formatMetaskillsMap(map)}\n`);
}

module.exports = {
  METASKILLS,
  buildMetaskillsMap,
  formatMetaskillsMap,
};
