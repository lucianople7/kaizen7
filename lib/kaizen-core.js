const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createStore(dataDir, filename, defaults) {
  const filePath = path.join(dataDir, filename);
  function read() {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaults, null, 2));
      return clone(defaults);
    }
    return { ...clone(defaults), ...JSON.parse(fs.readFileSync(filePath, "utf8")) };
  }
  function write(value) {
    value.updatedAt = new Date().toISOString();
    fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
    return value;
  }
  return { read, write };
}

function id(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${crypto.randomBytes(3).toString("hex")}`;
}

function tokenize(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/).filter((token) => token.length > 2);
}

function createKaizenCore(dataDir) {
  const runtimeStore = createStore(dataDir, "kaizen-runtime.json", {
    version: 2, runs: [], approvals: [], updatedAt: null,
  });
  const memoryStore = createStore(dataDir, "kaizen-memory.json", {
    version: 1, memories: [], updatedAt: null,
  });
  const judgeStore = createStore(dataDir, "kaizen-evaluations.json", {
    version: 1, evaluations: [], updatedAt: null,
  });

  function operatorPlan({ goal, product, mode = "commander" }) {
    const plans = {
      commander: ["Recuperar memoria relevante", "Generar un plan ejecutable", "Evaluar calidad y riesgos", "Solicitar aprobacion para acciones externas", "Guardar el aprendizaje"],
      research: ["Recuperar contexto", "Separar hechos, inferencias y supuestos", "Comparar evidencia", "Evaluar riesgos", "Proponer la siguiente prueba"],
      builder: ["Definir entregables", "Construir borradores", "Ejecutar controles de calidad", "Solicitar aprobacion externa", "Registrar el resultado"],
      memory: ["Extraer decisiones y evidencia", "Detectar duplicados o contradicciones", "Evaluar confianza", "Actualizar memoria", "Vincular Product Genome"],
    };
    return {
      goal, product: product || "producto sin nombre", mode, supervision: "human-in-the-loop",
      steps: plans[mode] || plans.commander,
      permissions: { read: "auto", analyze: "auto", draft: "auto", writeInternal: "auto", publishExternal: "approval", spendMoney: "approval", deleteData: "approval" },
    };
  }

  function trace(run, event, detail, data) {
    run.trace = run.trace || [];
    run.trace.push({ event, at: new Date().toISOString(), detail, ...(data ? { data } : {}) });
  }

  function startRun(input) {
    if (!input.goal?.trim()) throw new Error("La ejecucion necesita un objetivo");
    const runtime = runtimeStore.read();
    const now = new Date().toISOString();
    const run = {
      id: id("run"), goal: input.goal.trim(), product: input.product?.trim() || "",
      mode: input.mode || "commander", status: "planned", currentStep: 0,
      plan: operatorPlan(input), trace: [], createdAt: now, updatedAt: now,
    };
    trace(run, "run.created", "Plan creado bajo supervision humana");
    runtime.runs.push(run);
    runtimeStore.write(runtime);
    return run;
  }

  function updateRun(runId, status, detail, data = {}) {
    const allowed = ["planned", "running", "waiting_approval", "evaluating", "completed", "failed", "cancelled"];
    if (!allowed.includes(status)) throw new Error("Estado de ejecucion no valido");
    const runtime = runtimeStore.read();
    const run = runtime.runs.find((item) => item.id === runId);
    if (!run) throw new Error("Ejecucion no encontrada");
    run.status = status;
    run.updatedAt = new Date().toISOString();
    Object.assign(run, data);
    trace(run, `run.${status}`, detail || status);
    runtimeStore.write(runtime);
    return run;
  }

  function recordTool(runId, tool, phase, detail, data) {
    const runtime = runtimeStore.read();
    const run = runtime.runs.find((item) => item.id === runId);
    if (!run) throw new Error("Ejecucion no encontrada");
    trace(run, `tool.${phase}`, detail || tool, { tool, ...(data || {}) });
    run.updatedAt = new Date().toISOString();
    runtimeStore.write(runtime);
    return run;
  }

  function requestApproval({ runId, tool, input, reason, risk = "high", summary }) {
    const runtime = runtimeStore.read();
    const run = runtime.runs.find((item) => item.id === runId);
    if (!run) throw new Error("Ejecucion no encontrada");
    if (!tool) throw new Error("La aprobacion necesita una herramienta");
    const approval = {
      id: id("approval"), runId, tool, input: clone(input || {}), risk,
      reason: reason || "Accion externa con efectos reales", summary: summary || tool,
      status: "pending", requestedAt: new Date().toISOString(),
    };
    runtime.approvals.push(approval);
    run.status = "waiting_approval";
    run.updatedAt = approval.requestedAt;
    trace(run, "approval.requested", `${approval.summary} requiere aprobacion`, { approvalId: approval.id, tool, risk });
    runtimeStore.write(runtime);
    return approval;
  }

  function decideApproval(approvalId, decision, note = "") {
    if (!["approved", "rejected"].includes(decision)) throw new Error("Decision no valida");
    const runtime = runtimeStore.read();
    const approval = runtime.approvals.find((item) => item.id === approvalId);
    if (!approval) throw new Error("Aprobacion no encontrada");
    if (approval.status !== "pending") throw new Error("La aprobacion ya fue resuelta");
    approval.status = decision;
    approval.note = note;
    approval.decidedAt = new Date().toISOString();
    const run = runtime.runs.find((item) => item.id === approval.runId);
    if (run) {
      run.status = decision === "approved" ? "running" : "cancelled";
      run.updatedAt = approval.decidedAt;
      trace(run, `approval.${decision}`, `${approval.summary}: ${decision}`, { approvalId });
    }
    runtimeStore.write(runtime);
    return approval;
  }

  function finishApproval(approvalId, outcome, error = "") {
    const runtime = runtimeStore.read();
    const approval = runtime.approvals.find((item) => item.id === approvalId);
    if (!approval) throw new Error("Aprobacion no encontrada");
    approval.status = error ? "failed" : "executed";
    approval.executedAt = new Date().toISOString();
    approval.outcome = outcome;
    approval.error = error || undefined;
    const run = runtime.runs.find((item) => item.id === approval.runId);
    if (run) {
      run.status = error ? "failed" : "completed";
      run.updatedAt = approval.executedAt;
      if (!error) run.result = outcome;
      trace(run, error ? "tool.failed" : "tool.completed", error || `${approval.tool} ejecutada`, { tool: approval.tool, approvalId });
    }
    runtimeStore.write(runtime);
    return approval;
  }

  function getApproval(approvalId) {
    return runtimeStore.read().approvals.find((item) => item.id === approvalId) || null;
  }

  function listApprovals(status = "") {
    return runtimeStore.read().approvals.filter((item) => !status || item.status === status).slice().reverse();
  }

  function completeRun(runId, result, evaluation) {
    return updateRun(runId, "completed", evaluation ? `Evaluacion ${evaluation.score}/100` : "Sin evaluacion", {
      result, evaluationId: evaluation?.id || null, completedAt: new Date().toISOString(),
    });
  }

  function remember(input) {
    if (!input.content?.trim()) throw new Error("La memoria necesita contenido");
    const store = memoryStore.read();
    const memory = { id: id("mem"), type: input.type || "learning", product: input.product?.trim() || "", content: input.content.trim(), source: input.source?.trim() || "KAIZEN7", confidence: input.confidence || "medium", tags: Array.isArray(input.tags) ? input.tags : [], approved: input.approved !== false, createdAt: new Date().toISOString() };
    store.memories.push(memory); memoryStore.write(store); return memory;
  }

  function searchMemory(query, product = "") {
    const queryTokens = tokenize(`${query} ${product}`);
    return memoryStore.read().memories.map((memory) => {
      const haystack = tokenize(`${memory.product} ${memory.content} ${memory.source} ${(memory.tags || []).join(" ")}`);
      const overlap = queryTokens.filter((token) => haystack.includes(token)).length;
      const productBoost = product && memory.product.toLowerCase() === product.toLowerCase() ? 3 : 0;
      return { ...memory, relevance: overlap + productBoost };
    }).filter((memory) => memory.relevance > 0 || (!query && !product))
      .sort((a, b) => b.relevance - a.relevance || String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 8);
  }

  function evaluate(input) {
    const text = String(input.content || "").trim();
    if (!text) throw new Error("K7 Judge necesita contenido");
    const defaultChecks = [
      { id: "specificity", label: "Especificidad", passed: /\d|objetivo|producto|audiencia|canal|plazo/i.test(text), weight: 20 },
      { id: "evidence", label: "Evidencia", passed: /fuente|evidencia|dato|resultado|metrica|review|estudio|segun/i.test(text), weight: 25 },
      { id: "actionability", label: "Accion", passed: /siguiente|crear|probar|medir|validar|comparar|implementar|publicar/i.test(text), weight: 20 },
      { id: "risk", label: "Riesgo", passed: /riesgo|supuesto|limitacion|aproba|regulacion|claim|seguridad/i.test(text), weight: 20 },
      { id: "structure", label: "Estructura", passed: text.length >= 180 && (text.includes("\n") || /1\.|2\.|- /.test(text)), weight: 15 },
    ];
    const profiles = {
      social: [
        { id: "usable", label: "Texto publicable", passed: text.length >= 40, weight: 25 },
        { id: "focus", label: "Mensaje enfocado", passed: text.length <= 2200, weight: 20 },
        { id: "action", label: "Llamada a la accion", passed: /comenta|descubre|conoce|visita|prueba|responde|cuentame|¿|\?/i.test(text), weight: 20 },
        { id: "clarity", label: "Claridad", passed: text.split(/\s+/).length >= 8, weight: 15 },
        { id: "safety", label: "Claims prudentes", passed: !/garantiza|cura|sin riesgo|resultados asegurados|100%/i.test(text), weight: 20 },
      ],
      commerce: [
        { id: "value", label: "Propuesta de valor", passed: /beneficio|para |ayuda|diseñado|creado/i.test(text), weight: 20 },
        { id: "detail", label: "Detalle suficiente", passed: text.length >= 250, weight: 20 },
        { id: "usage", label: "Uso o funcionamiento", passed: /uso|utiliza|funciona|como|modo/i.test(text), weight: 15 },
        { id: "objections", label: "Objeciones o FAQ", passed: /faq|pregunta|envio|devolucion|incluye|ideal/i.test(text), weight: 20 },
        { id: "safety", label: "Claims prudentes", passed: !/garantiza|cura|sin riesgo|resultados asegurados|100%/i.test(text), weight: 25 },
      ],
    };
    const checks = profiles[input.profile] || defaultChecks;
    const riskyClaims = [/\bgarantiza\b/i, /\bsin riesgo\b/i, /\b100%\b/i, /\bcura\b/i, /\bresultados asegurados\b/i].filter((pattern) => pattern.test(text));
    const score = Math.max(0, checks.reduce((total, check) => total + (check.passed ? check.weight : 0), 0) - riskyClaims.length * 15);
    const store = judgeStore.read();
    const evaluation = { id: id("eval"), subject: input.subject || "output", profile: input.profile || "default", product: input.product || "", score, verdict: score >= 80 ? "pass" : score >= 60 ? "revise" : "block", checks, flags: riskyClaims.map((pattern) => `Claim de riesgo detectado: ${pattern.source}`), createdAt: new Date().toISOString() };
    store.evaluations.push(evaluation); judgeStore.write(store); return evaluation;
  }

  function status() {
    const runtime = runtimeStore.read(); const memory = memoryStore.read(); const judge = judgeStore.read();
    const pending = runtime.approvals.filter((item) => item.status === "pending").length;
    return {
      components: [
        { id: "scope", name: "K7 Scope", status: "enforced", count: pending },
        { id: "memory", name: "K7 Memory", status: "ready", count: memory.memories.length },
        { id: "judge", name: "K7 Judge", status: "ready", count: judge.evaluations.length },
        { id: "operator", name: "K7 Operator", status: "operational", count: runtime.runs.length },
      ],
      pendingApprovals: pending, recentRuns: runtime.runs.slice(-8).reverse(), recentEvaluations: judge.evaluations.slice(-6).reverse(),
    };
  }

  return { completeRun, decideApproval, evaluate, finishApproval, getApproval, listApprovals, operatorPlan, recordTool, remember, requestApproval, searchMemory, startRun, status, updateRun };
}

module.exports = { createKaizenCore };
