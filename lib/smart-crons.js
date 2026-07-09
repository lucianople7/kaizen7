const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { runCronDoctor } = require("./cron-doctor");
const {
  appendSignalPacket,
  buildSignalPacket,
} = require("./signal-ingestion");
const {
  buildImplementationQueue,
  loadHunterRegistry: loadHunterRegistryCore,
} = require("./hunter");

const DEFAULT_MANIFEST = path.join(__dirname, "..", "data", "smart-crons.json");
const DEFAULT_SIGNAL_RADAR = path.join(__dirname, "..", "data", "thefocux-signal-radar.json");
const DEFAULT_HUNTER_REGISTRY = path.join(__dirname, "..", "data", "hunter-registry.json");
const DEFAULT_MARKET_WATCH = path.join(__dirname, "..", "data", "market-watch.json");
const DEFAULT_FRONTIER_WATCH = path.join(__dirname, "..", "data", "frontier-watch.json");
const DEFAULT_DATE = () => new Date().toISOString().slice(0, 10);

function readIfExists(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function exists(root, relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function loadCronManifest(filePath = DEFAULT_MANIFEST) {
  const manifest = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!Array.isArray(manifest.crons)) throw new Error("Invalid smart cron manifest: missing crons");
  return manifest;
}

function loadSignalRadar(filePath = DEFAULT_SIGNAL_RADAR) {
  const candidates = [
    filePath,
    path.join(__dirname, "..", "..", "thefocux", "_kaizen7_import", "data", "thefocux-signal-radar.json"),
    path.join(__dirname, "..", "..", "thefocux", "data", "thefocux-signal-radar.json"),
  ];
  const existingPath = candidates.find((candidate) => fs.existsSync(candidate));
  const radar = existingPath
    ? JSON.parse(fs.readFileSync(existingPath, "utf8"))
    : {
      write_target: path.join("Obsidian", "TheFocux", "THE FOCUX Signal Bowl.md"),
      storage: "THE_FOCUX_SIGNAL_LIBRARY/00_Inbox",
      max_actions: 1,
      missions: [
        {
          title: "Refresh THE FOCUX external signal radar",
          lane: "THE FOCUX Growth",
          query: "THE FOCUX external repo signal radar",
          why: "THE FOCUX signal radar now lives in the product repo.",
        },
      ],
    };
  if (!Array.isArray(radar.missions)) throw new Error("Invalid signal radar manifest: missing missions");
  return radar;
}

function loadHunterRegistry(filePath = DEFAULT_HUNTER_REGISTRY) {
  return loadHunterRegistryCore(filePath);
}

function loadMarketWatch(filePath = DEFAULT_MARKET_WATCH) {
  const watch = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!Array.isArray(watch.targets)) throw new Error("Invalid market watch manifest: missing targets");
  return watch;
}

function loadFrontierWatch(filePath = DEFAULT_FRONTIER_WATCH) {
  const watch = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!Array.isArray(watch.targets)) throw new Error("Invalid frontier watch manifest: missing targets");
  return watch;
}

function getCron(id, manifest = loadCronManifest()) {
  const cron = manifest.crons.find((item) => item.id === id);
  if (!cron) throw new Error(`Unknown smart cron: ${id}`);
  return cron;
}

function makeAction(type, title, extra = {}) {
  return { type, title, ...extra };
}

function runDaily(root, date) {
  const semaforoPath = path.join("Obsidian", "Flowmatik", "Kaizen7", "semaforo.md");
  const dailyPath = path.join("Obsidian", "Flowmatik", "Kaizen7", `${date}.md`);
  const semaforo = readIfExists(path.join(root, semaforoPath));
  const daily = readIfExists(path.join(root, dailyPath));
  const signals = [];
  const actions = [];

  if (semaforo) signals.push(`Read semaforo: ${semaforoPath}`);
  if (daily) signals.push(`Read daily note: ${dailyPath}`);
  if (!/siguiente accion/i.test(daily) || /sin siguiente accion clara/i.test(daily)) {
    actions.push(makeAction("memory_review", "Clarify next action in the daily note", { target: dailyPath }));
  }
  if (/bloqueado|pendiente|amarillo/i.test(semaforo)) {
    actions.push(makeAction("memory_review", "Review active semaforo blockers", { target: semaforoPath }));
  }

  return { signals, actions };
}

function runSkillHealth(root) {
  const skillRoot = path.join(root, ".agents", "skills");
  const skills = fs.existsSync(skillRoot)
    ? fs.readdirSync(skillRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name)
    : [];
  const signals = skills.map((skill) => `Found skill: .agents/skills/${skill}`);
  const actions = skills.map((skill) => makeAction("validate_skill", `Validate ${skill}`, {
    command: `python C:\\Users\\lucia\\.codex\\skills\\.system\\skill-creator\\scripts\\quick_validate.py .agents\\skills\\${skill}`,
    target: `.agents/skills/${skill}/SKILL.md`,
  }));
  return { signals, actions };
}

function runTheFocux(root) {
  const signals = [];
  const actions = [];
  if (exists(root, path.join("site", "thefocux", "public", "ai-index.json"))) {
    signals.push("Found THE FOCUX AI index");
  }
  if (exists(root, path.join("site", "thefocux", "public", "index.html"))) {
    signals.push("Found THE FOCUX public home");
  }
  actions.push(makeAction("growth_review", "Choose one THE FOCUX growth move", {
    target: "site/thefocux",
    skill: "k7-hive-memory",
  }));
  return { signals, actions };
}

function runRepoHunter(root) {
  const signals = [];
  if (exists(root, path.join(".agents", "skills", "repo-hunter-github", "SKILL.md"))) {
    signals.push("Repo Hunter skill available");
  }
  return {
    signals,
    actions: [
      makeAction("repo_hunter_review", "Use Repo Hunter only for repeated missing capability", {
        skill: "repo-hunter-github",
        target: "Obsidian/Flowmatik/Evolution/intakes",
      }),
    ],
  };
}

function collectHunterCandidates(registry) {
  return buildImplementationQueue(registry, { limit: 50 }).map((candidate) => ({
    ...candidate,
    reason: candidate.reason || "",
  }));
}

function runHunterDaily(root) {
  const registryPath = path.join(root, "data", "hunter-registry.json");
  const registry = loadHunterRegistry(registryPath);
  const candidates = collectHunterCandidates(registry)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  const moduleCount = Object.keys(registry.modules).length;
  return {
    signals: [
      `Hunter registry modules: ${moduleCount}`,
      `Hunter candidates reviewed: ${collectHunterCandidates(registry).length}`,
    ],
    actions: candidates.map((candidate) => makeAction(
      candidate.verdict === "adopt_now" ? "hunter_adopt" : candidate.verdict === "adapt_pattern" ? "hunter_adapt" : "hunter_test",
      `${candidate.module}: ${candidate.candidate}`,
      {
        module: candidate.module,
        candidate: candidate.candidate,
        source: candidate.source,
        license: candidate.license,
        verdict: candidate.verdict,
        score: candidate.score,
        why: candidate.reason,
        target: "data/hunter-registry.json",
        output: "1 prueba minima, 1 metrica de exito, 1 decision adopt/adapt/reject",
      },
    )),
  };
}

function priorityScore(priority = "P3") {
  return { P0: 0, P1: 1, P2: 2, P3: 3 }[priority] ?? 3;
}

function runMarketWatch(root) {
  const watchPath = path.join(root, "data", "market-watch.json");
  const watch = loadMarketWatch(fs.existsSync(watchPath) ? watchPath : DEFAULT_MARKET_WATCH);
  const target = watch.write_target || path.join("Obsidian", "Flowmatik", "Producto", "KAIZEN7 Market Watch.md");
  const maxActions = Math.max(1, Math.min(Number(watch.max_actions) || 4, 5));
  const targets = [...watch.targets]
    .sort((a, b) => priorityScore(a.priority) - priorityScore(b.priority) || a.id.localeCompare(b.id));
  const actions = targets.slice(0, maxActions).map((item) => makeAction("market_watch_packet", `Watch ${item.name}`, {
    lane: item.lane,
    priority: item.priority || "P3",
    query: item.query,
    sourceUrl: item.source_url || "",
    watchFor: item.watch_for || [],
    adaptTo: item.adapt_to || [],
    target,
    output: "1 change, 1 KAIZEN7 adaptation, 1 reject/hold decision, 1 verification metric",
  }));
  return {
    signals: [
      `Market watch targets: ${watch.targets.length}`,
      `Market watch write target: ${target}`,
      "Mode: propose-only, adapt patterns before adopting tools",
    ],
    actions,
  };
}

function frontierText(target, watch, date) {
  return [
    `# Frontier signal: ${target.name}`,
    "",
    `Date: ${date}.`,
    `Kind: ${target.kind || "api"}.`,
    target.source_url ? `Source: ${target.source_url}.` : `Query: ${target.query}.`,
    `Watch for: ${(target.watch_for || []).join(", ")}.`,
    `Adapt to KAIZEN7: ${(target.adapt_to || []).join(", ")}.`,
    "",
    "Next: score this as a supervised KAIZEN7 adapter before implementation.",
    "Risk: reject hype, credentials, paid resources, unclear licenses, unsafe publication and unverified claims.",
    "",
    `Rules: ${(watch.rules || []).slice(0, 3).join(" ")}`,
  ].join("\n");
}

function buildFrontierPackets(watch, date) {
  const maxPackets = Math.max(1, Math.min(Number(watch.max_packets) || 5, 10));
  const targets = [...watch.targets]
    .sort((a, b) => priorityScore(a.priority) - priorityScore(b.priority) || a.id.localeCompare(b.id))
    .slice(0, maxPackets);
  return targets.map((target) => ({
    id: `${date}:${target.id}`,
    targetId: target.id,
    priority: target.priority || "P3",
    kind: target.kind || "api",
    packet: buildSignalPacket({
      source: {
        type: target.source_type || "web",
        url: target.source_url || "",
        domain: target.source_domain || "",
        fetchedAt: `${date}T00:00:00.000Z`,
      },
      text: frontierText(target, watch, date),
    }),
  }));
}

function appendUniqueSignalPackets(entries, inboxPath) {
  fs.mkdirSync(path.dirname(inboxPath), { recursive: true });
  const existing = fs.existsSync(inboxPath) ? JSON.parse(fs.readFileSync(inboxPath, "utf8")) : [];
  const seen = new Set(existing.map((packet) => packet.frontier?.id).filter(Boolean));
  let next = existing;
  let inserted = 0;
  for (const entry of entries) {
    if (seen.has(entry.id)) continue;
    const packet = {
      ...entry.packet,
      frontier: {
        id: entry.id,
        targetId: entry.targetId,
        priority: entry.priority,
        kind: entry.kind,
      },
    };
    next = appendSignalPacket(packet, inboxPath);
    seen.add(entry.id);
    inserted += 1;
  }
  return { inserted, total: next.length, inboxPath };
}

function runFrontierWatch(root, date, options = {}) {
  const watchPath = path.join(root, "data", "frontier-watch.json");
  const watch = loadFrontierWatch(fs.existsSync(watchPath) ? watchPath : DEFAULT_FRONTIER_WATCH);
  const inboxPath = path.join(root, watch.write_target || "data/signal-inbox.json");
  const memoryTarget = watch.memory_target || path.join("Obsidian", "Flowmatik", "Arquitectura", "K7 Frontier Watch.md");
  const entries = buildFrontierPackets(watch, date);
  const writeResult = options.writeSignals ? appendUniqueSignalPackets(entries, inboxPath) : null;
  return {
    signals: [
      `Frontier watch targets: ${watch.targets.length}`,
      `Frontier packets proposed: ${entries.length}`,
      `Frontier write target: ${watch.write_target || "data/signal-inbox.json"}`,
      "Mode: sourceable packets first, implementation later",
      ...(writeResult ? [`Frontier packets inserted: ${writeResult.inserted}`] : []),
    ],
    actions: entries.map((entry) => makeAction("frontier_signal_packet", entry.packet.content.title, {
      targetId: entry.targetId,
      priority: entry.priority,
      kind: entry.kind,
      sourceUrl: entry.packet.source.url || "",
      query: watch.targets.find((target) => target.id === entry.targetId)?.query || "",
      target: memoryTarget,
      inbox: watch.write_target || "data/signal-inbox.json",
      output: "1 sourceable change, 1 KAIZEN7 adaptation, 1 reject/hold decision, 1 verification metric",
      writeSignals: Boolean(writeResult),
    })),
    writeResult,
  };
}

function runSignalRadar(root) {
  const radar = loadSignalRadar();
  const bowlPath = radar.write_target || path.join("Obsidian", "TheFocux", "THE FOCUX Signal Bowl.md");
  const bowl = readIfExists(path.join(root, bowlPath));
  const storage = radar.storage || "THE_FOCUX_SIGNAL_LIBRARY/00_Inbox";
  const storageExists = exists(root, storage);
  const signals = [
    bowl ? `Read Signal Bowl: ${bowlPath}` : `Missing Signal Bowl: ${bowlPath}`,
    storageExists ? `Signal library ready: ${storage}` : `Missing signal library inbox: ${storage}`,
  ];
  const maxActions = Math.max(1, Math.min(Number(radar.max_actions) || 3, 3));
  const missions = radar.missions
    .filter((mission) => !mission.source_url || !bowl.includes(mission.source_url))
    .slice(0, maxActions);
  const actions = missions.map((mission) => makeAction("research_packet", mission.title, {
    lane: mission.lane,
    query: mission.query,
    sourceUrl: mission.source_url || "",
    why: mission.why,
    target: bowlPath,
    storage,
    output: "3 datos utiles, 1 accion minima, 1 descarte si aplica",
  }));
  if (!actions.length) {
    actions.push(makeAction("research_packet", "Refresh THE FOCUX Signal Radar missions", {
      target: "data/thefocux-signal-radar.json",
      storage,
      output: "Add 3 new sourceable missions only if they reduce steps.",
    }));
  }
  return { signals, actions };
}

function runMaintenance(root) {
  const packageJson = readIfExists(path.join(root, "package.json"));
  const signals = packageJson ? ["Found package.json"] : [];
  const actions = [];
  if (packageJson && JSON.parse(packageJson).scripts?.check) {
    actions.push(makeAction("verification", "Run repository check", { command: "npm.cmd run check" }));
  }
  return { signals, actions };
}

function runCronDoctorCron(root) {
  const manifestPath = path.join(root, "data", "smart-crons.json");
  const manifest = loadCronManifest(manifestPath);
  const doctor = runCronDoctor({ manifest });
  return {
    signals: doctor.review.issues.length
      ? doctor.review.issues.map((item) => `Cron issue: ${item.code}`)
      : ["Smart cron manifest reviewed"],
    actions: doctor.actions.length
      ? doctor.actions
      : [makeAction("cron_doctor_review", "No smart cron repairs needed", { target: "data/smart-crons.json" })],
  };
}

function runSmartCron(id, options = {}) {
  const root = options.root || process.cwd();
  const date = options.date || DEFAULT_DATE();
  const cron = getCron(id, options.manifest || loadCronManifest());
  const runners = {
    daily: runDaily,
    "skill-health": runSkillHealth,
    thefocux: runTheFocux,
    "repo-hunter": runRepoHunter,
    "hunter-daily": runHunterDaily,
    "market-watch": runMarketWatch,
    "frontier-watch": runFrontierWatch,
    "signal-radar": runSignalRadar,
    maintenance: runMaintenance,
    "cron-doctor": runCronDoctorCron,
  };
  const runner = runners[id];
  if (!runner) throw new Error(`Unknown smart cron: ${id}`);
  const result = runner(root, date, options);
  return {
    id,
    title: cron.title,
    mode: cron.mode,
    date,
    signals: result.signals,
    actions: result.actions,
    ...(result.writeResult ? { writeResult: result.writeResult } : {}),
  };
}

function scoreAction(action, source) {
  if (source === "daily" && /semaforo|blocker|bloque/i.test(action.title || "")) return 110;
  if (source === "daily" && action.type === "memory_review") return 100;
  if (source === "maintenance" && action.type === "verification") return 80;
  if (source === "cron-doctor") return 70;
  if (source === "signal-radar") return 65;
  if (source === "frontier-watch") return 64;
  if (source === "hunter-daily") return 64;
  if (source === "market-watch") return 63;
  if (source === "thefocux") return 60;
  if (source === "skill-health") return 50;
  if (source === "repo-hunter") return 30;
  return 10;
}

function selectPriority(reports) {
  const candidates = reports.flatMap((report) => report.actions.map((action) => ({
    ...action,
    source: report.id,
    score: scoreAction(action, report.id),
  })));
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0] || {
    title: "No immediate action",
    source: "brief",
    type: "none",
    score: 0,
  };
}

function buildBriefMemory(brief) {
  return [
    "## K7 Daily Operator Brief",
    "",
    `### Fecha`,
    "",
    brief.date,
    "",
    "### Prioridad de hoy",
    "",
    brief.priority.title,
    "",
    "### Razon",
    "",
    `Fuente: ${brief.priority.source}. Score: ${brief.priority.score}.`,
    "",
    "### Bloqueos",
    "",
    ...(brief.blockers.length ? brief.blockers.map((blocker) => `- ${blocker}`) : ["- Sin bloqueos nuevos detectados."]),
    "",
    "### Accion minima",
    "",
    brief.priority.command ? `Ejecutar: \`${brief.priority.command}\`` : `Revisar: ${brief.priority.target || brief.priority.source}`,
    "",
    "### Riesgo",
    "",
    "Modo propuesta. No publica, no borra, no gasta y no toca credenciales.",
    "",
  ].join("\n");
}

function buildDailyBrief(options = {}) {
  const root = options.root || process.cwd();
  const date = options.date || DEFAULT_DATE();
  const cronIds = ["daily", "maintenance", "thefocux", "signal-radar", "frontier-watch", "hunter-daily", "market-watch", "skill-health", "repo-hunter", "cron-doctor"];
  const reports = cronIds.map((id) => runSmartCron(id, { root, date, writeSignals: options.writeSignals }));
  const priority = selectPriority(reports);
  const blockers = reports
    .flatMap((report) => report.signals.concat(report.actions.map((action) => action.title)))
    .filter((item) => /bloque|block|pendiente|semaforo|issue/i.test(item));
  const brief = { id: "brief", title: "K7 Daily Operator Brief", mode: "propose", date, reports, priority, blockers };
  brief.memory = buildBriefMemory(brief);
  return brief;
}

function compactAction(priority) {
  if (priority.command) return `Ejecutar: ${priority.command}`;
  return `Revisar: ${priority.target || priority.source}`;
}

function defaultSafeRunner(command, root) {
  if (command === "npm.cmd run check") {
    const stdout = execFileSync("npm.cmd", ["run", "check"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { exitCode: 0, stdout, stderr: "" };
  }
  throw new Error(`Unsafe command: ${command}`);
}

function applySafeAction(action, options = {}) {
  const root = options.root || process.cwd();
  if (!action.command) {
    return {
      status: "skipped",
      reason: "manual_review_required",
      target: action.target || "",
    };
  }
  if (action.command !== "npm.cmd run check") {
    return {
      status: "blocked",
      reason: "unsafe_command",
      command: action.command,
    };
  }
  const runner = options.runner || ((command) => defaultSafeRunner(command, root));
  try {
    const result = runner(action.command);
    return {
      status: "applied",
      command: action.command,
      exitCode: result.exitCode,
      stdout: result.stdout || "",
      stderr: result.stderr || "",
    };
  } catch (error) {
    return {
      status: "failed",
      command: action.command,
      reason: error.message,
    };
  }
}

function appendApplyMemory(memory, apply) {
  const lines = [
    memory.trimEnd(),
    "",
    "### Aplicacion segura",
    "",
    `Estado: ${apply.status}`,
    apply.command ? `Comando: \`${apply.command}\`` : "",
    apply.reason ? `Razon: ${apply.reason}` : "",
    "",
  ];
  return lines.filter((line, index) => line !== "" || lines[index - 1] !== "").join("\n");
}

function buildK7Compact(options = {}) {
  const brief = buildDailyBrief(options);
  const compact = {
    id: "k7",
    date: brief.date,
    priority: brief.priority.title,
    action: compactAction(brief.priority),
    command: brief.priority.command || "",
    risk: "interno seguro",
  };
  compact.memory = brief.memory;
  if (options.applySafe) {
    compact.apply = applySafeAction(brief.priority, options);
    compact.memory = appendApplyMemory(compact.memory, compact.apply);
  }
  return compact;
}

function buildMemoryEntry(report, options = {}) {
  const date = options.date || report.date || DEFAULT_DATE();
  const actions = report.actions.length
    ? report.actions.map((action) => `- ${action.title}${action.command ? `: \`${action.command}\`` : ""}`).join("\n")
    : "- No action proposed.";
  return [
    `## Smart Cron - ${report.id}`,
    "",
    `### Fecha`,
    "",
    date,
    "",
    "### Signals",
    "",
    ...(report.signals.length ? report.signals.map((signal) => `- ${signal}`) : ["- No signals."]),
    "",
    "### Proposed actions",
    "",
    actions,
    "",
  ].join("\n");
}

function appendMemory(report, root = process.cwd()) {
  const dailyPath = path.join(root, "Obsidian", "Flowmatik", "Kaizen7", `${report.date}.md`);
  fs.mkdirSync(path.dirname(dailyPath), { recursive: true });
  fs.appendFileSync(dailyPath, `\n${report.memory || buildMemoryEntry(report)}\n`);
  return dailyPath;
}

if (require.main === module) {
  const id = process.argv[2] || "daily";
  const writeMemory = process.argv.includes("--write-memory") || id === "k7";
  const writeSignals = process.argv.includes("--write-signals");
  const applySafe = process.argv.includes("--apply-safe");
  const report = id === "brief"
    ? buildDailyBrief({ writeSignals })
    : id === "k7"
      ? buildK7Compact({ applySafe, writeSignals })
      : runSmartCron(id, { writeSignals });
  if (writeMemory) report.memoryPath = appendMemory(report);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

module.exports = {
  loadCronManifest,
  loadSignalRadar,
  loadHunterRegistry,
  loadMarketWatch,
  loadFrontierWatch,
  runSmartCron,
  buildDailyBrief,
  buildK7Compact,
  applySafeAction,
  buildMemoryEntry,
  appendMemory,
};
