const assert = require("node:assert/strict");
const {
  buildHuggingFaceSignalPacket,
  buildHuggingFaceSignalText,
  fetchHuggingFaceSignal,
  parseHuggingFaceUrl,
  scoreHuggingFaceRepo,
} = require("../lib/huggingface-adapter");

assert.deepEqual(parseHuggingFaceUrl("https://huggingface.co/BAAI/bge-m3"), {
  repoId: "BAAI/bge-m3",
  repoType: "model",
  url: "https://huggingface.co/BAAI/bge-m3",
});

assert.deepEqual(parseHuggingFaceUrl("https://huggingface.co/datasets/HuggingFaceFW/fineweb"), {
  repoId: "HuggingFaceFW/fineweb",
  repoType: "dataset",
  url: "https://huggingface.co/datasets/HuggingFaceFW/fineweb",
});

assert.deepEqual(parseHuggingFaceUrl("huggingface.co/spaces/gradio/hello_world"), {
  repoId: "gradio/hello_world",
  repoType: "space",
  url: "https://huggingface.co/spaces/gradio/hello_world",
});

assert.throws(() => parseHuggingFaceUrl("https://example.com/nope"), /Invalid Hugging Face URL/);

const model = {
  id: "BAAI/bge-m3",
  modelId: "BAAI/bge-m3",
  pipeline_tag: "feature-extraction",
  tags: ["sentence-transformers", "text-embeddings-inference", "multilingual"],
  downloads: 1200000,
  likes: 2200,
  lastModified: "2026-06-10T10:00:00Z",
  cardData: {
    license: "mit",
    language: ["multilingual"],
  },
};

const score = scoreHuggingFaceRepo(model, { repoType: "model", now: "2026-06-26T00:00:00Z" });
assert.equal(score.blocked, false);
assert.equal(score.verdict, "adopt_now");
assert(score.score >= 90);
assert(score.reasons.includes("safe_license"));
assert(score.reasons.includes("strong_usage"));
assert(score.reasons.includes("recent_activity"));

const text = buildHuggingFaceSignalText({
  repo: model,
  repoType: "model",
  cardMarkdown: "# BGE-M3\n\nMultilingual embedding model. Next: benchmark on KAIZEN7 memory.",
});
assert(text.includes("Repository: BAAI/bge-m3"));
assert(text.includes("Type: model"));
assert(text.includes("Pipeline: feature-extraction"));
assert(text.includes("Downloads: 1200000"));

const packet = buildHuggingFaceSignalPacket({
  repo: model,
  repoType: "model",
  cardMarkdown: "# BGE-M3\n\nMultilingual embedding model. Next: benchmark on KAIZEN7 memory.",
  now: "2026-06-26T00:00:00Z",
});
assert.equal(packet.source.type, "huggingface");
assert.equal(packet.huggingface.repoId, "BAAI/bge-m3");
assert.equal(packet.huggingface.repoType, "model");
assert.equal(packet.huggingface.verdict, "adopt_now");
assert.equal(packet.destination, "task");
assert.equal(packet.nextAction, "prototype BAAI/bge-m3 as a supervised KAIZEN7 adapter");

const blockedPacket = buildHuggingFaceSignalPacket({
  repo: {
    ...model,
    id: "risk/unknown-model",
    modelId: "risk/unknown-model",
    cardData: {},
  },
  repoType: "model",
  cardMarkdown: "No license declared.",
  now: "2026-06-26T00:00:00Z",
});
assert.equal(blockedPacket.huggingface.blocked, true);
assert.equal(blockedPacket.huggingface.verdict, "reference_only");
assert.equal(blockedPacket.destination, "decision");

(async () => {
  const calls = [];
  const fetched = await fetchHuggingFaceSignal("https://huggingface.co/datasets/HuggingFaceFW/fineweb", {
    now: "2026-06-26T00:00:00Z",
    fetchJson: async (url) => {
      calls.push(url);
      assert(url.includes("/api/datasets/HuggingFaceFW/fineweb"));
      return {
        id: "HuggingFaceFW/fineweb",
        tags: ["web", "text", "dataset"],
        downloads: 900000,
        likes: 900,
        lastModified: "2026-06-01T00:00:00Z",
        cardData: { license: "apache-2.0" },
      };
    },
    fetchText: async (url) => {
      calls.push(url);
      return "# FineWeb\n\nDataset for web-scale text. Next: evaluate for research ingestion.";
    },
  });
  assert.equal(fetched.huggingface.repoType, "dataset");
  assert.equal(fetched.huggingface.repoId, "HuggingFaceFW/fineweb");
  assert(calls.some((url) => url.includes("/api/datasets/HuggingFaceFW/fineweb")));
  assert(calls.some((url) => url.includes("/datasets/HuggingFaceFW/fineweb/raw/main/README.md")));

  console.log("huggingface adapter tests passed");
})();
