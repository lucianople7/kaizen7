import { Mastra } from "mastra";
import { Agent } from "mastra/agent";
import path from "node:path";
import fs from "node:fs";

// Leer el contexto de THE FOCUX
function readTheFocuxState() {
  try {
    const p = path.join(process.cwd(), "data", "thefocux-backend.json");
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch (e) {
    console.error("No se pudo leer thefocux-backend.json", e);
  }
  return {};
}

// Selección dinámica del mejor modelo disponible según las APIs configuradas
function getBestAvailableModel() {
  if (process.env.DEEPSEEK_API_KEY) return "openai:deepseek-chat"; // DeepSeek (via OpenAI compatible)
  if (process.env.QWEN_API_KEY) return "openai:qwen-max"; // Qwen (via DashScope/OpenAI compatible)
  if (process.env.ZAI_API_KEY) return "openai:zai-model"; // Z.ai (via OpenAI compatible)
  if (process.env.KIMI_API_KEY) return "openai:moonshot-v1-32k"; // Kimi/Moonshot
  if (process.env.ANTHROPIC_API_KEY) return "anthropic:claude-3-5-sonnet-20240620";
  if (process.env.GEMINI_API_KEY) return "google:gemini-1.5-pro-latest";
  if (process.env.OPENAI_API_KEY) return "openai:gpt-4o";
  return "openai:gpt-4o"; // Fallback por defecto
}

// 1. Agente Principal: KAIZEN7 Kernel
const kaizenAgent = new Agent({
  name: "kaizen7",
  instructions: `Eres KAIZEN7, el kernel de coordinación de THE FOCUX OS.
  Tu objetivo es orquestar misiones basándote en la identidad de marca premium, sobria y sin humo.
  No eres 'Mr. Kaizen', eres el kernel del sistema. Kaizen (el mentor) es una de las caras públicas.
  Flowmatik es el motor interno de render, y no existen referencias a NEUROCITY.`,
  model: getBestAvailableModel(),
});

// 2. Agente Especializado: Flowmatik Engine
const flowmatikAgent = new Agent({
  name: "flowmatik",
  instructions: `Eres Flowmatik, el motor interno de producción visual y datos estructurados de THE FOCUX OS.
  Operas bajo una estética Tokyo Brutalist: alto contraste, precisión militar, cero humo.`,
  model: getBestAvailableModel(),
});

// Inicializar el kernel de Mastra con múltiples agentes
export const mastra = new Mastra({
  agents: { kaizen7: kaizenAgent, flowmatik: flowmatikAgent },
  logger: console,
});

async function runOrchestration() {
  console.log("=== KAIZEN7 MASTRA KERNEL INICIADO ===");
  const state = readTheFocuxState();
  console.log("Estado actual de THE FOCUX cargado:", state?.brand?.name || "No encontrado");
  console.log("Modelo primario seleccionado:", getBestAvailableModel());

  try {
    const result = await kaizenAgent.generate("Genera un reporte rápido de 2 líneas sobre nuestro posicionamiento actual.");
    console.log("\n[KAIZEN7 Kernel Response]:");
    console.log(result.text);
  } catch (error) {
    console.log("\n[ERROR] No se pudo contactar al modelo.");
    console.log("Asegúrate de exportar al menos una de las siguientes variables de entorno:");
    console.log("- DEEPSEEK_API_KEY (DeepSeek Chat/Coder)");
    console.log("- QWEN_API_KEY (Alibaba Qwen)");
    console.log("- ZAI_API_KEY (Z.ai)");
    console.log("- KIMI_API_KEY (Moonshot Kimi)");
    console.log("- ANTHROPIC_API_KEY (Claude 3.5 Sonnet)");
    console.log("- GEMINI_API_KEY (Gemini 1.5 Pro)");
    console.log("- OPENAI_API_KEY (GPT-4o)");
    console.log("\nDetalle técnico:", error.message);
  }
}

if (process.argv[1] === new URL(import.meta.url).pathname || process.argv[1] === __filename) {
  runOrchestration();
}
