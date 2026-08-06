import { createHash } from "node:crypto";
import {
  Approval,
  BRIDGE_PROTOCOL_VERSION,
  BridgeEvent,
  Mission,
  MissionOperation,
  MissionStatus,
  RepositoryId,
  TerminalReceipt,
  TerminalStatus,
  ValidationResult,
} from "./types.ts";

const repositories = new Set<RepositoryId>(["kaizen7", "thefocux-platform", "flowmatik-studio"]);
const statuses = new Set<MissionStatus>([
  "accepted",
  "started",
  "progress",
  "approval_required",
  "approval_resolved",
  "verification",
  "blocked",
  "failed",
  "cancelled",
  "completed",
]);
const terminalStatuses = new Set<TerminalStatus>(["blocked", "failed", "cancelled", "completed"]);
const authorityLevels = new Set([0, 1, 2, 3]);
const missionOperations = new Set<MissionOperation>(["repo_status"]);
const privateKeys = new Set(["secret", "token", "rawTranscript", "recoveryZip"]);

type Shape = Record<string, unknown>;

function ok<T>(value: T): ValidationResult<T> {
  return { ok: true, value };
}

function fail<T>(errors: string[]): ValidationResult<T> {
  return { ok: false, errors };
}

function isShape(value: unknown): value is Shape {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function rejectUnknown(value: Shape, allowed: string[], errors: string[]): void {
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(value)) {
    if (!allowedSet.has(key)) {
      errors.push(`unknown:${key}`);
    }
  }
}

function requiredString(value: Shape, key: string, errors: string[]): string | undefined {
  if (typeof value[key] !== "string" || value[key] === "") {
    errors.push(`required_string:${key}`);
    return undefined;
  }
  return value[key] as string;
}

function requiredStringArray(value: Shape, key: string, errors: string[]): string[] | undefined {
  const candidate = value[key];
  if (!Array.isArray(candidate) || !candidate.every((entry) => typeof entry === "string")) {
    errors.push(`required_string_array:${key}`);
    return undefined;
  }
  return candidate;
}

function validIso(value: string | undefined, key: string, errors: string[]): void {
  if (!value || Number.isNaN(Date.parse(value))) {
    errors.push(`invalid_timestamp:${key}`);
  }
}

function hasPrivatePayload(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some((entry) => hasPrivatePayload(entry));
  }

  if (!isShape(value)) {
    return false;
  }

  for (const [key, entry] of Object.entries(value)) {
    if (privateKeys.has(key)) {
      return true;
    }
    if (hasPrivatePayload(entry)) {
      return true;
    }
  }

  return false;
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => canonicalize(entry));
  }

  if (isShape(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }

  return value;
}

function optionalActionString(action: unknown, key: string): string | undefined {
  return isShape(action) && typeof action[key] === "string" ? action[key] : undefined;
}

export function digestAction(action: unknown): string {
  return createHash("sha256").update(JSON.stringify(canonicalize(action))).digest("hex");
}

export function validateMission(input: unknown): ValidationResult<Mission> {
  const errors: string[] = [];
  if (!isShape(input)) return fail(["mission:not_object"]);

  rejectUnknown(
    input,
    [
      "protocol",
      "missionId",
      "operation",
      "requestedOperation",
      "idempotencyKey",
      "createdAt",
      "expiresAt",
      "requestedBy",
      "targetDeviceId",
      "repository",
      "objective",
      "acceptanceChecks",
      "constraints",
      "requestedAuthority",
      "codexThreadId",
      "correlationId",
      "signature",
    ],
    errors,
  );

  if (input.protocol !== BRIDGE_PROTOCOL_VERSION) errors.push("invalid_protocol");
  const createdAt = requiredString(input, "createdAt", errors);
  const expiresAt = requiredString(input, "expiresAt", errors);
  validIso(createdAt, "createdAt", errors);
  validIso(expiresAt, "expiresAt", errors);
  requiredString(input, "missionId", errors);
  requiredString(input, "idempotencyKey", errors);
  requiredString(input, "targetDeviceId", errors);
  requiredString(input, "objective", errors);
  requiredString(input, "correlationId", errors);
  if (input.signature !== undefined && typeof input.signature !== "string") errors.push("invalid_signature");
  requiredStringArray(input, "acceptanceChecks", errors);
  requiredStringArray(input, "constraints", errors);

  if (input.operation !== undefined && !missionOperations.has(input.operation as MissionOperation)) errors.push("invalid_operation");
  if (input.requestedOperation !== undefined) {
    validateRequestedOperation(input.requestedOperation, errors);
  }
  if (typeof input.signature === "string" && input.signature !== "") {
    errors.push("signature_not_supported");
  }
  if (!repositories.has(input.repository as RepositoryId)) errors.push("invalid_repository");
  if (!authorityLevels.has(input.requestedAuthority as number)) errors.push("invalid_authority");
  if (input.codexThreadId !== undefined && typeof input.codexThreadId !== "string") {
    errors.push("invalid_codexThreadId");
  }
  if (!isShape(input.requestedBy) || typeof input.requestedBy.login !== "string") {
    errors.push("invalid_requestedBy");
  }
  if (hasPrivatePayload(input)) errors.push("private_payload");

  return errors.length === 0 ? ok(input as unknown as Mission) : fail(errors);
}

export function validateEvent(input: unknown): ValidationResult<BridgeEvent> {
  const errors: string[] = [];
  if (!isShape(input)) return fail(["event:not_object"]);

  rejectUnknown(input, ["protocol", "missionId", "sequence", "kind", "createdAt", "summary", "payload"], errors);
  if (input.protocol !== BRIDGE_PROTOCOL_VERSION) errors.push("invalid_protocol");
  requiredString(input, "missionId", errors);
  requiredString(input, "summary", errors);
  const createdAt = requiredString(input, "createdAt", errors);
  validIso(createdAt, "createdAt", errors);
  if (!Number.isInteger(input.sequence) || Number(input.sequence) <= 0) errors.push("invalid_sequence");
  if (!statuses.has(input.kind as MissionStatus)) errors.push("invalid_kind");
  if (hasPrivatePayload(input)) errors.push("private_payload");

  return errors.length === 0 ? ok(input as unknown as BridgeEvent) : fail(errors);
}

export function validateApproval(
  input: unknown,
  exactAction: unknown,
  clock: () => Date = () => new Date(),
): ValidationResult<Approval> {
  const errors: string[] = [];
  if (!isShape(input)) return fail(["approval:not_object"]);

  rejectUnknown(
    input,
    [
      "protocol",
      "missionId",
      "approvalId",
      "actionId",
      "actionDigest",
      "decision",
      "approvedBy",
      "authorityLevel",
      "createdAt",
      "expiresAt",
      "singleUse",
    ],
    errors,
  );
  if (input.protocol !== BRIDGE_PROTOCOL_VERSION) errors.push("invalid_protocol");
  requiredString(input, "missionId", errors);
  requiredString(input, "approvalId", errors);
  requiredString(input, "actionId", errors);
  const actionDigest = requiredString(input, "actionDigest", errors);
  const createdAt = requiredString(input, "createdAt", errors);
  const expiresAt = requiredString(input, "expiresAt", errors);
  validIso(createdAt, "createdAt", errors);
  validIso(expiresAt, "expiresAt", errors);
  if (actionDigest !== digestAction(exactAction)) errors.push("action_digest_mismatch");
  const exactMissionId = optionalActionString(exactAction, "missionId");
  const exactActionId = optionalActionString(exactAction, "actionId");
  if (exactMissionId !== undefined && input.missionId !== exactMissionId) errors.push("mission_mismatch");
  if (exactActionId !== undefined && input.actionId !== exactActionId) errors.push("action_mismatch");
  if (input.decision !== "approved" && input.decision !== "denied") errors.push("invalid_decision");
  if (!authorityLevels.has(input.authorityLevel as number)) errors.push("invalid_authority");
  if (input.singleUse !== true) errors.push("not_single_use");
  if (!isShape(input.approvedBy) || typeof input.approvedBy.login !== "string") {
    errors.push("invalid_approvedBy");
  }
  if (expiresAt && Date.parse(expiresAt) <= clock().getTime()) errors.push("approval_expired");
  if (hasPrivatePayload(input)) errors.push("private_payload");

  return errors.length === 0 ? ok(input as unknown as Approval) : fail(errors);
}

export function validateReceipt(input: unknown): ValidationResult<TerminalReceipt> {
  const errors: string[] = [];
  if (!isShape(input)) return fail(["receipt:not_object"]);

  rejectUnknown(
    input,
    [
      "protocol",
      "missionId",
      "deviceId",
      "status",
      "repository",
      "branch",
      "commits",
      "verifications",
      "repoStatus",
      "codexTurn",
      "artifacts",
      "approvalsConsumed",
      "startedAt",
      "endedAt",
      "nextAction",
    ],
    errors,
  );
  if (input.protocol !== BRIDGE_PROTOCOL_VERSION) errors.push("invalid_protocol");
  requiredString(input, "missionId", errors);
  requiredString(input, "deviceId", errors);
  requiredString(input, "nextAction", errors);
  const startedAt = requiredString(input, "startedAt", errors);
  const endedAt = requiredString(input, "endedAt", errors);
  validIso(startedAt, "startedAt", errors);
  validIso(endedAt, "endedAt", errors);
  if (!terminalStatuses.has(input.status as TerminalStatus)) errors.push("invalid_terminal_status");
  if (!repositories.has(input.repository as RepositoryId)) errors.push("invalid_repository");
  if (input.branch !== undefined && typeof input.branch !== "string") errors.push("invalid_branch");
  if (input.commits !== undefined && (!Array.isArray(input.commits) || !input.commits.every((entry) => typeof entry === "string"))) {
    errors.push("invalid_commits");
  }
  if (!Array.isArray(input.approvalsConsumed) || !input.approvalsConsumed.every((entry) => typeof entry === "string")) {
    errors.push("invalid_approvalsConsumed");
  }
  if (
    !Array.isArray(input.verifications) ||
    !input.verifications.every(
      (entry) =>
        isShape(entry) &&
        typeof entry.command === "string" &&
        Number.isInteger(entry.exitCode),
    )
  ) {
    errors.push("invalid_verifications");
  }
  if (input.repoStatus !== undefined) {
    if (
      !isShape(input.repoStatus) ||
      typeof input.repoStatus.clean !== "boolean" ||
      typeof input.repoStatus.shortStatus !== "string" ||
      typeof input.repoStatus.collectedAt !== "string" ||
      Number.isNaN(Date.parse(input.repoStatus.collectedAt))
    ) {
      errors.push("invalid_repoStatus");
    }
  }
  if (input.codexTurn !== undefined) {
    if (
      !isShape(input.codexTurn) ||
      typeof input.codexTurn.threadId !== "string" ||
      input.codexTurn.threadId === "" ||
      typeof input.codexTurn.turnId !== "string" ||
      input.codexTurn.turnId === "" ||
      !Array.isArray(input.codexTurn.commands) ||
      input.codexTurn.commands.length === 0 ||
      !input.codexTurn.commands.every(
        (entry) =>
          isShape(entry) &&
          typeof entry.command === "string" &&
          Number.isInteger(entry.exitCode),
      )
    ) {
      errors.push("invalid_codexTurn");
    }
  }
  if (hasPrivatePayload(input)) errors.push("private_payload");

  return errors.length === 0 ? ok(input as unknown as TerminalReceipt) : fail(errors);
}

function validateRequestedOperation(input: unknown, errors: string[]): void {
  if (!isShape(input) || typeof input.kind !== "string") {
    errors.push("unsupported_operation");
    return;
  }

  if (input.kind === "repo.status") {
    if (!repositories.has(input.repository as RepositoryId)) errors.push("invalid_operation_repository");
    rejectUnknown(input, ["kind", "repository"], errors);
    return;
  }

  if (input.kind === "tests.run") {
    if (typeof input.workspace !== "string" || input.workspace === "") errors.push("invalid_operation_workspace");
    const allowedCommands = new Set(["bridge:typecheck", "bridge:test", "bridge:verify", "k7:smoke", "k7:ready"]);
    if (!allowedCommands.has(input.command as string)) errors.push("invalid_operation_command");
    rejectUnknown(input, ["kind", "workspace", "command"], errors);
    return;
  }

  if (input.kind === "git.commit") {
    if (!repositories.has(input.repository as RepositoryId)) errors.push("invalid_operation_repository");
    if (!Array.isArray(input.files) || !input.files.every((entry) => typeof entry === "string" && entry !== "")) {
      errors.push("invalid_operation_files");
    }
    if (typeof input.message !== "string" || input.message === "") errors.push("invalid_operation_message");
    rejectUnknown(input, ["kind", "repository", "files", "message"], errors);
    return;
  }

  errors.push("unsupported_operation");
}
