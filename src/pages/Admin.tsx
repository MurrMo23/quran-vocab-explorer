
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import SEO from '@/components/SEO';
import VocabularyCMS from '@/components/admin/VocabularyCMS';
import AdminCollections from '@/components/admin/AdminCollections';
import AdminUsers from '@/components/admin/AdminUsers';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import ContentManager from '@/components/admin/ContentManager';
import SystemSettings from '@/components/admin/SystemSettings';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminBlog from '@/components/admin/AdminBlog';

const Admin: React.FC = () => {
  const { checkPermission, loading } = usePermissions();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!checkPermission('admin', 'read')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground">
              You don't have permission to access the admin panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Admin Panel"
        description="Administrative dashboard for managing Arabic vocabulary content, users, and system settings."
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage your Arabic vocabulary platform
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vocabulary">Vocabulary</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AdminOverview />
          </TabsContent>

          <TabsContent value="vocabulary">
            <VocabularyCMS />
          </TabsContent>

          <TabsContent value="collections">
            <AdminCollections />
          </TabsContent>

          <TabsContent value="blog">
            <AdminBlog />
          </TabsContent>

          <TabsContent value="users">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="content">
            <ContentManager />
          </TabsContent>

          <TabsContent value="settings">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Admin;
