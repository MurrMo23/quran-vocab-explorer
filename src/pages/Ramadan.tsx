import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, CheckCircle2, Moon, Play } from 'lucide-react';
import SEO from '@/components/SEO';
import PageTrail from '@/components/quran/PageTrail';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProgress } from '@/lib/progress';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import { getWordById } from '@/utils/vocabulary';
import { getWordPath } from '@/utils/word-slugs';
import { reviewWordsUrl } from '@/components/review/review-session';
import {
  RAMADAN_DAYS,
  RAMADAN_START_LABEL,
  WORDS_PER_DAY,
  buildRamadanIcs,
  formatPlanDate,
  getRamadanPlan,
  ramadanDayDate,
  ramadanPhase,
  ramadanPlanCoverage,
  type RamadanDay,
  type RamadanPhase,
} from '@/lib/ramadan-plan';

const TITLE = 'Ramadan 30-Day Quran Vocabulary Plan: Learn the Words You Hear in Taraweeh';
const PATH = '/ramadan';

interface DayProgress {
  started: number;
  known: number;
}

const downloadIcs = () => {
  const ics = buildRamadanIcs();
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quranvocab-ramadan-plan.ics';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  track('ramadan_calendar_download');
};

const PhaseNote: React.FC<{ phase: RamadanPhase | null }> = ({ phase }) => {
  if (!phase) return null;
  if (phase.kind === 'before')
    return (
      <p className="font-medium text-primary" data-testid="ramadan-phase">
        {phase.daysUntil === 1 ? 'Ramadan starts tomorrow, in sha Allah.' : `About ${phase.daysUntil} days to go: start preparing now.`}
      </p>
    );
  if (phase.kind === 'during')
    return (
      <p className="font-medium text-primary" data-testid="ramadan-phase">
        Today is Day {phase.day}. <a href={`#day-${phase.day}`} className="underline">Go to today’s words</a>
      </p>
    );
  return (
    <p className="font-medium text-primary" data-testid="ramadan-phase">
      Ramadan 2027 has ended. The plan still works any time of year: one day of words at a time.
    </p>
  );
};

const DayCard: React.FC<{ d: RamadanDay; progress: DayProgress | null; today: boolean }> = ({ d, progress, today }) => {
  const total = d.words.length;
  const done = progress !== null && progress.known >= total;
  return (
    <li
      id={`day-${d.day}`}
      className={cn('min-w-0 scroll-mt-24 rounded-xl border bg-card p-4 shadow-sm', today && 'border-primary ring-2 ring-primary/30')}
      data-testid="ramadan-day"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="text-lg font-semibold">
          Day {d.day}
          {today && <Badge className="ml-2 align-middle">Today</Badge>}
        </h3>
        <span className="text-sm text-muted-foreground">{formatPlanDate(ramadanDayDate(d.day))}</span>
      </div>
      {d.theme && (
        <p className="mt-1 text-sm">
          <span className="font-medium text-primary">{d.theme.title}.</span>{' '}
          <span className="text-muted-foreground">{d.theme.note}</span>
        </p>
      )}
      <ul className="mt-3 divide-y">
        {d.words.map((id) => {
          const w = getWordById(id);
          if (!w) return null;
          return (
            <li key={id}>
              <Link to={getWordPath(w)} className="flex items-center gap-3 py-1.5 hover:text-primary">
                <span className="min-w-[4.5rem] max-w-[55%] text-right font-arabic text-xl leading-snug" lang="ar" dir="rtl">
                  {w.arabic}
                </span>
                <span className="line-clamp-2 min-w-0 flex-1 text-sm leading-snug">{w.meaning}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      {d.revisit.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Also in this surah, from earlier days:{' '}
          {d.revisit
            .map((id) => getWordById(id)?.transliteration)
            .filter(Boolean)
            .join(', ')}
          .
        </p>
      )}
      <div className="mt-3 flex items-center gap-3">
        <Button asChild size="sm" variant={done ? 'outline' : 'default'}>
          <Link
            to={reviewWordsUrl(d.words)}
            onClick={() => track('ramadan_day_start', { day: d.day })}
            data-testid={`start-day-${d.day}`}
          >
            <Play className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            {done ? `Review Day ${d.day}` : `Start Day ${d.day}`}
          </Link>
        </Button>
        {/* Filled in after mount from this browser's / account's progress; blank in the static HTML. */}
        <span className="text-xs text-muted-foreground" data-testid={`day-progress-${d.day}`} aria-live="polite">
          {progress &&
            (done ? (
              <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> All {total} known
              </span>
            ) : progress.started > 0 ? (
              `${progress.started}/${total} started · ${progress.known} known`
            ) : (
              `0/${total} started`
            ))}
        </span>
      </div>
    </li>
  );
};

const Ramadan = () => {
  const plan = useMemo(() => getRamadanPlan(), []);
  const coverage = useMemo(() => ramadanPlanCoverage(), []);
  const { cards, loading } = useProgress();
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<RamadanPhase | null>(null);
  useEffect(() => {
    setMounted(true);
    setPhase(ramadanPhase());
  }, []);

  const progress = useMemo(() => {
    if (!mounted || loading) return null;
    return plan.map((d) => {
      let started = 0;
      let known = 0;
      for (const id of d.words) {
        const c = cards.get(id);
        if (!c?.lastReview) continue;
        started++;
        if (c.status === 'review') known++;
      }
      return { started, known };
    });
  }, [mounted, loading, plan, cards]);

  const todayDay = phase?.kind === 'during' ? phase.day : null;
  const startDay = todayDay ?? 1;
  const day1 = plan[0];
  const lastDate = formatPlanDate(ramadanDayDate(RAMADAN_DAYS));

  const description = `A free 30-day plan to learn about ${WORDS_PER_DAY} Quranic Arabic words a day this Ramadan, most frequent first, so you understand more of what you hear in taraweeh. ${coverage.words} words that make up about ${Math.round(coverage.quranPercent)}% of the Quran's words. Starts around ${RAMADAN_START_LABEL}.`;

  return (
    <>
      <SEO
        title={TITLE}
        description={description}
        url={PATH}
        keywords={['Ramadan Quran plan', 'Ramadan vocabulary', 'taraweeh', 'Quranic Arabic words', 'Ramadan 2027', 'learn Quran Arabic in Ramadan']}
        type="website"
        breadcrumbs={[{ name: 'Ramadan plan', path: PATH }]}
      />

      <div className="container mx-auto max-w-5xl py-6">
        <PageTrail items={[{ name: 'Ramadan plan', path: PATH }]} />

        <header className="mb-6 max-w-3xl">
          <p className="font-arabic text-3xl text-primary" lang="ar" dir="rtl">
            رمضان
          </p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{TITLE}</h1>
          <p className="mt-3 text-muted-foreground">
            {RAMADAN_DAYS} days, about {WORDS_PER_DAY} words a day. The words come in order of how often they occur in
            the Quran and in Juz Amma, so the first days already cover much of what you hear recited. Together the{' '}
            {coverage.words} words make up about <strong className="text-foreground">{coverage.quranPercent}%</strong> of
            the words of the Quran and <strong className="text-foreground">{coverage.juzAmmaPercent}%</strong> of Juz Amma.
          </p>
        </header>

        <section className="mb-8 rounded-xl border bg-secondary/30 p-4 sm:p-5" aria-labelledby="dates-heading">
          <h2 id="dates-heading" className="flex items-center gap-2 text-lg font-semibold">
            <Moon className="h-5 w-5 text-primary" aria-hidden="true" />
            Ramadan 2027 (1448 AH)
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ramadan is expected to begin around <strong className="text-foreground">{RAMADAN_START_LABEL}</strong>, subject
            to the sighting of the moon; the date in your country may differ by a day. The dates below assume Day 1 is{' '}
            {formatPlanDate(ramadanDayDate(1))} and Day {RAMADAN_DAYS} is {lastDate}.
          </p>
          <div className="mt-3 min-h-[1.5rem]">
            <PhaseNote phase={phase} />
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
            <Button asChild size="lg">
              <Link
                to={reviewWordsUrl(plan[startDay - 1].words)}
                onClick={() => track('ramadan_day_start', { day: startDay })}
                data-testid="start-plan"
              >
                <Play className="mr-2 h-4 w-4" aria-hidden="true" />
                Start Day {startDay}
              </Link>
            </Button>
            <div>
              <Button size="lg" variant="outline" onClick={downloadIcs} data-testid="download-ics">
                <CalendarPlus className="mr-2 h-4 w-4" aria-hidden="true" />
                Add to calendar (.ics file)
              </Button>
              <p className="mt-1.5 max-w-sm text-xs text-muted-foreground">
                Downloads a calendar file with {RAMADAN_DAYS} daily reminders at 8:00 pm your local time,{' '}
                {formatPlanDate(ramadanDayDate(1))} – {lastDate} 2027. Open it with Google Calendar, Apple Calendar or
                Outlook. It is made in your browser; nothing is sent to us.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="plan-heading">
          <h2 id="plan-heading" className="mb-1 text-xl font-semibold">
            The 30 days
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Each day starts a short review of that day’s words; words you have learned come back on their own in your daily
            Review. Day 1 begins with {day1.theme?.title ?? 'the most common words'}.
          </p>
          <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {plan.map((d, i) => (
              <DayCard key={d.day} d={d} progress={progress ? progress[i] : null} today={todayDay === d.day} />
            ))}
          </ol>
        </section>

        <section className="mt-10 max-w-3xl space-y-3 border-t pt-6 text-sm text-muted-foreground" aria-labelledby="how-heading">
          <h2 id="how-heading" className="text-lg font-semibold text-foreground">
            How the plan was made
          </h2>
          <p>
            Every word is scored by how often it occurs in the whole Quran, with extra weight for Juz Amma, the short
            surahs most often recited in prayer. Day 1 is Al-Fatiha, which you hear in every rak‘ah; Day 27 is Surah
            Al-Qadr, for the last ten nights; Day 30 closes with Al-Ikhlas, Al-Falaq and An-Nas. Counts come from the
            Quranic Arabic Corpus, where every form of a word counts toward it.
          </p>
          <p>
            Your progress is saved in this browser, or in your account if you{' '}
            <Link to="/auth" className="underline hover:text-primary">
              sign in
            </Link>
            . Prefer a different focus? See{' '}
            <Link to="/surahs" className="underline hover:text-primary">
              surah vocabulary
            </Link>{' '}
            or the{' '}
            <Link to="/collections" className="underline hover:text-primary">
              themed collections
            </Link>
            .
          </p>
        </section>
      </div>
    </>
  );
};

export default Ramadan;
