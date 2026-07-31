import { Mission, TerminalReceipt } from "../../../packages/bridge-protocol/src/index.ts";

export type MissionState = "queued" | "claimed" | "completed";

export interface StoredMission {
  mission: Mission;
  state: MissionState;
  createdAt: string;
  claimedAt?: string;
  claimedBy?: string;
  leaseExpiresAt?: string;
}

export interface StoreMissionResult {
  mission: Mission;
  duplicate: boolean;
}

export interface ActionBridgeStore {
  putMission(mission: Mission, now?: string): Promise<StoreMissionResult>;
  getMission(missionId: string): Promise<StoredMission | undefined>;
  claimNextMission(deviceId: string, now?: string): Promise<Mission | undefined>;
  renewLease(missionId: string, deviceId: string, now?: string): Promise<boolean>;
  putReceipt(receipt: TerminalReceipt): Promise<void>;
  getReceipt(missionId: string): Promise<TerminalReceipt | undefined>;
  summary(): Promise<{ queued: number; claimed: number; receipts: number }>;
}

export class InMemoryActionBridgeStore implements ActionBridgeStore {
  private readonly missions = new Map<string, StoredMission>();
  private readonly idempotency = new Map<string, string>();
  private readonly receipts = new Map<string, TerminalReceipt>();

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

  async claimNextMission(deviceId: string, now = new Date().toISOString()): Promise<Mission | undefined> {
    for (const entry of this.missions.values()) {
      if (entry.state === "queued" && entry.mission.targetDeviceId === deviceId) {
        entry.state = "claimed";
        entry.claimedAt = now;
        entry.claimedBy = deviceId;
        entry.leaseExpiresAt = addSeconds(now, 60);
        return entry.mission;
      }
    }

    return undefined;
  }

  async renewLease(missionId: string, deviceId: string, now = new Date().toISOString()): Promise<boolean> {
    const mission = this.missions.get(missionId);
    if (!mission || mission.state !== "claimed" || mission.claimedBy !== deviceId) return false;
    mission.leaseExpiresAt = addSeconds(now, 60);
    return true;
  }

  async putReceipt(receipt: TerminalReceipt): Promise<void> {
    this.receipts.set(receipt.missionId, receipt);
    const mission = this.missions.get(receipt.missionId);
    if (mission) {
      mission.state = "completed";
    }
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
}

function addSeconds(iso: string, seconds: number): string {
  return new Date(Date.parse(iso) + seconds * 1000).toISOString();
}
