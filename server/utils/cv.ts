import type { CvData } from '#shared/schemas/cv'
import { cv } from '#cv'

export type PublicCv = Omit<CvData, 'secrets'>

export function getPublicCv(): PublicCv {
  const { secrets: _secrets, ...publicCv } = cv
  return publicCv
}
