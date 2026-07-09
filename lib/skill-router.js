const fs = require("node:fs");
const path = require("node:path");

function parseFrontmatter(markdown) {
  if (!markdown.startsWith("---")) return {};
  const end = markdown.indexOf("\n---", 3);
  if (end === -1) return {};
  const body = markdown.slice(3, end).trim();
  const data = {};
  for (const line of body.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match) data[match[1]] = match[2].trim();
  }
  return data;
}

function readSkillMetadata(skillPath) {
  const markdown = fs.readFileSync(skillPath, "utf8");
  const meta = parseFrontmatter(markdown);
  const name = meta.name || path.basename(path.dirname(skillPath));
  return {
    name,
    description: meta.description || "",
    path: skillPath,
    tokens: tokenize(`${name} ${meta.description || ""}`),
  };
}

function indexSkills(options = {}) {
  const roots = options.roots || [
    path.join(process.cwd(), ".agents", "skills"),
    path.join(process.cwd(), ".codex", "skills"),
  ];
  const skills = [];
  const seen = new Set();
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const skillPath = path.join(root, entry.name, "SKILL.md");
      if (!fs.existsSync(skillPath)) continue;
      const skill = readSkillMetadata(skillPath);
      if (seen.has(skill.name)) continue;
      seen.add(skill.name);
      skills.push(skill);
    }
  }
  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

function tokenize(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function scoreSkill(queryTokens, skill) {
  const skillTokens = new Set(skill.tokens);
  let score = 0;
  for (const token of queryTokens) {
    if (skillTokens.has(token)) score += 10;
    for (const skillToken of skillTokens) {
      if (token.length >= 4 && skillToken.includes(token)) score += 2;
      if (skillToken.length >= 4 && token.includes(skillToken)) score += 2;
    }
  }
  return score;
}

function recommendSkills(query, skills = indexSkills(), options = {}) {
  const limit = options.limit || 3;
  const queryTokens = tokenize(query);
  return skills
    .map((skill) => ({ ...skill, score: scoreSkill(queryTokens, skill) }))
    .filter((skill) => skill.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);
}

function buildSkillBrief(skills) {
  if (!skills.length) return "No skill match found.";
  return skills.map((skill, index) => [
    `${index + 1}. ${skill.name}`,
    `score: ${skill.score}`,
    `path: ${skill.path}`,
    `why: ${skill.description}`,
  ].join("\n")).join("\n\n");
}

if (require.main === module) {
  const query = process.argv.slice(2).join(" ") || "hunter daily improvement";
  const recommendations = recommendSkills(query);
  process.stdout.write(`${buildSkillBrief(recommendations)}\n`);
}

module.exports = {
  buildSkillBrief,
  indexSkills,
  parseFrontmatter,
  recommendSkills,
  tokenize,
};
