
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpenCheck, Lightbulb, Target, Wand2 } from 'lucide-react';

interface GrammarPattern {
  id: string;
  name: string;
  arabicPattern: string;
  description: string;
  examples: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface GrammarModuleProps {
  wordId: string;
  arabic: string;
  partOfSpeech: string;
  root?: string;
}

const GrammarModule: React.FC<GrammarModuleProps> = ({
  wordId,
  arabic,
  partOfSpeech,
  root
}) => {
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  // Mock grammar patterns - in a real app, this would come from a database
  const grammarPatterns: GrammarPattern[] = [
    {
      id: 'fa3ala',
      name: 'فَعَلَ Pattern (Past Tense)',
      arabicPattern: 'فَعَلَ',
      description: 'The basic past tense pattern for triliteral verbs. This is the most common verb pattern in Arabic.',
      examples: ['كَتَبَ (he wrote)', 'قَرَأَ (he read)', 'فَهِمَ (he understood)'],
      difficulty: 'beginner'
    },
    {
      id: 'yaf3alu',
      name: 'يَفْعَلُ Pattern (Present Tense)',
      arabicPattern: 'يَفْعَلُ',
      description: 'The present tense pattern with the prefix يَ for third person masculine singular.',
      examples: ['يَكْتُبُ (he writes)', 'يَقْرَأُ (he reads)', 'يَفْهَمُ (he understands)'],
      difficulty: 'beginner'
    },
    {
      id: 'maf3ul',
      name: 'مَفْعُول Pattern (Passive Participle)',
      arabicPattern: 'مَفْعُول',
      description: 'Pattern for passive participles, indicating something that has been acted upon.',
      examples: ['مَكْتُوب (written)', 'مَقْرُوء (read)', 'مَفْهُوم (understood)'],
      difficulty: 'intermediate'
    },
    {
      id: 'fa3il',
      name: 'فَاعِل Pattern (Active Participle)',
      arabicPattern: 'فَاعِل',
      description: 'Pattern for active participles, indicating the doer of an action.',
      examples: ['كَاتِب (writer)', 'قَارِئ (reader)', 'فَاهِم (understanding)'],
      difficulty: 'intermediate'
    }
  ];

  const getPatternsByDifficulty = (difficulty: string) => {
    return grammarPatterns.filter(p => p.difficulty === difficulty);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Grammar Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Part of Speech:</span>
                <Badge variant="outline" className="ml-2">{partOfSpeech}</Badge>
              </div>
              {root && (
                <div>
                  <span className="text-sm text-muted-foreground">Root:</span>
                  <Badge variant="secondary" className="ml-2 font-arabic">{root}</Badge>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-arabic mb-2">{arabic}</div>
                <div className="text-sm text-muted-foreground">
                  This word follows common Arabic grammatical patterns
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpenCheck className="h-5 w-5" />
            Related Grammar Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="beginner" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="beginner">Beginner</TabsTrigger>
              <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
            
            {['beginner', 'intermediate', 'advanced'].map((level) => (
              <TabsContent key={level} value={level} className="space-y-4">
                {getPatternsByDifficulty(level).map((pattern) => (
                  <div
                    key={pattern.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedPattern(pattern.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{pattern.name}</h4>
                      <Badge className={getDifficultyColor(pattern.difficulty)}>
                        {pattern.difficulty}
                      </Badge>
                    </div>
                    
                    <div className="text-xl font-arabic text-center mb-2 p-2 bg-gray-100 rounded">
                      {pattern.arabicPattern}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {pattern.description}
                    </p>
                    
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground">Examples:</div>
                      {pattern.examples.map((example, idx) => (
                        <div key={idx} className="text-sm font-arabic bg-blue-50 px-2 py-1 rounded inline-block mr-2">
                          {example}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Practice Grammar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button className="w-full" variant="outline">
              <Lightbulb className="h-4 w-4 mr-2" />
              Practice Verb Conjugations
            </Button>
            <Button className="w-full" variant="outline">
              <BookOpenCheck className="h-4 w-4 mr-2" />
              Learn Pattern Recognition
            </Button>
            <Button className="w-full" variant="outline">
              <Target className="h-4 w-4 mr-2" />
              Grammar Exercises
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GrammarModule;
