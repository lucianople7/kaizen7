const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function createMetaBrowser(dataDir) {
  const runsPath = path.join(dataDir, "metabrowser-runs.json");

  function readRuns() {
    if (!fs.existsSync(runsPath)) return [];
    return JSON.parse(fs.readFileSync(runsPath, "utf8"));
  }

  function saveRun(run) {
    const runs = readRuns();
    runs.push(run);
    fs.writeFileSync(runsPath, JSON.stringify(runs.slice(-100), null, 2));
    return run;
  }

  function hasAgentBrowser() {
    const command = process.platform === "win32" ? "where.exe" : "command";
    const args = process.platform === "win32" ? ["agent-browser"] : ["-v", "agent-browser"];
    return spawnSync(command, args, { encoding: "utf8" }).status === 0;
  }

  async function trendSearch(payload = {}) {
    const query = String(payload.query || "").trim();
    if (!query) throw new Error("MetaBrowser necesita una busqueda");
    const platform = String(payload.platform || "web").trim();
    const limit = Math.min(Math.max(Number(payload.limit) || 8, 1), 20);
    const sources = normalizeSources(payload.sources);
    const backend = hasAgentBrowser() ? "agent-browser-ready" : "k7-local-extract";
    const signals = extractSignals({ query, platform, sources, limit });
    const run = saveRun({
      id: `metabrowser_${Date.now().toString(36)}`,
      type: "trend-search",
      query,
      platform,
      backend,
      signals,
      sourceCount: sources.length,
      createdAt: new Date().toISOString(),
    });
    return {
      run,
      backend,
      signals,
      summary: summarizeSignals(query, platform, signals),
      warnings: sources.length ? [] : ["Sin fuente pegada: pega texto, comentarios, reviews o contenido de una pagina para extraer senales reales."],
    };
  }

  return { trendSearch, readRuns, extractSignals };
}

function normalizeSources(sources) {
  if (!Array.isArray(sources)) return [];
  return sources
    .map((source) => ({
      url: String(source.url || "").trim(),
      title: String(source.title || "").trim(),
      text: htmlToText(source.text || source.html || source.body || ""),
    }))
    .filter((source) => source.text);
}

function htmlToText(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSignals({ query, platform, sources, limit }) {
  const queryTokens = tokenize(`${query} ${platform}`);
  const platformTokens = tokenize(platform);
  const rows = [];
  for (const source of sources) {
    for (const sentence of splitSignals(source.text)) {
      const score = scoreSentence(sentence, queryTokens, platformTokens);
      if (score > 0) {
        rows.push({
          text: sentence,
          score,
          source: source.url || source.title || "fuente pegada",
          angle: classifyAngle(sentence),
        });
      }
    }
  }
  return rows
    .sort((a, b) => b.score - a.score || b.text.length - a.text.length)
    .slice(0, limit)
    .map((item, index) => ({ id: index + 1, ...item }));
}

function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);
}

function splitSignals(text) {
  return String(text || "")
    .split(/(?<=[.!?])\s+|\n+|•|-/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 30 && line.length <= 320);
}

function scoreSentence(sentence, queryTokens, platformTokens) {
  const tokens = new Set(tokenize(sentence));
  let score = 0;
  for (const token of queryTokens) if (tokens.has(token)) score += 3;
  for (const token of platformTokens) if (tokens.has(token)) score += 2;
  if (/\b(coment|review|opinion|viral|hook|trend|tiktok|short|reel|ugc)\w*/i.test(sentence)) score += 2;
  if (/\b(problema|dolor|miedo|duda|precio|calidad|resultado|energia|foco|sueno|estres)\w*/i.test(sentence)) score += 2;
  if (/\b(nootrop|peptid|creatina|magnesio|keto|longevity|dopamina|cortisol)\w*/i.test(sentence)) score += 2;
  return score;
}

function classifyAngle(sentence) {
  if (/\b(precio|caro|barato|coste|margen)\w*/i.test(sentence)) return "precio";
  if (/\b(confianza|calidad|certificado|legal|coa|seguro)\w*/i.test(sentence)) return "confianza";
  if (/\b(hook|viral|coment|ugc|reel|tiktok|short)\w*/i.test(sentence)) return "creativo";
  if (/\b(problema|dolor|estres|sueno|energia|foco|memoria)\w*/i.test(sentence)) return "dolor";
  return "oportunidad";
}

function summarizeSignals(query, platform, signals) {
  if (!signals.length) return `No se detectaron senales suficientes para "${query}" en ${platform}.`;
  const angles = [...new Set(signals.map((signal) => signal.angle))].join(", ");
  return `${signals.length} senales detectadas para "${query}" en ${platform}. Angulos principales: ${angles}.`;
}

module.exports = { createMetaBrowser, htmlToText, extractSignals };
