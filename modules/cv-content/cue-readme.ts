/** Fetch a repo's README from GitHub. Returns null on any failure so the build falls back to committed copy. */
export async function fetchGithubReadme(repo: string, fetchImpl: typeof fetch = fetch, timeoutMs = 5000): Promise<string | null> {
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), timeoutMs)
  try {
    const res = await fetchImpl(`https://raw.githubusercontent.com/${repo}/HEAD/README.md`, { signal: ac.signal })
    if (!res.ok)
      return null
    const text = await res.text()
    return text.trim() ? text : null
  }
  catch {
    return null
  }
  finally {
    clearTimeout(timer)
  }
}
