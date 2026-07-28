import {
  BRIDGE_PROTOCOL_VERSION,
  Mission,
  TerminalReceipt,
  validateMission,
} from "../../../packages/bridge-protocol/src/index.ts";
import { authorizeMissionScope } from "./authority.ts";

export interface ActionBridgeConsumerConfig {
  baseUrl: string;
  agentToken: string;
  deviceId: string;
  fetch?: typeof fetch;
  clock?: () => Date;
}

export type ActionBridgePollResult =
  | { status: "idle" }
  | { status: "completed"; missionId: string; receipt: TerminalReceipt }
  | { status: "rejected"; errors: string[] };

export async function pollActionBridgeOnce(config: ActionBridgeConsumerConfig): Promise<ActionBridgePollResult> {
  const fetcher = config.fetch ?? fetch;
  const baseUrl = config.baseUrl.replace(/\/$/, "");
  const nextUrl = `${baseUrl}/v1/agent/missions/next?deviceId=${encodeURIComponent(config.deviceId)}`;
  const next = await fetcher(nextUrl, {
    headers: { authorization: `Bearer ${config.agentToken}` },
  });

  if (!next.ok) {
    return { status: "rejected", errors: [`gateway:${next.status}`] };
  }

  const payload = await next.json() as { mission?: unknown };
  if (!payload.mission) {
    return { status: "idle" };
  }

  const validated = validateMission(payload.mission);
  if (!validated.ok) return { status: "rejected", errors: validated.errors };

  const authorized = authorizeMissionScope(validated.value);
  if (!authorized.ok) return { status: "rejected", errors: [`unauthorized:${authorized.reason ?? "mission_scope"}`] };

  const receipt = createSafeReceipt(validated.value, config.clock ?? (() => new Date()));
  const stored = await fetcher(`${baseUrl}/v1/agent/receipts`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.agentToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ receipt }),
  });

  if (!stored.ok) {
    return { status: "rejected", errors: [`receipt_store:${stored.status}`] };
  }

  return { status: "completed", missionId: validated.value.missionId, receipt };
}

function createSafeReceipt(mission: Mission, clock: () => Date): TerminalReceipt {
  const now = clock().toISOString();
  return {
    protocol: BRIDGE_PROTOCOL_VERSION,
    missionId: mission.missionId,
    deviceId: mission.targetDeviceId,
    status: "completed",
    repository: mission.repository,
    branch: "agent/kaizen7-live-bridge",
    commits: [],
    verifications: [{ command: "safe-action-bridge-adapter", exitCode: 0 }],
    approvalsConsumed: [],
    startedAt: now,
    endedAt: now,
    nextAction: "Receipt stored through outbound Action Bridge polling; no arbitrary execution performed.",
  };
}
