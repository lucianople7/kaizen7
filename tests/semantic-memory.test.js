const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  buildMemoryIndex,
  ensureMemoryIndex,
  isIndexFresh,
  loadMemoryIndex,
  saveMemoryIndex,
  searchMemory,
  tokenize,
} = require("../lib/semantic-memory");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-semantic-memory-"));
fs.mkdirSync(path.join(root, "Obsidian", "Flowmatik", "Arquitectura"), { recursive: true });
fs.mkdirSync(path.join(root, "Obsidian", "TheFocux", "Regulacion"), { recursive: true });

fs.writeFileSync(path.join(root, "Obsidian", "Flowmatik", "Arquitectura", "Hunter.md"), [
  "# Hunter",
  "",
  "Hunter busca GitHub y Hugging Face para mejorar KAIZEN7 cada dia.",
  "Debe priorizar memoria, actualizacion, evaluacion y menos tokens.",
].join("\n"));

fs.writeFileSync(path.join(root, "Obsidian", "TheFocux", "Regulacion", "Claims.md"), [
  "# Claims",
  "",
  "THE FOCUX no publica claims medicos sin evidencia y revision regulatoria.",
  "K7 Judge bloquea promesas sensibles antes de publicar.",
].join("\n"));

assert.deepEqual(tokenize("Memória, actualización y TOKENS"), ["memoria", "actualizacion", "tokens"]);

const index = buildMemoryIndex({
  root,
  include: ["Obsidian"],
});
assert.equal(index.documents.length, 2);
assert(index.documents.every((doc) => doc.relativePath.endsWith(".md")));
assert(index.documents.every((doc) => doc.text.length < 500), "index should keep compact text snippets");

const hunterResults = searchMemory("mejorar hunter github hugging face menos tokens", index, { limit: 2 });
assert.equal(hunterResults[0].relativePath, path.join("Obsidian", "Flowmatik", "Arquitectura", "Hunter.md"));
assert(hunterResults[0].score > 0);
assert(hunterResults[0].snippet.includes("Hunter busca GitHub"));

const claimsResults = searchMemory("claims medicos evidencia regulatoria publicar", index, { limit: 1 });
assert.equal(claimsResults[0].relativePath, path.join("Obsidian", "TheFocux", "Regulacion", "Claims.md"));

const emptyResults = searchMemory("zzzz palabra inexistente", index, { limit: 3 });
assert.equal(emptyResults.length, 0);

const indexPath = path.join(root, "data", "semantic-memory.json");
saveMemoryIndex(index, indexPath);
assert(fs.existsSync(indexPath), "persistent memory index should be written");
const loaded = loadMemoryIndex(indexPath);
assert.equal(loaded.documents.length, 2);
assert.equal(isIndexFresh(loaded, { root }), true);

fs.writeFileSync(path.join(root, "Obsidian", "Flowmatik", "Arquitectura", "Hunter.md"), [
  "# Hunter",
  "",
  "Hunter actualizado con memoria persistente y freshness.",
].join("\n"));
assert.equal(isIndexFresh(loaded, { root }), false, "modified source file should mark index stale");

const refreshed = ensureMemoryIndex({ root, include: ["Obsidian"], indexPath });
assert.equal(refreshed.fresh, false);
assert(refreshed.index.documents.some((doc) => doc.text.includes("memoria persistente")));
const secondLoad = ensureMemoryIndex({ root, include: ["Obsidian"], indexPath });
assert.equal(secondLoad.fresh, true);

console.log("semantic memory tests passed");
