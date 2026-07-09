import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Import the legacy adapter logic using CommonJS require
const { fetchGitHubRepoSignal } = require("../github-adapter.js");

export const githubTool = createTool({
  id: "analyze_github_repo",
  description: "Analyzes and scores a GitHub repository to determine if it should be adopted into KAIZEN7.",
  inputSchema: z.object({
    repoUrl: z.string().describe("The URL or owner/repo string of the GitHub repository")
  }),
  execute: async ({ context }) => {
    try {
      const result = await fetchGitHubRepoSignal(context.repoUrl, {
        token: process.env.GITHUB_TOKEN
      });
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
});
