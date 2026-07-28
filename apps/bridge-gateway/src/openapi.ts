export const actionBridgeOpenApi = {
  openapi: "3.1.0",
  info: {
    title: "KAIZEN7 Action Bridge",
    version: "0.0.0",
    description: "Private GPT Action surface for typed KAIZEN7 missions, receipts and status.",
  },
  servers: [
    {
      url: "https://kaizen7-action-bridge.example.com",
      description: "Replace with the approved Cloudflare Worker URL after deployment approval.",
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
    },
  },
} as const;
