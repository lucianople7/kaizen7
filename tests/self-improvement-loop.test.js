const assert = require("node:assert/strict");
const {
  buildSelfImprovementLoop,
  formatSelfImprovementLoop,
  parseArgs,
} = require("../lib/self-improvement-loop");

const loop = buildSelfImprovementLoop({
  root: process.cwd(),
  goal: "mejorar KAIZEN7 usando señales actuales del mercado de agentes",
  connector: () => ({
    status: "ready",
    route: { name: "agent" },
    metaskills: ["kaizen7-evolution-engine", "ponytail", "repo-hunter-github"],
    connectors: [{ id: "github" }, { id: "mcp" }],
    commands: ["npm.cmd run k7:connect -- \"<objective>\""],
    verification: ["Run tests"],
  }),
  frontier: () => ({
    status: "ready",
    priority: { candidate: "OpenAI Agents SDK", module: "agent_evaluation" },
    queue: [{ candidate: "MCP", module: "tool_connectivity" }],
    gates: ["Verify source"],
  }),
  realizer: () => ({ status: "real" }),
});

assert.equal(loop.status, "ready");
assert.equal(loop.mode, "self-improvement-loop");
assert.equal(loop.subject, "KAIZEN7");
assert.equal(loop.verdict, "adapt_pattern");
assert(loop.marketSignals.some((signal) => signal.id === "mcp-tools"));
assert(loop.marketSignals.some((signal) => signal.id === "coding-agents"));
assert(loop.marketSignals.some((signal) => signal.id === "gradio-spaces"));
assert(loop.actions[0].includes("Connector Kernel"));
assert(loop.commands.includes("npm.cmd run check"));
assert(loop.memory.target.includes("Evolution/intakes"));
assert(loop.gates.some((gate) => gate.includes("No installs")));

const formatted = formatSelfImprovementLoop(loop);
assert(formatted.includes("KAIZEN7 Self Improvement Loop"));
assert(formatted.includes("adapt_pattern"));

const args = parseArgs(["--json", "mejorar", "kaizen"]);
assert.equal(args.json, true);
assert.equal(args.goal, "mejorar kaizen");

console.log("self improvement loop tests passed");
