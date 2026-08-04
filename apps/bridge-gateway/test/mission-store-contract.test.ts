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

    const wrongDevice = await store.putReceipt({
      deviceId: "device-b",
      leaseId: claim?.lease.leaseId ?? "",
      receipt: makeReceipt({
      missionId: mission.missionId,
      deviceId: "device-b",
      }),
    });

    assert.deepEqual(wrongDevice, { ok: false, reason: "lease_device_mismatch" });
  });

  it("rejects bare receipts and missing lease ids", async () => {
    const store = new InMemoryActionBridgeStore();
    const mission = makeMission({ missionId: "mission-lease-required", idempotencyKey: "idem-lease-required" });
    await store.putMission(mission, "2026-07-28T10:00:00.000Z");
    await store.claimNextMission("device-mini-pc", "2026-07-28T10:00:01.000Z");

    assert.deepEqual(await store.putReceipt(makeReceipt({ missionId: mission.missionId }) as never), {
      ok: false,
      reason: "lease_required",
    });
    assert.deepEqual(await store.putReceipt({
      deviceId: "device-mini-pc",
      leaseId: "",
      receipt: makeReceipt({ missionId: mission.missionId }),
    }), { ok: false, reason: "lease_required" });
  });

  it("requires markRunning before accepting terminal receipts", async () => {
    const store = new InMemoryActionBridgeStore({ leaseIdGenerator: () => "lease-running-1" });
    const mission = makeMission({ missionId: "mission-running-1", idempotencyKey: "idem-running-1" });
    await store.putMission(mission, "2026-07-28T10:00:00.000Z");
    const claim = await store.claimNextMission("device-mini-pc", "2026-07-28T10:00:01.000Z");

    assert.equal(claim?.lease.leaseId, "lease-running-1");
    assert.deepEqual(await store.putReceipt({
      deviceId: "device-mini-pc",
      leaseId: claim?.lease.leaseId ?? "",
      receipt: makeReceipt({ missionId: mission.missionId }),
    }), { ok: false, reason: "mission_not_running" });

    assert.deepEqual(await store.markRunning({
      deviceId: "device-mini-pc",
      leaseId: claim?.lease.leaseId ?? "",
      missionId: mission.missionId,
      now: "2026-07-28T10:00:02.000Z",
    }), { ok: true });
    assert.deepEqual(await store.putReceipt({
      deviceId: "device-mini-pc",
      leaseId: claim?.lease.leaseId ?? "",
      receipt: makeReceipt({
        missionId: mission.missionId,
        startedAt: "2026-07-28T10:00:02.000Z",
        endedAt: "2026-07-28T10:00:03.000Z",
      }),
    }), { ok: true });
  });

  it("blocks receipts after cancel, expiry and terminal state", async () => {
    const store = new InMemoryActionBridgeStore({ leaseIdGenerator: () => "lease-cancel-1" });
    const mission = makeMission({ missionId: "mission-cancel-1", idempotencyKey: "idem-cancel-1" });
    await store.putMission(mission, "2026-07-28T10:00:00.000Z");
    const claim = await store.claimNextMission("device-mini-pc", "2026-07-28T10:00:01.000Z");
    const leaseId = claim?.lease.leaseId ?? "";

    assert.deepEqual(await store.markRunning({ deviceId: "device-mini-pc", leaseId, missionId: mission.missionId, now: "2026-07-28T10:00:02.000Z" }), { ok: true });
    assert.deepEqual(await store.cancelMission({ missionId: mission.missionId, now: "2026-07-28T10:00:03.000Z" }), { ok: true });
    assert.deepEqual(await store.putReceipt({ deviceId: "device-mini-pc", leaseId, receipt: makeReceipt({ missionId: mission.missionId }) }), {
      ok: false,
      reason: "mission_terminal",
    });
  });

  it("reclaims expired leases and gives one owner per claim window", async () => {
    const leases = ["lease-first", "lease-second"];
    const store = new InMemoryActionBridgeStore({ leaseIdGenerator: () => leases.shift() ?? "lease-extra" });
    const mission = makeMission({ missionId: "mission-reclaim-1", idempotencyKey: "idem-reclaim-1" });
    await store.putMission(mission, "2026-07-28T10:00:00.000Z");

    const first = await store.claimNextMission("device-mini-pc", "2026-07-28T10:00:01.000Z");
    const duplicate = await store.claimNextMission("device-mini-pc", "2026-07-28T10:00:02.000Z");
    assert.equal(first?.lease.leaseId, "lease-first");
    assert.equal(duplicate, undefined);

    assert.equal(await store.expireLeases("2026-07-28T10:02:02.000Z"), 1);
    const reclaimed = await store.claimNextMission("device-mini-pc", "2026-07-28T10:02:03.000Z");
    assert.equal(reclaimed?.lease.leaseId, "lease-second");
  });

  it("records approval-required and approval-resolved transitions", async () => {
    const store = new InMemoryActionBridgeStore({ leaseIdGenerator: () => "lease-approval-1" });
    const mission = makeMission({ missionId: "mission-approval-1", idempotencyKey: "idem-approval-1" });
    await store.putMission(mission, "2026-07-28T10:00:00.000Z");
    const claim = await store.claimNextMission("device-mini-pc", "2026-07-28T10:00:01.000Z");

    assert.deepEqual(await store.markApprovalRequired({
      missionId: mission.missionId,
      deviceId: "device-mini-pc",
      leaseId: claim?.lease.leaseId ?? "",
      now: "2026-07-28T10:00:02.000Z",
    }), { ok: true });
    assert.equal((await store.getMission(mission.missionId))?.state, "approval_required");
    assert.deepEqual(await store.resolveApproval({
      missionId: mission.missionId,
      deviceId: "device-mini-pc",
      leaseId: claim?.lease.leaseId ?? "",
      now: "2026-07-28T10:00:03.000Z",
    }), { ok: true });
    assert.equal((await store.getMission(mission.missionId))?.state, "running");
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
