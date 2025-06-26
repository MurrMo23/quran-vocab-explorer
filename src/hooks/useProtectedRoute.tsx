
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface ProtectedRouteOptions {
  redirectTo?: string;
  requiredRole?: string;
}

export const useProtectedRoute = (options: ProtectedRouteOptions = {}) => {
  const { redirectTo = '/auth', requiredRole } = options;
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isCheckingRoles, setIsCheckingRoles] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // First check if the user is authenticated
      if (!loading && !session) {
        toast.error('You need to be signed in to access this page', {
          id: 'auth-required',
        });
        setIsAuthorized(false);
        navigate(redirectTo);
        return;
      }

      // If authenticated and no role is required, then authorize
      if (session && !requiredRole) {
        setIsAuthorized(true);
        return;
      }

      // If a role is required, check if the user has that role
      if (session && requiredRole) {
        setIsCheckingRoles(true);
        try {
          const { data: userRolesData, error } = await supabase.rpc('get_user_roles');
          
          if (error) {
            console.error('Error fetching user roles:', error);
            toast.error('Error checking permissions');
            setIsAuthorized(false);
            navigate('/');
            return;
          }

          // Extract role names from the data
          const roles = userRolesData.map((r: { role: string }) => r.role);
          setUserRoles(roles);
          
          // Check if the user has the required role
          const hasRequiredRole = roles.includes(requiredRole);
          setIsAuthorized(hasRequiredRole);
          
          if (!hasRequiredRole) {
            toast.error(`You need ${requiredRole} privileges to access this page`);
            navigate('/');
          }
        } catch (err) {
          console.error('Error in role checking:', err);
          setIsAuthorized(false);
          navigate('/');
        } finally {
          setIsCheckingRoles(false);
        }
      }
    };

    checkAuth();
  }, [session, loading, navigate, redirectTo, requiredRole]);

  return { 
    isAuthenticated: !!session, 
    isAuthorized, 
    isLoading: loading || isCheckingRoles, 
    userRoles 
  };
};
