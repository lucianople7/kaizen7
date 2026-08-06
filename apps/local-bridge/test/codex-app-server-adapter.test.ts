import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCodexAppServerLaunch,
  isAllowedRepoStatusCommand,
  repoStatusCommandFromRaw,
  repoStatusCommandExecParams,
  repoStatusMissionPrompt,
} from "../src/codex-app-server-adapter.ts";

describe("Codex app-server repo_status adapter", () => {
  it("allows only the structured read-only git commands for repo_status", () => {
    assert.equal(isAllowedRepoStatusCommand({ cmd: "git", args: ["branch", "--show-current"] }), true);
    assert.equal(isAllowedRepoStatusCommand({ cmd: "git", args: ["rev-parse", "HEAD"] }), true);
    assert.equal(isAllowedRepoStatusCommand({ cmd: "git", args: ["status", "--short", "--branch"] }), true);

    assert.equal(isAllowedRepoStatusCommand({ cmd: "git", args: ["status", "--porcelain=v1"] }), false);
    assert.equal(isAllowedRepoStatusCommand({ cmd: "git", args: ["commit", "--allow-empty", "-m", "x"] }), false);
    assert.equal(isAllowedRepoStatusCommand({ cmd: "powershell.exe", args: ["Get-ChildItem"] }), false);
    assert.equal(isAllowedRepoStatusCommand({ cmd: "bash", args: ["-lc", "git status --short --branch"] }), false);
  });

  it("builds a narrow L0 prompt with the exact command allowlist", () => {
    const prompt = repoStatusMissionPrompt("mission-001");

    assert.match(prompt, /mission-001/);
    assert.match(prompt, /git branch --show-current/);
    assert.match(prompt, /git rev-parse HEAD/);
    assert.match(prompt, /git status --short --branch/);
    assert.doesNotMatch(prompt, /install/i);
    assert.doesNotMatch(prompt, /write/i);
  });

  it("normalizes Codex bash wrappers only when the inner git command is allowed", () => {
    assert.deepEqual(repoStatusCommandFromRaw("/bin/bash -c 'git rev-parse HEAD'"), {
      cmd: "git",
      args: ["rev-parse", "HEAD"],
    });
    assert.equal(isAllowedRepoStatusCommand(repoStatusCommandFromRaw("/bin/bash -c 'git rev-parse HEAD'")!), true);
    assert.equal(repoStatusCommandFromRaw("/bin/bash -lc 'git branch --show-current && git rev-parse HEAD'"), undefined);
  });

  it("launches the isolated normal-user Codex app-server directly on Windows", () => {
    const launch = buildCodexAppServerLaunch({
      codexPath: "C:\\tmp\\kaizen7-toolchains\\codex-cli-0.146.0\\node_modules\\.bin\\codex.cmd",
      codexHome: "C:\\tmp\\kaizen7-toolchains\\codex-home",
      repoPath: "C:\\tmp\\kaizen7-live-bridge",
    });

    assert.equal(launch.command, "C:\\tmp\\kaizen7-toolchains\\codex-cli-0.146.0\\node_modules\\.bin\\codex.cmd");
    assert.deepEqual(launch.args, ["app-server", "--stdio"]);
    assert.equal(launch.options.cwd, "C:\\tmp\\kaizen7-live-bridge");
    const env = launch.options.env ?? {};
    assert.equal(env.CODEX_HOME, "C:\\tmp\\kaizen7-toolchains\\codex-home");
    assert.match(env.Path ?? env.PATH ?? "", /^C:\\tmp\\kaizen7-toolchains\\codex-cli-0\.146\.0\\node_modules\\\.bin/);
  });

  it("builds read-only app-server command/exec params for allowlisted repo_status commands", () => {
    assert.deepEqual(repoStatusCommandExecParams(
      "C:\\tmp\\kaizen7-live-bridge",
      { cmd: "git", args: ["rev-parse", "HEAD"] },
    ), {
      command: ["git", "rev-parse", "HEAD"],
      cwd: "C:\\tmp\\kaizen7-live-bridge",
      timeoutMs: 30_000,
      outputBytesCap: 20_000,
      sandboxPolicy: { type: "readOnly", networkAccess: false },
    });

    assert.throws(() => repoStatusCommandExecParams(
      "C:\\tmp\\kaizen7-live-bridge",
      { cmd: "git", args: ["commit", "--allow-empty"] },
    ), /command_not_allowed/);
  });
});
