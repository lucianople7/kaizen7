/**
 * KAIZEN7 Task Loop
 * Bucle inteligente de ejecución de tareas.
 *
 * No pregunta. No duda. Revisa, corrige, mejora, hasta que lo consigue.
 * Minimiza tokens. Maximiza eficacia. Se detiene solo cuando está terminado.
 *
 * Principio KAIZEN7: No hay errores. Solo iteraciones.
 *
 * Este motor es generico a proposito: recibe executor/verifier como
 * parametros. No hace nada por si solo -- si el executor que le pasas no
 * llama a algo real, el "aprendizaje" que registra es ficticio.
 */

const { MasterToolSkill } = require("./master-tool-skill");

const MAX_ITERATIONS = 5;
const MIN_CONFIDENCE = 0.8;

async function runTask(taskDefinition) {
  const {
    goal,
    executor,
    verifier,
    maxIterations = MAX_ITERATIONS,
    minConfidence = MIN_CONFIDENCE,
  } = taskDefinition;

  console.log(`KAIZEN7 Task Loop iniciado: ${goal}`);
  console.log(`Maximo ${maxIterations} iteraciones`);

  const history = [];
  let iteration = 0;
  let lastResult = null;

  while (iteration < maxIterations) {
    iteration++;
    console.log(`\nIteracion ${iteration}/${maxIterations}`);

    const context = buildMinimalContext(goal, history);

    const start = Date.now();
    const result = await executor(context, lastResult);
    const durationMs = Date.now() - start;

    const verification = verifier(result, goal);

    const iterationResult = {
      iteration,
      result,
      verification,
      durationMs,
      tokens: result.tokens || 0,
    };

    history.push(iterationResult);
    lastResult = result;

    console.log(`Ejecutado en ${durationMs}ms, ${result.tokens || 0} tokens`);
    console.log(`Verificacion: ${Math.round(verification.confidence * 100)}%`);

    if (verification.confidence >= minConfidence) {
      console.log(`\nTarea completada en ${iteration} iteraciones`);
      learnFromSuccess(taskDefinition, history);
      return { success: true, result, iterations: iteration, history };
    }

    if (verification.hardFail) {
      console.log("Fallo irreversible. No seguir intentando.");
      break;
    }

    if (iteration === maxIterations) {
      console.log("Maximo de iteraciones alcanzado. Tarea no completada.");
      break;
    }

    console.log(`Corrigiendo: ${verification.correction}`);
  }

  learnFromFailure(taskDefinition, history);

  return {
    success: false,
    result: lastResult,
    iterations: iteration,
    history,
  };
}

function buildMinimalContext(goal, history) {
  const context = {
    goal,
    iteration: history.length + 1,
  };
  if (history.length > 0) {
    context.lastResult = history[history.length - 1].result;
    context.lastVerification = history[history.length - 1].verification;
  }
  return context;
}

function learnFromSuccess(taskDefinition, history) {
  const skill = new MasterToolSkill(taskDefinition.id || "generic-task");
  skill.recordExecution(
    { maxIterations: taskDefinition.maxIterations },
    {
      success: true,
      durationMs: history.reduce((a, b) => a + b.durationMs, 0),
      tokens: history.reduce((a, b) => a + b.tokens, 0),
      iterations: history.length,
    },
  );
  console.log(`Guardado aprendizaje: tarea completada en ${history.length} iteraciones`);
}

function learnFromFailure(taskDefinition, history) {
  const skill = new MasterToolSkill(taskDefinition.id || "generic-task");
  skill.recordExecution(
    { maxIterations: taskDefinition.maxIterations },
    {
      success: false,
      durationMs: history.reduce((a, b) => a + b.durationMs, 0),
      tokens: history.reduce((a, b) => a + b.tokens, 0),
      iterations: history.length,
      error: "max_iterations_reached",
    },
  );
  console.log(`Guardado aprendizaje: tarea fallo despues de ${history.length} iteraciones`);
}

function genericVerifier(result) {
  if (!result) {
    return { confidence: 0, hardFail: true, correction: "Resultado vacio" };
  }
  return { confidence: 0.9, correction: null };
}

module.exports = {
  runTask,
  genericVerifier,
};
