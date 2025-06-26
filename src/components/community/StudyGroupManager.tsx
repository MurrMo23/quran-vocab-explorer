
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Search, UserPlus, Crown, BookOpen } from 'lucide-react';
import { useCommunityFeatures, StudyGroup } from '@/hooks/useCommunityFeatures';
import { useAuth } from '@/components/AuthProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { collections } from '@/utils/vocabulary';

interface CreateGroupForm {
  name: string;
  description: string;
  isPublic: boolean;
  maxMembers: number;
  focusCollections: string[];
}

const StudyGroupManager: React.FC = () => {
  const { session } = useAuth();
  const { studyGroups, loading, createStudyGroup, joinStudyGroup, refetch } = useCommunityFeatures();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState<CreateGroupForm>({
    name: '',
    description: '',
    isPublic: true,
    maxMembers: 20,
    focusCollections: []
  });

  useEffect(() => {
    refetch();
  }, []);

  const filteredGroups = studyGroups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateGroup = async () => {
    if (!createForm.name.trim()) return;

    const success = await createStudyGroup({
      name: createForm.name,
      description: createForm.description,
      is_public: createForm.isPublic,
      max_members: createForm.maxMembers,
      focus_collections: createForm.focusCollections
    });

    if (success) {
      setShowCreateDialog(false);
      setCreateForm({
        name: '',
        description: '',
        isPublic: true,
        maxMembers: 20,
        focusCollections: []
      });
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    await joinStudyGroup(groupId);
  };

  const handleCollectionToggle = (collectionId: string) => {
    setCreateForm(prev => ({
      ...prev,
      focusCollections: prev.focusCollections.includes(collectionId)
        ? prev.focusCollections.filter(id => id !== collectionId)
        : [...prev.focusCollections, collectionId]
    }));
  };

  if (!session) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Please log in to join study groups</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Study Groups</h2>
          <p className="text-muted-foreground">Join or create study groups to learn together</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Study Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="groupName">Group Name</Label>
                <Input
                  id="groupName"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter group name"
                />
              </div>
              
              <div>
                <Label htmlFor="groupDescription">Description</Label>
                <Textarea
                  id="groupDescription"
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your study group"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="maxMembers">Maximum Members</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  min="5"
                  max="100"
                  value={createForm.maxMembers}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, maxMembers: parseInt(e.target.value) || 20 }))}
                />
              </div>

              <div>
                <Label>Focus Collections</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {collections.map(collection => (
                    <div key={collection.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={collection.id}
                        checked={createForm.focusCollections.includes(collection.id)}
                        onCheckedChange={() => handleCollectionToggle(collection.id)}
                      />
                      <Label htmlFor={collection.id} className="text-sm">
                        {collection.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublic"
                  checked={createForm.isPublic}
                  onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, isPublic: !!checked }))}
                />
                <Label htmlFor="isPublic">Make group public</Label>
              </div>

              <Button onClick={handleCreateGroup} className="w-full">
                Create Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          className="pl-10"
          placeholder="Search study groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Groups List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading study groups...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <Card>
            <CardContent className="text-center p-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No study groups found</p>
            </CardContent>
          </Card>
        ) : (
          filteredGroups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {group.name}
                    </CardTitle>
                    {group.description && (
                      <p className="text-sm text-muted-foreground">{group.description}</p>
                    )}
                  </div>
                  <Badge variant={group.is_public ? "default" : "secondary"}>
                    {group.is_public ? "Public" : "Private"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {group.current_members}/{group.max_members} members
                      </span>
                    </div>
                  </div>

                  {group.focus_collections && group.focus_collections.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Focus Collections:</p>
                      <div className="flex flex-wrap gap-1">
                        {group.focus_collections.map(collectionId => {
                          const collection = collections.find(c => c.id === collectionId);
                          return collection ? (
                            <Badge key={collectionId} variant="outline" className="text-xs">
                              <BookOpen className="h-3 w-3 mr-1" />
                              {collection.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button 
                      onClick={() => handleJoinGroup(group.id)}
                      disabled={group.current_members >= group.max_members}
                      className="gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      {group.current_members >= group.max_members ? 'Full' : 'Join Group'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StudyGroupManager;
