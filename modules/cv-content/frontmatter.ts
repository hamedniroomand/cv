export interface Frontmatter {
  data: Record<string, unknown>
  body: string
}

const FM = /^---\r?\n([\s\S]*?)^---\r?\n?/m

/** Split `---\nyaml\n---\nbody`. Files without frontmatter return empty data. */
export function parseFrontmatter(src: string): Frontmatter {
  const m = FM.exec(src)
  if (!m || m.index !== 0)
    return { data: {}, body: src.trim() }
  const yaml = m[1]!.trim()
  const parsed: unknown = yaml ? Bun.YAML.parse(yaml) : {}
  const data = parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {}
  return { data, body: src.slice(m[0].length).trim() }
}
