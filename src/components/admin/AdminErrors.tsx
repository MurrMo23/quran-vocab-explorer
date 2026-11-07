import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json, Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Bug, ChevronDown, ChevronRight, RefreshCw, Trash2 } from 'lucide-react';

type ClientError = Tables<'client_errors'>;

const LATEST = 100;
const RETENTION_DAYS = 30;

interface ErrorGroup {
  message: string;
  count: number;
  lastSeen: string;
  sampleUrl: string | null;
  sampleStack: string | null;
  release: string | null;
  userAgent: string | null;
}

/** Group rows (newest first) by message; the newest row supplies the sample fields. */
function groupErrors(rows: readonly ClientError[]): ErrorGroup[] {
  const groups = new Map<string, ErrorGroup>();
  for (const r of rows) {
    const g = groups.get(r.message);
    if (g) {
      g.count++;
      if (r.created_at > g.lastSeen) g.lastSeen = r.created_at;
    } else {
      groups.set(r.message, {
        message: r.message,
        count: 1,
        lastSeen: r.created_at,
        sampleUrl: r.url,
        sampleStack: r.stack,
        release: r.release,
        userAgent: r.user_agent,
      });
    }
  }
  return [...groups.values()].sort((a, b) => b.count - a.count || b.lastSeen.localeCompare(a.lastSeen));
}

interface AdminErrorsProps {
  onAuditLog?: (action: string, entityType: string, entityId: string | null, details?: Json) => void | Promise<void>;
}

const AdminErrors: React.FC<AdminErrorsProps> = ({ onAuditLog }) => {
  const [rows, setRows] = useState<ClientError[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await supabase
      .from('client_errors')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(LATEST);
    if (error) {
      setLoadError(
        /client_errors/.test(error.message) || error.code === '42P01' || error.code === 'PGRST205'
          ? 'The client_errors table is not available yet (apply migration 20261107150000_client_errors.sql).'
          : error.message,
      );
      setRows([]);
    } else {
      setRows(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const groups = useMemo(() => groupErrors(rows), [rows]);

  const toggle = (message: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(message)) next.delete(message);
      else next.add(message);
      return next;
    });

  const deleteOld = async () => {
    setDeleting(true);
    try {
      const cutoff = new Date(Date.now() - RETENTION_DAYS * 86_400_000).toISOString();
      const { error, count } = await supabase
        .from('client_errors')
        .delete({ count: 'exact' })
        .lt('created_at', cutoff);
      if (error) throw error;
      toast.success(`Deleted ${count ?? 0} error report${count === 1 ? '' : 's'} older than ${RETENTION_DAYS} days.`);
      void onAuditLog?.('delete_old', 'client_errors', null, { older_than_days: RETENTION_DAYS, deleted: count ?? 0 });
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not delete old error reports.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Client errors
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Latest {LATEST} reports from visitors' browsers, grouped by message. No personal data is stored.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={deleting || !!loadError}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete older than {RETENTION_DAYS} days
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete old error reports?</AlertDialogTitle>
                <AlertDialogDescription>
                  Every error report older than {RETENTION_DAYS} days will be permanently deleted. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => void deleteOld()}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : loadError ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{loadError}</p>
        ) : groups.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No client errors reported.</p>
        ) : (
          <ul className="space-y-2">
            {groups.map((g) => {
              const open = expanded.has(g.message);
              return (
                <li key={g.message} className="rounded border">
                  <button
                    type="button"
                    onClick={() => toggle(g.message)}
                    aria-expanded={open}
                    className="flex w-full items-start gap-3 p-3 text-left hover:bg-muted/50"
                  >
                    {open ? (
                      <ChevronDown className="mt-0.5 h-4 w-4 shrink-0" />
                    ) : (
                      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="break-words font-mono text-sm">{g.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Last seen {new Date(g.lastSeen).toLocaleString()}
                        {g.sampleUrl ? <> · <span className="break-all">{g.sampleUrl}</span></> : null}
                      </p>
                    </div>
                    <Badge variant={g.count > 1 ? 'default' : 'secondary'} className="shrink-0">
                      {g.count}×
                    </Badge>
                  </button>
                  {open && (
                    <div className="space-y-2 border-t p-3 text-xs">
                      <p className="text-muted-foreground">
                        Release: {g.release || 'unknown'}
                        {g.userAgent ? <> · {g.userAgent}</> : null}
                      </p>
                      <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded bg-muted p-2 font-mono">
                        {g.sampleStack || 'No stack trace.'}
                      </pre>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminErrors;
