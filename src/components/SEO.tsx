import React from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'vocabulary';
  /** Set true on pages that must not be indexed (404s, private pages). */
  noindex?: boolean;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  word?: {
    /** Optional word id; used to build the word URL when `url` is not given. */
    id?: string;
    arabic: string;
    transliteration: string;
    meaning: string;
    root: string;
    frequency: number;
    /** Sentence describing Quranic usage (handles words not found verbatim). */
    usage?: string;
    partOfSpeech: string;
    tags: string[];
  };
}

const SITE_NAME = 'QuranVocab';
const SITE_URL = 'https://quranvocab.com';
const SITE_TAGLINE = 'Learn the words of the Quran';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;

/**
 * Canonical origin: the production domain unless we are actually being served
 * from a non-preview host (e.g. a custom domain or www variant we want to keep).
 * Lovable preview/sandbox hosts and localhost always map to production.
 */
const getCanonicalOrigin = (): string => {
  if (typeof window === 'undefined') return SITE_URL;
  const { hostname, origin } = window.location;
  const isPreviewHost =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.lovable.app') ||
    hostname.endsWith('.lovable.dev') ||
    hostname.endsWith('.lovableproject.com') ||
    hostname.includes('lovable');
  if (isPreviewHost) return SITE_URL;
  if (hostname === 'quranvocab.com' || hostname === 'www.quranvocab.com') return SITE_URL;
  return origin;
};

/** Normalise a path: no query, no hash, no trailing slash (except root). */
const normalisePath = (pathname: string): string => {
  const clean = pathname.split(/[?#]/)[0] || '/';
  if (clean === '/') return '/';
  return clean.replace(/\/+$/, '') || '/';
};

const toAbsolute = (pathOrUrl: string, origin: string): string => {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${origin}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
};

/** Build a canonical URL from an explicit url prop or the current location. */
const buildCanonical = (currentPath: string, explicitUrl?: string): string => {
  const origin = getCanonicalOrigin();
  if (explicitUrl) {
    try {
      const u = new URL(explicitUrl, origin);
      const sameSite = /(^|\.)quranvocab\.com$/.test(u.hostname) || (typeof window !== 'undefined' && u.origin === window.location.origin);
      const base = sameSite ? origin : u.origin;
      const path = normalisePath(u.pathname);
      return path === '/' ? `${base}/` : `${base}${path}`;
    } catch {
      /* fall through to location-based canonical */
    }
  }
  // From the router, so prerendered HTML (no window) gets the same canonical as the browser.
  const path = normalisePath(currentPath);
  return path === '/' ? `${origin}/` : `${origin}${path}`;
};

/**
 * index.html ships static canonical/description/OG/Twitter tags for crawlers that
 * don't run JS. react-helmet only manages tags it created, so once the app mounts
 * we remove the static copies to avoid duplicate (conflicting) canonicals.
 */
const STATIC_HEAD_SELECTORS = [
  'link[rel="canonical"]',
  'meta[name="description"]',
  'meta[name="author"]',
  'meta[property^="og:"]',
  'meta[name^="twitter:"]'
]
  .map((sel) => `${sel}:not([data-react-helmet])`)
  .join(',');

const removeStaticHeadDuplicates = () => {
  if (typeof document === 'undefined') return;
  document.head.querySelectorAll(STATIC_HEAD_SELECTORS).forEach((el) => el.remove());
};

const SEO: React.FC<SEOProps> = ({
  title = `${SITE_NAME} — ${SITE_TAGLINE}`,
  description = 'Learn high-frequency Quranic Arabic vocabulary with themed collections, flashcards and quizzes. Free, with word pages showing root and meaning.',
  keywords = ['Quranic Arabic', 'Quran vocabulary', 'Arabic words', 'Quran study', 'Arabic flashcards'],
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noindex = false,
  article,
  word
}) => {
  React.useEffect(() => {
    removeStaticHeadDuplicates();
  }, []);

  const siteTitle = SITE_NAME;
  const origin = getCanonicalOrigin();
  const { pathname } = useLocation();
  const canonical = buildCanonical(pathname, url);
  const absoluteImage = toAbsolute(image || DEFAULT_IMAGE, origin);

  // Generate word-specific SEO data if word prop is provided
  const wordTitle = word ? `${word.transliteration} (${word.arabic}) — meaning: ${word.meaning}` : title;
  const wordDescription = word
    ? `"${word.arabic}" (${word.transliteration}) means "${word.meaning}". Root: ${word.root}. ${word.usage ?? `${word.frequency} occurrences in the Quran.`} Learn it with audio and examples.`
    : description;
  const wordKeywords = word
    ? [...keywords, word.arabic, word.transliteration, word.meaning, word.root, ...word.tags, 'Quranic Arabic']
    : keywords;

  const finalTitle = word ? wordTitle : title;
  const finalDescription = word ? wordDescription : description;
  const finalKeywords = word ? wordKeywords : keywords;
  const fullTitle =
    finalTitle.includes(siteTitle)
      ? finalTitle
      : `${finalTitle} | ${siteTitle}`;

  const organization = {
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: `${SITE_URL}/lovable-uploads/971aabb3-7499-4eb9-a8b4-d658db731aee.png`
  };

  const website = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    inLanguage: 'en',
    publisher: { '@id': `${SITE_URL}/#organization` }
  };

  const graph: Record<string, unknown>[] = [];

  if (word) {
    graph.push({
      '@type': 'DefinedTerm',
      '@id': `${canonical}#term`,
      name: `${word.transliteration} (${word.arabic})`,
      alternateName: word.arabic,
      description: `Arabic word meaning "${word.meaning}". Transliteration: ${word.transliteration}. Root: ${word.root}. Part of speech: ${word.partOfSpeech}. ${word.usage ?? `Frequency in the Quran: ${word.frequency} occurrences.`}`,
      termCode: word.arabic,
      url: canonical,
      inLanguage: 'ar',
      inDefinedTermSet: {
        '@type': 'DefinedTermSet',
        '@id': `${SITE_URL}/collections#termset`,
        name: 'QuranVocab — Quranic Arabic Vocabulary',
        url: `${SITE_URL}/collections`
      },
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'transliteration', value: word.transliteration },
        { '@type': 'PropertyValue', name: 'root', value: word.root },
        { '@type': 'PropertyValue', name: 'frequency', value: word.frequency },
        { '@type': 'PropertyValue', name: 'partOfSpeech', value: word.partOfSpeech }
      ]
    });
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Words', item: `${SITE_URL}/collections` },
        { '@type': 'ListItem', position: 3, name: `${word.transliteration} (${word.arabic})`, item: canonical }
      ]
    });
  } else if (type === 'article' || article) {
    graph.push({
      '@type': 'Article',
      headline: finalTitle,
      description: finalDescription,
      url: canonical,
      image: absoluteImage,
      ...(article?.publishedTime && { datePublished: article.publishedTime }),
      ...(article?.modifiedTime && { dateModified: article.modifiedTime }),
      author: { '@type': 'Organization', name: article?.author || SITE_NAME },
      publisher: { '@id': `${SITE_URL}/#organization` }
    });
  } else {
    graph.push({
      '@type': 'WebPage',
      '@id': `${canonical}#webpage`,
      name: fullTitle,
      description: finalDescription,
      url: canonical,
      isPartOf: { '@id': `${SITE_URL}/#website` }
    });
  }

  graph.push(website, organization);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords.join(', ')} />
      <meta name="author" content={SITE_NAME} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex" />}

      {/* Language */}
      <html lang="en" />

      {/* Open Graph Tags */}
      <meta property="og:type" content={type === 'vocabulary' || word ? 'article' : type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="en_US" />

      {/* Word-specific Open Graph tags */}
      {word && <meta property="article:section" content="Quranic Arabic Vocabulary" />}
      {word && <meta property="article:tag" content={word.transliteration} />}
      {word && <meta property="article:tag" content={word.meaning} />}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={absoluteImage} />

      {/* Article specific tags */}
      {article?.publishedTime && <meta property="article:published_time" content={article.publishedTime} />}
      {article?.modifiedTime && <meta property="article:modified_time" content={article.modifiedTime} />}
      {article?.author && <meta property="article:author" content={article.author} />}
      {article?.section && <meta property="article:section" content={article.section} />}
      {article?.tags?.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}
      </script>
    </Helmet>
  );
};

export default SEO;
