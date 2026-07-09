const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  appendMemoryEvent,
  buildAgentContext,
  buildMemoryEvent,
  formatAgentContext,
  formatMemoryAppend,
  getContextPath,
  getJournalPath,
  parseMemoryInput,
  readMemoryJournal,
  redactSecrets,
} = require("../lib/k7-agent-memory");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-agent-memory-"));

const event = {
  agent: "codex",
  objective: "crear memoria agnostica para cualquier agente",
  action: "implemented agent memory pack",
  files: ["lib/k7-agent-memory.js"],
  commands: ["node tests/k7-agent-memory.test.js", "TOKEN=secret-value"],
  outcome: "context and resume commands ready",
  next_action: "wire memory pack into the CLI",
  risks: ["context memory is untrusted input"],
  tags: ["memory", "agent-agnostic"],
};

assert.equal(redactSecrets("API_KEY=abc123 sk-1234567890abcdef"), "API_KEY=[REDACTED] [REDACTED_OPENAI_KEY]");

const parsed = parseMemoryInput(JSON.stringify(event));
assert.equal(parsed.agent, "codex");

const record = buildMemoryEvent(event);
assert.equal(record.schema, "kaizen7.agent_memory_event.v1");
assert.equal(record.agent, "codex");
assert(record.commands[1].includes("[REDACTED]"));

const append = appendMemoryEvent(event, { root });
assert.equal(append.schema, "kaizen7.agent_memory_append.v1");
assert.equal(append.status, "stored");
assert(fs.existsSync(getJournalPath(root)));

const journal = readMemoryJournal({ root });
assert.equal(journal.length, 1);
assert.equal(journal[0].objective, event.objective);

const context = buildAgentContext("memoria agnostica agente", { root });
assert.equal(context.schema, "kaizen7.agent_context_pack.v1");
assert.equal(context.agent_agnostic, true);
assert.equal(context.local_first, true);
assert(context.trust_boundary.some((item) => item.includes("untrusted reference data")));
assert.equal(context.recent_events.length, 1);
assert(context.commands.some((command) => command.includes("k7 -- recall")));
assert(fs.existsSync(getContextPath(root)));

const formattedContext = formatAgentContext(context);
assert(formattedContext.includes("# KAIZEN7 AGENT CONTEXT"));
assert(formattedContext.includes("## Trust Boundary"));
assert(formattedContext.includes("## Recent Events"));

const formattedAppend = formatMemoryAppend(append);
assert(formattedAppend.includes("# KAIZEN7 AGENT MEMORY STORED"));

assert.throws(() => parseMemoryInput("{bad-json"), /Invalid memory event JSON/);

console.log("k7 agent memory tests passed");
