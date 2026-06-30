const templates = {
  focux: {
    brand: "THE FOCUX",
    offer: "FOCUX KETO PERFORMANCE",
    audience: "programadores, emprendedores, directivos, traders y conductores profesionales",
    category: "suplemento premium de rendimiento",
    promise: "rendimiento mental y fisico para personas con responsabilidades reales",
    tone: "Premium",
    chips: ["Premium", "Dosis reales", "Transparencia", "Lista privada", "Negro/oro"],
    mantra: "No energia barata. Rendimiento serio.",
    risk: "claims, dosis, regulacion y fabricantes",
    mechanism: "formula corta, transparente y de alto valor",
    proof: "dosis utiles, materias primas premium y etiqueta clara",
  },
  generic: {
    brand: "Nueva Marca",
    offer: "Producto principal",
    audience: "clientes con un problema urgente y capacidad de compra",
    category: "producto de consumo",
    promise: "resolver un problema concreto mejor que las alternativas actuales",
    tone: "Directo",
    chips: ["Oferta clara", "Validacion", "Diferenciacion", "Ecommerce", "Testing"],
    mantra: "De idea a demanda validada.",
    risk: "demanda, margen, diferenciacion y canal",
    mechanism: "beneficio claro, prueba y oferta simple",
    proof: "testimonios, demostracion, comparativas y datos de uso",
  },
  beauty: {
    brand: "Aura Lab",
    offer: "Serum reparador nocturno",
    audience: "mujeres y hombres de 30-55 que buscan piel cuidada sin rutinas complicadas",
    category: "beauty / skincare",
    promise: "mejorar la percepcion de piel cuidada con una rutina simple y premium",
    tone: "Aspiracional",
    chips: ["Sensorial", "Rutina", "Antes/despues", "Ingredientes", "Premium"],
    mantra: "Menos pasos. Mejor ritual.",
    risk: "claims cosmeticos, sensibilidad, pruebas y confianza",
    mechanism: "ingredientes activos, textura agradable y ritual nocturno",
    proof: "UGC, fotos consistentes, ingredientes y pruebas de tolerancia",
  },
  digital: {
    brand: "OpsPilot",
    offer: "SaaS de automatizacion operativa",
    audience: "fundadores, operadores y equipos pequenos con procesos repetitivos",
    category: "producto digital / SaaS",
    promise: "ahorrar horas operativas convirtiendo procesos repetidos en flujos automatizados",
    tone: "Educativo",
    chips: ["SaaS", "Demo", "ROI", "Onboarding", "Retencion"],
    mantra: "Menos tareas. Mas sistema.",
    risk: "activacion, retencion, integraciones y soporte",
    mechanism: "workflows, plantillas, integraciones y reporting",
    proof: "demo, casos de uso, tiempo ahorrado y metricas de activacion",
  },
  food: {
    brand: "Noma Fuel",
    offer: "Bebida funcional premium",
    audience: "profesionales activos que quieren energia limpia sin exceso de azucar",
    category: "food / beverage",
    promise: "energia limpia y ritual diario con sabor premium",
    tone: "Premium",
    chips: ["Sabor", "Ritual", "Funcional", "Sampling", "Retail"],
    mantra: "Energia limpia. Ritual serio.",
    risk: "sabor, vida util, regulacion alimentaria y distribucion",
    mechanism: "ingredientes funcionales, saborizacion y formato conveniente",
    proof: "sampling, reviews, recompra y pruebas de sabor",
  },
  fashion: {
    brand: "Atelier North",
    offer: "Chaqueta tecnica urbana",
    audience: "profesionales urbanos que buscan ropa sobria, funcional y duradera",
    category: "fashion / lifestyle",
    promise: "estilo sobrio y funcionalidad diaria sin parecer ropa tecnica",
    tone: "Aspiracional",
    chips: ["Drop", "Materiales", "Fit", "Lifestyle", "Escasez"],
    mantra: "Funcion sin ruido.",
    risk: "fit, devoluciones, inventario y coste de produccion",
    mechanism: "patronaje, materiales, detalles funcionales y drop limitado",
    proof: "lookbook, UGC, reviews de fit y detalles de fabricacion",
  },
};

const views = {
  command: "Comando",
  connectors: "Conectores",
  radar: "Market Radar",
  sourcing: "Sourcing",
  content: "Content Engine",
  ads: "Ad Lab",
  store: "E-commerce",
  profit: "Margen",
  calendar: "Calendario",
  analytics: "Metricas",
  agents: "Agentes",
  stack: "Stack",
  moat: "Product Genome",
  pipeline: "Pipeline",
};

const fields = {
  template: document.querySelector("#templateInput"),
  brand: document.querySelector("#brandInput"),
  offer: document.querySelector("#offerInput"),
  audience: document.querySelector("#audienceInput"),
  category: document.querySelector("#categoryInput"),
  promise: document.querySelector("#promiseInput"),
  goal: document.querySelector("#goalInput"),
  channel: document.querySelector("#channelInput"),
  mode: document.querySelector("#contentMode"),
  tone: document.querySelector("#toneInput"),
};

const chatLog = document.querySelector("#chatLog");
const promptInput = document.querySelector("#promptInput");
const agentInput = document.querySelector("#agentInput");
const imageInput = document.querySelector("#imageInput");
const imagePreview = document.querySelector("#imagePreview");
let attachedImage = "";
const conversation = [];
let activeProjectId = localStorage.getItem("kaizen7.activeProject") || "";
let searchTimer;

function currentTemplate() {
  return templates[fields.template.value] || templates.generic;
}

function brief() {
  const template = currentTemplate();
  return {
    template,
    brand: fields.brand.value.trim() || template.brand,
    offer: fields.offer.value.trim() || template.offer,
    audience: fields.audience.value.trim() || template.audience,
    category: fields.category.value.trim() || template.category,
    promise: fields.promise.value.trim() || template.promise,
    goal: fields.goal.value,
    channel: fields.channel.value,
    mode: fields.mode ? fields.mode.value : "Campana 7 dias",
    tone: fields.tone ? fields.tone.value : template.tone,
  };
}

function addMessage(role, text) {
  const node = document.createElement("div");
  node.className = `message ${role}`;
  node.textContent = text;
  chatLog.append(node);
  chatLog.scrollTop = chatLog.scrollHeight;
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { "content-type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || `Error ${response.status}`);
  return json;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function liveAssistantReply(prompt) {
  const content = attachedImage
    ? [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: attachedImage } },
      ]
    : prompt;
  conversation.push({ role: "user", content });
  const reply = await api("/api/chat", {
    method: "POST",
    body: JSON.stringify({ messages: conversation, agent: agentInput.value }),
  });
  conversation.push(reply);
  return typeof reply.content === "string" ? reply.content : JSON.stringify(reply.content, null, 2);
}

function assistantReply(prompt) {
  const data = brief();
  const ask = prompt.toLowerCase();
  if (ask.includes("growth") || ask.includes("7 dias") || ask.includes("campana")) return growthPack(data);
  if (ask.includes("mercado") || ask.includes("competidor") || ask.includes("keywords") || ask.includes("radar")) return marketPack(data);
  if (ask.includes("proveedor") || ask.includes("fabricante") || ask.includes("rfq") || ask.includes("sourcing")) return sourcingPack(data);
  if (ask.includes("margen") || ask.includes("precio") || ask.includes("coste") || ask.includes("profit")) return profitPack(data);
  if (ask.includes("anuncio") || ask.includes("ads") || ask.includes("facebook") || ask.includes("meta")) return adPack(data);
  if (ask.includes("pdp") || ask.includes("ecommerce") || ask.includes("tienda") || ask.includes("producto")) return pdpPack(data);
  if (ask.includes("email") || ask.includes("secuencia")) return emailPack(data);
  return decisionBrief(data);
}

function asArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function renderAiPills(node, items, empty = "Sin datos.") {
  node.innerHTML = items.length
    ? items.map((item) => `<span class="ai-pill">${escapeHtml(item)}</span>`).join("")
    : `<span class="ai-pill">${escapeHtml(empty)}</span>`;
}

function renderAiAction(title, steps = []) {
  document.querySelector("#aiActionOutput").innerHTML = [
    `<strong>${escapeHtml(title || "Accion pendiente")}</strong>`,
    ...steps.map(
      (step) => `<div class="ai-step"><span>${escapeHtml(step.label)}</span><p>${escapeHtml(step.value || "Pendiente")}</p></div>`,
    ),
  ].join("");
}

function renderRunResult(result) {
  const action = result.action || {};
  const actionText = action.next || action.type || "Definir la siguiente accion verificable.";
  renderAiAction(actionText, [
    { label: "Modulo", value: action.module || "KAIZEN7" },
    { label: "Candidato", value: action.candidate || "Proyecto activo" },
    { label: "Comandos", value: asArray(result.commands).join("\n") || "npm.cmd run k7:check" },
  ]);
  renderAiPills(document.querySelector("#aiContextOutput"), asArray(result.memory), "No hay memoria recomendada.");
  renderAiPills(document.querySelector("#aiGuardOutput"), asArray(result.skills), "Sin skills adicionales.");
  renderAiPills(document.querySelector("#aiVerifyOutput"), [
    "Ejecutar la accion minima.",
    "Verificar con comando, diff o checklist.",
    "Guardar aprendizaje en Obsidian.",
  ]);
}

function renderAdviceResult(result) {
  const advice = result.advice || result;
  const action = advice.action || advice.firstAction || "Preparar contexto antes de actuar.";
  renderAiAction(action, [
    { label: "Agente", value: result.agent || advice.agent || document.querySelector("#aiAgentSelect").value },
    { label: "Token policy", value: advice.tokenPolicy || "metadata first; deep-read only selected memory and skills" },
    { label: "Primera accion", value: action },
  ]);
  renderAiPills(document.querySelector("#aiContextOutput"), asArray(advice.read || advice.readFirst || advice.memory), "No hay lecturas recomendadas.");
  renderAiPills(document.querySelector("#aiGuardOutput"), asArray(advice.avoid || advice.avoids || advice.risks), "Sin bloqueos detectados.");
  renderAiPills(document.querySelector("#aiVerifyOutput"), [
    "No cerrar sin evidencia.",
    "No publicar, borrar, gastar o desplegar sin aprobacion.",
    "Escribir decision y resultado en memoria.",
  ]);
}

function renderOpenAIAdapterResult(result) {
  const activation = result.projectActivation || {};
  renderAiAction(activation.action || "OpenAI adapter ready", [
    { label: "Runtime", value: result.runtime || "local-compatible" },
    { label: "SDK", value: result.sdk?.available ? (result.sdk.blocked ? `blocked: ${result.sdk.reason}` : "available") : result.sdk?.reason || "not installed" },
    { label: "Token policy", value: result.tokenPolicy || "metadata first; selected context only" },
  ]);
  renderAiPills(document.querySelector("#aiContextOutput"), asArray(activation.contextPack), "No hay contexto recomendado.");
  renderAiPills(document.querySelector("#aiGuardOutput"), [
    ...(activation.decisionGuard || []),
    ...asArray(activation.tools || []).map((tool) => `${tool.name}: ${tool.description}`),
  ], "Sin guardrails detectados.");
  renderAiPills(document.querySelector("#aiVerifyOutput"), asArray(activation.verification), "Verificacion pendiente.");
}

function renderModelGatewayResult(result) {
  const providers = asArray(result.providers);
  const configured = providers.filter((provider) => provider.configured);
  renderAiAction("Model Gateway listo para proveedores intercambiables.", [
    { label: "Configurados", value: configured.map((provider) => provider.name).join(", ") || "local-compatible sin claves externas" },
    { label: "Proveedores", value: providers.map((provider) => `${provider.name}: ${provider.type}`).join("\n") },
    { label: "Comando", value: "npm.cmd run k7:models -- --list" },
  ]);
  renderAiPills(
    document.querySelector("#aiContextOutput"),
    providers.map((provider) => `${provider.name} -> ${provider.model || "modelo por definir"}`),
    "No hay proveedores registrados.",
  );
  renderAiPills(
    document.querySelector("#aiGuardOutput"),
    providers.filter((provider) => !provider.configured).map((provider) => `${provider.apiKeyEnv} pendiente`),
    "Todos los proveedores estan configurados.",
  );
  renderAiPills(
    document.querySelector("#aiVerifyOutput"),
    [
      "El core de KAIZEN7 no depende de un proveedor.",
      "Elegir proveedor por coste, privacidad, latencia y razonamiento.",
      "Ningun proveedor publica, gasta o escribe memoria sin confirmacion.",
    ],
    "Verificacion pendiente.",
  );
}

function renderHarnessAdapterResult(result) {
  const isOperating = result.mode === "k7-operating-layer";
  const jcode = result.jcodeAdapter || result;
  renderAiAction(isOperating ? "K7 Operating Layer listo." : "jcode queda como harness candidato.", [
    { label: "Modo", value: result.mode || "jcode-adapter" },
    { label: "Relacion", value: jcode.relationship || result.thesis || "harness_candidate_not_core" },
    { label: "Autoridad", value: result.authority?.rule || jcode.kaizenAuthority || "KAIZEN7 decide; el harness ejecuta bajo gates." },
    { label: "Comandos", value: asArray(result.commands || jcode.commands).join("\n") || "npm.cmd run k7:jcode" },
  ]);
  renderAiPills(
    document.querySelector("#aiContextOutput"),
    [
      ...asArray(result.layers).map((layer) => `${layer.id}: ${layer.role}`),
      ...asArray(jcode.harnessRole?.adoptPatterns),
    ],
    "Sin patrones de harness.",
  );
  renderAiPills(
    document.querySelector("#aiGuardOutput"),
    [
      ...asArray(jcode.harnessRole?.forbidden),
      ...asArray(jcode.harnessPacket?.blockedModes).map((mode) => `Blocked: ${mode}`),
      ...asArray(result.marketPatternPolicy?.reject).map((item) => `Reject: ${item}`),
    ],
    "Sin bloqueos.",
  );
  renderAiPills(
    document.querySelector("#aiVerifyOutput"),
    [
      jcode.evaluation?.firstTest,
      jcode.evaluation?.successMetric ? `Metric: ${jcode.evaluation.successMetric}` : "",
      jcode.installPolicy?.current ? `Install: ${jcode.installPolicy.current}` : "",
      ...asArray(result.nextActions).map((item) => `${item.id}: ${item.status}`),
      ...asArray(jcode.gates),
    ].filter(Boolean),
    "Verificacion pendiente.",
  );
}

function renderHarnessDryRun(result) {
  const executor = result.route?.recommendedExecutor || {};
  document.querySelector("#harnessExecutor").textContent = executor.id || "manual";
  document.querySelector("#harnessReason").textContent = result.route?.reason || "Sin razon registrada.";
  document.querySelector("#harnessRisk").textContent = result.route?.mission?.risk || "unknown";
  document.querySelector("#harnessApproval").textContent = result.approval?.required ? "Requiere aprobacion humana." : "Dry-run seguro.";
  document.querySelector("#harnessVerify").textContent = asArray(result.verificationCommands).join(", ") || "npm.cmd run check";
  document.querySelector("#harnessSummary").innerHTML = `<strong>${escapeHtml(result.nextAction || "Preparar mision.")}</strong>`;
  renderAiPills(
    document.querySelector("#harnessDetails"),
    [
      `Command: ${result.command || "none"}`,
      ...asArray(result.stopRules).map((item) => `Stop: ${item}`),
      ...asArray(result.expectedEvidence).map((item) => `Evidence: ${item}`),
      result.memoryDraft ? `Memory: ${result.memoryDraft}` : "",
    ].filter(Boolean),
    "Sin dry-run.",
  );
}

async function runHarnessDryRun() {
  const mission = document.querySelector("#aiMissionInput").value.trim();
  if (!mission) {
    document.querySelector("#aiMissionInput").focus();
    return;
  }
  const result = await api("/api/k7/harness/dry-run", {
    method: "POST",
    body: JSON.stringify({
      objective: mission,
      project: document.querySelector("#aiPresetSelect").value === "flowmatik" ? "Flowmatik" : "KAIZEN7",
      capabilities: ["edit_code", "run_tests", "memory_writeback"],
    }),
  });
  renderHarnessDryRun(result);
}

function renderActivationDemoResult(result) {
  const before = result.before || {};
  const after = result.after || {};
  const launchCard = result.launchCard || {};
  const activationPack = result.activationPack || {};
  const aiHandoff = result.aiHandoff || {};
  renderAiAction(after.nextBestAction || "Ejecutar la accion minima verificable.", [
    { label: "Promesa", value: result.promise || "Goal in -> next action -> verification -> memory" },
    { label: "Friccion", value: result.proof?.frictionDrop || `${before.friction || "?"} -> ${after.friction || "?"}` },
    { label: "Readiness", value: activationPack.readiness ? `${activationPack.readiness} (${activationPack.confidence}/100)` : "execute-with-care" },
    { label: "AI Handoff", value: aiHandoff.protocol ? `${aiHandoff.protocol}@${aiHandoff.version} -> ${aiHandoff.to}` : "k7-ai-handoff" },
    { label: "Launch Card", value: asArray(launchCard.startNow).map((item, index) => `${index + 1}. ${item}`).join("\n") || "Ejecutar, verificar, guardar memoria." },
    { label: "Ruta modelo", value: launchCard.modelRoute ? `${launchCard.modelRoute.provider}: ${launchCard.modelRoute.reason}` : "model-gateway" },
  ]);
  renderAiPills(
    document.querySelector("#aiContextOutput"),
    [
      ...(after.contextPack || []),
      ...(launchCard.doneWhen || []).map((item) => `Done: ${item}`),
      ...(activationPack.timeline || []).map((item) => `${item.minute}: ${item.action}`),
      aiHandoff.compactPrompt ? `AI prompt: ${aiHandoff.compactPrompt}` : "",
    ],
    "No hay contexto minimo.",
  );
  renderAiPills(
    document.querySelector("#aiGuardOutput"),
    [
      ...asArray(after.guardrails),
      ...asArray(activationPack.stopRules),
      ...(aiHandoff.constraints ? Object.entries(aiHandoff.constraints).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`) : []),
      launchCard.maxContextBeforeAction ? `Max context before action: ${launchCard.maxContextBeforeAction} tokens` : "",
    ].filter(Boolean),
    "Sin riesgos especificos.",
  );
  renderAiPills(
    document.querySelector("#aiVerifyOutput"),
    [
      ...asArray(after.verification),
      activationPack.delegatePrompt ? `Delegate prompt: ${activationPack.delegatePrompt}` : "",
      aiHandoff.responseContract ? `Response contract: ${JSON.stringify(aiHandoff.responseContract)}` : "",
      launchCard.memoryDraft ? `Memory draft: ${launchCard.memoryDraft}` : "",
    ].filter(Boolean),
    "Verificacion pendiente.",
  );
}

function renderHandoffValidationResult(result) {
  renderAiAction(`K7 Judge: ${result.decision || "pending"}`, [
    { label: "Estado", value: result.status || "unknown" },
    { label: "Score", value: String(result.score ?? "n/a") },
    { label: "Siguiente accion", value: result.nextAction || "Esperar respuesta valida." },
  ]);
  renderAiPills(
    document.querySelector("#aiContextOutput"),
    [
      `Accepted: ${result.accepted ? "yes" : "no"}`,
      result.parsed?.result ? `Result: ${result.parsed.result}` : "",
      result.parsed?.proof ? `Proof: ${result.parsed.proof}` : "",
    ].filter(Boolean),
    "Sin resultado parseado.",
  );
  renderAiPills(document.querySelector("#aiGuardOutput"), asArray(result.issues), "Sin issues.");
  renderAiPills(
    document.querySelector("#aiVerifyOutput"),
    [
      result.memoryWriteback ? `Memory writeback: ${result.memoryWriteback}` : "",
      result.parsed?.reusableLearning ? `Learning: ${result.parsed.reusableLearning}` : "",
    ].filter(Boolean),
    "Sin memoria aprobada.",
  );
}

function renderK7LoopResult(result) {
  const judge = result.judge || {};
  const activation = result.activation || {};
  const pack = activation.activationPack || {};
  renderAiAction(result.display?.headline || "K7 Loop ready", [
    { label: "Semaforo", value: result.trafficLight || "yellow" },
    { label: "Decision", value: judge.decision || "pending" },
    { label: "Score", value: String(judge.score ?? "n/a") },
    { label: "Siguiente accion", value: result.display?.nextAction || judge.nextAction || "Revisar salida." },
  ]);
  renderAiPills(
    document.querySelector("#aiContextOutput"),
    [
      ...(result.loop || []).map((step) => `Loop: ${step}`),
      ...(activation.after?.contextPack || []),
    ],
    "Sin loop.",
  );
  renderAiPills(
    document.querySelector("#aiGuardOutput"),
    [
      ...(pack.stopRules || []),
      ...(judge.issues || []).map((issue) => `Issue: ${issue}`),
    ],
    "Sin riesgos.",
  );
  renderAiPills(
    document.querySelector("#aiVerifyOutput"),
    [
      result.display?.proof ? `Proof: ${result.display.proof}` : "",
      result.display?.memoryDraft ? `Memory draft: ${result.display.memoryDraft}` : "",
    ].filter(Boolean),
    "Sin memoria.",
  );
}

function renderK7ProductResult(result) {
  const connection = result.connection || result.connector || result;
  const route = connection.route?.name || result.route?.name || "orchestrate";
  const action = result.nextAction || connection.action || result.next || "Run the verified next action.";
  renderAiAction(action, [
    { label: "Modo", value: result.mode || connection.mode || "KAIZEN7" },
    { label: "Ruta", value: route },
    { label: "Comandos", value: asArray(result.commands || connection.commands).join("\n") || "npm.cmd run check" },
  ]);
  renderAiPills(
    document.querySelector("#aiContextOutput"),
    [
      ...asArray(connection.contextPack),
      ...asArray(result.marketSignals).map((signal) => `${signal.id}: ${signal.adaptation}`),
    ],
    "Sin contexto adicional.",
  );
  renderAiPills(
    document.querySelector("#aiGuardOutput"),
    [
      ...asArray(connection.metaskills),
      ...asArray(connection.connectors).map((connector) => `${connector.name || connector.id}: ${connector.command || "ready"}`),
    ],
    "Sin metaskills o conectores adicionales.",
  );
  renderAiPills(
    document.querySelector("#aiVerifyOutput"),
    [
      ...asArray(connection.approvalGates),
      ...asArray(result.gates),
      ...asArray(connection.verification),
    ],
    "Run npm.cmd run check before claiming completion.",
  );
}

function laneLabel(lane) {
  return {
    strength: "Fortalecer",
    entra: "Entra",
    memory: "Memoria",
    espera: "Espera",
    fuera: "Fuera",
  }[lane] || lane;
}

function renderActionQueue(report) {
  const summary = document.querySelector("#actionQueueSummary");
  const grid = document.querySelector("#actionQueueGrid");
  if (!summary || !grid) return;
  const counts = report.counts?.byLane || {};
  const recommended = report.recommended || {};
  const isTicketMode = report.mode === "action-queue-tickets";
  summary.innerHTML = [
    `<article><span>${isTicketMode ? "Tickets" : "Senales"}</span><strong>${escapeHtml(report.counts?.total ?? 0)}</strong><small>${isTicketMode ? "Acciones gobernadas" : "Paquetes revisados"}</small></article>`,
    `<article><span>Recomendado</span><strong>${escapeHtml(laneLabel(recommended.lane || "none"))}</strong><small>${escapeHtml(recommended.nextAction || recommended.action?.title || "Sin accion")}</small></article>`,
    `<article><span>Regla</span><strong>${isTicketMode ? "Aprobacion" : "Propuesta"}</strong><small>No publica, no despliega, no toca credenciales.</small></article>`,
  ].join("");
  const lanes = report.lanes || ["strength", "entra", "memory", "espera", "fuera"];
  grid.innerHTML = lanes.map((lane) => {
    const items = (report.tickets || report.items || []).filter((item) => item.lane === lane).slice(0, 4);
    return `<section class="action-lane lane-${escapeHtml(lane)}">
      <div class="action-lane-head">
        <span>${escapeHtml(laneLabel(lane))}</span>
        <strong>${escapeHtml(counts[lane] || 0)}</strong>
      </div>
      <div class="action-lane-items">
        ${items.length ? items.map((item) => `<article class="action-card">
          <div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.nextAction || item.reason)}</p></div>
          <small>${escapeHtml(item.priority || item.verdict)} | ${escapeHtml(item.status || `score ${item.score}`)} | ${escapeHtml(item.budget ? `${item.budget.maxSteps} pasos` : "")}</small>
        </article>`).join("") : `<div class="action-empty">Sin senales.</div>`}
      </div>
    </section>`;
  }).join("");
}

async function loadActionQueue() {
  const summary = document.querySelector("#actionQueueSummary");
  const grid = document.querySelector("#actionQueueGrid");
  if (!summary || !grid) return;
  summary.innerHTML = `<article><span>Estado</span><strong>Cargando</strong><small>Consultando Evolution Inbox.</small></article>`;
  grid.innerHTML = "";
  try {
    const report = await api("/api/k7/tickets");
    renderActionQueue(report);
  } catch (error) {
    summary.innerHTML = `<article><span>Error</span><strong>No disponible</strong><small>${escapeHtml(error.message)}</small></article>`;
    grid.innerHTML = "";
  }
}

async function runAiCockpit(mode) {
  const status = document.querySelector("#aiStatus");
  const mission = document.querySelector("#aiMissionInput").value.trim();
  if (!mission) {
    document.querySelector("#aiMissionInput").focus();
    return;
  }
  const statusLabels = {
    loop: "Running K7 Loop",
    activate: "Activating 30s",
    validate: "Validating return",
    boost: "Boosting agent",
    openai: "OpenAI adapter",
    models: "Model gateway",
    jcode: "jcode adapter",
    operating: "Operating layer",
    onboard: "Onboarding",
    connect: "Connecting",
    improve: "Improving K7",
    run: "Running K7",
  };
  status.textContent = statusLabels[mode] || "Running K7";
  renderAiAction("Procesando mision...", [
    { label: "Objetivo", value: mission },
    { label: "Modo", value: mode === "loop" ? "K7 Loop" : mode === "activate" ? "30 Second Activation" : mode === "boost" ? "Agent Booster" : "Project Activation" },
  ]);
  try {
    const payload = {
      goal: mission,
      objective: mission,
      compact: true,
      agent: document.querySelector("#aiAgentSelect").value,
      preset: document.querySelector("#aiPresetSelect").value,
      project: document.querySelector("#aiPresetSelect").value,
      kind: mode === "connect" ? "agent" : undefined,
      budget: Number(document.querySelector("#aiBudgetSelect").value),
      risk: document.querySelector("#aiRiskSelect").value,
      capabilities: ["read_files", "edit_files", "run_tests"],
    };
    const endpoint = mode === "boost"
      ? "/api/k7/advise"
      : mode === "loop"
        ? "/api/k7/loop"
      : mode === "activate"
        ? "/api/k7/activate"
        : mode === "validate"
          ? "/api/k7/activate"
          : mode === "openai"
            ? "/api/k7/openai/activate"
            : mode === "models"
              ? "/api/k7/models"
              : mode === "jcode"
                ? "/api/k7/jcode"
                : mode === "operating"
                  ? "/api/k7/operating"
              : mode === "onboard"
                ? "/api/k7/onboard"
                : mode === "connect"
                  ? "/api/k7/connect"
                  : mode === "improve"
                    ? "/api/k7/improve"
                    : "/api/k7/run";
    let result = await api(endpoint, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (mode === "validate") {
      result = await api("/api/k7/handoff/validate", {
        method: "POST",
        body: JSON.stringify({
          handoff: result.aiHandoff,
          response: {
            result: "One visible result produced from the K7 handoff.",
            proof: "test output passed",
            risk: "low",
            reusableLearning: "AI-to-AI return can be judged by K7 before memory writeback.",
            memoryWriteback: `Objective: ${mission}\nLearning: AI return validated by K7 Judge.`,
            status: "done",
          },
        }),
      });
    }
    status.textContent = mode === "boost"
      ? "Agent boosted"
      : mode === "loop"
        ? "Loop closed"
      : mode === "activate"
        ? "30s activated"
      : mode === "validate"
        ? "Return judged"
      : mode === "openai"
        ? "Adapter ready"
        : mode === "models"
          ? "Gateway ready"
          : mode === "jcode"
            ? "jcode planned"
          : mode === "operating"
            ? "Operating layer ready"
        : ["onboard", "connect", "improve"].includes(mode)
          ? "K7 product ready"
          : "Action ready";
    if (mode === "boost") renderAdviceResult(result);
    else if (mode === "loop") renderK7LoopResult(result);
    else if (mode === "activate") renderActivationDemoResult(result);
    else if (mode === "validate") renderHandoffValidationResult(result);
    else if (mode === "openai") renderOpenAIAdapterResult(result);
    else if (mode === "models") renderModelGatewayResult(result);
    else if (["jcode", "operating"].includes(mode)) renderHarnessAdapterResult(result);
    else if (["onboard", "connect", "improve"].includes(mode)) renderK7ProductResult(result);
    else renderRunResult(result);
    await loadActionQueue();
  } catch (error) {
    status.textContent = "Error";
    renderAiAction("No se pudo activar la mision", [{ label: "Error", value: error.message }]);
  }
}

function growthPack(data) {
  return `GROWTH PACK - ${data.brand}

Producto: ${data.offer}
Categoria: ${data.category}
Promesa: ${data.promise}

Piezas:
1. Manifiesto: por que este producto existe y que alternativa supera.
2. Video problema: dolor concreto de ${data.audience}.
3. Carrusel: errores comunes al elegir esta categoria.
4. Story: encuesta para descubrir objeciones y lenguaje real.
5. Anuncio: test de demanda con CTA claro.
6. Email: historia, mecanismo y acceso anticipado.
7. PDP: promesa, prueba, mecanismo, oferta y FAQ.

CTA principal: validar interes por ${data.offer}.`;
}

function marketPack(data) {
  return `MARKET RADAR

Categoria: ${data.category}

Buscar:
- Competidores directos y sustitutos.
- Keywords de problema, solucion, comparativa y compra.
- Precio medio, precio premium y senales de sensibilidad al precio.
- Reviews negativas para encontrar huecos de producto.
- Claims o promesas repetidas que ya suenan comoditizadas.

Oportunidad: posicionar ${data.offer} alrededor de "${data.promise}" con prueba clara y oferta simple.`;
}

function sourcingPack(data) {
  return `SOURCING BRIEF

Producto: ${data.offer}
Categoria: ${data.category}

RFQ minimo:
- Descripcion del producto y especificaciones deseadas.
- MOQ, coste unitario, lead time, muestras y opciones de personalizacion.
- Certificaciones, controles de calidad y documentacion tecnica.
- Packaging, etiquetado, vida util o requisitos de plataforma.
- Experiencia previa fabricando productos similares.

Regla: ningun proveedor se considera validado sin muestras, documentacion y comparativa de coste/riesgo.`;
}

function profitPack(data) {
  return `MARGIN BRIEF

Objetivo: vender ${data.offer} con margen sano sin destruir la propuesta de valor.

Variables:
- COGS unitario.
- Packaging.
- Fulfillment.
- Devoluciones o garantias.
- CAC por lead y CAC por compra.
- Precio de lanzamiento vs precio final.

Puerta de decision:
Si el margen obliga a empeorar el producto, se cambia precio, canal, bundle o posicionamiento antes de degradar calidad.`;
}

function adPack(data) {
  return `AD PACK

Angulo 1 - Dolor:
${data.audience} no necesita otro producto mas; necesita resolver un problema concreto.

Angulo 2 - Mecanismo:
${data.offer} funciona por ${data.template.mechanism}.

Angulo 3 - Diferenciacion:
La alternativa comun promete demasiado y demuestra poco. ${data.brand} debe probar mas y gritar menos.

Formato test: 3 hooks x 2 creatividades x 2 CTAs.
Metrica ganadora: coste por lead cualificado o compra, no solo clic barato.`;
}

function pdpPack(data) {
  return `PDP E-COMMERCE

Titular: ${data.promise}.

Subtitulo: ${data.offer} para ${data.audience}.

Bloques:
- Problema: que duele ahora.
- Mecanismo: ${data.template.mechanism}.
- Prueba: ${data.template.proof}.
- Oferta: precio, bonus, bundle o acceso anticipado.
- FAQ: dudas, objeciones, envio, garantia y uso.

CTA: Quiero acceso / Comprar / Reservar.`;
}

function emailPack(data) {
  return `EMAIL SEQUENCE

Email 1 - Manifiesto:
Por que ${data.brand} existe y que problema quiere resolver.

Email 2 - Problema:
Que esta fallando en la categoria ${data.category}.

Email 3 - Producto:
Como ${data.offer} promete ${data.promise}.

Email 4 - Oferta:
Acceso anticipado, precio fundador, bonus o lista privada.`;
}

function decisionBrief(data) {
  return `DECISION BRIEF

Recomendacion: usar KAIZEN7 para validar ${data.offer} antes de invertir fuerte en stock, desarrollo o ads.

Por que:
- Convierte cualquier producto en hipotesis medible.
- Une research, sourcing, contenido, ecommerce, margen y agentes.
- Evita enamorarse del producto antes de validar demanda.

Siguiente accion: crear landing, 3 piezas de contenido y 3 anuncios para medir interes real.`;
}

function renderCommand() {
  const data = brief();
  document.querySelector("#campaignHeadline").textContent = `${data.brand} Growth OS para convertir producto en demanda.`;
  document.querySelector("#campaignSummary").textContent =
    `${data.offer} se trabaja como sistema completo: mercado, proveedor, margen, contenido, anuncios, PDP, calendario y metricas.`;
  document.querySelector("#brandMantra").textContent = data.template.mantra;
  document.querySelector("#brandShowcaseNote").textContent = data.goal === "Conseguir ventas" ? "Oferta lista para convertir" : "Validar antes de escalar";
  document.querySelector("#northStarMetric").textContent = data.goal === "Conseguir ventas" ? "Revenue per visitor" : "Leads cualificados";

  document.querySelector("#positioningChips").innerHTML = data.template.chips.map((chip) => `<span class="chip">${chip}</span>`).join("");

  const actions = [
    `Definir una promesa medible para ${data.offer}.`,
    "Crear landing o PDP con CTA principal.",
    "Lanzar 3 anuncios de test con angulos distintos.",
    "Recoger objeciones reales y ajustar oferta antes de escalar.",
  ];
  document.querySelector("#actionList").innerHTML = actions
    .map((item) => `<li><input type="checkbox" aria-label="Completar accion" /><span>${item}</span></li>`)
    .join("");
}

function renderRadar() {
  const data = brief();
  const opportunities = [
    ["Problema urgente", `Encontrar donde ${data.audience} ya busca una solucion para ${data.category}.`, "Alta"],
    ["Review mining", "Convertir quejas de competidores en mejoras de producto, copy y FAQ.", "Muy alta"],
    ["Precio premium", "Detectar si el mercado acepta pagar mas por calidad, rapidez, estatus o menor friccion.", "Alta"],
    ["Canal ganador", `Probar si ${data.channel} puede generar demanda cualificada antes de abrir mas canales.`, "Media"],
  ];
  document.querySelector("#opportunityRadar").innerHTML = opportunities
    .map(([title, note, score]) => `<div class="insight"><strong>${title}</strong>${note}<br><br><span class="tag">Prioridad ${score}</span></div>`)
    .join("");

  const keywords = [
    [`${data.category} premium`, "Intencion de calidad y comparacion."],
    [`mejor ${data.category}`, "Busqueda de decision y ranking."],
    [`${data.offer} alternativa`, "Captura sustitutos y competidores."],
    [`${data.category} opiniones`, "Fuente de objeciones y prueba social."],
    [`${data.category} precio`, "Sensibilidad a precio y packaging de oferta."],
  ];
  document.querySelector("#keywordMap").innerHTML = keywords
    .map(([keyword, note]) => `<div class="insight"><strong>${keyword}</strong>${note}</div>`)
    .join("");
}

function renderSourcing() {
  const data = brief();
  const supplierCriteria = [
    ["Capacidad", `Puede fabricar o entregar ${data.offer} con calidad consistente.`],
    ["Documentacion", "Certificados, fichas tecnicas, muestras, referencias y control de calidad."],
    ["Economia", "MOQ, coste unitario, lead time, escalabilidad y condiciones de pago."],
    ["Riesgo", `Validar ${data.template.risk} antes de comprometer dinero serio.`],
  ];
  document.querySelector("#supplierDesk").innerHTML = supplierCriteria
    .map(([title, copy]) => `<div class="insight"><strong>${title}</strong>${copy}</div>`)
    .join("");

  const rfq = [
    ["Asunto", `RFQ - ${data.offer} / ${data.category}`],
    ["Producto", `${data.offer}: ${data.promise}.`],
    ["Solicitar", "MOQ, coste unitario, muestras, lead time, personalizacion, certificaciones y referencias."],
    ["Filtro", "Descartar respuestas vagas, precios sin desglose o proveedores que eviten documentacion."],
  ];
  document.querySelector("#rfqBuilder").innerHTML = rfq
    .map(([title, copy]) => `<div class="insight"><strong>${title}</strong>${copy}</div>`)
    .join("");
}

function renderContent() {
  const data = brief();
  const pieces = [
    ["Video manifiesto", `Por que ${data.brand} entra en ${data.category} y que va a hacer distinto.`, "Plano fundador/producto, tono claro, CTA a lista o compra."],
    ["Carrusel educativo", `5 errores al comprar ${data.category} y como evitarlos.`, "Slides simples, cierre con checklist o oferta."],
    ["Short comparativo", `${data.offer} vs alternativa comun: mecanismo, prueba y diferencia.`, "Split screen y texto grande."],
    ["Story encuesta", `Que te frena mas al comprar ${data.category}: precio, confianza, resultado o uso?`, "Caja de respuesta para objeciones."],
    ["Post autoridad", `El problema real de ${data.category} no es falta de opciones, es falta de criterio.`, "Cierre con punto de vista de marca."],
    ["Email", `La historia detras de ${data.offer} y por que ahora.`, "Enviar a lista privada o leads."],
  ];

  document.querySelector("#contentGrid").innerHTML = pieces
    .map(([title, copy, production]) => `<article class="content-card">
      <span class="tag">${data.channel} / ${data.tone}</span>
      <h3>${title}</h3>
      <p>${copy}</p>
      <p><strong>Produccion:</strong> ${production}</p>
    </article>`)
    .join("");
}

function renderProfit() {
  const rows = [
    ["COGS objetivo", "Definir coste maximo sin bajar calidad percibida ni utilidad real."],
    ["Precio fundador", "Validar demanda sin posicionar la marca como barata."],
    ["CAC maximo", "Calcular despues de medir conversion de landing y calidad de leads."],
    ["Margen minimo", "No escalar si cada venta compra crecimiento a perdida sin aprendizaje."],
  ];
  document.querySelector("#marginSimulator").innerHTML = rows
    .map(([title, copy]) => `<div class="insight"><strong>${title}</strong>${copy}</div>`)
    .join("");

  const gates = [
    ["Gate 1", "Hay problema claro y audiencia identificada."],
    ["Gate 2", "Hay proveedor, coste o forma viable de entregar."],
    ["Gate 3", "La landing/PDP convierte sin prometer humo."],
    ["Gate 4", "El margen permite adquirir clientes o aprender rapido."],
  ];
  document.querySelector("#decisionGates").innerHTML = gates
    .map(([title, copy]) => `<div class="insight"><strong>${title}</strong>${copy}</div>`)
    .join("");
}

function renderAds() {
  const data = brief();
  const ads = [
    ["Dolor", `${data.audience} no necesita mas opciones; necesita ${data.promise}.`, "Ver producto"],
    ["Mecanismo", `${data.offer}: ${data.template.mechanism}.`, "Descubrir como funciona"],
    ["Comparativa", "La alternativa comun promete mucho y demuestra poco.", "Comparar"],
    ["Oferta", `Acceso anticipado a ${data.offer}.`, "Reservar / unirme"],
  ];
  document.querySelector("#adMatrix").innerHTML = ads
    .map(([angle, hook, cta]) => `<div class="insight"><strong>${angle}</strong>${hook}<br><br><span class="tag">${cta}</span></div>`)
    .join("");

  const tests = [
    ["Semana 1", "Validar 3 angulos con creatividades simples."],
    ["Semana 2", "Duplicar ganador en video, UGC o demostracion."],
    ["Semana 3", "Medir coste por lead/compra y objeciones."],
    ["Regla", "No escalar si el lead no entiende valor, precio o diferencia."],
  ];
  document.querySelector("#testPlan").innerHTML = tests
    .map(([title, copy]) => `<div class="insight"><strong>${title}</strong>${copy}</div>`)
    .join("");
}

function renderStore() {
  const data = brief();
  document.querySelector("#productTitle").textContent = data.offer;
  document.querySelector("#productPromise").textContent = data.promise;
  const bullets = [
    `Creado para ${data.audience}.`,
    `Categoria: ${data.category}.`,
    `Mecanismo: ${data.template.mechanism}.`,
    `Prueba a construir: ${data.template.proof}.`,
  ];
  document.querySelector("#productBullets").innerHTML = bullets.map((item) => `<li>${item}</li>`).join("");

  const sections = [
    ["Above the fold", `${data.promise}.`],
    ["Why it exists", `Porque ${data.category} suele fallar cuando no explica bien problema, mecanismo y prueba.`],
    ["Mechanism", data.template.mechanism],
    ["Proof", data.template.proof],
    ["FAQ", "Precio, uso, envio, garantia, devoluciones, comparativa y para quien no es."],
  ];
  document.querySelector("#storeCopy").innerHTML = sections
    .map(([title, copy]) => `<div class="insight"><strong>${title}</strong>${copy}</div>`)
    .join("");
}

function renderCalendar() {
  const days = [
    ["Lunes", "Problema", "Nombrar el dolor principal"],
    ["Martes", "Educacion", "Como elegir bien esta categoria"],
    ["Miercoles", "Producto", "Mecanismo y diferencia"],
    ["Jueves", "Objecion", "Responder precio, confianza o uso"],
    ["Viernes", "Prueba", "Demostracion, review o comparativa"],
    ["Sabado", "Comunidad", "Preguntas y lenguaje real"],
    ["Domingo", "Oferta", "CTA a compra, reserva o lista"],
  ];
  document.querySelector("#calendarGrid").innerHTML = days
    .map(([day, theme, idea]) => `<article class="content-card">
      <span class="tag">${theme}</span>
      <h3>${day}</h3>
      <p>${idea}</p>
      <p><strong>CTA:</strong> siguiente accion clara.</p>
    </article>`)
    .join("");
}

function renderAnalytics() {
  const rows = [
    ["Awareness", "Hook hold 3s", "30%+"],
    ["Authority", "Saves / shares", "8%+"],
    ["Lead", "Landing conversion", "8-15%"],
    ["Quality", "Qualified replies", "20/semana"],
    ["Commerce", "Purchase intent", "5%+"],
  ];
  document.querySelector("#weeklyScorecard").innerHTML = rows
    .map(([stage, metric, target]) => `<div class="score-row"><strong>${stage}</strong><span>${metric}</span><span>${target}</span></div>`)
    .join("");
}

function renderAgents() {
  const data = brief();
  const agents = [
    ["Commander", "Orquesta el trabajo, decide prioridades, pide aprobacion y convierte objetivos en planes ejecutables."],
    ["Research", "Investiga mercado, competencia, reviews, keywords, proveedores, costes y regulacion."],
    ["Builder", `Convierte ${data.offer} en producto, oferta, Shopify, contenido, anuncios y automatizaciones.`],
    ["Memory", "Gestiona Obsidian, decisiones, evidencia, resultados, evaluaciones y Product Genome."],
  ];
  document.querySelector("#agentStack").innerHTML = agents
    .map(([name, role]) => `<div class="insight"><strong>${name}</strong>${role}</div>`)
    .join("");

  const runtime = [
    ["K7 Scope", "Inspirado en AgentScope: permisos, workspace, ejecuciones, aprobaciones y trazas."],
    ["K7 Memory", "Inspirado en ReMe: memoria persistente, recuperacion contextual y aprendizaje aprobado."],
    ["K7 Judge", "Inspirado en OpenJudge: quality gates, scoring, flags y bloqueo de resultados debiles."],
    ["K7 Operator", "Inspirado en Hermes: autonomia supervisada, planes, herramientas y cierre verificable."],
  ];
  document.querySelector("#runtimeBlueprint").innerHTML = runtime
    .map(([name, role]) => `<div class="insight"><strong>${name}</strong>${role}</div>`)
    .join("");
}

function renderStack() {
  const repos = [
    ["Next.js Commerce", "Base storefront: App Router, server rendering, Server Actions, Suspense y patron ecommerce moderno."],
    ["create-t3-app", "Base full-stack typesafe para el producto: Next.js, TypeScript, Tailwind, auth, ORM y API ordenada."],
    ["shadcn/ui", "Sistema de componentes accesibles, copiables y personalizables para un dashboard premium."],
    ["OpenAI SDK", "Responses API, streaming, herramientas, archivos y multimodalidad."],
    ["Supabase", "Postgres, auth, storage, realtime y base para producto, proyectos, campañas, memoria y metricas."],
    ["OpenAI Agents SDK", "Agentes, handoffs, guardrails, estado, trazas y evaluacion."],
    ["Codex SDK", "Automatizacion de ingenieria, mantenimiento y mejora continua."],
    ["Product Genome", "Memoria empresarial para experimentos, creatividades, proveedores y resultados."],
    ["Firecrawl", "Research web: scrape, search y extraccion para competidores, proveedores, reviews y keywords."],
    ["Trigger.dev", "Jobs y workflows: research programado, informes, refresh de datos y tareas largas."],
    ["CopilotKit", "Patron para copilots embebidos en React: acciones dentro de la interfaz y UX de agente en producto."],
    ["Composio", "Patron para conectores de herramientas externas: Gmail, Sheets, Slack, Shopify, GitHub y CRMs."],
    ["E2B", "Sandbox para ejecutar codigo o analisis sin tocar el entorno principal."],
    ["PostHog", "Analytics de producto, funnels, eventos, feature flags y experimentacion."],
  ];
  document.querySelector("#repoStack").innerHTML = repos
    .map(([name, note]) => `<div class="insight"><strong>${name}</strong>${note}</div>`)
    .join("");

  const architecture = [
    ["Fase 1 - App profesional", "Migrar de HTML estatico a Next.js/T3 + shadcn + Supabase. Mantener KAIZEN7 universal."],
    ["Fase 2 - OpenAI core", "Responses API para growth packs, PDPs, anuncios, research, archivos, vision y herramientas."],
    ["Fase 3 - Memoria", "Conectar Obsidian, Postgres y Product Genome para decisiones, campanas y resultados."],
    ["Fase 4 - Research & sourcing", "Usar Firecrawl + jobs para competidores, proveedores, reviews, keywords y alertas."],
    ["Fase 5 - Agent runtime", "OpenAI Agents SDK para Commander, Research, Builder y Memory."],
    ["Fase 6 - Commerce", "Conectar Shopify/Medusa/Next Commerce segun negocio: primero PDP/waitlist, luego checkout real."],
    ["Fase 7 - Calidad", "Graders, guardrails y evals bloquean claims, research debil y copy generico."],
    ["Fase 8 - Product Genome", "Guardar productos, creatividades, proveedores, economia y compliance con resultados reales."],
  ];
  document.querySelector("#architectureStack").innerHTML = architecture
    .map(([name, note]) => `<div class="insight"><strong>${name}</strong>${note}</div>`)
    .join("");
}

function renderMoat() {
  const control = [
    ["Evidence first", "El Genome solo aprende de datos con fuente, fecha, producto, contexto y nivel de confianza."],
    ["Quality gates", "Evals y guardrails filtran claims inseguros, research debil y conclusiones sin evidencia."],
    ["Experiment identity", "Cada anuncio, PDP, proveedor o precio recibe un ID y queda unido a hipotesis, canal y resultado."],
    ["Human approval", "Solo se guardan como decision los aprendizajes aprobados o respaldados por resultados."],
    ["Feedback loop", "Research propone, Builder ejecuta, metricas responden y Memory actualiza el Genome."],
  ];
  document.querySelector("#controlPlane").innerHTML = control
    .map(([name, note]) => `<div class="insight"><strong>${name}</strong>${note}</div>`)
    .join("");

  const moat = [
    ["Product DNA", "Categoria, audiencia, problema, mecanismo, oferta, objeciones, claims y resultado comercial."],
    ["Creative DNA", "Hook, angulo, formato, canal, audiencia, coste, retencion, CTR, conversion y aprendizaje."],
    ["Supplier DNA", "Categoria, pais, MOQ, coste, certificaciones, calidad, respuesta, lead time y riesgo."],
    ["Economic DNA", "COGS, precio, margen, CAC, devoluciones, recompra y tiempo hasta rentabilidad."],
    ["Compliance DNA", "Claims permitidos/rechazados, mercado, evidencia, fuente, fecha y nivel de riesgo."],
  ];
  document.querySelector("#moatStack").innerHTML = moat
    .map(([name, note]) => `<div class="insight"><strong>${name}</strong>${note}</div>`)
    .join("");
}

async function loadCoreStatus() {
  const statusNode = document.querySelector("#coreStatus");
  const runsNode = document.querySelector("#coreRuns");
  try {
    const status = await api("/api/core/status");
    statusNode.innerHTML = status.components
      .map(
        (component) => `<article class="metric-card">
          <span>${component.name}</span>
          <strong>${component.status}</strong>
          <small>${component.count} registros operativos.</small>
        </article>`,
      )
      .join("");
    runsNode.innerHTML = status.recentRuns.length
      ? status.recentRuns
          .map(
            (run) => `<div class="insight">
              <strong>${run.goal}</strong>
              ${run.mode} · ${run.status} · ${run.product || "sin producto"}
              ${run.evaluationId ? `<br><br>Evaluacion: ${run.evaluationId}` : ""}
            </div>`,
          )
          .join("")
      : `<div class="insight"><strong>Sin ejecuciones</strong>Lanza el primer objetivo desde K7 Operator.</div>`;
  } catch (error) {
    statusNode.innerHTML = "";
    runsNode.innerHTML = `<div class="insight"><strong>CORE no disponible</strong>${error.message}</div>`;
  }
}

async function loadApprovals() {
  const queue = document.querySelector("#approvalQueue");
  const count = document.querySelector("#approvalCount");
  try {
    const { approvals } = await api("/api/core/approvals?status=pending");
    count.textContent = `${approvals.length} pendiente${approvals.length === 1 ? "" : "s"}`;
    queue.innerHTML = approvals.length
      ? approvals.map((item) => `<article class="approval-item">
          <div class="approval-copy">
            <div class="approval-heading"><strong>${escapeHtml(item.summary)}</strong><span class="risk ${escapeHtml(item.risk)}">${escapeHtml(item.risk)}</span></div>
            <p>${escapeHtml(item.reason)}</p>
            <pre>${escapeHtml(JSON.stringify(item.input, null, 2))}</pre>
          </div>
          <div class="approval-actions">
            <button class="ghost-btn" type="button" data-approval="${escapeHtml(item.id)}" data-decision="rejected">Rechazar</button>
            <button class="primary-btn" type="button" data-approval="${escapeHtml(item.id)}" data-decision="approved">Aprobar y ejecutar</button>
          </div>
        </article>`).join("")
      : `<div class="empty-state"><strong>Todo bajo control</strong><span>No hay acciones externas esperando permiso.</span></div>`;
  } catch (error) {
    queue.innerHTML = `<div class="insight"><strong>No se pudo cargar la cola</strong>${escapeHtml(error.message)}</div>`;
  }
}

async function loadGenome() {
  const stats = document.querySelector("#genomeStats");
  const recent = document.querySelector("#genomeRecent");
  try {
    const { summary } = await api("/api/genome");
    const items = [
      ["Productos", summary.products],
      ["Experimentos", summary.experiments],
      ["Aprendizajes", summary.learnings],
      ["Creatividades", summary.creatives],
      ["Proveedores", summary.suppliers],
    ];
    stats.innerHTML = items
      .map(
        ([label, value]) => `<article class="metric-card">
          <span>${label}</span>
          <strong>${value}</strong>
          <small>Registros con contexto y evidencia.</small>
        </article>`,
      )
      .join("");
    recent.innerHTML = summary.recent.length
      ? summary.recent
          .map(
            (item) => `<div class="insight">
              <strong>${item.name}</strong>
              ${item.product || "Sin producto"} · ${item.recordType} · confianza ${item.confidence}
              ${item.result ? `<br><br>${item.result}` : ""}
            </div>`,
          )
          .join("")
      : `<div class="insight"><strong>Genome vacio</strong>Registra el primer producto, experimento o aprendizaje.</div>`;
  } catch (error) {
    stats.innerHTML = "";
    recent.innerHTML = `<div class="insight"><strong>Genome no disponible</strong>${error.message}</div>`;
  }
}

function renderPipeline() {
  const columns = [
    ["Research", ["Competidores", "Keywords", "Reviews"]],
    ["Product", ["Especificacion", "Proveedor", "Coste"]],
    ["Offer", ["PDP", "Precio", "Bundle"]],
    ["Growth", ["Contenido", "Ads", "Email"]],
    ["Scale", ["Metricas", "Retargeting", "Recompra"]],
  ];
  document.querySelector("#pipelineBoard").innerHTML = columns
    .map(([title, cards]) => `<section class="pipeline-column">
      <h3>${title}</h3>
      ${cards.map((card) => `<div class="pipeline-card"><strong>${card}</strong>Activo clave para validar y escalar cualquier producto.</div>`).join("")}
    </section>`)
    .join("");
}

function renderAll() {
  renderCommand();
  renderRadar();
  renderSourcing();
  renderContent();
  renderAds();
  renderStore();
  renderProfit();
  renderCalendar();
  renderAnalytics();
  renderAgents();
  renderStack();
  renderMoat();
  renderPipeline();
}

async function loadWorkspace() {
  const query = activeProjectId ? `?projectId=${encodeURIComponent(activeProjectId)}` : "";
  try {
    const { workspace, metrics } = await api(`/api/workspace${query}`);
    const picker = document.querySelector("#activeProject");
    picker.innerHTML = `<option value="">Todos los proyectos</option>${workspace.projects
      .map((project) => `<option value="${escapeHtml(project.id)}">${escapeHtml(project.name)}</option>`).join("")}`;
    picker.value = activeProjectId;
    const cards = [
      ["Proyectos", metrics.projects, "Marcas o productos activos"],
      ["Trabajo abierto", metrics.tasksOpen, `${metrics.tasksDone} tareas completadas`],
      ["Campañas", metrics.campaigns, "Planes con objetivo y canal"],
      ["Contenido", metrics.contentDrafts + metrics.contentScheduled, `${metrics.contentScheduled} piezas programadas`],
    ];
    document.querySelector("#workspaceMetrics").innerHTML = cards.map(([label, value, note]) => `<article class="metric-card"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`).join("");
    const tasks = activeProjectId ? workspace.tasks.filter((item) => item.projectId === activeProjectId) : workspace.tasks;
    const campaigns = activeProjectId ? workspace.campaigns.filter((item) => item.projectId === activeProjectId) : workspace.campaigns;
    const content = activeProjectId ? workspace.content.filter((item) => item.projectId === activeProjectId) : workspace.content;
    document.querySelector("#taskBoard").innerHTML = tasks.length
      ? tasks.slice().reverse().slice(0, 12).map((task) => `<article class="task-row priority-${escapeHtml(task.priority)}">
          <div><strong>${escapeHtml(task.title)}</strong><small>${escapeHtml(task.owner)} · ${escapeHtml(task.status)}</small></div>
          <select data-task-status="${escapeHtml(task.id)}" aria-label="Estado de ${escapeHtml(task.title)}">
            ${["backlog", "in_progress", "review", "done", "blocked", "cancelled"].map((status) => `<option value="${status}" ${task.status === status ? "selected" : ""}>${status}</option>`).join("")}
          </select>
        </article>`).join("")
      : `<div class="empty-state"><strong>Sin tareas</strong><span>Crea un proyecto y añade el primer resultado.</span></div>`;
    const activity = workspace.audit.slice().reverse().slice(0, 12);
    document.querySelector("#workspaceActivity").innerHTML = activity.length
      ? activity.map((item) => `<div class="activity-row"><span class="activity-mark"></span><div><strong>${escapeHtml(item.event)}</strong><p>${escapeHtml(item.detail)}</p><time>${new Date(item.at).toLocaleString()}</time></div></div>`).join("")
      : `<div class="empty-state"><strong>Aun no hay actividad</strong><span>Las decisiones y cambios apareceran aqui.</span></div>`;
    document.querySelector("#workspaceUpdated").textContent = workspace.updatedAt ? new Date(workspace.updatedAt).toLocaleTimeString() : "Sin datos";
    document.querySelector("#contentCampaign").innerHTML = `<option value="">Sin campaña</option>${campaigns.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`).join("")}`;
    document.querySelector("#contentLibraryCount").textContent = `${content.length} pieza${content.length === 1 ? "" : "s"}`;
    document.querySelector("#contentLibrary").innerHTML = content.length
      ? content.slice().reverse().map((item) => `<article class="library-item">
          <div><span class="channel-label">${escapeHtml(item.channel || item.format)}</span><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.body)}</p></div>
          <div class="library-meta"><span>${escapeHtml(item.status)}</span>${item.scheduledFor ? `<time>${new Date(item.scheduledFor).toLocaleString()}</time>` : ""}</div>
        </article>`).join("")
      : `<div class="empty-state"><strong>Biblioteca vacia</strong><span>Guarda una pieza o créala con K7 Operator.</span></div>`;
    if (content.some((item) => item.scheduledFor)) {
      document.querySelector("#calendarGrid").innerHTML = content.filter((item) => item.scheduledFor).sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor)).map((item) => `<article class="content-card calendar-item"><span class="channel-label">${escapeHtml(item.channel)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.body)}</p><time>${new Date(item.scheduledFor).toLocaleString()}</time></article>`).join("");
    }
  } catch (error) {
    document.querySelector("#taskBoard").innerHTML = `<div class="insight"><strong>Workspace no disponible</strong>${escapeHtml(error.message)}</div>`;
  }
}

async function createProjectFromBrief() {
  const data = brief();
  const { project } = await api("/api/workspace/projects", {
    method: "POST",
    body: JSON.stringify({ name: `${data.brand} · ${data.offer}`, ...data, product: data.offer }),
  });
  activeProjectId = project.id;
  localStorage.setItem("kaizen7.activeProject", activeProjectId);
  await loadWorkspace();
}

async function loadConnectorStatus() {
  const container = document.querySelector("#connectorStatus");
  try {
    const statuses = await api("/api/connectors/status");
    container.innerHTML = statuses
      .map(
        (item) => `<div class="status-row">
          <div><strong>${item.name}</strong><br><small>${item.configured ? "Credenciales detectadas" : "Falta configuracion"}</small></div>
          <span class="status-dot ${item.enabled && item.configured ? "ready" : ""}"></span>
        </div>`,
      )
      .join("");
  } catch (error) {
    container.innerHTML = `<div class="insight"><strong>Servidor no activo</strong>Inicia KAIZEN7 con node server.js para usar conectores reales.</div>`;
  }
}

function showConnectorOutput(value) {
  document.querySelector("#connectorOutput").textContent =
    typeof value === "string" ? value : JSON.stringify(value, null, 2);
  loadCoreStatus();
  loadApprovals();
}

function switchView(viewId) {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewId);
  });
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active-view", view.id === viewId);
  });
  document.querySelector("#viewTitle").textContent = views[viewId];
}

function applyTemplate() {
  const template = currentTemplate();
  fields.brand.value = template.brand;
  fields.offer.value = template.offer;
  fields.audience.value = template.audience;
  fields.category.value = template.category;
  fields.promise.value = template.promise;
  if (fields.tone) fields.tone.value = template.tone;
  renderAll();
}

function exportPack() {
  const data = brief();
  const messages = [...chatLog.querySelectorAll(".message")].map((item) => item.textContent).join("\n\n");
  const text = `KAIZEN7 PRODUCT GROWTH PACK

Marca: ${data.brand}
Producto: ${data.offer}
Categoria: ${data.category}
Audiencia: ${data.audience}
Promesa: ${data.promise}
Objetivo: ${data.goal}
Canal: ${data.channel}

${growthPack(data)}

${marketPack(data)}

${sourcingPack(data)}

${profitPack(data)}

${adPack(data)}

${pdpPack(data)}

Conversacion:
${messages}`;
  copyText(text);
}

function copyText(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(showCopiedState).catch(() => fallbackCopy(text));
    return;
  }
  fallbackCopy(text);
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-999px";
  document.body.append(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
  showCopiedState();
}

function showCopiedState() {
  const button = document.querySelector("#exportBtn");
  button.textContent = "Copiado";
  setTimeout(() => {
    button.textContent = "Exportar Growth Pack";
  }, 1200);
}

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

document.querySelector("#assistantForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const prompt = promptInput.value.trim();
  if (!prompt) return;
  addMessage("user", prompt);
  addMessage("assistant", "KAIZEN7 esta pensando...");
  const pending = chatLog.lastElementChild;
  liveAssistantReply(prompt)
    .then((reply) => {
      pending.textContent = reply;
    })
    .catch((error) => {
      pending.textContent = `${assistantReply(prompt)}\n\nModo local: ${error.message}`;
    })
    .finally(() => {
      promptInput.value = "";
      attachedImage = "";
      imageInput.value = "";
      imagePreview.innerHTML = "";
    });
});

document.querySelector("#aiCockpitForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitter = event.submitter;
  await runAiCockpit(submitter?.dataset.mode || "run");
});

document.querySelector("#harnessDryRunBtn").addEventListener("click", runHarnessDryRun);
document.querySelector("#refreshActionQueueBtn").addEventListener("click", loadActionQueue);

document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    promptInput.value = button.dataset.prompt;
    promptInput.focus();
  });
});

document.querySelector("#refreshBtn").addEventListener("click", renderAll);
document.querySelector("#exportBtn").addEventListener("click", exportPack);
fields.template.addEventListener("change", applyTemplate);

imageInput.addEventListener("change", () => {
  const file = imageInput.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    attachedImage = reader.result;
    imagePreview.innerHTML = `<img src="${attachedImage}" alt="Imagen adjunta" />`;
  };
  reader.readAsDataURL(file);
});

document.querySelector("#reloadConnectorsBtn").addEventListener("click", loadConnectorStatus);

document.querySelector("#shopifyDraftBtn").addEventListener("click", async () => {
  try {
    showConnectorOutput(
      await api("/api/shopify/draft-product", {
        method: "POST",
        body: JSON.stringify({
          title: document.querySelector("#shopifyTitle").value || brief().offer,
          descriptionHtml: `<p>${brief().promise}</p>`,
        }),
      }),
    );
  } catch (error) {
    showConnectorOutput(error.message);
  }
});

document.querySelector("#metaPostBtn").addEventListener("click", async () => {
  try {
    showConnectorOutput(
      await api("/api/social/meta", {
        method: "POST",
        body: JSON.stringify({ message: document.querySelector("#metaPost").value }),
      }),
    );
  } catch (error) {
    showConnectorOutput(error.message);
  }
});

document.querySelector("#linkedinPostBtn").addEventListener("click", async () => {
  try {
    showConnectorOutput(
      await api("/api/social/linkedin", {
        method: "POST",
        body: JSON.stringify({ text: document.querySelector("#linkedinPost").value }),
      }),
    );
  } catch (error) {
    showConnectorOutput(error.message);
  }
});

document.querySelector("#instagramPostBtn").addEventListener("click", async () => {
  try {
    showConnectorOutput(
      await api("/api/social/instagram", {
        method: "POST",
        body: JSON.stringify({
          imageUrl: document.querySelector("#instagramImageUrl").value,
          caption: document.querySelector("#instagramCaption").value,
        }),
      }),
    );
  } catch (error) {
    showConnectorOutput(error.message);
  }
});

document.querySelector("#xPostBtn").addEventListener("click", async () => {
  try {
    showConnectorOutput(
      await api("/api/social/x", {
        method: "POST",
        body: JSON.stringify({ text: document.querySelector("#xPost").value }),
      }),
    );
  } catch (error) {
    showConnectorOutput(error.message);
  }
});

document.querySelector("#metaBrowserTrendBtn").addEventListener("click", async () => {
  const sourceText = document.querySelector("#metaBrowserSource").value.trim();
  try {
    const result = await api("/api/metabrowser/trend-search", {
      method: "POST",
      body: JSON.stringify({
        query: document.querySelector("#metaBrowserQuery").value,
        platform: document.querySelector("#metaBrowserPlatform").value,
        product: brief().offer,
        sources: sourceText ? [{ title: "Fuente pegada", text: sourceText }] : [],
      }),
    });
    showConnectorOutput({
      backend: result.backend,
      resumen: result.summary,
      senales: result.signals.map((signal) => ({
        id: signal.id,
        angulo: signal.angle,
        texto: signal.text,
        fuente: signal.source,
      })),
      genome: result.genome ? "Guardado en Creative DNA" : "No se guardo: faltan senales",
      avisos: result.warnings,
    });
    await loadGenome();
  } catch (error) {
    showConnectorOutput(error.message);
  }
});

document.querySelector("#mcpCallBtn").addEventListener("click", async () => {
  try {
    showConnectorOutput(
      await api("/api/mcp/call", {
        method: "POST",
        body: JSON.stringify({
          server: document.querySelector("#mcpServerInput").value,
          method: document.querySelector("#mcpMethodInput").value,
          params: {},
        }),
      }),
    );
  } catch (error) {
    showConnectorOutput(error.message);
  }
});

document.querySelector("#genomeForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    await api("/api/genome/records", {
      method: "POST",
      body: JSON.stringify({
        type: document.querySelector("#genomeType").value,
        name: document.querySelector("#genomeName").value,
        product: document.querySelector("#genomeProduct").value || brief().offer,
        hypothesis: document.querySelector("#genomeHypothesis").value,
        result: document.querySelector("#genomeResult").value,
        metric: document.querySelector("#genomeMetric").value,
        evidence: document.querySelector("#genomeEvidence").value,
        confidence: document.querySelector("#genomeConfidence").value,
      }),
    });
    event.target.reset();
    document.querySelector("#genomeProduct").value = brief().offer;
    await loadGenome();
  } catch (error) {
    document.querySelector("#genomeRecent").innerHTML =
      `<div class="insight"><strong>No se pudo guardar</strong>${error.message}</div>`;
  }
});

document.querySelector("#operatorForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const output = document.querySelector("#operatorOutput");
  const verdict = document.querySelector("#judgeVerdict");
  output.textContent = "Trabajando en tu objetivo...";
  verdict.textContent = "En proceso";
  try {
    const result = await api("/api/core/run", {
      method: "POST",
      body: JSON.stringify({
        goal: document.querySelector("#operatorGoal").value,
        product: brief().offer,
        mode: document.querySelector("#operatorMode").value,
        action: document.querySelector("#operatorAction").value,
        projectId: activeProjectId,
      }),
    });
    const verdictLabel = { pass: "Listo", revise: "Conviene revisar", block: "Necesita cambios" }[result.evaluation.verdict] || "Revisado";
    verdict.textContent = `${verdictLabel} · ${result.evaluation.score}/100`;
    output.textContent = [
      result.response.content,
      "",
      `Calidad: ${result.evaluation.score}/100`,
      result.blocked
        ? "Necesita cambios antes de poder continuar."
        : result.approval
          ? `Accion preparada: ${result.approval.summary}. Esperando tu aprobacion.`
          : "Resultado completado.",
      ...result.evaluation.checks.map(
        (check) => `- ${check.label}: ${check.passed ? "superado" : "revisar"}`,
      ),
    ].join("\n");
    await loadCoreStatus();
    await loadWorkspace();
  } catch (error) {
    verdict.textContent = "Error";
    output.textContent = error.message;
  }
});

document.querySelector("#approvalQueue").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-approval]");
  if (!button) return;
  const original = button.textContent;
  button.disabled = true;
  button.textContent = button.dataset.decision === "approved" ? "Ejecutando..." : "Rechazando...";
  try {
    await api(`/api/core/approvals/${button.dataset.approval}/decision`, {
      method: "POST",
      body: JSON.stringify({ decision: button.dataset.decision }),
    });
    await loadCoreStatus();
    await loadApprovals();
    await loadConnectorStatus();
    await loadWorkspace();
  } catch (error) {
    button.disabled = false;
    button.textContent = original;
    document.querySelector("#operatorOutput").textContent = `La accion no se ejecuto: ${error.message}`;
  }
});

document.querySelector("#createProjectBtn").addEventListener("click", async () => {
  const button = document.querySelector("#createProjectBtn");
  button.disabled = true;
  try { await createProjectFromBrief(); button.textContent = "Proyecto creado"; }
  catch (error) { button.textContent = error.message; }
  finally { setTimeout(() => { button.disabled = false; button.textContent = "Crear desde el brief"; }, 1600); }
});

document.querySelector("#activeProject").addEventListener("change", async (event) => {
  activeProjectId = event.target.value;
  localStorage.setItem("kaizen7.activeProject", activeProjectId);
  await loadWorkspace();
});

document.querySelector("#taskForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!activeProjectId) {
    document.querySelector("#taskTitle").setCustomValidity("Selecciona o crea un proyecto primero");
    document.querySelector("#taskTitle").reportValidity();
    return;
  }
  document.querySelector("#taskTitle").setCustomValidity("");
  await api("/api/workspace/tasks", {
    method: "POST",
    body: JSON.stringify({ projectId: activeProjectId, title: document.querySelector("#taskTitle").value, priority: document.querySelector("#taskPriority").value, owner: document.querySelector("#taskOwner").value }),
  });
  event.target.reset();
  await loadWorkspace();
});

document.querySelector("#taskBoard").addEventListener("change", async (event) => {
  const taskId = event.target.dataset.taskStatus;
  if (!taskId) return;
  await api(`/api/workspace/tasks/${taskId}`, { method: "PATCH", body: JSON.stringify({ status: event.target.value }) });
  await loadWorkspace();
});

document.querySelector("#globalSearch").addEventListener("input", (event) => {
  clearTimeout(searchTimer);
  const query = event.target.value.trim();
  const resultsNode = document.querySelector("#searchResults");
  if (!query) { resultsNode.hidden = true; resultsNode.innerHTML = ""; return; }
  searchTimer = setTimeout(async () => {
    try {
      const { results } = await api(`/api/search?q=${encodeURIComponent(query)}`);
      resultsNode.hidden = false;
      resultsNode.innerHTML = results.length
        ? results.map((item) => `<button type="button" data-search-project="${escapeHtml(item.projectId)}"><span>${escapeHtml(item.type)}</span><strong>${escapeHtml(item.title || "Sin titulo")}</strong><small>${escapeHtml(String(item.detail || "").slice(0, 140))}</small></button>`).join("")
        : `<div class="empty-state"><strong>Sin resultados</strong><span>Prueba con otro termino.</span></div>`;
    } catch (error) { resultsNode.hidden = true; }
  }, 220);
});

document.querySelector("#searchResults").addEventListener("click", async (event) => {
  const button = event.target.closest("[data-search-project]");
  if (!button) return;
  if (button.dataset.searchProject) {
    activeProjectId = button.dataset.searchProject;
    localStorage.setItem("kaizen7.activeProject", activeProjectId);
  }
  document.querySelector("#searchResults").hidden = true;
  document.querySelector("#globalSearch").value = "";
  switchView("command");
  await loadWorkspace();
});

document.querySelector("#campaignForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!activeProjectId) return document.querySelector("#createProjectBtn").focus();
  await api("/api/workspace/campaigns", {
    method: "POST",
    body: JSON.stringify({ projectId: activeProjectId, name: document.querySelector("#campaignName").value, objective: document.querySelector("#campaignObjective").value, channel: brief().channel, budget: document.querySelector("#campaignBudget").value }),
  });
  event.target.reset();
  await loadWorkspace();
});

document.querySelector("#contentForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!activeProjectId) return document.querySelector("#createProjectBtn").focus();
  const scheduledFor = document.querySelector("#contentSchedule").value;
  await api("/api/workspace/content", {
    method: "POST",
    body: JSON.stringify({ projectId: activeProjectId, campaignId: document.querySelector("#contentCampaign").value, title: document.querySelector("#contentTitle").value, channel: document.querySelector("#contentChannel").value, body: document.querySelector("#contentBody").value, scheduledFor, status: scheduledFor ? "scheduled" : "draft" }),
  });
  event.target.reset();
  await loadWorkspace();
});

Object.values(fields).forEach((field) => {
  if (!field || field === fields.template) return;
  field.addEventListener("input", renderAll);
  field.addEventListener("change", renderAll);
});

function setupFocusWorkspace() {
  const operatorForm = document.querySelector("#operatorForm");
  const operator = operatorForm?.closest("article");
  const result = document.querySelector("#operatorOutput")?.closest("article");
  const approvals = document.querySelector("#approvalQueue")?.closest("article");
  if (operator) document.querySelector("#focusOperatorMount").append(operator);
  if (result) document.querySelector("#focusResultMount").append(result);
  if (approvals) document.querySelector("#focusApprovalMount").append(approvals);

  const sourceProject = document.querySelector("#activeProject");
  const focusProject = document.querySelector("#focusProject");
  const syncProjects = () => {
    focusProject.innerHTML = sourceProject.innerHTML.replace("Todos los proyectos", "Sin proyecto");
    focusProject.value = activeProjectId;
  };
  new MutationObserver(syncProjects).observe(sourceProject, { childList: true });
  syncProjects();

  focusProject.addEventListener("change", async (event) => {
    activeProjectId = event.target.value;
    sourceProject.value = activeProjectId;
    localStorage.setItem("kaizen7.activeProject", activeProjectId);
    await loadWorkspace();
  });

  document.querySelector("#focusCreateProject").addEventListener("click", async (event) => {
    const button = event.currentTarget;
    button.disabled = true;
    try {
      await createProjectFromBrief();
      syncProjects();
      button.textContent = "Proyecto creado";
    } catch (error) {
      button.textContent = error.message;
    } finally {
      setTimeout(() => {
        button.disabled = false;
        button.textContent = "Crear proyecto con este producto";
      }, 1400);
    }
  });

  document.querySelectorAll("[data-focus-goal]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector("#operatorAction").value = button.dataset.focusAction;
      document.querySelector("#operatorGoal").value = button.dataset.focusGoal;
      document.querySelector("#operatorGoal").focus();
    });
  });
}

setupFocusWorkspace();
addMessage("assistant", "KAIZEN7 listo. Define el resultado que necesitas y me encargo del proceso.");
renderAll();
loadConnectorStatus();
document.querySelector("#genomeProduct").value = brief().offer;
loadGenome();
loadCoreStatus();
loadApprovals();
loadWorkspace();
loadActionQueue();
