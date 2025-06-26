
import React, { useState } from 'react';
import { Play, Settings, Target, Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { QuizSettings, QuestionType, DifficultyLevel } from '@/pages/Quiz';
import { getAllCollections } from '@/utils/vocabulary';

interface QuizSetupProps {
  initialSettings: QuizSettings;
  onStartQuiz: (settings: QuizSettings) => void;
}

const QuizSetup: React.FC<QuizSetupProps> = ({ initialSettings, onStartQuiz }) => {
  const [settings, setSettings] = useState<QuizSettings>(initialSettings);
  const collections = getAllCollections();

  const questionTypeOptions: { value: QuestionType; label: string; description: string }[] = [
    {
      value: 'multiple-choice',
      label: 'Multiple Choice',
      description: 'Choose the correct meaning from 4 options'
    },
    {
      value: 'fill-in-blank',
      label: 'Fill in the Blank',
      description: 'Type the correct meaning'
    },
    {
      value: 'arabic-to-meaning',
      label: 'Arabic to Meaning',
      description: 'Choose the Arabic word for a given meaning'
    },
    {
      value: 'meaning-to-arabic',
      label: 'Meaning to Arabic',
      description: 'Choose the meaning for a given Arabic word'
    }
  ];

  const handleQuestionTypeChange = (type: QuestionType, checked: boolean) => {
    if (checked) {
      setSettings(prev => ({
        ...prev,
        questionTypes: [...prev.questionTypes, type]
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        questionTypes: prev.questionTypes.filter(t => t !== type)
      }));
    }
  };

  const handleStart = () => {
    if (settings.questionTypes.length === 0) {
      return;
    }
    onStartQuiz(settings);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quiz Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Word Count */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              Number of Questions: {settings.wordCount}
            </Label>
            <Slider
              value={[settings.wordCount]}
              onValueChange={(value) => setSettings(prev => ({ ...prev, wordCount: value[0] }))}
              min={5}
              max={50}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5 questions</span>
              <span>50 questions</span>
            </div>
          </div>

          {/* Difficulty Level */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Difficulty Level</Label>
            <Select
              value={settings.difficulty}
              onValueChange={(value: DifficultyLevel) => 
                setSettings(prev => ({ ...prev, difficulty: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="mixed">Mixed (All Levels)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Collection Filter */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Collection (Optional)
            </Label>
            <Select
              value={settings.collectionId || 'all'}
              onValueChange={(value) => 
                setSettings(prev => ({ 
                  ...prev, 
                  collectionId: value === 'all' ? undefined : value 
                }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Collections</SelectItem>
                {collections.map(collection => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Question Types */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Question Types</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questionTypeOptions.map(option => (
                <div key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={option.value}
                    checked={settings.questionTypes.includes(option.value)}
                    onCheckedChange={(checked) => 
                      handleQuestionTypeChange(option.value, checked as boolean)
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor={option.value} className="font-medium cursor-pointer">
                      {option.label}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {settings.questionTypes.length === 0 && (
              <p className="text-sm text-red-500">Please select at least one question type</p>
            )}
          </div>

          {/* Time Limit */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time per Question: {settings.timeLimit ? `${settings.timeLimit}s` : 'No limit'}
            </Label>
            <div className="flex items-center space-x-4">
              <Checkbox
                id="timeLimit"
                checked={!!settings.timeLimit}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ 
                    ...prev, 
                    timeLimit: checked ? 30 : undefined 
                  }))
                }
              />
              <Label htmlFor="timeLimit">Enable time limit</Label>
            </div>
            {settings.timeLimit && (
              <Slider
                value={[settings.timeLimit]}
                onValueChange={(value) => setSettings(prev => ({ ...prev, timeLimit: value[0] }))}
                min={10}
                max={120}
                step={5}
                className="w-full"
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Start Button */}
      <div className="text-center">
        <Button 
          onClick={handleStart}
          disabled={settings.questionTypes.length === 0}
          size="lg"
          className="w-full md:w-auto"
        >
          <Play className="h-4 w-4 mr-2" />
          Start Quiz
        </Button>
      </div>

      {/* Preview */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <h3 className="font-medium mb-2">Quiz Preview</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• {settings.wordCount} questions</p>
            <p>• Difficulty: {settings.difficulty}</p>
            <p>• Question types: {settings.questionTypes.join(', ')}</p>
            {settings.collectionId && (
              <p>• Collection: {collections.find(c => c.id === settings.collectionId)?.name}</p>
            )}
            {settings.timeLimit && (
              <p>• Time limit: {settings.timeLimit}s per question</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizSetup;
