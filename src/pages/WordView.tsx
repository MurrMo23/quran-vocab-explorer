
import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import WordDetail from '@/components/WordDetail';
import SEO from '@/components/SEO';
import { ogImage } from '@/utils/og-image';
import { Word, getAllWords } from '@/utils/vocabulary';
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
  const loading = false;
  const canonicalPath = word ? getWordPath(word) : null;

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
      
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground flex items-center transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back</span>
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse flex flex-col items-center justify-center py-10">
          <div className="w-2/3 h-8 bg-gray-200 rounded-lg mb-4"></div>
          <div className="w-1/2 h-6 bg-gray-200 rounded-lg mb-8"></div>
          <div className="w-full h-40 bg-gray-200 rounded-lg"></div>
        </div>
      ) : word ? (
        <div>
          <WordDetail 
            word={word} 
            nextWord={nextWord || undefined}
            previousWord={previousWord || undefined}
            relatedWords={relatedWords}
            recommendedWords={recommendedWords}
          />
        </div>
      ) : (
        <div className="text-center py-10">
          <h2 className="text-xl font-semibold mb-2">Word Not Found</h2>
          <p className="text-muted-foreground mb-4">
            Sorry, we couldn't find the word you're looking for.
          </p>
          <button
            onClick={() => navigate('/review')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Review
          </button>
        </div>
      )}
    </>
  );
};

export default WordView;
