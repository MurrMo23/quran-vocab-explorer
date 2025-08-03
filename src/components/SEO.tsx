
import React from 'react';
import { Helmet } from 'react-helmet';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'vocabulary';
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  word?: {
    arabic: string;
    transliteration: string;
    meaning: string;
    root: string;
    frequency: number;
    partOfSpeech: string;
    tags: string[];
  };
}

const SEO: React.FC<SEOProps> = ({
  title = 'Arabic Vocabulary - Learn Quranic Arabic',
  description = 'Master Arabic vocabulary with our comprehensive learning platform. Study Quranic Arabic words, build your vocabulary, and enhance your understanding of Islamic texts.',
  keywords = ['Arabic', 'vocabulary', 'Quran', 'Islamic', 'learning', 'Arabic language', 'Arabic words'],
  image = '/og-image.png',
  url = window.location.href,
  type = 'website',
  article,
  word
}) => {
  const siteTitle = 'Quran Vocab Explorer';
  
  // Generate word-specific SEO data if word prop is provided
  const wordTitle = word ? `Learn Arabic Word: ${word.meaning} (${word.arabic}) - Meaning & Examples` : title;
  const wordDescription = word ? 
    `Learn the Arabic word "${word.arabic}" (${word.transliteration}) meaning "${word.meaning}". Root: ${word.root}. ${word.frequency} occurrences in the Quran. Study with pronunciation, examples, and Quranic context.` : 
    description;
  const wordKeywords = word ? 
    [...keywords, word.arabic, word.transliteration, word.meaning, word.root, ...word.tags, 'Quranic Arabic', 'Arabic word study', 'Islamic vocabulary'] : 
    keywords;
  
  const finalTitle = word ? wordTitle : title;
  const finalDescription = word ? wordDescription : description;
  const finalKeywords = word ? wordKeywords : keywords;
  const fullTitle = finalTitle === siteTitle ? finalTitle : `${finalTitle} | ${siteTitle}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords.join(', ')} />
      <meta name="author" content="Quran Vocab Explorer Team" />
      <link rel="canonical" href={url} />
      
      {/* Language and Content Type */}
      <html lang="en" />
      <meta name="language" content="English" />
      <meta name="content-language" content="en-US" />

      {/* Open Graph Tags */}
      <meta property="og:type" content={type === 'vocabulary' ? 'article' : type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteTitle} />
      <meta property="og:locale" content="ar_SA" />
      
      {/* Word-specific Open Graph tags */}
      {word && (
        <>
          <meta property="article:section" content="Arabic Vocabulary" />
          <meta property="article:tag" content={word.arabic} />
          <meta property="article:tag" content={word.transliteration} />
          <meta property="article:tag" content={word.meaning} />
          <meta property="article:tag" content={`Root: ${word.root}`} />
          <meta property="article:tag" content={word.partOfSpeech} />
          {word.tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
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
          '@type': word ? 'DefinedTerm' : (type === 'article' ? 'Article' : 'WebSite'),
          name: fullTitle,
          description: finalDescription,
          url: url,
          ...(word && {
            '@type': 'DefinedTerm',
            name: `${word.meaning} (${word.arabic})`,
            description: `Arabic word meaning "${word.meaning}". Transliteration: ${word.transliteration}. Root: ${word.root}. Part of speech: ${word.partOfSpeech}. Frequency in Quran: ${word.frequency} occurrences.`,
            termCode: word.arabic,
            inDefinedTermSet: {
              '@type': 'DefinedTermSet',
              name: 'Quranic Arabic Vocabulary',
              description: 'Comprehensive collection of Arabic words from the Quran'
            },
            additionalProperty: [
              {
                '@type': 'PropertyValue',
                name: 'transliteration',
                value: word.transliteration
              },
              {
                '@type': 'PropertyValue', 
                name: 'root',
                value: word.root
              },
              {
                '@type': 'PropertyValue',
                name: 'frequency',
                value: word.frequency
              },
              {
                '@type': 'PropertyValue',
                name: 'partOfSpeech',
                value: word.partOfSpeech
              }
            ]
          }),
          ...(type === 'website' && !word && {
            potentialAction: {
              '@type': 'SearchAction',
              target: `${window.location.origin}/search?q={search_term_string}`,
              'query-input': 'required name=search_term_string'
            }
          }),
          ...(article && {
            headline: finalTitle,
            datePublished: article.publishedTime,
            dateModified: article.modifiedTime,
            author: {
              '@type': 'Organization',
              name: article.author || 'Quran Vocab Explorer Team'
            }
          })
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
