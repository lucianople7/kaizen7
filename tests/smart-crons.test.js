const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  loadCronManifest,
  loadFrontierWatch,
  runSmartCron,
  buildMemoryEntry,
  buildDailyBrief,
  buildK7Compact,
  applySafeAction,
} = require("../lib/smart-crons");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-smart-crons-"));
fs.mkdirSync(path.join(root, "Obsidian", "Flowmatik", "Kaizen7"), { recursive: true });
fs.mkdirSync(path.join(root, "Obsidian", "Flowmatik", "Arquitectura"), { recursive: true });
fs.mkdirSync(path.join(root, "Obsidian", "TheFocux", "Branding"), { recursive: true });
fs.mkdirSync(path.join(root, "Obsidian", "TheFocux"), { recursive: true });
fs.mkdirSync(path.join(root, ".agents", "skills", "k7-hive-memory"), { recursive: true });
fs.mkdirSync(path.join(root, ".agents", "skills", "repo-hunter-github"), { recursive: true });
fs.mkdirSync(path.join(root, "site", "thefocux", "public"), { recursive: true });

fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ scripts: { check: "node --check server.js" } }, null, 2));
fs.writeFileSync(path.join(root, "Obsidian", "Flowmatik", "Kaizen7", "semaforo.md"), "# Semaforo\n\n## thefocux [AMARILLO]\nBloqueado por: contenido pendiente\n");
fs.writeFileSync(path.join(root, "Obsidian", "Flowmatik", "Kaizen7", "2026-06-25.md"), "# KAIZEN7\n\n## Movimiento\nSin siguiente accion clara.\n");
fs.writeFileSync(path.join(root, "Obsidian", "Flowmatik", "Arquitectura", "K7 Hive Memory Engine.md"), "# K7 Hive Memory Engine\n");
fs.writeFileSync(path.join(root, "Obsidian", "TheFocux", "Branding", "Web thefocux.com.md"), "# Web\n\nAI Layer pendiente.\n");
fs.writeFileSync(path.join(root, "Obsidian", "TheFocux", "THE FOCUX Signal Bowl.md"), "# Signal Bowl\n\nhttps://www.mindlabpro.com/\n");
fs.writeFileSync(path.join(root, ".agents", "skills", "k7-hive-memory", "SKILL.md"), "---\nname: k7-hive-memory\ndescription: test\n---\n");
fs.writeFileSync(path.join(root, ".agents", "skills", "repo-hunter-github", "SKILL.md"), "---\nname: repo-hunter-github\ndescription: test\n---\n");
fs.writeFileSync(path.join(root, "site", "thefocux", "public", "ai-index.json"), JSON.stringify({ name: "THE FOCUX", public_sections: [] }, null, 2));
fs.mkdirSync(path.join(root, "data"), { recursive: true });
fs.writeFileSync(path.join(root, "data", "hunter-registry.json"), JSON.stringify({
  modules: {
    semantic_memory: {
      status: "approved_for_prototype",
      primary: { source: "huggingface", id: "BAAI/bge-m3", license: "mit", verdict: "adopt_now", reason: "Embeddings" },
    },
    web_signal_ingestion: {
      status: "approved_for_prototype",
      primary: { source: "github", id: "unclecode/crawl4ai", license: "apache-2.0", verdict: "adopt_now", reason: "Web Markdown" },
    },
    social_distribution: {
      status: "test_later",
      primary: { source: "github", id: "gitroomhq/postiz-app", license: "agpl-3.0", verdict: "reference_only", reason: "License risk" },
    },
  },
}, null, 2));
fs.writeFileSync(path.join(root, "data", "market-watch.json"), JSON.stringify({
  version: 1,
  max_actions: 3,
  write_target: "Obsidian/Flowmatik/Producto/KAIZEN7 Market Watch.md",
  targets: [
    {
      id: "openai-agents-sdk",
      name: "OpenAI Agents SDK",
      lane: "agent_framework",
      priority: "P0",
      source_url: "https://openai.github.io/openai-agents-python/",
      query: "OpenAI Agents SDK guardrails tracing handoffs",
      watch_for: ["guardrails", "tracing"],
      adapt_to: ["Agent Advisor", "Verification Gate"],
    },
    {
      id: "langgraph",
      name: "LangGraph",
      lane: "agent_state",
      priority: "P1",
      source_url: "https://docs.langchain.com/oss/python/langgraph/overview",
      query: "LangGraph memory persistence durable execution",
      watch_for: ["state persistence"],
      adapt_to: ["Semantic Memory"],
    },
    {
      id: "github-agent-repos",
      name: "GitHub agent repos",
      lane: "github_discovery",
      priority: "P1",
      query: "github agent framework memory mcp guardrails",
      watch_for: ["license", "recent releases"],
      adapt_to: ["Hunter"],
    },
    {
      id: "huggingface-agent-assets",
      name: "Hugging Face agent assets",
      lane: "huggingface_discovery",
      priority: "P2",
      query: "huggingface agents datasets spaces embeddings evals",
      watch_for: ["benchmarks", "embeddings"],
      adapt_to: ["Agent Evaluation"],
    },
  ],
}, null, 2));
fs.writeFileSync(path.join(root, "data", "frontier-watch.json"), JSON.stringify({
  version: 1,
  max_packets: 2,
  write_target: "data/signal-inbox.json",
  memory_target: "Obsidian/Flowmatik/Arquitectura/K7 Frontier Watch.md",
  rules: [
    "Official docs first.",
    "Adapt patterns before dependencies.",
    "No installs from frontier-watch.",
  ],
  targets: [
    {
      id: "openai-agents-sdk",
      name: "OpenAI Agents SDK",
      kind: "agent",
      priority: "P0",
      source_type: "web",
      source_url: "https://developers.openai.com/api/docs/guides/agents",
      query: "OpenAI Agents SDK latest",
      watch_for: ["guardrails", "tracing"],
      adapt_to: ["adapter-registry"],
    },
    {
      id: "github-mcp-servers",
      name: "GitHub MCP servers",
      kind: "mcp",
      priority: "P1",
      source_type: "github",
      query: "MCP server agents tools",
      watch_for: ["tool schemas"],
      adapt_to: ["adapter-registry"],
    },
    {
      id: "workflow-ai-builders",
      name: "AI workflow builders",
      kind: "api",
      priority: "P3",
      source_type: "web",
      query: "AI workflow builder approvals",
      watch_for: ["approval UX"],
      adapt_to: ["smart-crons"],
    },
  ],
}, null, 2));
fs.writeFileSync(path.join(root, "data", "signal-inbox.json"), JSON.stringify([], null, 2));

const manifest = loadCronManifest(path.join(__dirname, "..", "data", "smart-crons.json"));
assert(manifest.crons.length >= 10, "manifest should include smart crons, frontier watch, market watch, signal radar, hunter daily and cron doctor");
assert(manifest.crons.every((cron) => cron.mode === "propose"), "all first smart crons should be propose-only");

const frontierManifest = loadFrontierWatch(path.join(root, "data", "frontier-watch.json"));
assert.equal(frontierManifest.targets.length, 3);

const daily = runSmartCron("daily", { root, date: "2026-06-25" });
assert.equal(daily.id, "daily");
assert(daily.signals.some((signal) => signal.includes("semaforo")), "daily cron should inspect semaforo memory");
assert(daily.actions.some((action) => action.type === "memory_review"), "daily cron should recommend memory review");

const maintenance = runSmartCron("maintenance", { root, date: "2026-06-25" });
assert(maintenance.actions.some((action) => action.command === "npm.cmd run check"), "maintenance cron should propose npm check");

const skillHealth = runSmartCron("skill-health", { root, date: "2026-06-25" });
assert(skillHealth.actions.some((action) => action.command.includes("quick_validate.py")), "skill health should propose official skill validation");

const thefocux = runSmartCron("thefocux", { root, date: "2026-06-25" });
assert(thefocux.actions.some((action) => action.target.includes("site/thefocux")), "THE FOCUX cron should target the public site");

const repoHunter = runSmartCron("repo-hunter", { root, date: "2026-06-25" });
assert(repoHunter.actions.some((action) => action.skill === "repo-hunter-github"), "repo hunter cron should route to repo-hunter-github");

const hunterDaily = runSmartCron("hunter-daily", { root, date: "2026-06-25" });
assert.equal(hunterDaily.id, "hunter-daily");
assert(hunterDaily.signals.some((signal) => signal.includes("Hunter registry modules: 3")), "hunter daily should read the registry");
assert.equal(hunterDaily.actions.length, 2, "hunter daily should include actionable candidates only");
assert(hunterDaily.actions.length <= 3, "hunter daily should stay compact");
assert.equal(hunterDaily.actions[0].type, "hunter_adopt");
assert.equal(hunterDaily.actions[0].module, "semantic_memory");
assert.equal(hunterDaily.actions[0].candidate, "BAAI/bge-m3");
assert(hunterDaily.actions.every((action) => action.target === "data/hunter-registry.json"), "hunter actions should trace to the registry");
assert(!hunterDaily.actions.some((action) => action.candidate === "gitroomhq/postiz-app"), "reference-only candidates should not become adoption actions");

const marketWatch = runSmartCron("market-watch", { root, date: "2026-06-25" });
assert.equal(marketWatch.id, "market-watch");
assert(marketWatch.signals.some((signal) => signal.includes("Market watch targets: 4")), "market watch should read adjacent project targets");
assert.equal(marketWatch.actions.length, 3, "market watch should respect max_actions");
assert.equal(marketWatch.actions[0].type, "market_watch_packet");
assert.equal(marketWatch.actions[0].title, "Watch OpenAI Agents SDK");
assert(marketWatch.actions.some((action) => action.lane === "github_discovery"), "market watch should include GitHub discovery");
assert(marketWatch.actions.every((action) => action.target.includes("KAIZEN7 Market Watch")), "market watch should write to its own memory target");
assert(marketWatch.actions.every((action) => action.output.includes("KAIZEN7 adaptation")), "market watch should demand adaptation output");

const frontierWatch = runSmartCron("frontier-watch", { root, date: "2026-06-25" });
assert.equal(frontierWatch.id, "frontier-watch");
assert(frontierWatch.signals.some((signal) => signal.includes("Frontier watch targets: 3")), "frontier watch should read frontier targets");
assert.equal(frontierWatch.actions.length, 2, "frontier watch should respect max_packets");
assert.equal(frontierWatch.actions[0].type, "frontier_signal_packet");
assert(frontierWatch.actions[0].target.includes("K7 Frontier Watch"), "frontier packets should trace to memory target");
assert(frontierWatch.actions[0].output.includes("KAIZEN7 adaptation"), "frontier output should demand adaptation");

const frontierWritten = runSmartCron("frontier-watch", { root, date: "2026-06-25", writeSignals: true });
assert.equal(frontierWritten.writeResult.inserted, 2);
const inbox = JSON.parse(fs.readFileSync(path.join(root, "data", "signal-inbox.json"), "utf8"));
assert.equal(inbox.length, 2);
assert(inbox.every((packet) => packet.frontier?.id?.startsWith("2026-06-25:")));
assert(inbox.some((packet) => packet.content.title.includes("OpenAI Agents SDK")));
const frontierDeduped = runSmartCron("frontier-watch", { root, date: "2026-06-25", writeSignals: true });
assert.equal(frontierDeduped.writeResult.inserted, 0, "frontier watch should not duplicate same-day packets");

const signalRadar = runSmartCron("signal-radar", { root, date: "2026-06-25" });
assert.equal(signalRadar.id, "signal-radar");
assert(signalRadar.signals.some((signal) => signal.includes("Signal Bowl")), "signal radar should inspect Signal Bowl memory");
assert(signalRadar.actions.length <= 3, "signal radar should stay compact");
assert(signalRadar.actions.some((action) => action.type === "research_packet"), "signal radar should propose research packets");
assert(signalRadar.actions.every((action) => action.target.includes("THE FOCUX Signal Bowl")), "research packets should write to Signal Bowl");
assert(signalRadar.actions.every((action) => action.storage === "THE_FOCUX_SIGNAL_LIBRARY/00_Inbox"), "heavy material should go to the signal library inbox");

fs.writeFileSync(path.join(root, "data", "smart-crons.json"), JSON.stringify(manifest, null, 2));
const cronDoctor = runSmartCron("cron-doctor", { root, date: "2026-06-25" });
assert.equal(cronDoctor.id, "cron-doctor");
assert(cronDoctor.actions.some((action) => action.type === "cron_doctor_review"), "cron doctor should be invocable as smart cron");

const brief = buildDailyBrief({ root, date: "2026-06-25" });
assert.equal(brief.id, "brief");
assert(brief.reports.length >= 8, "brief should aggregate all safe smart crons");
assert.equal(brief.priority.title, "Review active semaforo blockers");
assert.equal(brief.priority.source, "daily");
assert(brief.memory.includes("## K7 Daily Operator Brief"));
assert(brief.memory.includes("Prioridad de hoy"));
assert(brief.memory.includes("Accion minima"));

const compact = buildK7Compact({ root, date: "2026-06-25" });
assert.equal(compact.id, "k7");
assert.equal(compact.priority, "Review active semaforo blockers");
assert.equal(compact.action, "Revisar: Obsidian\\Flowmatik\\Kaizen7\\semaforo.md");
assert.equal(compact.risk, "interno seguro");
assert(!("reports" in compact), "compact output should not include verbose reports");

const reviewApply = applySafeAction({ title: "Review note", target: "Obsidian/test.md" }, { root });
assert.equal(reviewApply.status, "skipped");
assert.equal(reviewApply.reason, "manual_review_required");

const safeApply = applySafeAction(
  { title: "Run repository check", command: "npm.cmd run check" },
  { root, runner: (command) => ({ exitCode: 0, stdout: `ran ${command}`, stderr: "" }) },
);
assert.equal(safeApply.status, "applied");
assert.equal(safeApply.command, "npm.cmd run check");

const blockedApply = applySafeAction({ title: "Push", command: "git push origin main" }, { root });
assert.equal(blockedApply.status, "blocked");
assert.equal(blockedApply.reason, "unsafe_command");

const compactApplied = buildK7Compact({ root, date: "2026-06-25", applySafe: true });
assert.equal(compactApplied.apply.status, "skipped");
assert(compactApplied.memory.includes("Aplicacion segura"));

const entry = buildMemoryEntry(maintenance, { date: "2026-06-25" });
assert(entry.includes("## Smart Cron - maintenance"));
assert(entry.includes("npm.cmd run check"));

assert.throws(() => runSmartCron("unknown", { root }), /Unknown smart cron/);

console.log("smart cron tests passed");
