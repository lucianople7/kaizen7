const assert = require("node:assert/strict");
const {
  buildWisdomFilter,
  formatWisdomPrompt,
  parseArgs,
} = require("../lib/wisdom-filter");

const empty = buildWisdomFilter({});
assert.equal(empty.status, "needs_input");
assert.equal(empty.question, "Cual es el objetivo concreto?");
assert.equal(empty.tokenPolicy, "no cargar skills, conexiones ni memoria hasta tener objetivo");

const filter = buildWisdomFilter({
  objective: "crear dossier NEUROCITY verificable",
  project: "THE FOCUX",
  capabilities: ["run_tests", "browser"],
  connections: ["github", "obsidian", "browser"],
});

assert.equal(filter.status, "ready");
assert.equal(filter.mode, "wisdom-filter");
assert.equal(filter.project, "THE FOCUX");
assert(filter.objective.includes("Definir un objetivo concreto"));
assert.equal(filter.promptFilter.mode, "prompt-filter");
assert(filter.promptFilter.magnifiedPrompt.includes("THE FOCUX"));
assert.equal(filter.identity.name, "KAIZEN7 Wisdom Filter");
assert(filter.filters.some((item) => item.id === "skill_filter"));
assert(filter.filters.some((item) => item.id === "connection_filter"));
assert(filter.allowedConnections.includes("obsidian"));
assert(filter.allowedConnections.includes("browser"));
assert.equal(filter.blockedConnections.includes("publish"), true);
assert.equal(filter.decision.proceed, true);
assert.equal(filter.decision.nextAction, "build_start_packet");
assert(filter.masterPrompt.includes("Antes de actuar"));
assert(filter.masterPrompt.toLowerCase().includes("elige la minima skill"));
assert(filter.outputContract.includes("one_next_action"));

const risky = buildWisdomFilter({
  objective: "publicar campaÃ±a con access token y pagar anuncios",
  project: "THE FOCUX",
  connections: ["browser", "meta", "payment"],
});
assert.equal(risky.decision.proceed, false);
assert.equal(risky.decision.nextAction, "ask_approval_or_reduce_scope");
assert(risky.risks.includes("credential_or_account_action"));
assert(risky.risks.includes("money_or_publish_action"));

const formatted = formatWisdomPrompt(filter);
assert(formatted.includes("KAIZEN7 Wisdom Filter"));
assert(formatted.includes("THE FOCUX"));
assert(formatted.includes("Allowed Connections"));

const parsed = parseArgs([
  "--project",
  "KAIZEN7",
  "--capability",
  "run_tests",
  "--connection",
  "obsidian",
  "automejorar",
  "k7",
]);
assert.equal(parsed.project, "KAIZEN7");
assert.deepEqual(parsed.capabilities, ["run_tests"]);
assert.deepEqual(parsed.connections, ["obsidian"]);
assert.equal(parsed.objective, "automejorar k7");

console.log("wisdom filter tests passed");
