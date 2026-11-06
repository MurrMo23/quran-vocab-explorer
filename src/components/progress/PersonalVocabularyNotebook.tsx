import React from 'react';
import { Link } from 'react-router-dom';
import { NotebookPen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NOTE_TYPE_LABELS, useNotes } from '@/lib/notes';
import { getWordById } from '@/utils/vocabulary';

/** Compact "recent notes" card (e.g. for a dashboard). Full management lives at /notebook. */
const PersonalVocabularyNotebook: React.FC<{ limit?: number }> = ({ limit = 5 }) => {
  const { items, loading } = useNotes();
  const recent = items.slice(0, limit);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg flex items-center gap-2">
          <NotebookPen className="h-5 w-5 text-primary" />
          Recent notes
        </CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link to="/notebook">Open notebook</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-16 rounded bg-muted animate-pulse" />
        ) : recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No notes yet. Add one from any word page.
          </p>
        ) : (
          <ul className="space-y-3">
            {recent.map((n) => {
              const word = getWordById(n.wordId);
              return (
                <li key={n.id} className="text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    {word ? (
                      <Link to={`/word/${n.wordId}`} className="font-medium hover:underline underline-offset-4">
                        <span className="font-arabic mr-1" lang="ar">
                          {word.arabic}
                        </span>
                        {word.meaning}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">{n.wordId}</span>
                    )}
                    <Badge variant="secondary" className="text-xs">
                      {NOTE_TYPE_LABELS[n.noteType]}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground line-clamp-2">{n.content}</p>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalVocabularyNotebook;
