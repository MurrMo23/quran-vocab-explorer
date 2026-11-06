// Persistence for learner progress.
// - LocalStore: this browser (guests, and signed-in learners when the server is unavailable).
// - SupabaseStore: user_word_progress (FSRS columns) + review_logs.
// The tables/columns added by migration 20261106140000_fsrs_progress.sql are not in the generated
// Database types yet, so every query here goes through the untyped `table()` helper below and is
// mapped to/from typed rows by hand. Keep those casts confined to this file.
import { supabase } from '@/integrations/supabase/client';
import type { CardState, ReviewLog, ReviewSource } from './types';
import { isCardStatus, isRating } from './scheduler';

/** A review log with a client-generated id, so uploads are idempotent. */
export interface StoredLog extends ReviewLog {
  id: string;
  /** Local only: true once this log is known to be on the server. */
  uploaded?: boolean;
}

export const LOCAL_STORAGE_KEY = 'qv-progress-v1';
/**
 * Key used for a signed-in learner while the server is unavailable. Kept separate from the guest
 * key so one account's progress can never be merged into another account on a shared browser.
 */
export const userFallbackKey = (userId: string) => `${LOCAL_STORAGE_KEY}:user:${userId}`;
/** Most logs kept in this browser. Older ones are dropped (cards keep the scheduling state). */
const LOCAL_LOG_CAP = 5000;
/** Days of review history loaded from the server. */
export const SERVER_LOG_DAYS = 90;
const PAGE = 1000;

const REVIEW_SOURCES: readonly ReviewSource[] = ['practice', 'quiz', 'flashcards', 'listening'];
const isSource = (v: unknown): v is ReviewSource =>
  typeof v === 'string' && (REVIEW_SOURCES as readonly string[]).includes(v);

export function makeLogId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const b = crypto.getRandomValues(new Uint8Array(16));
      b[6] = (b[6] & 0x0f) | 0x40;
      b[8] = (b[8] & 0x3f) | 0x80;
      const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
      return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
    }
  } catch {
    // fall through
  }
  // Last resort (very old browsers): time-based, still a valid v4-shaped uuid.
  const t = Date.now().toString(16).padStart(12, '0').slice(-12);
  const c = (performance?.now?.() ?? 0).toString(16).replace('.', '').padEnd(19, '0').slice(0, 19);
  return `${t.slice(0, 8)}-${t.slice(8, 12)}-4${c.slice(0, 3)}-8${c.slice(3, 6)}-${c.slice(6, 18)}`;
}

// ---------------------------------------------------------------------------
// Validation helpers (data from storage or the network is untrusted)
// ---------------------------------------------------------------------------

const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
};
const isoOrNull = (v: unknown): string | null => {
  if (typeof v !== 'string' && !(v instanceof Date)) return null;
  const t = new Date(v as string);
  return Number.isNaN(t.getTime()) ? null : t.toISOString();
};

export function sanitizeCard(raw: unknown): CardState | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.wordId !== 'string' || !r.wordId) return null;
  const due = isoOrNull(r.due) ?? new Date().toISOString();
  return {
    wordId: r.wordId,
    due,
    stability: num(r.stability),
    difficulty: num(r.difficulty),
    reps: Math.max(0, Math.round(num(r.reps))),
    lapses: Math.max(0, Math.round(num(r.lapses))),
    status: isCardStatus(r.status) ? r.status : 'new',
    lastReview: isoOrNull(r.lastReview),
    learningSteps: r.learningSteps === undefined ? undefined : Math.max(0, Math.round(num(r.learningSteps))),
    scheduledDays: r.scheduledDays === undefined ? undefined : Math.max(0, num(r.scheduledDays)),
  };
}

export function sanitizeLog(raw: unknown): StoredLog | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const reviewedAt = isoOrNull(r.reviewedAt);
  if (typeof r.wordId !== 'string' || !r.wordId || !isRating(r.rating) || !reviewedAt) return null;
  return {
    id: typeof r.id === 'string' && r.id ? r.id : makeLogId(),
    wordId: r.wordId,
    rating: r.rating,
    reviewedAt,
    source: isSource(r.source) ? r.source : 'practice',
    elapsedMs: r.elapsedMs === undefined || r.elapsedMs === null ? undefined : Math.max(0, Math.round(num(r.elapsedMs))),
    uploaded: r.uploaded === true ? true : undefined,
  };
}

// ---------------------------------------------------------------------------
// LocalStore
// ---------------------------------------------------------------------------

export interface LocalSnapshot {
  cards: Map<string, CardState>;
  logs: StoredLog[];
}

interface LocalFile {
  version: 1;
  cards: Record<string, CardState>;
  logs: StoredLog[];
}

function getStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null;
  } catch {
    return null;
  }
}

export const LocalStore = {
  load(key: string = LOCAL_STORAGE_KEY): LocalSnapshot {
    const cards = new Map<string, CardState>();
    const logs: StoredLog[] = [];
    try {
      const raw = getStorage()?.getItem(key);
      if (!raw) return { cards, logs };
      const parsed = JSON.parse(raw) as Partial<LocalFile> | null;
      if (parsed && typeof parsed === 'object') {
        for (const value of Object.values(parsed.cards ?? {})) {
          const card = sanitizeCard(value);
          if (card) cards.set(card.wordId, card);
        }
        for (const value of Array.isArray(parsed.logs) ? parsed.logs : []) {
          const log = sanitizeLog(value);
          if (log) logs.push(log);
        }
      }
    } catch {
      // Corrupt or unreadable storage: start empty.
    }
    logs.sort((a, b) => a.reviewedAt.localeCompare(b.reviewedAt));
    return { cards, logs };
  },

  save(cards: ReadonlyMap<string, CardState>, logs: readonly StoredLog[], key: string = LOCAL_STORAGE_KEY): boolean {
    try {
      const storage = getStorage();
      if (!storage) return false;
      const file: LocalFile = {
        version: 1,
        cards: Object.fromEntries(cards),
        logs: logs.slice(-LOCAL_LOG_CAP),
      };
      storage.setItem(key, JSON.stringify(file));
      return true;
    } catch {
      return false; // quota exceeded, private mode, blocked storage...
    }
  },

  clear(key: string = LOCAL_STORAGE_KEY): void {
    try {
      getStorage()?.removeItem(key);
    } catch {
      // ignore
    }
  },

  isEmpty(snapshot: LocalSnapshot): boolean {
    return snapshot.cards.size === 0 && snapshot.logs.length === 0;
  },
};

// ---------------------------------------------------------------------------
// SupabaseStore
// ---------------------------------------------------------------------------

export interface PgErrorLike {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
}

/** Errors meaning the FSRS tables/columns are not deployed (migration not applied yet). */
const MISSING_SCHEMA_CODES = new Set(['42703', '42P01', 'PGRST204', 'PGRST205', 'PGRST200', '42P10']);

export function isMissingSchemaError(err: unknown): boolean {
  const e = err as PgErrorLike | null;
  return !!e && typeof e.code === 'string' && MISSING_SCHEMA_CODES.has(e.code);
}

export class ProgressStoreError extends Error {
  readonly code?: string;
  readonly missingSchema: boolean;
  constructor(op: string, err: PgErrorLike | null | undefined) {
    super(`${op}: ${err?.message ?? 'unknown error'}`);
    this.name = 'ProgressStoreError';
    this.code = err?.code;
    this.missingSchema = isMissingSchemaError(err);
  }
}

interface ProgressRow {
  word_id: string;
  stability: number | null;
  difficulty: number | null;
  due: string | null;
  reps: number | null;
  lapses: number | null;
  state: string | null;
  last_review: string | null;
}

interface ReviewLogRow {
  id: string;
  word_id: string;
  rating: string;
  source: string | null;
  elapsed_ms: number | null;
  reviewed_at: string;
}

type QueryResult<T> = { data: T | null; error: PgErrorLike | null };

/** Minimal shape of the PostgREST builder methods used here. */
interface UntypedQuery<T> extends PromiseLike<QueryResult<T>> {
  select(columns: string): UntypedQuery<T>;
  eq(column: string, value: string): UntypedQuery<T>;
  gte(column: string, value: string): UntypedQuery<T>;
  order(column: string, opts: { ascending: boolean }): UntypedQuery<T>;
  range(from: number, to: number): UntypedQuery<T>;
}
interface UntypedTable<Row> {
  select(columns: string): UntypedQuery<Row[]>;
  upsert(rows: Record<string, unknown>[], opts: { onConflict: string; ignoreDuplicates?: boolean }): PromiseLike<QueryResult<null>>;
}

// The only place the generated Database types are bypassed.
function table<Row>(name: 'user_word_progress' | 'review_logs'): UntypedTable<Row> {
  return supabase.from(name as never) as unknown as UntypedTable<Row>;
}

const PROGRESS_COLUMNS = 'word_id, stability, difficulty, due, reps, lapses, state, last_review';
const LOG_COLUMNS = 'id, word_id, rating, source, elapsed_ms, reviewed_at';

function rowToCard(row: ProgressRow): CardState | null {
  return sanitizeCard({
    wordId: row.word_id,
    due: row.due,
    stability: row.stability,
    difficulty: row.difficulty,
    reps: row.reps,
    lapses: row.lapses,
    status: row.state,
    lastReview: row.last_review,
  });
}

function rowToLog(row: ReviewLogRow): StoredLog | null {
  const log = sanitizeLog({
    id: row.id,
    wordId: row.word_id,
    rating: row.rating,
    source: row.source,
    elapsedMs: row.elapsed_ms,
    reviewedAt: row.reviewed_at,
  });
  if (log) log.uploaded = true;
  return log;
}

function cardToRow(userId: string, card: CardState): Record<string, unknown> {
  return {
    user_id: userId,
    word_id: card.wordId,
    collection_id: 'general',
    stability: card.stability,
    difficulty: card.difficulty,
    due: card.due,
    reps: card.reps,
    lapses: card.lapses,
    state: card.status,
    last_review: card.lastReview,
    // Legacy columns kept in sync for older readers.
    next_review: card.due,
    last_reviewed: card.lastReview,
    review_count: card.reps,
    updated_at: new Date().toISOString(),
  };
}

function logToRow(userId: string, log: StoredLog): Record<string, unknown> {
  return {
    id: log.id,
    user_id: userId,
    word_id: log.wordId,
    rating: log.rating,
    source: log.source,
    elapsed_ms: log.elapsedMs ?? null,
    reviewed_at: log.reviewedAt,
  };
}

async function fetchAll<Row>(build: (from: number, to: number) => UntypedQuery<Row[]>, op: string): Promise<Row[]> {
  const out: Row[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await build(from, from + PAGE - 1);
    if (error) throw new ProgressStoreError(op, error);
    const rows = data ?? [];
    out.push(...rows);
    if (rows.length < PAGE || out.length >= 50_000) break;
  }
  return out;
}

export const SupabaseStore = {
  async load(userId: string, now: Date = new Date()): Promise<LocalSnapshot> {
    const since = new Date(now.getTime() - SERVER_LOG_DAYS * 86_400_000).toISOString();
    const [cardRows, logRows] = await Promise.all([
      fetchAll<ProgressRow>(
        (from, to) =>
          table<ProgressRow>('user_word_progress')
            .select(PROGRESS_COLUMNS)
            .eq('user_id', userId)
            .order('word_id', { ascending: true })
            .range(from, to),
        'load user_word_progress',
      ),
      fetchAll<ReviewLogRow>(
        (from, to) =>
          table<ReviewLogRow>('review_logs')
            .select(LOG_COLUMNS)
            .eq('user_id', userId)
            .gte('reviewed_at', since)
            .order('reviewed_at', { ascending: true })
            .range(from, to),
        'load review_logs',
      ),
    ]);
    const cards = new Map<string, CardState>();
    for (const row of cardRows) {
      const card = rowToCard(row);
      // Rows created by the legacy scheduler and never backfilled have no FSRS state: skip them.
      if (card && (card.lastReview !== null || card.reps > 0)) cards.set(card.wordId, card);
    }
    const logs: StoredLog[] = [];
    for (const row of logRows) {
      const log = rowToLog(row);
      if (log) logs.push(log);
    }
    return { cards, logs };
  },

  async upsertCards(userId: string, cards: readonly CardState[]): Promise<void> {
    if (cards.length === 0) return;
    const { error } = await table('user_word_progress').upsert(
      cards.map((c) => cardToRow(userId, c)),
      { onConflict: 'user_id,word_id' },
    );
    if (error) throw new ProgressStoreError('upsert user_word_progress', error);
  },

  async insertLogs(userId: string, logs: readonly StoredLog[]): Promise<void> {
    if (logs.length === 0) return;
    for (let i = 0; i < logs.length; i += PAGE) {
      const chunk = logs.slice(i, i + PAGE);
      const { error } = await table('review_logs').upsert(
        chunk.map((l) => logToRow(userId, l)),
        { onConflict: 'id', ignoreDuplicates: true },
      );
      if (error) throw new ProgressStoreError('insert review_logs', error);
    }
  },
};

/** For each word keep the card with the later lastReview (server wins ties). */
export function mergeCards(
  server: ReadonlyMap<string, CardState>,
  guest: ReadonlyMap<string, CardState>,
): { merged: Map<string, CardState>; toUpload: CardState[] } {
  const merged = new Map(server);
  const toUpload: CardState[] = [];
  for (const [wordId, g] of guest) {
    if (!g.lastReview) continue;
    const s = server.get(wordId);
    const sTime = s?.lastReview ? new Date(s.lastReview).getTime() : -Infinity;
    if (new Date(g.lastReview).getTime() > sTime) {
      merged.set(wordId, g);
      toUpload.push(g);
    }
  }
  return { merged, toUpload };
}

/** Union of logs by id, oldest first. */
export function mergeLogs(a: readonly StoredLog[], b: readonly StoredLog[]): StoredLog[] {
  const byId = new Map<string, StoredLog>();
  for (const log of a) byId.set(log.id, log);
  for (const log of b) if (!byId.has(log.id)) byId.set(log.id, log);
  return [...byId.values()].sort((x, y) => x.reviewedAt.localeCompare(y.reviewedAt));
}
