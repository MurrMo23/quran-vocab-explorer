
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ArrowRight, BookOpen, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PreviewModeProps {
  type: 'practice' | 'quiz';
  children: React.ReactNode;
}

const PreviewMode: React.FC<PreviewModeProps> = ({ type, children }) => {
  const navigate = useNavigate();
  
  const typeConfig = {
    practice: {
      title: 'Practice Mode Preview',
      description: 'Try a few words to see how our practice system works',
      icon: <BookOpen className="h-5 w-5" />,
    },
    quiz: {
      title: 'Quiz Mode Preview',
      description: 'Experience our interactive quiz system',
      icon: <Target className="h-5 w-5" />,
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            {typeConfig[type].icon}
            {typeConfig[type].title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            {typeConfig[type].description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Sign Up for Full Access
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/auth')}
              className="flex items-center gap-2"
            >
              Already have an account? Log In
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Limited preview content */}
      <div className="relative">
        {children}
        
        {/* Overlay after preview */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
        
        <Card className="mt-6 border-primary/20">
          <CardContent className="p-6 text-center">
            <Lock className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Want to continue?</h3>
            <p className="text-muted-foreground mb-4">
              Sign up for free to access all features, track your progress, and unlock unlimited {type} sessions.
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              size="lg"
              className="w-full sm:w-auto"
            >
              Get Started Free
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PreviewMode;
