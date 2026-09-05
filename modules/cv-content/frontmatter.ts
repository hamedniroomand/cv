/// <reference types="bun" />
export interface Frontmatter {
  data: Record<string, unknown>;
  body: string;
}

const FRONTMATTER = /^---\r?\n([\s\S]*?)^---\r?\n?/m;

function parseYaml(yaml: string): Record<string, unknown> {
  const parsed: unknown = yaml ? Bun.YAML.parse(yaml) : {};
  return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
}

export function parseFrontmatter(src: string): Frontmatter {
  const match = FRONTMATTER.exec(src);
  if (!match || match.index !== 0) return { data: {}, body: src.trim() };
  return { data: parseYaml(match[1]!.trim()), body: src.slice(match[0].length).trim() };
}
