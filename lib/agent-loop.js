const fs = require("node:fs");
const path = require("node:path");
const { buildImplementationQueue, loadHunterRegistry } = require("./hunter");
const { ensureMemoryIndex, searchMemory } = require("./semantic-memory");
const { indexSkills, recommendSkills } = require("./skill-router");

const GATES = [
  "memory_first",
  "metadata_before_deep_read",
  "hunter_top3_only",
  "judge_before_external_action",
  "write_memory_before_close",
];

function readIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function compactMemory(root, query = "") {
  const semaforoPath = path.join("Obsidian", "Flowmatik", "Kaizen7", "semaforo.md");
  const manualPath = path.join("Obsidian", "Flowmatik", "Kaizen7", "KAIZEN7 OPERATING MANUAL.md");
  const signals = [];
  const blockers = [];
  const semaforo = readIfExists(path.join(root, semaforoPath));
  const manual = readIfExists(path.join(root, manualPath));
  if (semaforo) {
    signals.push(`read:${semaforoPath}`);
    for (const line of semaforo.split(/\r?\n/)) {
      if (/bloque|pendiente|amarillo|rojo/i.test(line)) blockers.push(line.trim());
    }
  } else {
    signals.push(`missing:${semaforoPath}`);
  }
  if (manual) signals.push(`read:${manualPath}`);
  let matches = [];
  if (query) {
    const memoryIndex = ensureMemoryIndex({ root, include: ["Obsidian"] });
    signals.push(`semantic-index:${memoryIndex.fresh ? "fresh" : "rebuilt"}`);
    matches = searchMemory(query, memoryIndex.index, { limit: 3 });
  }
  return {
    signals,
    blockers: blockers.slice(0, 5),
    matches,
  };
}

function loadHunterTop(root) {
  const registryPath = path.join(root, "data", "hunter-registry.json");
  if (!fs.existsSync(registryPath)) return [];
  const registry = loadHunterRegistry(registryPath);
  return buildImplementationQueue(registry, { limit: 3 }).filter((item) => !item.blocked);
}

function nextActionFrom(hunterTop, skills) {
  const top = hunterTop[0];
  if (top) {
    return {
      type: top.nextStep,
      title: `${top.module}: ${top.candidate}`,
      candidate: top.candidate,
      module: top.module,
      output: top.output,
    };
  }
  const skill = skills[0];
  if (skill) {
    return {
      type: "skill_route",
      title: `Use ${skill.name}`,
      skill: skill.name,
      output: "read selected skill fully, then act",
    };
  }
  return {
    type: "memory_review",
    title: "Clarify next action from memory",
    output: "write one decision or blocker",
  };
}

function buildContextQuery(goal, memory) {
  const memoryText = (memory.matches || [])
    .map((match) => match.snippet)
    .join(" ");
  const blockers = (memory.blockers || []).join(" ");
  return [goal, memoryText, blockers].filter(Boolean).join(" ").slice(0, 1200);
}

function buildAgentPacket(options = {}) {
  const root = options.root || process.cwd();
  const date = options.date || new Date().toISOString().slice(0, 10);
  const goal = options.goal || "improve KAIZEN7 with less friction";
  const memory = compactMemory(root, goal);
  const contextQuery = buildContextQuery(goal, memory);
  const skills = recommendSkills(contextQuery, indexSkills({
    roots: [
      path.join(root, ".agents", "skills"),
      path.join(root, ".codex", "skills"),
    ],
  }), { limit: 3 }).map((skill) => ({
    name: skill.name,
    score: skill.score,
    path: skill.path,
    why: skill.description,
  }));
  const hunterTop = loadHunterTop(root).map((item) => ({
    module: item.module,
    candidate: item.candidate,
    source: item.source,
    verdict: item.verdict,
    nextStep: item.nextStep,
    output: item.output,
    score: item.score,
  }));
  return {
    version: 1,
    date,
    goal,
    contextQuery,
    memory,
    skills,
    hunter: {
      top: hunterTop,
      policy: "top 3 only; blocked and reference-only items stay out of working context",
    },
    gates: GATES,
    nextAction: nextActionFrom(hunterTop, skills),
    tokenPolicy: "metadata first; deep-read only selected skills, top Hunter candidates and cited memory files",
  };
}

function buildCompactPacket(packet) {
  return {
    date: packet.date,
    goal: packet.goal,
    memory: (packet.memory.matches || []).slice(0, 3).map((match) => match.relativePath),
    skills: (packet.skills || []).map((skill) => skill.name),
    hunter: (packet.hunter.top || []).map((item) => `${item.module}:${item.candidate}`),
    next: packet.nextAction.title,
  };
}

function formatAgentBrief(packet) {
  const memory = (packet.memory.matches || []).length
    ? packet.memory.matches.map((match) => `- ${match.relativePath} (${match.score})`).join("\n")
    : "- none";
  const skills = (packet.skills || []).length
    ? packet.skills.map((skill) => `- ${skill.name} (${skill.score})`).join("\n")
    : "- none";
  const hunter = (packet.hunter.top || []).length
    ? packet.hunter.top.map((item) => `- ${item.module}: ${item.candidate} (${item.verdict})`).join("\n")
    : "- none";
  const blockers = (packet.memory.blockers || []).length
    ? packet.memory.blockers.map((blocker) => `- ${blocker}`).join("\n")
    : "- none";
  return [
    "## KAIZEN7 Agent Loop",
    "",
    `Goal: ${packet.goal}`,
    `Date: ${packet.date}`,
    "",
    "### Memory",
    memory,
    "",
    "### Skills",
    skills,
    "",
    "### Hunter",
    hunter,
    "",
    "### Blockers",
    blockers,
    "",
    "### Next Action",
    `${packet.nextAction.type}: ${packet.nextAction.title}`,
    "",
    "### Token Policy",
    packet.tokenPolicy,
    "",
  ].join("\n");
}

function buildAgentMemory(packet) {
  return [
    "## Agent Loop",
    "",
    `### Fecha`,
    "",
    packet.date,
    "",
    "### Objetivo",
    "",
    packet.goal,
    "",
    "### Memoria usada",
    "",
    ...((packet.memory.matches || []).length
      ? packet.memory.matches.map((match) => `- ${match.relativePath} (${match.score})`)
      : ["- none"]),
    "",
    "### Skills",
    "",
    ...((packet.skills || []).length ? packet.skills.map((skill) => `- ${skill.name}`) : ["- none"]),
    "",
    "### Hunter",
    "",
    ...((packet.hunter.top || []).length
      ? packet.hunter.top.map((item) => `- ${item.module}: ${item.candidate}`)
      : ["- none"]),
    "",
    "### Next Action",
    "",
    `${packet.nextAction.type}: ${packet.nextAction.title}`,
    "",
  ].join("\n");
}

function appendAgentMemory(packet, root = process.cwd()) {
  const dailyPath = path.join(root, "Obsidian", "Flowmatik", "Kaizen7", `${packet.date}.md`);
  fs.mkdirSync(path.dirname(dailyPath), { recursive: true });
  fs.appendFileSync(dailyPath, `\n${buildAgentMemory(packet)}\n`);
  return dailyPath;
}

function parseCliArgs(argv) {
  const flags = new Set(argv.filter((arg) => arg.startsWith("--")));
  const goal = argv.filter((arg) => !arg.startsWith("--")).join(" ");
  return { flags, goal };
}

if (require.main === module) {
  const { flags, goal } = parseCliArgs(process.argv.slice(2));
  const packet = buildAgentPacket({ goal });
  if (flags.has("--write-memory")) appendAgentMemory(packet);
  if (flags.has("--compact")) process.stdout.write(`${JSON.stringify(buildCompactPacket(packet), null, 2)}\n`);
  else if (flags.has("--json")) process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
  else process.stdout.write(`${formatAgentBrief(packet)}\n`);
}

module.exports = {
  appendAgentMemory,
  buildAgentPacket,
  buildContextQuery,
  buildCompactPacket,
  formatAgentBrief,
  compactMemory,
};
