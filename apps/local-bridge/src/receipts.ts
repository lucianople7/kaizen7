import {
  BRIDGE_PROTOCOL_VERSION,
  Mission,
  TerminalReceipt,
} from "../../../packages/bridge-protocol/src/index.ts";

export interface MissionReceiptRecord {
  receipt: TerminalReceipt;
  idempotencyKey: string;
}

export class ReceiptStore {
  private readonly byMissionId = new Map<string, MissionReceiptRecord>();
  private readonly byIdempotencyKey = new Map<string, string>();

  submit(mission: Mission, clock: () => Date = () => new Date()): TerminalReceipt {
    const existingMissionId = this.byIdempotencyKey.get(mission.idempotencyKey);
    if (existingMissionId) {
      const existing = this.byMissionId.get(existingMissionId);
      if (existing) return existing.receipt;
    }

    const now = clock().toISOString();
    const receipt: TerminalReceipt = {
      protocol: BRIDGE_PROTOCOL_VERSION,
      missionId: mission.missionId,
      deviceId: mission.targetDeviceId,
      status: "completed",
      repository: mission.repository,
      branch: "agent/kaizen7-live-bridge",
      commits: [],
      verifications: [
        {
          command: "safe-test-adapter",
          exitCode: 0,
        },
      ],
      approvalsConsumed: [],
      startedAt: now,
      endedAt: now,
      nextAction: "Receipt stored locally; no arbitrary execution performed.",
    };

    this.byMissionId.set(mission.missionId, { receipt, idempotencyKey: mission.idempotencyKey });
    this.byIdempotencyKey.set(mission.idempotencyKey, mission.missionId);
    return receipt;
  }

  get(missionId: string): TerminalReceipt | undefined {
    return this.byMissionId.get(missionId)?.receipt;
  }
}
