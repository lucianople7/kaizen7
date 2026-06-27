const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  appendSignalPacket,
  buildSignalPacket,
  classifyDestination,
  extractSignals,
  normalizeSource,
  summarizeText,
} = require("../lib/signal-ingestion");

const text = `
# Browser-use release

browser-use is a GitHub tool for browser automation agents.
It claims fewer manual steps and supports Playwright workflows.
Risk: requires credentials for logged-in ecommerce sites.
License: MIT.
Price: $0 open source.
Next: prototype as a supervised adapter for KAIZEN7.
`;

const source = normalizeSource({
  type: "github",
  url: "https://github.com/browser-use/browser-use",
});

assert.equal(source.type, "github");
assert.equal(source.domain, "github.com");
assert(source.fetchedAt, "source should include a fetch timestamp");

const summary = summarizeText(text, { maxSentences: 2 });
assert(summary.includes("browser automation agents"));
assert(summary.length < text.length);

const signals = extractSignals(text);
assert(signals.tools.includes("browser-use"));
assert(signals.claims.some((claim) => claim.includes("fewer manual steps")));
assert(signals.risks.some((risk) => risk.includes("credentials")));
assert(signals.prices.includes("$0"));

const destination = classifyDestination({ source, signals, text });
assert.equal(destination, "task");

const packet = buildSignalPacket({ source, text });
assert.equal(packet.source.type, "github");
assert.equal(packet.content.title, "Browser-use release");
assert.equal(packet.destination, "task");
assert.equal(packet.confidence, "high");
assert(packet.nextAction.includes("prototype"));
assert(packet.tokenPolicy.includes("compact"));

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-signal-"));
const inboxPath = path.join(root, "data", "signal-inbox.json");
const saved = appendSignalPacket(packet, inboxPath);
assert.equal(saved.length, 1);
assert.equal(saved[0].content.title, "Browser-use release");

const second = appendSignalPacket(buildSignalPacket({
  source: { type: "huggingface", url: "https://huggingface.co/BAAI/bge-m3" },
  text: "BAAI/bge-m3 improves multilingual retrieval. Next: benchmark on Obsidian memory.",
}), inboxPath);
assert.equal(second.length, 2);
assert.equal(JSON.parse(fs.readFileSync(inboxPath, "utf8")).length, 2);

console.log("signal ingestion tests passed");
