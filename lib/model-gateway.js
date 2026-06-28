const DEFAULT_PROVIDERS = {
  openai: {
    type: "openai-compatible",
    baseUrl: "https://api.openai.com/v1",
    apiKeyEnv: "OPENAI_API_KEY",
    modelEnv: "OPENAI_MODEL",
    defaultModel: "gpt-5.5",
    path: "/responses",
  },
  anthropic: {
    type: "anthropic",
    baseUrl: "https://api.anthropic.com/v1",
    apiKeyEnv: "ANTHROPIC_API_KEY",
    modelEnv: "ANTHROPIC_MODEL",
    defaultModel: "claude-sonnet-4-5",
    path: "/messages",
  },
  google: {
    type: "google",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    apiKeyEnv: "GOOGLE_API_KEY",
    modelEnv: "GOOGLE_MODEL",
    defaultModel: "gemini-2.5-pro",
  },
  groq: {
    type: "openai-compatible-chat",
    baseUrl: "https://api.groq.com/openai/v1",
    apiKeyEnv: "GROQ_API_KEY",
    modelEnv: "GROQ_MODEL",
    defaultModel: "llama-3.3-70b-versatile",
    path: "/chat/completions",
  },
  mistral: {
    type: "openai-compatible-chat",
    baseUrl: "https://api.mistral.ai/v1",
    apiKeyEnv: "MISTRAL_API_KEY",
    modelEnv: "MISTRAL_MODEL",
    defaultModel: "mistral-large-latest",
    path: "/chat/completions",
  },
  openrouter: {
    type: "openai-compatible-chat",
    baseUrl: "https://openrouter.ai/api/v1",
    apiKeyEnv: "OPENROUTER_API_KEY",
    modelEnv: "OPENROUTER_MODEL",
    defaultModel: "openai/gpt-5.5",
    path: "/chat/completions",
  },
  ollama: {
    type: "openai-compatible-chat",
    baseUrl: "http://localhost:11434/v1",
    apiKeyEnv: "OLLAMA_API_KEY",
    modelEnv: "OLLAMA_MODEL",
    defaultModel: "llama3.1",
    path: "/chat/completions",
    allowMissingKey: true,
  },
};

function normalizeProvider(name = "openai") {
  return String(name || "openai").trim().toLowerCase();
}

function mergeProviders(config = {}) {
  return {
    ...DEFAULT_PROVIDERS,
    ...(config.modelProviders || {}),
  };
}

function providerConfig(config = {}, providerName = "") {
  const provider = normalizeProvider(providerName || config.llm?.provider || process.env.K7_MODEL_PROVIDER || "openai");
  const providers = mergeProviders(config);
  const selected = providers[provider] || {
    type: config.llm?.type || "openai-compatible",
    baseUrl: config.llm?.baseUrl,
    apiKeyEnv: config.llm?.apiKeyEnv,
    modelEnv: config.llm?.modelEnv,
    defaultModel: config.llm?.model,
    path: config.llm?.path,
  };
  return {
    name: provider,
    type: selected.type || "openai-compatible",
    baseUrl: selected.baseUrl || config.llm?.baseUrl || DEFAULT_PROVIDERS.openai.baseUrl,
    apiKeyEnv: selected.apiKeyEnv || config.llm?.apiKeyEnv || "OPENAI_API_KEY",
    modelEnv: selected.modelEnv || config.llm?.modelEnv || "OPENAI_MODEL",
    defaultModel: selected.defaultModel || selected.model || config.llm?.model || DEFAULT_PROVIDERS.openai.defaultModel,
    path: selected.path,
    allowMissingKey: Boolean(selected.allowMissingKey),
  };
}

function listModelProviders(config = {}) {
  return Object.entries(mergeProviders(config)).map(([name, item]) => {
    const apiKeyEnv = item.apiKeyEnv || "";
    return {
      name,
      type: item.type,
      configured: item.allowMissingKey || Boolean(process.env[apiKeyEnv]),
      apiKeyEnv,
      model: process.env[item.modelEnv] || item.defaultModel || item.model || "",
      baseUrl: item.baseUrl,
    };
  });
}

function toPlainText(messages = []) {
  return messages
    .map((message) => {
      if (Array.isArray(message.content)) {
        return message.content
          .map((part) => part.text || part.image_url?.url || "")
          .filter(Boolean)
          .join("\n");
      }
      return String(message.content || "");
    })
    .filter(Boolean)
    .join("\n\n");
}

function toChatMessages(messages = [], instructions = "") {
  const converted = messages.map((message) => ({
    role: message.role === "assistant" ? "assistant" : "user",
    content: Array.isArray(message.content)
      ? message.content.map((part) => part.text || part.image_url?.url || "").filter(Boolean).join("\n")
      : String(message.content || ""),
  }));
  return instructions ? [{ role: "system", content: instructions }, ...converted] : converted;
}

function extractOpenAIText(json) {
  if (json.output_text) return json.output_text;
  if (json.choices?.[0]?.message?.content) return json.choices[0].message.content;
  return (json.output || [])
    .flatMap((item) => item.content || [])
    .filter((item) => item.type === "output_text")
    .map((item) => item.text)
    .join("\n");
}

function extractAnthropicText(json) {
  return (json.content || [])
    .map((item) => item.text || "")
    .filter(Boolean)
    .join("\n");
}

function extractGoogleText(json) {
  return (json.candidates || [])
    .flatMap((candidate) => candidate.content?.parts || [])
    .map((part) => part.text || "")
    .filter(Boolean)
    .join("\n");
}

async function postJson(url, headers, body, fetchImpl = fetch) {
  const response = await fetchImpl(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error?.message || json.message || `Model gateway error ${response.status}`);
  return json;
}

async function callModelGateway(options = {}) {
  const config = options.config || {};
  const provider = providerConfig(config, options.provider);
  const model = options.model || process.env[provider.modelEnv] || provider.defaultModel;
  const apiKey = process.env[provider.apiKeyEnv];

  if (!apiKey && !provider.allowMissingKey) {
    return {
      role: "assistant",
      content: `No hay API key configurada para ${provider.name}. Define ${provider.apiKeyEnv} o elige otro proveedor.`,
      unavailable: true,
      provider: provider.name,
      model,
    };
  }

  const instructions = options.instructions || "";
  const messages = options.messages || [];
  const baseUrl = provider.baseUrl.replace(/\/$/, "");
  const headers = apiKey ? { authorization: `Bearer ${apiKey}` } : {};
  const fetchImpl = options.fetchImpl || fetch;

  if (provider.type === "anthropic") {
    const json = await postJson(`${baseUrl}${provider.path || "/messages"}`, {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    }, {
      model,
      max_tokens: Number(options.maxTokens || 1200),
      system: instructions,
      messages: messages.map((message) => ({
        role: message.role === "assistant" ? "assistant" : "user",
        content: Array.isArray(message.content) ? toPlainText([message]) : String(message.content || ""),
      })),
    }, fetchImpl);
    return { role: "assistant", content: extractAnthropicText(json) || "Sin respuesta del modelo.", provider: provider.name, model, usage: json.usage || null };
  }

  if (provider.type === "google") {
    const url = `${baseUrl}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const json = await postJson(url, {}, {
      systemInstruction: instructions ? { parts: [{ text: instructions }] } : undefined,
      contents: messages.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: Array.isArray(message.content) ? toPlainText([message]) : String(message.content || "") }],
      })),
    }, fetchImpl);
    return { role: "assistant", content: extractGoogleText(json) || "Sin respuesta del modelo.", provider: provider.name, model, usage: json.usageMetadata || null };
  }

  if (provider.type === "openai-compatible-chat") {
    const json = await postJson(`${baseUrl}${provider.path || "/chat/completions"}`, headers, {
      model,
      messages: toChatMessages(messages, instructions),
    }, fetchImpl);
    return { role: "assistant", content: extractOpenAIText(json) || "Sin respuesta del modelo.", provider: provider.name, model, usage: json.usage || null };
  }

  const json = await postJson(`${baseUrl}${provider.path || "/responses"}`, headers, {
    model,
    instructions,
    input: messages.map((message) => ({
      role: message.role === "assistant" ? "assistant" : "user",
      content: Array.isArray(message.content) ? toPlainText([message]) : String(message.content || ""),
    })),
  }, fetchImpl);
  return { role: "assistant", content: extractOpenAIText(json) || "Sin respuesta del modelo.", provider: provider.name, model, usage: json.usage || null };
}

module.exports = {
  DEFAULT_PROVIDERS,
  callModelGateway,
  listModelProviders,
  providerConfig,
};

function parseArgs(argv) {
  const providerIndex = argv.indexOf("--provider");
  const modelIndex = argv.indexOf("--model");
  const list = argv.includes("--list");
  const compact = argv.includes("--compact");
  const provider = providerIndex >= 0 ? argv[providerIndex + 1] : "";
  const model = modelIndex >= 0 ? argv[modelIndex + 1] : "";
  const goal = argv.filter((arg, index) => {
    if (arg.startsWith("--")) return false;
    if (index > 0 && ["--provider", "--model"].includes(argv[index - 1])) return false;
    return true;
  }).join(" ").trim();
  return { provider, model, list, compact, goal };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.list) {
    process.stdout.write(`${JSON.stringify({ providers: listModelProviders({}) }, null, args.compact ? 0 : 2)}\n`);
    return;
  }
  const output = await callModelGateway({
    provider: args.provider || process.env.K7_MODEL_PROVIDER || "openai",
    model: args.model,
    instructions: [
      "Eres KAIZEN7 Model Gateway.",
      "Devuelve una respuesta breve, accionable y verificable.",
      "Si faltan datos, pide el minimo necesario.",
    ].join("\n"),
    messages: [{ role: "user", content: args.goal || "estado del gateway de modelos" }],
  });
  process.stdout.write(`${JSON.stringify(output, null, args.compact ? 0 : 2)}\n`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
