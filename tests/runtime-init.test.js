const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  initRuntime,
  runtimeFiles,
} = require("../lib/runtime-init");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-runtime-init-"));
const result = initRuntime({ root });

assert.equal(result.status, "ready");
assert.equal(result.created.length, runtimeFiles().length);
assert.equal(result.skipped.length, 0);

for (const file of runtimeFiles()) {
  const target = path.join(root, file.path);
  assert(fs.existsSync(target), `${file.path} should be created`);
  const json = JSON.parse(fs.readFileSync(target, "utf8"));
  if (Array.isArray(file.seed)) assert(Array.isArray(json));
  else assert.equal(json.version, 1);
}

const second = initRuntime({ root });
assert.equal(second.created.length, 0);
assert.equal(second.skipped.length, runtimeFiles().length);

console.log("runtime init tests passed");
