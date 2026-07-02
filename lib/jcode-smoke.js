const { buildJcodeAdapterPlan, formatJcodeAdapterPlan } = require("./jcode-adapter");

function buildJcodeSmoke(options = {}) {
  return {
    ...buildJcodeAdapterPlan(options),
    mode: "jcode-smoke",
    status: "needs_provider",
    smoke: {
      command: "jcode --version",
      expected: "local jcode CLI responds before real execution",
    },
  };
}

if (require.main === module) process.stdout.write(`${formatJcodeAdapterPlan(buildJcodeSmoke({ goal: process.argv.slice(2).join(" ") }))}\n`);

module.exports = { buildJcodeSmoke };
