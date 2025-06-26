
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { User, UserCircle, Search, Calendar, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email?: string;
  created_at: string;
  last_sign_in_at?: string;
  username?: string;
}

interface AdminUsersProps {
  onAuditLog?: (action: string, entityType: string, entityId: string | null, details?: any) => Promise<void>;
}

const AdminUsers: React.FC<AdminUsersProps> = ({ onAuditLog }) => {
  const { session } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setLoading(true);
    
    try {
      if (onAuditLog) {
        await onAuditLog('FETCH', 'users', null);
      }
      
      // In a real app, you would fetch users from Supabase Admin API
      // For demo, we'll create some dummy users
      const dummyUsers = [
        {
          id: '1',
          email: 'admin@example.com',
          created_at: new Date().toISOString(),
          username: 'Admin User'
        },
        {
          id: '2',
          email: 'user1@example.com',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          username: 'Regular User 1'
        },
        {
          id: '3',
          email: 'user2@example.com',
          created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          username: 'Regular User 2'
        }
      ];
      
      // Add the current user
      if (session?.user) {
        dummyUsers.push({
          id: session.user.id,
          email: session.user.email,
          created_at: new Date().toISOString(),
          username: 'Current User'
        });
      }
      
      setUsers(dummyUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async () => {
    if (onAuditLog) {
      await onAuditLog('SEARCH', 'users', null, { query: searchQuery });
    }
    
    // For demo purposes only
    if (!searchQuery) {
      fetchUsers();
      return;
    }
    
    const filtered = users.filter(user => 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setUsers(filtered);
  };
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Users</h2>
      </div>
      
      <div className="flex mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Search users by email or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <Button onClick={handleSearch} className="ml-2">Search</Button>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No users found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <UserCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{user.username || 'Unnamed User'}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      
                      <div className="mt-2 flex flex-col space-y-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <User className="h-3 w-3 mr-1" />
                          <span>ID: {user.id.substring(0, 8)}...</span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Joined: {formatDate(user.created_at)}</span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Last login: {formatDate(user.last_sign_in_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Lock className="h-3 w-3" />
                      <span>Reset Password</span>
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      {user.id === '1' ? (
                        <>
                          <Unlock className="h-3 w-3 text-green-600" />
                          <span className="text-green-600">Admin</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3" />
                          <span>Make Admin</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Note: This is a demo. In a real application, you would use Supabase Admin API or a similar service to manage users.
        </p>
      </div>
    </div>
  );
};

export default AdminUsers;
