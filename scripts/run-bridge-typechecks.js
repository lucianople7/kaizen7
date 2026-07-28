const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const root = process.cwd();

const implementedWorkspaces = [
  {
    name: "@kaizen7/bridge-protocol",
    directory: path.join("packages", "bridge-protocol"),
  },
  {
    name: "@kaizen7/local-bridge",
    directory: path.join("apps", "local-bridge"),
  },
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

for (const workspace of implementedWorkspaces) {
  const manifestPath = path.join(workspace.directory, "package.json");
  const tsconfigPath = path.join(workspace.directory, "tsconfig.json");
  const manifest = readJson(manifestPath);

  if (manifest.name !== workspace.name) {
    fail(`Workspace manifest mismatch: ${manifestPath}`);
  }

  if (!fs.existsSync(path.join(root, tsconfigPath))) {
    fail(`Implemented workspace missing tsconfig: ${tsconfigPath}`);
  }

  if (manifest.scripts?.typecheck !== "tsc --noEmit -p tsconfig.json") {
    fail(`Implemented workspace missing expected typecheck script: ${manifestPath}`);
  }

  const result = spawnSync("npm.cmd", ["run", "typecheck", "-w", workspace.name], {
    cwd: root,
    env: process.env,
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  if (result.error) {
    fail(`Failed to run typecheck for ${workspace.name}: ${result.error.message}`);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`KAIZEN7 Live Bridge typecheck: ${implementedWorkspaces.length} workspace(s) verified`);
