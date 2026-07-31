import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BRIDGE_PROTOCOL_VERSION } from "../../../packages/bridge-protocol/src/index.ts";
import worker from "../src/index.ts";
import { DurableObjectActionBridgeStore } from "../src/durable-object-store.ts";

const mission = {
  protocol: BRIDGE_PROTOCOL_VERSION,
  missionId: "mission-do-001",
  operation: "repo_status",
  idempotencyKey: "idem-do-001",
  createdAt: "2026-07-28T14:00:00.000Z",
  expiresAt: "2026-07-28T14:30:00.000Z",
  requestedBy: { login: "lucianople7" },
  targetDeviceId: "mini-pc-001",
  repository: "kaizen7",
  objective: "Inspect repository status.",
  acceptanceChecks: ["Return branch, HEAD and status."],
  constraints: ["No arbitrary shell."],
  requestedAuthority: 0,
  correlationId: "chat-do-001",
  signature: "signed-envelope",
};

function json(value: unknown, status = 200): Response {
  return Response.json(value, { status });
}

describe("Durable Object Action Bridge store", () => {
  it("routes store calls through a single Durable Object stub", async () => {
    const calls: Array<{ path: string; method: string; body?: unknown }> = [];
    const store = new DurableObjectActionBridgeStore({
      idFromName(name: string) {
        assert.equal(name, "kaizen7-action-bridge");
        return "durable-id";
      },
      get(id: unknown) {
        assert.equal(id, "durable-id");
        return {
          fetch: async (request: Request) => {
            const url = new URL(request.url);
            calls.push({
              path: url.pathname,
              method: request.method,
              body: request.method === "POST" ? await request.json() : undefined,
            });
            if (url.pathname === "/missions") return json({ mission, duplicate: false });
            if (url.pathname === "/missions/mission-do-001") {
              return json({ mission: { mission, state: "claimed", createdAt: "2026-07-28T14:00:00.000Z" } });
            }
            if (url.pathname === "/missions/next") return json({ mission });
            if (url.pathname === "/receipts/mission-do-001") return json({ receipt: null }, 404);
            if (url.pathname === "/summary") return json({ queued: 0, claimed: 1, receipts: 0 });
            return json({ ok: true });
          },
        };
      },
    });

    assert.equal((await store.putMission(mission as any)).duplicate, false);
    assert.equal((await store.getMission("mission-do-001"))?.state, "claimed");
    assert.equal((await store.claimNextMission("mini-pc-001"))?.missionId, "mission-do-001");
    assert.equal(await store.getReceipt("mission-do-001"), undefined);
    assert.deepEqual(await store.summary(), { queued: 0, claimed: 1, receipts: 0 });
    assert.deepEqual(calls.map((call) => call.path), ["/missions", "/missions/mission-do-001", "/missions/next", "/receipts/mission-do-001", "/summary"]);
  });

  it("uses Durable Object storage when the Worker env provides MISSION_STORE", async () => {
    let summaryCalled = false;
    const env = {
      ACTION_BRIDGE_TOKEN: "action-token",
      ACTION_AGENT_TOKEN: "agent-token",
      MISSION_STORE: {
        idFromName: () => "durable-id",
        get: () => ({
          fetch: async (request: Request) => {
            if (new URL(request.url).pathname === "/summary") {
              summaryCalled = true;
              return json({ queued: 7, claimed: 0, receipts: 3 });
            }
            return json({ ok: true });
          },
        }),
      },
    };

    const response = await worker.fetch(new Request("https://bridge.test/v1/status", {
      headers: { authorization: "Bearer action-token" },
    }), env as any);
    const payload = await response.json() as any;

    assert.equal(summaryCalled, true);
    assert.deepEqual(payload.store, { queued: 7, claimed: 0, receipts: 3 });
  });
});
