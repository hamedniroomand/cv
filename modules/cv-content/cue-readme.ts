const RAW_GITHUB = 'https://raw.githubusercontent.com'

export async function fetchGithubReadme(repo: string, fetchImpl: typeof fetch = fetch, timeoutMs = 5000): Promise<string | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetchImpl(`${RAW_GITHUB}/${repo}/HEAD/README.md`, { signal: controller.signal })
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
