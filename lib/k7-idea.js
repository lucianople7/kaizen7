const fs = require("node:fs");
const path = require("node:path");

function ideaPath(root = process.cwd()) {
  return path.join(root, "docs", "KAIZEN7_IDEA.md");
}

function readIdea(root = process.cwd()) {
  return fs.readFileSync(ideaPath(root), "utf8");
}

if (require.main === module) {
  process.stdout.write(readIdea(process.cwd()));
}

module.exports = {
  ideaPath,
  readIdea,
};
