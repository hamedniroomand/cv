import type { Experience } from '#shared/schemas/experience';

import { formatRange } from './format.ts';

/**
 * One row of the work history on the public site.
 * The row gives the company, the place and the dates. It does not give the role title.
 * The role titles stay on the résumé page.
 */
export interface PublicExperience {
  slug: string;
  company: string;
  url?: string;
  location: string;
  type: Experience['type'];
  range: string;
  summary: string;
  stack: string[];
}

const STACK_LIMIT = 4;

function firstSentence(body: string): string {
  const text =
    body
      .trim()
      .split(/\n{2,}/, 1)[0]
      ?.replace(/\s+/g, ' ') ?? '';
  return /^(.+?[.!?])(?:\s|$)/.exec(text)?.[1] ?? text;
}

export function publicExperience(entries: readonly Experience[]): PublicExperience[] {
  return entries.map(entry => {
    const starts = entry.roles.map(role => role.start).sort();
    const ends = entry.roles.map(role => role.end).sort();
    return {
      slug: entry.slug,
      company: entry.company,
      ...(entry.url ? { url: entry.url } : {}),
      location: entry.location,
      type: entry.type,
      range: formatRange(starts[0]!, ends.at(-1)!),
      summary: entry.summary?.trim() || firstSentence(entry.body),
      stack: entry.stack.slice(0, STACK_LIMIT),
    };
  });
}
