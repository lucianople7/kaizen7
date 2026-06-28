const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  buildActivationDemo,
  classifyIntent,
  confidenceScore,
  formatActivationDemo,
  recommendModelRoute,
  runK7Loop,
  validateAiHandoffResponse,
} = require("../lib/activation-demo");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-activation-demo-"));
fs.mkdirSync(path.join(root, "Obsidian", "Flowmatik", "Producto"), { recursive: true });
fs.mkdirSync(path.join(root, ".agents", "skills", "repo-hunter-github"), { recursive: true });
fs.mkdirSync(path.join(root, "data"), { recursive: true });
fs.writeFileSync(path.join(root, "Obsidian", "Flowmatik", "Producto", "KAIZEN7 Product.md"), "Goal in -> next action -> verification -> memory.");
fs.writeFileSync(path.join(root, ".agents", "skills", "repo-hunter-github", "SKILL.md"), "---\nname: repo-hunter-github\ndescription: repos github agentes\n---\n");
fs.writeFileSync(path.join(root, "data", "hunter-registry.json"), JSON.stringify({ modules: {} }, null, 2));
fs.writeFileSync(path.join(root, "data", "signal-inbox.json"), "[]");

(async () => {
  const demo = await buildActivationDemo({
    root,
    goal: "evolucionar KAIZEN7 para que se entienda en 30 segundos",
    agent: "codex",
    budget: 800,
  });
  assert.equal(demo.status, "ready");
  assert.equal(demo.mode, "30-second-activation");
  assert(demo.before.friction > demo.after.friction);
  assert(demo.after.nextBestAction);
  assert(Array.isArray(demo.after.contextPack));
  assert(demo.after.verification.includes("Guardar la decision reutilizable en Obsidian."));
  assert(demo.proof.commands.some((command) => command.includes("k7:boost")));
  assert.equal(demo.launchCard.title, "KAIZEN7 Launch Card");
  assert.equal(demo.projectFocus.mode, "project-focus");
  assert(demo.projectFocus.guard.decision);
  assert.equal(demo.launchCard.startNow.length, 3);
  assert.equal(demo.launchCard.doneWhen.length, 3);
  assert(demo.launchCard.copyPasteBrief.includes("Next action:"));
  assert(demo.launchCard.memoryDraft.includes("Learning: Pending after execution."));
  assert(demo.launchCard.modelRoute.provider);
  assert.equal(demo.activationPack.title, "KAIZEN7 Activation Pack");
  assert.equal(demo.activationPack.intent, "activation");
  assert(demo.activationPack.confidence >= 65);
  assert(["execute", "execute-with-care", "clarify-first"].includes(demo.activationPack.readiness));
  assert(demo.activationPack.delegatePrompt.includes("You are working under KAIZEN7."));
  assert.equal(demo.activationPack.timeline.length, 4);
  assert(demo.activationPack.stopRules.length >= 3);
  assert(demo.activationPack.evidenceRequired.includes("screenshot"));
  assert.equal(demo.aiHandoff.protocol, "k7-ai-handoff");
  assert.equal(demo.aiHandoff.version, "1.0");
  assert.equal(demo.aiHandoff.from, "KAIZEN7");
  assert.equal(demo.aiHandoff.to, "codex");
  assert(demo.aiHandoff.constraints.focusGuard);
  assert.equal(demo.aiHandoff.constraints.returnOnlyJson, undefined);
  assert.equal(demo.aiHandoff.responseContract.returnOnlyJson, true);
  assert(demo.aiHandoff.responseContract.requiredFields.includes("status"));
  assert(demo.aiHandoff.failureContract.allowedBlockedReasons.includes("needs_approval"));
  assert(demo.aiHandoff.compactPrompt.includes("K7_AI_HANDOFF"));

  const accepted = validateAiHandoffResponse({
    handoff: demo.aiHandoff,
    response: {
      result: "Implemented one visible result.",
      proof: "test output passed",
      risk: "low",
      reusableLearning: "Keep the handoff JSON-only.",
      memoryWriteback: "Learning: JSON-only handoff works.",
      status: "done",
    },
  });
  assert.equal(accepted.decision, "done");
  assert.equal(accepted.accepted, true);

  const retry = validateAiHandoffResponse({
    handoff: demo.aiHandoff,
    response: {
      result: "Done",
      proof: "looks good",
      risk: "low",
      reusableLearning: "Need proof.",
      memoryWriteback: "Pending.",
      status: "done",
    },
  });
  assert.equal(retry.decision, "retry");

  const approval = validateAiHandoffResponse({
    handoff: demo.aiHandoff,
    response: {
      result: "Needs deploy",
      proof: "endpoint response pending",
      risk: "high",
      reusableLearning: "Deploy requires approval.",
      memoryWriteback: "Pending approval.",
      status: "needs_approval",
    },
  });
  assert.equal(approval.decision, "needs_approval");

  const blocked = validateAiHandoffResponse({ handoff: demo.aiHandoff, response: "{bad json" });
  assert.equal(blocked.decision, "blocked");

  const loop = await runK7Loop({
    root,
    goal: "cerrar ciclo IA a IA",
    agent: "codex",
    proof: "checklist verified",
  });
  assert.equal(loop.mode, "k7-loop");
  assert.equal(loop.trafficLight, "green");
  assert.equal(loop.judge.decision, "done");
  assert(loop.display.memoryDraft.includes("Learning:"));

  assert.equal(recommendModelRoute("trabajo privado con claves").provider, "ollama");
  assert.equal(recommendModelRoute("implementar endpoint con tests").provider, "openai");
  assert.equal(recommendModelRoute("comparar modelos del mercado").provider, "openrouter");
  assert.equal(classifyIntent("implementar endpoint con tests"), "build");
  assert.equal(classifyIntent("hacer research de mercado"), "research");
  assert.equal(classifyIntent("crear guion de marca"), "content");
  assert.equal(classifyIntent("documenta memoria en obsidian"), "memory");
  assert(confidenceScore({ before: demo.before, after: demo.after, launchCard: demo.launchCard }) >= 65);

  const brief = formatActivationDemo(demo);
  assert(brief.includes("KAIZEN7 30 Second Activation"));
  assert(brief.includes("Next Best Action"));
  assert(brief.includes("Launch Card"));
  assert(brief.includes("Activation Pack"));
  assert(brief.includes("AI Handoff"));

  console.log("activation demo tests passed");
})();
