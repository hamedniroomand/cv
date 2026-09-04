import type { CvData } from '#shared/schemas/cv'

/** Page-level meta and JSON-LD for the resume. */
export function useResumeSeo(cv: CvData, opts: { title?: string, description?: string, path?: string } = {}) {
  const siteUrl = useRuntimeConfig().public.siteUrl
  const { profile } = cv
  const title = opts.title ?? `${profile.name} — ${profile.title}`
  const description = opts.description ?? profile.description
  const url = `${siteUrl}${opts.path ?? '/'}`

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: 'profile',
    ogUrl: url,
    ogSiteName: profile.name,
  })

  useHead({
    link: [{ rel: 'canonical', href: url }],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Person',
          'name': profile.name,
          'jobTitle': profile.title,
          'url': siteUrl,
          'email': profile.links.email.includes('@') ? `mailto:${profile.links.email}` : undefined,
          'sameAs': [`https://github.com/${profile.links.github}`, profile.links.linkedin].filter(l => l.startsWith('http')),
          'address': { '@type': 'PostalAddress', 'addressLocality': profile.location.city, 'addressCountry': profile.location.country },
          'knowsLanguage': profile.languages.map(l => l.name),
          'worksFor': cv.experience[0] ? { '@type': 'Organization', 'name': cv.experience[0].company } : undefined,
        }),
      },
    ],
  })
}
