import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, ExternalLink, FileDown, Info, Search } from 'lucide-react';
import { getAllCollections, getAllWords } from '@/utils/vocabulary';
import { Word } from '@/utils/vocabulary-types';
import { dateStamp, downloadCsv, downloadJson } from './exportUtils';

interface AdminVocabularyProps {
  // Kept for API compatibility with Admin.tsx; this view is read-only so nothing is logged.
  onAuditLog?: (action: string, entityType: string, entityId: string | null, details?: unknown) => Promise<void>;
}

const PAGE_SIZE = 50;
const ALL = 'all';

const formatFrequency = (word: Word) =>
  word.frequency > 0 ? word.frequency.toLocaleString() : 'Not found verbatim';

const AdminVocabulary: React.FC<AdminVocabularyProps> = () => {
  const words = useMemo(() => getAllWords(), []);
  const collections = useMemo(() => getAllCollections(), []);
  const collectionNames = useMemo(
    () => new Map(collections.map((c) => [c.id, c.name])),
    [collections]
  );

  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<string>(ALL);
  const [collection, setCollection] = useState<string>(ALL);
  const [verified, setVerified] = useState<string>(ALL);
  const [page, setPage] = useState(1);

  const stats = useMemo(
    () => ({
      total: words.length,
      verified: words.filter((w) => w.frequencyVerified).length,
      noLocation: words.filter((w) => !w.location).length,
      noExamples: words.filter((w) => !w.examples || w.examples.length === 0).length,
    }),
    [words]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return words.filter((w) => {
      if (level !== ALL && w.level !== level) return false;
      if (collection !== ALL && !w.collections.includes(collection)) return false;
      if (verified === 'verified' && !w.frequencyVerified) return false;
      if (verified === 'unverified' && w.frequencyVerified) return false;
      if (!q) return true;
      return (
        w.arabic.includes(query.trim()) ||
        w.transliteration.toLowerCase().includes(q) ||
        w.meaning.toLowerCase().includes(q) ||
        (w.root ?? '').toLowerCase().includes(q)
      );
    });
  }, [words, query, level, collection, verified]);

  // Reset to the first page whenever the filters change.
  useEffect(() => setPage(1), [query, level, collection, verified]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageWords = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const exportJson = () => downloadJson(`quranvocab-words-${dateStamp()}.json`, filtered);

  const exportCsv = () =>
    downloadCsv(
      `quranvocab-words-${dateStamp()}.csv`,
      [
        'id', 'arabic', 'transliteration', 'meaning', 'root', 'partOfSpeech', 'level',
        'frequency', 'frequencyVerified', 'location', 'examples', 'collections', 'tags',
      ],
      filtered.map((w) => [
        w.id,
        w.arabic,
        w.transliteration,
        w.meaning,
        w.root,
        w.partOfSpeech,
        w.level,
        w.frequency,
        w.frequencyVerified ? 'yes' : 'no',
        w.location ? `${w.location.surah}:${w.location.ayah}:${w.location.position}` : '',
        w.examples?.length ?? 0,
        w.collections.join('; '),
        (w.tags ?? []).join('; '),
      ])
    );

  const statCards = [
    { label: 'Total words', value: stats.total },
    { label: 'Verified frequency', value: stats.verified },
    { label: 'Missing location (no audio)', value: stats.noLocation },
    { label: 'No examples', value: stats.noExamples },
  ];

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Words and collections are stored in the site's code (src/utils). To add or change one, edit
          those files or ask your developer; changes go live on the next publish.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <div className="text-2xl font-semibold">{s.value.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Vocabulary</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
              <FileDown className="mr-2 h-4 w-4" aria-hidden="true" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportJson} disabled={filtered.length === 0}>
              <FileDown className="mr-2 h-4 w-4" aria-hidden="true" />
              Export JSON
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
              <Label htmlFor="vocab-search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="vocab-search"
                  type="search"
                  placeholder="Arabic, transliteration, meaning, root"
                  className="pl-8"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vocab-level">Level</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger id="vocab-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vocab-collection">Collection</Label>
              <Select value={collection} onValueChange={setCollection}>
                <SelectTrigger id="vocab-collection">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All collections</SelectItem>
                  {collections.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vocab-verified">Frequency</Label>
              <Select value={verified} onValueChange={setVerified}>
                <SelectTrigger id="vocab-verified">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All</SelectItem>
                  <SelectItem value="verified">Verified only</SelectItem>
                  <SelectItem value="unverified">Not verified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <p className="text-sm text-muted-foreground" aria-live="polite">
            {filtered.length.toLocaleString()} of {words.length.toLocaleString()} words
          </p>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Arabic</TableHead>
                  <TableHead>Transliteration</TableHead>
                  <TableHead>Meaning</TableHead>
                  <TableHead className="hidden md:table-cell">Root</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead className="hidden lg:table-cell">Collections</TableHead>
                  <TableHead>
                    <span className="sr-only">Open</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageWords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                      No words match these filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  pageWords.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell dir="rtl" lang="ar" className="whitespace-nowrap text-right font-arabic text-lg">
                        {w.arabic}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{w.transliteration}</TableCell>
                      <TableCell className="min-w-[10rem]">{w.meaning}</TableCell>
                      <TableCell dir="rtl" lang="ar" className="hidden whitespace-nowrap text-right md:table-cell">
                        {w.root}
                      </TableCell>
                      <TableCell className="capitalize">{w.level}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className={w.frequency > 0 ? '' : 'text-muted-foreground'}>{formatFrequency(w)}</span>
                        {w.frequencyVerified && (
                          <Badge variant="secondary" className="ml-2">
                            verified
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {w.collections.map((id) => (
                            <Badge key={id} variant="outline">
                              {collectionNames.get(id) ?? id}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="ghost" size="icon">
                          <Link
                            to={`/word/${encodeURIComponent(w.id)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Open public page for ${w.transliteration}`}
                          >
                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <nav className="flex items-center justify-between gap-2" aria-label="Vocabulary pagination">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= pageCount}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
            </Button>
          </nav>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVocabulary;
