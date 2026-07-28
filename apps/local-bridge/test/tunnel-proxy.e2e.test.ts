import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import { describe, it } from "node:test";
import { BRIDGE_PROTOCOL_VERSION } from "../../../packages/bridge-protocol/src/index.ts";

const root = path.resolve(import.meta.dirname, "..", "..", "..");
const tunnelClientExe = process.env.TUNNEL_CLIENT_EXE;

const mission = {
  protocol: BRIDGE_PROTOCOL_VERSION,
  missionId: "mission-tunnel-001",
  idempotencyKey: "idem-tunnel-001",
  createdAt: "2026-07-28T10:00:00.000Z",
  expiresAt: "2026-07-28T10:30:00.000Z",
  requestedBy: { login: "lucianople7" },
  targetDeviceId: "mini-pc-001",
  repository: "kaizen7",
  objective: "Create a tunnel proof receipt.",
  acceptanceChecks: ["Return a typed receipt through tunnel-client dev proxy."],
  constraints: ["No arbitrary execution.", "No deployment."],
  requestedAuthority: 1,
  correlationId: "chat-bridge-tunnel-001",
  signature: "signed-envelope",
};

describe("OpenAI tunnel-client local dev proxy", () => {
  it("routes MCP calls to the KAIZEN7 local bridge and returns a typed receipt", { skip: !tunnelClientExe }, async () => {
    assert.ok(tunnelClientExe);

    const child = spawn(
      tunnelClientExe,
      [
        "dev",
        "proxy",
        "--print-json",
        "--duration",
        "40s",
        "--mcp-command",
        "command=node node_modules/tsx/dist/cli.mjs apps/local-bridge/src/index.ts,channel=main",
      ],
      {
        cwd: root,
        env: process.env,
        stdio: ["ignore", "pipe", "pipe"],
      },
    );

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8");
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });

    try {
      const mcpUrl = await waitForMcpUrl(() => stdout);
      await jsonRpc(mcpUrl, { jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
      const listed = await jsonRpc(mcpUrl, { jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
      assert.deepEqual(
        listed.result.tools.map((tool: { name: string }) => tool.name),
        ["bridge_status", "bridge_submit_mission", "bridge_get_receipt"],
      );

      const submitted = await jsonRpc(mcpUrl, {
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: { name: "bridge_submit_mission", arguments: { mission } },
      });
      assert.equal(submitted.result.structuredContent.ok, true);
      assert.equal(submitted.result.structuredContent.receipt.missionId, "mission-tunnel-001");

      const fetched = await jsonRpc(mcpUrl, {
        jsonrpc: "2.0",
        id: 4,
        method: "tools/call",
        params: { name: "bridge_get_receipt", arguments: { missionId: "mission-tunnel-001" } },
      });
      assert.deepEqual(fetched.result.structuredContent.receipt, submitted.result.structuredContent.receipt);
    } finally {
      child.kill();
      await new Promise((resolve) => child.once("exit", resolve));
    }

    assert.doesNotMatch(stdout + stderr, /sk-[A-Za-z0-9_-]+/);
  });
});

async function jsonRpc(url: string, body: Record<string, unknown>): Promise<any> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  assert.equal(response.ok, true, text);
  const eventData = /^data:\s*(.*)$/m.exec(text)?.[1];
  return JSON.parse(eventData ?? text);
}

async function waitForMcpUrl(readStdout: () => string): Promise<string> {
  const started = Date.now();
  while (Date.now() - started < 10000) {
    const found = extractMcpUrl(readStdout());
    if (found) return found;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  throw new Error("Timed out waiting for tunnel-client dev proxy mcp_url");
}

function extractMcpUrl(output: string): string | undefined {
  const match = /"mcp_url":\s*"([^"]+)"/.exec(output);
  return match?.[1];
}
