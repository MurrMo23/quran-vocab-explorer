
import React, { useEffect, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import WordDetail from '@/components/WordDetail';
import SEO from '@/components/SEO';
import { ogImage } from '@/utils/og-image';
import { Word, getAllWords, getCollectionById, getWordsByCollection } from '@/utils/vocabulary';
import { getWordBySlugOrId, getWordPath, getWordSlug } from '@/utils/word-slugs';
import { toast } from 'sonner';
import { getQuranicUsage } from '@/utils/word-usage';
import { publicId, track } from '@/lib/analytics';

const WordView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // Derived synchronously so prerendered HTML and the first client render match.
  // :id is a slug (/word/tawakkul) or a legacy word id (/word/87); both resolve to the word.
  const { word, slug, nextWord, previousWord, relatedWords, recommendedWords } = useMemo(() => {
    const empty = { word: null as Word | null, slug: null as string | null, nextWord: null as Word | null, previousWord: null as Word | null, relatedWords: [] as Word[], recommendedWords: [] as Word[] };
    const resolved = getWordBySlugOrId(id);
    if (!resolved) return empty;
    const foundWord = resolved.word;
    const wordId = foundWord.id;
    const allWords = getAllWords();
    const currentIndex = allWords.findIndex(w => w.id === wordId);
    const related = allWords.filter(w =>
      w.id !== wordId && (
        w.root === foundWord.root ||
        w.partOfSpeech === foundWord.partOfSpeech ||
        w.tags.some(tag => foundWord.tags.includes(tag))
      )
    ).slice(0, 8);
    // Deterministic order (closest frequency first) so server and client agree.
    const recommended = allWords
      .filter(w => w.id !== wordId && w.level === foundWord.level && Math.abs(w.frequency - foundWord.frequency) < 50)
      .sort((a, b) => Math.abs(a.frequency - foundWord.frequency) - Math.abs(b.frequency - foundWord.frequency) || a.id.localeCompare(b.id))
      .slice(0, 8);
    return {
      word: foundWord,
      slug: resolved.slug,
      previousWord: currentIndex > 0 ? allWords[currentIndex - 1] : null,
      nextWord: currentIndex < allWords.length - 1 ? allWords[currentIndex + 1] : null,
      relatedWords: related,
      recommendedWords: recommended,
    };
  }, [id]);
  const canonicalPath = word ? getWordPath(word) : null;
  // First collection that holds this word (deterministic, so prerender and hydration agree).
  const breadcrumbCollection = useMemo(() => {
    for (const cid of word?.collections ?? []) {
      const c = getCollectionById(cid);
      if (c && getWordsByCollection(c.id).length > 0) return { id: c.id, name: c.name };
    }
    return null;
  }, [word]);

  // Legacy ids and non-canonical spellings move to the slug URL (the page itself already
  // renders with the slug canonical, so crawlers consolidate either way).
  useEffect(() => {
    if (id && slug && id !== slug && canonicalPath) {
      navigate(`${canonicalPath}${window.location.search}${window.location.hash}`, { replace: true });
    }
  }, [id, slug, canonicalPath, navigate]);

  useEffect(() => {
    if (word) track('word_view', { word_id: word.id, collection_id: publicId(new URLSearchParams(window.location.search).get('collection')) });
  }, [word]);

  useEffect(() => {
    if (id && !word) {
      toast.error("Word not found", { description: "We couldn't find the word you're looking for" });
    }
  }, [id, word]);

  return (
    <>
      {/* SEO Component for word-specific pages */}
      {word && (
        <SEO
          type="vocabulary"
          url={canonicalPath ?? undefined}
          image={ogImage('words', getWordSlug(word))}
          word={{
            arabic: word.arabic,
            transliteration: word.transliteration,
            meaning: word.meaning,
            root: word.root,
            frequency: word.frequency,
            usage: getQuranicUsage(word).long,
            partOfSpeech: word.partOfSpeech,
            tags: word.tags
          }}
        />
      )}
      
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-16 pt-6 sm:px-6 sm:pt-7">
        {word ? (
          <>
            <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <li>
                  <Link to="/collections" className="inline-flex min-h-6 items-center hover:text-foreground hover:underline underline-offset-4">
                    Collections
                  </Link>
                </li>
                {breadcrumbCollection && (
                  <>
                    <li aria-hidden="true">›</li>
                    <li>
                      <Link
                        to={`/collections/${breadcrumbCollection.id}`}
                        className="inline-flex min-h-6 items-center hover:text-foreground hover:underline underline-offset-4"
                      >
                        {breadcrumbCollection.name}
                      </Link>
                    </li>
                  </>
                )}
                <li aria-hidden="true">›</li>
                <li aria-current="page" className="font-bold text-foreground">
                  {word.meaning}
                </li>
              </ol>
            </nav>
            <WordDetail
              word={word}
              nextWord={nextWord || undefined}
              previousWord={previousWord || undefined}
              relatedWords={relatedWords}
              recommendedWords={recommendedWords}
            />
          </>
        ) : (
          <div className="card-tactile mx-auto flex max-w-lg flex-col items-center gap-3 p-8 text-center">
            <h1 className="text-xl font-extrabold">Word not found</h1>
            <p className="text-muted-foreground">Sorry, we couldn't find the word you're looking for.</p>
            <Button onClick={() => navigate('/review')}>Go to Review</Button>
          </div>
        )}
      </div>
    </>
  );
};

export default WordView;
