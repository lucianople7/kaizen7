const { buildLitePlan, formatLitePlan, runLiteCli } = require("./k7-lite-module");

function buildPaperclipAdapterPlan(options = {}) {
  return buildLitePlan("paperclip-adapter", {
    ...options,
    action: "Attach pasted text, clips or files as structured evidence-ready context.",
    verification: ["artifact_refs_present", "risks_reported"],
    risks: [],
  });
}

function formatPaperclipAdapterPlan(plan) {
  return formatLitePlan(plan, "KAIZEN7 Paperclip Adapter");
}

if (require.main === module) runLiteCli(buildPaperclipAdapterPlan, formatPaperclipAdapterPlan);

module.exports = { buildPaperclipAdapterPlan, formatPaperclipAdapterPlan };
