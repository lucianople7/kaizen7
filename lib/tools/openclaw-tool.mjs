import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { execFile } from "child_process";
import { promisify } from "util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Resolve openclaw's own entry script and invoke it directly with node,
// instead of "npx openclaw ... " with shell:true. Node's own docs warn that
// shell:true only concatenates argv, it does not escape it -- a multi-word
// directive containing spaces or shell metacharacters was not safely passed
// through (confirmed empirically: it broke on a simple 4-word directive).
// Calling the script directly with shell:false passes argv to the OS with no
// shell involved at all, so there is nothing to inject into.
const require = createRequire(import.meta.url);
// openclaw's package.json has no "./package.json" export, so resolve its main
// entry instead and walk up to the package root to find the bin script.
const OPENCLAW_PKG_ROOT = path.dirname(path.dirname(require.resolve("openclaw")));
const OPENCLAW_BIN = path.join(OPENCLAW_PKG_ROOT, "openclaw.mjs");

export const openclawTool = createTool({
  id: "execute_openclaw",
  description: "Delegates complex, multi-step actions to the OpenClaw AI employee. Use this when you need to execute system tasks, move files, handle APIs, or perform browser automation on the local machine.",
  inputSchema: z.object({
    directive: z.string().describe("The specific instruction or objective to pass to OpenClaw. Provide as much context as possible.")
  }),
  // OpenClaw runs as its own agentic subprocess and can take minutes; dispatch
  // it as a background task so the kernel keeps responding while it works.
  background: {
    enabled: true,
    timeoutMs: 600_000,
    maxRetries: 1,
  },
  execute: async ({ context }) => {
    try {
      // Invoke the script directly with node, shell:false. No shell is
      // involved at all, so there is no string to escape and nothing for
      // model-generated content to break out of.
      const { stdout, stderr } = await execFileAsync(
        process.execPath,
        [OPENCLAW_BIN, "agent", "--message", context.directive],
        { shell: false },
      );
      return {
        success: true,
        stdout: stdout.trim(),
        stderr: stderr.trim()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stdout: error.stdout ? error.stdout.toString() : "",
        stderr: error.stderr ? error.stderr.toString() : ""
      };
    }
  }
});
