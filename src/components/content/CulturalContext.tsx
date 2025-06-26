
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Globe, History, Lightbulb } from 'lucide-react';

interface CulturalContextProps {
  wordId: string;
  arabic: string;
  root?: string;
  etymology?: string;
  culturalNotes?: string;
  historicalContext?: string;
  relatedConcepts?: string[];
}

const CulturalContext: React.FC<CulturalContextProps> = ({
  wordId,
  arabic,
  root,
  etymology,
  culturalNotes,
  historicalContext,
  relatedConcepts = []
}) => {
  // Mock cultural data - in a real app, this would come from a database
  const contextData = {
    etymology: etymology || `The word ${arabic} derives from the root ${root || 'ج-ذ-ر'}, which carries the fundamental meaning of 'foundation' or 'origin'. This root appears in various forms throughout classical Arabic literature.`,
    culturalNotes: culturalNotes || `In traditional Arabic culture, this concept holds special significance in daily life and spiritual practice. It represents a fundamental aspect of Islamic worldview.`,
    historicalContext: historicalContext || `This term appears in classical Arabic poetry and early Islamic texts, demonstrating its deep roots in pre-Islamic and Islamic Arabic literature.`,
    relatedConcepts: relatedConcepts.length > 0 ? relatedConcepts : ['spiritual growth', 'community bonds', 'moral foundation', 'divine connection']
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Etymology & Origins
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{contextData.etymology}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Cultural Context
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{contextData.culturalNotes}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Historical Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed">{contextData.historicalContext}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Related Concepts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {contextData.relatedConcepts.map((concept, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {concept}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CulturalContext;
