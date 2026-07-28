import {
  BRIDGE_PROTOCOL_VERSION,
  Mission,
  TerminalReceipt,
  validateMission,
} from "../../../packages/bridge-protocol/src/index.ts";
import { authorizeMissionScope } from "./authority.ts";

export interface MissionExecutor {
  executeRepoStatus(mission: Mission): Promise<TerminalReceipt>;
}

export interface ActionBridgeConsumerConfig {
  baseUrl: string;
  agentToken: string;
  deviceId: string;
  executor?: MissionExecutor;
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

  const receiptResult = await executeMission(validated.value, config);
  if (!receiptResult.ok) return { status: "rejected", errors: receiptResult.errors };

  const receipt = receiptResult.receipt;
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

async function executeMission(
  mission: Mission,
  config: ActionBridgeConsumerConfig,
): Promise<{ ok: true; receipt: TerminalReceipt } | { ok: false; errors: string[] }> {
  if (mission.operation === "repo_status") {
    if (!config.executor) return { ok: false, errors: ["executor_missing:repo_status"] };
    return { ok: true, receipt: await config.executor.executeRepoStatus(mission) };
  }

  return { ok: true, receipt: createSafeReceipt(mission, config.clock ?? (() => new Date())) };
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
