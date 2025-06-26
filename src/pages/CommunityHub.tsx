
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Trophy, MessageCircle, BookOpen } from 'lucide-react';
import StudyGroupManager from '@/components/community/StudyGroupManager';
import Leaderboard from '@/components/community/Leaderboard';
import CommunityHub from '@/components/community/CommunityHub';

const CommunityPage = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Community Hub</h1>
        <p className="text-muted-foreground">Connect, compete, and learn together</p>
      </div>

      <Tabs defaultValue="groups" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="groups" className="gap-2">
            <Users className="h-4 w-4" />
            Study Groups
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-2">
            <Trophy className="h-4 w-4" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="forum" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Forum
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Shared Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-6">
          <StudyGroupManager />
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Leaderboard />
        </TabsContent>

        <TabsContent value="forum" className="space-y-6">
          <CommunityHub />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Community Content</h3>
            <p className="text-muted-foreground">
              User-generated vocabulary lists, study guides, and learning resources coming soon!
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityPage;
