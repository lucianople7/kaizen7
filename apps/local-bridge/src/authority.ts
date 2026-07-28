import { Mission, ValidationResult, validateMission } from "../../../packages/bridge-protocol/src/index.ts";

export interface AuthorityDecision {
  ok: boolean;
  reason?: string;
}

export function authorizeMission(input: unknown): ValidationResult<Mission> {
  const validated = validateMission(input);
  if (!validated.ok) return validated;

  const decision = authorizeMissionScope(validated.value);
  if (!decision.ok) {
    return { ok: false, errors: [`unauthorized:${decision.reason ?? "mission_scope"}`] };
  }

  return validated;
}

export function authorizeMissionScope(mission: Mission): AuthorityDecision {
  if (mission.operation === "repo_status") {
    return mission.requestedAuthority === 0
      ? { ok: true }
      : { ok: false, reason: "repo_status_requires_l0" };
  }

  if (mission.requestedAuthority > 1) {
    return { ok: false, reason: "authority_level_disabled" };
  }

  return { ok: true };
}
