import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BRIDGE_PROTOCOL_VERSION } from "../../../packages/bridge-protocol/src/index.ts";
import { pollActionBridgeOnce } from "../src/action-consumer.ts";

const mission = {
  protocol: BRIDGE_PROTOCOL_VERSION,
  missionId: "mission-consumer-001",
  idempotencyKey: "idem-consumer-001",
  createdAt: "2026-07-28T12:00:00.000Z",
  expiresAt: "2026-07-28T12:30:00.000Z",
  requestedBy: { login: "lucianople7" },
  targetDeviceId: "mini-pc-001",
  repository: "kaizen7",
  objective: "Create a local receipt from outbound polling.",
  acceptanceChecks: ["Return a typed receipt."],
  constraints: ["No deployment."],
  requestedAuthority: 1,
  correlationId: "chat-action-consumer-001",
  signature: "signed-envelope",
};

describe("KAIZEN7 Action Bridge outbound consumer", () => {
  it("does nothing when the gateway has no mission", async () => {
    const calls: string[] = [];
    const result = await pollActionBridgeOnce({
      baseUrl: "https://bridge.test",
      agentToken: "agent-token",
      deviceId: "mini-pc-001",
      fetch: async (input) => {
        calls.push(String(input));
        return Response.json({ ok: true, mission: null });
      },
    });

    assert.equal(result.status, "idle");
    assert.equal(calls[0], "https://bridge.test/v1/agent/missions/next?deviceId=mini-pc-001");
  });

  it("claims a mission outbound and posts back a safe local receipt", async () => {
    const requests: Array<{ url: string; method: string; authorization: string | null; body?: unknown }> = [];
    const result = await pollActionBridgeOnce({
      baseUrl: "https://bridge.test/",
      agentToken: "agent-token",
      deviceId: "mini-pc-001",
      fetch: async (input, init) => {
        const request = new Request(input, init);
        requests.push({
          url: request.url,
          method: request.method,
          authorization: request.headers.get("authorization"),
          body: request.method === "POST" ? await request.json() : undefined,
        });

        if (request.url.endsWith("/v1/agent/missions/next?deviceId=mini-pc-001")) {
          return Response.json({ ok: true, mission });
        }
        return Response.json({ ok: true });
      },
    });

    assert.equal(result.status, "completed");
    assert.equal(requests.length, 2);
    assert.equal(requests[0].authorization, "Bearer agent-token");
    assert.equal(requests[1].url, "https://bridge.test/v1/agent/receipts");
    assert.equal((requests[1].body as any).receipt.missionId, "mission-consumer-001");
  });
});
