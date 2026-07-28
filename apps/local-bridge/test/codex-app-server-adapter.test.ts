import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isAllowedRepoStatusCommand,
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
});
