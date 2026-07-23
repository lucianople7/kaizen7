const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  PROVIDER_REGISTRY,
  RETIRED_MODELS,
  assertSupportedModel,
  getGatewayProviders,
  resolveKernelModelId,
} = require("../lib/provider-registry");

(() => {
  assert.equal(
    resolveKernelModelId({ DEEPSEEK_API_KEY: "configured" }),
    "openai/deepseek-v4-flash",
  );
  assert.equal(
    resolveKernelModelId({ ANTHROPIC_API_KEY: "configured" }),
    "anthropic/claude-sonnet-4-6",
  );
  assert.equal(resolveKernelModelId({}), "openai/gpt-5.5");

  assert.throws(
    () => assertSupportedModel("openai/deepseek-chat"),
    (error) => error.code === "K7_RETIRED_MODEL"
      && error.replacement === "deepseek-v4-flash"
      && error.message.includes("2026-07-24"),
  );
  assert.throws(
    () => assertSupportedModel("anthropic/claude-3-5-sonnet-20240620"),
    (error) => error.code === "K7_RETIRED_MODEL"
      && error.replacement === "claude-sonnet-4-6",
  );
  assert.equal(assertSupportedModel("claude-sonnet-4-6"), "claude-sonnet-4-6");

  const gatewayProviders = getGatewayProviders();
  assert.equal(gatewayProviders, PROVIDER_REGISTRY);
  assert.equal(gatewayProviders.anthropic.defaultModel, "claude-sonnet-4-6");
  assert.equal(gatewayProviders.deepseek.defaultModel, "deepseek-v4-flash");
  assert.equal(gatewayProviders.deepseek.optional, true);

  for (const provider of Object.values(gatewayProviders)) {
    const retired = Object.keys(RETIRED_MODELS);
    assert(!retired.includes(provider.defaultModel));
  }

  const runtimeFiles = [
    "../lib/mastra-kernel.mjs",
    "../lib/model-gateway.js",
    "../lib/openai-agent-adapter.js",
    "../server.js",
  ];
  const modelLiteral = /["'](?:openai\/|anthropic\/|google\/)?(?:gpt-|claude-|deepseek-|gemini-|qwen-|moonshot-|llama|mistral-)[^"']*["']/;
  for (const relativeFile of runtimeFiles) {
    const source = fs.readFileSync(path.join(__dirname, relativeFile), "utf8");
    assert(
      source.includes("provider-registry"),
      `${relativeFile} must consume the central provider registry`,
    );
    assert(!modelLiteral.test(source), `${relativeFile} contains a model literal outside the registry`);
  }

  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "../package.json"), "utf8"));
  assert(packageJson.scripts.postcheck.includes("node --check lib/provider-registry.js"));
  assert(packageJson.scripts.postcheck.includes("node --check lib/mastra-kernel.mjs"));
  assert(packageJson.scripts.postcheck.includes("node tests/provider-registry.test.js"));

  console.log("provider registry tests passed");
})();
