const assert = require("node:assert/strict");
const {
  buildSecondBrain,
  parseArgs,
} = require("../lib/second-brain");

const brain = buildSecondBrain({
  goal: "crear un sistema inteligente con metaskills",
  supertool: () => ({
    status: "ready",
    intent: "code",
    route: { primary: "codex", helpers: ["skill-router", "production-readiness"] },
    context: ["docs/SUPERTOOL.md"],
    skills: ["test-driven-development", "verification-before-completion"],
    tools: ["codex-bridge", "codex-realizer"],
    action: "write the smallest failing test first",
    verification: ["Run tests"],
    risk: ["No secrets"],
    commands: ["npm.cmd run check"],
  }),
});

assert.equal(brain.status, "ready");
assert.equal(brain.mode, "second-brain-metaskills");
assert.equal(brain.goal, "crear un sistema inteligente con metaskills");
assert.equal(brain.identity, "KAIZEN7 second brain for agents and code tools");
assert.equal(brain.layers.memory.role, "retain decisions and reusable learning");
assert.equal(brain.layers.metaskills.role, "select the right operating skill before action");
assert.equal(brain.orchestration.route.primary, "codex");
assert(brain.metaskills.includes("test-driven-development"));
assert(brain.metaskills.includes("verification-before-completion"));
assert(brain.metaskills.includes("kaizen7-evolution-engine"));
assert(brain.action.includes("write the smallest failing test"));
assert(brain.memoryDraft.includes("Objective: crear un sistema inteligente con metaskills"));
assert(brain.memoryDraft.includes("No secrets"));
assert(brain.commands.includes("npm.cmd run check"));
assert(brain.writeback.requiresConfirmation);

const args = parseArgs(["--json", "--write-memory", "objetivo"]);
assert.equal(args.json, true);
assert.equal(args.writeMemory, true);
assert.equal(args.goal, "objetivo");

console.log("second brain tests passed");
