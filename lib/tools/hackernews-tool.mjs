import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const hackernewsTool = createTool({
  id: "search_hacker_news",
  description: "Fetches the current top trending stories from Hacker News. Useful for getting real-time tech, AI, and developer trends.",
  inputSchema: z.object({
    limit: z.number().optional().default(10).describe("Number of top stories to retrieve (max 30).")
  }),
  execute: async ({ context }) => {
    try {
      const limit = Math.min(context.limit || 10, 30);
      
      // Get top story IDs
      const topUrl = "https://hacker-news.firebaseio.com/v0/topstories.json";
      const topResponse = await fetch(topUrl);
      if (!topResponse.ok) throw new Error("Failed to fetch top stories IDs");
      const topIds = await topResponse.json();
      
      const storyIds = topIds.slice(0, limit);
      
      // Fetch details for each story
      const stories = await Promise.all(storyIds.map(async (id) => {
        const itemUrl = `https://hacker-news.firebaseio.com/v0/item/${id}.json`;
        const itemRes = await fetch(itemUrl);
        return itemRes.json();
      }));

      return {
        stories: stories.map(s => ({
          title: s.title,
          url: s.url,
          score: s.score,
          by: s.by,
          time: new Date(s.time * 1000).toISOString(),
          comments: s.descendants
        }))
      };
    } catch (error) {
      return { error: error.message };
    }
  }
});
