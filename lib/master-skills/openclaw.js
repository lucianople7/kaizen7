/**
 * Master Skill: OpenClaw
 * Ejecuta OpenClaw de verdad, invocando su bin script directamente con node
 * (shell:false) en vez de "npx ... shell:true": Node advierte que shell:true
 * solo concatena argv, no lo escapa -- confirmado empiricamente cuando un
 * directive de varias palabras se rompio en "too many arguments".
 *
 * Ponytail: una funcion, un proposito.
 */

const path = require("node:path");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const { MasterToolSkill } = require("../master-tool-skill");

const execFileAsync = promisify(execFile);
const OPENCLAW_PKG_ROOT = path.dirname(path.dirname(require.resolve("openclaw")));
const OPENCLAW_BIN = path.join(OPENCLAW_PKG_ROOT, "openclaw.mjs");

class OpenClawMasterSkill extends MasterToolSkill {
  constructor() {
    super("openclaw", {
      timeoutMs: 60_000,
    });
  }

  async execute(params = {}) {
    const optimal = this.getOptimalParams(params);
    const warnings = this.getWarnings(optimal);
    warnings.forEach((w) => console.log(w));

    if (!params.directive) {
      const result = { success: false, durationMs: 0, error: "directive is required" };
      this.recordExecution(optimal, result);
      return result;
    }

    const start = Date.now();
    let result;

    try {
      const { stdout, stderr } = await execFileAsync(
        process.execPath,
        [OPENCLAW_BIN, "agent", "--message", params.directive],
        { shell: false, timeout: optimal.timeoutMs },
      );
      result = { success: true, durationMs: Date.now() - start, stdout: stdout.trim(), stderr: stderr.trim() };
    } catch (error) {
      result = {
        success: false,
        durationMs: Date.now() - start,
        error: error.message,
        stdout: error.stdout ? String(error.stdout).trim() : "",
        stderr: error.stderr ? String(error.stderr).trim() : "",
      };
    }

    this.recordExecution(optimal, result);
    return result;
  }
}

module.exports = { OpenClawMasterSkill };

if (require.main === module) {
  const directive = process.argv.slice(2).join(" ") || "di hola en una linea";
  const skill = new OpenClawMasterSkill();
  skill.execute({ directive }).then((result) => {
    console.log(JSON.stringify(result, null, 2));
    console.log("\nResumen:", JSON.stringify(skill.getSummary(), null, 2));
  });
}
