import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { authorizeActionMission } from "../src/authority.ts";
import { makeMission } from "./support/fixtures.ts";

describe("Action Bridge typed operations", () => {
  it("allows only repo.status for the first L0 Action Bridge vertical", () => {
    const allowed = authorizeActionMission(makeMission({
      requestedOperation: { kind: "repo.status", repository: "kaizen7" },
      requestedAuthority: 0,
    }));
    const shell = authorizeActionMission(makeMission({
      requestedOperation: { kind: "shell", command: "npm test" } as never,
      requestedAuthority: 0,
    }));
    const commit = authorizeActionMission(makeMission({
      requestedOperation: { kind: "git.commit", repository: "kaizen7", files: ["README.md"], message: "commit" },
      requestedAuthority: 0,
    }));

    assert.equal(allowed.ok, true);
    assert.equal(shell.ok, false);
    assert.match(shell.ok ? "" : shell.errors.join("\n"), /unsupported_operation/);
    assert.equal(commit.ok, false);
    assert.match(commit.ok ? "" : commit.errors.join("\n"), /unauthorized:git_commit_deferred/);
  });
});
