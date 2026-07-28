import { Mission, ValidationResult, validateMission } from "../../../packages/bridge-protocol/src/index.ts";

export interface AuthorityDecision {
  ok: boolean;
  reason?: string;
}

const forbiddenPatterns = [
  /\brun\s+(a\s+)?shell\b/,
  /\bshell\s+command\b/,
  /\bpowershell\b/,
  /\bcmd\.exe\b/,
  /\bfilesystem\b/,
  /\bdelete\b/,
  /\bsecret\b/,
  /\bcredential\b/,
];

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
  if (mission.requestedAuthority > 1) {
    return { ok: false, reason: "authority_level_disabled" };
  }

  const searchable = [mission.objective, ...mission.constraints].join(" ").toLowerCase();
  if (forbiddenPatterns.some((pattern) => pattern.test(searchable))) {
    return { ok: false, reason: "unsafe_capability_requested" };
  }

  return { ok: true };
}
