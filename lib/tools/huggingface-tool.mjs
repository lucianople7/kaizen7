import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Import the legacy adapter logic using CommonJS require
const { fetchHuggingFaceSignal } = require("../huggingface-adapter.js");

export const huggingfaceTool = createTool({
  id: "analyze_huggingface_repo",
  description: "Analyzes and scores a HuggingFace repository (model, dataset, space) to determine if it should be adopted into KAIZEN7.",
  inputSchema: z.object({
    repoUrl: z.string().describe("The URL or owner/repo string of the HuggingFace asset")
  }),
  execute: async ({ context }) => {
    try {
      const result = await fetchHuggingFaceSignal(context.repoUrl, {
        token: process.env.HF_TOKEN
      });
      return result;
    } catch (error) {
      return { error: error.message };
    }
  }
});
