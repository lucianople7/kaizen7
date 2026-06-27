const assert = require("node:assert/strict");
const {
  buildOnboarding,
  listPresets,
  parseArgs,
} = require("../lib/onboarding");

const presets = listPresets();
assert(presets.some((preset) => preset.id === "codex"));
assert(presets.some((preset) => preset.id === "flowmatik"));
assert(presets.some((preset) => preset.id === "social"));
assert(presets.some((preset) => preset.id === "commerce"));

const codex = buildOnboarding({
  preset: "codex",
  goal: "mejorar KAIZEN7 con tests",
  connector: () => ({
    status: "ready",
    mode: "connector-kernel",
    profile: { name: "Codex", kind: "agent" },
    route: { name: "code" },
    metaskills: ["test-driven-development", "repo-hunter-github"],
    connectors: [{ id: "github", name: "GitHub" }],
    commands: ["npm.cmd run check"],
    approvalGates: ["No deploy without approval"],
  }),
});

assert.equal(codex.status, "ready");
assert.equal(codex.mode, "onboarding");
assert.equal(codex.preset.id, "codex");
assert.equal(codex.connection.profile.name, "Codex");
assert(codex.commands.includes("npm.cmd run check"));
assert(codex.next.includes("Run"));

const social = buildOnboarding({
  preset: "social",
  goal: "crear contenido para redes",
  connector: () => ({
    status: "ready",
    mode: "connector-kernel",
    profile: { name: "Social", kind: "workflow" },
    route: { name: "social" },
    metaskills: ["kaizen7-evolution-engine"],
    connectors: [{ id: "github", name: "GitHub" }],
    commands: ["npm.cmd run k7:connect -- \"<objective>\""],
    approvalGates: ["Publishing social content requires explicit human approval"],
  }),
});

assert.equal(social.preset.domain, "social");
assert(social.connection.approvalGates.some((gate) => gate.includes("Publishing")));

const fallback = buildOnboarding({ preset: "unknown", goal: "investigar patrones" });
assert.equal(fallback.preset.id, "custom");
assert.equal(fallback.connection.profile.name, "Custom");

const args = parseArgs(["--preset", "research", "--json", "buscar", "repos"]);
assert.equal(args.preset, "research");
assert.equal(args.json, true);
assert.equal(args.goal, "buscar repos");

console.log("onboarding tests passed");
