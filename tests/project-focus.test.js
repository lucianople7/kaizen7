const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  buildFocusPacket,
  buildProjectFocus,
  defaultFocusPath,
  evaluateFocusAction,
  loadProjectFocus,
  saveProjectFocus,
} = require("../lib/project-focus");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "k7-project-focus-"));
const focusPath = defaultFocusPath(root);

const focus = buildProjectFocus({
  project: "Online Watch Store",
  goal: "crear una tienda online de relojes rentable",
  phase: "validation",
});

assert.equal(focus.version, 1);
assert.equal(focus.project, "Online Watch Store");
assert.equal(focus.phase, "validation");
assert(focus.northStar.includes("relojes"));
assert(focus.successMetrics.includes("first_sale"));
assert(focus.allowedActions.includes("supplier_research"));
assert(focus.allowedActions.includes("checkout_validation"));
assert(focus.blockedDistractions.includes("unrelated_ai_experiments"));

saveProjectFocus(focus, focusPath);
assert(fs.existsSync(focusPath));

const loaded = loadProjectFocus(focusPath);
assert.equal(loaded.project, "Online Watch Store");
assert.equal(loaded.northStar, focus.northStar);

const aligned = evaluateFocusAction({
  focus,
  action: "validate suppliers and create Shopify product pages for watches",
});
assert.equal(aligned.decision, "aligned");
assert(aligned.alignmentScore >= 70);
assert(aligned.reasons.includes("supports_project_domain"));

const distraction = evaluateFocusAction({
  focus,
  action: "build a random AI agent framework unrelated to the watch store",
});
assert.equal(distraction.decision, "defer");
assert(distraction.alignmentScore < aligned.alignmentScore);
assert(distraction.reasons.includes("matches_blocked_distraction"));

const packet = buildFocusPacket({
  root,
  goal: "mejorar checkout y catalogo de relojes",
});
assert.equal(packet.status, "focused");
assert.equal(packet.project, "Online Watch Store");
assert.equal(packet.guard.decision, "aligned");
assert(packet.nextQuestion.includes("What evidence"));

console.log("project focus tests passed");
