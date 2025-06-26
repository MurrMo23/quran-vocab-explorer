
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Brain, 
  Clock, 
  Zap, 
  Trophy, 
  Users, 
  Target,
  Volume2,
  BookOpen,
  Shuffle,
  TrendingUp
} from 'lucide-react';
import { QuizMode, QuestionType, DifficultyLevel, QuizConfiguration } from '@/utils/quiz-types';
import { Collection } from '@/utils/vocabulary-types';

interface EnhancedQuizSetupProps {
  collections: Collection[];
  onStart: (config: QuizConfiguration) => void;
  userPreferences?: any;
}

const EnhancedQuizSetup: React.FC<EnhancedQuizSetupProps> = ({
  collections,
  onStart,
  userPreferences
}) => {
  const [config, setConfig] = useState<QuizConfiguration>({
    mode: 'practice',
    questionTypes: ['multiple-choice', 'fill-in-blank'],
    difficulty: 'mixed',
    questionCount: 10,
    timeLimit: 30,
    adaptiveLearning: true,
    spacedRepetition: true,
    focusOnWeakAreas: false
  });

  const questionTypeOptions: { type: QuestionType; label: string; icon: React.ReactNode; description: string }[] = [
    { 
      type: 'multiple-choice', 
      label: 'Multiple Choice', 
      icon: <Target className="h-4 w-4" />,
      description: 'Choose from multiple options'
    },
    { 
      type: 'fill-in-blank', 
      label: 'Fill in Blank', 
      icon: <BookOpen className="h-4 w-4" />,
      description: 'Type the correct answer'
    },
    { 
      type: 'arabic-to-meaning', 
      label: 'Arabic to Meaning', 
      icon: <Shuffle className="h-4 w-4" />,
      description: 'Translate Arabic to English'
    },
    { 
      type: 'meaning-to-arabic', 
      label: 'Meaning to Arabic', 
      icon: <Shuffle className="h-4 w-4" />,
      description: 'Translate English to Arabic'
    },
    { 
      type: 'audio-recognition', 
      label: 'Audio Recognition',
      icon: <Volume2 className="h-4 w-4" />,
      description: 'Listen and identify words'
    },
    { 
      type: 'contextual-completion', 
      label: 'Contextual Completion',
      icon: <BookOpen className="h-4 w-4" />,
      description: 'Complete Quranic verses'
    },
    { 
      type: 'root-family', 
      label: 'Root Family',
      icon: <TrendingUp className="h-4 w-4" />,
      description: 'Group words by same root'
    },
    { 
      type: 'synonym-antonym', 
      label: 'Synonyms & Antonyms',
      icon: <Shuffle className="h-4 w-4" />,
      description: 'Find related words'
    }
  ];

  const quizModeOptions: { mode: QuizMode; label: string; icon: React.ReactNode; description: string }[] = [
    {
      mode: 'practice',
      label: 'Practice Mode',
      icon: <BookOpen className="h-4 w-4" />,
      description: 'Learn at your own pace'
    },
    {
      mode: 'timed',
      label: 'Timed Challenge',
      icon: <Clock className="h-4 w-4" />,
      description: 'Race against the clock'
    },
    {
      mode: 'survival',
      label: 'Survival Mode',
      icon: <Zap className="h-4 w-4" />,
      description: 'Keep going until you fail'
    },
    {
      mode: 'adaptive',
      label: 'Adaptive Learning',
      icon: <Brain className="h-4 w-4" />,
      description: 'AI adjusts difficulty'
    },
    {
      mode: 'challenge',
      label: 'Friend Challenge',
      icon: <Users className="h-4 w-4" />,
      description: 'Compete with friends'
    }
  ];

  const handleQuestionTypeToggle = (type: QuestionType, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      questionTypes: checked 
        ? [...prev.questionTypes, type]
        : prev.questionTypes.filter(t => t !== type)
    }));
  };

  const handleStart = () => {
    if (config.questionTypes.length === 0) {
      return;
    }
    onStart(config);
  };

  const getModeIcon = (mode: QuizMode) => {
    const modeOption = quizModeOptions.find(option => option.mode === mode);
    return modeOption?.icon || <Target className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Quiz Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getModeIcon(config.mode)}
            Choose Quiz Mode
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {quizModeOptions.map((option) => (
            <div
              key={option.mode}
              className={`
                p-4 rounded-lg border-2 cursor-pointer transition-all
                ${config.mode === option.mode 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted hover:border-primary/50'
                }
              `}
              onClick={() => setConfig(prev => ({ ...prev, mode: option.mode }))}
            >
              <div className="flex items-center gap-2 mb-2">
                {option.icon}
                <span className="font-medium">{option.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Question Types */}
      <Card>
        <CardHeader>
          <CardTitle>Question Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questionTypeOptions.map((option) => (
              <div key={option.type} className="flex items-start space-x-3 p-3 rounded-lg border">
                <Checkbox
                  id={option.type}
                  checked={config.questionTypes.includes(option.type)}
                  onCheckedChange={(checked) => 
                    handleQuestionTypeToggle(option.type, checked as boolean)
                  }
                />
                <div className="flex-1">
                  <Label htmlFor={option.type} className="flex items-center gap-2 cursor-pointer">
                    {option.icon}
                    {option.label}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Collection Selection */}
            <div className="space-y-2">
              <Label>Collection</Label>
              <Select 
                value={config.collectionId || 'all'} 
                onValueChange={(value) => 
                  setConfig(prev => ({ 
                    ...prev, 
                    collectionId: value === 'all' ? undefined : value 
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select collection" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Collections</SelectItem>
                  {collections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label>Difficulty Level</Label>
              <Select 
                value={config.difficulty} 
                onValueChange={(value: DifficultyLevel) => 
                  setConfig(prev => ({ ...prev, difficulty: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="mixed">Mixed Levels</SelectItem>
                  <SelectItem value="adaptive">Adaptive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Question Count */}
            <div className="space-y-2">
              <Label>Number of Questions: {config.questionCount}</Label>
              <Slider
                value={[config.questionCount]}
                onValueChange={([value]) => 
                  setConfig(prev => ({ ...prev, questionCount: value }))
                }
                min={5}
                max={50}
                step={5}
                className="w-full"
              />
            </div>

            {/* Time Limit */}
            {config.mode === 'timed' && (
              <div className="space-y-2">
                <Label>Time per Question: {config.timeLimit}s</Label>
                <Slider
                  value={[config.timeLimit || 30]}
                  onValueChange={([value]) => 
                    setConfig(prev => ({ ...prev, timeLimit: value }))
                  }
                  min={10}
                  max={120}
                  step={5}
                  className="w-full"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Advanced Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Advanced Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Adaptive Learning
                </Label>
                <p className="text-sm text-muted-foreground">
                  AI adjusts difficulty based on performance
                </p>
              </div>
              <Switch
                checked={config.adaptiveLearning}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, adaptiveLearning: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Spaced Repetition
                </Label>
                <p className="text-sm text-muted-foreground">
                  Focus on words you've struggled with
                </p>
              </div>
              <Switch
                checked={config.spacedRepetition}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, spacedRepetition: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Focus on Weak Areas
                </Label>
                <p className="text-sm text-muted-foreground">
                  Prioritize areas needing improvement
                </p>
              </div>
              <Switch
                checked={config.focusOnWeakAreas}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({ ...prev, focusOnWeakAreas: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selected Configuration Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Quiz Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{config.mode} mode</Badge>
            <Badge variant="outline">{config.questionCount} questions</Badge>
            <Badge variant="outline">{config.difficulty} difficulty</Badge>
            {config.timeLimit && <Badge variant="outline">{config.timeLimit}s per question</Badge>}
            {config.questionTypes.map(type => (
              <Badge key={type} variant="secondary">
                {questionTypeOptions.find(opt => opt.type === type)?.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Start Button */}
      <Button 
        onClick={handleStart}
        size="lg" 
        className="w-full"
        disabled={config.questionTypes.length === 0}
      >
        <Trophy className="h-5 w-5 mr-2" />
        Start Quiz
      </Button>
    </div>
  );
};

export default EnhancedQuizSetup;
