import { Mission, TerminalReceipt } from "../../../packages/bridge-protocol/src/index.ts";
import { ClaimedMission, LeaseEnvelope, LeaseTransitionInput, MailboxMissionState, ReceiptInput, TransitionResult } from "./mailbox-types.ts";

export type MissionState = MailboxMissionState;

export interface StoredMission {
  mission: Mission;
  state: MissionState;
  createdAt: string;
  claimedAt?: string;
  claimedBy?: string;
  leaseId?: string;
  leaseExpiresAt?: string;
}

export interface StoreMissionResult {
  mission: Mission;
  duplicate: boolean;
}

export interface ActionBridgeStore {
  putMission(mission: Mission, now?: string): Promise<StoreMissionResult>;
  getMission(missionId: string): Promise<StoredMission | undefined>;
  claimNextMission(deviceId: string, now?: string): Promise<ClaimedMission | undefined>;
  renewLease(missionId: string, deviceId: string, now?: string): Promise<boolean>;
  markRunning(input: LeaseTransitionInput): Promise<TransitionResult>;
  markApprovalRequired(input: LeaseTransitionInput): Promise<TransitionResult>;
  resolveApproval(input: LeaseTransitionInput): Promise<TransitionResult>;
  cancelMission(input: { missionId: string; now: string }): Promise<TransitionResult>;
  expireLeases(now: string): Promise<number>;
  putReceipt(receipt: ReceiptInput): Promise<TransitionResult>;
  getReceipt(missionId: string): Promise<TerminalReceipt | undefined>;
  summary(): Promise<{ queued: number; claimed: number; receipts: number }>;
}

interface InMemoryActionBridgeStoreOptions {
  leaseIdGenerator?: () => string;
}

export class InMemoryActionBridgeStore implements ActionBridgeStore {
  private readonly missions = new Map<string, StoredMission>();
  private readonly idempotency = new Map<string, string>();
  private readonly receipts = new Map<string, TerminalReceipt>();

  constructor(private readonly options: InMemoryActionBridgeStoreOptions = {}) {}

  async putMission(mission: Mission, now = new Date().toISOString()): Promise<StoreMissionResult> {
    const existingMissionId = this.idempotency.get(mission.idempotencyKey);
    if (existingMissionId) {
      const existing = this.missions.get(existingMissionId);
      if (existing) return { mission: existing.mission, duplicate: true };
    }

    this.missions.set(mission.missionId, { mission, state: "queued", createdAt: now });
    this.idempotency.set(mission.idempotencyKey, mission.missionId);
    return { mission, duplicate: false };
  }

  async getMission(missionId: string): Promise<StoredMission | undefined> {
    return this.missions.get(missionId);
  }

  async claimNextMission(deviceId: string, now?: string): Promise<ClaimedMission | undefined> {
    const claimNow = now ?? this.firstClaimTime();
    for (const entry of this.missions.values()) {
      if (entry.state === "queued" && entry.mission.targetDeviceId === deviceId) {
        if (now !== undefined && Date.parse(entry.mission.expiresAt) <= Date.parse(now)) {
          entry.state = "expired";
          continue;
        }
        const lease = createLease(entry.mission, deviceId, claimNow, this.options.leaseIdGenerator);
        entry.state = "claimed";
        entry.claimedAt = claimNow;
        entry.claimedBy = deviceId;
        entry.leaseId = lease.leaseId;
        entry.leaseExpiresAt = lease.expiresAt;
        return { ...entry.mission, mission: entry.mission, lease };
      }
    }

    return undefined;
  }

  async renewLease(missionId: string, deviceId: string, now = new Date().toISOString()): Promise<boolean> {
    const mission = this.missions.get(missionId);
    if (!mission || !["claimed", "running", "approval_required"].includes(mission.state) || mission.claimedBy !== deviceId) return false;
    mission.leaseExpiresAt = addSeconds(now, 60);
    return true;
  }

  async markRunning(input: LeaseTransitionInput): Promise<TransitionResult> {
    return this.transitionWithLease(input, ["claimed", "approval_required"], "running");
  }

  async markApprovalRequired(input: LeaseTransitionInput): Promise<TransitionResult> {
    return this.transitionWithLease(input, ["claimed", "running"], "approval_required");
  }

  async resolveApproval(input: LeaseTransitionInput): Promise<TransitionResult> {
    return this.transitionWithLease(input, ["approval_required"], "running");
  }

  async cancelMission(input: { missionId: string; now: string }): Promise<TransitionResult> {
    const mission = this.missions.get(input.missionId);
    if (!mission) return { ok: false, reason: "mission_not_found" };
    if (isTerminal(mission.state)) return { ok: false, reason: "mission_terminal" };
    mission.state = "cancelled";
    return { ok: true };
  }

  async expireLeases(now: string): Promise<number> {
    let expired = 0;
    for (const mission of this.missions.values()) {
      if (
        ["claimed", "running", "approval_required"].includes(mission.state) &&
        mission.leaseExpiresAt &&
        Date.parse(mission.leaseExpiresAt) <= Date.parse(now)
      ) {
        mission.state = "queued";
        mission.claimedAt = undefined;
        mission.claimedBy = undefined;
        mission.leaseId = undefined;
        mission.leaseExpiresAt = undefined;
        expired += 1;
      }
    }
    return expired;
  }

  async putReceipt(input: ReceiptInput): Promise<TransitionResult> {
    const { receipt, deviceId, leaseId } = input;
    if (!leaseId) return { ok: false, reason: "lease_required" };
    const mission = this.missions.get(receipt.missionId);
    if (!mission) return { ok: false, reason: "mission_not_found" };
    if (mission.claimedBy !== deviceId) return { ok: false, reason: "lease_device_mismatch" };
    if (leaseId !== mission.leaseId) return { ok: false, reason: "lease_not_owned" };
    if (isTerminal(mission.state)) return { ok: false, reason: "mission_terminal" };
    if (mission.state !== "running") return { ok: false, reason: "mission_not_running" };
    if (mission.leaseExpiresAt && Date.parse(mission.leaseExpiresAt) <= Date.parse(receipt.endedAt)) {
      return { ok: false, reason: "lease_expired" };
    }

    this.receipts.set(receipt.missionId, receipt);
    mission.state = "completed";
    return { ok: true };
  }

  async getReceipt(missionId: string): Promise<TerminalReceipt | undefined> {
    return this.receipts.get(missionId);
  }

  async summary(): Promise<{ queued: number; claimed: number; receipts: number }> {
    let queued = 0;
    let claimed = 0;

    for (const entry of this.missions.values()) {
      if (entry.state === "queued") queued += 1;
      if (entry.state === "claimed") claimed += 1;
    }

    return { queued, claimed, receipts: this.receipts.size };
  }

  private firstClaimTime(): string {
    return new Date().toISOString();
  }

  private transitionWithLease(input: LeaseTransitionInput, from: MissionState[], to: MissionState): TransitionResult {
    if (!input.leaseId) return { ok: false, reason: "lease_required" };
    const mission = this.missions.get(input.missionId);
    if (!mission) return { ok: false, reason: "mission_not_found" };
    if (isTerminal(mission.state)) return { ok: false, reason: "mission_terminal" };
    if (!from.includes(mission.state)) return { ok: false, reason: "lease_not_owned" };
    if (mission.claimedBy !== input.deviceId) return { ok: false, reason: "lease_device_mismatch" };
    if (mission.leaseId !== input.leaseId) return { ok: false, reason: "lease_not_owned" };
    if (mission.leaseExpiresAt && Date.parse(mission.leaseExpiresAt) <= Date.parse(input.now)) {
      return { ok: false, reason: "lease_expired" };
    }
    mission.state = to;
    return { ok: true };
  }
}

function addSeconds(iso: string, seconds: number): string {
  return new Date(Date.parse(iso) + seconds * 1000).toISOString();
}

function createLease(mission: Mission, deviceId: string, now: string, idGenerator: (() => string) | undefined): LeaseEnvelope {
  return {
    leaseId: idGenerator ? idGenerator() : crypto.randomUUID(),
    missionId: mission.missionId,
    deviceId,
    expiresAt: addSeconds(now, 60),
  };
}

function isTerminal(state: MissionState): boolean {
  return ["completed", "failed", "cancelled", "expired"].includes(state);
}
