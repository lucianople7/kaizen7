import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import path from "node:path";
import { describe, it } from "node:test";
import { encodeMessage } from "../src/stdio.ts";

const root = path.resolve(import.meta.dirname, "..", "..", "..");
const tsxCli = path.join(root, "node_modules", "tsx", "dist", "cli.mjs");
const serverEntry = path.join(root, "apps", "local-bridge", "src", "index.ts");

describe("KAIZEN7 local MCP stdio transport", () => {
  it("answers MCP initialize over stdio framing", async () => {
    const child = spawn(process.execPath, [tsxCli, serverEntry], {
      cwd: root,
      stdio: ["pipe", "pipe", "pipe"],
    });

    const chunks: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => chunks.push(chunk));
    child.stdin.write(
      encodeMessage({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {},
      }),
    );

    await waitFor(() => Buffer.concat(chunks).includes(Buffer.from("\r\n\r\n")));
    child.kill();
    await once(child, "exit");

    const raw = Buffer.concat(chunks).toString("utf8");
    const body = raw.slice(raw.indexOf("\r\n\r\n") + 4);
    const response = JSON.parse(body);
    assert.equal(response.result.serverInfo.name, "kaizen7-local-bridge");
  });
});

async function waitFor(predicate: () => boolean): Promise<void> {
  const started = Date.now();
  while (!predicate()) {
    if (Date.now() - started > 5000) {
      throw new Error("Timed out waiting for stdio response");
    }
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}
