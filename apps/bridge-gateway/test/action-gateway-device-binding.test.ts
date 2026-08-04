import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createActionBridgeHandler } from "../src/action-gateway.ts";
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
      agentCredentials: {
        "agent-token-a": { deviceId: "device-a", credentialId: "cred-a" },
        "agent-token-b": { deviceId: "device-b", credentialId: "cred-b" },
      },
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
        leaseId: claimBody.lease.leaseId,
      }),
    }, "agent-token-b"));

    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), { ok: false, error: "lease_device_mismatch" });
  });
});
