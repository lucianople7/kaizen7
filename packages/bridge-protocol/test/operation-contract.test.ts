import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { BRIDGE_PROTOCOL_VERSION, validateMission, validateReceipt } from "../src/index.ts";

function validMission(overrides: Record<string, unknown> = {}) {
  return {
    protocol: BRIDGE_PROTOCOL_VERSION,
    missionId: "mission-operation-001",
    operation: "repo_status",
    requestedOperation: { kind: "repo.status", repository: "kaizen7" },
    idempotencyKey: "idem-operation-001",
    createdAt: "2026-07-28T10:00:00.000Z",
    expiresAt: "2026-07-28T10:15:00.000Z",
    requestedBy: { login: "lucianople7" },
    targetDeviceId: "device-mini-pc",
    repository: "kaizen7",
    objective: "Return repository status.",
    acceptanceChecks: ["Return branch, HEAD and status."],
    constraints: ["Read-only."],
    requestedAuthority: 0,
    correlationId: "chat-operation-001",
    signature: "",
    ...overrides,
  };
}

function validReceipt(overrides: Record<string, unknown> = {}) {
  return {
    protocol: BRIDGE_PROTOCOL_VERSION,
    missionId: "mission-operation-001",
    deviceId: "device-mini-pc",
    status: "completed",
    repository: "kaizen7",
    verifications: [{ command: "git status --short --branch", exitCode: 0 }],
    approvalsConsumed: [],
    startedAt: "2026-07-28T10:01:00.000Z",
    endedAt: "2026-07-28T10:02:00.000Z",
    nextAction: "Review receipt.",
    ...overrides,
  };
}

describe("bridge protocol typed operation contract", () => {
  it("accepts the repo.status operation envelope", () => {
    assert.equal(validateMission(validMission()).ok, true);
  });

  it("rejects unsupported free-form operations", () => {
    const result = validateMission(validMission({
      requestedOperation: { kind: "shell", command: "npm test" },
    }));

    assert.equal(result.ok, false);
    assert.match(result.ok ? "" : result.errors.join("\n"), /unsupported_operation/);
  });

  it("rejects legacy non-empty signatures unless the gateway has verified them", () => {
    const rejectedMarkers = ["not-empty-but-not-verified", "signed-envelope", "gateway-generated-repo-status"];

    for (const signature of rejectedMarkers) {
      const result = validateMission(validMission({ signature }));
      assert.equal(result.ok, false, signature);
      assert.match(result.ok ? "" : result.errors.join("\n"), /signature_not_supported/);
    }
  });

  it("keeps lease metadata out of terminal receipts", () => {
    const valid = validateReceipt(validReceipt());
    const withLease = validateReceipt(validReceipt({ leaseId: "lease-operation-001" }));

    assert.equal(valid.ok, true);
    assert.equal(withLease.ok, false);
    assert.match(withLease.ok ? "" : withLease.errors.join("\n"), /unknown:leaseId/);
  });
});
