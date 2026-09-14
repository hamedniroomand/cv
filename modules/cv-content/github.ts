const RAW_GITHUB = 'https://raw.githubusercontent.com';
const API_GITHUB = 'https://api.github.com';
const DEFAULT_TIMEOUT_MS = 5000;

export type GistFetcher = (id: string, file: string) => Promise<string | null>;

export interface GistFetchOptions {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  token?: string;
}

interface GistFile {
  content?: string;
  truncated?: boolean;
}

interface GistPayload {
  files?: Record<string, GistFile | undefined>;
}

/** Returns null for a network error, a timeout, or a response that is not `ok`. */
async function fetchWithTimeout(
  fetchImpl: typeof fetch,
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, { ...init, signal: controller.signal });
    return res.ok ? res : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function nonEmpty(text: string | undefined): string | null {
  return text && text.trim() ? text : null;
}

async function fetchText(
  fetchImpl: typeof fetch,
  url: string,
  timeoutMs: number,
): Promise<string | null> {
  const res = await fetchWithTimeout(fetchImpl, url, {}, timeoutMs);
  if (!res) return null;
  try {
    return nonEmpty(await res.text());
  } catch {
    return null;
  }
}

/**
 * Reads the `llms.txt` of a site. The file lists the tools of the product.
 * The product publishes a new file on every deploy, so the site never shows an old list.
 */
export function fetchLlmsTxt(
  siteUrl: string,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<string | null> {
  return fetchText(fetchImpl, `${siteUrl.replace(/\/+$/, '')}/llms.txt`, timeoutMs);
}

export function fetchGithubReadme(
  repo: string,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<string | null> {
  return fetchText(fetchImpl, `${RAW_GITHUB}/${repo}/HEAD/README.md`, timeoutMs);
}

function gistHeaders(token: string | undefined): HeadersInit {
  const headers: Record<string, string> = { accept: 'application/vnd.github+json' };
  if (token) headers.authorization = `Bearer ${token}`;
  return headers;
}

export async function fetchGist(
  id: string,
  file: string,
  opts: GistFetchOptions = {},
): Promise<string | null> {
  const { fetchImpl = fetch, timeoutMs = DEFAULT_TIMEOUT_MS, token } = opts;
  const res = await fetchWithTimeout(
    fetchImpl,
    `${API_GITHUB}/gists/${id}`,
    { headers: gistHeaders(token) },
    timeoutMs,
  );
  if (!res) return null;
  let payload: GistPayload;
  try {
    payload = (await res.json()) as GistPayload;
  } catch {
    return null;
  }
  const entry = payload.files?.[file];
  if (!entry || entry.truncated) return null;
  return nonEmpty(entry.content);
}
