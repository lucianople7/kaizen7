import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BRIDGE_PROTOCOL_VERSION } from "../../../packages/bridge-protocol/src/index.ts";
import { createBridgeMcpState, handleMcpRequest } from "../src/mcp-server.ts";

const createdAt = "2026-07-28T10:00:00.000Z";
const expiresAt = "2026-07-28T10:30:00.000Z";

const validMission = {
  protocol: BRIDGE_PROTOCOL_VERSION,
  missionId: "mission-live-001",
  idempotencyKey: "idem-live-001",
  createdAt,
  expiresAt,
  requestedBy: { login: "lucianople7" },
  targetDeviceId: "mini-pc-001",
  repository: "kaizen7",
  objective: "Create a local proof receipt.",
  acceptanceChecks: ["Return a typed receipt."],
  constraints: ["No shell.", "No deployment."],
  requestedAuthority: 1,
  correlationId: "chat-bridge-001",
  signature: "",
};

function callTool(name: string, args: Record<string, unknown>, state = createBridgeMcpState(() => new Date("2026-07-28T10:01:00.000Z"))) {
  return handleMcpRequest(
    {
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: { name, arguments: args },
    },
    state,
  ) as Record<string, any>;
}

describe("KAIZEN7 local MCP bridge", () => {
  it("initializes and exposes only the approved tools", () => {
    const initialized = handleMcpRequest({ jsonrpc: "2.0", id: 1, method: "initialize" }) as Record<string, any>;
    assert.equal(initialized.result.serverInfo.name, "kaizen7-local-bridge");

    const listed = handleMcpRequest({ jsonrpc: "2.0", id: 2, method: "tools/list" }) as Record<string, any>;
    assert.deepEqual(
      listed.result.tools.map((tool: { name: string }) => tool.name),
      ["bridge_status", "bridge_submit_mission", "bridge_get_receipt"],
    );
  });

  it("returns bridge status without exposing shell authority", () => {
    const response = callTool("bridge_status", {});
    const payload = response.result.structuredContent;
    assert.equal(payload.ok, true);
    assert.equal(payload.protocol, BRIDGE_PROTOCOL_VERSION);
    assert.equal(payload.authority.arbitraryShell, false);
    assert.deepEqual(payload.authority.disabledLevels, [2, 3]);
  });

  it("submits typed missions, stores receipts and preserves idempotency", () => {
    const state = createBridgeMcpState(() => new Date("2026-07-28T10:01:00.000Z"));
    const first = callTool("bridge_submit_mission", { mission: validMission }, state).result.structuredContent;
    const second = callTool("bridge_submit_mission", { mission: { ...validMission, missionId: "mission-live-duplicate" } }, state).result.structuredContent;
    const fetched = callTool("bridge_get_receipt", { missionId: "mission-live-001" }, state).result.structuredContent;

    assert.equal(first.ok, true);
    assert.equal(first.receipt.status, "completed");
    assert.equal(second.receipt.missionId, "mission-live-001");
    assert.deepEqual(fetched.receipt, first.receipt);
  });

  it("rejects malformed missions and unauthorized actions", () => {
    const malformed = callTool("bridge_submit_mission", { mission: {} }).result.structuredContent;
    const unauthorized = callTool("bridge_submit_mission", {
      mission: {
        ...validMission,
        missionId: "mission-live-unsafe",
        idempotencyKey: "idem-live-unsafe",
        requestedAuthority: 2,
        objective: "Run a shell command.",
      },
    }).result.structuredContent;

    assert.equal(malformed.ok, false);
    assert.match(malformed.errors.join(","), /required_string:createdAt/);
    assert.equal(unauthorized.ok, false);
    assert.match(unauthorized.errors.join(","), /unauthorized:authority_level_disabled/);
  });
});
