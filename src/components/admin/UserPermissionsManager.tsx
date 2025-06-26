
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { Shield, User, Search, UserPlus, UserMinus, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useRealTimeSync } from '@/hooks/useRealTimeSync';

interface UserWithRoles {
  id: string;
  email?: string;
  roles: string[];
  permissions: {
    resource: string;
    permission: string;
  }[];
}

const permissionResources = [
  'words',
  'collections',
  'learning_paths',
  'users',
  'analytics'
];

const permissionLevels = [
  { value: 'read', label: 'Read Only' },
  { value: 'write', label: 'Write (+ Read)' },
  { value: 'delete', label: 'Delete (+ Write + Read)' },
  { value: 'full', label: 'Full Access' }
];

const UserPermissionsManager: React.FC = () => {
  const { session } = useAuth();
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [activeTab, setActiveTab] = useState('users');
  const [newPermission, setNewPermission] = useState({
    resource: 'words',
    permission: 'read'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Use real-time sync for user role changes
  const { data: rolesData } = useRealTimeSync<any>({
    table: 'user_roles',
    onSync: () => {
      // Refresh user data when roles change
      fetchUsers();
    }
  });

  // Use real-time sync for permission changes
  const { data: permissionsData } = useRealTimeSync<any>({
    table: 'user_permissions',
    onSync: () => {
      // Refresh user data when permissions change
      fetchUsers();
    }
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Get all users (for demo, simulate with some mock data)
      const mockUsers: UserWithRoles[] = [
        {
          id: '1',
          email: 'admin@example.com',
          roles: ['admin'],
          permissions: []
        },
        {
          id: '2',
          email: 'moderator@example.com',
          roles: ['moderator'],
          permissions: [
            { resource: 'words', permission: 'full' },
            { resource: 'collections', permission: 'write' }
          ]
        },
        {
          id: '3',
          email: 'user@example.com',
          roles: ['user'],
          permissions: [
            { resource: 'words', permission: 'read' },
            { resource: 'collections', permission: 'read' }
          ]
        }
      ];
      
      // In a real app, we would fetch actual users and their roles/permissions
      // Simulate adding the current user
      if (session?.user) {
        mockUsers.push({
          id: session.user.id,
          email: session.user.email,
          roles: ['admin'], // Assume current user is admin for demo
          permissions: []
        });
      }
      
      setUsers(mockUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error(`Failed to load users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [session]);

  const handleSearch = () => {
    // For demo purposes, just filter the in-memory array
    if (!searchQuery) {
      fetchUsers();
      return;
    }
    
    const filtered = users.filter(user => 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setUsers(filtered);
  };

  const selectUser = (user: UserWithRoles) => {
    setSelectedUser(user);
    setActiveTab('roles');
  };

  const handleAddRole = async () => {
    if (!selectedUser || !selectedRole) return;
    
    setSaving(true);
    try {
      // In a real app, we would call an API or directly interact with Supabase
      // For demo, simulate successful operation
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id && !user.roles.includes(selectedRole)) {
          return {
            ...user,
            roles: [...user.roles, selectedRole]
          };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setSelectedUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          roles: [...prevUser.roles, selectedRole]
        };
      });
      
      toast.success(`Role ${selectedRole} added to ${selectedUser.email}`);
      setSelectedRole('');
    } catch (error: any) {
      console.error('Error adding role:', error);
      toast.error(`Failed to add role: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveRole = async (roleToRemove: string) => {
    if (!selectedUser) return;
    
    setSaving(true);
    try {
      // In a real app, we would call an API or directly interact with Supabase
      // For demo, simulate successful operation
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id) {
          return {
            ...user,
            roles: user.roles.filter(role => role !== roleToRemove)
          };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setSelectedUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          roles: prevUser.roles.filter(role => role !== roleToRemove)
        };
      });
      
      toast.success(`Role ${roleToRemove} removed from ${selectedUser.email}`);
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast.error(`Failed to remove role: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleAddPermission = async () => {
    if (!selectedUser || !newPermission.resource || !newPermission.permission) return;
    
    setSaving(true);
    try {
      // In a real app, we would call an API or directly interact with Supabase
      // For demo, simulate successful operation
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id) {
          // Remove any existing permission for the same resource
          const filteredPermissions = user.permissions.filter(p => p.resource !== newPermission.resource);
          
          return {
            ...user,
            permissions: [...filteredPermissions, { ...newPermission }]
          };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setSelectedUser(prevUser => {
        if (!prevUser) return null;
        
        // Remove any existing permission for the same resource
        const filteredPermissions = prevUser.permissions.filter(p => p.resource !== newPermission.resource);
        
        return {
          ...prevUser,
          permissions: [...filteredPermissions, { ...newPermission }]
        };
      });
      
      toast.success(`Permission for ${newPermission.resource} updated to ${newPermission.permission}`);
      setNewPermission({
        resource: '',
        permission: 'read'
      });
    } catch (error: any) {
      console.error('Error adding permission:', error);
      toast.error(`Failed to add permission: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePermission = async (resourceToRemove: string) => {
    if (!selectedUser) return;
    
    setSaving(true);
    try {
      // In a real app, we would call an API or directly interact with Supabase
      // For demo, simulate successful operation
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id) {
          return {
            ...user,
            permissions: user.permissions.filter(p => p.resource !== resourceToRemove)
          };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setSelectedUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          permissions: prevUser.permissions.filter(p => p.resource !== resourceToRemove)
        };
      });
      
      toast.success(`Permission for ${resourceToRemove} removed from ${selectedUser.email}`);
    } catch (error: any) {
      console.error('Error removing permission:', error);
      toast.error(`Failed to remove permission: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Permissions Manager</h2>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles" disabled={!selectedUser}>
            {selectedUser ? `Manage ${selectedUser.email?.split('@')[0]}` : 'Select User First'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-6">
          <div className="flex mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                className="pl-10"
                placeholder="Search users by email..."
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
                <Card key={user.id} className={`${selectedUser?.id === user.id ? 'border-primary' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-4 p-2 bg-primary/10 rounded-full">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{user.email}</p>
                          <div className="flex mt-1 gap-1">
                            {user.roles.map(role => (
                              <Badge key={role} variant="outline" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant={selectedUser?.id === user.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => selectUser(user)}
                      >
                        {selectedUser?.id === user.id ? 'Selected' : 'Manage'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="roles" className="mt-6 space-y-6">
          {selectedUser && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-primary" />
                    Roles for {selectedUser.email}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Select value={selectedRole} onValueChange={setSelectedRole}>
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button onClick={handleAddRole} disabled={!selectedRole || saving}>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add Role
                      </Button>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Current Roles:</h4>
                      {selectedUser.roles.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No roles assigned</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.roles.map(role => (
                            <Badge key={role} className="flex items-center gap-1 px-3 py-1">
                              {role}
                              <Button
                                variant="ghost"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => handleRemoveRole(role)}
                                disabled={saving}
                              >
                                <UserMinus className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-primary" />
                    Permissions for {selectedUser.email}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-4 sm:flex-row">
                      <Select 
                        value={newPermission.resource} 
                        onValueChange={(value) => setNewPermission({...newPermission, resource: value})}
                      >
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue placeholder="Select resource" />
                        </SelectTrigger>
                        <SelectContent>
                          {permissionResources.map(resource => (
                            <SelectItem key={resource} value={resource}>
                              {resource.charAt(0).toUpperCase() + resource.slice(1).replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select 
                        value={newPermission.permission} 
                        onValueChange={(value) => setNewPermission({...newPermission, permission: value})}
                      >
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue placeholder="Select permission" />
                        </SelectTrigger>
                        <SelectContent>
                          {permissionLevels.map(level => (
                            <SelectItem key={level.value} value={level.value}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        onClick={handleAddPermission} 
                        disabled={!newPermission.resource || !newPermission.permission || saving}
                        className="w-full sm:w-auto"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Set Permission
                      </Button>
                    </div>
                    
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Current Permissions:</h4>
                      {selectedUser.permissions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No specific permissions assigned</p>
                      ) : (
                        <div className="space-y-2">
                          {selectedUser.permissions.map(permission => (
                            <div key={permission.resource} className="flex items-center justify-between p-2 bg-muted rounded-md">
                              <div>
                                <span className="font-medium">
                                  {permission.resource.charAt(0).toUpperCase() + permission.resource.slice(1).replace('_', ' ')}
                                </span>
                                <Badge className="ml-2" variant="outline">
                                  {permission.permission}
                                </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemovePermission(permission.resource)}
                                disabled={saving}
                              >
                                <AlertCircle className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Back to Users
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserPermissionsManager;
