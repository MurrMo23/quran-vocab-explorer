
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Star, Clock, TrendingUp } from 'lucide-react';
import { Word } from '@/utils/vocabulary-types';
import { useAdaptiveLearning } from '@/hooks/useAdaptiveLearning';
import { getAllWords } from '@/utils/vocabulary';

interface SmartWordSelectorProps {
  onWordsSelected: (words: Word[]) => void;
  sessionType: 'practice' | 'quiz' | 'review';
  targetCount?: number;
}

const SmartWordSelector: React.FC<SmartWordSelectorProps> = ({
  onWordsSelected,
  sessionType,
  targetCount = 10
}) => {
  const { adaptiveLearningData, wordDifficulties } = useAdaptiveLearning();
  const [selectedWords, setSelectedWords] = useState<Word[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<{
    word: Word;
    confidence: number;
    reason: string;
    priority: number;
  }[]>([]);

  // AI-powered word selection algorithm
  const generateSmartRecommendations = () => {
    const allWords = getAllWords();
    const recommendations = [];

    for (const word of allWords) {
      const wordDifficulty = wordDifficulties.find(wd => wd.wordId === word.id);
      
      // Calculate AI confidence and priority
      let confidence = 0.5; // Base confidence
      let priority = 0.5; // Base priority
      let reason = 'General practice';

      // Factor 1: User's current difficulty level
      if (adaptiveLearningData?.currentDifficulty === word.level) {
        confidence += 0.2;
        priority += 0.3;
        reason = 'Matches your optimal difficulty';
      } else if (adaptiveLearningData?.currentDifficulty === 'intermediate' && word.level === 'beginner') {
        confidence += 0.1;
        priority += 0.1;
        reason = 'Foundation strengthening';
      }

      // Factor 2: Word-specific performance data
      if (wordDifficulty) {
        if (wordDifficulty.masteryLevel < 0.6) {
          confidence += 0.25;
          priority += 0.4;
          reason = 'Needs improvement';
        } else if (wordDifficulty.masteryLevel > 0.8) {
          confidence += 0.1;
          priority -= 0.2;
          reason = 'Mastery maintenance';
        }

        // Adjust for response time
        if (wordDifficulty.responseTimeAvg > 5000) {
          confidence += 0.15;
          priority += 0.2;
          reason = 'Slow recognition time';
        }
      } else {
        // New word - adjust based on session type
        if (sessionType === 'practice') {
          confidence += 0.2;
          priority += 0.3;
          reason = 'New word introduction';
        }
      }

      // Factor 3: Weak areas focus
      if (adaptiveLearningData?.weakAreas.includes(word.collections[0])) {
        confidence += 0.3;
        priority += 0.5;
        reason = 'Weak area focus';
      }

      // Factor 4: Frequency and commonality
      if (word.frequency > 0.7) {
        confidence += 0.1;
        priority += 0.2;
        reason = 'High-frequency word';
      }

      // Factor 5: Session type specific adjustments
      if (sessionType === 'review' && wordDifficulty?.masteryLevel && wordDifficulty.masteryLevel < 0.7) {
        confidence += 0.2;
        priority += 0.3;
        reason = 'Review needed';
      } else if (sessionType === 'quiz' && wordDifficulty?.masteryLevel && wordDifficulty.masteryLevel > 0.5) {
        confidence += 0.15;
        priority += 0.2;
        reason = 'Ready for testing';
      }

      // Normalize scores
      confidence = Math.min(0.95, Math.max(0.1, confidence));
      priority = Math.min(1.0, Math.max(0.1, priority));

      recommendations.push({
        word,
        confidence,
        reason,
        priority
      });
    }

    // Sort by priority and confidence
    return recommendations
      .sort((a, b) => (b.priority * 0.7 + b.confidence * 0.3) - (a.priority * 0.7 + a.confidence * 0.3))
      .slice(0, targetCount * 2); // Get more than needed for selection
  };

  useEffect(() => {
    if (adaptiveLearningData) {
      const recommendations = generateSmartRecommendations();
      setAiRecommendations(recommendations);
      
      // Auto-select top recommendations
      const topWords = recommendations.slice(0, targetCount).map(r => r.word);
      setSelectedWords(topWords);
    }
  }, [adaptiveLearningData, sessionType, targetCount]);

  const toggleWordSelection = (word: Word) => {
    setSelectedWords(prev => {
      const isSelected = prev.some(w => w.id === word.id);
      if (isSelected) {
        return prev.filter(w => w.id !== word.id);
      } else if (prev.length < targetCount) {
        return [...prev, word];
      }
      return prev;
    });
  };

  const getReasonIcon = (reason: string) => {
    if (reason.includes('weak') || reason.includes('improvement')) return '🎯';
    if (reason.includes('new')) return '🆕';
    if (reason.includes('review')) return '🔄';
    if (reason.includes('frequency')) return '⭐';
    if (reason.includes('slow')) return '⏱️';
    return '🧠';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const averageConfidence = aiRecommendations.length > 0
    ? aiRecommendations.slice(0, targetCount).reduce((sum, rec) => sum + rec.confidence, 0) / Math.min(targetCount, aiRecommendations.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* AI Selection Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            AI Smart Selection
            <Badge variant="secondary" className="ml-auto">
              {Math.round(averageConfidence * 100)}% Match
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>AI Confidence in Selection</span>
                <span>{Math.round(averageConfidence * 100)}%</span>
              </div>
              <Progress value={averageConfidence * 100} className="h-2" />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Selected {selectedWords.length} of {targetCount} words
              </span>
              <Button 
                onClick={() => onWordsSelected(selectedWords)}
                disabled={selectedWords.length === 0}
                className="ml-4"
              >
                Start {sessionType === 'practice' ? 'Practice' : sessionType === 'quiz' ? 'Quiz' : 'Review'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {aiRecommendations.map((rec, index) => {
              const isSelected = selectedWords.some(w => w.id === rec.word.id);
              
              return (
                <div
                  key={rec.word.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => toggleWordSelection(rec.word)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="arabic-text text-lg">{rec.word.arabic}</span>
                        <Badge variant="outline" className="text-xs">
                          {rec.word.level}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {rec.word.meaning} • /{rec.word.transliteration}/
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span>{getReasonIcon(rec.reason)}</span>
                        <span className="text-muted-foreground">{rec.reason}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getConfidenceColor(rec.confidence)}`}>
                        {Math.round(rec.confidence * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Priority: {Math.round(rec.priority * 100)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartWordSelector;
