import { OG_MANIFEST } from './generated/og-manifest';

/** Kinds of generated share images (folders under public/og). */
export type OgImageType = keyof typeof OG_MANIFEST;

const available: Record<string, ReadonlySet<string>> = Object.fromEntries(
  Object.entries(OG_MANIFEST).map(([type, slugs]) => [type, new Set<string>(slugs)]),
);

/**
 * Site path of a page's generated 1200x630 share image, or undefined when none was generated
 * (SEO then falls back to the default image). Regenerate with scripts/og/generate-og.mjs.
 */
export const ogImage = (type: OgImageType, slug: string | number | undefined | null): string | undefined => {
  if (slug === undefined || slug === null) return undefined;
  const key = String(slug);
  return available[type]?.has(key) ? `/og/${type}/${encodeURIComponent(key)}.jpg` : undefined;
};
