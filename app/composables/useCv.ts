import { cv } from '#cv';
import type { CvData } from '#shared/schemas/cv';

export function useCv(): CvData {
  return cv;
}
