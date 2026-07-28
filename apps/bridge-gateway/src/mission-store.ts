import { Mission, TerminalReceipt } from "../../../packages/bridge-protocol/src/index.ts";

export type MissionState = "queued" | "claimed" | "completed";

export interface StoredMission {
  mission: Mission;
  state: MissionState;
  createdAt: string;
  claimedAt?: string;
}

export interface StoreMissionResult {
  mission: Mission;
  duplicate: boolean;
}

export interface ActionBridgeStore {
  putMission(mission: Mission, now?: string): StoreMissionResult;
  claimNextMission(deviceId: string, now?: string): Mission | undefined;
  putReceipt(receipt: TerminalReceipt): void;
  getReceipt(missionId: string): TerminalReceipt | undefined;
  summary(): { queued: number; claimed: number; receipts: number };
}

export class InMemoryActionBridgeStore implements ActionBridgeStore {
  private readonly missions = new Map<string, StoredMission>();
  private readonly idempotency = new Map<string, string>();
  private readonly receipts = new Map<string, TerminalReceipt>();

  putMission(mission: Mission, now = new Date().toISOString()): StoreMissionResult {
    const existingMissionId = this.idempotency.get(mission.idempotencyKey);
    if (existingMissionId) {
      const existing = this.missions.get(existingMissionId);
      if (existing) return { mission: existing.mission, duplicate: true };
    }

    this.missions.set(mission.missionId, { mission, state: "queued", createdAt: now });
    this.idempotency.set(mission.idempotencyKey, mission.missionId);
    return { mission, duplicate: false };
  }

  claimNextMission(deviceId: string, now = new Date().toISOString()): Mission | undefined {
    for (const entry of this.missions.values()) {
      if (entry.state === "queued" && entry.mission.targetDeviceId === deviceId) {
        entry.state = "claimed";
        entry.claimedAt = now;
        return entry.mission;
      }
    }

    return undefined;
  }

  putReceipt(receipt: TerminalReceipt): void {
    this.receipts.set(receipt.missionId, receipt);
    const mission = this.missions.get(receipt.missionId);
    if (mission) {
      mission.state = "completed";
    }
  }

  getReceipt(missionId: string): TerminalReceipt | undefined {
    return this.receipts.get(missionId);
  }

  summary(): { queued: number; claimed: number; receipts: number } {
    let queued = 0;
    let claimed = 0;

    for (const entry of this.missions.values()) {
      if (entry.state === "queued") queued += 1;
      if (entry.state === "claimed") claimed += 1;
    }

    return { queued, claimed, receipts: this.receipts.size };
  }
}
