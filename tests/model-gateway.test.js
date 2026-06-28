const assert = require("node:assert/strict");
const {
  callModelGateway,
  listModelProviders,
  providerConfig,
} = require("../lib/model-gateway");

(async () => {
  const providers = listModelProviders({});
  assert(providers.some((provider) => provider.name === "openai"));
  assert(providers.some((provider) => provider.name === "anthropic"));
  assert(providers.some((provider) => provider.name === "google"));
  assert(providers.some((provider) => provider.name === "openrouter"));
  assert(providers.some((provider) => provider.name === "ollama" && provider.configured));

  const openAI = providerConfig({ llm: { provider: "openai" } });
  assert.equal(openAI.name, "openai");
  assert.equal(openAI.apiKeyEnv, "OPENAI_API_KEY");

  const missingKey = await callModelGateway({
    provider: "anthropic",
    messages: [{ role: "user", content: "hola" }],
  });
  assert.equal(missingKey.unavailable, true);
  assert.equal(missingKey.provider, "anthropic");
  assert(missingKey.content.includes("ANTHROPIC_API_KEY"));

  const previousKey = process.env.TEST_OPENAI_COMPATIBLE_KEY;
  process.env.TEST_OPENAI_COMPATIBLE_KEY = "test-key";
  const compatible = await callModelGateway({
    config: {
      modelProviders: {
        test: {
          type: "openai-compatible-chat",
          baseUrl: "https://example.test/v1",
          apiKeyEnv: "TEST_OPENAI_COMPATIBLE_KEY",
          modelEnv: "TEST_OPENAI_COMPATIBLE_MODEL",
          defaultModel: "test-model",
          path: "/chat/completions",
        },
      },
    },
    provider: "test",
    messages: [{ role: "user", content: "objetivo" }],
    fetchImpl: async (url, request) => {
      assert.equal(url, "https://example.test/v1/chat/completions");
      assert.equal(request.headers.authorization, "Bearer test-key");
      const body = JSON.parse(request.body);
      assert.equal(body.model, "test-model");
      assert.equal(body.messages.at(-1).content, "objetivo");
      return {
        ok: true,
        json: async () => ({ choices: [{ message: { content: "respuesta gateway" } }], usage: { total_tokens: 7 } }),
      };
    },
  });
  assert.equal(compatible.content, "respuesta gateway");
  assert.equal(compatible.provider, "test");
  assert.equal(compatible.usage.total_tokens, 7);

  if (previousKey === undefined) delete process.env.TEST_OPENAI_COMPATIBLE_KEY;
  else process.env.TEST_OPENAI_COMPATIBLE_KEY = previousKey;

  console.log("model gateway tests passed");
})();
