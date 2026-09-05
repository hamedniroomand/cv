import { personJsonLd } from '#shared/cv/json-ld';
import { DOTFILES_INDEX, dotfilePath } from '#shared/cv/panel-target';
import type { CvData } from '#shared/schemas/cv';
import type { Dotfile } from '#shared/schemas/dotfile';

const OG_IMAGE = { width: 1200, height: 630 };

type OgCard = 'resume' | 'dotfiles';

function ogImageMeta(siteUrl: string, card: OgCard, alt: string) {
  return {
    ogImage: `${siteUrl}/og${card === 'dotfiles' ? '-dotfiles' : ''}.png`,
    ogImageWidth: OG_IMAGE.width,
    ogImageHeight: OG_IMAGE.height,
    ogImageAlt: alt,
  };
}

function useTwitterCard(): void {
  useHead({ meta: [{ name: 'twitter:card', content: 'summary_large_image' }] });
}

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
    ...ogImageMeta(siteUrl, 'resume', `${profile.name}, ${profile.title}`),
  });
  useTwitterCard();

  useHead({
    link: [{ rel: 'canonical', href: url }],
    script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(personJsonLd(cv, siteUrl)) }],
  });
}

function pageSeo(title: string, description: string, path: string): void {
  const siteUrl = useRuntimeConfig().public.siteUrl;
  const { profile } = useCv();
  const url = `${siteUrl}${path}`;
  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: 'website',
    ogUrl: url,
    ogSiteName: profile.name,
    ...ogImageMeta(siteUrl, 'dotfiles', `Dotfiles by ${profile.name}`),
  });
  useTwitterCard();
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
