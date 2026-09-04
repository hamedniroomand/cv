import type { CvData } from '#shared/schemas/cv'
import { cv } from '#cv'

export function useCv(): CvData {
  return cv
}
