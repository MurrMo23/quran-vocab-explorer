
import React, { useEffect, useState } from 'react';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminCollections from '@/components/admin/AdminCollections';
import AdminVocabulary from '@/components/admin/AdminVocabulary';
import AdminContent from '@/components/admin/AdminContent';
import AdminSystem from '@/components/admin/AdminSystem';
import SiteBranding from '@/components/admin/SiteBranding';
import AdminInbox from '@/components/admin/AdminInbox';
import { Badge } from '@/components/ui/badge';
import { useUnreadContactCount } from '@/hooks/useUnreadContactCount';
import { useAdminOverviewStats } from '@/hooks/useAdminOverviewStats';
import type { LucideIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { Database, Users, BookOpen, FileText, Activity, Globe, Palette, Inbox } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details?: Json;
  timestamp: string;
}

const fmt = (n: number | null) => (n === null ? '\u2013' : n.toLocaleString());

const StatCard = ({ title, icon: Icon, value, note }: { title: string; icon: LucideIcon; value: string; note: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{note}</p>
    </CardContent>
  </Card>
);

const Admin = () => {
  const { isAuthorized, isLoading } = useProtectedRoute({ 
    requiredRole: 'admin' 
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const { count: unreadCount, refresh: refreshUnread } = useUnreadContactCount(isAuthorized === true);
  const stats = useAdminOverviewStats(isAuthorized === true);

  // Recent Activity shows the real audit log (admin-readable via RLS), newest first.
  useEffect(() => {
    if (isAuthorized !== true) return;
    let cancelled = false;
    void supabase
      .from('audit_logs')
      .select('id, action, entity_type, entity_id, details, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        setAuditLogs(
          data.map((r) => ({
            id: r.id,
            action: r.action,
            entityType: r.entity_type,
            entityId: r.entity_id,
            details: r.details ?? undefined,
            timestamp: r.created_at,
          })),
        );
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthorized]);

  const logAuditEvent = async (
    action: string,
    entityType: string,
    entityId: string | null,
    details?: Json
  ) => {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert({ action, entity_type: entityType, entity_id: entityId, details })
        .select('id, created_at')
        .single();

      if (error) {
        console.error('Failed to log audit event:', error);
        return;
      }

      setAuditLogs((prev) =>
        [{ id: data.id, action, entityType, entityId, details, timestamp: data.created_at }, ...prev].slice(0, 50),
      );
    } catch (error) {
      console.error('Error logging audit event:', error);
    }
  };

  // isAuthorized is null until the role check has completed; never render admin UI before that.
  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (isAuthorized !== true) {
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Inbox
            {unreadCount !== null && unreadCount > 0 && (
              <Badge className="ml-1 h-5 min-w-5 justify-center px-1.5" aria-label={`${unreadCount} new messages`}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
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
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="mb-6">
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Inbox className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">New contact messages</p>
                  <p className="text-2xl font-bold">{unreadCount === null ? '–' : unreadCount}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('inbox')}>
                Open inbox
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Registered users"
              icon={Users}
              value={fmt(stats.totalUsers)}
              note="Accounts with a profile"
            />
            <StatCard
              title="New users (30 days)"
              icon={Activity}
              value={fmt(stats.newUsers30d)}
              note={
                stats.newUsersPrev30d === null
                  ? '\u00a0'
                  : `${stats.newUsersPrev30d.toLocaleString()} in the 30 days before`
              }
            />
            <StatCard
              title="Vocabulary words"
              icon={BookOpen}
              value={stats.words.toLocaleString()}
              note={`${stats.verifiedWords.toLocaleString()} with corpus-verified frequency`}
            />
            <StatCard
              title="Collections"
              icon={Database}
              value={stats.collections.toLocaleString()}
              note="Collections with at least one word"
            />
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

        <TabsContent value="inbox">
          <AdminInbox onAuditLog={logAuditEvent} onUnreadChange={() => void refreshUnread()} />
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

        <TabsContent value="branding">
          <SiteBranding onAuditLog={logAuditEvent} />
        </TabsContent>

        <TabsContent value="system">
          <AdminSystem />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
