import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const arxivTool = createTool({
  id: "search_arxiv_papers",
  description: "Searches the ArXiv database for scientific papers, preprints, and research regarding AI, ML, Agents, etc.",
  inputSchema: z.object({
    query: z.string().describe("The search query (e.g. 'multi-agent systems', 'LLM orchestration')."),
    maxResults: z.number().optional().default(3).describe("Number of papers to retrieve.")
  }),
  execute: async ({ context }) => {
    try {
      // Encode query properly
      const queryEncoded = encodeURIComponent(context.query);
      const url = `http://export.arxiv.org/api/query?search_query=all:${queryEncoded}&start=0&max_results=${context.maxResults}&sortBy=submittedDate&sortOrder=descending`;
      
      const response = await fetch(url);
      if (!response.ok) {
        return { error: `ArXiv API Error: ${response.statusText}` };
      }

      const xmlText = await response.text();
      
      // Extremely lightweight regex parser to avoid installing xml2js
      const entries = [];
      const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
      let match;
      
      while ((match = entryRegex.exec(xmlText)) !== null) {
        const entryStr = match[1];
        
        const titleMatch = entryStr.match(/<title>([\s\S]*?)<\/title>/);
        const summaryMatch = entryStr.match(/<summary>([\s\S]*?)<\/summary>/);
        const publishedMatch = entryStr.match(/<published>([\s\S]*?)<\/published>/);
        const idMatch = entryStr.match(/<id>([\s\S]*?)<\/id>/);
        
        entries.push({
          id: idMatch ? idMatch[1].trim() : "",
          title: titleMatch ? titleMatch[1].replace(/\n/g, " ").trim() : "",
          summary: summaryMatch ? summaryMatch[1].trim() : "",
          published: publishedMatch ? publishedMatch[1].trim() : ""
        });
      }

      return { papers: entries };
    } catch (error) {
      return { error: error.message };
    }
  }
});
