const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  buildAgentRun,
  buildRunSummary,
  formatRunBrief,
  parseRunArgs,
} = require("../lib/agent-runner");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-agent-runner-"));
fs.mkdirSync(path.join(root, "Obsidian", "Flowmatik", "Kaizen7"), { recursive: true });
fs.mkdirSync(path.join(root, "Obsidian", "Flowmatik", "Arquitectura"), { recursive: true });
fs.mkdirSync(path.join(root, ".agents", "skills", "repo-hunter-github"), { recursive: true });
fs.mkdirSync(path.join(root, "data"), { recursive: true });

fs.writeFileSync(path.join(root, "Obsidian", "Flowmatik", "Kaizen7", "semaforo.md"), "# Semaforo\n");
fs.writeFileSync(path.join(root, "Obsidian", "Flowmatik", "Arquitectura", "Agent Runner.md"), "KAIZEN7 run mode reduces steps by routing memory, signals and Hunter.");
fs.writeFileSync(path.join(root, ".agents", "skills", "repo-hunter-github", "SKILL.md"), [
  "---",
  "name: repo-hunter-github",
  "description: Buscar repositorios, modelos y herramientas para agentes.",
  "---",
].join("\n"));
fs.writeFileSync(path.join(root, "data", "hunter-registry.json"), JSON.stringify({
  modules: {
    semantic_memory: {
      status: "approved_for_prototype",
      primary: {
        source: "huggingface",
        id: "BAAI/bge-m3",
        license: "mit",
        verdict: "adopt_now",
        reason: "Embeddings for memory",
      },
    },
  },
}, null, 2));
fs.writeFileSync(path.join(root, "data", "signal-inbox.json"), JSON.stringify([
  {
    source: { type: "github", url: "https://github.com/browser-use/browser-use", domain: "github.com", fetchedAt: "2026-06-26T00:00:00Z" },
    content: { title: "GitHub repository signal", summary: "Browser automation agents.", markdown: "Repository: browser-use/browser-use\nLicense: MIT\nNext: prototype." },
    confidence: "high",
    destination: "task",
    nextAction: "prototype browser-use/browser-use as a supervised KAIZEN7 adapter",
    github: {
      fullName: "browser-use/browser-use",
      license: "mit",
      score: 92,
      verdict: "adopt_now",
      blocked: false,
      reasons: ["safe_license", "strong_adoption"],
    },
  },
], null, 2));

const args = parseRunArgs(["--json", "--browser", "https://developers.tiktok.com", "--github", "https://github.com/org/repo", "--hf", "https://huggingface.co/BAAI/bge-m3", "mejorar agente"]);
assert.equal(args.flags.has("--json"), true);
assert.deepEqual(args.browserUrls, ["https://developers.tiktok.com"]);
assert.deepEqual(args.githubUrls, ["https://github.com/org/repo"]);
assert.deepEqual(args.huggingFaceUrls, ["https://huggingface.co/BAAI/bge-m3"]);
assert.equal(args.goal, "mejorar agente");

(async () => {
  const run = await buildAgentRun({
    root,
    date: "2026-06-26",
    goal: "hacer KAIZEN7 usable por cualquier agente",
    ingest: {
      browserUrls: ["https://developers.tiktok.com"],
      githubUrls: ["https://github.com/new/tool"],
      huggingFaceUrls: ["https://huggingface.co/BAAI/bge-m3"],
    },
    fetchBrowserSignal: async (url, options) => ({
      source: { type: "browser", url, domain: "developers.tiktok.com", fetchedAt: "2026-06-26T00:00:00Z" },
      content: { title: "Browser page signal", summary: "TikTok developer docs.", markdown: `URL: ${url}\nObjective: ${options.objective}\nNext: prepare supervised browser plan.` },
      confidence: "high",
      destination: "decision",
      nextAction: "prepare supervised browser plan; require approval before credentials or external account action",
      browser: {
        url,
        domain: "developers.tiktok.com",
        level: 2,
        sensitive: true,
      },
    }),
    fetchGitHubSignal: async (url) => ({
      source: { type: "github", url, domain: "github.com", fetchedAt: "2026-06-26T00:00:00Z" },
      content: { title: "GitHub repository signal", summary: "New browser tool.", markdown: "Repository: new/tool\nLicense: MIT\nNext: prototype." },
      confidence: "high",
      destination: "task",
      nextAction: "prototype new/tool as a supervised KAIZEN7 adapter",
      github: {
        fullName: "new/tool",
        license: "mit",
        score: 110,
        verdict: "adopt_now",
        blocked: false,
        reasons: ["safe_license", "strong_adoption"],
      },
    }),
    fetchHuggingFaceSignal: async (url) => ({
      source: { type: "huggingface", url, domain: "huggingface.co", fetchedAt: "2026-06-26T00:00:00Z" },
      content: { title: "Hugging Face repository signal", summary: "Embedding model.", markdown: "Repository: BAAI/bge-m3\nLicense: mit\nNext: benchmark." },
      confidence: "high",
      destination: "task",
      nextAction: "prototype BAAI/bge-m3 as a supervised KAIZEN7 adapter",
      huggingface: {
        repoId: "BAAI/bge-m3",
        repoType: "model",
        license: "mit",
        pipeline: "feature-extraction",
        score: 95,
        verdict: "adopt_now",
        blocked: false,
        reasons: ["safe_license", "strong_usage"],
      },
    }),
    metaskillLedger: {
      version: 1,
      outcomes: [{
        objectiveType: "orchestration",
        activated: ["test-driven-development"],
        fitnessScore: 0.9,
      }],
    },
  });

  assert.equal(run.version, 1);
  assert.equal(run.mode, "agent-runner");
  assert.equal(run.status, "ready");
  assert.equal(run.goal, "hacer KAIZEN7 usable por cualquier agente");
  assert.equal(run.ingested.length, 3);
  assert(run.ingested.some((item) => item.type === "browser" && item.candidate === "developers.tiktok.com"));
  assert(run.signalQueue.some((item) => item.candidate === "new/tool"));
  assert(run.executionQueue.some((item) => item.candidate === "new/tool"));
  assert.equal(run.action.candidate, "new/tool");
  assert.equal(run.action.requiresApproval, false);
  assert(run.gates.includes("judge_before_external_action"));
  assert(run.metaskillActivation.some((item) => item.skill === "test-driven-development"));
  assert(run.metaskillActivation.some((item) => item.skill === "verification-before-completion"));
  assert(run.metaskillTelemetry.fitnessScore > 0);
  assert.equal(run.metaskillLedger.totalOutcomes, 1);
  assert.equal(run.metaskillActivation[0].fitness.source, "metaskill-ledger");
  assert.equal(run.projectFocus.mode, "project-focus");
  assert(["focused", "needs_focus"].includes(run.projectFocus.status));
  assert(run.projectFocus.guard.decision);
  assert(run.tokenPolicy.includes("single action"));

  const summary = buildRunSummary(run);
  assert.deepEqual(Object.keys(summary), ["status", "goal", "action", "signals", "skills", "memory", "commands"]);
  assert.equal(summary.action.candidate, "new/tool");
  assert(summary.commands.includes("node lib/hunter.js queue"));

  const brief = formatRunBrief(run);
  assert(brief.includes("KAIZEN7 Run"));
  assert(brief.includes("new/tool"));
  assert(brief.includes("Next Command"));

  const savedInbox = JSON.parse(fs.readFileSync(path.join(root, "data", "signal-inbox.json"), "utf8"));
  assert.equal(savedInbox.length, 4);

  console.log("agent runner tests passed");
})();
