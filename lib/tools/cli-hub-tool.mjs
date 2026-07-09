import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export const cliHubTool = createTool({
  id: "execute_cli_hub",
  description: "Executes a cli-hub subcommand to interact with local software. Example: args ['launch', 'blender', '--json', 'scene', 'new']",
  inputSchema: z.object({
    args: z.array(z.string()).describe(
      "The cli-hub subcommand and its arguments as separate array items (do not include 'cli-hub' itself, and do not pass a single shell-command string)."
    ),
  }),
  execute: async ({ context }) => {
    try {
      // Structured argv, shell:false: there is no shell string to parse or
      // escape, so there is nothing for model-generated content to inject
      // into (the previous version accepted a free-form "command" string
      // run through exec(), which a "startsWith('cli-hub')" check does not
      // actually make safe -- e.g. "cli-hub x; rm -rf /" passes that check).
      const { stdout, stderr } = await execFileAsync("cli-hub", context.args, { shell: false });
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
