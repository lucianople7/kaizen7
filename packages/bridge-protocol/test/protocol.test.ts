import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BRIDGE_PROTOCOL_VERSION,
  digestAction,
  validateApproval,
  validateEvent,
  validateMission,
  validateReceipt,
} from "../src/index.ts";

const createdAt = "2026-07-27T19:00:00.000Z";
const expiresAt = "2026-07-27T19:10:00.000Z";
const beforeExpiry = () => new Date("2026-07-27T19:01:00.000Z");
const afterExpiry = () => new Date("2026-07-27T19:11:00.000Z");
const exactAction = {
  missionId: "mission-001",
  actionId: "action-001",
  kind: "create_local_commit",
  repository: "kaizen7",
  branch: "agent/kaizen7-live-bridge",
  files: ["packages/bridge-protocol/src/index.ts"],
};

const validMission = {
  protocol: BRIDGE_PROTOCOL_VERSION,
  missionId: "mission-001",
  idempotencyKey: "idem-001",
  createdAt,
  expiresAt,
  requestedBy: {
    login: "lucianople7",
  },
  targetDeviceId: "mini-pc-001",
  repository: "kaizen7",
  objective: "Inspect the repository status.",
  acceptanceChecks: ["Return branch and HEAD."],
  constraints: ["Do not deploy."],
  requestedAuthority: 0,
  correlationId: "chat-001",
  signature: "signed-envelope",
};

const validEvent = {
  protocol: BRIDGE_PROTOCOL_VERSION,
  missionId: "mission-001",
  sequence: 1,
  kind: "progress",
  createdAt,
  summary: "Repository status collected.",
};

const validApproval = {
  protocol: BRIDGE_PROTOCOL_VERSION,
  missionId: "mission-001",
  approvalId: "approval-001",
  actionId: "action-001",
  actionDigest: digestAction(exactAction),
  decision: "approved",
  approvedBy: {
    login: "lucianople7",
  },
  authorityLevel: 1,
  createdAt,
  expiresAt,
  singleUse: true,
};

const validReceipt = {
  protocol: BRIDGE_PROTOCOL_VERSION,
  missionId: "mission-001",
  deviceId: "mini-pc-001",
  status: "completed",
  repository: "kaizen7",
  branch: "agent/kaizen7-live-bridge",
  commits: ["8f3954a"],
  verifications: [
    {
      command: "npm.cmd run bridge:test",
      exitCode: 0,
    },
  ],
  approvalsConsumed: ["approval-001"],
  startedAt: createdAt,
  endedAt: "2026-07-27T19:05:00.000Z",
  nextAction: "Review checkpoint.",
};

describe("bridge protocol validators", () => {
  it("validates missions and protocol version", () => {
    assert.equal(validateMission({}).ok, false);
    assert.equal(validateMission(validMission).ok, true);
    assert.equal(validateMission({ ...validMission, protocol: "kaizen7.bridge.v2" }).ok, false);
  });

  it("validates events", () => {
    assert.equal(validateEvent(validEvent).ok, true);
    assert.equal(validateEvent({ ...validEvent, sequence: 0 }).ok, false);
    assert.equal(validateEvent({ ...validEvent, sequence: 1.5 }).ok, false);
    assert.equal(validateEvent({ ...validEvent, payload: { token: "forbidden" } }).ok, false);
  });

  it("canonicalizes action digests and validates approvals", () => {
    assert.equal(digestAction(exactAction), digestAction({ ...exactAction }));
    assert.equal(validateApproval(validApproval, exactAction, beforeExpiry).ok, true);
    assert.equal(validateApproval({ ...validApproval, actionDigest: "wrong" }, exactAction, beforeExpiry).ok, false);
    assert.equal(validateApproval(validApproval, exactAction, afterExpiry).ok, false);
    assert.equal(validateApproval({ ...validApproval, singleUse: false }, exactAction, beforeExpiry).ok, false);
  });

  it("rejects private keys in receipts", () => {
    assert.equal(validateReceipt(validReceipt).ok, true);
    assert.equal(validateReceipt({ ...validReceipt, status: "progress" }).ok, false);
    assert.equal(validateReceipt({ ...validReceipt, secret: "forbidden" }).ok, false);
    assert.equal(
      validateReceipt({
        ...validReceipt,
        artifacts: [{ name: "safe", digest: "sha256", rawTranscript: "forbidden" }],
      }).ok,
      false,
    );
  });

  it("rejects private keys in missions", () => {
    assert.equal(validateMission({ ...validMission, requestedBy: { login: "lucianople7", token: "forbidden" } }).ok, false);
  });
});
