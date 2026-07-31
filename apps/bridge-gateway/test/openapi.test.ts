import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { actionBridgeOpenApi } from "../src/openapi.ts";

describe("KAIZEN7 Action Bridge OpenAPI schema", () => {
  it("exposes only the approved GPT Action public endpoints", () => {
    assert.equal(actionBridgeOpenApi.openapi, "3.1.0");
    assert.deepEqual(Object.keys(actionBridgeOpenApi.paths).sort(), [
      "/v1/missions",
      "/v1/missions/{id}",
      "/v1/receipts/{id}",
      "/v1/repo-status",
      "/v1/status",
    ]);
  });

  it("uses bearer authentication and never documents mini-PC polling internals", () => {
    assert.equal(actionBridgeOpenApi.components.securitySchemes.ActionBearer.type, "http");
    assert.equal(actionBridgeOpenApi.components.securitySchemes.ActionBearer.scheme, "bearer");
    assert.equal(JSON.stringify(actionBridgeOpenApi).includes("/v1/agent/"), false);
  });

  it("documents a simple Work Chat repo_status action without exposing mission internals", () => {
    const repoStatus = actionBridgeOpenApi.paths["/v1/repo-status"].post;

    assert.equal(repoStatus.operationId, "request_repo_status");
    assert.equal(
      repoStatus.requestBody.content["application/json"].schema.$ref,
      "#/components/schemas/RepoStatusRequest",
    );
    assert.deepEqual(actionBridgeOpenApi.components.schemas.RepoStatusRequest.required, ["idempotencyKey"]);
    assert.equal(
      actionBridgeOpenApi.paths["/v1/missions/{id}"].get.operationId,
      "bridge_get_mission_status",
    );
    assert.deepEqual(actionBridgeOpenApi.components.schemas.QueuedMission.required, [
      "ok",
      "missionId",
      "duplicate",
      "missionPath",
      "receiptPath",
      "nextAction",
    ]);
  });
});
