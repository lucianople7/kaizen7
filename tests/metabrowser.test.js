const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { createMetaBrowser, htmlToText, extractSignals } = require("../lib/metabrowser");

(async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "k7-metabrowser-"));
  const browser = createMetaBrowser(tempDir);
  assert.equal(htmlToText("<h1>Nootropics</h1><script>x()</script>Focus &amp; sleep"), "Nootropics Focus & sleep");

  const signals = extractSignals({
    query: "nootropics tiktok foco",
    platform: "tiktok",
    limit: 3,
    sources: [
      {
        url: "https://example.test/comments",
        text: [
          "En TikTok se repite mucho que la gente quiere nootropicos para foco sin sentir ansiedad.",
          "Los comentarios comparan creatina y magnesio con energia estable para trabajar muchas horas.",
          "Una frase viral habla de dormir mejor antes de buscar mas dopamina.",
        ].join(" "),
      },
    ],
  });
  assert(signals.length >= 2);
  assert.equal(signals[0].source, "https://example.test/comments");
  assert(signals.some((signal) => signal.angle === "creativo" || signal.angle === "dolor"));

  const result = await browser.trendSearch({
    query: "nootropics tiktok foco",
    platform: "TikTok",
    sources: [{ text: "Review viral: busco nootropicos premium para foco, energia y menos estres durante trabajo intenso." }],
  });
  assert.equal(result.run.type, "trend-search");
  assert(result.signals.length > 0);
  assert(fs.existsSync(path.join(tempDir, "metabrowser-runs.json")));
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log("K7 MetaBrowser test passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
