import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Anclado a este archivo, no a process.cwd(): esta tool se carga tanto desde
// kaizen7/ como desde thefocuxOS/ (via Next.js API routes que importan el
// kernel), y process.cwd() apuntaria al directorio equivocado en ese caso.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const KAIZEN7_ROOT = path.join(__dirname, "..", "..");

async function walkDir(dir) {
  let results = [];
  const list = await fs.readdir(dir, { withFileTypes: true });
  for (const dirent of list) {
    const res = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      results = results.concat(await walkDir(res));
    } else {
      if (res.endsWith(".md") || res.endsWith(".json")) {
        results.push(res);
      }
    }
  }
  return results;
}

export const obsidianSearchTool = createTool({
  id: "search_obsidian_vault",
  description: "Searches the internal Obsidian memory vault for THE FOCUX OS. Use this to remember canon, architecture, SOPs, or any project lore. Searches across all local markdown and JSON files.",
  inputSchema: z.object({
    keyword: z.string().describe("The exact keyword or phrase to search for inside the vault.")
  }),
  execute: async ({ context }) => {
    try {
      const keyword = context.keyword.toLowerCase();
      const vaultPath = path.resolve(KAIZEN7_ROOT, "Obsidian");
      
      const files = await walkDir(vaultPath).catch(() => []);
      const matches = [];

      for (const file of files) {
        const content = await fs.readFile(file, "utf8");
        const lowerContent = content.toLowerCase();
        
        const index = lowerContent.indexOf(keyword);
        if (index !== -1) {
          // Extract a snippet around the keyword
          const start = Math.max(0, index - 100);
          const end = Math.min(content.length, index + 100 + keyword.length);
          let snippet = content.substring(start, end).replace(/\n/g, " ").trim();
          
          if (start > 0) snippet = "..." + snippet;
          if (end < content.length) snippet = snippet + "...";

          matches.push({
            file: path.relative(vaultPath, file),
            snippet
          });
          
          if (matches.length >= 10) break; // Limit to 10 files to save context
        }
      }

      if (matches.length === 0) {
        return { message: `No memory found in the Obsidian vault for: ${context.keyword}` };
      }

      return { matches };
    } catch (error) {
      return { error: error.message };
    }
  }
});
