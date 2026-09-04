import { describe, expect, it } from 'vitest'
import { getPublicCv } from '../../../server/utils/cv'
import { fixtureCv } from '../fixtures/cv'

describe('getPublicCv', () => {
  it('returns resume data without secrets', () => {
    const pub = getPublicCv()
    expect(pub).not.toHaveProperty('secrets')
    expect(pub.profile).toEqual(fixtureCv.profile)
    expect(pub.projects).toEqual(fixtureCv.projects)
  })
})
