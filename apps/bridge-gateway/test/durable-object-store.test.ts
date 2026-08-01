import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BRIDGE_PROTOCOL_VERSION } from "../../../packages/bridge-protocol/src/index.ts";
import worker from "../src/index.ts";
import { DurableObjectActionBridgeStore, MissionStoreDurableObject } from "../src/durable-object-store.ts";

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

  it("routes /missions/next before generic mission id lookups", async () => {
    const store = new MissionStoreDurableObject(fakeDurableState());
    await store.fetch(new Request("https://mission-store.local/missions", {
      method: "POST",
      body: JSON.stringify({ mission, now: "2026-07-28T14:00:00.000Z" }),
    }));

    const response = await store.fetch(new Request(
      "https://mission-store.local/missions/next?deviceId=mini-pc-001&now=2026-07-28T14:01:00.000Z",
    ));
    const payload = await response.json() as any;

    assert.equal(response.status, 200);
    assert.equal(payload.mission.missionId, "mission-do-001");
  });
});

function fakeDurableState() {
  const missions = new Map<string, any>();
  const idempotency = new Map<string, string>();
  const receipts = new Map<string, any>();

  return {
    storage: {
      sql: {
        exec(query: string, ...bindings: unknown[]) {
          if (query.startsWith("CREATE TABLE")) return rows([]);
          if (query.startsWith("SELECT mission_id FROM idempotency")) {
            const missionId = idempotency.get(bindings[0] as string);
            return rows(missionId ? [{ mission_id: missionId }] : []);
          }
          if (query.startsWith("INSERT INTO missions")) {
            missions.set(bindings[0] as string, {
              mission_id: bindings[0],
              idempotency_key: bindings[1],
              target_device_id: bindings[2],
              state: "queued",
              mission_json: bindings[3],
              created_at: bindings[4],
            });
            return rows([]);
          }
          if (query.startsWith("INSERT INTO idempotency")) {
            idempotency.set(bindings[0] as string, bindings[1] as string);
            return rows([]);
          }
          if (query.startsWith("SELECT mission_id, mission_json, target_device_id FROM missions WHERE state = 'queued'")) {
            return rows([...missions.values()]
              .filter((row) => row.state === "queued")
              .sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))
              .slice(0, 20));
          }
          if (query.startsWith("UPDATE missions SET state = 'claimed'")) {
            const row = missions.get(bindings[3] as string);
            if (row) {
              row.state = "claimed";
              row.claimed_by = bindings[0];
              row.claimed_at = bindings[1];
              row.lease_expires_at = bindings[2];
            }
            return rows([]);
          }
          if (query.startsWith("SELECT COUNT(*) AS count FROM missions WHERE state = 'queued'")) {
            return rows([{ count: [...missions.values()].filter((row) => row.state === "queued").length }]);
          }
          if (query.startsWith("SELECT COUNT(*) AS count FROM missions WHERE state = 'claimed'")) {
            return rows([{ count: [...missions.values()].filter((row) => row.state === "claimed").length }]);
          }
          if (query.startsWith("SELECT COUNT(*) AS count FROM receipts")) return rows([{ count: receipts.size }]);
          return rows([]);
        },
      },
    },
  };
}

function rows(value: Array<Record<string, unknown>>) {
  return { toArray: () => value };
}
