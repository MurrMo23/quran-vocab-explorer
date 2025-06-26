
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Clock, 
  BookOpen, 
  Trophy, 
  Calendar,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface LearningGoal {
  dailyWords: number;
  studyTime: number;
  frequency: 'daily' | 'weekly' | 'custom';
  collections: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'mixed';
  features: string[];
}

const GoalSettingWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [goals, setGoals] = useState<LearningGoal>({
    dailyWords: 20,
    studyTime: 30,
    frequency: 'daily',
    collections: [],
    difficulty: 'beginner',
    features: []
  });

  const steps = [
    { id: 'daily-target', title: 'Daily Learning Target', icon: Target },
    { id: 'time-commitment', title: 'Time Commitment', icon: Clock },
    { id: 'content-preferences', title: 'Content Preferences', icon: BookOpen },
    { id: 'features', title: 'Learning Features', icon: Trophy },
    { id: 'review', title: 'Review Goals', icon: Calendar }
  ];

  const collections = [
    { id: 'faith', name: 'Faith & Belief' },
    { id: 'prophets', name: 'Prophets & Messengers' },
    { id: 'worship', name: 'Worship & Rituals' },
    { id: 'ethics', name: 'Ethics & Values' },
    { id: 'nature', name: 'Nature & Creation' },
    { id: 'knowledge', name: 'Knowledge & Wisdom' }
  ];

  const features = [
    { id: 'audio', name: 'Audio Pronunciation', description: 'Listen to native pronunciation' },
    { id: 'spaced-repetition', name: 'Spaced Repetition', description: 'Optimized review scheduling' },
    { id: 'cultural-context', name: 'Cultural Context', description: 'Learn etymology and cultural significance' },
    { id: 'grammar', name: 'Grammar Patterns', description: 'Understand word structures and patterns' },
    { id: 'community', name: 'Community Features', description: 'Join study groups and competitions' },
    { id: 'analytics', name: 'Progress Analytics', description: 'Detailed learning insights' }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('learningGoals', JSON.stringify(goals));
    localStorage.setItem('goalsSet', 'true');
    console.log('Goals saved:', goals);
    // Navigate to dashboard or next step
  };

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'daily-target':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-xl font-bold mb-2">Set Your Daily Learning Target</h2>
              <p className="text-muted-foreground">How many new words would you like to learn each day?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="daily-words">Daily Words Target</Label>
                <Input
                  id="daily-words"
                  type="number"
                  min="5"
                  max="100"
                  value={goals.dailyWords}
                  onChange={(e) => setGoals({...goals, dailyWords: parseInt(e.target.value) || 20})}
                  className="text-center text-lg"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {[10, 20, 30].map((count) => (
                  <Button
                    key={count}
                    variant={goals.dailyWords === count ? "default" : "outline"}
                    onClick={() => setGoals({...goals, dailyWords: count})}
                    className="h-12"
                  >
                    {count} words
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'time-commitment':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Clock className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-xl font-bold mb-2">Time Commitment</h2>
              <p className="text-muted-foreground">How much time can you dedicate to learning daily?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="study-time">Daily Study Time (minutes)</Label>
                <Input
                  id="study-time"
                  type="number"
                  min="10"
                  max="180"
                  value={goals.studyTime}
                  onChange={(e) => setGoals({...goals, studyTime: parseInt(e.target.value) || 30})}
                  className="text-center text-lg"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {[15, 30, 60].map((time) => (
                  <Button
                    key={time}
                    variant={goals.studyTime === time ? "default" : "outline"}
                    onClick={() => setGoals({...goals, studyTime: time})}
                    className="h-12"
                  >
                    {time} min
                  </Button>
                ))}
              </div>
              
              <RadioGroup
                value={goals.frequency}
                onValueChange={(value) => setGoals({...goals, frequency: value as any})}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily" id="daily" />
                  <Label htmlFor="daily">Daily practice</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly">Weekly goals</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );
      
      case 'content-preferences':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <BookOpen className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-xl font-bold mb-2">Content Preferences</h2>
              <p className="text-muted-foreground">Which collections interest you most?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Difficulty Level</Label>
                <RadioGroup
                  value={goals.difficulty}
                  onValueChange={(value) => setGoals({...goals, difficulty: value as any})}
                  className="grid grid-cols-2 gap-4 mt-2"
                >
                  {['beginner', 'intermediate', 'advanced', 'mixed'].map((level) => (
                    <div key={level} className="flex items-center space-x-2">
                      <RadioGroupItem value={level} id={level} />
                      <Label htmlFor={level} className="capitalize">{level}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div>
                <Label>Preferred Collections (select multiple)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {collections.map((collection) => (
                    <div key={collection.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={collection.id}
                        checked={goals.collections.includes(collection.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setGoals({...goals, collections: [...goals.collections, collection.id]});
                          } else {
                            setGoals({...goals, collections: goals.collections.filter(c => c !== collection.id)});
                          }
                        }}
                      />
                      <Label htmlFor={collection.id} className="text-sm">{collection.name}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'features':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Trophy className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-xl font-bold mb-2">Learning Features</h2>
              <p className="text-muted-foreground">Choose features that enhance your learning experience</p>
            </div>
            
            <div className="space-y-3">
              {features.map((feature) => (
                <div key={feature.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={feature.id}
                    checked={goals.features.includes(feature.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setGoals({...goals, features: [...goals.features, feature.id]});
                      } else {
                        setGoals({...goals, features: goals.features.filter(f => f !== feature.id)});
                      }
                    }}
                  />
                  <div className="flex-1">
                    <Label htmlFor={feature.id} className="font-medium">{feature.name}</Label>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'review':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto text-primary mb-4" />
              <h2 className="text-xl font-bold mb-2">Review Your Goals</h2>
              <p className="text-muted-foreground">Your personalized learning plan is ready!</p>
            </div>
            
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Daily Words:</span>
                      <span className="font-medium ml-2">{goals.dailyWords}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Study Time:</span>
                      <span className="font-medium ml-2">{goals.studyTime} min</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Frequency:</span>
                      <span className="font-medium ml-2 capitalize">{goals.frequency}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Difficulty:</span>
                      <span className="font-medium ml-2 capitalize">{goals.difficulty}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Selected Collections</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {goals.collections.map((collectionId) => {
                      const collection = collections.find(c => c.id === collectionId);
                      return collection ? (
                        <span key={collectionId} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {collection.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Learning Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {goals.features.map((featureId) => {
                      const feature = features.find(f => f.id === featureId);
                      return feature ? (
                        <span key={featureId} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {feature.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Set Your Learning Goals</CardTitle>
            <span className="text-sm text-muted-foreground">
              {currentStep + 1} / {steps.length}
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          {renderStepContent()}
          
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalSettingWizard;
