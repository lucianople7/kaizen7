import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { onRequestPost } from "../functions/api/waitlist.js";
import { onRequestGet as onMcpGet, onRequestPost as onMcpPost } from "../functions/mcp.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const html = fs.readFileSync(path.join(publicDir, "index.html"), "utf8");
const css = fs.readFileSync(path.join(publicDir, "styles.css"), "utf8");
const ids = [...html.matchAll(/id="([^"]+)"/g)].map((match) => match[1]);
assert.equal(ids.length, new Set(ids).size, "HTML IDs must be unique");
for (const id of ["main", "top", "architect", "research", "neurocity", "video", "verticales", "platform", "ai-layer", "seleccion", "metodo", "acceso", "waitlistForm", "formStatus"]) {
  assert(ids.includes(id), `Missing required ID: ${id}`);
}
for (const file of ["assets/focux-research-hero.png", "assets/neurocity-key-art-v1.png", "assets/the-focux-logo.png", "assets/architect-neurocity.png", "assets/architect-neurocity-v2.png", "assets/architect-editorial-comic-v1.png", "privacidad.html", "terminos.html", "robots.txt", "sitemap.xml", "llms.txt", "ai-index.json", ".well-known/mcp.json"]) {
  assert(fs.existsSync(path.join(publicDir, file)), `Missing public asset: ${file}`);
}
assert(html.includes('type="email"'));
assert(html.includes('name="consent"'));
assert(html.includes('rel="mcp-server"'));
assert(html.includes('href="/llms.txt"'));
assert(html.includes('id="ai-layer"'));
assert(html.includes('id="aiDock"'));
assert(html.includes('id="heroAiButton"'));
assert(html.includes('visual-ledger'));
assert(html.includes('hero-logo-mark'));
assert(html.includes('hero-architect'));
assert(html.includes('launch-rail'));
assert(html.includes('architect-section'));
assert(html.includes('architect-editorial-comic-v1.png'));
assert(html.includes('architect-portrait-editorial'));
assert(html.includes('hierarchy-stack'));
assert(css.includes("@media (max-width: 620px)"));
assert(css.includes("prefers-reduced-motion"));
assert(css.includes(".ai-layer"));
assert(css.includes(".ai-dock"));
assert(css.includes(".visual-ledger"));
assert(css.includes(".hero-architect"));
assert(css.includes(".launch-rail"));
assert(css.includes(".architect-section"));
assert(css.includes("@keyframes architectPresence"));
assert(css.includes("@keyframes heroDrift"));
assert(css.includes("@keyframes neuroPan"));
assert(fs.readFileSync(path.join(publicDir, "app.js"), "utf8").includes("pointermove"));

const invalid = await onRequestPost({
  request: new Request("https://thefocux.com/api/waitlist", { method: "POST", body: JSON.stringify({ email: "bad" }) }),
  env: {},
});
assert.equal(invalid.status, 400);

let inserted = false;
const DB = {
  prepare(sql) {
    return {
      bind(...values) {
        return {
          first: async () => null,
          run: async () => { inserted = sql.startsWith("INSERT") && values[0] === "test@example.com"; },
        };
      },
    };
  },
};
const valid = await onRequestPost({
  request: new Request("https://thefocux.com/api/waitlist", {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "test@example.com", name: "Test", consent: true }),
  }),
  env: { DB },
});
assert.equal(valid.status, 201);
assert(inserted);

const mcpInfo = await onMcpGet();
assert.equal(mcpInfo.status, 200);
const mcpInfoJson = await mcpInfo.json();
assert.equal(mcpInfoJson.auth, "none-public-read-only");

const mcpTools = await onMcpPost({
  request: new Request("https://thefocux.com/mcp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
  }),
});
assert.equal(mcpTools.status, 200);
const mcpToolsJson = await mcpTools.json();
assert(mcpToolsJson.result.tools.some((tool) => tool.name === "get_ai_index"));
console.log("THE FOCUX site, assets, waitlist and MCP tests passed");
