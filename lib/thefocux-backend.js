const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_STATE = {
  schema: "the_focux.backend_state.v1",
  brand: {
    name: "THE FOCUX",
    tagline: "Premium sin humo. Ciencia sin soberbia. Comercio sin trampa.",
    position: "Publicacion premium y futura marca de alto rendimiento mental, fisico y profesional.",
    promise: "Criterio editorial, evidencia visible y seleccion premium antes de comercio.",
    audience: "Fundadores, profesionales, programadores, directivos, traders y personas con responsabilidades reales.",
    tone: "Adulto, preciso, sobrio, cientifico sin arrogancia y comercial sin agresividad.",
  },
  offer: {
    id: "founding-offer",
    title: "Lista Fundadora THE FOCUX",
    headline: "No vendemos ruido. Construimos criterio.",
    subheadline: "Una publicacion privada para profesionales que quieren energia, foco y mejores decisiones sin promesas faciles.",
    cta: "Unirme a la lista fundadora",
    lead_magnet: "Guia gratuita: 7 criterios para elegir suplementos y herramientas de rendimiento sin caer en humo.",
    status: "founder_beta",
  },
  founder_pass: {
    title: "Founder Pass 001",
    promise: "Acceso temprano a dossiers, comparativas, contenido de Kaizen y la futura seleccion THE FOCUX.",
    includes: [
      "Dossier Energia con criterio",
      "Guia 7 criterios antes de comprar",
      "Acceso a contenido temprano de Kaizen",
      "Voto temprano sobre la futura seleccion",
    ],
    disclaimer: "Unirte no implica compra, consejo medico ni recomendacion personalizada.",
  },
  manifesto: [
    "No vendemos cientos de suplementos.",
    "Seleccionamos solo lo que pasaria nuestro filtro de evidencia, calidad y utilidad real.",
    "Antes de comercio: criterio, fuentes, limites y contexto.",
  ],
  trust_cards: [
    { label: "Posicion", value: "Publicacion premium antes que tienda" },
    { label: "Metodo", value: "Fuente primero. Dato despues. Accion minima al final." },
    { label: "Promesa", value: "Menos ruido. Mas criterio." },
  ],
  os: {
    phase: "OS Lite",
    rule: "Confianza -> evidencia -> comunidad -> seleccion -> comercio",
    modules: [
      "Public Platform",
      "Dossier Engine",
      "Evidence Library",
      "AI Layer",
      "Content Studio",
      "Founding List",
      "Compliance Gate",
      "Selection / Commerce",
      "KAIZEN7 Operator",
    ],
  },
  ecosystem: [
    { id: "kaizen", name: "Kaizen", role: "mentor y cara publica", output: "confianza, contenido y comunidad" },
    { id: "flowmatik", name: "Flowmatik", role: "motor de render interno del backend de thefocuxOS", output: "videos, assets, guiones y campanas" },
    { id: "kaizen7", name: "KAIZEN7", role: "kernel de coordinacion, invisible para el publico", output: "misiones, contexto minimo y verificacion" },
  ],
  product_path: [
    "contenido",
    "confianza",
    "lista fundadora",
    "dossiers",
    "seleccion curada",
    "producto propio",
  ],
  dossier: {
    id: "energia-con-criterio",
    title: "Energia con criterio: por que THE FOCUX no vende ruido",
    thesis: "No necesitas mas ruido. Necesitas menos friccion entre tu cuerpo, tu atencion y tus decisiones.",
    summary: "THE FOCUX trata la energia como un sistema: descanso, alimentacion, movimiento, atencion, entorno y carga de decisiones antes de cualquier compra.",
    evidence_level: "low",
    status: "draft",
    review_required: true,
    cta: "Unete a la founding list si quieres una biblioteca de criterio antes de venderte nada.",
    blocked_claims: [
      "mejora la memoria",
      "aumenta la energia garantizada",
      "reduce el estres",
      "cura fatiga",
      "resetea dopamina",
      "detox mental",
      "maximo rendimiento",
      "resultados en X dias",
    ],
  },
  content_pack: {
    hooks: [
      "Si tu energia depende de vivir estimulado, no tienes energia: tienes emergencia.",
      "Antes de preguntarte que tomar, preguntate que esta drenando tu sistema.",
      "THE FOCUX no empieza vendiendo foco. Empieza quitando ruido.",
      "Una mente exigente no necesita promesas. Necesita criterio.",
      "Energia no es acelerarte. Es dejar de perder recursos por todas partes.",
    ],
    first_video: {
      title: "Energia con criterio",
      duration: "45-60s",
      cta: "Entra en la founding list para una biblioteca de energia y foco sin promesas faciles.",
      scriptline: "Si tu energia depende de vivir estimulado, no tienes energia. Tienes emergencia.",
    },
  },
  selection: {
    position: "Curator brand antes que tienda.",
    rule: "Menos productos, mejor seleccion.",
    categories: [
      "nootropicos premium",
      "sueño y recuperacion",
      "luz roja y biohacking sobrio",
      "cafe, matcha y nutricion funcional",
      "software y herramientas de productividad",
    ],
    requirements: [
      "evidencia",
      "fabricante",
      "dosis o especificacion",
      "legalidad",
      "limitaciones",
      "conflictos comerciales visibles",
    ],
  },
  live_status: [
    { label: "Founding list", status: "Activa en local", detail: "Formulario conectado al backend." },
    { label: "Dossier engine", status: "Primer draft listo", detail: "Energia con criterio requiere revision de fuentes externas." },
    { label: "Content studio", status: "Primer pack definido", detail: "Hooks y video vertical listos para producir." },
    { label: "Selection", status: "Futura", detail: "Solo entrara tras evidencia, legalidad y disclosure." },
  ],
  guardrails: [
    "No hacer claims medicos.",
    "No prometer resultados garantizados.",
    "No publicar automaticamente.",
    "Marcar claims sensibles para revision.",
    "Separar dossier editorial de producto comercial.",
  ],
  waitlist: [],
  updated_at: null,
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureState(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  if (!fs.existsSync(filePath)) {
    const state = clone(DEFAULT_STATE);
    state.updated_at = new Date().toISOString();
    fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
  }
}

function readTheFocuxState(root = process.cwd()) {
  const filePath = path.join(root, "data", "thefocux-backend.json");
  ensureState(filePath);
  const state = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return {
    ...clone(DEFAULT_STATE),
    ...state,
    brand: { ...clone(DEFAULT_STATE.brand), ...(state.brand || {}) },
    offer: { ...clone(DEFAULT_STATE.offer), ...(state.offer || {}) },
    founder_pass: { ...clone(DEFAULT_STATE.founder_pass), ...(state.founder_pass || {}) },
    os: { ...clone(DEFAULT_STATE.os), ...(state.os || {}) },
    dossier: { ...clone(DEFAULT_STATE.dossier), ...(state.dossier || {}) },
    content_pack: { ...clone(DEFAULT_STATE.content_pack), ...(state.content_pack || {}) },
    selection: { ...clone(DEFAULT_STATE.selection), ...(state.selection || {}) },
  };
}

function saveTheFocuxState(state, root = process.cwd()) {
  const filePath = path.join(root, "data", "thefocux-backend.json");
  const nextState = { ...state, updated_at: new Date().toISOString() };
  fs.writeFileSync(filePath, JSON.stringify(nextState, null, 2));
  return nextState;
}

function publicTheFocuxState(root = process.cwd()) {
  const state = readTheFocuxState(root);
  return {
    schema: "the_focux.frontend_payload.v1",
    brand: state.brand,
    offer: state.offer,
    founder_pass: state.founder_pass,
    manifesto: state.manifesto,
    trust_cards: state.trust_cards,
    os: state.os,
    ecosystem: state.ecosystem,
    product_path: state.product_path,
    dossier: state.dossier,
    content_pack: state.content_pack,
    selection: state.selection,
    live_status: state.live_status,
    guardrails: state.guardrails,
    metrics: {
      waitlist_count: state.waitlist.length,
      status: state.offer.status,
      updated_at: state.updated_at,
    },
  };
}

function normalizeEmail(email = "") {
  return String(email || "").trim().toLowerCase();
}

function addWaitlistLead(payload = {}, root = process.cwd()) {
  const email = normalizeEmail(payload.email);
  const name = String(payload.name || "").trim();
  const role = String(payload.role || "").trim();
  const source = String(payload.source || "thefocux_frontend").trim();
  const consent = Boolean(payload.consent);

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, status: "invalid_email", message: "Introduce un email valido." };
  }
  if (!consent) {
    return { ok: false, status: "consent_required", message: "Confirma que quieres unirte a la lista fundadora." };
  }

  const state = readTheFocuxState(root);
  const existing = state.waitlist.find((lead) => lead.email === email);
  if (existing) {
    return {
      ok: true,
      status: "already_joined",
      lead: existing,
      metrics: { waitlist_count: state.waitlist.length },
    };
  }

  const lead = {
    id: `lead_${Date.now().toString(36)}`,
    email,
    name,
    role,
    source,
    consent,
    created_at: new Date().toISOString(),
  };
  state.waitlist.push(lead);
  const saved = saveTheFocuxState(state, root);
  return {
    ok: true,
    status: "joined",
    lead,
    metrics: { waitlist_count: saved.waitlist.length },
  };
}

function buildTheFocuxMission(root = process.cwd()) {
  const state = publicTheFocuxState(root);
  return {
    schema: "the_focux.mission.v1",
    goal: "Convertir THE FOCUX en una lista fundadora activa con oferta clara y claims seguros.",
    frontend: "thefocuxOS (Next.js App)",
    backend: ["/api/thefocux", "/api/thefocux/waitlist", "/api/thefocux/mission", "/api/extract"],
    current_offer: state.offer,
    current_dossier: state.dossier,
    next_actions: [
      "Revisar copy fundacional con claims.check.",
      "Conectar el dossier Energia con criterio al bloque publico.",
      "Crear primer lead magnet.",
      "Conectar Flowmatik para producir 3 piezas de contenido.",
      "Medir altas en lista fundadora.",
    ],
    guardrails: state.guardrails,
  };
}

function answerTheFocuxQuestion(payload = {}, root = process.cwd()) {
  const question = String(payload.question || "").trim();
  const lower = question.toLowerCase();
  const state = publicTheFocuxState(root);

  if (!question) {
    return {
      schema: "the_focux.answer.v1",
      ok: false,
      answer: "Haz una pregunta sobre THE FOCUX, la lista fundadora, el dossier, Kaizen o la futura seleccion.",
      sources: [],
      next_action: "ask_question",
    };
  }

  const sources = [];
  const parts = [];

  if (/dossier|energia|ruido|criterio|evidencia/.test(lower)) {
    sources.push("dossier:energia-con-criterio");
    parts.push(`${state.dossier.title}: ${state.dossier.thesis}`);
    parts.push(`Estado: ${state.dossier.status}. Nivel de evidencia: ${state.dossier.evidence_level}. Requiere revision: ${state.dossier.review_required ? "si" : "no"}.`);
  }

  if (/kaizen|mentor|personaje|voz|comunidad/.test(lower)) {
    const kaizen = state.ecosystem.find((entry) => entry.id === "kaizen");
    if (kaizen) {
      sources.push("kaizen");
      parts.push(`${kaizen.name}: ${kaizen.role}. Output: ${kaizen.output}.`);
    }
  }

  if (/producto|selection|seleccion|tienda|comprar|suplemento|herramienta/.test(lower)) {
    sources.push("selection");
    parts.push(`${state.selection.position} ${state.selection.rule}`);
    parts.push(`Solo entran opciones con ${state.selection.requirements.join(", ")}.`);
  }

  if (/lista|founding|fundadora|email|entrar|unirme/.test(lower)) {
    sources.push("founding-list");
    parts.push(`La lista fundadora es el primer activo: ${state.offer.lead_magnet}`);
    parts.push(`Ahora mismo hay ${state.metrics.waitlist_count} personas registradas en local.`);
  }

  if (/claim|claims|medico|promesa|legal|seguridad|compliance/.test(lower)) {
    sources.push("guardrails");
    parts.push(`Guardrails: ${state.guardrails.join(" ")}`);
    parts.push(`Claims bloqueados del dossier: ${state.dossier.blocked_claims.slice(0, 5).join(", ")}.`);
  }

  if (!parts.length) {
    sources.push("brand");
    parts.push(`${state.brand.name}: ${state.brand.tagline}`);
    parts.push(state.brand.promise);
    parts.push(`Ruta actual: ${state.product_path.join(" -> ")}.`);
  }

  return {
    schema: "the_focux.answer.v1",
    ok: true,
    question,
    answer: parts.join("\n\n"),
    sources,
    guardrail: "Respuesta editorial local. No es consejo medico, legal ni financiero.",
    next_action: sources.includes("founding-list") ? "join_waitlist" : "read_dossier_or_join_waitlist",
  };
}

module.exports = {
  DEFAULT_STATE,
  addWaitlistLead,
  answerTheFocuxQuestion,
  buildTheFocuxMission,
  publicTheFocuxState,
  readTheFocuxState,
  saveTheFocuxState,
};
