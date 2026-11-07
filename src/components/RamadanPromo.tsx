import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RAMADAN_DAYS, WORDS_PER_DAY, ramadanPhase, type RamadanPhase } from '@/lib/ramadan-plan';

/** Compact link card to /ramadan; the line under the title depends on today's date (set after mount). */
const RamadanPromo: React.FC<{ className?: string }> = ({ className }) => {
  const [phase, setPhase] = useState<RamadanPhase | null>(null);
  useEffect(() => setPhase(ramadanPhase()), []);

  const line =
    phase?.kind === 'during'
      ? `Ramadan Mubarak: today is Day ${phase.day}. Keep going.`
      : phase?.kind === 'after'
        ? 'Learn the words you heard in taraweeh, one day at a time.'
        : 'Starts around 8 Feb — prepare now.';

  return (
    <Link
      to="/ramadan"
      className={cn(
        'group flex items-center gap-4 rounded-xl border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary',
        className,
      )}
      data-testid="ramadan-promo"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Moon className="h-5 w-5 text-primary" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">
          Ramadan plan: {RAMADAN_DAYS} days × {WORDS_PER_DAY} words
        </span>
        <span className="block text-sm text-muted-foreground">{line}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  );
};

export default RamadanPromo;
