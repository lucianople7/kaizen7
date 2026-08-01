export const actionBridgeOpenApi = {
  openapi: "3.1.0",
  info: {
    title: "KAIZEN7 Action Bridge",
    version: "0.0.0",
    description: "Private GPT Action surface for typed KAIZEN7 missions, receipts and status.",
  },
  servers: [
    {
      url: "https://kaizen7-action-bridge.lucianople7.workers.dev",
      description: "Production Cloudflare Worker for the private KAIZEN7 Work GPT Action Bridge.",
    },
  ],
  security: [{ ActionBearer: [] }],
  paths: {
    "/v1/status": {
      get: {
        operationId: "bridge_status",
        summary: "Read KAIZEN7 Action Bridge status.",
        responses: {
          "200": {
            description: "Bridge status",
          },
        },
      },
    },
    "/v1/missions": {
      post: {
        operationId: "bridge_submit_mission",
        summary: "Submit a typed KAIZEN7 mission for outbound mini-PC pickup.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
                required: ["mission"],
                properties: {
                  mission: { $ref: "#/components/schemas/Mission" },
                },
              },
            },
          },
        },
        responses: {
          "202": { description: "Mission queued" },
          "200": { description: "Duplicate idempotency key returned existing mission" },
          "400": { description: "Malformed mission" },
          "403": { description: "Mission exceeds authorized scope" },
        },
      },
    },
    "/v1/missions/{id}": {
      get: {
        operationId: "bridge_get_mission_status",
        summary: "Read queued, claimed or completed mission status while waiting for a receipt.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Mission status found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MissionStatus" },
              },
            },
          },
          "404": { description: "Mission not found" },
        },
      },
    },
    "/v1/repo-status": {
      post: {
        operationId: "request_repo_status",
        summary: "Ask the mini-PC Codex runner for a read-only Git repo status receipt.",
        description:
          "Primary Work Chat walkie-talkie action. Queues one L0 repo_status mission with generated technical fields and returns a receipt path to poll.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RepoStatusRequest" },
            },
          },
        },
        responses: {
          "202": { description: "repo_status mission queued" },
          "200": { description: "Duplicate idempotency key returned existing mission" },
          "400": { description: "Malformed repo_status request" },
        },
      },
    },
    "/v1/receipts/{id}": {
      get: {
        operationId: "bridge_get_receipt",
        summary: "Read a typed KAIZEN7 receipt by mission id.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": { description: "Receipt found" },
          "404": { description: "Receipt not found" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      ActionBearer: {
        type: "http",
        scheme: "bearer",
      },
    },
    schemas: {
      Mission: {
        type: "object",
        additionalProperties: false,
        required: [
          "protocol",
          "missionId",
          "operation",
          "idempotencyKey",
          "createdAt",
          "expiresAt",
          "requestedBy",
          "targetDeviceId",
          "repository",
          "objective",
          "acceptanceChecks",
          "constraints",
          "requestedAuthority",
          "correlationId",
          "signature",
        ],
        properties: {
          protocol: { type: "string", const: "kaizen7.bridge.v1" },
          missionId: { type: "string" },
          operation: { type: "string", const: "repo_status" },
          idempotencyKey: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          expiresAt: { type: "string", format: "date-time" },
          requestedBy: {
            type: "object",
            additionalProperties: false,
            required: ["login"],
            properties: { login: { type: "string" } },
          },
          targetDeviceId: { type: "string" },
          repository: { type: "string", enum: ["kaizen7", "thefocux-platform", "flowmatik-studio"] },
          objective: { type: "string" },
          acceptanceChecks: { type: "array", items: { type: "string" } },
          constraints: { type: "array", items: { type: "string" } },
          requestedAuthority: { type: "integer", enum: [0, 1] },
          codexThreadId: { type: "string" },
          correlationId: { type: "string" },
          signature: { type: "string" },
        },
      },
      RepoStatusRequest: {
        type: "object",
        additionalProperties: false,
        required: ["idempotencyKey"],
        properties: {
          idempotencyKey: {
            type: "string",
            description: "Stable unique key from the Work Chat turn. Reusing it returns the same queued mission.",
          },
          repository: {
            type: "string",
            enum: ["kaizen7", "thefocux-platform", "flowmatik-studio"],
            default: "kaizen7",
          },
          targetDeviceId: {
            type: "string",
            description: "Optional mini-PC device id. Omit to use the gateway default.",
          },
          requestedBy: {
            type: "string",
            description: "Human or GPT identity requesting the status.",
            default: "kaizen7-work-chat",
          },
          correlationId: {
            type: "string",
            description: "Optional Work Chat message/thread id for cross-reference.",
          },
          objective: {
            type: "string",
            description: "Optional short reason shown to the local runner.",
          },
        },
      },
      QueuedMission: {
        type: "object",
        additionalProperties: false,
        required: ["ok", "missionId", "duplicate", "missionPath", "receiptPath", "nextAction"],
        properties: {
          ok: { type: "boolean", const: true },
          missionId: { type: "string" },
          duplicate: { type: "boolean" },
          missionPath: { type: "string" },
          receiptPath: { type: "string" },
          nextAction: { type: "string" },
        },
      },
      MissionStatus: {
        type: "object",
        additionalProperties: false,
        required: [
          "ok",
          "missionId",
          "operation",
          "repository",
          "state",
          "requestedBy",
          "targetDeviceId",
          "correlationId",
          "createdAt",
          "hasReceipt",
          "receiptPath",
          "nextAction",
        ],
        properties: {
          ok: { type: "boolean", const: true },
          missionId: { type: "string" },
          operation: { type: "string", const: "repo_status" },
          repository: { type: "string", enum: ["kaizen7", "thefocux-platform", "flowmatik-studio"] },
          state: { type: "string", enum: ["queued", "claimed", "completed"] },
          requestedBy: { type: "string" },
          targetDeviceId: { type: "string" },
          correlationId: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          claimedAt: { type: "string", format: "date-time" },
          leaseExpiresAt: { type: "string", format: "date-time" },
          hasReceipt: { type: "boolean" },
          receiptPath: { type: "string" },
          nextAction: { type: "string" },
        },
      },
    },
  },
} as const;
