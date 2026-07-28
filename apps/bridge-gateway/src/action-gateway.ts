import { BRIDGE_PROTOCOL_VERSION, validateReceipt } from "../../../packages/bridge-protocol/src/index.ts";
import { authorizeActionMission } from "./authority.ts";
import { ActionBridgeStore } from "./mission-store.ts";
import { actionBridgeOpenApi } from "./openapi.ts";

export interface ActionBridgeConfig {
  actionBearerToken: string;
  agentBearerToken: string;
  bridgeVersion: string;
}

type JsonBody = Record<string, unknown>;

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
        publicEndpoints: ["GET /v1/status", "POST /v1/missions", "GET /v1/receipts/{id}"],
        authority: { maxAuthorityLevel: 1, disabledLevels: [2, 3], arbitraryShell: false },
        store: await store.summary(),
      });
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

    const receiptMatch = /^\/v1\/receipts\/([^/]+)$/.exec(url.pathname);
    if (request.method === "GET" && receiptMatch) {
      const receipt = await store.getReceipt(decodeURIComponent(receiptMatch[1]));
      return receipt ? json({ ok: true, receipt }) : json({ ok: false, error: "receipt_not_found" }, 404);
    }

    return json({ ok: false, error: "not_found" }, 404);
  };
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
