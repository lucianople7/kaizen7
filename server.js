const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { createKaizenCore } = require("./lib/kaizen-core");
const { createWorkspaceStore } = require("./lib/workspace-store");
const { createMetaBrowser } = require("./lib/metabrowser");
const { buildAgentRun, buildRunSummary } = require("./lib/agent-runner");
const { buildAgentAdvice, buildAdviceSummary } = require("./lib/agent-advisor");
const { buildAdapterPlan, listAdapterKinds } = require("./lib/adapter-registry");
const { buildOpenHandsAdapterPlan } = require("./lib/openhands-adapter");
const { buildToolchainPlan, evaluateToolchainResult } = require("./lib/toolchain-router");
const { buildMissionPacket } = require("./lib/k7-mission-packet");
const { buildHarnessDryRun, routeMission } = require("./lib/k7-harness-router");
const { buildFrontierOperatorBrief } = require("./lib/frontier-operator");
const { buildCodexBridge } = require("./lib/codex-bridge");
const { buildCodexRealizerReport } = require("./lib/codex-realizer");
const { buildConnectorKernel } = require("./lib/connector-kernel");
const { buildOnboarding, listPresets } = require("./lib/onboarding");
const { buildSetupStatus } = require("./lib/setup-status");
const { buildSelfImprovementLoop } = require("./lib/self-improvement-loop");
const { buildSupertoolPlan } = require("./lib/supertool-orchestrator");
const { buildSecondBrain } = require("./lib/second-brain");
const {
  runProjectActivation: runOpenAIProjectActivation,
  adviseAgent: adviseOpenAIAgent,
  verifyAndWriteback: verifyOpenAIWriteback,
} = require("./lib/openai-agent-adapter");
const { callModelGateway, listModelProviders } = require("./lib/model-gateway");
const { buildActivationDemo, runK7Loop, validateAiHandoffResponse } = require("./lib/activation-demo");
const { buildActivationCockpit } = require("./lib/activation-cockpit");
const { buildEvalHarness } = require("./lib/eval-harness");
const { buildStartHub } = require("./lib/start-hub");
const {
  buildAgentBrief,
  buildAgentContract,
  buildAgentCycle,
  buildAgentHandoff,
  buildAgentReceipt,
  buildAgentRunCard,
  buildAgentRunVerdict,
  buildAgentWorkbench,
  buildCapabilityForge,
  buildCapabilityPacket,
  buildCapabilitySpec,
  buildKernelBridge,
  buildKernelOffer,
  buildLearningLoop,
  buildNextBestAction,
  buildSuperCapabilitySystem,
  buildWorldInteractionPlan,
  resolveCapabilities,
  validateAgentLanguage,
  verifyCapabilityEvidence,
} = require("./lib/capabilities");

function optionalRequire(modulePath, exportName) {
  try {
    return require(modulePath)[exportName];
  } catch (error) {
    if (error.code !== "MODULE_NOT_FOUND") throw error;
    return null;
  }
}

const buildClaudeFlowAdapterPlan = optionalRequire("./lib/claude-flow-adapter", "buildClaudeFlowAdapterPlan");
const buildHermesAgentAdapterPlan = optionalRequire("./lib/hermes-agent-adapter", "buildHermesAgentAdapterPlan");
const buildJcodeAdapterPlan = optionalRequire("./lib/jcode-adapter", "buildJcodeAdapterPlan");
const buildK7OperatingLayer = optionalRequire("./lib/k7-operating-layer", "buildK7OperatingLayer");
const buildHeadroomAdapterPlan = optionalRequire("./lib/headroom-adapter", "buildHeadroomAdapterPlan");
const buildK7ContextLayer = optionalRequire("./lib/k7-context-layer", "buildK7ContextLayer");
const buildPaperclipAdapterPlan = optionalRequire("./lib/paperclip-adapter", "buildPaperclipAdapterPlan");
const buildK7ControlPlane = optionalRequire("./lib/k7-control-plane", "buildK7ControlPlane");
const buildBridgePacket = optionalRequire("./lib/body-bridge", "buildBridgePacket");
const buildWeaknessToStrengthPlan = optionalRequire("./lib/weakness-to-strength", "buildWeaknessToStrengthPlan");
const buildEvolutionInbox = optionalRequire("./lib/evolution-inbox", "buildEvolutionInbox");
const buildActionQueueTickets = optionalRequire("./lib/action-queue-tickets", "buildActionQueueTickets");

const root = __dirname;
const dataDir = path.join(root, "data");
const configPath = path.join(root, "kaizen.connectors.json");
const genomePath = path.join(dataDir, "product-genome.json");

function loadEnvFile() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const rawLine of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile();

const port = Number(process.env.PORT || 8787);

fs.mkdirSync(dataDir, { recursive: true });
const kaizenCore = createKaizenCore(dataDir);
const workspaceStore = createWorkspaceStore(dataDir);
const metaBrowser = createMetaBrowser(dataDir);

const defaultConfig = {
  llm: {
    provider: "openai",
    baseUrl: "https://api.openai.com/v1",
    model: process.env.OPENAI_MODEL || "gpt-5.5",
    apiKeyEnv: "OPENAI_API_KEY",
  },
  modelProviders: {
    openai: {
      type: "openai-compatible",
      baseUrl: "https://api.openai.com/v1",
      model: process.env.OPENAI_MODEL || "gpt-5.5",
      apiKeyEnv: "OPENAI_API_KEY",
      modelEnv: "OPENAI_MODEL",
      path: "/responses",
    },
    anthropic: {
      type: "anthropic",
      baseUrl: "https://api.anthropic.com/v1",
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
      apiKeyEnv: "ANTHROPIC_API_KEY",
      modelEnv: "ANTHROPIC_MODEL",
      path: "/messages",
    },
    google: {
      type: "google",
      baseUrl: "https://generativelanguage.googleapis.com/v1beta",
      model: process.env.GOOGLE_MODEL || "gemini-2.5-pro",
      apiKeyEnv: "GOOGLE_API_KEY",
      modelEnv: "GOOGLE_MODEL",
    },
    openrouter: {
      type: "openai-compatible-chat",
      baseUrl: "https://openrouter.ai/api/v1",
      model: process.env.OPENROUTER_MODEL || "openai/gpt-5.5",
      apiKeyEnv: "OPENROUTER_API_KEY",
      modelEnv: "OPENROUTER_MODEL",
      path: "/chat/completions",
    },
    ollama: {
      type: "openai-compatible-chat",
      baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1",
      model: process.env.OLLAMA_MODEL || "llama3.1",
      apiKeyEnv: "OLLAMA_API_KEY",
      modelEnv: "OLLAMA_MODEL",
      path: "/chat/completions",
      allowMissingKey: true,
    },
  },
  connectors: {
    shopify: {
      enabled: Boolean(process.env.SHOPIFY_SHOP && process.env.SHOPIFY_ADMIN_TOKEN),
      shop: process.env.SHOPIFY_SHOP || "",
      adminTokenEnv: "SHOPIFY_ADMIN_TOKEN",
    },
    meta: {
      enabled: Boolean(process.env.META_PAGE_ID && process.env.META_ACCESS_TOKEN),
      pageId: process.env.META_PAGE_ID || "",
      accessTokenEnv: "META_ACCESS_TOKEN",
    },
    instagram: {
      enabled: Boolean(process.env.IG_USER_ID && process.env.META_ACCESS_TOKEN),
      userId: process.env.IG_USER_ID || "",
      accessTokenEnv: "META_ACCESS_TOKEN",
    },
    linkedin: {
      enabled: Boolean(process.env.LINKEDIN_AUTHOR_URN && process.env.LINKEDIN_ACCESS_TOKEN),
      authorUrn: process.env.LINKEDIN_AUTHOR_URN || "",
      accessTokenEnv: "LINKEDIN_ACCESS_TOKEN",
    },
  },
  mcpServers: {},
};

function readConfig() {
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
    return defaultConfig;
  }
  return { ...defaultConfig, ...JSON.parse(fs.readFileSync(configPath, "utf8")) };
}

function emptyGenome() {
  return {
    version: 1,
    products: [],
    experiments: [],
    learnings: [],
    suppliers: [],
    creatives: [],
    updatedAt: null,
  };
}

function readGenome() {
  if (!fs.existsSync(genomePath)) {
    const genome = emptyGenome();
    fs.writeFileSync(genomePath, JSON.stringify(genome, null, 2));
    return genome;
  }
  return { ...emptyGenome(), ...JSON.parse(fs.readFileSync(genomePath, "utf8")) };
}

function saveGenome(genome) {
  genome.updatedAt = new Date().toISOString();
  fs.writeFileSync(genomePath, JSON.stringify(genome, null, 2));
  return genome;
}

function genomeSummary(genome = readGenome()) {
  return {
    products: genome.products.length,
    experiments: genome.experiments.length,
    learnings: genome.learnings.length,
    suppliers: genome.suppliers.length,
    creatives: genome.creatives.length,
    updatedAt: genome.updatedAt,
    recent: [
      ...genome.experiments.map((item) => ({ ...item, recordType: "experiment" })),
      ...genome.learnings.map((item) => ({ ...item, recordType: "learning" })),
    ]
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(0, 8),
  };
}

function addGenomeRecord(payload) {
  const genome = readGenome();
  const collections = {
    product: "products",
    experiment: "experiments",
    learning: "learnings",
    supplier: "suppliers",
    creative: "creatives",
  };
  const collection = collections[payload.type];
  if (!collection) throw new Error("Tipo Genome no valido");
  if (!payload.name?.trim()) throw new Error("El registro necesita un nombre");

  const record = {
    id: `${payload.type}_${Date.now().toString(36)}`,
    name: payload.name.trim(),
    product: payload.product?.trim() || "",
    hypothesis: payload.hypothesis?.trim() || "",
    result: payload.result?.trim() || "",
    metric: payload.metric?.trim() || "",
    evidence: payload.evidence?.trim() || "",
    confidence: payload.confidence || "medium",
    createdAt: new Date().toISOString(),
  };
  genome[collection].push(record);
  saveGenome(genome);
  return { record, summary: genomeSummary(genome) };
}

function writeJson(res, status, body) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body, null, 2));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 25 * 1024 * 1024) {
        reject(new Error("Payload demasiado grande"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, `http://${req.headers.host}`).pathname);
  const filePath = path.normalize(path.join(root, urlPath === "/" ? "index.html" : urlPath));
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const types = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".svg": "image/svg+xml",
      ".json": "application/json; charset=utf-8",
    };
    res.writeHead(200, { "content-type": types[ext] || "application/octet-stream" });
    res.end(data);
  });
}

const rolePrompts = {
  commander:
    "Orquesta el trabajo, identifica la decision principal, delega capacidades y termina con prioridades y aprobaciones necesarias.",
  research:
    "Trabaja como Research. Separa hechos, inferencias y supuestos. Busca evidencia, riesgos, mercado, competencia, proveedores y regulacion.",
  builder:
    "Trabaja como Builder. Convierte la estrategia en entregables utilizables: ofertas, contenido, ecommerce, automatizaciones y planes de ejecucion.",
  memory:
    "Trabaja como Memory. Extrae decisiones, evidencia, resultados, contradicciones y aprendizajes que merecen entrar en Product Genome.",
};

function toResponsesInput(messages = []) {
  return messages.map((message) => {
    if (!Array.isArray(message.content)) {
      return {
        role: message.role === "assistant" ? "assistant" : "user",
        content: String(message.content || ""),
      };
    }
    const content = message.content.map((part) => {
      if (part.type === "text") return { type: "input_text", text: part.text };
      if (part.type === "image_url") {
        return { type: "input_image", image_url: part.image_url?.url || part.image_url };
      }
      return part;
    });
    return { role: "user", content };
  });
}

function responseText(json) {
  if (json.output_text) return json.output_text;
  return (json.output || [])
    .flatMap((item) => item.content || [])
    .filter((item) => item.type === "output_text")
    .map((item) => item.text)
    .join("\n");
}

async function callChat(payload) {
  const config = readConfig();
  const role = payload.agent || "commander";
  return callModelGateway({
    config,
    provider: payload.provider || config.llm.provider,
    model: payload.model,
    instructions: [
      "Eres KAIZEN7, un Product Growth OS construido sobre OpenAI.",
      "El sistema tiene cuatro modos: Commander, Research, Builder y Memory.",
      "El runtime de modelo es intercambiable: OpenAI, Anthropic, Google, OpenRouter, local u otro compatible.",
      "Shopify, redes, web, archivos, MCP y modelos son herramientas, no personalidades.",
      "Trabaja en espanol con precision, acciones concretas, evidencia, riesgos y criterios de decision.",
      "No inventes datos. Marca claramente hechos, inferencias y supuestos.",
      "Todo aprendizaje debe poder vincularse a un producto, hipotesis, resultado y evidencia dentro de Product Genome.",
      rolePrompts[role] || rolePrompts.commander,
    ].join("\n"),
    messages: payload.messages,
  });
}

async function runKaizenOperator(payload) {
  const run = kaizenCore.startRun(payload);
  const workspaceTask = payload.projectId
    ? workspaceStore.createTask({ projectId: payload.projectId, title: payload.goal, owner: payload.mode || "commander", status: "in_progress", priority: payload.priority || "high", runId: run.id })
    : null;
  kaizenCore.updateRun(run.id, "running", "K7 Operator inicio la ejecucion");
  const memories = kaizenCore.searchMemory(payload.goal, payload.product);
  kaizenCore.recordTool(run.id, "memory.search", "completed", `${memories.length} recuerdos recuperados`);
  const requestedAction = payload.action || "analysis";
  const actionInstructions = {
    analysis: "Produce un resultado ejecutable. Separa hechos, inferencias y supuestos. Incluye riesgos, metricas y siguiente accion.",
    shopify_draft: "Redacta una descripcion de producto lista para un borrador de Shopify. Incluye propuesta de valor, beneficios, prueba, uso y FAQ. No uses claims no demostrados.",
    meta_post: "Redacta solamente el texto final de una publicacion para Meta. Debe ser claro, util, coherente con el producto y terminar con una llamada a la accion.",
    linkedin_post: "Redacta solamente el texto final de una publicacion profesional para LinkedIn. Evita exageraciones y termina con una pregunta o llamada a la accion.",
    x_post: "Redacta solamente un post para X de un maximo de 260 caracteres. Sin explicaciones adicionales.",
  };
  const prompt = [
    `Objetivo: ${payload.goal}`,
    `Producto: ${payload.product || "sin especificar"}`,
    `Modo: ${payload.mode || "commander"}`,
    `Plan supervisado: ${run.plan.steps.join(" | ")}`,
    memories.length
      ? `Memoria relevante:\n${memories.map((item) => `- ${item.content}`).join("\n")}`
      : "No hay memoria previa relevante.",
    actionInstructions[requestedAction] || actionInstructions.analysis,
  ].join("\n\n");
  const response = await callChat({
    agent: payload.mode || "commander",
    messages: [{ role: "user", content: prompt }],
  });
  if (response.unavailable) {
    kaizenCore.updateRun(run.id, "failed", response.content);
    if (workspaceTask) workspaceStore.updateTask(workspaceTask.id, { status: "blocked" });
    throw new Error(response.content);
  }
  kaizenCore.recordTool(run.id, "openai.responses", "completed", "Resultado generado por el kernel OpenAI", { responseId: response.responseId });
  kaizenCore.updateRun(run.id, "evaluating", "K7 Judge esta evaluando el resultado");
  const evaluation = kaizenCore.evaluate({
    subject: `run:${run.id}`,
    product: payload.product,
    content: response.content,
    profile: requestedAction === "shopify_draft" ? "commerce" : requestedAction.endsWith("_post") ? "social" : "default",
  });
  kaizenCore.recordTool(run.id, "judge.evaluate", "completed", `Resultado ${evaluation.verdict} con ${evaluation.score}/100`);
  kaizenCore.remember({
    type: "run_result",
    product: payload.product,
    content: `Objetivo: ${payload.goal}\nResultado: ${response.content}\nJudge: ${evaluation.score}/100`,
    source: run.id,
    confidence: evaluation.verdict === "pass" ? "high" : "medium",
  });
  const actions = {
    shopify_draft: {
      tool: "shopify.product.draft",
      input: { title: payload.product || "Nuevo producto", descriptionHtml: response.content },
    },
    meta_post: { tool: "social.meta.publish", input: { message: response.content } },
    linkedin_post: { tool: "social.linkedin.publish", input: { text: response.content } },
    x_post: { tool: "social.x.publish", input: { text: response.content.slice(0, 280) } },
  };
  if (actions[requestedAction]) {
    let contentItem = null;
    if (payload.projectId) {
      const channel = { meta_post: "Meta", linkedin_post: "LinkedIn", x_post: "X", shopify_draft: "Shopify" }[requestedAction] || "";
      contentItem = workspaceStore.createContent({
        projectId: payload.projectId, title: `${channel}: ${payload.goal}`, body: response.content,
        channel, format: requestedAction === "shopify_draft" ? "product_page" : "post",
        status: evaluation.verdict === "block" ? "blocked" : "review", evaluationId: evaluation.id, runId: run.id,
      });
    }
    if (evaluation.verdict === "block") {
      if (workspaceTask) workspaceStore.updateTask(workspaceTask.id, { status: "blocked" });
      return {
        run: kaizenCore.updateRun(run.id, "failed", `K7 Judge bloqueo la accion con ${evaluation.score}/100`),
        response,
        evaluation,
        memories,
        blocked: true, contentItem,
      };
    }
    const action = actions[requestedAction];
    const definition = toolCatalog[action.tool];
    const approval = kaizenCore.requestApproval({
      runId: run.id,
      tool: action.tool,
      input: action.input,
      risk: definition.risk,
      summary: definition.label,
      reason: `${definition.permission} requiere confirmacion humana antes de afectar una cuenta real`,
    });
    if (workspaceTask) workspaceStore.updateTask(workspaceTask.id, { status: "review" });
    return { run: kaizenCore.status().recentRuns.find((item) => item.id === run.id), response, evaluation, memories, approval, contentItem };
  }
  if (workspaceTask) workspaceStore.updateTask(workspaceTask.id, { status: "done" });
  return {
    run: kaizenCore.completeRun(run.id, response.content, evaluation),
    response,
    evaluation,
    memories,
  };
}

const toolCatalog = {
  "shopify.product.draft": { label: "Crear borrador en Shopify", risk: "medium", permission: "writeExternal" },
  "social.meta.publish": { label: "Publicar en Meta", risk: "high", permission: "publishExternal" },
  "social.linkedin.publish": { label: "Publicar en LinkedIn", risk: "high", permission: "publishExternal" },
  "social.instagram.publish": { label: "Publicar en Instagram", risk: "high", permission: "publishExternal" },
  "social.x.publish": { label: "Publicar en X", risk: "high", permission: "publishExternal" },
};

function queueExternalAction(tool, input, product = "") {
  const definition = toolCatalog[tool];
  if (!definition) throw new Error(`Herramienta no registrada: ${tool}`);
  validateToolInput(tool, input);
  const run = kaizenCore.startRun({ goal: definition.label, product, mode: "builder" });
  const approval = kaizenCore.requestApproval({
    runId: run.id,
    tool,
    input,
    risk: definition.risk,
    summary: definition.label,
    reason: `${definition.permission} requiere confirmacion humana antes de afectar una cuenta real`,
  });
  return { queued: true, runId: run.id, approval };
}

function validateToolInput(tool, input) {
  const required = {
    "shopify.product.draft": ["title"],
    "social.meta.publish": ["message"],
    "social.linkedin.publish": ["text"],
    "social.instagram.publish": ["imageUrl"],
    "social.x.publish": ["text"],
  };
  for (const field of required[tool] || []) {
    if (!String(input?.[field] || "").trim()) throw new Error(`${tool} necesita ${field}`);
  }
  if (tool === "social.x.publish" && input.text.length > 280) throw new Error("El post para X supera 280 caracteres");
}

async function executeApprovedTool(approval) {
  const input = approval.input || {};
  validateToolInput(approval.tool, input);
  switch (approval.tool) {
    case "shopify.product.draft": return createShopifyDraftProduct(input);
    case "social.meta.publish": return publishMetaText(input.message);
    case "social.linkedin.publish": return publishLinkedInText(input.text);
    case "social.instagram.publish": return publishInstagramImage(input.imageUrl, input.caption);
    case "social.x.publish": return publishXText(input.text);
    default: throw new Error(`No existe ejecutor para ${approval.tool}`);
  }
}

async function testConnectors() {
  const config = readConfig();
  const modelProviders = listModelProviders(config).map((provider) => ({
    name: `model:${provider.name}`,
    enabled: true,
    configured: provider.configured,
    details: { type: provider.type, model: provider.model, baseUrl: provider.baseUrl },
  }));
  const connectors = Object.entries(config.connectors).map(([name, connector]) => ({
    name,
    enabled: Boolean(connector.enabled),
    configured: Object.entries(connector)
      .filter(([key]) => key.endsWith("Env"))
      .every(([, env]) => Boolean(process.env[env])),
    details: Object.fromEntries(Object.entries(connector).filter(([key]) => !key.endsWith("Env"))),
  }));
  return [
    ...modelProviders,
    ...connectors,
    ...Object.keys(config.mcpServers || {}).map((name) => ({ name: `mcp:${name}`, enabled: true, configured: true, details: { transport: "stdio" } })),
  ];
}

async function shopifyGraphql(query, variables) {
  const config = readConfig();
  const shopify = config.connectors.shopify;
  const token = process.env[shopify.adminTokenEnv];
  if (!shopify.shop || !token) throw new Error("Shopify no configurado: SHOPIFY_SHOP y SHOPIFY_ADMIN_TOKEN");
  const apiVersion = process.env.SHOPIFY_API_VERSION || "2025-10";
  const response = await fetch(`https://${shopify.shop}/admin/api/${apiVersion}/graphql.json`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await response.json();
  if (!response.ok || json.errors) throw new Error(JSON.stringify(json.errors || json));
  return json;
}

async function createShopifyDraftProduct(input) {
  return shopifyGraphql(
    `mutation ProductCreate($product: ProductCreateInput!) {
      productCreate(product: $product) {
        product { id title handle status }
        userErrors { field message }
      }
    }`,
    {
      product: {
        title: input.title,
        descriptionHtml: input.descriptionHtml || "",
        status: "DRAFT",
      },
    },
  );
}

async function publishMetaText(message) {
  const config = readConfig();
  const meta = config.connectors.meta;
  const token = process.env[meta.accessTokenEnv];
  const graphVersion = process.env.META_GRAPH_VERSION || "v23.0";
  if (!meta.pageId || !token) throw new Error("Meta no configurado: META_PAGE_ID y META_ACCESS_TOKEN");
  const response = await fetch(`https://graph.facebook.com/${graphVersion}/${meta.pageId}/feed`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ message, access_token: token }),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(json));
  return json;
}

async function publishLinkedInText(text) {
  const config = readConfig();
  const linkedIn = config.connectors.linkedin;
  const token = process.env[linkedIn.accessTokenEnv];
  if (!linkedIn.authorUrn || !token) throw new Error("LinkedIn no configurado: LINKEDIN_AUTHOR_URN y LINKEDIN_ACCESS_TOKEN");
  const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify({
      author: linkedIn.authorUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text },
          shareMediaCategory: "NONE",
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    }),
  });
  const json = await response.text();
  if (!response.ok) throw new Error(json);
  return { ok: true, response: json };
}

async function publishInstagramImage(imageUrl, caption) {
  const config = readConfig();
  const instagram = config.connectors.instagram;
  const token = process.env[instagram.accessTokenEnv];
  const graphVersion = process.env.META_GRAPH_VERSION || "v23.0";
  if (!instagram.userId || !token) throw new Error("Instagram no configurado: IG_USER_ID y META_ACCESS_TOKEN");
  if (!imageUrl) throw new Error("Instagram necesita una imageUrl publica");
  const createResponse = await fetch(`https://graph.facebook.com/${graphVersion}/${instagram.userId}/media`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ image_url: imageUrl, caption: caption || "", access_token: token }),
  });
  const created = await createResponse.json();
  if (!createResponse.ok) throw new Error(JSON.stringify(created));
  const publishResponse = await fetch(`https://graph.facebook.com/${graphVersion}/${instagram.userId}/media_publish`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ creation_id: created.id, access_token: token }),
  });
  const published = await publishResponse.json();
  if (!publishResponse.ok) throw new Error(JSON.stringify(published));
  return published;
}

async function publishXText(text) {
  const config = readConfig();
  const token = process.env[config.connectors.x.accessTokenEnv];
  if (!token) throw new Error("X no configurado: X_USER_ACCESS_TOKEN");
  const response = await fetch("https://api.x.com/2/tweets", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(json));
  return json;
}

function callMcp(serverName, method, params = {}) {
  const config = readConfig();
  const server = config.mcpServers[serverName];
  if (!server) return Promise.reject(new Error(`MCP server no encontrado: ${serverName}`));
  return new Promise((resolve, reject) => {
    const child = spawn(server.command, server.args || [], {
      cwd: server.cwd || root,
      env: { ...process.env, ...(server.env || {}) },
      stdio: ["pipe", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    const id = Date.now();
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", () => {
      const lines = stdout
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
      const parsed = lines.map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return { raw: line };
        }
      });
      resolve({ stdout: parsed, stderr });
    });
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    child.stdin.end();
    setTimeout(() => {
      child.kill();
      reject(new Error("MCP timeout"));
    }, 15000).unref();
  });
}

async function router(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  try {
    if (req.method === "GET" && url.pathname === "/api/health") {
      const services = await testConnectors();
      return writeJson(res, 200, {
        ok: true,
        ready: services.some((item) => item.name.startsWith("model:") && item.configured),
        name: "KAIZEN7",
        kernel: "model-gateway",
        services,
      });
    }
    if (req.method === "GET" && url.pathname === "/api/config") return writeJson(res, 200, readConfig());
    if (req.method === "GET" && url.pathname === "/api/connectors/status") return writeJson(res, 200, await testConnectors());
    if (req.method === "GET" && url.pathname === "/api/k7/setup") {
      return writeJson(res, 200, buildSetupStatus({ root, connectors: await testConnectors() }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/activate") {
      return writeJson(res, 200, await buildActivationDemo({ root, ...(await readBody(req)) }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/cockpit") {
      return writeJson(res, 200, buildActivationCockpit(await readBody(req)));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/start") {
      return writeJson(res, 200, buildStartHub(await readBody(req)));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/capabilities/plan") {
      const body = await readBody(req);
      return writeJson(res, 200, resolveCapabilities(body.objective || body.goal || "", body));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/capabilities/contract") {
      const body = await readBody(req);
      return writeJson(res, 200, buildAgentContract(body.objective || body.goal || "", body));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/capabilities/brief") {
      const body = await readBody(req);
      return writeJson(res, 200, buildAgentBrief(body.objective || body.goal || "", body));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/capabilities/handoff") {
      const body = await readBody(req);
      return writeJson(res, 200, buildAgentHandoff(body.objective || body.goal || "", body));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/capabilities/packet") {
      const body = await readBody(req);
      return writeJson(res, 200, buildCapabilityPacket(body.objective || body.goal || "", body));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/capabilities/receipt") {
      const body = await readBody(req);
      const packet = body.packet || buildCapabilityPacket(body.objective || body.goal || "", body);
      return writeJson(res, 200, buildAgentReceipt(packet, body.result || body.evidence || {}));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/capabilities/validate-language") {
      const body = await readBody(req);
      return writeJson(res, 200, validateAgentLanguage(body.value || body.object || {}, body.expectedSchema || body.expected_schema || ""));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/capabilities/readiness") {
      const body = await readBody(req);
      const packet = body.packet || buildCapabilityPacket(body.objective || body.goal || "", body);
      return writeJson(res, 200, packet.agent_readiness);
    }
    if (req.method === "POST" && url.pathname === "/api/k7/capabilities/cycle") {
      const body = await readBody(req);
      return writeJson(res, 200, buildAgentCycle(body.objective || body.goal || "", body.result || body.evidence || {}, body));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/capabilities/bridge") {
      const body = await readBody(req);
      return writeJson(res, 200, buildKernelBridge(body.objective || body.goal || "", body));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/capabilities/spec") {
      const body = await readBody(req);
      return writeJson(res, 200, buildCapabilitySpec(body.id || body.capability || ""));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/capabilities/forge") {
      const body = await readBody(req);
      return writeJson(res, 200, buildCapabilityForge(body.objective || body.goal || "", body));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/capabilities/offer") {
      const body = await readBody(req);
      return writeJson(res, 200, buildKernelOffer(body.objective || body.goal || "", body));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/capabilities/learn") {
      const body = await readBody(req);
      return writeJson(res, 200, buildLearningLoop(body.objective || body.goal || "", body.result || body.evidence || {}, body));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/capabilities/super") {
      const body = await readBody(req);
      return writeJson(res, 200, buildSuperCapabilitySystem(body.objective || body.goal || "", body));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/capabilities/world") {
      const body = await readBody(req);
      return writeJson(res, 200, buildWorldInteractionPlan(body.objective || body.goal || "", body));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/capabilities/next") {
      const body = await readBody(req);
      return writeJson(res, 200, buildNextBestAction(body.objective || body.goal || "", body));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/capabilities/workbench") {
      const body = await readBody(req);
      return writeJson(res, 200, buildAgentWorkbench(body.objective || body.goal || "", body));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/capabilities/run-card") {
      const body = await readBody(req);
      return writeJson(res, 200, buildAgentRunCard(body.objective || body.goal || "", body));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/capabilities/run-verdict") {
      const body = await readBody(req);
      const runCard = body.run_card || body.runCard || buildAgentRunCard(body.objective || body.goal || "", body);
      return writeJson(res, 200, buildAgentRunVerdict(runCard, body.result || body.evidence || body));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/capabilities/verify") {
      const body = await readBody(req);
      const packet = body.packet || buildCapabilityPacket(body.objective || body.goal || "", body);
      return writeJson(res, 200, verifyCapabilityEvidence(packet, body.evidence || body.result || {}));
    }
    if (req.method === "GET" && url.pathname === "/api/k7/bridge") {
      return writeJson(res, 200, buildBridgePacket({
        root,
        goal: url.searchParams.get("goal") || "build KAIZEN7 brain vision arms bridge",
        project: url.searchParams.get("project") || "KAIZEN7",
        writeSignals: url.searchParams.get("write") === "1",
      }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/bridge") {
      return writeJson(res, 200, buildBridgePacket({ root, ...(await readBody(req)) }));
    }
    if (req.method === "GET" && url.pathname === "/api/k7/strength") {
      return writeJson(res, 200, buildWeaknessToStrengthPlan({
        root,
        project: url.searchParams.get("project") || "KAIZEN7",
        weakness: url.searchParams.get("weakness") || url.searchParams.get("goal") || "turn a KAIZEN7 weakness into a verified strength",
      }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/strength") {
      return writeJson(res, 200, buildWeaknessToStrengthPlan({ root, ...(await readBody(req)) }));
    }
    if (req.method === "GET" && url.pathname === "/api/k7/evolve") {
      return writeJson(res, 200, buildEvolutionInbox({
        root,
        project: url.searchParams.get("project") || "KAIZEN7",
      }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/evolve") {
      return writeJson(res, 200, buildEvolutionInbox({ root, ...(await readBody(req)) }));
    }
    if (req.method === "GET" && url.pathname === "/api/k7/tickets") {
      return writeJson(res, 200, buildActionQueueTickets({
        root,
        project: url.searchParams.get("project") || "KAIZEN7",
      }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/tickets") {
      return writeJson(res, 200, buildActionQueueTickets({ root, ...(await readBody(req)) }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/eval") {
      return writeJson(res, 200, buildEvalHarness(await readBody(req)));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/loop") {
      return writeJson(res, 200, await runK7Loop({ root, ...(await readBody(req)) }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/handoff/validate") {
      return writeJson(res, 200, validateAiHandoffResponse(await readBody(req)));
    }
    if (req.method === "GET" && url.pathname === "/api/k7/models") {
      return writeJson(res, 200, { providers: listModelProviders(readConfig()) });
    }
    if (req.method === "POST" && url.pathname === "/api/k7/models") {
      const body = await readBody(req);
      if (!body.provider && !body.model && !body.messages) {
        return writeJson(res, 200, { providers: listModelProviders(readConfig()) });
      }
      return writeJson(res, 200, await callModelGateway({
        config: readConfig(),
        provider: body.provider,
        model: body.model,
        instructions: body.instructions || "Eres KAIZEN7 Model Gateway. Responde con criterio, brevedad y verificacion.",
        messages: body.messages || [{ role: "user", content: body.goal || body.objective || "" }],
      }));
    }
    if (req.method === "GET" && url.pathname === "/api/core/status") {
      return writeJson(res, 200, kaizenCore.status());
    }
    if (req.method === "POST" && url.pathname === "/api/k7/run") {
      const body = await readBody(req);
      const run = await buildAgentRun({
        root,
        goal: body.goal || body.objective || "",
        ingest: {
          githubUrls: Array.isArray(body.githubUrls) ? body.githubUrls : body.github ? [body.github] : [],
          huggingFaceUrls: Array.isArray(body.huggingFaceUrls) ? body.huggingFaceUrls : body.huggingface || body.hf ? [body.huggingface || body.hf] : [],
        },
      });
      return writeJson(res, 200, body.compact ? buildRunSummary(run) : run);
    }
    if (req.method === "POST" && url.pathname === "/api/k7/advise") {
      const body = await readBody(req);
      const advice = buildAgentAdvice({
        root,
        agent: body.agent || "agent",
        goal: body.goal || body.objective || "",
        capabilities: Array.isArray(body.capabilities) ? body.capabilities : [],
        contextBudget: Number(body.contextBudget || body.budget || 1200),
        riskTolerance: body.riskTolerance || body.risk || "low",
      });
      return writeJson(res, 200, body.compact ? buildAdviceSummary(advice) : advice);
    }
    if (req.method === "GET" && url.pathname === "/api/k7/codex") {
      return writeJson(res, 200, buildCodexBridge({ root, goal: url.searchParams.get("goal") || "connect Codex to KAIZEN7", frontier: url.searchParams.get("frontier") === "1" }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/codex") {
      return writeJson(res, 200, buildCodexBridge({ root, ...(await readBody(req)) }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/realize") {
      return writeJson(res, 200, buildCodexRealizerReport(await readBody(req)));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/connect") {
      return writeJson(res, 200, buildConnectorKernel({ root, ...(await readBody(req)) }));
    }
    if (req.method === "GET" && url.pathname === "/api/k7/onboard") {
      return writeJson(res, 200, { presets: listPresets() });
    }
    if (req.method === "POST" && url.pathname === "/api/k7/onboard") {
      return writeJson(res, 200, buildOnboarding({ root, ...(await readBody(req)) }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/improve") {
      return writeJson(res, 200, buildSelfImprovementLoop({ root, ...(await readBody(req)) }));
    }
    if (req.method === "GET" && url.pathname === "/api/k7/super") {
      return writeJson(res, 200, buildSupertoolPlan({
        root,
        goal: url.searchParams.get("goal") || "orchestrate KAIZEN7",
        intent: url.searchParams.get("intent") || "",
        writeSignals: url.searchParams.get("write") === "1",
      }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/super") {
      return writeJson(res, 200, buildSupertoolPlan({ root, ...(await readBody(req)) }));
    }
    if (req.method === "GET" && url.pathname === "/api/k7/brain") {
      return writeJson(res, 200, buildSecondBrain({
        root,
        goal: url.searchParams.get("goal") || "use KAIZEN7 as second brain",
        writeSignals: url.searchParams.get("write") === "1",
      }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/brain") {
      return writeJson(res, 200, buildSecondBrain({ root, ...(await readBody(req)) }));
    }
    if (req.method === "GET" && url.pathname === "/api/k7/adapters") {
      return writeJson(res, 200, { kinds: listAdapterKinds() });
    }
    if (req.method === "POST" && url.pathname === "/api/k7/adapters/plan") {
      return writeJson(res, 200, buildAdapterPlan(await readBody(req)));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/openhands") {
      return writeJson(res, 200, buildOpenHandsAdapterPlan({ root, ...(await readBody(req)) }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/claude-flow") {
      return writeJson(res, 200, buildClaudeFlowAdapterPlan({ root, ...(await readBody(req)) }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/hermes") {
      return writeJson(res, 200, buildHermesAgentAdapterPlan({ root, ...(await readBody(req)) }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/jcode") {
      return writeJson(res, 200, buildJcodeAdapterPlan({ root, ...(await readBody(req)) }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/mission") {
      return writeJson(res, 200, buildMissionPacket({ root, ...(await readBody(req)) }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/harness/route") {
      return writeJson(res, 200, routeMission({ root, ...(await readBody(req)) }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/harness/dry-run") {
      return writeJson(res, 200, buildHarnessDryRun({ root, ...(await readBody(req)) }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/operating") {
      return writeJson(res, 200, buildK7OperatingLayer({ root, ...(await readBody(req)) }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/headroom") {
      return writeJson(res, 200, buildHeadroomAdapterPlan({ root, ...(await readBody(req)) }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/context") {
      return writeJson(res, 200, buildK7ContextLayer({ root, ...(await readBody(req)) }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/paperclip") {
      return writeJson(res, 200, buildPaperclipAdapterPlan({ root, ...(await readBody(req)) }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/control") {
      return writeJson(res, 200, buildK7ControlPlane({ root, ...(await readBody(req)) }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/toolchain") {
      return writeJson(res, 200, buildToolchainPlan(await readBody(req)));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/toolchain/evaluate") {
      return writeJson(res, 200, evaluateToolchainResult(await readBody(req)));
    }
    if (req.method === "GET" && url.pathname === "/api/k7/frontier") {
      return writeJson(res, 200, buildFrontierOperatorBrief({ root, writeSignals: url.searchParams.get("write") === "1" }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/frontier") {
      return writeJson(res, 200, buildFrontierOperatorBrief({ root, ...(await readBody(req)) }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/openai/activate") {
      return writeJson(res, 200, await runOpenAIProjectActivation({ root, ...(await readBody(req)) }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/openai/advise") {
      return writeJson(res, 200, adviseOpenAIAgent({ root, ...(await readBody(req)) }));
    }
    if (req.method === "POST" && url.pathname === "/api/k7/openai/verify") {
      return writeJson(res, 200, verifyOpenAIWriteback(await readBody(req)));
    }
    if (req.method === "GET" && url.pathname === "/api/workspace") {
      return writeJson(res, 200, workspaceStore.summary(url.searchParams.get("projectId") || ""));
    }
    if (req.method === "GET" && url.pathname === "/api/search") {
      const query = (url.searchParams.get("q") || "").trim().toLowerCase();
      if (!query) return writeJson(res, 200, { results: [] });
      const workspace = workspaceStore.read();
      const groups = [
        ["project", workspace.projects], ["campaign", workspace.campaigns], ["task", workspace.tasks], ["content", workspace.content],
      ];
      const results = groups.flatMap(([type, items]) => items.filter((item) => JSON.stringify(item).toLowerCase().includes(query)).map((item) => ({ type, id: item.id, title: item.name || item.title, detail: item.product || item.objective || item.description || item.body || "", projectId: item.projectId || item.id })));
      const memories = kaizenCore.searchMemory(query).map((item) => ({ type: "memory", id: item.id, title: item.type, detail: item.content, projectId: "" }));
      return writeJson(res, 200, { results: [...results, ...memories].slice(0, 20) });
    }
    if (req.method === "GET" && url.pathname === "/api/workspace/export") {
      res.writeHead(200, {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="kaizen7-workspace-${new Date().toISOString().slice(0, 10)}.json"`,
      });
      return res.end(JSON.stringify(workspaceStore.read(), null, 2));
    }
    if (req.method === "POST" && url.pathname === "/api/workspace/projects") {
      return writeJson(res, 201, { project: workspaceStore.createProject(await readBody(req)) });
    }
    if (req.method === "POST" && url.pathname === "/api/workspace/campaigns") {
      return writeJson(res, 201, { campaign: workspaceStore.createCampaign(await readBody(req)) });
    }
    if (req.method === "POST" && url.pathname === "/api/workspace/tasks") {
      return writeJson(res, 201, { task: workspaceStore.createTask(await readBody(req)) });
    }
    if (req.method === "PATCH" && /^\/api\/workspace\/tasks\/[^/]+$/.test(url.pathname)) {
      return writeJson(res, 200, { task: workspaceStore.updateTask(url.pathname.split("/")[4], await readBody(req)) });
    }
    if (req.method === "POST" && url.pathname === "/api/workspace/content") {
      return writeJson(res, 201, { content: workspaceStore.createContent(await readBody(req)) });
    }
    if (req.method === "GET" && url.pathname === "/api/core/tools") {
      return writeJson(res, 200, { tools: toolCatalog });
    }
    if (req.method === "GET" && url.pathname === "/api/core/approvals") {
      return writeJson(res, 200, { approvals: kaizenCore.listApprovals(url.searchParams.get("status") || "") });
    }
    if (req.method === "GET" && url.pathname === "/api/memory/search") {
      return writeJson(res, 200, {
        results: kaizenCore.searchMemory(url.searchParams.get("q") || "", url.searchParams.get("product") || ""),
      });
    }
    if (req.method === "GET" && url.pathname === "/api/genome") {
      const genome = readGenome();
      return writeJson(res, 200, { genome, summary: genomeSummary(genome) });
    }
    if (req.method === "POST" && url.pathname === "/api/genome/records") {
      return writeJson(res, 201, addGenomeRecord(await readBody(req)));
    }
    if (req.method === "GET" && url.pathname === "/api/metabrowser/runs") {
      return writeJson(res, 200, { runs: metaBrowser.readRuns().slice().reverse().slice(0, 20) });
    }
    if (req.method === "POST" && url.pathname === "/api/metabrowser/trend-search") {
      const body = await readBody(req);
      const result = await metaBrowser.trendSearch(body);
      let genome = null;
      if (result.signals.length) {
        genome = addGenomeRecord({
          type: "creative",
          name: `MetaBrowser: ${body.query}`,
          product: body.product || "",
          hypothesis: `Buscar senales de ${body.platform || "web"} sobre ${body.query}`,
          result: result.summary,
          metric: `${result.signals.length} senales`,
          evidence: result.signals.map((signal) => signal.source).filter(Boolean).slice(0, 5).join(" | "),
          confidence: body.confidence || "medium",
        });
      }
      return writeJson(res, 201, { ...result, genome });
    }
    if (req.method === "POST" && url.pathname === "/api/core/run") {
      return writeJson(res, 201, await runKaizenOperator(await readBody(req)));
    }
    if (req.method === "POST" && /^\/api\/core\/approvals\/[^/]+\/decision$/.test(url.pathname)) {
      const approvalId = url.pathname.split("/")[4];
      const body = await readBody(req);
      const approval = kaizenCore.decideApproval(approvalId, body.decision, body.note || "");
      if (approval.status === "rejected") {
        workspaceStore.syncRun(approval.runId, "cancelled");
        return writeJson(res, 200, { approval });
      }
      try {
        const result = await executeApprovedTool(approval);
        workspaceStore.syncRun(approval.runId, "done");
        return writeJson(res, 200, { approval: kaizenCore.finishApproval(approval.id, result), result });
      } catch (error) {
        workspaceStore.syncRun(approval.runId, "blocked");
        kaizenCore.finishApproval(approval.id, null, error.message);
        throw error;
      }
    }
    if (req.method === "POST" && url.pathname === "/api/memory") {
      return writeJson(res, 201, { memory: kaizenCore.remember(await readBody(req)) });
    }
    if (req.method === "POST" && url.pathname === "/api/judge") {
      return writeJson(res, 201, { evaluation: kaizenCore.evaluate(await readBody(req)) });
    }
    if (req.method === "POST" && url.pathname === "/api/chat") return writeJson(res, 200, await callChat(await readBody(req)));
    if (req.method === "POST" && url.pathname === "/api/shopify/draft-product") {
      const body = await readBody(req);
      return writeJson(res, 202, queueExternalAction("shopify.product.draft", body, body.title));
    }
    if (req.method === "POST" && url.pathname === "/api/social/meta") {
      const body = await readBody(req);
      return writeJson(res, 202, queueExternalAction("social.meta.publish", body));
    }
    if (req.method === "POST" && url.pathname === "/api/social/linkedin") {
      const body = await readBody(req);
      return writeJson(res, 202, queueExternalAction("social.linkedin.publish", body));
    }
    if (req.method === "POST" && url.pathname === "/api/social/instagram") {
      const body = await readBody(req);
      return writeJson(res, 202, queueExternalAction("social.instagram.publish", body));
    }
    if (req.method === "POST" && url.pathname === "/api/social/x") {
      const body = await readBody(req);
      return writeJson(res, 202, queueExternalAction("social.x.publish", body));
    }
    if (req.method === "POST" && url.pathname === "/api/mcp/call") {
      const body = await readBody(req);
      return writeJson(res, 200, await callMcp(body.server, body.method, body.params || {}));
    }
    return serveStatic(req, res);
  } catch (error) {
    writeJson(res, 500, { error: error.message });
  }
}

http.createServer(router).listen(port, () => {
  console.log(`KAIZEN7 WebUI running on http://localhost:${port}`);
});
