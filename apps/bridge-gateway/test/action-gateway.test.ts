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
  operation: "repo_status",
  objective: "Inspect repository status through the Action Bridge.",
  acceptanceChecks: ["Return branch, HEAD and status."],
  constraints: ["No arbitrary shell.", "No deployment."],
  requestedAuthority: 0,
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
  repoStatus: {
    clean: true,
    shortStatus: "## agent/kaizen7-live-bridge",
    collectedAt: "2026-07-28T12:01:00.000Z",
  },
  codexTurn: {
    threadId: "thread-action-001",
    turnId: "turn-action-001",
    commands: [{ command: "git status --short --branch", exitCode: 0 }],
  },
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

  it("queues a Work Chat repo_status request without requiring GPT to build a signed mission", async () => {
    const { fetch } = gateway();
    const queued = await fetch(jsonRequest("/v1/repo-status", "POST", {
      idempotencyKey: "work-chat-turn-001",
      requestedBy: "luciano",
      correlationId: "work-thread-001",
    }));

    assert.equal(queued.status, 202);
    const queuedBody = await queued.json();
    assert.equal(queuedBody.ok, true);
    assert.equal(queuedBody.duplicate, false);
    assert.match(queuedBody.missionId, /^repo-status-/);
    assert.equal(queuedBody.missionPath, `/v1/missions/${queuedBody.missionId}`);
    assert.equal(queuedBody.receiptPath, `/v1/receipts/${queuedBody.missionId}`);

    const queuedStatus = await fetch(jsonRequest(queuedBody.missionPath));
    const queuedStatusBody = await queuedStatus.json();
    assert.equal(queuedStatus.status, 200);
    assert.equal(queuedStatusBody.state, "queued");
    assert.equal(queuedStatusBody.hasReceipt, false);

    const claimed = await fetch(jsonRequest("/v1/agent/missions/next?deviceId=mini-pc-001", "GET", undefined, agentToken));
    const claimedBody = await claimed.json();
    assert.equal(claimed.status, 200);
    assert.equal(claimedBody.mission.missionId, queuedBody.missionId);
    assert.equal(claimedBody.mission.operation, "repo_status");
    assert.equal(claimedBody.mission.requestedAuthority, 0);
    assert.equal(claimedBody.mission.requestedBy.login, "luciano");
    assert.equal(claimedBody.mission.correlationId, "work-thread-001");

    const claimedStatus = await fetch(jsonRequest(queuedBody.missionPath));
    const claimedStatusBody = await claimedStatus.json();
    assert.equal(claimedStatusBody.state, "claimed");
    assert.equal(typeof claimedStatusBody.claimedAt, "string");
  });

  it("keeps repo_status Work Chat requests idempotent", async () => {
    const { fetch } = gateway();
    const first = await fetch(jsonRequest("/v1/repo-status", "POST", { idempotencyKey: "work-chat-turn-002" }));
    const duplicate = await fetch(jsonRequest("/v1/repo-status", "POST", {
      idempotencyKey: "work-chat-turn-002",
      objective: "Ignored duplicate objective",
    }));

    const firstBody = await first.json();
    const duplicateBody = await duplicate.json();

    assert.equal(first.status, 202);
    assert.equal(duplicate.status, 200);
    assert.equal(duplicateBody.duplicate, true);
    assert.equal(duplicateBody.missionId, firstBody.missionId);
  });

  it("rejects malformed repo_status Work Chat requests", async () => {
    const { fetch } = gateway();
    const missingKey = await fetch(jsonRequest("/v1/repo-status", "POST", {}));
    const badRepository = await fetch(jsonRequest("/v1/repo-status", "POST", {
      idempotencyKey: "work-chat-turn-003",
      repository: "unknown-repo",
    }));

    assert.equal(missingKey.status, 400);
    assert.equal(badRepository.status, 400);
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

    const renewed = await fetch(jsonRequest("/v1/agent/missions/mission-action-001/lease", "POST", { deviceId: "mini-pc-001" }, agentToken));
    assert.equal(renewed.status, 200);
    assert.equal((await renewed.json()).ok, true);

    const stored = await fetch(jsonRequest("/v1/agent/receipts", "POST", { receipt }, agentToken));
    assert.equal(stored.status, 200);

    const fetched = await fetch(jsonRequest("/v1/receipts/mission-action-001"));
    assert.equal(fetched.status, 200);
    assert.equal((await fetched.json()).receipt.status, "completed");

    const status = await fetch(jsonRequest("/v1/missions/mission-action-001"));
    const statusBody = await status.json();
    assert.equal(status.status, 200);
    assert.equal(statusBody.state, "completed");
    assert.equal(statusBody.hasReceipt, true);
    assert.equal(statusBody.nextAction, "Read receiptPath.");
  });

  it("returns 404 for unknown public mission status checks", async () => {
    const { fetch } = gateway();
    const response = await fetch(jsonRequest("/v1/missions/missing-mission"));

    assert.equal(response.status, 404);
    assert.equal((await response.json()).error, "mission_not_found");
  });

  it("does not let a different device renew a claimed mission lease", async () => {
    const { fetch } = gateway();
    await fetch(jsonRequest("/v1/missions", "POST", { mission }));
    await fetch(jsonRequest("/v1/agent/missions/next?deviceId=mini-pc-001", "GET", undefined, agentToken));

    const renewed = await fetch(jsonRequest("/v1/agent/missions/mission-action-001/lease", "POST", { deviceId: "other-device" }, agentToken));

    assert.equal(renewed.status, 409);
  });
});
