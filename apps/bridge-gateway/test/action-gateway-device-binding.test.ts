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
    const claimBody = await claimed.json();

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
});
