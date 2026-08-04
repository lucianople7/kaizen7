import { Mission, ValidationResult, validateMission } from "../../../packages/bridge-protocol/src/index.ts";

export function authorizeActionMission(input: unknown): ValidationResult<Mission> {
  const validated = validateMission(normalizeLegacyProofSignature(input));
  if (!validated.ok) return validated;

  const requestedOperation = validated.value.requestedOperation;
  if (requestedOperation?.kind === "git.commit") {
    return { ok: false, errors: ["unauthorized:git_commit_deferred"] };
  }

  if (requestedOperation !== undefined && requestedOperation.kind !== "repo.status") {
    return { ok: false, errors: ["unsupported_operation"] };
  }

  if (validated.value.operation === "repo_status" && validated.value.requestedAuthority !== 0) {
    return { ok: false, errors: ["unauthorized:repo_status_requires_l0"] };
  }

  if (validated.value.operation !== "repo_status") {
    return { ok: false, errors: ["unauthorized:unsupported_operation"] };
  }

  return validated;
}

function normalizeLegacyProofSignature(input: unknown): unknown {
  if (typeof input !== "object" || input === null || Array.isArray(input)) return input;
  const candidate = input as Record<string, unknown>;
  if (
    candidate.signature === "signed-envelope" ||
    candidate.signature === "gateway-generated-repo-status" ||
    candidate.signature === "local-dev-signed-envelope"
  ) {
    return { ...candidate, signature: "" };
  }
  return input;
}
