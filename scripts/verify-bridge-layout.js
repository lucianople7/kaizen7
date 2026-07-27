const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const workspaces = [
  ["packages", "bridge-protocol", "@kaizen7/bridge-protocol"],
  ["packages", "authority", "@kaizen7/authority"],
  ["apps", "bridge-gateway", "@kaizen7/bridge-gateway"],
  ["apps", "local-bridge", "@kaizen7/local-bridge"],
];

function fail(message) {
  console.error(message);
  process.exit(1);
}

function readJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    fail(`Missing path: ${relativePath}`);
  }

  try {
    return JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch (error) {
    fail(`Invalid JSON: ${relativePath}`);
  }
}

const rootPackage = readJson("package.json");

if (rootPackage.type === "module") {
  fail("Root package must remain CommonJS");
}

for (const workspace of ["apps/*", "packages/*"]) {
  if (!rootPackage.workspaces || !rootPackage.workspaces.includes(workspace)) {
    fail(`Missing workspace declaration: ${workspace}`);
  }
}

for (const [group, directory, expectedName] of workspaces) {
  const relativeDir = path.join(group, directory);
  if (!fs.existsSync(path.join(root, relativeDir))) {
    fail(`Missing path: ${relativeDir}`);
  }

  const manifestPath = path.join(relativeDir, "package.json");
  const manifest = readJson(manifestPath);

  if (manifest.name !== expectedName) {
    fail(`Invalid package name: ${manifestPath}`);
  }

  if (manifest.private !== true) {
    fail(`Workspace must be private: ${manifestPath}`);
  }

  if (manifest.engines?.node !== ">=22 <23") {
    fail(`Workspace must require Node 22: ${manifestPath}`);
  }

  if (!manifest.scripts?.typecheck || !manifest.scripts?.test) {
    fail(`Workspace missing typecheck/test scripts: ${manifestPath}`);
  }
}

console.log("KAIZEN7 Live Bridge layout: valid");
