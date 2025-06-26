
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Trophy, Star, Medal, Crown, Target } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import DailyChallengeCard from '@/components/gamification/DailyChallengeCard';

const CommunityHub = () => {
  const { todayChallenge, leaderboard, userStats, loading } = useGamification();
  const [selectedLeaderboard, setSelectedLeaderboard] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-muted-foreground">#{position}</span>;
    }
  };

  const mockStudyGroups = [
    {
      id: '1',
      name: 'Quranic Arabic Beginners',
      description: 'Perfect group for those starting their Arabic journey',
      members: 45,
      maxMembers: 50,
      isPublic: true,
      focusCollections: ['faith', 'worship']
    },
    {
      id: '2',
      name: 'Advanced Vocabulary Masters',
      description: 'For experienced learners seeking to expand their vocabulary',
      members: 28,
      maxMembers: 30,
      isPublic: true,
      focusCollections: ['knowledge', 'nature', 'ethics']
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Users className="h-8 w-8" />
          Community Hub
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Connect with fellow learners, compete in challenges, and track your progress on the leaderboards
        </p>
      </div>

      {/* User Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{userStats.totalPoints}</div>
            <div className="text-sm text-muted-foreground">Total Points</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">#{userStats.rank || 'N/A'}</div>
            <div className="text-sm text-muted-foreground">Weekly Rank</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{userStats.challengesCompleted}</div>
            <div className="text-sm text-muted-foreground">Challenges</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{userStats.currentStreak}</div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="challenges" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="challenges">Daily Challenges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="groups">Study Groups</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="space-y-6">
          <DailyChallengeCard 
            challenge={todayChallenge}
            onStartChallenge={() => console.log('Start challenge')}
          />
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Leaderboard
                </CardTitle>
                <div className="flex gap-2">
                  {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                    <Button
                      key={period}
                      variant={selectedLeaderboard === period ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedLeaderboard(period)}
                    >
                      {period.charAt(0).toUpperCase() + period.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading leaderboard...</div>
              ) : leaderboard.length > 0 ? (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        {getRankIcon(index + 1)}
                        <Avatar>
                          <AvatarFallback>
                            {entry.user_id.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">User #{entry.user_id.slice(-6)}</div>
                          <div className="text-sm text-muted-foreground">
                            {entry.category} period
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="font-bold">
                        {entry.score} pts
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No leaderboard data yet. Complete challenges to appear here!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockStudyGroups.map((group) => (
              <Card key={group.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{group.description}</p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {group.members}/{group.maxMembers} members
                    </span>
                    <Badge variant="outline">
                      {group.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {group.focusCollections.map((collection) => (
                      <Badge key={collection} variant="secondary" className="text-xs">
                        {collection}
                      </Badge>
                    ))}
                  </div>

                  <Button className="w-full" size="sm">
                    Join Group
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { 
                title: 'First Steps', 
                description: 'Complete your first practice session',
                icon: '👶',
                unlocked: true,
                progress: 1,
                target: 1
              },
              { 
                title: 'Week Warrior', 
                description: 'Practice for 7 consecutive days',
                icon: '🔥',
                unlocked: false,
                progress: 3,
                target: 7
              },
              { 
                title: 'Vocabulary Master', 
                description: 'Learn 100 new words',
                icon: '📚',
                unlocked: false,
                progress: 45,
                target: 100
              },
              { 
                title: 'Speed Demon', 
                description: 'Answer 50 questions in under 1 minute',
                icon: '⚡',
                unlocked: false,
                progress: 12,
                target: 50
              },
              { 
                title: 'Accuracy Expert', 
                description: 'Achieve 95% accuracy in 5 sessions',
                icon: '🎯',
                unlocked: false,
                progress: 2,
                target: 5
              },
              { 
                title: 'Community Helper', 
                description: 'Help 10 community members',
                icon: '🤝',
                unlocked: false,
                progress: 0,
                target: 10
              }
            ].map((achievement, index) => (
              <Card key={index} className={achievement.unlocked ? 'border-gold' : ''}>
                <CardContent className="p-4 text-center space-y-3">
                  <div className="text-3xl">{achievement.icon}</div>
                  <div>
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                  
                  {achievement.unlocked ? (
                    <Badge className="bg-gold text-gold-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      Unlocked
                    </Badge>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        {achievement.progress} / {achievement.target}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityHub;
