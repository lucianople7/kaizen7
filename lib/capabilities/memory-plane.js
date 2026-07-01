function firstText(...values) {
  return values.find((value) => String(value || "").trim()) || "";
}

function compact(value = "", maxChars = 220) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxChars);
}

function slug(value = "memory") {
  return String(value || "memory")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "memory";
}

function buildGraph(project, exchange = {}) {
  return {
    nodes: [
      { id: `project:${project}`, type: "project", label: project },
      { id: "agent:codex", type: "agent", label: "Codex" },
      { id: "kernel:kaizen7", type: "kernel", label: "KAIZEN7" },
      { id: "memory:obsidian", type: "store", label: "Obsidian" },
      { id: `lesson:${slug(exchange.codex_to_kaizen7?.lesson || "lesson")}`, type: "lesson", label: "verified lesson" },
    ],
    edges: [
      { from: "agent:codex", to: "kernel:kaizen7", type: "teaches" },
      { from: "kernel:kaizen7", to: "agent:codex", type: "guides" },
      { from: `project:${project}`, to: "memory:obsidian", type: "persists_to" },
      { from: `lesson:${slug(exchange.codex_to_kaizen7?.lesson || "lesson")}`, to: `project:${project}`, type: "applies_to" },
    ],
  };
}

function buildMemoryPlane(objective = "", options = {}) {
  const exchange = options.exchange || {};
  const project = options.project || "kaizen7";
  const lesson = firstText(exchange.codex_to_kaizen7?.lesson, options.lesson, objective);
  const guidance = firstText(exchange.kaizen7_to_codex?.guidance, options.guidance);
  const noteSlug = slug(`${project}-${objective || lesson}`);

  return {
    schema: "kaizen7.memory_plane.v1",
    version: 1,
    objective,
    verdict: "plan_only",
    headroom: {
      max_context_tokens: Number(options.headroomBudget || options.headroom_budget || 700),
      compression_rule: "keep_only_reusable_operational_memory",
      recall_limit: Number(options.recallLimit || options.recall_limit || 5),
    },
    graphy: buildGraph(project, exchange),
    ponytail: {
      summary: compact(lesson),
      guidance: compact(guidance),
      skipped: ["raw_transcript", "duplicate_context", "unverified_claims"],
    },
    obsidian: {
      vault: "Obsidian",
      destination: `Obsidian/Research/${noteSlug}.md`,
      write_policy: "no_write_without_verdict_and_approval",
      note_type: "operational_memory",
    },
    evidence_gate: ["learning_allowed", "memory_draft_present", "approval_before_write"],
    next_action: "review_then_write_memory_note",
  };
}

module.exports = {
  buildMemoryPlane,
};
