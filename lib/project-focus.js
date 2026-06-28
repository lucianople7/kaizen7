const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_BLOCKED_DISTRACTIONS = [
  "unrelated_ai_experiments",
  "generic_tool_collecting",
  "scope_expansion_without_evidence",
  "premature_polish",
];

function defaultFocusPath(root = process.cwd()) {
  return path.join(root, "data", "project-focus.json");
}

function unique(items = []) {
  return [...new Set(items.map((item) => String(item || "").trim()).filter(Boolean))];
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function slugTokens(value) {
  return normalizeText(value).toLowerCase().split(/[^a-z0-9áéíóúñ]+/i).filter((token) => token.length >= 3);
}

function inferDomain(goal = "") {
  const text = normalizeText(goal).toLowerCase();
  if (/reloj|watch|ecommerce|shopify|tienda|store|checkout|producto|proveedor/.test(text)) return "commerce";
  if (/codigo|code|repo|test|bug|api|build|implementar/.test(text)) return "code";
  if (/contenido|post|redes|social|video|copy/.test(text)) return "content";
  if (/memoria|obsidian|knowledge|contexto/.test(text)) return "memory";
  return "general";
}

function defaultsForDomain(domain) {
  if (domain === "commerce") {
    return {
      successMetrics: ["first_sale", "conversion_rate", "gross_margin", "supplier_reliability", "checkout_passed"],
      allowedActions: ["supplier_research", "catalog_build", "product_pages", "checkout_validation", "pricing", "traffic_campaigns", "analytics"],
      evidenceRequired: ["supplier_verified", "product_listed", "checkout_tested", "campaign_launched", "conversion_tracked"],
    };
  }
  if (domain === "code") {
    return {
      successMetrics: ["tests_passed", "feature_shipped", "bug_fixed", "rework_reduced"],
      allowedActions: ["read_code", "write_tests", "implement_minimal_change", "run_checks", "document_decision"],
      evidenceRequired: ["test_output", "diff", "endpoint_response", "review_note"],
    };
  }
  if (domain === "content") {
    return {
      successMetrics: ["published_asset", "approved_copy", "engagement_signal", "conversion_signal"],
      allowedActions: ["audience_research", "draft_content", "edit_copy", "schedule_content", "measure_response"],
      evidenceRequired: ["draft", "approval", "scheduled_post", "metric_snapshot"],
    };
  }
  return {
    successMetrics: ["verified_progress", "decision_saved", "next_action_clear"],
    allowedActions: ["clarify_goal", "execute_minimum_action", "verify_result", "write_learning"],
    evidenceRequired: ["checklist", "result", "memory_writeback"],
  };
}

function buildNorthStar({ project, goal, domain }) {
  const cleanGoal = normalizeText(goal);
  if (cleanGoal) return `Improve ${project || "the project"} toward: ${cleanGoal}`;
  if (domain === "commerce") return `Launch and grow ${project || "a profitable commerce project"}`;
  return `Improve ${project || "the project"} with verified progress every loop`;
}

function buildProjectFocus(options = {}) {
  const project = normalizeText(options.project || options.name || "Focused Project");
  const goal = normalizeText(options.goal || options.objective);
  const domain = options.domain || inferDomain(`${project} ${goal}`);
  const defaults = defaultsForDomain(domain);
  return {
    version: 1,
    project,
    domain,
    northStar: normalizeText(options.northStar) || buildNorthStar({ project, goal, domain }),
    phase: normalizeText(options.phase) || "validation",
    currentObjective: goal || `Improve ${project}`,
    successMetrics: unique([...(options.successMetrics || []), ...defaults.successMetrics]),
    allowedActions: unique([...(options.allowedActions || []), ...defaults.allowedActions]),
    blockedDistractions: unique([...(options.blockedDistractions || []), ...DEFAULT_BLOCKED_DISTRACTIONS]),
    evidenceRequired: unique([...(options.evidenceRequired || []), ...defaults.evidenceRequired]),
    updatedAt: options.updatedAt || new Date().toISOString(),
  };
}

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function saveProjectFocus(focus, filePath = defaultFocusPath()) {
  ensureParent(filePath);
  fs.writeFileSync(filePath, `${JSON.stringify(focus, null, 2)}\n`);
  return focus;
}

function loadProjectFocus(filePath = defaultFocusPath()) {
  if (!fs.existsSync(filePath)) return null;
  const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return {
    ...buildProjectFocus(parsed),
    ...parsed,
    successMetrics: unique(parsed.successMetrics || []),
    allowedActions: unique(parsed.allowedActions || []),
    blockedDistractions: unique(parsed.blockedDistractions || []),
    evidenceRequired: unique(parsed.evidenceRequired || []),
  };
}

function evaluateFocusAction(options = {}) {
  const focus = options.focus;
  const action = normalizeText(options.action || options.goal || "");
  if (!focus) {
    return {
      decision: "clarify",
      alignmentScore: 0,
      reasons: ["missing_project_focus"],
    };
  }

  const text = `${action} ${normalizeText(options.context || "")}`.toLowerCase();
  const projectTokens = slugTokens(`${focus.project} ${focus.northStar} ${focus.currentObjective}`);
  const allowedTokens = slugTokens((focus.allowedActions || []).join(" "));
  const blockedPhrases = (focus.blockedDistractions || []).map((item) => String(item).toLowerCase().replace(/_/g, " "));
  const domainTokens = slugTokens(focus.domain || "");
  const reasons = [];
  let score = 30;

  if (projectTokens.some((token) => text.includes(token))) {
    score += 26;
    reasons.push("supports_project_domain");
  }
  if (allowedTokens.some((token) => text.includes(token.replace(/_/g, " "))) || allowedTokens.some((token) => text.includes(token))) {
    score += 24;
    reasons.push("matches_allowed_action");
  }
  if (domainTokens.some((token) => text.includes(token))) {
    score += 12;
    reasons.push("matches_focus_domain");
  }
  if (/evidence|test|verify|checkout|metric|proof|prueba|verificar/.test(text)) {
    score += 8;
    reasons.push("asks_for_evidence");
  }
  if (blockedPhrases.some((phrase) => text.includes(phrase)) || /random|unrelated|generico|genérico|framework.*unrelated/.test(text)) {
    score -= 42;
    reasons.push("matches_blocked_distraction");
  }

  const alignmentScore = Math.max(0, Math.min(100, score));
  const decision = alignmentScore >= 70
    ? "aligned"
    : alignmentScore >= 45
      ? "clarify"
      : "defer";
  return {
    decision,
    alignmentScore,
    reasons: reasons.length ? reasons : ["weak_focus_match"],
  };
}

function buildFocusPacket(options = {}) {
  const root = options.root || process.cwd();
  const filePath = options.filePath || defaultFocusPath(root);
  const existing = options.focus || loadProjectFocus(filePath);
  const focus = existing || (options.project || options.northStar
    ? buildProjectFocus(options)
    : null);
  const requestedAction = normalizeText(options.goal || options.action);
  const guard = !requestedAction && focus
    ? { decision: "aligned", alignmentScore: 100, reasons: ["current_focus_loaded"] }
    : evaluateFocusAction({
      focus,
      action: requestedAction || focus?.currentObjective || "",
    });

  return {
    version: 1,
    mode: "project-focus",
    status: focus ? "focused" : "needs_focus",
    project: focus?.project || "",
    northStar: focus?.northStar || "",
    phase: focus?.phase || "",
    currentObjective: focus?.currentObjective || normalizeText(options.goal),
    successMetrics: focus?.successMetrics || [],
    allowedActions: focus?.allowedActions || [],
    blockedDistractions: focus?.blockedDistractions || [],
    evidenceRequired: focus?.evidenceRequired || [],
    guard,
    nextQuestion: focus
      ? "What evidence proves this improves the project now?"
      : "What is the living project objective KAIZEN7 should optimize?",
    nextAction: guard.decision === "aligned"
      ? "Execute the smallest action that produces required evidence."
      : guard.decision === "clarify"
        ? "Clarify how this action improves the North Star before executing."
        : "Defer this action unless it directly improves the North Star.",
  };
}

function parseArgs(argv = []) {
  const flags = new Set();
  const goalParts = [];
  let project = "";
  let phase = "";
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--project") project = argv[++index] || "";
    else if (arg === "--phase") phase = argv[++index] || "";
    else if (arg.startsWith("--")) flags.add(arg);
    else goalParts.push(arg);
  }
  return {
    json: flags.has("--json"),
    write: flags.has("--write"),
    project,
    phase,
    goal: goalParts.join(" ").trim(),
  };
}

function formatFocusPacket(packet) {
  return [
    "## KAIZEN7 Project Focus",
    "",
    `Status: ${packet.status}`,
    `Project: ${packet.project || "unset"}`,
    `North Star: ${packet.northStar || "unset"}`,
    `Phase: ${packet.phase || "unset"}`,
    `Current Objective: ${packet.currentObjective || "unset"}`,
    "",
    "### Guard",
    `Decision: ${packet.guard.decision}`,
    `Alignment: ${packet.guard.alignmentScore}`,
    ...packet.guard.reasons.map((reason) => `- ${reason}`),
    "",
    "### Next",
    packet.nextAction,
    packet.nextQuestion,
    "",
  ].join("\n");
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  const focus = args.write
    ? saveProjectFocus(buildProjectFocus(args), defaultFocusPath())
    : null;
  const packet = buildFocusPacket({ ...args, focus });
  if (args.json) process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
  else process.stdout.write(`${formatFocusPacket(packet)}\n`);
}

module.exports = {
  buildFocusPacket,
  buildProjectFocus,
  defaultFocusPath,
  evaluateFocusAction,
  formatFocusPacket,
  loadProjectFocus,
  saveProjectFocus,
};
