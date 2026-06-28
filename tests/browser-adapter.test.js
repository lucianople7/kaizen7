const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  buildBrowserSignalPacket,
  buildBrowserSignalText,
  buildReusableScriptSpec,
  fetchBrowserSignal,
  parseBrowserUrl,
} = require("../lib/browser-adapter");

assert.deepEqual(parseBrowserUrl("https://developers.tiktok.com/"), {
  url: "https://developers.tiktok.com/",
  domain: "developers.tiktok.com",
});
assert.throws(() => parseBrowserUrl("ftp://example.com"), /Invalid browser URL/);

const html = [
  "<!doctype html>",
  "<html>",
  "<head>",
  "<title>TikTok for Developers</title>",
  "<meta name=\"description\" content=\"Build apps with TikTok APIs\">",
  "</head>",
  "<body>",
  "<h1>Get access token</h1>",
  "<p>Use OAuth to request authorization before calling the API.</p>",
  "<p>Next: read docs and prepare a supervised credential flow.</p>",
  "</body>",
  "</html>",
].join("");

const packet = buildBrowserSignalPacket({
  url: "https://developers.tiktok.com/",
  html,
  objective: "get access token",
});

assert.equal(packet.source.type, "browser");
assert.equal(packet.browser.level, 2);
assert.equal(packet.browser.domain, "developers.tiktok.com");
assert.equal(packet.browser.sensitive, true);
assert.equal(packet.destination, "decision");
assert(packet.nextAction.includes("supervised browser plan"));
assert(packet.content.markdown.includes("Browser page signal"));
assert(packet.content.markdown.includes("TikTok for Developers"));

const text = buildBrowserSignalText({
  parsed: parseBrowserUrl("https://example.com/docs"),
  snapshot: { title: "Docs", description: "API docs", text: "Playwright Browser Use next prototype." },
  objective: "evaluate docs",
  level: 1,
});
assert(text.includes("Level: 1"));
assert(text.includes("Claim: evaluate whether this page reduces steps"));

const spec = buildReusableScriptSpec({
  parsed: parseBrowserUrl("https://example.com/docs"),
  objective: "read docs",
  snapshot: { title: "Docs", text: "Reusable page text" },
});
assert.equal(spec.type, "metabrowser-script-spec");
assert.equal(spec.steps[0], "open url");

(async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "k7-browser-adapter-"));
  const fetched = await fetchBrowserSignal("https://developers.tiktok.com/", {
    root: tempDir,
    objective: "read access token docs",
    level: 3,
    scriptName: "tiktok-access-token",
    fetchText: async (url) => {
      assert.equal(url, "https://developers.tiktok.com/");
      return html;
    },
  });
  assert.equal(fetched.browser.level, 3);
  assert(fetched.browser.scriptPath.endsWith("tiktok-access-token.json"));
  assert(fs.existsSync(fetched.browser.scriptPath));
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log("browser adapter tests passed");
})();
