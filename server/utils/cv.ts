import type { CvData } from '#shared/schemas/cv'
import { cv } from '#cv'

export type PublicCv = Omit<CvData, 'secrets'>

/** Resume data without the terminal-only `.secrets` file. */
export function getPublicCv(): PublicCv {
  const { secrets: _secrets, ...rest } = cv
  return rest
}
