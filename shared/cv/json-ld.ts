import type { CvData } from '../schemas/cv'
import { githubUrl, mailtoUrl } from './links'

export function personJsonLd(cv: CvData, siteUrl: string): Record<string, unknown> {
  const { profile } = cv
  const current = cv.experience[0]
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    'name': profile.name,
    'jobTitle': profile.title,
    'url': siteUrl,
    'email': profile.links.email.includes('@') ? mailtoUrl(profile.links.email) : undefined,
    'sameAs': [githubUrl(profile.links.github), profile.links.linkedin].filter(link => link.startsWith('http')),
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': profile.location.city,
      'addressCountry': profile.location.country,
    },
    'knowsLanguage': profile.languages.map(language => language.name),
    'worksFor': current ? { '@type': 'Organization', 'name': current.company } : undefined,
  }
}
