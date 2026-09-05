import { cv } from '#cv';
import type { CvData } from '#shared/schemas/cv';

export type PublicCv = Omit<CvData, 'secrets' | 'dotfiles'>;

export function getPublicCv(): PublicCv {
  const { secrets: _secrets, dotfiles: _dotfiles, ...publicCv } = cv;
  return publicCv;
}
