const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");

const result = spawnSync(process.execPath, ["scripts/verify-bridge-layout.js"], {
  cwd: process.cwd(),
  encoding: "utf8",
});

assert.equal(result.status, 0, result.stderr);
assert.match(result.stdout, /KAIZEN7 Live Bridge layout: valid/);
console.log("bridge layout tests passed");
