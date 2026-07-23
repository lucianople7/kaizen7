const PROVIDER_REGISTRY = Object.freeze({
  openai: Object.freeze({
    type: "openai-compatible",
    baseUrl: "https://api.openai.com/v1",
    apiKeyEnv: "OPENAI_API_KEY",
    modelEnv: "OPENAI_MODEL",
    defaultModel: "gpt-5.5",
    mastraModel: "openai/gpt-5.5",
    path: "/responses",
    optional: true,
  }),
  anthropic: Object.freeze({
    type: "anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    apiKeyEnv: "ANTHROPIC_API_KEY",
    modelEnv: "ANTHROPIC_MODEL",
    defaultModel: "claude-sonnet-4-6",
    mastraModel: "anthropic/claude-sonnet-4-6",
    path: "/messages",
    optional: true,
  }),
  google: Object.freeze({
    type: "google",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    apiKeyEnv: "GOOGLE_API_KEY",
    modelEnv: "GOOGLE_MODEL",
    defaultModel: "gemini-2.5-pro",
    mastraModel: "google/gemini-2.5-pro",
    optional: true,
  }),
  deepseek: Object.freeze({
    type: "openai-compatible-chat",
    baseUrl: "https://api.deepseek.com",
    apiKeyEnv: "DEEPSEEK_API_KEY",
    modelEnv: "DEEPSEEK_MODEL",
    defaultModel: "deepseek-v4-flash",
    mastraModel: "openai/deepseek-v4-flash",
    path: "/chat/completions",
    optional: true,
  }),
  groq: Object.freeze({
    type: "openai-compatible-chat",
    baseUrl: "https://api.groq.com/openai/v1",
    apiKeyEnv: "GROQ_API_KEY",
    modelEnv: "GROQ_MODEL",
    defaultModel: "llama-3.3-70b-versatile",
    path: "/chat/completions",
    optional: true,
  }),
  mistral: Object.freeze({
    type: "openai-compatible-chat",
    baseUrl: "https://api.mistral.ai/v1",
    apiKeyEnv: "MISTRAL_API_KEY",
    modelEnv: "MISTRAL_MODEL",
    defaultModel: "mistral-large-latest",
    path: "/chat/completions",
    optional: true,
  }),
  openrouter: Object.freeze({
    type: "openai-compatible-chat",
    baseUrl: "https://openrouter.ai/api/v1",
    apiKeyEnv: "OPENROUTER_API_KEY",
    modelEnv: "OPENROUTER_MODEL",
    defaultModel: "openai/gpt-5.5",
    path: "/chat/completions",
    optional: true,
  }),
  ollama: Object.freeze({
    type: "openai-compatible-chat",
    baseUrl: "http://localhost:11434/v1",
    apiKeyEnv: "OLLAMA_API_KEY",
    modelEnv: "OLLAMA_MODEL",
    defaultModel: "llama3.1",
    path: "/chat/completions",
    allowMissingKey: true,
    optional: true,
  }),
});

const RETIRED_MODELS = Object.freeze({
  "deepseek-chat": Object.freeze({
    retiredOn: "2026-07-24",
    replacement: "deepseek-v4-flash",
    source: "https://api-docs.deepseek.com/updates/",
  }),
  "claude-3-5-sonnet-20240620": Object.freeze({
    retiredOn: "2025-10-28",
    replacement: "claude-sonnet-4-6",
    source: "https://platform.claude.com/docs/en/about-claude/model-deprecations",
  }),
});

const KERNEL_PROVIDER_PRIORITY = Object.freeze([
  Object.freeze({ env: "ARK_API_KEY", model: "openai/ark-code-latest" }),
  Object.freeze({ env: "DEEPSEEK_API_KEY", provider: "deepseek" }),
  Object.freeze({ env: "QWEN_API_KEY", model: "openai/qwen-max" }),
  Object.freeze({ env: "ZAI_API_KEY", model: "openai/zai-model" }),
  Object.freeze({ env: "KIMI_API_KEY", model: "openai/moonshot-v1-32k" }),
  Object.freeze({ env: "ANTHROPIC_API_KEY", provider: "anthropic" }),
  Object.freeze({ env: "GEMINI_API_KEY", provider: "google" }),
  Object.freeze({ env: "GOOGLE_API_KEY", provider: "google" }),
  Object.freeze({ env: "OPENAI_API_KEY", provider: "openai" }),
]);

function normalizedModelName(model = "") {
  return String(model).trim().split("/").at(-1);
}

function assertSupportedModel(model) {
  const normalized = normalizedModelName(model);
  const retirement = RETIRED_MODELS[normalized];
  if (!retirement) return model;

  const error = new Error(
    `El modelo ${model} fue retirado el ${retirement.retiredOn}. Usa ${retirement.replacement}.`,
  );
  error.code = "K7_RETIRED_MODEL";
  error.model = model;
  error.retiredOn = retirement.retiredOn;
  error.replacement = retirement.replacement;
  error.source = retirement.source;
  throw error;
}

function getGatewayProviders() {
  return PROVIDER_REGISTRY;
}

function resolveKernelModelId(env = process.env) {
  for (const candidate of KERNEL_PROVIDER_PRIORITY) {
    if (!env[candidate.env]) continue;
    const model = candidate.model || PROVIDER_REGISTRY[candidate.provider]?.mastraModel;
    return assertSupportedModel(model);
  }
  return assertSupportedModel(PROVIDER_REGISTRY.openai.mastraModel);
}

module.exports = {
  KERNEL_PROVIDER_PRIORITY,
  PROVIDER_REGISTRY,
  RETIRED_MODELS,
  assertSupportedModel,
  getGatewayProviders,
  resolveKernelModelId,
};
