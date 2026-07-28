import { Mission, ValidationResult, validateMission } from "../../../packages/bridge-protocol/src/index.ts";

export function authorizeActionMission(input: unknown): ValidationResult<Mission> {
  const validated = validateMission(input);
  if (!validated.ok) return validated;

  if (validated.value.operation === "repo_status" && validated.value.requestedAuthority !== 0) {
    return { ok: false, errors: ["unauthorized:repo_status_requires_l0"] };
  }

  if (validated.value.operation === undefined && validated.value.requestedAuthority > 1) {
    return { ok: false, errors: ["unauthorized:authority_level_disabled"] };
  }

  return validated;
}
