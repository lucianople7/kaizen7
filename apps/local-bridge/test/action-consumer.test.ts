import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BRIDGE_PROTOCOL_VERSION } from "../../../packages/bridge-protocol/src/index.ts";
import { pollActionBridgeOnce } from "../src/action-consumer.ts";

const mission = {
  protocol: BRIDGE_PROTOCOL_VERSION,
  missionId: "mission-consumer-001",
  operation: "repo_status",
  idempotencyKey: "idem-consumer-001",
  createdAt: "2026-07-28T12:00:00.000Z",
  expiresAt: "2026-07-28T12:30:00.000Z",
  requestedBy: { login: "lucianople7" },
  targetDeviceId: "mini-pc-001",
  repository: "kaizen7",
  objective: "Return repository branch, HEAD and status.",
  acceptanceChecks: ["Return a typed repo_status receipt."],
  constraints: ["Read-only repository inspection."],
  requestedAuthority: 0,
  correlationId: "chat-action-consumer-001",
  signature: "",
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

  it("claims a repo_status mission outbound and posts back the executor receipt", async () => {
    const requests: Array<{ url: string; method: string; authorization: string | null; body?: unknown }> = [];
    const result = await pollActionBridgeOnce({
      baseUrl: "https://bridge.test/",
      agentToken: "agent-token",
      deviceId: "mini-pc-001",
      executor: {
        executeRepoStatus: async (claimedMission) => ({
          protocol: BRIDGE_PROTOCOL_VERSION,
          missionId: claimedMission.missionId,
          deviceId: claimedMission.targetDeviceId,
          status: "completed",
          repository: claimedMission.repository,
          branch: "agent/kaizen7-live-bridge",
          commits: ["abc123"],
          verifications: [{ command: "git status --short --branch", exitCode: 0, stdout: "## agent/kaizen7-live-bridge" }],
          approvalsConsumed: [],
          startedAt: "2026-07-28T12:00:00.000Z",
          endedAt: "2026-07-28T12:00:01.000Z",
          repoStatus: {
            clean: true,
            shortStatus: "## agent/kaizen7-live-bridge",
            collectedAt: "2026-07-28T12:00:01.000Z",
          },
          codexTurn: {
            threadId: "thread_test",
            turnId: "turn_test",
            commands: [{ command: "git status --short --branch", exitCode: 0, stdout: "## agent/kaizen7-live-bridge" }],
          },
          nextAction: "repo_status receipt stored",
        }),
      },
      fetch: async (input, init) => {
        const request = new Request(input, init);
        requests.push({
          url: request.url,
          method: request.method,
          authorization: request.headers.get("authorization"),
          body: request.method === "POST" ? await request.json() : undefined,
        });

        if (request.url.endsWith("/v1/agent/missions/next?deviceId=mini-pc-001")) {
          return Response.json({
            ok: true,
            mission,
            lease: {
              leaseId: "lease-consumer-001",
              missionId: mission.missionId,
              deviceId: "mini-pc-001",
              expiresAt: "2026-07-28T12:01:00.000Z",
            },
          });
        }
        return Response.json({ ok: true });
      },
    });

    assert.equal(result.status, "completed");
    assert.equal(requests.length, 3);
    assert.equal(requests[0].authorization, "Bearer agent-token");
    assert.equal(requests[1].url, "https://bridge.test/v1/agent/missions/mission-consumer-001/running");
    assert.equal((requests[1].body as any).leaseId, "lease-consumer-001");
    assert.equal(requests[2].url, "https://bridge.test/v1/agent/receipts");
    assert.equal((requests[2].body as any).leaseId, "lease-consumer-001");
    assert.equal((requests[2].body as any).receipt.missionId, "mission-consumer-001");
    assert.equal((requests[2].body as any).receipt.repoStatus.clean, true);
    assert.equal((requests[2].body as any).receipt.codexTurn.threadId, "thread_test");
  });

  it("rejects repo_status missions when no executor is configured", async () => {
    const result = await pollActionBridgeOnce({
      baseUrl: "https://bridge.test",
      agentToken: "agent-token",
      deviceId: "mini-pc-001",
      fetch: async () => Response.json({
        ok: true,
        mission,
        lease: {
          leaseId: "lease-consumer-002",
          missionId: mission.missionId,
          deviceId: "mini-pc-001",
          expiresAt: "2026-07-28T12:01:00.000Z",
        },
      }),
    });

    assert.deepEqual(result, { status: "rejected", errors: ["executor_missing:repo_status"] });
  });

  it("includes gateway receipt validation errors when receipt storage is rejected", async () => {
    const result = await pollActionBridgeOnce({
      baseUrl: "https://bridge.test",
      agentToken: "agent-token",
      deviceId: "mini-pc-001",
      executor: {
        executeRepoStatus: async (claimedMission) => ({
          protocol: BRIDGE_PROTOCOL_VERSION,
          missionId: claimedMission.missionId,
          deviceId: claimedMission.targetDeviceId,
          status: "completed",
          repository: claimedMission.repository,
          verifications: [],
          approvalsConsumed: [],
          startedAt: "2026-07-28T12:00:00.000Z",
          endedAt: "2026-07-28T12:00:01.000Z",
          nextAction: "diagnostic",
        }),
      },
      fetch: async (input, init) => {
        const request = new Request(input, init);
        if (request.url.endsWith("/v1/agent/missions/next?deviceId=mini-pc-001")) {
          return Response.json({
            ok: true,
            mission,
            lease: { leaseId: "lease-diagnostic", missionId: mission.missionId, deviceId: "mini-pc-001" },
          });
        }
        if (request.url.endsWith("/running")) return Response.json({ ok: true });
        return Response.json({ ok: false, errors: ["invalid_codexTurn"] }, { status: 400 });
      },
    });

    assert.deepEqual(result, { status: "rejected", errors: ["receipt_store:400", "invalid_codexTurn"] });
  });
});
