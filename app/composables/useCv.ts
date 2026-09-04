import type { CvData } from '#shared/schemas/cv'
import { cv } from '#cv'

/** The validated resume data, generated at build time from `content/`. */
export function useCv(): CvData {
  return cv
}
