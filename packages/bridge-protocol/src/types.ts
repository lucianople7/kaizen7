export const BRIDGE_PROTOCOL_VERSION = "kaizen7.bridge.v1" as const;

export type BridgeProtocolVersion = typeof BRIDGE_PROTOCOL_VERSION;
export type AuthorityLevel = 0 | 1 | 2 | 3;
export type RepositoryId = "kaizen7" | "thefocux-platform" | "flowmatik-studio";
export type MissionStatus =
  | "accepted"
  | "started"
  | "progress"
  | "approval_required"
  | "approval_resolved"
  | "verification"
  | "blocked"
  | "failed"
  | "cancelled"
  | "completed";

export type TerminalStatus = "blocked" | "failed" | "cancelled" | "completed";
export type ApprovalDecision = "approved" | "denied";
export type MissionOperation = "repo_status";

export interface BridgeIdentity {
  login: string;
}

export interface Mission {
  protocol: BridgeProtocolVersion;
  missionId: string;
  operation?: MissionOperation;
  idempotencyKey: string;
  createdAt: string;
  expiresAt: string;
  requestedBy: BridgeIdentity;
  targetDeviceId: string;
  repository: RepositoryId;
  objective: string;
  acceptanceChecks: string[];
  constraints: string[];
  requestedAuthority: AuthorityLevel;
  codexThreadId?: string;
  correlationId: string;
  signature: string;
}

export interface BridgeEvent {
  protocol: BridgeProtocolVersion;
  missionId: string;
  sequence: number;
  kind: MissionStatus;
  createdAt: string;
  summary: string;
  payload?: unknown;
}

export interface Approval {
  protocol: BridgeProtocolVersion;
  missionId: string;
  approvalId: string;
  actionId: string;
  actionDigest: string;
  decision: ApprovalDecision;
  approvedBy: BridgeIdentity;
  authorityLevel: AuthorityLevel;
  createdAt: string;
  expiresAt: string;
  singleUse: true;
}

export interface VerificationResult {
  command: string;
  exitCode: number;
  stdout?: string;
  stderr?: string;
}

export interface TerminalReceipt {
  protocol: BridgeProtocolVersion;
  missionId: string;
  deviceId: string;
  status: TerminalStatus;
  repository: RepositoryId;
  branch?: string;
  commits?: string[];
  verifications: VerificationResult[];
  repoStatus?: {
    clean: boolean;
    shortStatus: string;
    collectedAt: string;
  };
  codexTurn?: {
    threadId: string;
    turnId: string;
    commands: VerificationResult[];
  };
  artifacts?: Array<{ name: string; digest: string }>;
  approvalsConsumed: string[];
  startedAt: string;
  endedAt: string;
  nextAction: string;
}

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: string[] };
