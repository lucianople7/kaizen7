const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  appendAgentMemory,
  buildAgentPacket,
  buildCompactPacket,
  formatAgentBrief,
} = require("../lib/agent-loop");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-agent-loop-"));
fs.mkdirSync(path.join(root, "Obsidian", "Flowmatik", "Kaizen7"), { recursive: true });
fs.mkdirSync(path.join(root, "Obsidian", "Flowmatik", "Arquitectura"), { recursive: true });
fs.mkdirSync(path.join(root, ".agents", "skills", "repo-hunter-github"), { recursive: true });
fs.mkdirSync(path.join(root, ".agents", "skills", "obsidian-memory"), { recursive: true });
fs.mkdirSync(path.join(root, "data"), { recursive: true });

fs.writeFileSync(path.join(root, "Obsidian", "Flowmatik", "Kaizen7", "semaforo.md"), [
  "# Semaforo",
  "THE FOCUX [AMARILLO]",
  "Bloqueado por: faltan fuentes fiables para contenido",
].join("\n"));

fs.writeFileSync(path.join(root, "Obsidian", "Flowmatik", "Arquitectura", "Hunter Memory.md"), [
  "# Hunter Memory",
  "Para mejorar sistema, Hunter usa memoria semantica, GitHub y Hugging Face para reducir tokens y evitar releer todo el vault.",
].join("\n"));

fs.writeFileSync(path.join(root, ".agents", "skills", "repo-hunter-github", "SKILL.md"), [
  "---",
  "name: repo-hunter-github",
  "description: Buscar repositorios de GitHub, Hugging Face, MCP, agentes y automatizacion; evaluar licencia y patrones.",
  "---",
].join("\n"));

fs.writeFileSync(path.join(root, ".agents", "skills", "obsidian-memory", "SKILL.md"), [
  "---",
  "name: obsidian-memory",
  "description: Consultar y escribir memoria Obsidian, decisiones y contexto persistente.",
  "---",
].join("\n"));

fs.writeFileSync(path.join(root, "data", "hunter-registry.json"), JSON.stringify({
  modules: {
    semantic_memory: {
      status: "approved_for_prototype",
      primary: {
        source: "huggingface",
        id: "BAAI/bge-m3",
        license: "mit",
        verdict: "adopt_now",
        reason: "Embeddings for memory",
      },
    },
    web_signal_ingestion: {
      status: "approved_for_prototype",
      primary: {
        source: "github",
        id: "unclecode/crawl4ai",
        license: "apache-2.0",
        verdict: "adopt_now",
        reason: "Clean source ingestion",
      },
    },
  },
}, null, 2));

const packet = buildAgentPacket({
  root,
  date: "2026-06-26",
  goal: "mejorar sistema",
});

assert.equal(packet.version, 1);
assert.equal(packet.date, "2026-06-26");
assert.equal(packet.goal, "mejorar sistema");
assert(packet.memory.signals.some((signal) => signal.includes("semaforo.md")));
assert(packet.memory.signals.some((signal) => signal.includes("semantic-index:")));
assert(packet.memory.matches.some((match) => match.relativePath.includes("Hunter Memory.md")));
assert(packet.contextQuery.includes("Hunter usa memoria semantica"), "agent loop should enrich routing with memory matches");
assert(packet.skills.length <= 3);
assert.equal(packet.skills[0].name, "repo-hunter-github");
assert.equal(packet.hunter.top.length, 2);
assert.equal(packet.hunter.top[0].candidate, "BAAI/bge-m3");
assert.deepEqual(packet.gates, [
  "memory_first",
  "metadata_before_deep_read",
  "hunter_top3_only",
  "judge_before_external_action",
  "write_memory_before_close",
]);
assert.equal(packet.nextAction.type, "prototype");
assert(packet.nextAction.title.includes("semantic_memory"));
assert(!JSON.stringify(packet).includes("Consultar y escribir memoria Obsidian, decisiones y contexto persistente.\n---"), "packet should not include full skill bodies");
assert(packet.tokenPolicy.includes("metadata first"));

const compact = buildCompactPacket(packet);
assert.deepEqual(Object.keys(compact), ["date", "goal", "memory", "skills", "hunter", "next"]);
assert.equal(compact.memory.length <= 3, true);
assert.equal(compact.skills[0], "repo-hunter-github");
assert.equal(compact.hunter[0], "semantic_memory:BAAI/bge-m3");

const brief = formatAgentBrief(packet);
assert(brief.includes("KAIZEN7 Agent Loop"));
assert(brief.includes("Next Action"));
assert(brief.includes("repo-hunter-github"));
assert(!brief.includes("contextQuery"), "human brief should avoid verbose internal context");

const memoryPath = appendAgentMemory(packet, root);
assert(memoryPath.endsWith(path.join("Obsidian", "Flowmatik", "Kaizen7", "2026-06-26.md")));
const memory = fs.readFileSync(memoryPath, "utf8");
assert(memory.includes("## Agent Loop"));
assert(memory.includes("semantic_memory: BAAI/bge-m3"));

console.log("agent loop tests passed");
