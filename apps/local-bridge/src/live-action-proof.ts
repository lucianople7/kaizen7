import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { pollActionBridgeOnce } from "./action-consumer.ts";
import { CodexAppServerAdapter } from "./codex-app-server-adapter.ts";

const baseUrl = process.env.K7_ACTION_BRIDGE_URL ?? "http://127.0.0.1:8787";
const actionToken = process.env.K7_ACTION_BRIDGE_TOKEN ?? "local-action-token";
const agentToken = process.env.K7_ACTION_AGENT_TOKEN ?? "local-agent-token";
const deviceId = process.env.K7_DEVICE_ID ?? "mini-pc-001";
const codexPath = process.env.K7_CODEX_PATH ?? "C:\\tmp\\kaizen7-toolchains\\codex-cli-0.146.0\\node_modules\\.bin\\codex.cmd";
const codexHome = process.env.K7_CODEX_HOME ?? "C:\\tmp\\kaizen7-toolchains\\codex-cli-0.146.0\\home";
const repoPath = process.env.K7_REPO_PATH ?? "C:\\tmp\\kaizen7-live-bridge";
const idempotencyKey = `idem-live-${Date.now()}`;
const repository = "kaizen7";

function git(args: string[]): string {
  return execFileSync("git", ["-C", repoPath, ...args], { encoding: "utf8" }).trim();
}

async function action(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${actionToken}`,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

async function main(): Promise<void> {
  const before = {
    branch: git(["branch", "--show-current"]),
    head: git(["rev-parse", "HEAD"]),
    status: git(["status", "--short", "--branch"]),
  };

  const submitted = await action("/v1/repo-status", {
    method: "POST",
    body: JSON.stringify({
      idempotencyKey,
      requestedBy: "lucianople7",
      correlationId: "chat-live-proof",
      repository,
      targetDeviceId: deviceId,
      objective: "Return repository branch, HEAD and status for the KAIZEN7 live bridge repository.",
    }),
  });
  assert.equal(submitted.status, 202);
  const submittedBody = await submitted.json() as { missionId: string };
  const missionId = submittedBody.missionId;

  const duplicate = await action("/v1/repo-status", {
    method: "POST",
    body: JSON.stringify({ idempotencyKey, requestedBy: "lucianople7", correlationId: "chat-live-proof", repository }),
  });
  assert.equal(duplicate.status, 200);
  assert.equal((await duplicate.json() as any).missionId, missionId);

  const consumed = await pollActionBridgeOnce({
    baseUrl,
    agentToken,
    deviceId,
    executor: new CodexAppServerAdapter({
      codexPath,
      codexHome,
      repoPath,
      timeoutMs: 180_000,
    }),
  });
  if (consumed.status !== "completed") {
    console.error(JSON.stringify({
      consumedStatus: consumed.status,
      errors: consumed.status === "rejected" ? consumed.errors : [],
    }, null, 2));
  }
  assert.equal(consumed.status, "completed");

  const receiptResponse = await action(`/v1/receipts/${missionId}`);
  assert.equal(receiptResponse.status, 200);
  const receipt = (await receiptResponse.json() as any).receipt;

  const after = {
    branch: git(["branch", "--show-current"]),
    head: git(["rev-parse", "HEAD"]),
    status: git(["status", "--short", "--branch"]),
  };
  const proof = {
    missionId,
    repository,
    repoPath: "[redacted-local-repo-path]",
    branch: receipt.branch,
    head: receipt.commits[0],
    clean: receipt.repoStatus.clean,
    status: receipt.repoStatus.shortStatus,
    codexTurn: receipt.codexTurn,
    before,
    after,
  };
  console.log(JSON.stringify({ proof }, null, 2));

  assert.deepEqual(after, before);
  assert.equal(receipt.missionId, missionId);
  assert.equal(receipt.branch, before.branch);
  assert.equal(receipt.commits[0], before.head);
  assert.equal(receipt.repoStatus.shortStatus, before.status);
  assert.equal(receipt.repoStatus.clean, before.status.split(/\r?\n/).every((line) => line.startsWith("##") || line.trim() === ""));
  assert.equal(typeof receipt.codexTurn.threadId, "string");
  assert.equal(typeof receipt.codexTurn.turnId, "string");
  assert.equal(receipt.codexTurn.commands.length >= 3, true);

  const secondPoll = await pollActionBridgeOnce({
    baseUrl,
    agentToken,
    deviceId,
    executor: new CodexAppServerAdapter({ codexPath, codexHome, repoPath, timeoutMs: 30_000 }),
  });
  assert.equal(secondPoll.status, "idle");

  console.log(JSON.stringify({
    ok: true,
    ...proof,
    idempotency: "duplicate mission reused original mission id and second poll was idle",
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
