/**
 * Master Skill: Remotion (Flowmatik render)
 * Conectada de verdad a lib/flowmatik-render.js -- no simula nada.
 *
 * Ponytail: una funcion, un proposito.
 */

const { MasterToolSkill } = require("../master-tool-skill");
const { renderStill, buildFlowmatikRenderPlan } = require("../flowmatik-render");

class RemotionMasterSkill extends MasterToolSkill {
  constructor() {
    super("remotion", {
      composition: "KaizenFirstFlow",
      frame: 210,
    });
  }

  /**
   * Renderiza un still real (mucho mas rapido que un video completo) para
   * verificar que el pipeline (audio + remotion CLI) funciona de punta a
   * punta. Un video completo se pide con { full: true }.
   */
  async execute(params = {}) {
    const optimal = this.getOptimalParams(params);
    const warnings = this.getWarnings(optimal);
    warnings.forEach((w) => console.log(w));

    const start = Date.now();
    let result;

    try {
      if (params.full) {
        const plan = buildFlowmatikRenderPlan(optimal);
        result = { success: true, durationMs: Date.now() - start, plan };
      } else {
        const plan = renderStill(optimal);
        result = { success: true, durationMs: Date.now() - start, plan };
      }
    } catch (error) {
      result = { success: false, durationMs: Date.now() - start, error: error.message };
    }

    this.recordExecution(optimal, result);
    return result;
  }
}

module.exports = { RemotionMasterSkill };

if (require.main === module) {
  const skill = new RemotionMasterSkill();
  skill.execute({}).then((result) => {
    console.log(JSON.stringify(result, null, 2));
    console.log("\nResumen:", JSON.stringify(skill.getSummary(), null, 2));
  });
}
