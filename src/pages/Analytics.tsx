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
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-2">
          <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
            <Link to="/dashboard">
              <ChevronLeft className="mr-1 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Learning analytics</h1>
          <p className="text-muted-foreground">A detailed look at your reviews over the last 30 days.</p>
        </div>

        {isAdmin ? (
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
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
