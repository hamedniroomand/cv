import { personJsonLd } from '#shared/cv/json-ld';
import { ogCardFile } from '#shared/cv/og-card';
import { DOTFILES_INDEX, dotfilePath } from '#shared/cv/panel-target';
import type { CvData } from '#shared/schemas/cv';
import type { Dotfile } from '#shared/schemas/dotfile';

const OG_IMAGE = { width: 1200, height: 630 };

type OgCard = string;

function ogImageMeta(siteUrl: string, card: OgCard, alt: string) {
  const image = `${siteUrl}/${ogCardFile(card)}`;
  return {
    ogImage: image,
    ogImageSecureUrl: image,
    ogImageType: 'image/png' as const,
    ogImageWidth: OG_IMAGE.width,
    ogImageHeight: OG_IMAGE.height,
    ogImageAlt: alt,
    // Telegram's link preview prefers Twitter Card image tags over og:image alone.
    twitterCard: 'summary_large_image' as const,
    twitterImage: image,
    twitterImageAlt: alt,
  };
}

export function useResumeSeo(cv: CvData) {
  const siteUrl = useRuntimeConfig().public.siteUrl;
  const { profile } = cv;
  const title = `${profile.name} — ${profile.title}`;
  const description = profile.description;
  const url = `${siteUrl}/cv`;

  useSeoMeta({
    title,
    robots: 'noindex, follow',
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: 'profile',
    ogUrl: url,
    ogSiteName: profile.name,
    ...ogImageMeta(siteUrl, 'resume', `${profile.name}, ${profile.title}`),
  });

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
    robots: 'index, follow',
    ogType: 'website',
    ogUrl: url,
    ogSiteName: profile.name,
    ...ogImageMeta(siteUrl, 'dotfiles', `Dotfiles by ${profile.name}`),
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

export function usePublicSeo(
  title: string,
  description: string,
  path = '/',
  card = 'home',
  cardAlt = 'Hamed Niroomand — Projects, tools & experiments',
): void {
  const siteUrl = useRuntimeConfig().public.siteUrl;
  useSeoMeta({
    title,
    description,
    robots: 'index, follow',
    ogTitle: title,
    ogDescription: description,
    ogType: 'website',
    ogUrl: `${siteUrl}${path}`,
    ogSiteName: 'Hamed Niroomand',
    ...ogImageMeta(siteUrl, card, cardAlt),
  });
  useHead({ link: [{ rel: 'canonical', href: `${siteUrl}${path}` }] });
}
