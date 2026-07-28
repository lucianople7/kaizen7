import { BRIDGE_PROTOCOL_VERSION, Mission } from "../../../packages/bridge-protocol/src/index.ts";
import { authorizeMission } from "./authority.ts";
import { ReceiptStore } from "./receipts.ts";

type JsonObject = Record<string, unknown>;

export interface McpRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: JsonObject;
}

export interface BridgeMcpState {
  receipts: ReceiptStore;
  clock: () => Date;
}

export function createBridgeMcpState(clock: () => Date = () => new Date()): BridgeMcpState {
  return {
    receipts: new ReceiptStore(),
    clock,
  };
}

export const bridgeTools = [
  {
    name: "bridge_status",
    description: "Read KAIZEN7 local bridge health, protocol and safe capability state.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      properties: {},
    },
  },
  {
    name: "bridge_submit_mission",
    description: "Validate and authorize a typed KAIZEN7 mission envelope, then store a local receipt.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["mission"],
      properties: {
        mission: {
          type: "object",
          additionalProperties: true,
        },
      },
    },
  },
  {
    name: "bridge_get_receipt",
    description: "Read a previously stored KAIZEN7 bridge receipt by mission id.",
    inputSchema: {
      type: "object",
      additionalProperties: false,
      required: ["missionId"],
      properties: {
        missionId: { type: "string" },
      },
    },
  },
] as const;

function result(id: McpRequest["id"], value: unknown): JsonObject {
  return { jsonrpc: "2.0", id, result: value };
}

function error(id: McpRequest["id"], code: number, message: string, data?: unknown): JsonObject {
  return { jsonrpc: "2.0", id, error: { code, message, data } };
}

function toolContent(value: unknown): JsonObject {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(value),
      },
    ],
    structuredContent: value,
  };
}

export function handleMcpRequest(request: McpRequest, state: BridgeMcpState = createBridgeMcpState()): JsonObject | undefined {
  if (request.method === "notifications/initialized") {
    return undefined;
  }

  if (request.method === "initialize") {
    return result(request.id, {
      protocolVersion: "2025-06-18",
      capabilities: {
        tools: {},
      },
      serverInfo: {
        name: "kaizen7-local-bridge",
        version: "0.0.0",
      },
    });
  }

  if (request.method === "tools/list") {
    return result(request.id, { tools: bridgeTools });
  }

  if (request.method === "tools/call") {
    const params = request.params ?? {};
    const name = params.name;
    const args = isObject(params.arguments) ? params.arguments : {};

    if (name === "bridge_status") {
      return result(
        request.id,
        toolContent({
          ok: true,
          protocol: BRIDGE_PROTOCOL_VERSION,
          server: "kaizen7-local-bridge",
          transport: "stdio",
          tools: bridgeTools.map((tool) => tool.name),
          authority: {
            maxAuthorityLevel: 1,
            disabledLevels: [2, 3],
            arbitraryShell: false,
          },
        }),
      );
    }

    if (name === "bridge_submit_mission") {
      const authorized = authorizeMission(args.mission);
      if (!authorized.ok) {
        return result(
          request.id,
          toolContent({
            ok: false,
            errors: authorized.errors,
          }),
        );
      }

      return result(
        request.id,
        toolContent({
          ok: true,
          receipt: state.receipts.submit(authorized.value as Mission, state.clock),
        }),
      );
    }

    if (name === "bridge_get_receipt") {
      if (typeof args.missionId !== "string" || args.missionId === "") {
        return result(request.id, toolContent({ ok: false, errors: ["required_string:missionId"] }));
      }

      const receipt = state.receipts.get(args.missionId);
      return result(
        request.id,
        toolContent(receipt ? { ok: true, receipt } : { ok: false, errors: ["receipt_not_found"] }),
      );
    }

    return error(request.id, -32601, `Unknown tool: ${String(name)}`);
  }

  return error(request.id, -32601, `Unknown method: ${request.method}`);
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
