import { Mission, TerminalReceipt } from "../../../packages/bridge-protocol/src/index.ts";

export type MailboxMissionState =
  | "queued"
  | "claimed"
  | "running"
  | "approval_required"
  | "completed"
  | "failed"
  | "cancelled"
  | "expired";

export interface DevicePrincipal {
  deviceId: string;
  credentialId: string;
}

export type AgentCredentialResolution =
  | { ok: true; principal: DevicePrincipal }
  | { ok: false };

export interface LeaseEnvelope {
  leaseId: string;
  missionId: string;
  deviceId: string;
  expiresAt: string;
}

export type ClaimedMission = Mission & {
  mission: Mission;
  lease: LeaseEnvelope;
};

export type TransitionResult =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "mission_not_found"
        | "lease_required"
        | "lease_not_owned"
        | "lease_expired"
        | "lease_device_mismatch"
        | "mission_not_running"
        | "mission_terminal";
    };

export interface ReceiptInput {
  deviceId: string;
  leaseId: string;
  receipt: TerminalReceipt;
}

export interface LeaseTransitionInput {
  missionId: string;
  deviceId: string;
  leaseId: string;
  now: string;
}
