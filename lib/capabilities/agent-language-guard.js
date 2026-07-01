const RUNTIME_LANGUAGE = ["npm.cmd", "PowerShell", "bash", "Windows", "Linux"];

function findRuntimeLanguage(value = {}) {
  const text = JSON.stringify(value);
  return RUNTIME_LANGUAGE.filter((term) => text.includes(term));
}

module.exports = {
  RUNTIME_LANGUAGE,
  findRuntimeLanguage,
};
