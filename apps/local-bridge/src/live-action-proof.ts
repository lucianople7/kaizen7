import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { BRIDGE_PROTOCOL_VERSION } from "../../../packages/bridge-protocol/src/index.ts";
import { pollActionBridgeOnce } from "./action-consumer.ts";
import { CodexAppServerAdapter } from "./codex-app-server-adapter.ts";

const baseUrl = process.env.K7_ACTION_BRIDGE_URL ?? "http://127.0.0.1:8787";
const actionToken = process.env.K7_ACTION_BRIDGE_TOKEN ?? "local-action-token";
const agentToken = process.env.K7_ACTION_AGENT_TOKEN ?? "local-agent-token";
const deviceId = process.env.K7_DEVICE_ID ?? "mini-pc-001";
const distro = process.env.K7_WSL_DISTRO ?? "Ubuntu";
const codexPath = process.env.K7_WSL_CODEX_PATH ?? "/home/luciawsl/codex-bridge-test-home/bin/codex";
const codexHome = process.env.K7_WSL_CODEX_HOME ?? "/home/luciawsl/codex-bridge-test-home/home";
const repoPath = process.env.K7_WSL_TEST_REPO ?? `/home/luciawsl/codex-bridge-test-home/live-proof-repo-${Date.now()}`;

const mission = {
  protocol: BRIDGE_PROTOCOL_VERSION,
  missionId: `mission-live-${Date.now()}`,
  operation: "repo_status",
  idempotencyKey: `idem-live-${Date.now()}`,
  createdAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
  requestedBy: { login: "lucianople7" },
  targetDeviceId: deviceId,
  repository: "kaizen7",
  objective: "Return repository branch, HEAD and status for the WSL proof repository.",
  acceptanceChecks: ["Receipt includes branch, HEAD, status, mission id and Codex turn evidence."],
  constraints: ["Read-only repository inspection.", "No arbitrary shell."],
  requestedAuthority: 0,
  correlationId: "chat-live-proof",
  signature: "local-dev-signed-envelope",
};

function wsl(args: string[]): string {
  return execFileSync("wsl.exe", ["-d", distro, "--", ...args], { encoding: "utf8" }).trim();
}

function git(args: string[]): string {
  return wsl(["git", "-C", repoPath, ...args]);
}

function ensureProofRepo(): void {
  wsl(["mkdir", "-p", repoPath]);
  wsl(["git", "-C", repoPath, "init", "-b", "main"]);
  wsl(["git", "-C", repoPath, "config", "user.email", "kaizen7-local@example.invalid"]);
  wsl(["git", "-C", repoPath, "config", "user.name", "KAIZEN7 Local Proof"]);
  try {
    git(["rev-parse", "HEAD"]);
  } catch {
    git(["commit", "--allow-empty", "-m", "initial live bridge proof"]);
  }
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
  ensureProofRepo();
  const before = {
    branch: git(["branch", "--show-current"]),
    head: git(["rev-parse", "HEAD"]),
    status: git(["status", "--short", "--branch"]),
  };

  const submitted = await action("/v1/missions", {
    method: "POST",
    body: JSON.stringify({ mission }),
  });
  assert.equal(submitted.status, 202);

  const duplicate = await action("/v1/missions", {
    method: "POST",
    body: JSON.stringify({ mission: { ...mission, missionId: `${mission.missionId}-duplicate` } }),
  });
  assert.equal(duplicate.status, 200);
  assert.equal((await duplicate.json() as any).missionId, mission.missionId);

  const consumed = await pollActionBridgeOnce({
    baseUrl,
    agentToken,
    deviceId,
    executor: new CodexAppServerAdapter({
      codexPath,
      codexHome,
      distro,
      repoPath,
      timeoutMs: 180_000,
    }),
  });
  assert.equal(consumed.status, "completed");

  const receiptResponse = await action(`/v1/receipts/${mission.missionId}`);
  assert.equal(receiptResponse.status, 200);
  const receipt = (await receiptResponse.json() as any).receipt;

  const after = {
    branch: git(["branch", "--show-current"]),
    head: git(["rev-parse", "HEAD"]),
    status: git(["status", "--short", "--branch"]),
  };
  assert.deepEqual(after, before);
  assert.equal(receipt.missionId, mission.missionId);
  assert.equal(receipt.branch, before.branch);
  assert.equal(receipt.commits[0], before.head);
  assert.equal(receipt.repoStatus.shortStatus, before.status);
  assert.equal(receipt.repoStatus.clean, true);
  assert.equal(typeof receipt.codexTurn.threadId, "string");
  assert.equal(typeof receipt.codexTurn.turnId, "string");
  assert.equal(receipt.codexTurn.commands.length >= 3, true);

  const secondPoll = await pollActionBridgeOnce({
    baseUrl,
    agentToken,
    deviceId,
    executor: new CodexAppServerAdapter({ codexPath, codexHome, distro, repoPath, timeoutMs: 30_000 }),
  });
  assert.equal(secondPoll.status, "idle");

  console.log(JSON.stringify({
    ok: true,
    missionId: mission.missionId,
    repository: mission.repository,
    proofRepo: repoPath,
    branch: receipt.branch,
    head: receipt.commits[0],
    clean: receipt.repoStatus.clean,
    status: receipt.repoStatus.shortStatus,
    codexTurn: receipt.codexTurn,
    before,
    after,
    idempotency: "duplicate mission reused original mission id and second poll was idle",
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
