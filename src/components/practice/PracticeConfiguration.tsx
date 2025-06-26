
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, Settings } from 'lucide-react';

export interface PracticeConfig {
  sessionLength: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  includeAudio: boolean;
  showTransliteration: boolean;
  autoAdvance: boolean;
  timePerWord: number;
  focusOnWeakAreas: boolean;
  shuffleWords: boolean;
  reviewIncorrect: boolean;
}

interface PracticeConfigurationProps {
  onStart: (config: PracticeConfig) => void;
  collections: string[];
  selectedCollection?: string;
  onCollectionChange: (collection: string) => void;
}

const PracticeConfiguration: React.FC<PracticeConfigurationProps> = ({
  onStart,
  collections,
  selectedCollection,
  onCollectionChange
}) => {
  const [config, setConfig] = useState<PracticeConfig>({
    sessionLength: 20,
    difficulty: 'mixed',
    includeAudio: true,
    showTransliteration: true,
    autoAdvance: false,
    timePerWord: 30,
    focusOnWeakAreas: true,
    shuffleWords: true,
    reviewIncorrect: true
  });

  const updateConfig = (key: keyof PracticeConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const presetConfigs = [
    {
      name: 'Quick Review',
      config: { ...config, sessionLength: 10, timePerWord: 15, autoAdvance: true }
    },
    {
      name: 'Deep Study',
      config: { ...config, sessionLength: 50, timePerWord: 45, autoAdvance: false }
    },
    {
      name: 'Speed Practice',
      config: { ...config, sessionLength: 30, timePerWord: 10, autoAdvance: true }
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Practice Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick Presets */}
          <div className="space-y-2">
            <Label>Quick Presets</Label>
            <div className="flex gap-2 flex-wrap">
              {presetConfigs.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  size="sm"
                  onClick={() => setConfig(preset.config)}
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Collection Selection */}
          <div className="space-y-2">
            <Label>Collection</Label>
            <Select value={selectedCollection} onValueChange={onCollectionChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Collections</SelectItem>
                {collections.map((collection) => (
                  <SelectItem key={collection} value={collection}>
                    {collection}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Session Length */}
          <div className="space-y-2">
            <Label>Session Length: {config.sessionLength} words</Label>
            <Slider
              value={[config.sessionLength]}
              onValueChange={([value]) => updateConfig('sessionLength', value)}
              max={100}
              min={5}
              step={5}
              className="w-full"
            />
          </div>

          {/* Difficulty Level */}
          <div className="space-y-2">
            <Label>Difficulty Level</Label>
            <Select
              value={config.difficulty}
              onValueChange={(value) => updateConfig('difficulty', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="mixed">Mixed Levels</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Time Per Word */}
          <div className="space-y-2">
            <Label>Time Per Word: {config.timePerWord}s</Label>
            <Slider
              value={[config.timePerWord]}
              onValueChange={([value]) => updateConfig('timePerWord', value)}
              max={120}
              min={5}
              step={5}
              className="w-full"
            />
          </div>

          {/* Toggle Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="includeAudio">Include Audio</Label>
              <Switch
                id="includeAudio"
                checked={config.includeAudio}
                onCheckedChange={(checked) => updateConfig('includeAudio', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="showTransliteration">Show Transliteration</Label>
              <Switch
                id="showTransliteration"
                checked={config.showTransliteration}
                onCheckedChange={(checked) => updateConfig('showTransliteration', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="autoAdvance">Auto Advance</Label>
              <Switch
                id="autoAdvance"
                checked={config.autoAdvance}
                onCheckedChange={(checked) => updateConfig('autoAdvance', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="focusOnWeakAreas">Focus on Weak Areas</Label>
              <Switch
                id="focusOnWeakAreas"
                checked={config.focusOnWeakAreas}
                onCheckedChange={(checked) => updateConfig('focusOnWeakAreas', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="shuffleWords">Shuffle Words</Label>
              <Switch
                id="shuffleWords"
                checked={config.shuffleWords}
                onCheckedChange={(checked) => updateConfig('shuffleWords', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="reviewIncorrect">Review Incorrect</Label>
              <Switch
                id="reviewIncorrect"
                checked={config.reviewIncorrect}
                onCheckedChange={(checked) => updateConfig('reviewIncorrect', checked)}
              />
            </div>
          </div>

          {/* Configuration Summary */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-medium">Session Summary</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{config.sessionLength} words</Badge>
              <Badge variant="outline">{config.difficulty}</Badge>
              <Badge variant="outline">{config.timePerWord}s per word</Badge>
              {config.includeAudio && <Badge variant="outline">Audio</Badge>}
              {config.focusOnWeakAreas && <Badge variant="outline">Weak Areas</Badge>}
              {config.shuffleWords && <Badge variant="outline">Shuffled</Badge>}
            </div>
          </div>

          {/* Start Button */}
          <Button 
            onClick={() => onStart(config)}
            className="w-full"
            size="lg"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Practice Session
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PracticeConfiguration;
