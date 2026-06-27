const assert = require("node:assert/strict");
const {
  buildGitHubSignalPacket,
  buildGitHubSignalText,
  fetchGitHubRepoSignal,
  parseGitHubRepoUrl,
  scoreGitHubRepo,
} = require("../lib/github-adapter");

assert.deepEqual(parseGitHubRepoUrl("https://github.com/browser-use/browser-use"), {
  owner: "browser-use",
  repo: "browser-use",
  fullName: "browser-use/browser-use",
  url: "https://github.com/browser-use/browser-use",
});

assert.deepEqual(parseGitHubRepoUrl("github.com/unclecode/crawl4ai/issues/123"), {
  owner: "unclecode",
  repo: "crawl4ai",
  fullName: "unclecode/crawl4ai",
  url: "https://github.com/unclecode/crawl4ai",
});

assert.throws(() => parseGitHubRepoUrl("https://example.com/nope"), /Invalid GitHub repo URL/);

const repo = {
  full_name: "browser-use/browser-use",
  html_url: "https://github.com/browser-use/browser-use",
  description: "Make websites accessible for AI agents. Useful browser automation.",
  stargazers_count: 23000,
  forks_count: 1900,
  open_issues_count: 300,
  pushed_at: "2026-06-15T10:00:00Z",
  updated_at: "2026-06-16T10:00:00Z",
  default_branch: "main",
  topics: ["agents", "browser-automation", "playwright"],
  license: { spdx_id: "MIT" },
};

const score = scoreGitHubRepo(repo, { now: "2026-06-26T00:00:00Z" });
assert.equal(score.blocked, false);
assert.equal(score.verdict, "adopt_now");
assert(score.score >= 80);
assert(score.reasons.includes("safe_license"));
assert(score.reasons.includes("recent_activity"));

const text = buildGitHubSignalText({
  repo,
  readmeMarkdown: "# browser-use\n\nBrowser automation agents with Playwright. Next: prototype supervised adapter.",
  releases: [{ tag_name: "v1.0.0", name: "Stable release" }],
});
assert(text.includes("License: MIT"));
assert(text.includes("Stars: 23000"));
assert(text.includes("Latest release: v1.0.0"));

const packet = buildGitHubSignalPacket({
  repo,
  readmeMarkdown: "# browser-use\n\nBrowser automation agents with Playwright. Next: prototype supervised adapter.",
  releases: [{ tag_name: "v1.0.0", name: "Stable release" }],
  now: "2026-06-26T00:00:00Z",
});
assert.equal(packet.source.type, "github");
assert.equal(packet.github.fullName, "browser-use/browser-use");
assert.equal(packet.github.verdict, "adopt_now");
assert.equal(packet.destination, "task");
assert.equal(packet.nextAction, "prototype browser-use/browser-use as a supervised KAIZEN7 adapter");
assert(packet.content.markdown.includes("GitHub repository signal"));

const blockedPacket = buildGitHubSignalPacket({
  repo: {
    ...repo,
    full_name: "risk/agpl-tool",
    html_url: "https://github.com/risk/agpl-tool",
    license: { spdx_id: "AGPL-3.0" },
  },
  readmeMarkdown: "Requires secrets. License AGPL-3.0.",
  now: "2026-06-26T00:00:00Z",
});
assert.equal(blockedPacket.github.blocked, true);
assert.equal(blockedPacket.github.verdict, "reference_only");
assert.equal(blockedPacket.destination, "decision");

(async () => {
  const calls = [];
  const fetched = await fetchGitHubRepoSignal("https://github.com/unclecode/crawl4ai", {
    now: "2026-06-26T00:00:00Z",
    fetchJson: async (url) => {
      calls.push(url);
      if (url.endsWith("/repos/unclecode/crawl4ai")) {
        return {
          ...repo,
          full_name: "unclecode/crawl4ai",
          html_url: "https://github.com/unclecode/crawl4ai",
        };
      }
      if (url.endsWith("/releases?per_page=3")) return [{ tag_name: "v0.7.0" }];
      throw new Error(`unexpected url ${url}`);
    },
    fetchText: async (url) => {
      calls.push(url);
      return "# crawl4ai\n\nWeb to markdown for agents. Next: test signal ingestion adapter.";
    },
  });
  assert.equal(fetched.github.fullName, "unclecode/crawl4ai");
  assert(calls.some((url) => url.includes("api.github.com/repos/unclecode/crawl4ai")));
  assert(calls.some((url) => url.includes("raw.githubusercontent.com/unclecode/crawl4ai")));

  console.log("github adapter tests passed");
})();
