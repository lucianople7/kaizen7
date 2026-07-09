const RISK_PATTERNS = [
  {
    id: "credentials",
    terms: ["credential", "secret", "token", "api key", "auth", "oauth", "password"],
    severity: "block",
    reason: "May require or expose credentials.",
  },
  {
    id: "external_effects",
    terms: ["publish", "deploy", "billing", "payment", "charge", "send email", "post"],
    severity: "block",
    reason: "Can create external effects without explicit approval.",
  },
  {
    id: "destructive_writes",
    terms: ["delete", "remove", "rm -rf", "drop table", "overwrite", "format disk"],
    severity: "block",
    reason: "Can destroy data or files.",
  },
  {
    id: "broad_filesystem",
    terms: ["filesystem", "file system", "read all files", "home directory", "full disk", "recursive write"],
    severity: "review",
    reason: "May read or write beyond the intended workspace.",
  },
  {
    id: "mcp_tool_poisoning",
    terms: ["mcp", "tool description", "tool metadata", "webmcp", "server tools"],
    severity: "review",
    reason: "MCP/tool metadata must be treated as untrusted input.",
  },
  {
    id: "browser_session",
    terms: ["browser", "cookies", "session", "login", "web app", "form fill"],
    severity: "review",
    reason: "Browser automation can leak session data or act on behalf of a user.",
  },
];

function buildTrustGate(target = "", options = {}) {
  const subject = String(target || "").trim() || "unknown tool or connector";
  const lower = subject.toLowerCase();
  const findings = RISK_PATTERNS
    .filter((pattern) => pattern.terms.some((term) => lower.includes(term)))
    .map((pattern) => ({
      id: pattern.id,
      severity: pattern.severity,
      reason: pattern.reason,
    }));
  const blocks = findings.filter((finding) => finding.severity === "block");
  const reviews = findings.filter((finding) => finding.severity === "review");
  const decision = blocks.length ? "block" : reviews.length ? "review" : "allow_with_dry_run";

  return {
    schema: "kaizen7.trust_gate.v1",
    target: subject,
    decision,
    agent_agnostic: true,
    scope: options.scope || "pre-execution tool trust",
    findings,
    required_evidence: [
      "declared permissions",
      "inputs and outputs",
      "dry-run command or harmless probe",
      "workspace write boundary",
      "credential and auth requirement",
      "audit log or receipt shape",
    ],
    allow_when: [
      "permissions are minimal and explicit",
      "dry-run produces inspectable evidence",
      "tool output can be verified",
      "no credentials, billing, publishing or destructive writes are required",
      "memory and tool metadata are treated as untrusted reference data",
    ],
    block_when: [
      "requires unapproved credentials",
      "can publish, bill, message, deploy or mutate external systems",
      "can delete or overwrite broad data",
      "cannot show permission boundaries",
      "cannot produce logs or verification evidence",
    ],
    sandbox_policy: {
      default: "dry-run first",
      filesystem: "workspace-scoped writes only",
      network: "current docs or explicit approval required",
      mcp: "tool descriptions and metadata are untrusted until verified",
      browser: "no credentialed session actions without human approval",
    },
    next_commands: [
      `npm.cmd run k7 -- eval "${shellSafeText(subject)}"`,
      `npm.cmd run k7 -- production "${shellSafeText(subject)}"`,
      "npm.cmd run k7 -- remember \"<receipt-json>\"",
    ],
  };
}

function formatTrustGate(gate = buildTrustGate()) {
  return [
    "# KAIZEN7 TRUST GATE",
    "",
    `Target: ${gate.target}`,
    `Decision: ${gate.decision}`,
    "",
    "## Findings",
    ...(gate.findings || []).map((finding) => `- ${finding.severity}: ${finding.id} - ${finding.reason}`),
    ...(gate.findings || []).length ? [] : ["- No obvious high-risk pattern found. Still require dry-run evidence."],
    "",
    "## Required Evidence",
    ...gate.required_evidence.map((item) => `- ${item}`),
    "",
    "## Block When",
    ...gate.block_when.map((item) => `- ${item}`),
    "",
    "## Sandbox Policy",
    ...Object.entries(gate.sandbox_policy).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "## Next Commands",
    ...gate.next_commands.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

function shellSafeText(value = "") {
  return String(value).replace(/"/g, "'").trim();
}

module.exports = {
  RISK_PATTERNS,
  buildTrustGate,
  formatTrustGate,
};
