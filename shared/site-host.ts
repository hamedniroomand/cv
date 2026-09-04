export const DEFAULT_SITE_HOST = 'niroomand.dev'

export function siteHost(siteUrl: string): string {
  try {
    return new URL(siteUrl).hostname
  }
  catch {
    return DEFAULT_SITE_HOST
  }
}
