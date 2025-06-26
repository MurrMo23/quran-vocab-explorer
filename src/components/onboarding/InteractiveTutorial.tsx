
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  BookOpen, 
  Target, 
  Trophy,
  Play,
  Volume2
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  action: string;
  component: 'intro' | 'navigation' | 'practice' | 'features' | 'complete';
  interactive?: boolean;
}

const InteractiveTutorial: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const tutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Quran Vocab Explorer',
      description: 'Your journey to mastering Quranic Arabic vocabulary starts here. Let\'s take a quick tour!',
      action: 'Get Started',
      component: 'intro'
    },
    {
      id: 'navigation',
      title: 'Explore the Interface',
      description: 'Navigate through Collections, Practice sessions, and track your progress with Analytics.',
      action: 'Try Navigation',
      component: 'navigation',
      interactive: true
    },
    {
      id: 'collections',
      title: 'Browse Word Collections',
      description: 'Discover organized collections of vocabulary from different themes and difficulty levels.',
      action: 'View Collections',
      component: 'practice',
      interactive: true
    },
    {
      id: 'practice',
      title: 'Start Learning',
      description: 'Practice with flashcards, quizzes, and interactive exercises tailored to your level.',
      action: 'Try Practice',
      component: 'practice',
      interactive: true
    },
    {
      id: 'features',
      title: 'Advanced Features',
      description: 'Discover audio pronunciation, community features, and personalized learning paths.',
      action: 'Explore Features',
      component: 'features'
    },
    {
      id: 'complete',
      title: 'Ready to Begin!',
      description: 'You\'re all set! Start your personalized learning journey with Quranic Arabic.',
      action: 'Start Learning',
      component: 'complete'
    }
  ];

  const currentStepData = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  const handleNext = () => {
    const stepId = currentStepData.id;
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
    
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('tutorialCompleted', 'true');
    window.location.href = '/dashboard';
  };

  const renderStepContent = () => {
    switch (currentStepData.component) {
      case 'intro':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
              <p className="text-muted-foreground">{currentStepData.description}</p>
            </div>
          </div>
        );
      
      case 'navigation':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">{currentStepData.title}</h2>
              <p className="text-muted-foreground">{currentStepData.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <BookOpen className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium">Collections</h3>
                <p className="text-sm text-muted-foreground">Browse organized vocabulary</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <Target className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium">Practice</h3>
                <p className="text-sm text-muted-foreground">Interactive learning exercises</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <Trophy className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-medium">Analytics</h3>
                <p className="text-sm text-muted-foreground">Track your progress</p>
              </div>
            </div>
          </div>
        );
      
      case 'practice':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">{currentStepData.title}</h2>
              <p className="text-muted-foreground">{currentStepData.description}</p>
            </div>
            <div className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="text-center space-y-4">
                <div className="text-3xl font-arabic">اللَّهُ</div>
                <div className="text-sm text-muted-foreground">/al-laahu/</div>
                <div className="font-medium">Allah (God)</div>
                <div className="flex justify-center gap-2">
                  <Button size="sm" variant="outline">
                    <Volume2 className="h-4 w-4 mr-1" />
                    Listen
                  </Button>
                  <Button size="sm" variant="outline">
                    <Play className="h-4 w-4 mr-1" />
                    Practice
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'features':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">{currentStepData.title}</h2>
              <p className="text-muted-foreground">{currentStepData.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <Volume2 className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-medium">Audio Pronunciation</h3>
                <p className="text-sm text-muted-foreground">Listen to native pronunciation</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Trophy className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-medium">Achievements</h3>
                <p className="text-sm text-muted-foreground">Earn badges and track milestones</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Target className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-medium">Personalized Learning</h3>
                <p className="text-sm text-muted-foreground">Adaptive difficulty and spaced repetition</p>
              </div>
              <div className="p-4 border rounded-lg">
                <BookOpen className="h-6 w-6 text-primary mb-2" />
                <h3 className="font-medium">Cultural Context</h3>
                <p className="text-sm text-muted-foreground">Learn etymology and cultural significance</p>
              </div>
            </div>
          </div>
        );
      
      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{currentStepData.title}</h2>
              <p className="text-muted-foreground">{currentStepData.description}</p>
            </div>
            <div className="flex justify-center gap-2">
              <Badge variant="secondary">Tutorial Complete</Badge>
              <Badge variant="outline">{completedSteps.length} steps mastered</Badge>
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {tutorialSteps.length}
              </span>
              <Badge variant="outline" className="text-xs">
                {Math.round(progress)}% Complete
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip Tutorial
            </Button>
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
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <Button onClick={handleNext}>
              {currentStep === tutorialSteps.length - 1 ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Complete
                </>
              ) : (
                <>
                  {currentStepData.action}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveTutorial;
