import { createError, defineEventHandler, getRouterParam } from 'nitro/h3'
import { getPublicCv } from '../../utils/cv'

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, 'slug')
  const entry = getPublicCv().experience.find(e => e.slug === slug)
  if (!entry)
    throw createError({ status: 404, message: `unknown experience slug: ${slug}` })
  return entry
})
