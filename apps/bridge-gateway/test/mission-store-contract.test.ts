import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { InMemoryActionBridgeStore } from "../src/mission-store.ts";
import { makeMission, makeReceipt } from "./support/fixtures.ts";

describe("Action Bridge mailbox store contract", () => {
  it("requires a current device-bound lease before accepting receipts", async () => {
    const store = new InMemoryActionBridgeStore();
    const mission = makeMission({
      missionId: "mission-device-bound-1",
      idempotencyKey: "idem-device-bound-1",
      targetDeviceId: "device-a",
    });

    await store.putMission(mission, "2026-07-28T10:00:00.000Z");
    const claim = await store.claimNextMission("device-a", "2026-07-28T10:00:01.000Z");

    assert.equal(claim?.mission.missionId, "mission-device-bound-1");

    const wrongDevice = await store.putReceipt(makeReceipt({
      missionId: mission.missionId,
      deviceId: "device-b",
      leaseId: claim?.lease.leaseId,
    }));

    assert.deepEqual(wrongDevice, { ok: false, reason: "lease_device_mismatch" });
  });

  it("does not claim expired missions", async () => {
    const store = new InMemoryActionBridgeStore();
    await store.putMission(makeMission({
      missionId: "mission-expired-1",
      idempotencyKey: "idem-expired-1",
      expiresAt: "2026-07-28T10:00:30.000Z",
    }), "2026-07-28T10:00:00.000Z");

    const claim = await store.claimNextMission("device-mini-pc", "2026-07-28T10:01:00.000Z");
    const stored = await store.getMission("mission-expired-1");

    assert.equal(claim, undefined);
    assert.equal(stored?.state, "expired");
  });
});
