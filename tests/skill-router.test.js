const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  buildSkillBrief,
  indexSkills,
  recommendSkills,
} = require("../lib/skill-router");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-skill-router-"));
const skillsRoot = path.join(root, ".agents", "skills");
fs.mkdirSync(path.join(skillsRoot, "repo-hunter-github"), { recursive: true });
fs.mkdirSync(path.join(skillsRoot, "obsidian-memory"), { recursive: true });
fs.mkdirSync(path.join(skillsRoot, "flowmatik-master"), { recursive: true });
fs.mkdirSync(path.join(skillsRoot, "k7-self-evolution-loop"), { recursive: true });
const codexSkillsRoot = path.join(root, ".codex", "skills");
fs.mkdirSync(path.join(codexSkillsRoot, "repo-hunter-github"), { recursive: true });

fs.writeFileSync(path.join(skillsRoot, "repo-hunter-github", "SKILL.md"), [
  "---",
  "name: repo-hunter-github",
  "description: Buscar repositorios de GitHub, evaluar licencia, madurez, patrones, MCP, agentes y automatizacion.",
  "---",
  "# Repo Hunter",
].join("\n"));

fs.writeFileSync(path.join(codexSkillsRoot, "repo-hunter-github", "SKILL.md"), [
  "---",
  "name: repo-hunter-github",
  "description: Duplicate lower-priority copy.",
  "---",
  "# Repo Hunter Duplicate",
].join("\n"));

fs.writeFileSync(path.join(skillsRoot, "obsidian-memory", "SKILL.md"), [
  "---",
  "name: obsidian-memory",
  "description: Leer y escribir memoria operativa en Obsidian con decisiones y contexto persistente.",
  "---",
  "# Obsidian Memory",
].join("\n"));

fs.writeFileSync(path.join(skillsRoot, "flowmatik-master", "SKILL.md"), [
  "---",
  "name: flowmatik-master",
  "description: Direccion operativa para Flowmatik, THE FOCUX, contenido, negocio digital y SOPs.",
  "---",
  "# Flowmatik",
].join("\n"));

fs.writeFileSync(path.join(skillsRoot, "k7-self-evolution-loop", "SKILL.md"), [
  "---",
  "name: k7-self-evolution-loop",
  "description: Use when KAIZEN7 must evaluate itself, run KAIZEN7 against KAIZEN7, repeat self-improvement passes, detect friction, write tests, patch the project, verify and record learning.",
  "---",
  "# K7 Self Evolution Loop",
].join("\n"));

const skills = indexSkills({ roots: [skillsRoot, codexSkillsRoot] });
assert.equal(skills.length, 4);
assert(skills.every((skill) => skill.path.endsWith("SKILL.md")));
assert.equal(skills.filter((skill) => skill.name === "repo-hunter-github").length, 1, "duplicate skill names should be deduped");

const repoPlan = recommendSkills("buscar repositorios GitHub MCP agentes y evaluar licencia", skills, { limit: 2 });
assert.equal(repoPlan[0].name, "repo-hunter-github");
assert(repoPlan[0].score > repoPlan[1].score);

const memoryPlan = recommendSkills("guardar decision y contexto persistente en Obsidian", skills, { limit: 2 });
assert.equal(memoryPlan[0].name, "obsidian-memory");

const selfPlan = recommendSkills("KAIZEN7 contra KAIZEN7 autoevaluarse automejorarse cinco pasadas", skills, { limit: 2 });
assert.equal(selfPlan[0].name, "k7-self-evolution-loop");

const brief = buildSkillBrief(repoPlan);
assert(brief.includes("repo-hunter-github"));
assert(brief.includes("score"));
assert(!brief.includes("# Repo Hunter"), "brief should stay metadata-only and avoid loading full skill bodies");

console.log("skill router tests passed");
