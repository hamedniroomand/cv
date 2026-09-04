/** Production domain; used when the configured site URL is missing or malformed. */
export const DEFAULT_SITE_HOST = 'niroomand.dev'

/** Hostname shown in prompts (`hamed@<host>:~$`), derived from `NUXT_PUBLIC_SITE_URL`. */
export function siteHost(siteUrl: string): string {
  try {
    return new URL(siteUrl).hostname
  }
  catch {
    return DEFAULT_SITE_HOST
  }
}
