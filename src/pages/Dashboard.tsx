import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, BookText, Brain, CloudOff, Database, Info, Settings, Sparkles } from 'lucide-react';
import { useProgress } from '@/lib/progress';
import { usePermissions } from '@/hooks/usePermissions';
import ProgressStats from '@/components/ProgressStats';
import ProgressReport from '@/components/ProgressReport';
import CollectionProgressTracker from '@/components/CollectionProgressTracker';
import AchievementSystem from '@/components/achievement/AchievementSystem';
import StreakCounter from '@/components/StreakCounter';
import SearchBar from '@/components/SearchBar';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { loading, isGuest, offlineFallback, stats, cards, logs } = useProgress();
  const { hasRole } = usePermissions();
  const isAdmin = !isGuest && hasRole('admin');

  const isNewLearner = !loading && logs.length === 0 && stats.wordsStarted === 0;

  return (
    <>
      <SEO
        title="Your Dashboard"
        description="Track your Quranic Arabic vocabulary progress: words started and mastered, reviews due, streaks and accuracy."
        keywords={['Arabic dashboard', 'vocabulary progress', 'Quranic learning']}
        url="https://quranvocab.com/dashboard"
        type="website"
      />
      <div className="mx-auto max-w-5xl space-y-6 px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Dashboard</h1>
            {loading ? (
              <Skeleton className="h-6 w-28" />
            ) : (
              <div className="flex items-center gap-2">
                <StreakCounter streak={stats.currentStreak} />
                <span className="text-sm text-muted-foreground">
                  {stats.currentStreak > 0
                    ? stats.reviewsToday > 0
                      ? 'You reviewed today. Keep it going!'
                      : 'Review today to keep your streak.'
                    : 'Review today to start a streak.'}
                </span>
              </div>
            )}
          </div>
          <SearchBar className="w-full md:w-64" />
        </div>

        {isGuest && (
          <Alert className="rounded-2xl border-0 bg-secondary text-secondary-foreground">
            <Info className="h-4 w-4" />
            <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>Your progress is saved in this browser. Sign in to keep it across devices.</span>
              <Button asChild size="sm" variant="outline" className="shrink-0">
                <Link to="/auth">Sign in</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {!isGuest && offlineFallback && (
          <Alert>
            <CloudOff className="h-4 w-4" />
            <AlertDescription>
              We couldn't reach the server, so your progress is being saved in this browser for now.
            </AlertDescription>
          </Alert>
        )}

        {isAdmin && (
          <Card className="rounded-3xl border-primary/25 bg-secondary/50 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Settings className="h-5 w-5" />
                Admin Panel
              </CardTitle>
              <CardDescription>Manage the platform with full administrative access</CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/admin">
                  <Database className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </Link>
              </Button>
            </CardFooter>
          </Card>
        )}

        {isNewLearner ? (
          <Card className="rounded-3xl border-2 border-b-[5px] shadow-none">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <div className="rounded-2xl bg-secondary p-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold">Your journey starts with one word</h2>
                <p className="mx-auto max-w-md text-muted-foreground">
                  Review a few words and this page will track what you've learned, what's due, and your daily
                  streak. A few minutes a day is all it takes.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button asChild size="lg">
                  <Link to="/review">
                    <Brain className="mr-2 h-5 w-5" />
                    Start your first review
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/collections">
                    <BookText className="mr-2 h-5 w-5" />
                    Browse collections
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="card-tactile flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
              {loading ? (
                <Skeleton className="h-6 w-56" />
              ) : (
                <div>
                  <div className="text-xl font-extrabold">
                    {stats.dueNow > 0
                      ? `${stats.dueNow} word${stats.dueNow === 1 ? '' : 's'} ready for review`
                      : "You're all caught up"}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {stats.dueNow > 0
                      ? 'Reviewing on time is what makes words stick.'
                      : 'Nothing is due right now. You can still learn new words.'}
                  </p>
                </div>
              )}
              <Button asChild size="lg" className="shrink-0">
                <Link to="/review">
                  <Brain className="mr-2 h-5 w-5" />
                  {loading
                    ? 'Review'
                    : stats.dueNow > 0
                      ? `Review ${stats.dueNow} due word${stats.dueNow === 1 ? '' : 's'}`
                      : 'Learn new words'}
                </Link>
              </Button>
            </div>

            <ProgressStats stats={stats} loading={loading} />

            <ProgressReport data={stats.reviewsLast7Days} loading={loading} />

            <CollectionProgressTracker cards={cards} loading={loading} />

            <AchievementSystem />

            <div className="flex justify-center">
              <Button asChild variant="outline">
                <Link to="/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Detailed analytics
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
