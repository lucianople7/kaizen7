import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createActionBridgeHandler } from "../src/action-gateway.ts";
import { DurableObjectActionBridgeStore } from "../src/durable-object-store.ts";
import { InMemoryActionBridgeStore } from "../src/mission-store.ts";
import { makeMission, makeReceipt } from "./support/fixtures.ts";

const actionToken = "action-token";

function jsonRequest(path: string, method = "GET", body?: unknown, bearer = actionToken): Request {
  return new Request(`https://bridge.test${path}`, {
    method,
    headers: {
      authorization: `Bearer ${bearer}`,
      "content-type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("Action Bridge device credential binding", () => {
  it("does not authorize device routes through the legacy agentBearerToken fallback", async () => {
    const handler = createActionBridgeHandler(new InMemoryActionBridgeStore(), {
      actionBearerToken: actionToken,
      agentBearerToken: "legacy-agent-token",
      defaultTargetDeviceId: "device-a",
      bridgeVersion: "test",
    } as any);

    const response = await handler(jsonRequest("/v1/agent/missions/next", "GET", undefined, "legacy-agent-token"));

    assert.equal(response.status, 401);
  });

  it("agent token cannot post a receipt for a mission leased by another device", async () => {
    const store = new InMemoryActionBridgeStore();
    const handler = createActionBridgeHandler(store, {
      actionBearerToken: actionToken,
      resolveAgentCredential: (presented) =>
        presented === "agent-token-a"
          ? { ok: true, principal: { deviceId: "device-a", credentialId: "cred-a" } }
          : presented === "agent-token-b"
            ? { ok: true, principal: { deviceId: "device-b", credentialId: "cred-b" } }
            : { ok: false },
      bridgeVersion: "test",
    });

    await handler(jsonRequest("/v1/missions", "POST", {
      mission: makeMission({
        missionId: "mission-device-a",
        idempotencyKey: "idem-device-a",
        targetDeviceId: "device-a",
      }),
    }));
    const claimed = await handler(jsonRequest("/v1/agent/missions/next", "GET", undefined, "agent-token-a"));
    const claimBody = await claimed.json() as any;

    const response = await handler(jsonRequest("/v1/agent/receipts", "POST", {
      receipt: makeReceipt({
        missionId: "mission-device-a",
        deviceId: "device-b",
      }),
      leaseId: claimBody.lease.leaseId,
    }, "agent-token-b"));

    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), { ok: false, error: "lease_device_mismatch" });
  });

  it("does not authorize device routes through raw bearer-token maps or legacy fallback", async () => {
    const handler = createActionBridgeHandler(new InMemoryActionBridgeStore(), {
      actionBearerToken: actionToken,
      bridgeVersion: "test",
    });

    const response = await handler(jsonRequest("/v1/agent/missions/next", "GET", undefined, "agent-token-a"));

    assert.equal(response.status, 401);
  });

  it("routes Durable Object mailboxes by explicit installation/workspace key", async () => {
    const names: string[] = [];
    const namespace = {
      idFromName(name: string) {
        names.push(name);
        return name;
      },
      get(id: unknown) {
        return {
          fetch: async () => Response.json({ queued: 0, claimed: 0, receipts: 0, id }),
        };
      },
    };

    await new DurableObjectActionBridgeStore(namespace, { installationKey: "luciano", workspaceKey: "kaizen7" }).summary();
    await new DurableObjectActionBridgeStore(namespace, { installationKey: "luciano", workspaceKey: "flowmatik" }).summary();

    assert.deepEqual(names, ["luciano:kaizen7", "luciano:flowmatik"]);
  });

  it("requires explicit Durable Object installation/workspace keys", async () => {
    const namespace = {
      idFromName() {
        throw new Error("should_not_route_global_mailbox");
      },
      get() {
        throw new Error("should_not_get_global_mailbox");
      },
    };

    await assert.rejects(
      () => new DurableObjectActionBridgeStore(namespace).summary(),
      /installation_workspace_required/,
    );
  });

  it("requires an explicit lease envelope and running transition before accepting receipts", async () => {
    const store = new InMemoryActionBridgeStore();
    const handler = createActionBridgeHandler(store, {
      actionBearerToken: actionToken,
      resolveAgentCredential: (presented) =>
        presented === "agent-token-a"
          ? { ok: true, principal: { deviceId: "device-a", credentialId: "cred-a" } }
          : { ok: false },
      bridgeVersion: "test",
    });

    await handler(jsonRequest("/v1/missions", "POST", {
      mission: makeMission({
        missionId: "mission-explicit-running",
        idempotencyKey: "idem-explicit-running",
        targetDeviceId: "device-a",
      }),
    }));
    const claimed = await handler(jsonRequest("/v1/agent/missions/next", "GET", undefined, "agent-token-a"));
    const claimBody = await claimed.json() as any;

    const missingLease = await handler(jsonRequest("/v1/agent/receipts", "POST", {
      receipt: makeReceipt({ missionId: "mission-explicit-running", deviceId: "device-a" }),
    }, "agent-token-a"));
    assert.equal(missingLease.status, 403);
    assert.deepEqual(await missingLease.json(), { ok: false, error: "lease_required" });

    const beforeRunning = await handler(jsonRequest("/v1/agent/receipts", "POST", {
      leaseId: claimBody.lease.leaseId,
      receipt: makeReceipt({ missionId: "mission-explicit-running", deviceId: "device-a" }),
    }, "agent-token-a"));
    assert.equal(beforeRunning.status, 403);
    assert.deepEqual(await beforeRunning.json(), { ok: false, error: "mission_not_running" });

    const running = await handler(jsonRequest(
      "/v1/agent/missions/mission-explicit-running/running",
      "POST",
      { leaseId: claimBody.lease.leaseId },
      "agent-token-a",
    ));
    assert.equal(running.status, 200);

    const accepted = await handler(jsonRequest("/v1/agent/receipts", "POST", {
      leaseId: claimBody.lease.leaseId,
      receipt: makeReceipt({ missionId: "mission-explicit-running", deviceId: "device-a" }),
    }, "agent-token-a"));
    assert.equal(accepted.status, 200);
  });
});
