import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import MobileFlashcards from '@/components/mobile/MobileFlashcards';
import OfflineIndicator from '@/components/mobile/OfflineIndicator';
import { getWordById } from '@/utils/vocabulary';
import type { Word } from '@/utils/vocabulary-types';
import { useProgress } from '@/lib/progress';
import { PRACTICE_COLLECTION_PARAM } from '@/lib/collections';
import { usePracticePool } from '@/components/practice/usePracticePool';

const SESSION_SIZE = 20;

const MobileFlashcardsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pool = usePracticePool(searchParams.get(PRACTICE_COLLECTION_PARAM));
  const { buildSession, loading } = useProgress();
  // Bumped to rebuild the queue ("Start Over" picks up whatever is due now).
  const [round, setRound] = useState(0);
  // The queue is fixed per round so it doesn't change as cards get rescheduled mid-session.
  const [ids, setIds] = useState<string[] | null>(null);
  const ready = !loading && !pool.loading;
  const poolKey = pool.wordIds.join('|');

  useEffect(() => {
    if (!ready) return;
    setIds(buildSession(pool.wordIds, SESSION_SIZE));
    // Rebuild only when the round, readiness or the pool itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round, ready, poolKey]);

  const words = useMemo(() => (ids ?? []).map((id) => getWordById(id)).filter((w): w is Word => !!w), [ids]);

  return (
    <div className="min-h-screen bg-background p-4">
      <OfflineIndicator />

      <div className="mx-auto max-w-sm space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} aria-label="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">Flashcards{pool.name ? ` · ${pool.name}` : ''}</h1>
        </div>

        {ids === null ? (
          <p className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </p>
        ) : (
          <MobileFlashcards key={round} words={words} onRestart={() => setRound((r) => r + 1)} />
        )}
      </div>
    </div>
  );
};

export default MobileFlashcardsPage;
