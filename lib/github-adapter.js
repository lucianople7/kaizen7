const { appendSignalPacket, buildSignalPacket } = require("./signal-ingestion");

const SAFE_LICENSES = new Set(["mit", "apache-2.0", "bsd-3-clause", "bsd-2-clause", "isc", "mpl-2.0"]);
const BLOCKED_LICENSES = new Set(["agpl-3.0", "gpl-3.0", "sspl-1.0", "other", "unknown"]);

function parseGitHubRepoUrl(input) {
  const raw = String(input || "").trim().replace(/^github\.com/i, "https://github.com");
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Invalid GitHub repo URL");
  }
  if (url.hostname.toLowerCase() !== "github.com") throw new Error("Invalid GitHub repo URL");
  const [owner, repo] = url.pathname.split("/").filter(Boolean);
  if (!owner || !repo) throw new Error("Invalid GitHub repo URL");
  return {
    owner,
    repo,
    fullName: `${owner}/${repo}`,
    url: `https://github.com/${owner}/${repo}`,
  };
}

function licenseId(repo) {
  return (repo.license?.spdx_id || "unknown").toLowerCase();
}

function daysSince(dateValue, nowValue) {
  const then = new Date(dateValue).getTime();
  const now = new Date(nowValue || Date.now()).getTime();
  if (!Number.isFinite(then) || !Number.isFinite(now)) return Infinity;
  return Math.max(0, Math.round((now - then) / 86400000));
}

function scoreGitHubRepo(repo, options = {}) {
  let score = 0;
  const reasons = [];
  const license = licenseId(repo);
  const stars = Number(repo.stargazers_count || 0);
  const forks = Number(repo.forks_count || 0);
  const ageDays = daysSince(repo.pushed_at || repo.updated_at, options.now);

  if (SAFE_LICENSES.has(license)) {
    score += 25;
    reasons.push("safe_license");
  }
  if (BLOCKED_LICENSES.has(license)) {
    score -= 40;
    reasons.push("license_review_required");
  }
  if (stars >= 10000) {
    score += 25;
    reasons.push("strong_adoption");
  } else if (stars >= 1000) {
    score += 15;
    reasons.push("visible_adoption");
  } else if (stars >= 100) {
    score += 5;
    reasons.push("early_adoption");
  }
  if (forks >= 200) {
    score += 10;
    reasons.push("active_ecosystem");
  }
  if (ageDays <= 90) {
    score += 20;
    reasons.push("recent_activity");
  } else if (ageDays <= 365) {
    score += 10;
    reasons.push("maintained");
  }
  if ((repo.topics || []).length) {
    score += 10;
    reasons.push("topic_metadata");
  }
  if (repo.description) {
    score += 10;
    reasons.push("clear_positioning");
  }

  const blocked = BLOCKED_LICENSES.has(license);
  const verdict = blocked ? "reference_only" : score >= 75 ? "adopt_now" : score >= 45 ? "adapt_pattern" : "test_later";
  return { score, verdict, blocked, reasons, license, ageDays };
}

function buildGitHubSignalText({ repo, readmeMarkdown = "", releases = [] }) {
  const latestRelease = releases[0]?.tag_name || releases[0]?.name || "none";
  const topics = (repo.topics || []).join(", ") || "none";
  const readmeExcerpt = String(readmeMarkdown || "").trim().slice(0, 4000);
  return [
    "# GitHub repository signal",
    "",
    `Repository: ${repo.full_name}`,
    `URL: ${repo.html_url}`,
    `Description: ${repo.description || "none"}`,
    `License: ${repo.license?.spdx_id || "unknown"}`,
    `Stars: ${repo.stargazers_count || 0}`,
    `Forks: ${repo.forks_count || 0}`,
    `Open issues: ${repo.open_issues_count || 0}`,
    `Updated: ${repo.updated_at || repo.pushed_at || "unknown"}`,
    `Topics: ${topics}`,
    `Latest release: ${latestRelease}`,
    "",
    "Claim: evaluate whether this repository reduces steps, tokens, friction or implementation time for KAIZEN7.",
    "Next: score repo and route to Hunter if useful.",
    "",
    "## README excerpt",
    readmeExcerpt || "No README excerpt available.",
  ].join("\n");
}

function buildGitHubSignalPacket({ repo, readmeMarkdown = "", releases = [], now } = {}) {
  const evaluation = scoreGitHubRepo(repo, { now });
  const packet = buildSignalPacket({
    source: { type: "github", url: repo.html_url },
    text: buildGitHubSignalText({ repo, readmeMarkdown, releases }),
  });
  const fullName = repo.full_name;
  return {
    ...packet,
    destination: evaluation.blocked ? "decision" : packet.destination,
    nextAction: evaluation.blocked
      ? `review ${fullName} license before implementation`
      : evaluation.verdict === "adopt_now"
        ? `prototype ${fullName} as a supervised KAIZEN7 adapter`
        : `keep ${fullName} as ${evaluation.verdict} in Hunter queue`,
    github: {
      fullName,
      owner: fullName.split("/")[0],
      repo: fullName.split("/")[1],
      defaultBranch: repo.default_branch || "main",
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      openIssues: repo.open_issues_count || 0,
      topics: repo.topics || [],
      license: evaluation.license,
      updatedAt: repo.updated_at || repo.pushed_at || "",
      score: evaluation.score,
      verdict: evaluation.verdict,
      blocked: evaluation.blocked,
      reasons: evaluation.reasons,
    },
  };
}

async function defaultFetchJson(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`GitHub request failed ${response.status}: ${url}`);
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

async function fetchGitHubRepoSignal(repoUrl, options = {}) {
  const parsed = parseGitHubRepoUrl(repoUrl);
  const fetchJson = options.fetchJson || defaultFetchJson;
  const fetchText = options.fetchText || defaultFetchText;
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "kaizen7-github-adapter",
    ...authHeaders(options.token || process.env.GITHUB_TOKEN),
  };
  const apiBase = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}`;
  const repo = await fetchJson(apiBase, { headers });
  const releases = await fetchJson(`${apiBase}/releases?per_page=3`, { headers }).catch(() => []);
  const branch = repo.default_branch || "main";
  const readmeMarkdown = await fetchText(`https://raw.githubusercontent.com/${parsed.owner}/${parsed.repo}/${branch}/README.md`, { headers: { "User-Agent": "kaizen7-github-adapter" } }).catch(() => "");
  return buildGitHubSignalPacket({ repo, releases, readmeMarkdown, now: options.now });
}

function parseCli(argv) {
  const args = [...argv];
  const repoUrl = args.find((arg) => !arg.startsWith("--"));
  return {
    repoUrl,
    write: args.includes("--write"),
    token: process.env.GITHUB_TOKEN,
  };
}

module.exports = {
  buildGitHubSignalPacket,
  buildGitHubSignalText,
  fetchGitHubRepoSignal,
  parseGitHubRepoUrl,
  scoreGitHubRepo,
};

if (require.main === module) {
  const { repoUrl, write, token } = parseCli(process.argv.slice(2));
  if (!repoUrl) {
    process.stderr.write("Usage: node lib/github-adapter.js <github-repo-url> [--write]\n");
    process.exit(1);
  }
  fetchGitHubRepoSignal(repoUrl, { token })
    .then((packet) => {
      if (write) appendSignalPacket(packet);
      process.stdout.write(`${JSON.stringify(packet, null, 2)}\n`);
    })
    .catch((error) => {
      process.stderr.write(`${error.message}\n`);
      process.exit(1);
    });
}
