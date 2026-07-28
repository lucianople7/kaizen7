import { Mission, ValidationResult, validateMission } from "../../../packages/bridge-protocol/src/index.ts";

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

export function authorizeActionMission(input: unknown): ValidationResult<Mission> {
  const validated = validateMission(input);
  if (!validated.ok) return validated;

  if (validated.value.requestedAuthority > 1) {
    return { ok: false, errors: ["unauthorized:authority_level_disabled"] };
  }

  const searchable = [validated.value.objective, ...validated.value.constraints].join(" ").toLowerCase();
  if (forbiddenPatterns.some((pattern) => pattern.test(searchable))) {
    return { ok: false, errors: ["unauthorized:unsafe_capability_requested"] };
  }

  return validated;
}
