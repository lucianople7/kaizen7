const { appendSignalPacket, buildSignalPacket } = require("./signal-ingestion");

const SAFE_LICENSES = new Set(["mit", "apache-2.0", "bsd-3-clause", "bsd-2-clause", "isc", "cc-by-4.0", "cc0-1.0"]);
const BLOCKED_LICENSES = new Set(["agpl-3.0", "gpl-3.0", "unknown", "other"]);
const REPO_TYPES = new Set(["model", "dataset", "space"]);

function parseHuggingFaceUrl(input) {
  const raw = String(input || "").trim().replace(/^huggingface\.co/i, "https://huggingface.co");
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Invalid Hugging Face URL");
  }
  if (url.hostname.toLowerCase() !== "huggingface.co") throw new Error("Invalid Hugging Face URL");
  const parts = url.pathname.split("/").filter(Boolean);
  let repoType = "model";
  let owner = parts[0];
  let repo = parts[1];
  if (parts[0] === "datasets" || parts[0] === "spaces") {
    repoType = parts[0] === "datasets" ? "dataset" : "space";
    owner = parts[1];
    repo = parts[2];
  }
  if (!owner || !repo) throw new Error("Invalid Hugging Face URL");
  const repoId = `${owner}/${repo}`;
  const prefix = repoType === "model" ? "" : `${repoType === "dataset" ? "datasets" : "spaces"}/`;
  return {
    repoId,
    repoType,
    url: `https://huggingface.co/${prefix}${repoId}`,
  };
}

function licenseId(repo) {
  return String(repo.cardData?.license || repo.license || "unknown").toLowerCase();
}

function repoIdOf(repo) {
  return repo.id || repo.modelId || repo.datasetId || repo.spaceId || "unknown/unknown";
}

function daysSince(dateValue, nowValue) {
  const then = new Date(dateValue).getTime();
  const now = new Date(nowValue || Date.now()).getTime();
  if (!Number.isFinite(then) || !Number.isFinite(now)) return Infinity;
  return Math.max(0, Math.round((now - then) / 86400000));
}

function scoreHuggingFaceRepo(repo, options = {}) {
  let score = 0;
  const reasons = [];
  const license = licenseId(repo);
  const downloads = Number(repo.downloads || 0);
  const likes = Number(repo.likes || 0);
  const ageDays = daysSince(repo.lastModified || repo.updatedAt || repo.createdAt, options.now);
  const tags = repo.tags || [];

  if (SAFE_LICENSES.has(license)) {
    score += 25;
    reasons.push("safe_license");
  }
  if (BLOCKED_LICENSES.has(license)) {
    score -= 45;
    reasons.push("license_review_required");
  }
  if (downloads >= 100000) {
    score += 25;
    reasons.push("strong_usage");
  } else if (downloads >= 10000) {
    score += 15;
    reasons.push("visible_usage");
  } else if (downloads >= 1000) {
    score += 5;
    reasons.push("early_usage");
  }
  if (likes >= 1000) {
    score += 15;
    reasons.push("strong_community_signal");
  } else if (likes >= 100) {
    score += 8;
    reasons.push("community_signal");
  }
  if (ageDays <= 90) {
    score += 20;
    reasons.push("recent_activity");
  } else if (ageDays <= 365) {
    score += 10;
    reasons.push("maintained");
  }
  if (repo.pipeline_tag || repo.sdk) {
    score += 10;
    reasons.push("clear_capability");
  }
  if (tags.length) {
    score += 10;
    reasons.push("tag_metadata");
  }
  if (options.repoType === "space") {
    score += 5;
    reasons.push("demo_surface");
  }

  const blocked = BLOCKED_LICENSES.has(license) || repo.gated === true || repo.private === true;
  if (repo.gated === true) reasons.push("gated_repo");
  if (repo.private === true) reasons.push("private_repo");
  const verdict = blocked ? "reference_only" : score >= 75 ? "adopt_now" : score >= 45 ? "adapt_pattern" : "test_later";
  return { score, verdict, blocked, reasons, license, ageDays };
}

function repoUrl(repoId, repoType) {
  const prefix = repoType === "model" ? "" : `${repoType === "dataset" ? "datasets" : "spaces"}/`;
  return `https://huggingface.co/${prefix}${repoId}`;
}

function buildHuggingFaceSignalText({ repo, repoType, cardMarkdown = "" }) {
  const tags = (repo.tags || []).join(", ") || "none";
  const readmeExcerpt = String(cardMarkdown || "").trim().slice(0, 4000);
  return [
    "# Hugging Face repository signal",
    "",
    `Repository: ${repoIdOf(repo)}`,
    `URL: ${repoUrl(repoIdOf(repo), repoType)}`,
    `Type: ${repoType}`,
    `Pipeline: ${repo.pipeline_tag || repo.sdk || "unknown"}`,
    `License: ${licenseId(repo)}`,
    `Downloads: ${repo.downloads || 0}`,
    `Likes: ${repo.likes || 0}`,
    `Last modified: ${repo.lastModified || repo.updatedAt || "unknown"}`,
    `Tags: ${tags}`,
    "",
    "Claim: evaluate whether this Hugging Face asset reduces steps, tokens, friction or implementation time for KAIZEN7.",
    "Next: score asset and route to Hunter if useful.",
    "",
    "## Card excerpt",
    readmeExcerpt || "No card excerpt available.",
  ].join("\n");
}

function buildHuggingFaceSignalPacket({ repo, repoType = "model", cardMarkdown = "", now } = {}) {
  const evaluation = scoreHuggingFaceRepo(repo, { repoType, now });
  const repoId = repoIdOf(repo);
  const packet = buildSignalPacket({
    source: { type: "huggingface", url: repoUrl(repoId, repoType) },
    text: buildHuggingFaceSignalText({ repo, repoType, cardMarkdown }),
  });
  return {
    ...packet,
    destination: evaluation.blocked ? "decision" : packet.destination,
    nextAction: evaluation.blocked
      ? `review ${repoId} license or access before implementation`
      : evaluation.verdict === "adopt_now"
        ? `prototype ${repoId} as a supervised KAIZEN7 adapter`
        : `keep ${repoId} as ${evaluation.verdict} in Hunter queue`,
    huggingface: {
      repoId,
      repoType,
      license: evaluation.license,
      pipeline: repo.pipeline_tag || repo.sdk || "",
      downloads: repo.downloads || 0,
      likes: repo.likes || 0,
      tags: repo.tags || [],
      updatedAt: repo.lastModified || repo.updatedAt || "",
      score: evaluation.score,
      verdict: evaluation.verdict,
      blocked: evaluation.blocked,
      reasons: evaluation.reasons,
    },
  };
}

async function defaultFetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Hugging Face request failed ${response.status}: ${url}`);
  return response.json();
}

async function defaultFetchText(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) return "";
  return response.text();
}

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function apiPath(repoId, repoType) {
  if (repoType === "dataset") return `https://huggingface.co/api/datasets/${repoId}`;
  if (repoType === "space") return `https://huggingface.co/api/spaces/${repoId}`;
  return `https://huggingface.co/api/models/${repoId}`;
}

function cardPath(repoId, repoType) {
  const prefix = repoType === "model" ? "" : `${repoType === "dataset" ? "datasets" : "spaces"}/`;
  return `https://huggingface.co/${prefix}${repoId}/raw/main/README.md`;
}

async function fetchHuggingFaceSignal(input, options = {}) {
  const parsed = parseHuggingFaceUrl(input);
  const fetchJson = options.fetchJson || defaultFetchJson;
  const fetchText = options.fetchText || defaultFetchText;
  const headers = {
    Accept: "application/json",
    "User-Agent": "kaizen7-huggingface-adapter",
    ...authHeaders(options.token || process.env.HF_TOKEN),
  };
  const repo = await fetchJson(apiPath(parsed.repoId, parsed.repoType), { headers });
  const cardMarkdown = await fetchText(cardPath(parsed.repoId, parsed.repoType), { headers: { "User-Agent": "kaizen7-huggingface-adapter" } }).catch(() => "");
  return buildHuggingFaceSignalPacket({ repo, repoType: parsed.repoType, cardMarkdown, now: options.now });
}

function parseCli(argv) {
  const args = [...argv];
  const repoUrl = args.find((arg) => !arg.startsWith("--"));
  return {
    repoUrl,
    write: args.includes("--write"),
    token: process.env.HF_TOKEN,
  };
}

module.exports = {
  buildHuggingFaceSignalPacket,
  buildHuggingFaceSignalText,
  fetchHuggingFaceSignal,
  parseHuggingFaceUrl,
  scoreHuggingFaceRepo,
};

if (require.main === module) {
  const { repoUrl, write, token } = parseCli(process.argv.slice(2));
  if (!repoUrl) {
    process.stderr.write("Usage: node lib/huggingface-adapter.js <huggingface-url> [--write]\n");
    process.exit(1);
  }
  fetchHuggingFaceSignal(repoUrl, { token })
    .then((packet) => {
      if (write) appendSignalPacket(packet);
      process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
    })
    .catch((error) => {
      process.stderr.write(`${error.message}\n`);
      process.exit(1);
    });
}
