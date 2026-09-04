import { describe, expect, it } from 'vitest'
import { fixtureCv } from '~~/tests/unit/fixtures/cv'
import { personJsonLd } from '#shared/cv/json-ld'

describe('personJsonLd', () => {
  it('describes the profile as a schema.org Person', () => {
    const data = personJsonLd(fixtureCv, 'https://hamed.test')

    expect(data).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Person',
      'name': fixtureCv.profile.name,
      'jobTitle': fixtureCv.profile.title,
      'url': 'https://hamed.test',
      'email': 'mailto:me@example.com',
      'sameAs': ['https://github.com/hamedniroomand', 'https://linkedin.com/in/example'],
      'address': { '@type': 'PostalAddress', 'addressLocality': 'Yerevan', 'addressCountry': 'Armenia' },
      'knowsLanguage': ['Persian', 'English'],
      'worksFor': { '@type': 'Organization', 'name': 'Acme' },
    })
  })

  it('omits the email when it is not an address', () => {
    const cv = { ...fixtureCv, profile: { ...fixtureCv.profile, links: { ...fixtureCv.profile.links, email: 'hidden' } } }

    expect(personJsonLd(cv, 'https://hamed.test').email).toBeUndefined()
  })
})
