
import React from 'react';
import { Helmet } from 'react-helmet';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
}

const SEO: React.FC<SEOProps> = ({
  title = 'Arabic Vocabulary - Learn Quranic Arabic',
  description = 'Master Arabic vocabulary with our comprehensive learning platform. Study Quranic Arabic words, build your vocabulary, and enhance your understanding of Islamic texts.',
  keywords = ['Arabic', 'vocabulary', 'Quran', 'Islamic', 'learning', 'Arabic language', 'Arabic words'],
  image = '/og-image.png',
  url = window.location.href,
  type = 'website',
  article
}) => {
  const siteTitle = 'Arabic Vocabulary';
  const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content="Arabic Vocabulary Team" />
      <link rel="canonical" href={url} />

      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteTitle} />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Article specific tags */}
      {article && (
        <>
          <meta property="article:published_time" content={article.publishedTime} />
          <meta property="article:modified_time" content={article.modifiedTime} />
          <meta property="article:author" content={article.author} />
          <meta property="article:section" content={article.section} />
          {article.tags?.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': type === 'article' ? 'Article' : 'WebSite',
          name: fullTitle,
          description: description,
          url: url,
          ...(type === 'website' && {
            potentialAction: {
              '@type': 'SearchAction',
              target: `${window.location.origin}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string'
            }
          }),
          ...(article && {
            headline: title,
            datePublished: article.publishedTime,
            dateModified: article.modifiedTime,
            author: {
              '@type': 'Organization',
              name: article.author || 'Arabic Vocabulary Team'
            }
          })
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
