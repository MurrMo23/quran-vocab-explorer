import { useMemo } from 'react';
import { getAllWords, getCollectionById, getWordById, getWordsByCollection } from '@/utils/vocabulary';
import { useUserCollection } from '@/lib/collections';

export const ALL_WORDS = 'all';

export interface PracticePool {
  name: string;
  wordIds: string[];
  loading: boolean;
  /** The id is neither a built-in collection nor one of the learner's collections. */
  notFound: boolean;
}

/**
 * Resolve a collection id (from `?collection=`) to its word ids: all words, a built-in
 * collection, or one of the learner's own collections (account or this browser).
 */
export function usePracticePool(collectionId: string | null | undefined): PracticePool {
  const id = collectionId || ALL_WORDS;
  const builtIn = id !== ALL_WORDS ? getCollectionById(id) : undefined;
  const userCollectionId = id !== ALL_WORDS && !builtIn ? id : null;
  const { collection: userCollection, loading: userLoading } = useUserCollection(userCollectionId);

  return useMemo<PracticePool>(() => {
    if (id === ALL_WORDS) {
      return { name: 'All words', wordIds: getAllWords().map((w) => w.id), loading: false, notFound: false };
    }
    if (builtIn) {
      return { name: builtIn.name, wordIds: getWordsByCollection(builtIn.id).map((w) => w.id), loading: false, notFound: false };
    }
    if (userCollection) {
      return {
        name: userCollection.name,
        wordIds: userCollection.wordIds.filter((wordId) => !!getWordById(wordId)),
        loading: false,
        notFound: false,
      };
    }
    return { name: '', wordIds: [], loading: userLoading, notFound: !userLoading };
  }, [id, builtIn, userCollection, userLoading]);
}
