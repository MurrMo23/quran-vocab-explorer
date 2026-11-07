import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  RAMADAN_DAYS,
  RAMADAN_START_LABEL,
  WORDS_PER_DAY,
  ramadanPhase,
  type RamadanPhase,
} from '@/lib/ramadan-plan';

/** "8 February 2027" -> "8 February" (non-breaking space) */
const START_DAY_MONTH = RAMADAN_START_LABEL.replace(/\s+\d{4}$/, '').replace(' ', '\u00a0');

/**
 * Home page band linking to /ramadan. Always dark ink in both themes (like the footer), so it carries
 * the `dark` class and its gold button uses the dark-theme tokens. The line under the title depends on
 * today's date, so it is set after mount; the server renders the "before Ramadan" line.
 */
const RamadanPromo: React.FC<{ className?: string }> = ({ className }) => {
  const [phase, setPhase] = useState<RamadanPhase | null>(null);
  useEffect(() => setPhase(ramadanPhase()), []);

  const line =
    phase?.kind === 'during'
      ? `Ramadan Mubarak: today is Day ${phase.day}. Keep going.`
      : phase?.kind === 'after'
        ? 'Learn the words you heard in Taraweeh, one day at a time.'
        : `Recognise more of what you hear in Taraweeh. Starts around ${START_DAY_MONTH}.`;

  return (
    <section
      className={cn('mx-auto max-w-6xl px-4 pt-12 sm:px-6 sm:pt-16', className)}
      aria-labelledby="ramadan-promo-heading"
      data-testid="ramadan-promo"
    >
      <div className="dark flex flex-wrap items-center justify-between gap-6 rounded-[28px] bg-[#10231F] p-6 text-[#EEF3F0] ring-1 ring-inset ring-white/5 sm:p-8">
        <div className="flex min-w-0 flex-[1_1_420px] items-start gap-4 sm:items-center sm:gap-5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-[#1F3832] text-[#E3B455] sm:h-16 sm:w-16">
            <Moon className="h-7 w-7 sm:h-[30px] sm:w-[30px]" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id="ramadan-promo-heading" className="text-[22px] font-extrabold leading-tight sm:text-[28px]">
              Ramadan plan: {RAMADAN_DAYS} days × {WORDS_PER_DAY} words
            </h2>
            <p className="mt-1 text-[15px] text-[#A3B5AE] sm:text-base">{line}</p>
          </div>
        </div>
        <Button asChild variant="gold" className="h-[52px] w-full px-[22px] text-base font-extrabold sm:w-auto">
          <Link to="/ramadan">See the plan</Link>
        </Button>
      </div>
    </section>
  );
};

export default RamadanPromo;
