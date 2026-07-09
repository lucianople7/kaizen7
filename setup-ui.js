function k7SetupEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function k7SetupApi(path) {
  const response = await fetch(path, { headers: { "content-type": "application/json" } });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || `Error ${response.status}`);
  return json;
}

function k7RenderSetupStatus(report) {
  const node = document.querySelector("#setupStatusGrid");
  if (!node) return;
  const runtimeMissing = (report.runtime || []).filter((item) => item.status !== "ready").length;
  const services = (report.services || []).map((service) => `
    <div class="setup-status-item ${k7SetupEscape(service.status)}">
      <span>${k7SetupEscape(service.label)}</span>
      <strong>${k7SetupEscape(service.status)}</strong>
      <small>${k7SetupEscape(service.command)}</small>
    </div>
  `);
  node.innerHTML = [
    `<div class="setup-status-item ${k7SetupEscape(report.status)}"><span>Modo</span><strong>${k7SetupEscape(report.status)}</strong><small>local-only funciona sin API keys</small></div>`,
    `<div class="setup-status-item ${k7SetupEscape(report.readiness?.status)}"><span>Readiness</span><strong>${k7SetupEscape(report.readiness?.status || "unknown")}</strong><small>${k7SetupEscape((report.readiness?.blockers || []).length ? "bloqueos activos" : "sin bloqueos")}</small></div>`,
    `<div class="setup-status-item ${runtimeMissing ? "missing" : "ready"}"><span>Runtime</span><strong>${runtimeMissing ? `${runtimeMissing} missing` : "ready"}</strong><small>npm.cmd run k7:init</small></div>`,
    ...services,
  ].join("");
}

async function k7LoadSetupStatus() {
  const node = document.querySelector("#setupStatusGrid");
  if (!node) return;
  try {
    k7RenderSetupStatus(await k7SetupApi("/api/k7/setup"));
  } catch (error) {
    node.innerHTML = `<div class="setup-status-item missing"><span>Setup</span><strong>Error</strong><small>${k7SetupEscape(error.message)}</small></div>`;
  }
}

k7LoadSetupStatus();
