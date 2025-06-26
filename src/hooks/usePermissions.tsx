
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

type PermissionLevel = 'read' | 'write' | 'delete' | 'full';

interface Permission {
  resource: string;
  level: PermissionLevel;
}

export const usePermissions = () => {
  const { session } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user roles
        const { data: rolesData, error: rolesError } = await supabase.rpc('get_user_roles');
        
        if (rolesError) {
          throw rolesError;
        }
        
        const roles = rolesData.map((r: { role: string }) => r.role);
        setUserRoles(roles);

        // If user is admin, they have all permissions
        if (roles.includes('admin')) {
          setPermissions([{ resource: '*', level: 'full' }]);
          setLoading(false);
          return;
        }

        // Use a mock implementation for permissions until the table is created
        // This prevents TypeScript errors while allowing the app to function
        const mockPermissions: Permission[] = [
          { resource: 'words', level: 'read' },
          { resource: 'collections', level: 'read' },
          { resource: 'users', level: 'read' }
        ];
        
        setPermissions(mockPermissions);
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [session]);

  const checkPermission = (resource: string, requiredLevel: PermissionLevel): boolean => {
    if (loading) return false;
    
    // Admin role has all permissions
    if (userRoles.includes('admin')) return true;
    
    // Check for specific resource permission
    const permission = permissions.find(p => p.resource === resource || p.resource === '*');
    if (!permission) return false;
    
    // Full permission grants everything
    if (permission.level === 'full') return true;
    
    // Direct match
    if (permission.level === requiredLevel) return true;
    
    // Delete permission grants write permission
    if (requiredLevel === 'write' && permission.level === 'delete') return true;
    
    return false;
  };

  return {
    loading,
    permissions,
    userRoles,
    checkPermission,
    hasRole: (role: string) => userRoles.includes(role),
  };
};
