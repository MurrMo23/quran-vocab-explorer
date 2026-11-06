import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Json, Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { AlertTriangle, Inbox, Mail, RefreshCw, Search, Trash2 } from 'lucide-react';
import {
  CONTACT_CATEGORIES,
  CONTACT_STATUSES,
  type ContactStatus,
  buildReplyMailto,
  categoryLabel,
  matchesSearch,
  safePageHref,
  statusLabel,
} from '@/lib/contact/inbox';

type ContactMessage = Tables<'contact_messages'>;

const PAGE_SIZE = 50;

interface AdminInboxProps {
  onAuditLog?: (action: string, entityType: string, entityId: string | null, details?: Json) => Promise<void>;
  /** Called after anything that may change the number of 'new' messages. */
  onUnreadChange?: () => void;
}

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  new: 'default',
  'in-progress': 'secondary',
  resolved: 'outline',
  spam: 'destructive',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

const AdminInbox: React.FC<AdminInboxProps> = ({ onAuditLog, onUnreadChange }) => {
  const [statusFilter, setStatusFilter] = useState<ContactStatus | 'all'>('new');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Guards against an older request finishing after a newer one (fast filter changes).
  const requestSeq = useRef(0);

  const fetchPage = useCallback(
    async (offset: number) => {
      let query = supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);
      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      if (categoryFilter !== 'all') query = query.eq('category', categoryFilter);
      return query;
    },
    [statusFilter, categoryFilter],
  );

  const loadFirstPage = useCallback(async () => {
    const seq = ++requestSeq.current;
    setLoading(true);
    setError(null);
    const { data, error: err } = await fetchPage(0);
    if (seq !== requestSeq.current) return;
    if (err) {
      setError('Messages could not be loaded. Check your connection and try again.');
      setMessages([]);
      setHasMore(false);
    } else {
      setMessages(data ?? []);
      setHasMore((data?.length ?? 0) === PAGE_SIZE);
    }
    setLoading(false);
  }, [fetchPage]);

  useEffect(() => {
    void loadFirstPage();
  }, [loadFirstPage]);

  const loadMore = async () => {
    const seq = requestSeq.current;
    setLoadingMore(true);
    const { data, error: err } = await fetchPage(messages.length);
    if (seq !== requestSeq.current) return;
    setLoadingMore(false);
    if (err) {
      toast.error('Could not load more messages.');
      return;
    }
    const rows = data ?? [];
    setMessages((prev) => {
      const seen = new Set(prev.map((m) => m.id));
      return [...prev, ...rows.filter((m) => !seen.has(m.id))];
    });
    setHasMore(rows.length === PAGE_SIZE);
  };

  const visible = useMemo(() => messages.filter((m) => matchesSearch(m, search)), [messages, search]);
  const selected = useMemo(() => messages.find((m) => m.id === selectedId) ?? null, [messages, selectedId]);

  useEffect(() => {
    setNoteDraft(selected?.admin_note ?? '');
  }, [selected?.id, selected?.admin_note]);

  const updateMessage = async (id: string, patch: Partial<Pick<ContactMessage, 'status' | 'admin_note'>>) => {
    setBusy(true);
    const { data, error: err } = await supabase
      .from('contact_messages')
      .update(patch)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    setBusy(false);
    if (err || !data) {
      toast.error('The change could not be saved.');
      return false;
    }
    setMessages((prev) => prev.map((m) => (m.id === id ? data : m)));
    return true;
  };

  const setStatus = async (status: ContactStatus) => {
    if (!selected) return;
    const from = selected.status;
    if (await updateMessage(selected.id, { status })) {
      toast.success(`Marked as ${statusLabel(status).toLowerCase()}.`);
      onUnreadChange?.();
      void onAuditLog?.('contact_status_changed', 'contact_message', selected.id, { from, to: status });
    }
  };

  const saveNote = async () => {
    if (!selected) return;
    const note = noteDraft.trim().slice(0, 5000);
    if (await updateMessage(selected.id, { admin_note: note || null })) {
      toast.success('Note saved.');
    }
  };

  const deleteSelected = async () => {
    if (!selected) return;
    const id = selected.id;
    setBusy(true);
    const { error: err } = await supabase.from('contact_messages').delete().eq('id', id);
    setBusy(false);
    setConfirmDeleteOpen(false);
    if (err) {
      toast.error('The message could not be deleted.');
      return;
    }
    setMessages((prev) => prev.filter((m) => m.id !== id));
    setSelectedId(null);
    toast.success('Message deleted.');
    onUnreadChange?.();
    void onAuditLog?.('contact_deleted', 'contact_message', id);
  };

  const replyHref = selected ? buildReplyMailto(selected.email, selected.subject, selected.category) : null;
  const pageHref = selected ? safePageHref(selected.page_url) : null;

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <Inbox className="h-5 w-5" />
            Contact inbox
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => { void loadFirstPage(); onUnreadChange?.(); }} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[180px_220px_1fr]">
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ContactStatus | 'all')}>
            <SelectTrigger aria-label="Filter by status"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CONTACT_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger aria-label="Filter by category"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CONTACT_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search loaded messages by name, email, subject or text"
              className="pl-9"
              aria-label="Search messages"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-3" aria-busy="true" aria-label="Loading messages">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2 rounded-md border p-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={() => void loadFirstPage()}>Try again</Button>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <Inbox className="h-8 w-8" />
            <p className="text-sm">
              {messages.length === 0
                ? statusFilter === 'new'
                  ? 'No new messages. You are all caught up.'
                  : 'No messages match these filters.'
                : 'No loaded messages match your search.'}
            </p>
            {messages.length > 0 && hasMore && (
              <p className="text-xs">Search only covers messages loaded so far. Load more to search further back.</p>
            )}
          </div>
        ) : (
          <ul className="divide-y rounded-md border">
            {visible.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(m.id)}
                  className="flex w-full flex-col gap-1 p-4 text-left transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:outline-none"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`truncate ${m.status === 'new' ? 'font-semibold' : 'font-medium'}`}>{m.name}</span>
                    <span className="truncate text-sm text-muted-foreground">{m.email}</span>
                    <span className="ml-auto whitespace-nowrap text-xs text-muted-foreground">{formatDate(m.created_at)}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={STATUS_BADGE[m.status] ?? 'outline'}>{statusLabel(m.status)}</Badge>
                    <Badge variant="outline">{categoryLabel(m.category)}</Badge>
                    {m.subject && <span className="truncate text-sm">{m.subject}</span>}
                  </div>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{m.message}</p>
                </button>
              </li>
            ))}
          </ul>
        )}

        {!loading && !error && hasMore && (
          <div className="mt-4 flex justify-center">
            <Button variant="outline" onClick={() => void loadMore()} disabled={loadingMore}>
              {loadingMore ? 'Loading...' : 'Load more'}
            </Button>
          </div>
        )}
      </CardContent>

      <Sheet open={selected !== null} onOpenChange={(open) => { if (!open) setSelectedId(null); }}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          {selected && (
            <div className="space-y-6">
              <SheetHeader>
                <SheetTitle className="break-words pr-6">{selected.subject || categoryLabel(selected.category)}</SheetTitle>
                <SheetDescription>Received {formatDate(selected.created_at)}</SheetDescription>
              </SheetHeader>

              <dl className="grid grid-cols-[110px_1fr] gap-x-3 gap-y-2 text-sm">
                <dt className="text-muted-foreground">From</dt>
                <dd className="break-words">{selected.name}</dd>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="break-all">{selected.email}</dd>
                <dt className="text-muted-foreground">Category</dt>
                <dd>{categoryLabel(selected.category)}</dd>
                <dt className="text-muted-foreground">Status</dt>
                <dd><Badge variant={STATUS_BADGE[selected.status] ?? 'outline'}>{statusLabel(selected.status)}</Badge></dd>
                <dt className="text-muted-foreground">Page</dt>
                <dd className="break-all">
                  {pageHref ? (
                    <a href={pageHref} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                      {selected.page_url}
                    </a>
                  ) : (
                    selected.page_url || <span className="text-muted-foreground">Not recorded</span>
                  )}
                </dd>
                <dt className="text-muted-foreground">Signed in</dt>
                <dd>{selected.user_id ? 'Yes' : 'No'}</dd>
              </dl>

              <div>
                <h4 className="mb-2 text-sm font-medium">Message</h4>
                {/* Plain text only: React escapes it, and pre-wrap keeps the sender's line breaks. */}
                <div className="whitespace-pre-wrap break-words rounded-md border bg-muted/30 p-4 text-sm">
                  {selected.message}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {replyHref ? (
                  <Button asChild>
                    <a href={replyHref}>
                      <Mail className="mr-2 h-4 w-4" />
                      Reply by email
                    </a>
                  </Button>
                ) : (
                  <Button disabled title="The sender's email address is not valid">
                    <Mail className="mr-2 h-4 w-4" />
                    Reply by email
                  </Button>
                )}
                {selected.status === 'new' && (
                  <Button variant="outline" disabled={busy} onClick={() => void setStatus('in-progress')}>Mark in progress</Button>
                )}
                {selected.status !== 'resolved' && selected.status !== 'spam' && (
                  <Button variant="outline" disabled={busy} onClick={() => void setStatus('resolved')}>Mark resolved</Button>
                )}
                {selected.status !== 'spam' && (
                  <Button variant="outline" disabled={busy} onClick={() => void setStatus('spam')}>Mark as spam</Button>
                )}
                {selected.status !== 'new' && (
                  <Button variant="outline" disabled={busy} onClick={() => void setStatus('new')}>Reopen</Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-note">Internal note</Label>
                <Textarea
                  id="admin-note"
                  value={noteDraft}
                  maxLength={5000}
                  rows={3}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Only admins see this. The sender never does."
                />
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={busy || noteDraft.trim() === (selected.admin_note ?? '').trim()}
                  onClick={() => void saveNote()}
                >
                  Save note
                </Button>
              </div>

              <div className="border-t pt-4">
                <Button variant="destructive" disabled={busy} onClick={() => setConfirmDeleteOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete message
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the message from {selected?.name ?? 'this sender'}. It cannot be undone.
              To hide it without deleting, mark it as resolved or spam instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => { e.preventDefault(); void deleteSelected(); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default AdminInbox;
