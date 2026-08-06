import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pollActionBridgeOnce } from "../../local-bridge/src/action-consumer.ts";
import { BRIDGE_PROTOCOL_VERSION } from "../../../packages/bridge-protocol/src/index.ts";
import { createActionBridgeHandler } from "../src/action-gateway.ts";
import { InMemoryActionBridgeStore } from "../src/mission-store.ts";

const actionToken = "test-action-token";
const agentToken = "test-agent-token";

const mission = {
  protocol: BRIDGE_PROTOCOL_VERSION,
  missionId: "mission-e2e-001",
  operation: "repo_status",
  idempotencyKey: "idem-e2e-001",
  createdAt: "2026-07-28T13:00:00.000Z",
  expiresAt: "2026-07-28T13:30:00.000Z",
  requestedBy: { login: "lucianople7" },
  targetDeviceId: "mini-pc-001",
  repository: "kaizen7",
  objective: "Return repository branch, HEAD and status.",
  acceptanceChecks: ["Receipt can be queried through the public action endpoint."],
  constraints: ["Read-only repository inspection."],
  requestedAuthority: 0,
  correlationId: "chat-action-e2e-001",
  signature: "",
};

describe("KAIZEN7 Action Bridge local E2E", () => {
  it("queues a GPT Action mission, consumes it outbound and returns a public receipt", async () => {
    const handler = createActionBridgeHandler(new InMemoryActionBridgeStore(), {
      actionBearerToken: actionToken,
      resolveAgentCredential: (presented) =>
        presented === agentToken
          ? { ok: true, principal: { deviceId: "mini-pc-001", credentialId: "test-agent-credential" } }
          : { ok: false },
      bridgeVersion: "0.0.0-test",
    });

    const fetcher = (input: RequestInfo | URL, init?: RequestInit) => handler(new Request(input, init));
    const submitted = await fetcher("https://bridge.test/v1/missions", {
      method: "POST",
      headers: {
        authorization: `Bearer ${actionToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ mission }),
    });
    assert.equal(submitted.status, 202);

    const consumed = await pollActionBridgeOnce({
      baseUrl: "https://bridge.test",
      agentToken,
      deviceId: "mini-pc-001",
      fetch: fetcher,
      clock: () => new Date("2026-07-28T13:01:00.000Z"),
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
          startedAt: "2026-07-28T13:01:00.000Z",
          endedAt: "2026-07-28T13:01:01.000Z",
          repoStatus: {
            clean: true,
            shortStatus: "## agent/kaizen7-live-bridge",
            collectedAt: "2026-07-28T13:01:01.000Z",
          },
          codexTurn: {
            threadId: "thread-e2e-001",
            turnId: "turn-e2e-001",
            commands: [{ command: "git status --short --branch", exitCode: 0, stdout: "## agent/kaizen7-live-bridge" }],
          },
          nextAction: "repo_status receipt stored",
        }),
      },
    });
    assert.equal(consumed.status, "completed");

    const receipt = await fetcher("https://bridge.test/v1/receipts/mission-e2e-001", {
      headers: { authorization: `Bearer ${actionToken}` },
    });
    assert.equal(receipt.status, 200);
    const payload = await receipt.json() as any;
    assert.equal(payload.receipt.missionId, "mission-e2e-001");
    assert.equal(payload.receipt.repoStatus.clean, true);
    assert.equal(payload.receipt.codexTurn.threadId, "thread-e2e-001");
  });
});
