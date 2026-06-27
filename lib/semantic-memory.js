const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_INCLUDE = ["Obsidian"];
const DEFAULT_INDEX_PATH = path.join(__dirname, "..", "data", "semantic-memory.json");
const STOPWORDS = new Set([
  "para", "como", "con", "que", "una", "uno", "por", "los", "las", "del", "the", "and", "for", "sin",
]);

function tokenize(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

function walkMarkdown(root, relativeDir, files = []) {
  const absoluteDir = path.join(root, relativeDir);
  if (!fs.existsSync(absoluteDir)) return files;
  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    const relativePath = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) walkMarkdown(root, relativePath, files);
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".md")) files.push(relativePath);
  }
  return files;
}

function compactText(markdown, maxChars = 420) {
  return markdown
    .replace(/^---[\s\S]*?---/m, "")
    .replace(/```[\s\S]*?```/g, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ")
    .slice(0, maxChars);
}

function buildMemoryIndex(options = {}) {
  const root = options.root || process.cwd();
  const include = options.include || DEFAULT_INCLUDE;
  const documents = [];
  for (const relativeDir of include) {
    for (const relativePath of walkMarkdown(root, relativeDir)) {
      const absolutePath = path.join(root, relativePath);
      const stat = fs.statSync(absolutePath);
      const text = compactText(fs.readFileSync(absolutePath, "utf8"));
      const tokens = tokenize(`${relativePath} ${text}`);
      documents.push({
        relativePath,
        mtimeMs: stat.mtimeMs,
        size: stat.size,
        text,
        tokens,
      });
    }
  }
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    include,
    root,
    documents,
  };
}

function saveMemoryIndex(index, indexPath = DEFAULT_INDEX_PATH) {
  fs.mkdirSync(path.dirname(indexPath), { recursive: true });
  fs.writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);
  return indexPath;
}

function loadMemoryIndex(indexPath = DEFAULT_INDEX_PATH) {
  return JSON.parse(fs.readFileSync(indexPath, "utf8"));
}

function isIndexFresh(index, options = {}) {
  const root = options.root || index.root || process.cwd();
  for (const doc of index.documents || []) {
    const absolutePath = path.join(root, doc.relativePath);
    if (!fs.existsSync(absolutePath)) return false;
    const stat = fs.statSync(absolutePath);
    if (stat.size !== doc.size) return false;
    if (Math.abs(stat.mtimeMs - doc.mtimeMs) > 1) return false;
  }
  const include = index.include || DEFAULT_INCLUDE;
  const currentFiles = include.flatMap((relativeDir) => walkMarkdown(root, relativeDir)).sort();
  const indexedFiles = (index.documents || []).map((doc) => doc.relativePath).sort();
  if (currentFiles.length !== indexedFiles.length) return false;
  return currentFiles.every((file, indexAt) => file === indexedFiles[indexAt]);
}

function ensureMemoryIndex(options = {}) {
  const root = options.root || process.cwd();
  const include = options.include || DEFAULT_INCLUDE;
  const indexPath = options.indexPath || DEFAULT_INDEX_PATH;
  if (fs.existsSync(indexPath)) {
    const index = loadMemoryIndex(indexPath);
    if (isIndexFresh(index, { root })) return { index, fresh: true, indexPath };
  }
  const index = buildMemoryIndex({ root, include });
  saveMemoryIndex(index, indexPath);
  return { index, fresh: false, indexPath };
}

function scoreDocument(queryTokens, doc) {
  const tokenSet = new Set(doc.tokens);
  let score = 0;
  for (const token of queryTokens) {
    if (tokenSet.has(token)) score += 10;
    for (const docToken of tokenSet) {
      if (token.length >= 5 && docToken.includes(token)) score += 2;
      if (docToken.length >= 5 && token.includes(docToken)) score += 2;
    }
  }
  return score;
}

function searchMemory(query, index = buildMemoryIndex(), options = {}) {
  const limit = options.limit || 3;
  const queryTokens = tokenize(query);
  if (!queryTokens.length) return [];
  return index.documents
    .map((doc) => ({
      relativePath: doc.relativePath,
      score: scoreDocument(queryTokens, doc),
      snippet: doc.text,
    }))
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score || a.relativePath.localeCompare(b.relativePath))
    .slice(0, limit);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const shouldReindex = args.includes("--reindex");
  const query = args.filter((arg) => arg !== "--reindex").join(" ");
  const { index, fresh, indexPath } = shouldReindex
    ? { index: buildMemoryIndex(), fresh: false, indexPath: DEFAULT_INDEX_PATH }
    : ensureMemoryIndex();
  if (shouldReindex) saveMemoryIndex(index, indexPath);
  const results = query ? searchMemory(query, index) : [];
  process.stdout.write(`${JSON.stringify({ fresh, indexPath, results }, null, 2)}\n`);
}

module.exports = {
  buildMemoryIndex,
  ensureMemoryIndex,
  isIndexFresh,
  loadMemoryIndex,
  saveMemoryIndex,
  searchMemory,
  tokenize,
};
