
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Arabic Vocabulary Platform',
      siteDescription: 'Learn Arabic vocabulary through interactive exercises',
      adminEmail: 'admin@example.com',
      enableRegistration: true,
      enableGuestAccess: false,
      defaultLanguage: 'en',
      timezone: 'UTC'
    },
    learning: {
      defaultDifficulty: 'beginner',
      maxWordsPerSession: 25,
      enableSpacedRepetition: true,
      enableAdaptiveLearning: true,
      defaultSessionTime: 30,
      enableAudioPronunciation: true,
      enablePronunciationPractice: false
    },
    gamification: {
      enableAchievements: true,
      enableLeaderboards: true,
      enableDailyChallenges: true,
      pointsPerCorrectAnswer: 10,
      streakBonusMultiplier: 1.5,
      enableBadges: true
    },
    content: {
      enableBlog: true,
      enableCommunityFeatures: true,
      enableUserNotes: true,
      enableWordRequests: true,
      moderationRequired: true,
      autoPublishContributions: false
    },
    security: {
      sessionTimeout: 24,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      requireEmailVerification: true,
      enableTwoFactor: false,
      enableRateLimiting: true
    }
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (category: string) => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`${category.charAt(0).toUpperCase() + category.slice(1)} settings saved successfully`);
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">System Settings</h2>
        <p className="text-muted-foreground">Configure platform-wide settings and preferences</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
          <TabsTrigger value="gamification">Gamification</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={settings.general.adminEmail}
                    onChange={(e) => updateSetting('general', 'adminEmail', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.general.siteDescription}
                  onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultLanguage">Default Language</Label>
                  <Select value={settings.general.defaultLanguage} onValueChange={(value) => updateSetting('general', 'defaultLanguage', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.general.timezone} onValueChange={(value) => updateSetting('general', 'timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Asia/Dubai">Dubai</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableRegistration">Enable User Registration</Label>
                  <Switch
                    id="enableRegistration"
                    checked={settings.general.enableRegistration}
                    onCheckedChange={(checked) => updateSetting('general', 'enableRegistration', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableGuestAccess">Enable Guest Access</Label>
                  <Switch
                    id="enableGuestAccess"
                    checked={settings.general.enableGuestAccess}
                    onCheckedChange={(checked) => updateSetting('general', 'enableGuestAccess', checked)}
                  />
                </div>
              </div>
              <Button onClick={() => handleSave('general')} disabled={isSaving}>
                {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning">
          <Card>
            <CardHeader>
              <CardTitle>Learning Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultDifficulty">Default Difficulty</Label>
                  <Select value={settings.learning.defaultDifficulty} onValueChange={(value) => updateSetting('learning', 'defaultDifficulty', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maxWordsPerSession">Max Words Per Session</Label>
                  <Input
                    id="maxWordsPerSession"
                    type="number"
                    min="5"
                    max="100"
                    value={settings.learning.maxWordsPerSession}
                    onChange={(e) => updateSetting('learning', 'maxWordsPerSession', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="defaultSessionTime">Default Session Time (minutes)</Label>
                <Input
                  id="defaultSessionTime"
                  type="number"
                  min="5"
                  max="120"
                  value={settings.learning.defaultSessionTime}
                  onChange={(e) => updateSetting('learning', 'defaultSessionTime', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableSpacedRepetition">Enable Spaced Repetition</Label>
                  <Switch
                    id="enableSpacedRepetition"
                    checked={settings.learning.enableSpacedRepetition}
                    onCheckedChange={(checked) => updateSetting('learning', 'enableSpacedRepetition', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableAdaptiveLearning">Enable Adaptive Learning</Label>
                  <Switch
                    id="enableAdaptiveLearning"
                    checked={settings.learning.enableAdaptiveLearning}
                    onCheckedChange={(checked) => updateSetting('learning', 'enableAdaptiveLearning', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableAudioPronunciation">Enable Audio Pronunciation</Label>
                  <Switch
                    id="enableAudioPronunciation"
                    checked={settings.learning.enableAudioPronunciation}
                    onCheckedChange={(checked) => updateSetting('learning', 'enableAudioPronunciation', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enablePronunciationPractice">Enable Pronunciation Practice</Label>
                  <Switch
                    id="enablePronunciationPractice"
                    checked={settings.learning.enablePronunciationPractice}
                    onCheckedChange={(checked) => updateSetting('learning', 'enablePronunciationPractice', checked)}
                  />
                </div>
              </div>
              <Button onClick={() => handleSave('learning')} disabled={isSaving}>
                {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Learning Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gamification">
          <Card>
            <CardHeader>
              <CardTitle>Gamification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pointsPerCorrectAnswer">Points Per Correct Answer</Label>
                  <Input
                    id="pointsPerCorrectAnswer"
                    type="number"
                    min="1"
                    max="100"
                    value={settings.gamification.pointsPerCorrectAnswer}
                    onChange={(e) => updateSetting('gamification', 'pointsPerCorrectAnswer', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="streakBonusMultiplier">Streak Bonus Multiplier</Label>
                  <Input
                    id="streakBonusMultiplier"
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={settings.gamification.streakBonusMultiplier}
                    onChange={(e) => updateSetting('gamification', 'streakBonusMultiplier', parseFloat(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableAchievements">Enable Achievements</Label>
                  <Switch
                    id="enableAchievements"
                    checked={settings.gamification.enableAchievements}
                    onCheckedChange={(checked) => updateSetting('gamification', 'enableAchievements', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableLeaderboards">Enable Leaderboards</Label>
                  <Switch
                    id="enableLeaderboards"
                    checked={settings.gamification.enableLeaderboards}
                    onCheckedChange={(checked) => updateSetting('gamification', 'enableLeaderboards', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableDailyChallenges">Enable Daily Challenges</Label>
                  <Switch
                    id="enableDailyChallenges"
                    checked={settings.gamification.enableDailyChallenges}
                    onCheckedChange={(checked) => updateSetting('gamification', 'enableDailyChallenges', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableBadges">Enable Badges</Label>
                  <Switch
                    id="enableBadges"
                    checked={settings.gamification.enableBadges}
                    onCheckedChange={(checked) => updateSetting('gamification', 'enableBadges', checked)}
                  />
                </div>
              </div>
              <Button onClick={() => handleSave('gamification')} disabled={isSaving}>
                {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Gamification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableBlog">Enable Blog</Label>
                  <Switch
                    id="enableBlog"
                    checked={settings.content.enableBlog}
                    onCheckedChange={(checked) => updateSetting('content', 'enableBlog', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableCommunityFeatures">Enable Community Features</Label>
                  <Switch
                    id="enableCommunityFeatures"
                    checked={settings.content.enableCommunityFeatures}
                    onCheckedChange={(checked) => updateSetting('content', 'enableCommunityFeatures', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableUserNotes">Enable User Notes</Label>
                  <Switch
                    id="enableUserNotes"
                    checked={settings.content.enableUserNotes}
                    onCheckedChange={(checked) => updateSetting('content', 'enableUserNotes', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableWordRequests">Enable Word Requests</Label>
                  <Switch
                    id="enableWordRequests"
                    checked={settings.content.enableWordRequests}
                    onCheckedChange={(checked) => updateSetting('content', 'enableWordRequests', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="moderationRequired">Moderation Required</Label>
                  <Switch
                    id="moderationRequired"
                    checked={settings.content.moderationRequired}
                    onCheckedChange={(checked) => updateSetting('content', 'moderationRequired', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoPublishContributions">Auto-Publish Contributions</Label>
                  <Switch
                    id="autoPublishContributions"
                    checked={settings.content.autoPublishContributions}
                    onCheckedChange={(checked) => updateSetting('content', 'autoPublishContributions', checked)}
                  />
                </div>
              </div>
              <Button onClick={() => handleSave('content')} disabled={isSaving}>
                {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Content Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="1"
                    max="72"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    min="3"
                    max="10"
                    value={settings.security.maxLoginAttempts}
                    onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                <Input
                  id="passwordMinLength"
                  type="number"
                  min="6"
                  max="32"
                  value={settings.security.passwordMinLength}
                  onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                  <Switch
                    id="requireEmailVerification"
                    checked={settings.security.requireEmailVerification}
                    onCheckedChange={(checked) => updateSetting('security', 'requireEmailVerification', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableTwoFactor">Enable Two-Factor Authentication</Label>
                  <Switch
                    id="enableTwoFactor"
                    checked={settings.security.enableTwoFactor}
                    onCheckedChange={(checked) => updateSetting('security', 'enableTwoFactor', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableRateLimiting">Enable Rate Limiting</Label>
                  <Switch
                    id="enableRateLimiting"
                    checked={settings.security.enableRateLimiting}
                    onCheckedChange={(checked) => updateSetting('security', 'enableRateLimiting', checked)}
                  />
                </div>
              </div>
              <Button onClick={() => handleSave('security')} disabled={isSaving}>
                {isSaving ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Security Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
