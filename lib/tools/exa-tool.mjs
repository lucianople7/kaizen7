import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const exaTool = createTool({
  id: "search_exa_web",
  description: "Performs a neural/semantic web search using Exa.ai. Use this to find highly relevant content, papers, repositories, or articles based on meaning rather than exact keywords.",
  inputSchema: z.object({
    query: z.string().describe("The semantic search query in natural language."),
    numResults: z.number().optional().default(3).describe("Number of results to return (max 10).")
  }),
  execute: async ({ context }) => {
    const apiKey = process.env.EXA_API_KEY;
    if (!apiKey) {
      return { error: "EXA_API_KEY environment variable is missing. The user must provide it." };
    }

    try {
      const response = await fetch("https://api.exa.ai/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey
        },
        body: JSON.stringify({
          query: context.query,
          numResults: context.numResults,
          contents: { text: { maxCharacters: 1000 } }
        })
      });

      if (!response.ok) {
        return { error: `Exa API Error: ${response.statusText}` };
      }

      const data = await response.json();
      return {
        results: data.results?.map(r => ({
          title: r.title,
          url: r.url,
          author: r.author,
          publishedDate: r.publishedDate,
          text: r.text
        })) || []
      };
    } catch (error) {
      return { error: error.message };
    }
  }
});
