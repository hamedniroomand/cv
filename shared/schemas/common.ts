import { z } from 'zod'

export const YearMonth = z.string().regex(/^\d{4}-(?:0[1-9]|1[0-2])$/, 'expected YYYY-MM')
export const DateOrPresent = z.union([YearMonth, z.literal('present')])

export const RenderedBody = z.object({
  body: z.string(),
  html: z.string(),
})
export type RenderedBodyData = z.infer<typeof RenderedBody>
