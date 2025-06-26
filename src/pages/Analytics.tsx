
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { usePermissions } from '@/hooks/usePermissions';
import LearningAnalyticsDashboard from '@/components/analytics/LearningAnalyticsDashboard';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, User, Users } from 'lucide-react';

const Analytics = () => {
  const { session } = useAuth();
  const { hasRole } = usePermissions();
  const isAdmin = hasRole('admin');

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-2">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Please log in to view your learning analytics</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          {isAdmin ? 'System-wide and personal analytics' : 'Your personal learning insights'}
        </p>
      </div>

      {isAdmin ? (
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="personal" className="gap-2">
              <User className="h-4 w-4" />
              Personal Analytics
            </TabsTrigger>
            <TabsTrigger value="system" className="gap-2">
              <Users className="h-4 w-4" />
              System Analytics
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
  );
};

export default Analytics;
