const fs = require("node:fs");
const path = require("node:path");

function readJson(root, relativePath, fallback = null) {
  const filePath = path.join(root, relativePath);
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function fileExists(root, relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function fallbackPublicTheFocuxState() {
  return {
    os: {
      phase: "external_repo",
      rule: "Confianza -> evidencia -> comunidad -> seleccion -> comercio",
    },
    offer: {
      status: "external",
      cta: "Unirme a la lista fundadora",
      lead_magnet: "THE FOCUX dossier",
    },
    metrics: {
      waitlist_count: 0,
    },
    content_pack: {
      first_video: null,
      hooks: [],
    },
    guardrails: [
      "external_source_validation_required",
      "claims_review_required",
      "external_publish_without_approval",
      "credential_handling",
    ],
  };
}

function readPublicTheFocuxState(root = process.cwd()) {
  const candidates = [
    path.join(root, "data", "thefocux-backend.json"),
    path.join(root, "..", "thefocux", "_kaizen7_import", "data", "thefocux-backend.json"),
    path.join(root, "..", "thefocux", "data", "thefocux-backend.json"),
  ];

  const filePath = candidates.find((candidate) => fs.existsSync(candidate));
  if (!filePath) return fallbackPublicTheFocuxState();

  try {
    return {
      ...fallbackPublicTheFocuxState(),
      ...JSON.parse(fs.readFileSync(filePath, "utf8")),
    };
  } catch {
    return fallbackPublicTheFocuxState();
  }
}

function summarizeDossier(dossiers = {}) {
  const items = Array.isArray(dossiers.items) ? dossiers.items : [];
  const active = items.find((item) => item.publish_status === "draft") || items[0] || null;
  const sources = active?.sources || [];
  const blockedClaims = active?.blocked_claims || [];
  const claims = active?.claims || [];
  const onlyInternalSources = sources.length > 0 && sources.every((source) => String(source.type || "").startsWith("internal"));

  return {
    total: items.length,
    active: active
      ? {
        id: active.id,
        title: active.title,
        slug: active.slug,
        publish_status: active.publish_status || "unknown",
        evidence_level: active.evidence_level || "unknown",
        review_required: Boolean(active.review_required),
      }
      : null,
    evidence: {
      sources: sources.length,
      level: active?.evidence_level || "unknown",
      external_validation_required: Boolean(active?.review_required || onlyInternalSources || active?.evidence_level === "low"),
      risk_notes: active?.risk_notes || [],
    },
    claims: {
      allowed_claims: claims,
      allowed_count: claims.length,
      blocked_claims: blockedClaims,
      blocked_count: blockedClaims.length,
      review_required: Boolean(active?.review_required || blockedClaims.length),
    },
  };
}

function summarizePublicBundle(root) {
  const required = [
    "exports/thefocux-public/APPLY_MANIFEST.json",
    "exports/thefocux-public/public/data/dossiers/index.json",
    "exports/thefocux-public/public/data/dossiers/energia-con-criterio-draft.json",
    "exports/thefocux-public/public/ai-index.json",
    "exports/thefocux-public/docs/DOSSIER_INTEGRATION.md",
  ];

  const missing = required.filter((file) => !fileExists(root, file));
  const manifest = readJson(root, "exports/thefocux-public/APPLY_MANIFEST.json", {});

  return {
    status: missing.length ? "incomplete" : "prepared",
    missing,
    prepared_at: manifest.prepared_at || manifest.updated || null,
    copy_targets: Array.isArray(manifest.copy) ? manifest.copy.map((item) => item.to) : [],
  };
}

function buildTheFocuxOsStatus(root = process.cwd()) {
  const osMap = readJson(root, "data/the-focux-os-map.json", {});
  const dossiers = readJson(root, "data/the-focux-dossiers.json", {});
  const publicState = readPublicTheFocuxState(root);
  const dossier = summarizeDossier(dossiers);
  const publicBundle = summarizePublicBundle(root);
  const nextActions = osMap.next_actions || [];
  const blockedActions = osMap.blocked_actions || [];

  return {
    schema: "the_focux.os_status.v1",
    generated_at: new Date().toISOString(),
    phase: osMap.phase || publicState.os.phase || "unknown",
    principle: osMap.principle || publicState.os.rule,
    foundation: osMap.foundation || {
      id: "ecc_harness_foundation",
      status: "adopted_as_operating_substrate",
    },
    boundary: {
      ecc: "agent harness",
      kaizen7: "coordination, memory, routing, receipts and writeback",
      the_focux_os: "evidence, dossiers, content, founding list and future selection",
    },
    modules: osMap.modules || [],
    dossier,
    founding_list: {
      status: publicState.offer.status,
      waitlist_count: publicState.metrics.waitlist_count,
      cta: publicState.offer.cta,
      lead_magnet: publicState.offer.lead_magnet,
    },
    content_studio: {
      first_video: publicState.content_pack.first_video,
      hooks_ready: publicState.content_pack.hooks.length,
    },
    public_bundle: publicBundle,
    next_action: nextActions[0] || "create_the_focux_os_status_on_ecc_pattern",
    next_actions: nextActions,
    blocked_actions: blockedActions,
    guardrails: publicState.guardrails,
    risks: [
      ...(dossier.evidence.external_validation_required ? ["external_source_validation_required"] : []),
      ...(dossier.claims.review_required ? ["claims_review_required"] : []),
      ...(publicBundle.status !== "prepared" ? ["public_bundle_incomplete"] : []),
      ...blockedActions,
    ],
  };
}

function formatTheFocuxOsStatus(status) {
  const active = status.dossier.active;
  return [
    "# THE FOCUX OS STATUS",
    "",
    `Phase: ${status.phase}`,
    `Foundation: ${status.foundation.name || status.foundation.id} (${status.foundation.status})`,
    `Principle: ${status.principle}`,
    "",
    "## Boundary",
    `- ECC: ${status.boundary.ecc}`,
    `- KAIZEN7: ${status.boundary.kaizen7}`,
    `- THE FOCUX OS: ${status.boundary.the_focux_os}`,
    "",
    "## Active Dossier",
    active ? `- ${active.title}` : "- none",
    active ? `- status: ${active.publish_status}` : "",
    active ? `- evidence: ${active.evidence_level}` : "",
    active ? `- review required: ${active.review_required ? "yes" : "no"}` : "",
    "",
    "## Evidence",
    `- sources: ${status.dossier.evidence.sources}`,
    `- external validation required: ${status.dossier.evidence.external_validation_required ? "yes" : "no"}`,
    "",
    "## Claims",
    `- allowed: ${status.dossier.claims.allowed_count}`,
    `- blocked: ${status.dossier.claims.blocked_count}`,
    `- review required: ${status.dossier.claims.review_required ? "yes" : "no"}`,
    "",
    "## Founding List",
    `- status: ${status.founding_list.status}`,
    `- local leads: ${status.founding_list.waitlist_count}`,
    `- CTA: ${status.founding_list.cta}`,
    "",
    "## Public Bundle",
    `- status: ${status.public_bundle.status}`,
    `- targets: ${status.public_bundle.copy_targets.length}`,
    "",
    "## Next",
    `- ${status.next_action}`,
    "",
    "## Risks",
    ...(status.risks.length ? status.risks.map((risk) => `- ${risk}`) : ["- none"]),
    "",
  ].filter((line) => line !== "").join("\n");
}

if (require.main === module) {
  const status = buildTheFocuxOsStatus(process.cwd());
  if (process.argv.includes("--json")) process.stdout.write(`${JSON.stringify(status, null, 2)}\n`);
  else process.stdout.write(`${formatTheFocuxOsStatus(status)}\n`);
}

module.exports = {
  buildTheFocuxOsStatus,
  formatTheFocuxOsStatus,
  readPublicTheFocuxState,
  summarizeDossier,
  summarizePublicBundle,
};
