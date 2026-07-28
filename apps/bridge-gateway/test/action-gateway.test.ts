import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BRIDGE_PROTOCOL_VERSION } from "../../../packages/bridge-protocol/src/index.ts";
import { createActionBridgeHandler } from "../src/action-gateway.ts";
import { InMemoryActionBridgeStore } from "../src/mission-store.ts";

const token = "test-action-token";
const agentToken = "test-agent-token";

const mission = {
  protocol: BRIDGE_PROTOCOL_VERSION,
  missionId: "mission-action-001",
  idempotencyKey: "idem-action-001",
  createdAt: "2026-07-28T12:00:00.000Z",
  expiresAt: "2026-07-28T12:30:00.000Z",
  requestedBy: { login: "lucianople7" },
  targetDeviceId: "mini-pc-001",
  repository: "kaizen7",
  objective: "Create an Action Bridge proof receipt.",
  acceptanceChecks: ["Return a typed receipt."],
  constraints: ["No arbitrary shell.", "No deployment."],
  requestedAuthority: 1,
  correlationId: "chat-action-001",
  signature: "signed-envelope",
};

const receipt = {
  protocol: BRIDGE_PROTOCOL_VERSION,
  missionId: "mission-action-001",
  deviceId: "mini-pc-001",
  status: "completed",
  repository: "kaizen7",
  branch: "agent/kaizen7-live-bridge",
  commits: [],
  verifications: [{ command: "safe-action-adapter", exitCode: 0 }],
  approvalsConsumed: [],
  startedAt: "2026-07-28T12:01:00.000Z",
  endedAt: "2026-07-28T12:01:00.000Z",
  nextAction: "Review receipt.",
};

function gateway() {
  const store = new InMemoryActionBridgeStore();
  const fetch = createActionBridgeHandler(store, {
    actionBearerToken: token,
    agentBearerToken: agentToken,
    bridgeVersion: "0.0.0-test",
  });
  return { fetch, store };
}

function jsonRequest(path: string, method = "GET", body?: unknown, bearer = token): Request {
  return new Request(`https://bridge.test${path}`, {
    method,
    headers: {
      authorization: `Bearer ${bearer}`,
      "content-type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("KAIZEN7 Action Bridge gateway", () => {
  it("requires bearer auth for public GPT Action routes", async () => {
    const { fetch } = gateway();
    assert.equal((await fetch(new Request("https://bridge.test/v1/status"))).status, 401);
    assert.equal((await fetch(jsonRequest("/v1/status"))).status, 200);
  });

  it("accepts typed missions once and preserves idempotency", async () => {
    const { fetch } = gateway();
    const first = await fetch(jsonRequest("/v1/missions", "POST", { mission }));
    const duplicate = await fetch(jsonRequest("/v1/missions", "POST", { mission: { ...mission, missionId: "mission-ignored" } }));

    assert.equal(first.status, 202);
    assert.equal(duplicate.status, 200);
    assert.equal((await first.json()).missionId, "mission-action-001");
    assert.equal((await duplicate.json()).missionId, "mission-action-001");
  });

  it("rejects malformed or unsafe missions", async () => {
    const { fetch } = gateway();
    const malformed = await fetch(jsonRequest("/v1/missions", "POST", { mission: {} }));
    const unsafe = await fetch(jsonRequest("/v1/missions", "POST", {
      mission: { ...mission, missionId: "mission-unsafe", idempotencyKey: "idem-unsafe", requestedAuthority: 2 },
    }));

    assert.equal(malformed.status, 400);
    assert.equal(unsafe.status, 403);
  });

  it("lets the mini-PC claim missions and publish receipts through outbound polling routes", async () => {
    const { fetch } = gateway();
    await fetch(jsonRequest("/v1/missions", "POST", { mission }));

    const claimed = await fetch(jsonRequest("/v1/agent/missions/next?deviceId=mini-pc-001", "GET", undefined, agentToken));
    assert.equal(claimed.status, 200);
    assert.equal((await claimed.json()).mission.missionId, "mission-action-001");

    const stored = await fetch(jsonRequest("/v1/agent/receipts", "POST", { receipt }, agentToken));
    assert.equal(stored.status, 200);

    const fetched = await fetch(jsonRequest("/v1/receipts/mission-action-001"));
    assert.equal(fetched.status, 200);
    assert.equal((await fetched.json()).receipt.status, "completed");
  });
});
