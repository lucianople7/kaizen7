import { BRIDGE_PROTOCOL_VERSION, Mission, TerminalReceipt } from "../../../../packages/bridge-protocol/src/index.ts";

export function makeMission(overrides: Partial<Mission> = {}): Mission {
  return {
    protocol: BRIDGE_PROTOCOL_VERSION,
    missionId: "mission-fixture-001",
    operation: "repo_status",
    requestedOperation: { kind: "repo.status", repository: "kaizen7" },
    idempotencyKey: "idem-fixture-001",
    createdAt: "2026-07-28T10:00:00.000Z",
    expiresAt: "2026-07-28T10:15:00.000Z",
    requestedBy: { login: "lucianople7" },
    targetDeviceId: "device-mini-pc",
    repository: "kaizen7",
    objective: "Return read-only repository status.",
    acceptanceChecks: ["Return branch, HEAD and status."],
    constraints: ["Authority L0 only.", "Read-only Git inspection only."],
    requestedAuthority: 0,
    correlationId: "chat-fixture-001",
    signature: "",
    ...overrides,
  };
}

export function makeReceipt(overrides: Partial<TerminalReceipt> = {}): TerminalReceipt {
  return {
    protocol: BRIDGE_PROTOCOL_VERSION,
    missionId: "mission-fixture-001",
    deviceId: "device-mini-pc",
    leaseId: "lease-fixture-001",
    status: "completed",
    repository: "kaizen7",
    branch: "agent/kaizen7-live-bridge",
    commits: ["a05d7b24f0204c6ff0833e29c2ebd236bf51785f"],
    verifications: [{ command: "git status --short --branch", exitCode: 0 }],
    approvalsConsumed: [],
    startedAt: "2026-07-28T10:01:00.000Z",
    endedAt: "2026-07-28T10:02:00.000Z",
    nextAction: "Review receipt.",
    ...overrides,
  };
}
