const header = document.querySelector("#siteHeader");
const form = document.querySelector("#waitlistForm");
const statusNode = document.querySelector("#formStatus");
const yearNode = document.querySelector("#year");
const langButtons = document.querySelectorAll("[data-lang]");
const translatableNodes = document.querySelectorAll("[data-i18n]");
const heroAiButton = document.querySelector("#heroAiButton");
const aiDock = document.querySelector("#aiDock");
const aiDockToggle = document.querySelector("#aiDockToggle");
const aiDockPanel = document.querySelector("#aiDockPanel");
const aiDockClose = document.querySelector("#aiDockClose");
const aiSearchForm = document.querySelector("#aiSearchForm");
const aiSearchInput = document.querySelector("#aiSearchInput");
const aiResults = document.querySelector("#aiResults");
const aiDockState = document.querySelector("#aiDockState");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const dictionary = {
  es: {
    "nav.research": "Research",
    "nav.architect": "Arquitecto",
    "nav.neurocity": "NEUROCITY",
    "nav.video": "Video",
    "nav.ai": "AI Layer",
    "nav.platform": "Plataforma",
    "nav.selection": "Seleccion",
    "nav.join": "Unirme",
    "hero.kicker": "Plataforma viva · Research for Human Performance",
    "hero.copy": "Una base editorial premium para entender rendimiento humano, evidencia, NEUROCITY, video y seleccion futura sin ruido ni promesas magicas.",
    "hero.primary": "Entrar en la founding list",
    "hero.ai": "Abrir THE FOCUX AI",
    "proof.evidence": "Evidencia antes que hype",
    "proof.risk": "Riesgo visible",
    "proof.modular": "Abierto a crecer",
    "console.title": "Sistema preparado",
    "console.video": "Video / Remotion",
    "console.lang": "Idiomas",
    "console.ai": "AI / MCP",
    "console.cloud": "Cloudflare",
    "console.commerce": "Commerce",
    "research.kicker": "La publicacion",
    "research.title": "Un filtro serio para un mercado ruidoso.",
    "research.lead": "No necesitas cien recomendaciones. Necesitas distinguir evidencia, mecanismo, marketing y riesgo.",
    "research.body": "THE FOCUX publicara dossiers, comparativas, entrevistas, clips y mapas de evidencia para profesionales, fundadores, operadores y perfiles 35+ interesados en rendimiento sostenible.",
    "neurocity.kicker": "Original IP · Soon",
    "neurocity.copy": "Atencion, memoria, estres, sueno y energia convertidos en historias que se recuerdan. La metafora ayuda a entender; nunca sustituye a la biologia.",
    "neurocity.cta": "Recibir el episodio piloto",
    "video.kicker": "Video engine",
    "video.title": "Una web preparada para trailers, clips y episodios.",
    "video.card1.title": "Hero trailer",
    "video.card1.body": "Espacio listo para un video corto exportado con Remotion o subido como asset optimizado.",
    "video.card2.title": "Clips sociales",
    "video.card2.body": "Formato modular para piezas verticales, teasers y cortes de investigacion.",
    "video.card3.title": "Episodios",
    "video.card3.body": "NEUROCITY puede crecer hacia serie educativa, archivo y biblioteca multimedia.",
    "desk.kicker": "Research desk",
    "desk.title": "Tres verticales. Un mismo criterio.",
    "desk.nootropics.topic": "Nootropicos",
    "desk.nootropics.title": "Que funciona, para quien y a que coste.",
    "desk.nootropics.body": "Ingredientes, dosis, calidad de evidencia, interacciones y diferencias entre promesa comercial y resultado plausible.",
    "desk.science.topic": "Ciencia",
    "desk.science.title": "Mecanismo, evidencia y regulacion.",
    "desk.science.body": "Cobertura educativa sin protocolos medicos, sin prescripcion y sin venta de compuestos no autorizados.",
    "desk.system.topic": "Performance",
    "desk.system.title": "El sistema alrededor de la molecula.",
    "desk.system.body": "Sueno, entrenamiento, analiticas, tecnologia y decisiones que determinan si una intervencion tiene sentido.",
    "platform.kicker": "Arquitectura abierta",
    "platform.title": "Preparada para crecer sin perder foco.",
    "platform.lang.title": "Varios idiomas",
    "platform.lang.body": "Contenido marcado para traducir ES/EN y ampliar a nuevas regiones sin duplicar la pagina.",
    "platform.social.title": "Redes",
    "platform.social.body": "Bloques listos para Instagram, YouTube, TikTok, Spotify, newsletter y comunidad.",
    "platform.integrations.title": "Integraciones",
    "platform.integrations.body": "Cloudflare Functions y D1 como primera base para formularios, leads y automatizaciones.",
    "platform.commerce.title": "Ecommerce",
    "platform.commerce.body": "Selection entra despues: fichas, evidencia, fabricante, limitaciones y conflictos visibles.",
    "platform.payments.title": "Pagos",
    "platform.payments.body": "Preparada para Stripe, Shopify o checkout externo cuando el criterio comercial este cerrado.",
    "platform.mcp.title": "MCP connector",
    "platform.mcp.body": "Endpoint publico de lectura para agentes: contexto, AI index, guardrails y mapa de contenidos.",
    "architect.kicker": "La cara publica",
    "architect.title": "El Arquitecto de NeuroCity.",
    "architect.lead": "No es influencer. No vende. No lleva bata. Es el guia que entra contigo en la ciudad para ordenar lo que compite por tu atencion.",
    "architect.quote": "\"No quiero ensenarte un suplemento. Quiero ensenarte quien toma realmente las decisiones en tu cabeza.\"",
    "architect.trait1": "45-55",
    "architect.trait2": "calma quirurgica",
    "architect.trait3": "negro y oro",
    "architect.trait4": "voz estrategica",
    "hierarchy.kicker": "Arquitectura narrativa",
    "hierarchy.title": "Una cara. Un universo. Un sistema.",
    "hierarchy.brand": "La marca que sostiene criterio, evidencia y confianza.",
    "hierarchy.architect.title": "El Arquitecto",
    "hierarchy.architect.body": "La cara reconocible: voz, guia y presencia publica.",
    "hierarchy.city": "El universo donde ocurren las historias.",
    "hierarchy.guardians.title": "Guardianes",
    "hierarchy.guardians.body": "Dr. Neuro, Memo, Cortex, Corti y Dopa explican funciones concretas.",
    "hierarchy.places.title": "Distritos",
    "hierarchy.places.body": "Torre del Foco, Archivo de la Memoria, Central de Energia y Centro de Decisiones.",
    "ai.kicker": "AI Layer",
    "ai.title": "IA por fuera y por dentro.",
    "ai.lead": "THE FOCUX no se prepara para tener un chatbot. Se prepara para que humanos, modelos y KAIZEN7 entiendan la misma verdad.",
    "ai.status": "preparado, no conectado",
    "ai.user": "Quiero entender si un dossier habla de evidencia, riesgo o marketing.",
    "ai.bot": "Ruta segura: separar mecanismo, estudios humanos, limites, regulacion y conflictos. No sustituye consejo medico.",
    "ai.input": "Buscar en dossiers, NEUROCITY o Selection...",
    "ai.human.title": "Para humanos",
    "ai.human.body": "Asistente, buscador inteligente, resumenes, rutas de lectura y recomendaciones editoriales.",
    "ai.models.title": "Para modelos",
    "ai.models.body": "Archivos legibles, datos estructurados, MCP publico y contenido listo para ser citado con limites.",
    "ai.kaizen.title": "Para KAIZEN7",
    "ai.kaizen.body": "Memoria de decisiones, registro de contenidos y base futura para embeddings y RAG.",
    "ai.business.title": "Para negocio",
    "ai.business.body": "Preparado para leads, newsletter, video, ecommerce, pagos, soporte y comparativas con guardrails.",
    "selection.kicker": "THE FOCUX Selection · Soon",
    "selection.title": "Comprar menos. Elegir mejor.",
    "selection.lead": "Una seleccion comercial pequena de suplementos, libros, tests y herramientas legalmente comercializables.",
    "selection.body": "Cada ficha mostrara por que entra, evidencia, dosis, fabricante, limitaciones y relacion comercial. Los productos no autorizados no formaran parte de la tienda.",
    "selection.cta": "Avisarme cuando abra la seleccion",
    "standards.kicker": "Metodo editorial",
    "standards.title": "La confianza no se declara. Se documenta.",
    "standards.one.title": "Jerarquia de evidencia",
    "standards.one.body": "Diferenciamos mecanismo, estudio preclinico, ensayo humano, revision y consenso.",
    "standards.two.title": "Contexto y limites",
    "standards.two.body": "Poblacion, dosis, duracion, resultado y conflictos importan tanto como el titular.",
    "standards.three.title": "Riesgo visible",
    "standards.three.body": "Interacciones, contraindicaciones, incertidumbre y situacion regulatoria aparecen junto al posible beneficio.",
    "standards.four.title": "Independencia comercial",
    "standards.four.body": "Publicidad, afiliacion y muestras se identifican. Ningun pago compra una conclusion.",
    "access.kicker": "Founding list · Soon",
    "access.title": "Recibe el primer dossier.",
    "access.body": "Una edicion semanal, alertas importantes y acceso anticipado a THE FOCUX Selection. Sin spam ni promesas milagrosas.",
    "form.name": "Nombre",
    "form.interest": "Me interesa principalmente",
    "form.consent": "Acepto recibir THE FOCUX y he leido la politica de privacidad.",
    "form.submit": "Unirme a la founding list",
    "faq.kicker": "Preguntas",
    "faq.title": "Limites claros.",
    "faq.one.q": "THE FOCUX vende peptidos?",
    "faq.one.a": "No venderemos productos no autorizados ni medicamentos. La cobertura sera educativa y diferenciara investigacion, medicina autorizada y marketing.",
    "faq.two.q": "El contenido sustituye consejo medico?",
    "faq.two.a": "No. THE FOCUX es una publicacion educativa. Las decisiones de salud, medicacion o tratamiento corresponden a profesionales sanitarios cualificados.",
    "faq.three.q": "Habra productos recomendados?",
    "faq.three.a": "Si, cuando podamos verificar legalidad, composicion, fabricante y utilidad. Toda afiliacion o relacion comercial se mostrara de forma visible.",
  },
  en: {
    "nav.research": "Research",
    "nav.architect": "Architect",
    "nav.neurocity": "NEUROCITY",
    "nav.video": "Video",
    "nav.ai": "AI Layer",
    "nav.platform": "Platform",
    "nav.selection": "Selection",
    "nav.join": "Join",
    "hero.kicker": "Living platform · Research for Human Performance",
    "hero.copy": "A premium editorial base for human performance, evidence, NEUROCITY, video and future selection without noise or miracle claims.",
    "hero.primary": "Join the founding list",
    "hero.ai": "Open THE FOCUX AI",
    "proof.evidence": "Evidence before hype",
    "proof.risk": "Visible risk",
    "proof.modular": "Open to grow",
    "console.title": "System ready",
    "console.video": "Video / Remotion",
    "console.lang": "Languages",
    "console.ai": "AI / MCP",
    "console.cloud": "Cloudflare",
    "console.commerce": "Commerce",
    "research.kicker": "The publication",
    "research.title": "A serious filter for a noisy market.",
    "research.lead": "You do not need a hundred recommendations. You need to separate evidence, mechanism, marketing and risk.",
    "research.body": "THE FOCUX will publish dossiers, comparisons, interviews, clips and evidence maps for professionals, founders, operators and 35+ readers interested in sustainable performance.",
    "neurocity.kicker": "Original IP · Soon",
    "neurocity.copy": "Attention, memory, stress, sleep and energy turned into stories that stick. The metaphor helps people understand; it never replaces biology.",
    "neurocity.cta": "Get the pilot episode",
    "video.kicker": "Video engine",
    "video.title": "A site ready for trailers, clips and episodes.",
    "video.card1.title": "Hero trailer",
    "video.card1.body": "A slot ready for a short Remotion export or an optimized uploaded asset.",
    "video.card2.title": "Social clips",
    "video.card2.body": "A modular format for vertical pieces, teasers and research cuts.",
    "video.card3.title": "Episodes",
    "video.card3.body": "NEUROCITY can grow into an educational series, archive and multimedia library.",
    "desk.kicker": "Research desk",
    "desk.title": "Three verticals. One standard.",
    "desk.nootropics.topic": "Nootropics",
    "desk.nootropics.title": "What works, for whom and at what cost.",
    "desk.nootropics.body": "Ingredients, dose, evidence quality, interactions and the gap between commercial promise and plausible outcome.",
    "desk.science.topic": "Science",
    "desk.science.title": "Mechanism, evidence and regulation.",
    "desk.science.body": "Educational coverage without medical protocols, prescriptions or sale of unauthorized compounds.",
    "desk.system.topic": "Performance",
    "desk.system.title": "The system around the molecule.",
    "desk.system.body": "Sleep, training, testing, technology and decisions that determine whether an intervention makes sense.",
    "platform.kicker": "Open architecture",
    "platform.title": "Ready to grow without losing focus.",
    "platform.lang.title": "Multiple languages",
    "platform.lang.body": "Content is marked for ES/EN translation and can expand into new regions without duplicating the page.",
    "platform.social.title": "Social channels",
    "platform.social.body": "Blocks prepared for Instagram, YouTube, TikTok, Spotify, newsletter and community.",
    "platform.integrations.title": "Integrations",
    "platform.integrations.body": "Cloudflare Functions and D1 are the first base for forms, leads and automation.",
    "platform.commerce.title": "Ecommerce",
    "platform.commerce.body": "Selection comes later: product sheets, evidence, manufacturer, limitations and visible conflicts.",
    "platform.payments.title": "Payments",
    "platform.payments.body": "Prepared for Stripe, Shopify or external checkout once the commercial standard is closed.",
    "platform.mcp.title": "MCP connector",
    "platform.mcp.body": "Public read-only endpoint for agents: context, AI index, guardrails and content map.",
    "architect.kicker": "The public face",
    "architect.title": "The Architect of NeuroCity.",
    "architect.lead": "Not an influencer. Not selling. Not wearing a lab coat. He is the guide who enters the city with you to order what competes for your attention.",
    "architect.quote": "\"I do not want to show you a supplement. I want to show you who really makes decisions inside your head.\"",
    "architect.trait1": "45-55",
    "architect.trait2": "surgical calm",
    "architect.trait3": "black and gold",
    "architect.trait4": "strategic voice",
    "hierarchy.kicker": "Narrative architecture",
    "hierarchy.title": "One face. One universe. One system.",
    "hierarchy.brand": "The brand that holds criteria, evidence and trust.",
    "hierarchy.architect.title": "The Architect",
    "hierarchy.architect.body": "The recognizable face: voice, guide and public presence.",
    "hierarchy.city": "The universe where the stories happen.",
    "hierarchy.guardians.title": "Guardians",
    "hierarchy.guardians.body": "Dr. Neuro, Memo, Cortex, Corti and Dopa explain specific functions.",
    "hierarchy.places.title": "Districts",
    "hierarchy.places.body": "Focus Tower, Memory Archive, Energy Grid and Decision Center.",
    "ai.kicker": "AI Layer",
    "ai.title": "AI outside and inside.",
    "ai.lead": "THE FOCUX is not being prepared to merely have a chatbot. It is being prepared so humans, models and KAIZEN7 share the same truth.",
    "ai.status": "prepared, not connected",
    "ai.user": "I want to know whether a dossier is about evidence, risk or marketing.",
    "ai.bot": "Safe route: separate mechanism, human studies, limits, regulation and conflicts. This is not medical advice.",
    "ai.input": "Search dossiers, NEUROCITY or Selection...",
    "ai.human.title": "For humans",
    "ai.human.body": "Assistant, intelligent search, summaries, reading paths and editorial recommendations.",
    "ai.models.title": "For models",
    "ai.models.body": "Readable files, structured data, public MCP and content ready to be cited with limits.",
    "ai.kaizen.title": "For KAIZEN7",
    "ai.kaizen.body": "Decision memory, content registry and future base for embeddings and RAG.",
    "ai.business.title": "For business",
    "ai.business.body": "Ready for leads, newsletter, video, ecommerce, payments, support and comparisons with guardrails.",
    "selection.kicker": "THE FOCUX Selection · Soon",
    "selection.title": "Buy less. Choose better.",
    "selection.lead": "A small commercial selection of legally marketable supplements, books, tests and tools.",
    "selection.body": "Each sheet will show why it enters, evidence, dose, manufacturer, limitations and commercial relationship. Unauthorized products will not be part of the store.",
    "selection.cta": "Tell me when selection opens",
    "standards.kicker": "Editorial method",
    "standards.title": "Trust is not declared. It is documented.",
    "standards.one.title": "Evidence hierarchy",
    "standards.one.body": "We separate mechanism, preclinical work, human trials, reviews and consensus.",
    "standards.two.title": "Context and limits",
    "standards.two.body": "Population, dose, duration, outcome and conflicts matter as much as the headline.",
    "standards.three.title": "Visible risk",
    "standards.three.body": "Interactions, contraindications, uncertainty and regulatory status appear beside possible benefit.",
    "standards.four.title": "Commercial independence",
    "standards.four.body": "Ads, affiliate links and samples are identified. No payment buys a conclusion.",
    "access.kicker": "Founding list · Soon",
    "access.title": "Receive the first dossier.",
    "access.body": "A weekly edition, important alerts and early access to THE FOCUX Selection. No spam, no miracle claims.",
    "form.name": "Name",
    "form.interest": "Main interest",
    "form.consent": "I agree to receive THE FOCUX and have read the privacy policy.",
    "form.submit": "Join the founding list",
    "faq.kicker": "Questions",
    "faq.title": "Clear limits.",
    "faq.one.q": "Does THE FOCUX sell peptides?",
    "faq.one.a": "We will not sell unauthorized products or medicines. Coverage will be educational and will separate research, authorized medicine and marketing.",
    "faq.two.q": "Does the content replace medical advice?",
    "faq.two.a": "No. THE FOCUX is an educational publication. Health, medication and treatment decisions belong with qualified healthcare professionals.",
    "faq.three.q": "Will products be recommended?",
    "faq.three.a": "Yes, when legality, composition, manufacturer and usefulness can be verified. Any affiliate or commercial relationship will be visible.",
  },
};

if (yearNode) yearNode.textContent = new Date().getFullYear();

window.addEventListener("scroll", () => {
  if (header) header.classList.toggle("scrolled", window.scrollY > 24);
}, { passive: true });

const applyLanguage = (lang) => {
  const copy = dictionary[lang] || dictionary.es;
  document.documentElement.lang = lang;
  translatableNodes.forEach((node) => {
    const key = node.dataset.i18n;
    if (copy[key]) node.textContent = copy[key];
  });
  langButtons.forEach((button) => button.classList.toggle("active", button.dataset.lang === lang));
  localStorage.setItem("thefocux:lang", lang);
};

langButtons.forEach((button) => {
  button.addEventListener("click", () => applyLanguage(button.dataset.lang));
});

applyLanguage(localStorage.getItem("thefocux:lang") || "es");

const setAiDockOpen = (open) => {
  if (!aiDockPanel || !aiDockToggle) return;
  aiDockPanel.hidden = !open;
  aiDockToggle.setAttribute("aria-expanded", String(open));
  aiDock?.classList.toggle("open", open);
  if (open) setTimeout(() => aiSearchInput?.focus(), 80);
};

const renderAiResults = (items, query) => {
  if (!aiResults) return;
  if (!items.length) {
    aiResults.innerHTML = `<article><span>No match</span><p>No hay coincidencias para "${query}". Prueba: brand, evidence, neurocity, selection.</p></article>`;
    return;
  }
  aiResults.innerHTML = items.map((item) => `
    <article>
      <span>${item.id || "public"}</span>
      <h3>${item.title || "THE FOCUX"}</h3>
      <p>${item.text || item.summary || ""}</p>
    </article>
  `).join("");
};

const searchMcp = async (query) => {
  const term = String(query || "").trim();
  if (!term) return;
  setAiDockOpen(true);
  if (aiDockState) aiDockState.textContent = "consulting /mcp";
  if (aiResults) aiResults.innerHTML = "<article><span>Loading</span><p>Consultando el conector MCP publico...</p></article>";
  try {
    const response = await fetch("/mcp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method: "tools/call",
        params: { name: "search_public_content", arguments: { query: term } },
      }),
    });
    const payload = await response.json();
    const text = payload.result?.content?.[0]?.text || "{}";
    const parsed = JSON.parse(text);
    renderAiResults(parsed.matches || [], term);
    if (aiDockState) aiDockState.textContent = `MCP results: ${parsed.count || 0}`;
  } catch {
    if (aiDockState) aiDockState.textContent = "MCP unavailable";
    if (aiResults) aiResults.innerHTML = "<article><span>Error</span><p>No se pudo consultar /mcp en esta vista. Revisa preview o deploy.</p></article>";
  }
};

aiDockToggle?.addEventListener("click", () => setAiDockOpen(aiDockPanel?.hidden));
aiDockClose?.addEventListener("click", () => setAiDockOpen(false));
heroAiButton?.addEventListener("click", () => {
  setAiDockOpen(true);
  searchMcp("ai");
});
document.querySelectorAll("[data-ai-query]").forEach((button) => {
  button.addEventListener("click", () => {
    if (aiSearchInput) aiSearchInput.value = button.dataset.aiQuery || "";
    searchMcp(button.dataset.aiQuery);
  });
});
aiSearchForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  searchMcp(aiSearchInput?.value);
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((node) => revealObserver.observe(node));

if (!reducedMotion) {
  let pointerX = 0;
  let pointerY = 0;
  const motionTargets = document.querySelectorAll(".hero, .visual-card, .series-band, .video-frame, .architect-portrait");

  const setMotionVars = (x, y) => {
    pointerX = x;
    pointerY = y;
    motionTargets.forEach((node) => {
      const rect = node.getBoundingClientRect();
      const localX = (pointerX - rect.left) / rect.width - 0.5;
      const localY = (pointerY - rect.top) / rect.height - 0.5;
      node.style.setProperty("--mx", localX.toFixed(3));
      node.style.setProperty("--my", localY.toFixed(3));
    });
  };

  window.addEventListener("pointermove", (event) => {
    window.requestAnimationFrame(() => setMotionVars(event.clientX, event.clientY));
  }, { passive: true });

  window.addEventListener("scroll", () => {
    const scrollRatio = Math.min(1, window.scrollY / Math.max(1, window.innerHeight));
    document.documentElement.style.setProperty("--scroll-depth", scrollRatio.toFixed(3));
  }, { passive: true });

  const canvas = document.querySelector("#neuralField");
  const ctx = canvas?.getContext("2d");
  const particles = Array.from({ length: 54 }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.00045,
    vy: (Math.random() - 0.5) * 0.00045,
  }));

  const resize = () => {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
  };

  const render = () => {
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = window.devicePixelRatio;

    particles.forEach((point) => {
      point.x += point.vx;
      point.y += point.vy;
      if (point.x < 0 || point.x > 1) point.vx *= -1;
      if (point.y < 0 || point.y > 1) point.vy *= -1;
    });

    for (let i = 0; i < particles.length; i += 1) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j += 1) {
        const b = particles[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);
        if (distance < 0.16) {
          ctx.strokeStyle = `rgba(201,155,53,${0.12 - distance * 0.55})`;
          ctx.beginPath();
          ctx.moveTo(a.x * width, a.y * height);
          ctx.lineTo(b.x * width, b.y * height);
          ctx.stroke();
        }
      }
      ctx.fillStyle = "rgba(240,208,122,.55)";
      ctx.beginPath();
      ctx.arc(a.x * width, a.y * height, 1.35 * window.devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(render);
  };

  if (canvas && ctx) {
    resize();
    window.addEventListener("resize", resize, { passive: true });
    render();
  }
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusNode.className = "form-status";
  if (!form.reportValidity()) return;
  const button = form.querySelector("button[type=submit]");
  const buttonLabel = button.textContent;
  const data = Object.fromEntries(new FormData(form));
  button.disabled = true;
  button.textContent = document.documentElement.lang === "en" ? "Sending..." : "Enviando...";
  try {
    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "No se pudo completar el registro.");
    form.reset();
    statusNode.textContent = result.alreadyRegistered
      ? "Ya estabas en la lista. Te avisaremos cuando haya novedades."
      : "Acceso solicitado. Bienvenido a la lista privada.";
  } catch (error) {
    statusNode.className = "form-status error";
    statusNode.textContent = error.message;
  } finally {
    button.disabled = false;
    button.textContent = buttonLabel;
  }
});
