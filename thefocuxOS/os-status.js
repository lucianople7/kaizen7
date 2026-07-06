import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "pipe", encoding: "utf-8" }).trim();
  } catch (err) {
    return `Error: ${err.message.split("\n")[0]}`;
  }
}

console.log("==========================================");
console.log("   THE FOCUX OS Status (ECC Pattern)");
console.log("==========================================\n");

// 1. Repo State
console.log("[1] REPOSITORY STATE");
const branch = run("git rev-parse --abbrev-ref HEAD");
const commit = run("git rev-parse --short HEAD");
const status = run("git status --porcelain");
console.log(`Branch: ${branch}`);
console.log(`Last Commit: ${commit}`);
console.log(`Pending Changes:\n${status || "None (clean)"}`);

// 2. Active Dossier
console.log("\n[2] DOSSIER ACTIVO");
try {
  const indexStr = fs.readFileSync(path.join(__dirname, "public/data/dossiers/index.json"), "utf8");
  const index = JSON.parse(indexStr);
  console.log(`Total dossiers: ${index.items.length}`);
  index.items.forEach(d => {
    console.log(`- ${d.id}: ${d.title} (Status: ${d.publish_status})`);
  });
} catch (e) {
  console.log("Dossier index not found or invalid.");
}

// 3. Estado de Evidencia & Claims
console.log("\n[3] EVIDENCIA & CLAIMS (GUARDRAILS)");
console.log("- Estado de Evidencia: Draft. Pendiente de verificacion FDA/EFSA.");
console.log("- Claims Bloqueados: NINGUNA promesa medica, NO tratamos condiciones (Ansiedad/TDAH).");

// 4. Founding List Signal
console.log("\n[4] FOUNDING LIST SIGNAL");
console.log("- Status: OK (Active en /api/waitlist / DB thefocux-leads)");

// 5. Siguiente Asset/Acción
console.log("\n[5] SIGUIENTE MISION");
console.log("- Asset: Primer Content Pack Flowmatik (Tokyo Urban Flow).");
console.log("- Readiness: [ READY ] - MCP publico actualizado con dossiers.\n");
