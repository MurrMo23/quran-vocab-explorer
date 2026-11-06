import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database, Json, Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldMinus,
  ShieldPlus,
  UserCircle,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';

type AppRole = Database['public']['Enums']['app_role'];
type UserProfile = Pick<Tables<'user_profiles'>, 'id' | 'username' | 'full_name' | 'avatar_url' | 'created_at'>;

interface AdminUsersProps {
  onAuditLog?: (action: string, entityType: string, entityId: string | null, details?: Json) => Promise<void>;
}

interface PendingChange {
  user: UserProfile;
  role: ManagedRole;
  action: 'grant' | 'revoke';
}

const PAGE_SIZE = 25;
const MANAGED_ROLES = ['admin', 'moderator'] as const;
type ManagedRole = (typeof MANAGED_ROLES)[number];

const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Admin',
  moderator: 'Moderator',
  user: 'User',
};

/**
 * Build a safe ilike pattern for a PostgREST `.or()` filter.
 * Characters that are reserved in the filter syntax are replaced with spaces,
 * and LIKE wildcards (% and _) are escaped so they match literally.
 */
const buildSearchPattern = (raw: string): string | null => {
  const cleaned = raw.replace(/[,()"*\\]/g, ' ').trim();
  if (!cleaned) return null;
  const escaped = cleaned.replace(/[%_]/g, (m) => `\\${m}`);
  return `%${escaped}%`;
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const displayName = (user: UserProfile) => user.full_name || user.username || 'Unnamed user';

const AdminUsers: React.FC<AdminUsersProps> = ({ onAuditLog }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [rolesByUser, setRolesByUser] = useState<Record<string, AppRole[]>>({});
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
  }, []);

  // Debounce the search box so we don't query on every keystroke
  useEffect(() => {
    const handle = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
      setPage(0);
    }, 350);
    return () => window.clearTimeout(handle);
  }, [searchInput]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      let query = supabase
        .from('user_profiles')
        .select('id, username, full_name, avatar_url, created_at', { count: 'exact' })
        .order('created_at', { ascending: false, nullsFirst: false })
        .range(from, to);

      const pattern = buildSearchPattern(searchQuery);
      if (pattern) {
        query = query.or(`username.ilike.${pattern},full_name.ilike.${pattern}`);
      }

      const { data, error: profilesError, count } = await query;
      if (profilesError) throw profilesError;

      const profiles = data ?? [];
      setUsers(profiles);
      setTotalCount(count ?? 0);

      if (profiles.length === 0) {
        setRolesByUser({});
        return;
      }

      const { data: roleRows, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', profiles.map((p) => p.id));
      if (rolesError) throw rolesError;

      const map: Record<string, AppRole[]> = {};
      for (const row of roleRows ?? []) {
        (map[row.user_id] ??= []).push(row.role);
      }
      setRolesByUser(map);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const hasRole = (userId: string, role: AppRole) => rolesByUser[userId]?.includes(role) ?? false;

  const isSelfAdminRevoke = (userId: string, role: ManagedRole) =>
    role === 'admin' && userId === currentUserId;

  const requestChange = (user: UserProfile, role: ManagedRole) => {
    const action = hasRole(user.id, role) ? 'revoke' : 'grant';
    if (action === 'revoke' && isSelfAdminRevoke(user.id, role)) {
      toast.error("You can't remove your own admin role");
      return;
    }
    setPendingChange({ user, role, action });
  };

  const applyChange = async () => {
    if (!pendingChange) return;
    const { user, role, action } = pendingChange;

    if (action === 'revoke' && isSelfAdminRevoke(user.id, role)) {
      toast.error("You can't remove your own admin role");
      setPendingChange(null);
      return;
    }

    setSaving(true);
    try {
      if (action === 'grant') {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: user.id, role });
        if (insertError) {
          if (insertError.code === '23505') {
            toast.info(`${displayName(user)} already has the ${ROLE_LABELS[role]} role`);
            await fetchUsers();
            return;
          }
          throw insertError;
        }
      } else {
        const { data: deleted, error: deleteError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', user.id)
          .eq('role', role)
          .select('id');
        if (deleteError) throw deleteError;
        if (!deleted || deleted.length === 0) {
          toast.info(`${displayName(user)} did not have the ${ROLE_LABELS[role]} role`);
          await fetchUsers();
          return;
        }
      }

      setRolesByUser((prev) => {
        const current = prev[user.id] ?? [];
        const next = action === 'grant'
          ? [...current.filter((r) => r !== role), role]
          : current.filter((r) => r !== role);
        return { ...prev, [user.id]: next };
      });

      toast.success(
        action === 'grant'
          ? `Granted ${ROLE_LABELS[role]} to ${displayName(user)}`
          : `Removed ${ROLE_LABELS[role]} from ${displayName(user)}`
      );

      if (onAuditLog) {
        try {
          await onAuditLog(action === 'grant' ? 'GRANT_ROLE' : 'REVOKE_ROLE', 'user_roles', user.id, { role });
        } catch (auditError) {
          console.error('Failed to write audit log:', auditError);
        }
      }
    } catch (err) {
      console.error('Error updating role:', err);
      toast.error(err instanceof Error ? `Failed to update role: ${err.message}` : 'Failed to update role');
    } finally {
      setSaving(false);
      setPendingChange(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const rangeStart = totalCount === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = Math.min(totalCount, (page + 1) * PAGE_SIZE);

  const renderRoleBadges = (userId: string) => {
    const roles = rolesByUser[userId] ?? [];
    const visible = roles.filter((r) => r !== 'user');
    if (visible.length === 0) {
      return <Badge variant="outline">User</Badge>;
    }
    return visible
      .sort()
      .map((role) => (
        <Badge key={role} variant={role === 'admin' ? 'default' : 'secondary'}>
          {ROLE_LABELS[role]}
        </Badge>
      ));
  };

  const renderRoleButtons = (user: UserProfile) => (
    <div className="flex flex-wrap gap-2">
      {MANAGED_ROLES.map((role) => {
        const has = hasRole(user.id, role);
        const blocked = has && isSelfAdminRevoke(user.id, role);
        const label = has ? `Remove ${ROLE_LABELS[role]}` : `Make ${ROLE_LABELS[role]}`;
        return (
          <Button
            key={role}
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={blocked || saving}
            title={blocked ? "You can't remove your own admin role" : undefined}
            aria-label={`${label}: ${displayName(user)}`}
            onClick={() => requestChange(user, role)}
          >
            {has ? <ShieldMinus className="h-3 w-3" /> : <ShieldPlus className="h-3 w-3" />}
            <span>{label}</span>
          </Button>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Users</h2>
          <p className="text-sm text-muted-foreground">
            Manage admin and moderator roles. Deleting or banning accounts is done in the Supabase dashboard
            (Authentication → Users).
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1 self-start sm:self-auto"
          onClick={() => void fetchUsers()}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          className="pl-10"
          type="search"
          placeholder="Search by email/username or full name..."
          aria-label="Search users"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" aria-hidden="true" />
            {loading ? 'Loading users…' : `${totalCount.toLocaleString()} user${totalCount === 1 ? '' : 's'}`}
          </CardTitle>
          {searchQuery && !loading && (
            <CardDescription>Matching “{searchQuery}”</CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {error ? (
            <div role="alert" className="flex flex-col items-center gap-3 px-6 py-10 text-center">
              <AlertCircle className="h-8 w-8 text-destructive" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">Couldn't load users: {error}</p>
              <Button variant="outline" size="sm" onClick={() => void fetchUsers()}>
                Try again
              </Button>
            </div>
          ) : loading ? (
            <div className="space-y-3 px-6 pb-6" aria-busy="true" aria-label="Loading users">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <UserCircle className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? 'No users match your search.' : 'No users yet.'}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile: cards */}
              <ul className="divide-y md:hidden">
                {users.map((user) => (
                  <li key={user.id} className="space-y-3 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <UserCircle className="h-5 w-5 text-primary" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {displayName(user)}
                          {user.id === currentUserId && (
                            <span className="ml-1 text-xs text-muted-foreground">(you)</span>
                          )}
                        </p>
                        {user.full_name && user.username && (
                          <p className="truncate text-sm text-muted-foreground">{user.username}</p>
                        )}
                        <p className="text-xs text-muted-foreground">Joined {formatDate(user.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">{renderRoleBadges(user.id)}</div>
                    {renderRoleButtons(user)}
                  </li>
                ))}
              </ul>

              {/* Desktop: table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead className="border-b bg-muted/50 text-left text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-medium">User</th>
                      <th scope="col" className="px-4 py-3 font-medium">Joined</th>
                      <th scope="col" className="px-4 py-3 font-medium">Roles</th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((user) => (
                      <tr key={user.id} className="align-middle">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-primary/10 p-2">
                              <UserCircle className="h-4 w-4 text-primary" aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium">
                                {displayName(user)}
                                {user.id === currentUserId && (
                                  <span className="ml-1 text-xs text-muted-foreground">(you)</span>
                                )}
                              </p>
                              {user.full_name && user.username && (
                                <p className="text-xs text-muted-foreground">{user.username}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">{renderRoleBadges(user.id)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">{renderRoleButtons(user)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {!error && totalCount > 0 && (
        <nav className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between" aria-label="Users pagination">
          <p className="text-sm text-muted-foreground">
            Showing {rangeStart}–{rangeEnd} of {totalCount.toLocaleString()}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={loading || page === 0}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm" aria-live="polite">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={loading || page >= totalPages - 1}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </nav>
      )}

      <AlertDialog
        open={pendingChange !== null}
        onOpenChange={(open) => {
          if (!open && !saving) setPendingChange(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              {pendingChange?.action === 'grant' ? 'Grant role' : 'Remove role'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingChange &&
                (pendingChange.action === 'grant'
                  ? `Give ${displayName(pendingChange.user)} the ${ROLE_LABELS[pendingChange.role]} role? ${
                      pendingChange.role === 'admin'
                        ? 'Admins have full access to this dashboard, including managing other users.'
                        : 'Moderators get elevated content permissions.'
                    }`
                  : `Remove the ${ROLE_LABELS[pendingChange.role]} role from ${displayName(pendingChange.user)}?`)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={saving}
              onClick={(e) => {
                e.preventDefault();
                void applyChange();
              }}
            >
              {saving ? 'Saving…' : pendingChange?.action === 'grant' ? 'Grant' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
