
import React, { useState } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminCollections from '@/components/admin/AdminCollections';
import AdminVocabulary from '@/components/admin/AdminVocabulary';
import AdminContent from '@/components/admin/AdminContent';
import AdminAds from '@/components/admin/AdminAds';
import SystemSettings from '@/components/admin/SystemSettings';
import { supabase } from '@/integrations/supabase/client';
import { Database, Users, BookOpen, FileText, Activity, Settings, Megaphone, Globe } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details?: any;
  timestamp: string;
}

const Admin = () => {
  const { isAuthorized, isLoading } = useProtectedRoute({ 
    requiredRole: 'admin' 
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  const logAuditEvent = async (
    action: string, 
    entityType: string, 
    entityId: string | null, 
    details?: any
  ) => {
    try {
      const logEntry: AuditLogEntry = {
        id: Date.now().toString(),
        action,
        entityType,
        entityId,
        details,
        timestamp: new Date().toISOString()
      };

      // In a real app, you would store this in Supabase
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          action,
          entity_type: entityType,
          entity_id: entityId,
          details
        });

      if (error) {
        console.error('Failed to log audit event:', error);
      }

      // Update local state for demo
      setAuditLogs(prev => [logEntry, ...prev].slice(0, 50)); // Keep last 50 entries
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              You don't have permission to access the admin panel.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, content, and system settings
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="vocabulary" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Vocabulary
          </TabsTrigger>
          <TabsTrigger value="collections" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Collections
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="ads" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Ads
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vocabulary Words</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,847</div>
                <p className="text-xs text-muted-foreground">+45 this week</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collections</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">+2 this month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">128</div>
                <p className="text-xs text-muted-foreground">+8% from yesterday</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {auditLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-2 rounded border">
                    <div>
                      <span className="font-medium">{log.action}</span>
                      <span className="text-muted-foreground"> on {log.entityType}</span>
                      {log.entityId && <span className="text-sm"> (ID: {log.entityId})</span>}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No recent activity to display.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <AdminUsers onAuditLog={logAuditEvent} />
        </TabsContent>

        <TabsContent value="vocabulary">
          <AdminVocabulary onAuditLog={logAuditEvent} />
        </TabsContent>

        <TabsContent value="collections">
          <AdminCollections onAuditLog={logAuditEvent} />
        </TabsContent>

        <TabsContent value="content">
          <AdminContent onAuditLog={logAuditEvent} />
        </TabsContent>

        <TabsContent value="ads">
          <AdminAds onAuditLog={logAuditEvent} />
        </TabsContent>

        <TabsContent value="settings">
          <SystemSettings onAuditLog={logAuditEvent} />
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold">Application Version</h4>
                    <p className="text-muted-foreground">v2.1.0</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Database Status</h4>
                    <p className="text-green-600">Connected</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Cache Status</h4>
                    <p className="text-green-600">Active</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Last Backup</h4>
                    <p className="text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Quick Actions</h4>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Clear Cache</Button>
                    <Button variant="outline" size="sm">Run Backup</Button>
                    <Button variant="outline" size="sm">System Check</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
