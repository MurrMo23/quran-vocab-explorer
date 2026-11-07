import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, User, Users } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { usePermissions } from '@/hooks/usePermissions';
import LearningAnalyticsDashboard from '@/components/analytics/LearningAnalyticsDashboard';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SEO from '@/components/SEO';

/** Detailed view of the learner's progress. Works for guests (progress lives in this browser). */
const Analytics = () => {
  const { session } = useAuth();
  const { hasRole } = usePermissions();
  const isAdmin = !!session && hasRole('admin');

  return (
    <>
      <SEO
        title="Learning Analytics"
        description="Detailed view of your Quranic vocabulary reviews: daily activity, accuracy trend, hardest words and upcoming reviews."
        url="https://quranvocab.com/analytics"
        type="website"
      />
      <div className="mx-auto max-w-5xl space-y-6 px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
        <div className="flex flex-col gap-2">
          <Button asChild variant="ghost" className="-ml-3 w-fit">
            <Link to="/dashboard">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Learning analytics</h1>
          <p className="text-muted-foreground">A detailed look at your reviews over the last 30 days.</p>
        </div>

        {isAdmin ? (
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid h-12 w-full grid-cols-2 rounded-2xl">
              <TabsTrigger value="personal" className="gap-2">
                <User className="h-4 w-4" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="system" className="gap-2">
                <Users className="h-4 w-4" />
                System
              </TabsTrigger>
            </TabsList>
            <TabsContent value="personal">
              <LearningAnalyticsDashboard />
            </TabsContent>
            <TabsContent value="system">
              <AnalyticsDashboard />
            </TabsContent>
          </Tabs>
        ) : (
          <LearningAnalyticsDashboard />
        )}
      </div>
    </>
  );
};

export default Analytics;
