import { env } from "cloudflare:workers";
import { abortAllDurableObjects, reset } from "cloudflare:test";
import { afterEach, describe, expect, it } from "vitest";
import { BRIDGE_PROTOCOL_VERSION } from "../../../packages/bridge-protocol/src/index.ts";
import worker from "../src/index.ts";

const actionToken = "runtime-action-token";
const agentToken = "runtime-agent-token";

afterEach(async () => {
  await reset();
});

function mission(overrides: Record<string, unknown> = {}) {
  return {
    protocol: BRIDGE_PROTOCOL_VERSION,
    missionId: "mission-runtime-001",
    operation: "repo_status",
    requestedOperation: { kind: "repo.status", repository: "kaizen7" },
    idempotencyKey: "idem-runtime-001",
    createdAt: "2026-08-06T10:00:00.000Z",
    expiresAt: "2026-08-06T10:30:00.000Z",
    requestedBy: { login: "lucianople7" },
    targetDeviceId: "mini-pc-001",
    repository: "kaizen7",
    objective: "Return repository status.",
    acceptanceChecks: ["Return branch, HEAD and clean/dirty status."],
    constraints: ["Read-only.", "No shell."],
    requestedAuthority: 0,
    correlationId: "runtime-test-001",
    signature: "",
    ...overrides,
  };
}

function receipt(missionId: string, deviceId: string, overrides: Record<string, unknown> = {}) {
  return {
    protocol: BRIDGE_PROTOCOL_VERSION,
    missionId,
    deviceId,
    status: "completed",
    repository: "kaizen7",
    verifications: [{ command: "git status --short --branch", exitCode: 0 }],
    approvalsConsumed: [],
    startedAt: "2026-08-06T10:01:00.000Z",
    endedAt: "2026-08-06T10:01:01.000Z",
    nextAction: "Review receipt.",
    ...overrides,
  };
}

async function request(path: string, init: RequestInit = {}) {
  return worker.fetch(new Request(`https://bridge.test${path}`, init), {
    ACTION_BRIDGE_TOKEN: actionToken,
    ACTION_AGENT_TOKEN: agentToken,
    ACTION_DEFAULT_DEVICE_ID: "mini-pc-001",
    ACTION_INSTALLATION_KEY: "luciano",
    ACTION_WORKSPACE_KEY: "kaizen7",
    MISSION_STORE: env.MISSION_STORE,
  });
}

function actionHeaders() {
  return {
    authorization: `Bearer ${actionToken}`,
    "content-type": "application/json",
  };
}

function agentHeaders(token = agentToken) {
  return {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
  };
}

describe("Action Bridge Durable Object Workers runtime", () => {
  it("keeps installation/workspace mailboxes isolated in SQLite Durable Objects", async () => {
    const first = env.MISSION_STORE.get(env.MISSION_STORE.idFromName("luciano:kaizen7"));
    const second = env.MISSION_STORE.get(env.MISSION_STORE.idFromName("luciano:flowmatik"));

    await first.fetch("https://mission-store.local/missions", {
      method: "POST",
      body: JSON.stringify({ mission: mission({ missionId: "mission-a", idempotencyKey: "idem-a" }) }),
    });

    const firstSummary = await (await first.fetch("https://mission-store.local/summary")).json() as { queued: number };
    const secondSummary = await (await second.fetch("https://mission-store.local/summary")).json() as { queued: number };

    expect(firstSummary.queued).toBe(1);
    expect(secondSummary.queued).toBe(0);
  });

  it("preserves duplicate missions, claims, receipts and lease checks across eviction", async () => {
    const submitted = await request("/v1/missions", {
      method: "POST",
      headers: actionHeaders(),
      body: JSON.stringify({ mission: mission() }),
    });
    const duplicate = await request("/v1/missions", {
      method: "POST",
      headers: actionHeaders(),
      body: JSON.stringify({ mission: mission({ missionId: "mission-ignored" }) }),
    });
    expect(submitted.status).toBe(202);
    expect(duplicate.status).toBe(200);
    expect((await duplicate.json() as { missionId: string }).missionId).toBe("mission-runtime-001");

    const claimed = await request("/v1/agent/missions/next", { headers: agentHeaders() });
    const claimBody = await claimed.json() as { mission: { missionId: string } | null; lease: { leaseId: string } | null };
    expect(claimBody.mission?.missionId).toBe("mission-runtime-001");
    expect(claimBody.lease?.leaseId).toEqual(expect.any(String));

    const duplicateClaim = await request("/v1/agent/missions/next", { headers: agentHeaders() });
    expect((await duplicateClaim.json() as { mission: unknown }).mission).toBeNull();

    const wrongLease = await request("/v1/agent/receipts", {
      method: "POST",
      headers: agentHeaders(),
      body: JSON.stringify({
        leaseId: "wrong-lease",
        receipt: receipt("mission-runtime-001", "mini-pc-001", {
          startedAt: "2026-08-06T00:00:00.000Z",
          endedAt: "2026-08-06T00:00:01.000Z",
        }),
      }),
    });
    expect(wrongLease.status).toBe(403);

    const beforeRunning = await request("/v1/agent/receipts", {
      method: "POST",
      headers: agentHeaders(),
      body: JSON.stringify({
        leaseId: claimBody.lease?.leaseId,
        receipt: receipt("mission-runtime-001", "mini-pc-001", {
          startedAt: "2026-08-06T00:00:00.000Z",
          endedAt: "2026-08-06T00:00:01.000Z",
        }),
      }),
    });
    expect(beforeRunning.status).toBe(403);

    const running = await request("/v1/agent/missions/mission-runtime-001/running", {
      method: "POST",
      headers: agentHeaders(),
      body: JSON.stringify({ leaseId: claimBody.lease?.leaseId }),
    });
    expect(running.status).toBe(200);

    const stored = await request("/v1/agent/receipts", {
      method: "POST",
      headers: agentHeaders(),
      body: JSON.stringify({
        leaseId: claimBody.lease?.leaseId,
        receipt: receipt("mission-runtime-001", "mini-pc-001", {
          startedAt: "2026-08-06T00:00:00.000Z",
          endedAt: "2026-08-06T00:00:01.000Z",
        }),
      }),
    });
    expect(stored.status).toBe(200);

    await abortAllDurableObjects();

    const fetched = await request("/v1/receipts/mission-runtime-001", { headers: actionHeaders() });
    expect(fetched.status).toBe(200);
    expect((await fetched.json() as { receipt: { missionId: string } }).receipt.missionId).toBe("mission-runtime-001");
  });

  it("reclaims expired leases once and blocks unauthenticated mailbox routes", async () => {
    await request("/v1/missions", {
      method: "POST",
      headers: actionHeaders(),
      body: JSON.stringify({ mission: mission({ missionId: "mission-reclaim-runtime", idempotencyKey: "idem-reclaim-runtime" }) }),
    });
    const firstClaim = await request("/v1/agent/missions/next", { headers: agentHeaders() });
    const firstClaimBody = await firstClaim.json() as { lease: { leaseId: string } | null };
    expect(firstClaimBody.lease?.leaseId).toEqual(expect.any(String));

    const stub = env.MISSION_STORE.get(env.MISSION_STORE.idFromName("luciano:kaizen7"));
    const expired = await stub.fetch("https://mission-store.local/leases/expire", {
      method: "POST",
      body: JSON.stringify({ now: "2026-08-06T10:02:05.000Z" }),
    });
    expect((await expired.json() as { expired: number }).expired).toBe(1);

    const secondClaim = await request("/v1/agent/missions/next", { headers: agentHeaders() });
    const secondClaimBody = await secondClaim.json() as { lease: { leaseId: string } | null };
    expect(secondClaimBody.lease?.leaseId).toEqual(expect.any(String));
    expect(secondClaimBody.lease?.leaseId).not.toBe(firstClaimBody.lease?.leaseId);

    for (const [path, init] of [
      ["/v1/missions", { method: "POST", body: JSON.stringify({ mission: mission({ missionId: "unauth" }) }) }],
      ["/v1/agent/missions/next", {}],
      ["/v1/agent/receipts", { method: "POST", body: "{}" }],
    ] as const) {
      const response = await request(path, init);
      expect(response.status).toBe(401);
    }
  });
});
