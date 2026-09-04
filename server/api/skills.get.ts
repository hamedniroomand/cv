import { createError, defineEventHandler, getQuery } from 'h3'
import { getPublicCv } from '../utils/cv'

export default defineEventHandler((event) => {
  const { categories } = getPublicCv().skills
  const wanted = getQuery(event).category
  if (typeof wanted !== 'string' || wanted === '')
    return { categories }
  const match = categories.filter(c => c.id === wanted)
  if (match.length === 0)
    throw createError({ status: 404, message: `unknown category: ${wanted} (try: ${categories.map(c => c.id).join(', ')})` })
  return { categories: match }
})
