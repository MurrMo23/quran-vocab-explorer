import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, FileDown, Info } from 'lucide-react';
import { getAllCollections, getAllWords } from '@/utils/vocabulary';
import { dateStamp, downloadCsv, downloadJson } from './exportUtils';

interface AdminCollectionsProps {
  // Kept for API compatibility with Admin.tsx; this view is read-only so nothing is logged.
  onAuditLog?: (action: string, entityType: string, entityId: string | null, details?: unknown) => Promise<void>;
}

interface CollectionRow {
  id: string;
  name: string;
  description: string;
  wordCount: number;
  beginner: number;
  intermediate: number;
  advanced: number;
  wordIds: string[];
}

const AdminCollections: React.FC<AdminCollectionsProps> = () => {
  const rows = useMemo<CollectionRow[]>(() => {
    const words = getAllWords();
    return getAllCollections().map((c) => {
      const inCollection = words.filter((w) => w.collections.includes(c.id));
      return {
        id: c.id,
        name: c.name,
        description: c.description,
        wordCount: inCollection.length,
        beginner: inCollection.filter((w) => w.level === 'beginner').length,
        intermediate: inCollection.filter((w) => w.level === 'intermediate').length,
        advanced: inCollection.filter((w) => w.level === 'advanced').length,
        wordIds: inCollection.map((w) => w.id),
      };
    });
  }, []);

  const emptyCount = rows.filter((r) => r.wordCount === 0).length;

  const exportJson = () => downloadJson(`quranvocab-collections-${dateStamp()}.json`, rows);

  const exportCsv = () =>
    downloadCsv(
      `quranvocab-collections-${dateStamp()}.csv`,
      ['id', 'name', 'description', 'wordCount', 'beginner', 'intermediate', 'advanced', 'wordIds'],
      rows.map((r) => [
        r.id, r.name, r.description, r.wordCount, r.beginner, r.intermediate, r.advanced, r.wordIds.join('; '),
      ])
    );

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Words and collections are stored in the site's code (src/utils). To add or change one, edit
          those files or ask your developer; changes go live on the next publish.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>Collections</CardTitle>
            <p className="text-sm text-muted-foreground">
              {rows.length} collections
              {emptyCount > 0 && ` · ${emptyCount} empty`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <FileDown className="mr-2 h-4 w-4" aria-hidden="true" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportJson}>
              <FileDown className="mr-2 h-4 w-4" aria-hidden="true" />
              Export JSON
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Collection</TableHead>
                  <TableHead className="text-right">Words</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">Beginner</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">Intermediate</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">Advanced</TableHead>
                  <TableHead>
                    <span className="sr-only">Open</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="min-w-[12rem]">
                      <div className="flex flex-wrap items-center gap-2 font-medium">
                        {r.name}
                        {r.wordCount === 0 && <Badge variant="destructive">Empty</Badge>}
                      </div>
                      <div className="text-sm text-muted-foreground">{r.description}</div>
                      <div className="mt-1 text-xs text-muted-foreground sm:hidden">
                        {r.beginner} beginner · {r.intermediate} intermediate · {r.advanced} advanced
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{r.wordCount}</TableCell>
                    <TableCell className="hidden text-right sm:table-cell">{r.beginner}</TableCell>
                    <TableCell className="hidden text-right sm:table-cell">{r.intermediate}</TableCell>
                    <TableCell className="hidden text-right sm:table-cell">{r.advanced}</TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="icon">
                        <Link
                          to={`/collections/${encodeURIComponent(r.id)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open public page for ${r.name}`}
                        >
                          <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCollections;
