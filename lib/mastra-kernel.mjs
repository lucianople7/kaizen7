import dotenv from "dotenv";
import { Mastra } from "@mastra/core";
import { Agent } from "@mastra/core/agent";
import { createEventedAgent } from "@mastra/core/agent/durable";
import { ConsoleLogger } from "@mastra/core/logger";
import { LibSQLStore } from "@mastra/libsql";
import { AgentBrowser } from "@mastra/agent-browser";
import { MockMemory } from "@mastra/core/memory";
import { RequestContext } from "@mastra/core/request-context";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Cargar .env de la raiz de kaizen7 de forma explicita: este kernel se importa
// tanto corriendo desde kaizen7/ como desde thefocuxOS/ (Next.js API routes),
// y el auto-loader de "dotenv/config" busca .env en process.cwd(), que en el
// segundo caso apuntaria al .env equivocado (o a ninguno).
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Import Tools
import { githubTool } from "./tools/github-tool.mjs";
import { huggingfaceTool } from "./tools/huggingface-tool.mjs";
import { exaTool } from "./tools/exa-tool.mjs";
import { arxivTool } from "./tools/arxiv-tool.mjs";
import { hackernewsTool } from "./tools/hackernews-tool.mjs";
import { obsidianSearchTool } from "./tools/obsidian-search-tool.mjs";
import { openclawTool } from "./tools/openclaw-tool.mjs";
import { cliHubTool } from "./tools/cli-hub-tool.mjs";

// Import Skills
import { kaizen7BrandDoctrine } from "./skills/kaizen7-brand-doctrine.mjs";

// Router de complejidad (solo aplica dentro del catalogo ARK/ModelArk)
import { classifyComplexity, resolveArkModel, resolveArkModelId } from "./model-router.mjs";

// Filtro de capabilities: cualquier prompt entrante (de OpenClaw, thefocuxOS,
// o donde sea) pasa primero por esto antes de que el agente actue.
import { resolveCapabilities } from "./capabilities/resolver.js";
import providerRegistry from "./provider-registry.js";

const { resolveKernelModelId } = providerRegistry;

// Leer el contexto de THE FOCUX
function readTheFocuxState() {
  try {
    const p = path.join(__dirname, "..", "data", "thefocux-backend.json");
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    console.error("No se pudo leer thefocux-backend.json", e);
  }
  return {};
}

// Configurar ARK API (ByteDance / Z.AI) como proveedor principal OpenAI-compatible
if (process.env.ARK_API_KEY) {
  process.env.OPENAI_API_KEY = process.env.ARK_API_KEY;
  process.env.OPENAI_BASE_URL = "https://ark.ap-southeast.bytepluses.com/api/coding/v3";
}

// Selección dinámica del mejor modelo disponible según las APIs configuradas
// (fallback para cuando ARK no esta configurada, o como base sin señal de complejidad).
function getBestAvailableModel() {
  return resolveKernelModelId(process.env);
}

// Router dinamico por request: cuando ARK_API_KEY esta activa, elige entre
// glm-4.7 (barato, tareas normales) y glm-5.1 (caro, reservado para tareas
// dificiles) segun la complejidad. Fuera de ARK, se mantiene el fallback fijo.
function resolveKernelModel({ requestContext } = {}) {
  if (!process.env.ARK_API_KEY) return getBestAvailableModel();
  const explicitComplexity = requestContext?.get?.("complexity");
  const complexity = explicitComplexity || "simple";
  return resolveArkModel(complexity);
}

// Navegador propio del kernel (Playwright + refs de accesibilidad). Headless por
// defecto: este agente corre como kernel de fondo, no como demo visual.
const kaizenBrowser = new AgentBrowser({ headless: true });

// 1. Agente Principal: KAIZEN7 Kernel
const kaizenAgent = new Agent({
  name: "kaizen7",
  instructions: `Eres KAIZEN7, el kernel de coordinación de THE FOCUX OS.
  Tu objetivo es orquestar misiones basándote en la identidad de marca premium, sobria y sin humo.
  No eres 'Mr. Kaizen', eres el kernel del sistema. Kaizen (el mentor) es una de las caras públicas.
  Flowmatik es el motor interno de render, y no existen referencias a NEUROCITY.

  Si el objetivo no matchea ninguna capability interna conocida (needs_triage),
  antes de improvisar con execute_openclaw usa execute_cli_hub con args
  ["search", "<palabras clave>"] para ver si el registro real de CLI-Anything
  ya tiene una herramienta hecha y probada para esto. Si cli-hub la tiene,
  proponé instalarla (cli-hub install <nombre>) en vez de reinventarla.`,
  model: resolveKernelModel,
  browser: kaizenBrowser,
  memory: new MockMemory(),
  skills: [
    kaizen7BrandDoctrine,
    path.join(__dirname, "..", ".agents", "skills", "kaizen-video-iteration-agent"),
  ],
  tools: {
    analyze_github_repo: githubTool,
    analyze_huggingface_repo: huggingfaceTool,
    search_exa_web: exaTool,
    search_arxiv_papers: arxivTool,
    search_hacker_news: hackernewsTool,
    search_obsidian_vault: obsidianSearchTool,
    execute_openclaw: openclawTool,
    execute_cli_hub: cliHubTool
  }
});

// Envolver a KAIZEN7 como agente durable "evented": el loop agentico corre en
// background sin bloquear al caller. Un cliente puede desconectarse y
// reconectarse con observe(runId) sin perder chunks (mission control JARVIS-style).
export const eventedKaizenAgent = createEventedAgent({ agent: kaizenAgent });

const KAIZEN7_ROOT = path.join(__dirname, "..");

/**
 * Puerta de entrada real de KAIZEN7: cualquier objetivo entrante (OpenClaw,
 * thefocuxOS, o cualquier otro agente) pasa primero por aca.
 *
 * 1) Resuelve la capability/dominio via el registro real (data/capabilities.json).
 * 2) Si esa capability requiere approval gates (publish, delete, medical_claims,
 *    credential_write, install_dependencies...) y el caller no mando approved:true,
 *    KAIZEN7 se detiene y NO ejecuta nada -- devuelve needs_approval en vez de
 *    adivinar. Esto es "KAIZEN7 filtra", no solo "KAIZEN7 informa".
 * 3) Si esta libre de aprobar, recien ahi deja correr al agente conversacional
 *    (con la complejidad + dominio ya inyectados en el requestContext).
 */
export async function handleKaizenPrompt(prompt, options = {}) {
  const resolution = resolveCapabilities(prompt, { root: KAIZEN7_ROOT });

  if (resolution.approvalGates.length > 0 && !options.approved) {
    return {
      status: "needs_approval",
      approvalGates: resolution.approvalGates,
      inferredDomain: resolution.inferredDomain,
      capabilities: resolution.selected.map((c) => c.id),
      message: `Este objetivo toca capabilities con approval gates (${resolution.approvalGates.join(", ")}). Reenviar con approved:true para continuar.`,
    };
  }

  const complexity = options.complexity || classifyComplexity(prompt);
  const requestContext = new RequestContext();
  requestContext.set("complexity", complexity);
  requestContext.set("domain", resolution.inferredDomain);

  const result = await eventedKaizenAgent.generate(prompt, {
    memory: {
      thread: options.thread || "kaizen7-gateway",
      resource: options.resource || "kaizen7-gateway",
    },
    requestContext,
  });

  return {
    status: "ok",
    text: result.text,
    inferredDomain: resolution.inferredDomain,
    capabilities: resolution.selected.map((c) => c.id),
    // "ready" = matcheo una capability interna real; "needs_triage" = ninguna
    // capability interna matcheo, el agente tuvo que resolverlo sin esa guia
    // (idealmente via execute_cli_hub, ver instructions). Distinguirlo permite
    // ver, con datos reales, cuando el registro interno tiene un hueco.
    resolutionStatus: resolution.status,
    complexity,
  };
}

// Inicializar el kernel de Mastra con Agente Único (version evented, fire-and-forget)
// Storage persistente: los background tasks y los runs evented necesitan sobrevivir
// a un reinicio del proceso (archivo local, sin dependencias externas).
export const mastra = new Mastra({
  agents: { kaizen7: eventedKaizenAgent },
  logger: new ConsoleLogger(),
  // Ruta absoluta anclada a este archivo (no a process.cwd()): el kernel se
  // importa tanto desde la raiz de kaizen7 como desde thefocuxOS/ (Next.js
  // API routes), y una ruta relativa apuntaria a data/ dentro del directorio
  // equivocado segun quien lo importe.
  storage: new LibSQLStore({
    id: "storage",
    url: `file:${path.join(__dirname, "..", "data", "mastra.db")}`,
  }),
  backgroundTasks: {
    enabled: true,
    globalConcurrency: 10,
    perAgentConcurrency: 5,
    backpressure: "queue",
    defaultTimeoutMs: 300_000,
  },
});

async function runOrchestration() {
  console.log("=== KAIZEN7 MASTRA KERNEL INICIADO ===");
  const state = readTheFocuxState();
  console.log("Estado actual de THE FOCUX cargado:", state?.brand?.name || "No encontrado");

  const prompt = "Genera un reporte rápido de 2 líneas sobre nuestro posicionamiento actual.";
  const complexity = classifyComplexity(prompt);
  const requestContext = new RequestContext();
  requestContext.set("complexity", complexity);
  const modelLabel = process.env.ARK_API_KEY
    ? `byteplus-ark/${resolveArkModelId(complexity)} (chat completions)`
    : getBestAvailableModel();
  console.log("Modelo primario seleccionado:", modelLabel);
  console.log("Complejidad detectada:", complexity);

  try {
    const { output, runId, cleanup } = await eventedKaizenAgent.stream(
      prompt,
      { memory: { thread: "kernel-demo", resource: "kernel-demo" }, requestContext },
    );
    console.log("\n[KAIZEN7 Kernel runId]:", runId, "(usar con observe() para reconectar)");
    console.log("\n[KAIZEN7 Kernel Response]:");
    for await (const chunk of output.fullStream) {
      if (chunk.type === "text-delta") process.stdout.write(chunk.payload?.text || "");
    }
    console.log("");
    cleanup();
  } catch (error) {
    console.log("\n[ERROR] No se pudo contactar al modelo.");
    console.log("Asegúrate de exportar al menos una de las siguientes variables de entorno:");
    console.log("- DEEPSEEK_API_KEY (DeepSeek Chat/Coder)");
    console.log("- QWEN_API_KEY (Alibaba Qwen)");
    console.log("- ZAI_API_KEY (Z.ai)");
    console.log("- KIMI_API_KEY (Moonshot Kimi)");
    console.log("- ANTHROPIC_API_KEY (Anthropic)");
    console.log("- GEMINI_API_KEY (Google Gemini)");
    console.log("- OPENAI_API_KEY (OpenAI)");
    console.log("\nDetalle técnico:", error.message);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runOrchestration();
}
