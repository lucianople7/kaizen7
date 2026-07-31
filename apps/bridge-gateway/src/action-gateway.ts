import { BRIDGE_PROTOCOL_VERSION, Mission, RepositoryId, validateReceipt } from "../../../packages/bridge-protocol/src/index.ts";
import { authorizeActionMission } from "./authority.ts";
import { ActionBridgeStore, StoredMission } from "./mission-store.ts";
import { actionBridgeOpenApi } from "./openapi.ts";

export interface ActionBridgeConfig {
  actionBearerToken: string;
  agentBearerToken: string;
  bridgeVersion: string;
  defaultTargetDeviceId?: string;
}

type JsonBody = Record<string, unknown>;
const repositoryIds = new Set<RepositoryId>(["kaizen7", "thefocux-platform", "flowmatik-studio"]);

export function createActionBridgeHandler(store: ActionBridgeStore, config: ActionBridgeConfig): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/openapi.json") {
      return json(actionBridgeOpenApi);
    }

    if (url.pathname.startsWith("/v1/agent/")) {
      if (!authorized(request, config.agentBearerToken)) return json({ ok: false, error: "unauthorized" }, 401);
      return handleAgentRoute(request, url, store);
    }

    if (!authorized(request, config.actionBearerToken)) return json({ ok: false, error: "unauthorized" }, 401);

    if (request.method === "GET" && url.pathname === "/v1/status") {
      return json({
        ok: true,
        protocol: BRIDGE_PROTOCOL_VERSION,
        bridge: "kaizen7-action-bridge",
        version: config.bridgeVersion,
        publicEndpoints: ["GET /v1/status", "POST /v1/repo-status", "POST /v1/missions", "GET /v1/missions/{id}", "GET /v1/receipts/{id}"],
        authority: { maxAuthorityLevel: 1, disabledLevels: [2, 3], arbitraryShell: false },
        store: await store.summary(),
      });
    }

    if (request.method === "POST" && url.pathname === "/v1/repo-status") {
      const body = await readJson(request);
      const mission = buildRepoStatusMission(body, config);
      if (!mission.ok) return json({ ok: false, errors: mission.errors }, 400);

      const stored = await store.putMission(mission.value);
      return json(
        {
          ok: true,
          missionId: stored.mission.missionId,
          duplicate: stored.duplicate,
          missionPath: `/v1/missions/${encodeURIComponent(stored.mission.missionId)}`,
          receiptPath: `/v1/receipts/${encodeURIComponent(stored.mission.missionId)}`,
          nextAction: "Poll missionPath for queued/claimed/completed, then read receiptPath when hasReceipt is true.",
        },
        stored.duplicate ? 200 : 202,
      );
    }

    if (request.method === "POST" && url.pathname === "/v1/missions") {
      const body = await readJson(request);
      const authorizedMission = authorizeActionMission(body.mission);
      if (!authorizedMission.ok) {
        const status = authorizedMission.errors.some((error) => error.startsWith("unauthorized:")) ? 403 : 400;
        return json({ ok: false, errors: authorizedMission.errors }, status);
      }

      const stored = await store.putMission(authorizedMission.value);
      return json({ ok: true, missionId: stored.mission.missionId, duplicate: stored.duplicate }, stored.duplicate ? 200 : 202);
    }

    const missionMatch = /^\/v1\/missions\/([^/]+)$/.exec(url.pathname);
    if (request.method === "GET" && missionMatch) {
      const missionId = decodeURIComponent(missionMatch[1]);
      const mission = await store.getMission(missionId);
      if (!mission) return json({ ok: false, error: "mission_not_found" }, 404);
      const receipt = await store.getReceipt(missionId);
      return json(publicMissionStatus(mission, receipt !== undefined));
    }

    const receiptMatch = /^\/v1\/receipts\/([^/]+)$/.exec(url.pathname);
    if (request.method === "GET" && receiptMatch) {
      const receipt = await store.getReceipt(decodeURIComponent(receiptMatch[1]));
      return receipt ? json({ ok: true, receipt }) : json({ ok: false, error: "receipt_not_found" }, 404);
    }

    return json({ ok: false, error: "not_found" }, 404);
  };
}

function publicMissionStatus(stored: StoredMission, hasReceipt: boolean): Record<string, unknown> {
  return {
    ok: true,
    missionId: stored.mission.missionId,
    operation: stored.mission.operation,
    repository: stored.mission.repository,
    state: stored.state,
    requestedBy: stored.mission.requestedBy.login,
    targetDeviceId: stored.mission.targetDeviceId,
    correlationId: stored.mission.correlationId,
    createdAt: stored.createdAt,
    claimedAt: stored.claimedAt,
    leaseExpiresAt: stored.leaseExpiresAt,
    hasReceipt,
    receiptPath: `/v1/receipts/${encodeURIComponent(stored.mission.missionId)}`,
    nextAction: hasReceipt ? "Read receiptPath." : "Poll this mission status or receiptPath until completed.",
  };
}

function buildRepoStatusMission(body: JsonBody, config: ActionBridgeConfig): { ok: true; value: Mission } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const idempotencyKey = readNonEmptyString(body, "idempotencyKey", errors);
  const targetDeviceId =
    optionalNonEmptyString(body.targetDeviceId) ??
    config.defaultTargetDeviceId ??
    "mini-pc-001";
  const repository = optionalRepository(body.repository, errors) ?? "kaizen7";
  const login = optionalNonEmptyString(body.requestedBy) ?? "kaizen7-work-chat";
  if (targetDeviceId === "") errors.push("required_string:targetDeviceId");
  if (errors.length > 0 || !idempotencyKey) return { ok: false, errors };

  const correlationId = optionalNonEmptyString(body.correlationId) ?? idempotencyKey;
  const objective =
    optionalNonEmptyString(body.objective) ??
    `Return read-only Git repository status for ${repository}.`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);
  const mission: Mission = {
    protocol: BRIDGE_PROTOCOL_VERSION,
    missionId: `repo-status-${crypto.randomUUID()}`,
    operation: "repo_status",
    idempotencyKey,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    requestedBy: { login },
    targetDeviceId,
    repository,
    objective,
    acceptanceChecks: ["Return branch, HEAD, clean/dirty status, collectedAt and Codex turn evidence."],
    constraints: [
      "Authority L0 only.",
      "Read-only Git inspection only.",
      "No arbitrary shell, writes, installs, network changes, deployment or secrets.",
    ],
    requestedAuthority: 0,
    correlationId,
    signature: "gateway-generated-repo-status",
  };

  const authorizedMission = authorizeActionMission(mission);
  return authorizedMission.ok ? authorizedMission : { ok: false, errors: authorizedMission.errors };
}

async function handleAgentRoute(request: Request, url: URL, store: ActionBridgeStore): Promise<Response> {
  if (request.method === "GET" && url.pathname === "/v1/agent/missions/next") {
    const deviceId = url.searchParams.get("deviceId");
    if (!deviceId) return json({ ok: false, error: "deviceId_required" }, 400);
    return json({ ok: true, mission: await store.claimNextMission(deviceId) ?? null });
  }

  const leaseMatch = /^\/v1\/agent\/missions\/([^/]+)\/lease$/.exec(url.pathname);
  if (request.method === "POST" && leaseMatch) {
    const body = await readJson(request);
    const deviceId = typeof body.deviceId === "string" ? body.deviceId : "";
    if (!deviceId) return json({ ok: false, error: "deviceId_required" }, 400);
    const renewed = await store.renewLease(decodeURIComponent(leaseMatch[1]), deviceId);
    return renewed ? json({ ok: true }) : json({ ok: false, error: "lease_not_owned" }, 409);
  }

  if (request.method === "POST" && url.pathname === "/v1/agent/receipts") {
    const body = await readJson(request);
    const validated = validateReceipt(body.receipt);
    if (!validated.ok) return json({ ok: false, errors: validated.errors }, 400);
    await store.putReceipt(validated.value);
    return json({ ok: true, missionId: validated.value.missionId });
  }

  return json({ ok: false, error: "not_found" }, 404);
}

function authorized(request: Request, token: string): boolean {
  return request.headers.get("authorization") === `Bearer ${token}`;
}

async function readJson(request: Request): Promise<JsonBody> {
  try {
    const parsed = await request.json();
    return isObject(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function json(value: unknown, status = 200): Response {
  return Response.json(value, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

function isObject(value: unknown): value is JsonBody {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readNonEmptyString(body: JsonBody, key: string, errors: string[]): string | undefined {
  const value = body[key];
  if (typeof value !== "string" || value === "") {
    errors.push(`required_string:${key}`);
    return undefined;
  }
  return value;
}

function optionalNonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value !== "" ? value : undefined;
}

function optionalRepository(value: unknown, errors: string[]): RepositoryId | undefined {
  if (value === undefined) return undefined;
  if (repositoryIds.has(value as RepositoryId)) return value as RepositoryId;
  errors.push("invalid_repository");
  return undefined;
}
