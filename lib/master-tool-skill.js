/**
 * KAIZEN7 Master Tool Skill
 * Clase base para todas las skills maestras de herramientas.
 * Cada uso mejora automáticamente el patrón para todo el mundo.
 *
 * Principio Ponytail: Sin magia. Sin entrenamiento. Solo memoria y patrones.
 *
 * IMPORTANTE: esta clase solo registra y analiza ejecuciones reales que le
 * pasa el caller. No simula nada por su cuenta -- si el execute() de una
 * subclase no llama a una herramienta de verdad, la memoria que se junta acá
 * es ficticia. Ver lib/master-skills/ para las subclases reales conectadas
 * a flowmatik-render.js y openclaw-tool.mjs.
 */

const path = require("node:path");
const fs = require("node:fs");

const DATA_DIR = path.join(__dirname, "..", "data", "tool-memory");
const OBSIDIAN_LEARNING_DIR = path.join(__dirname, "..", "Obsidian", "Flowmatik", "Kaizen7", "Tool Learning");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

class MasterToolSkill {
  constructor(toolName, defaultParams = {}) {
    this.toolName = toolName;
    this.defaultParams = defaultParams;
    this.memoryPath = path.join(DATA_DIR, `${toolName}.json`);
    this.memory = this.loadMemory();
  }

  loadMemory() {
    try {
      if (fs.existsSync(this.memoryPath)) {
        return JSON.parse(fs.readFileSync(this.memoryPath, "utf8"));
      }
    } catch (e) {
      // fall through to fresh memory
    }

    return {
      tool: this.toolName,
      createdAt: new Date().toISOString(),
      executions: [],
      patterns: {},
      antiPatterns: {},
      optimalParams: { ...this.defaultParams },
      totalExecutions: 0,
      successRate: 0,
    };
  }

  saveMemory() {
    fs.writeFileSync(this.memoryPath, JSON.stringify(this.memory, null, 2));
  }

  getOptimalParams(override = {}) {
    return {
      ...this.memory.optimalParams,
      ...override,
    };
  }

  recordExecution(params, result) {
    const execution = {
      timestamp: new Date().toISOString(),
      params,
      success: result.success,
      durationMs: result.durationMs || 0,
      tokens: result.tokens || 0,
      error: result.error || null,
    };

    this.memory.executions.push(execution);
    this.memory.totalExecutions++;

    const successCount = this.memory.executions.filter((e) => e.success).length;
    this.memory.successRate = successCount / this.memory.executions.length;

    if (result.success) {
      for (const [key, value] of Object.entries(params)) {
        if (!this.memory.patterns[key]) this.memory.patterns[key] = {};
        const valueKey = String(value);
        this.memory.patterns[key][valueKey] = (this.memory.patterns[key][valueKey] || 0) + 1;
      }
      this.updateOptimalParams();
    }

    if (!result.success && result.error) {
      for (const [key, value] of Object.entries(params)) {
        if (!this.memory.antiPatterns[key]) this.memory.antiPatterns[key] = {};
        const valueKey = String(value);
        this.memory.antiPatterns[key][valueKey] = (this.memory.antiPatterns[key][valueKey] || 0) + 1;
      }
    }

    this.saveMemory();
    return execution;
  }

  updateOptimalParams() {
    const successExecutions = this.memory.executions.filter((e) => e.success);
    if (successExecutions.length < 5) return;

    for (const [key, values] of Object.entries(this.memory.patterns)) {
      const sorted = Object.entries(values).sort((a, b) => b[1] - a[1]);
      if (sorted[0] && sorted[0][1] >= 3) {
        let newValue;
        try {
          newValue = JSON.parse(sorted[0][0]);
        } catch {
          newValue = sorted[0][0];
        }
        const oldValue = this.memory.optimalParams[key];
        if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
          this.memory.optimalParams[key] = newValue;
          // Reparte el aprendizaje real fuera del JSON aislado: una nota en
          // Obsidian que vos y cualquier otro agente pueden leer, no solo
          // datos encerrados en data/tool-memory/.
          this.writebackToObsidian(key, oldValue, newValue, sorted[0][1]);
        }
      }
    }
  }

  /**
   * Escribe una nota real en el vault de Obsidian cuando un parametro optimo
   * cambia de verdad (no en cada ejecucion). Append-only, un archivo por
   * herramienta, legible por vos y por search_obsidian_vault.
   */
  writebackToObsidian(key, oldValue, newValue, timesConfirmed) {
    try {
      fs.mkdirSync(OBSIDIAN_LEARNING_DIR, { recursive: true });
      const notePath = path.join(OBSIDIAN_LEARNING_DIR, `${this.toolName}.md`);
      const header = fs.existsSync(notePath)
        ? ""
        : `# Tool Learning: ${this.toolName}\n\nAprendizaje real generado por MasterToolSkill (data/tool-memory/${this.toolName}.json). No editado a mano.\n\n`;
      const entry = `## ${new Date().toISOString()}\n- Parametro: \`${key}\`\n- Antes: \`${JSON.stringify(oldValue)}\`\n- Ahora: \`${JSON.stringify(newValue)}\` (confirmado ${timesConfirmed} veces con exito)\n\n`;
      fs.appendFileSync(notePath, header + entry);
    } catch (e) {
      // El writeback a Obsidian nunca debe romper el aprendizaje real en si.
      console.error(`No se pudo escribir en Obsidian para ${this.toolName}:`, e.message);
    }
  }

  getWarnings(params) {
    const warnings = [];
    for (const [key, value] of Object.entries(params)) {
      const antiPatterns = this.memory.antiPatterns[key];
      const valueKey = String(value);
      if (antiPatterns && antiPatterns[valueKey] >= 2) {
        warnings.push(`ADVERTENCIA: ${key}=${value} ha fallado ${antiPatterns[valueKey]} veces anteriormente.`);
      }
    }
    return warnings;
  }

  getSummary() {
    return {
      tool: this.toolName,
      totalExecutions: this.memory.totalExecutions,
      successRate: Math.round(this.memory.successRate * 100) + "%",
      optimalParams: this.memory.optimalParams,
      knownAntiPatterns: Object.keys(this.memory.antiPatterns).length,
    };
  }

  async execute(_params) {
    throw new Error("Implementar execute() en una subclase conectada a una herramienta real");
  }
}

module.exports = { MasterToolSkill };
