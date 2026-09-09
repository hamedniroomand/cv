import { z } from 'zod';

/** One tool that a lab publishes. */
export interface CatalogTool {
  name: string;
  path: string;
  description: string;
}

/** A group of related tools. */
export interface CatalogLab {
  name: string;
  tools: CatalogTool[];
}

export interface ToolCatalog {
  labs: CatalogLab[];
  total: number;
}

const HEADING = /^##\s+(.+?)\s*$/;
const TOOL = /^-\s+\[(.+?)]\((.+?)\):\s*(.+?)\s*$/;

/**
 * Reads an `llms.txt` file, which lists the tools of a product under one heading for each group.
 * A heading with no tools under it is not a lab, so the reader drops it.
 */
export function parseToolCatalog(content: string): ToolCatalog {
  const labs: CatalogLab[] = [];
  let current: CatalogLab | undefined;

  for (const line of content.split('\n')) {
    const heading = HEADING.exec(line);
    if (heading) {
      current = { name: heading[1]!, tools: [] };
      labs.push(current);
      continue;
    }
    const tool = TOOL.exec(line);
    if (tool && current)
      current.tools.push({ name: tool[1]!, path: tool[2]!, description: tool[3]! });
  }

  const withTools = labs.filter(lab => lab.tools.length > 0);
  return {
    labs: withTools,
    total: withTools.reduce((count, lab) => count + lab.tools.length, 0),
  };
}

export const ToolCatalogSchema = z.object({
  labs: z.array(
    z.object({
      name: z.string().min(1),
      tools: z.array(z.object({ name: z.string(), path: z.string(), description: z.string() })),
    }),
  ),
  total: z.number().int().nonnegative(),
});
