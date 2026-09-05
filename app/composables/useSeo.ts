import { personJsonLd } from '#shared/cv/json-ld';
import { DOTFILES_INDEX, dotfilePath } from '#shared/cv/panel-target';
import type { CvData } from '#shared/schemas/cv';
import type { Dotfile } from '#shared/schemas/dotfile';

export function useResumeSeo(cv: CvData) {
  const siteUrl = useRuntimeConfig().public.siteUrl;
  const { profile } = cv;
  const title = `${profile.name} — ${profile.title}`;
  const description = profile.description;
  const url = `${siteUrl}/`;

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: 'profile',
    ogUrl: url,
    ogSiteName: profile.name,
  });

  useHead({
    link: [{ rel: 'canonical', href: url }],
    script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(personJsonLd(cv, siteUrl)) }],
  });
}

function pageSeo(title: string, description: string, path: string): void {
  const siteUrl = useRuntimeConfig().public.siteUrl;
  const url = `${siteUrl}${path}`;
  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: 'website',
    ogUrl: url,
  });
  useHead({ link: [{ rel: 'canonical', href: url }] });
}

export function useDotfileSeo(dotfile: Dotfile): void {
  const { profile } = useCv();
  pageSeo(`${dotfile.title} — ${profile.name}`, dotfile.description, dotfilePath(dotfile.slug));
}

export function useDotfilesIndexSeo(): void {
  const { profile } = useCv();
  pageSeo(
    `Dotfiles — ${profile.name}`,
    `Configuration files ${profile.name} uses day to day. Read them in the browser, copy them with one click, or cat them in the terminal.`,
    DOTFILES_INDEX,
  );
}
