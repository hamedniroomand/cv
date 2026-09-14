import { personJsonLd } from '#shared/cv/json-ld';
import { ogCardFile } from '#shared/cv/og-card';
import { DOTFILES_INDEX, dotfilePath } from '#shared/cv/panel-target';
import type { CvData } from '#shared/schemas/cv';
import type { Dotfile } from '#shared/schemas/dotfile';

const OG_IMAGE = { width: 1200, height: 630 };
const HOME_CARD_ALT = 'Hamed Niroomand — Projects, tools & experiments';

interface PageSeo {
  title: string;
  description: string;
  path: string;
  siteName: string;
  robots: 'index, follow' | 'noindex, follow';
  ogType: 'website' | 'profile';
  card: string;
  cardAlt: string;
  jsonLd?: object;
}

function applySeo(seo: PageSeo): void {
  const siteUrl = useRuntimeConfig().public.siteUrl;
  const url = `${siteUrl}${seo.path}`;
  const image = `${siteUrl}/${ogCardFile(seo.card)}`;
  useSeoMeta({
    title: seo.title,
    description: seo.description,
    robots: seo.robots,
    ogTitle: seo.title,
    ogDescription: seo.description,
    ogType: seo.ogType,
    ogUrl: url,
    ogSiteName: seo.siteName,
    ogImage: image,
    ogImageSecureUrl: image,
    ogImageType: 'image/png',
    ogImageWidth: OG_IMAGE.width,
    ogImageHeight: OG_IMAGE.height,
    ogImageAlt: seo.cardAlt,
    // Telegram link previews read the Twitter Card image tags, not og:image alone.
    twitterCard: 'summary_large_image',
    twitterImage: image,
    twitterImageAlt: seo.cardAlt,
  });
  useHead({
    link: [{ rel: 'canonical', href: url }],
    script: seo.jsonLd
      ? [{ type: 'application/ld+json', innerHTML: JSON.stringify(seo.jsonLd) }]
      : [],
  });
}

export function useResumeSeo(cv: CvData): void {
  const { profile } = cv;
  applySeo({
    title: `${profile.name} — ${profile.title}`,
    description: profile.description,
    path: '/cv',
    siteName: profile.name,
    robots: 'noindex, follow',
    ogType: 'profile',
    card: 'resume',
    cardAlt: `${profile.name}, ${profile.title}`,
    jsonLd: personJsonLd(cv, useRuntimeConfig().public.siteUrl),
  });
}

function dotfilesSeo(title: string, description: string, path: string): void {
  const { profile } = useCv();
  applySeo({
    title,
    description,
    path,
    siteName: profile.name,
    robots: 'index, follow',
    ogType: 'website',
    card: 'dotfiles',
    cardAlt: `Dotfiles by ${profile.name}`,
  });
}

export function useDotfileSeo(dotfile: Dotfile): void {
  const { profile } = useCv();
  dotfilesSeo(`${dotfile.title} — ${profile.name}`, dotfile.description, dotfilePath(dotfile.slug));
}

export function useDotfilesIndexSeo(): void {
  const { profile } = useCv();
  dotfilesSeo(
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
  cardAlt = HOME_CARD_ALT,
): void {
  applySeo({
    title,
    description,
    path,
    siteName: useCv().profile.name,
    robots: 'index, follow',
    ogType: 'website',
    card,
    cardAlt,
  });
}
