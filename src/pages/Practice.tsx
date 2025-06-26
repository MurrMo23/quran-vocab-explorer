
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PracticeConfiguration, { PracticeConfig } from '@/components/practice/PracticeConfiguration';
import PracticeSessionManager, { SessionResults, PracticeMode } from '@/components/practice/PracticeSessionManager';
import PracticeResults from '@/components/practice/PracticeResults';
import EnhancedTestingMode, { QuestionType } from '@/components/practice/EnhancedTestingMode';
import WordCard from '@/components/WordCard';
import DailyChallengeCard from '@/components/gamification/DailyChallengeCard';
import AdvancedAudioRecorder from '@/components/audio/AdvancedAudioRecorder';
import AdaptiveLearningDashboard from '@/components/adaptive/AdaptiveLearningDashboard';
import SmartWordSelector from '@/components/adaptive/SmartWordSelector';
import LearningPathGenerator from '@/components/adaptive/LearningPathGenerator';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWordProgress } from '@/hooks/useWordProgress';
import { useGamification } from '@/hooks/useGamification';
import { useAdaptiveLearning } from '@/hooks/useAdaptiveLearning';
import { useAuth } from '@/components/AuthProvider';
import { getWordsByCollection, getAllWords, getAllCollections } from '@/utils/vocabulary';
import { updateWordProgress as updateWordProgressDB } from '@/utils/enhanced-spaced-repetition';
import { Word } from '@/utils/vocabulary-types';
import { toast } from 'sonner';

type PracticeState = 'configuration' | 'session' | 'results' | 'testing' | 'adaptive-selection';

const Practice = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const collection = searchParams.get('collection');
  const { session } = useAuth();
  const { updateProgress } = useWordProgress();
  const { todayChallenge, submitChallengeAttempt } = useGamification();
  const { 
    updateWordDifficulty, 
    completeAdaptiveSession, 
    currentSession: adaptiveSession 
  } = useAdaptiveLearning();

  const [practiceState, setPracticeState] = useState<PracticeState>('configuration');
  const [words, setWords] = useState<Word[]>([]);
  const [currentPracticeMode, setCurrentPracticeMode] = useState<PracticeMode>('vocabulary');
  const [selectedCollection, setSelectedCollection] = useState<string>(collection || 'all');
  const [sessionResults, setSessionResults] = useState<SessionResults | null>(null);
  const [practiceConfig, setPracticeConfig] = useState<PracticeConfig | null>(null);
  const [challengeProgress, setChallengeProgress] = useState(0);
  const [adaptiveSessionType, setAdaptiveSessionType] = useState<'practice' | 'quiz' | 'review'>('practice');

  // Enhanced Testing Mode states
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [testingResults, setTestingResults] = useState<{ correct: number; incorrect: number }>({
    correct: 0,
    incorrect: 0
  });

  useEffect(() => {
    if (collection && collection !== selectedCollection) {
      setSelectedCollection(collection);
    }
  }, [collection]);

  const prepareWordsForPractice = (config: PracticeConfig) => {
    let practiceWords: Word[] = [];
    
    if (selectedCollection === 'all') {
      practiceWords = getAllWords();
    } else {
      practiceWords = getWordsByCollection(selectedCollection);
    }

    // Filter by difficulty if specified
    if (config.difficulty !== 'mixed') {
      practiceWords = practiceWords.filter(word => word.level === config.difficulty);
    }

    // Shuffle if requested
    if (config.shuffleWords) {
      practiceWords = [...practiceWords].sort(() => Math.random() - 0.5);
    }

    // Limit to session length
    practiceWords = practiceWords.slice(0, config.sessionLength);

    return practiceWords;
  };

  const handleStartPractice = (config: PracticeConfig) => {
    if (!session?.user?.id) {
      toast.error('Please log in to start practice');
      return;
    }

    const practiceWords = prepareWordsForPractice(config);
    
    if (practiceWords.length === 0) {
      toast.error('No words available for the selected criteria');
      return;
    }

    setWords(practiceWords);
    setPracticeConfig(config);
    setPracticeState('session');
    toast.success(`Practice session started with ${practiceWords.length} words!`);
  };

  const handleStartAdaptiveSession = (sessionType: 'practice' | 'quiz' | 'review') => {
    setAdaptiveSessionType(sessionType);
    setPracticeState('adaptive-selection');
  };

  const handleAdaptiveWordsSelected = (selectedWords: Word[]) => {
    setWords(selectedWords);
    setPracticeState('session');
    toast.success(`AI-powered ${adaptiveSessionType} session started with ${selectedWords.length} words!`);
  };

  const handleSessionComplete = async (results: SessionResults) => {
    setSessionResults(results);
    setPracticeState('results');

    // Update challenge progress
    if (todayChallenge?.challenge_type === 'vocabulary') {
      const newProgress = challengeProgress + results.correctCount;
      setChallengeProgress(newProgress);
      
      if (newProgress >= todayChallenge.goal_value) {
        await submitChallengeAttempt(todayChallenge.id, newProgress);
      }
    }

    // Complete adaptive session if active
    if (adaptiveSession) {
      await completeAdaptiveSession({
        accuracy: results.accuracy / 100,
        averageResponseTime: (results.timeSpent / results.totalWords) * 1000,
        wordsStudied: results.wordsReviewed,
        difficultyProgression: {}
      });
    }

    toast.success(`Session completed! ${results.accuracy.toFixed(1)}% accuracy`);
  };

  const handleTestingModeResult = async (success: boolean) => {
    const currentWord = words[currentWordIndex];
    
    if (success) {
      setTestingResults(prev => ({ ...prev, correct: prev.correct + 1 }));
    } else {
      setTestingResults(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }

    // Update progress in database and adaptive learning
    if (session?.user?.id && currentWord) {
      const responseTime = Math.random() * 5000 + 2000; // Simulate response time
      
      await updateWordProgressDB(
        currentWord.id,
        success,
        session.user.id
      );
      
      await updateProgress(currentWord.id, currentWord.collections[0] || 'general', {
        level: success ? 1 : 0,
        review_count: 1,
        success_streak: success ? 1 : 0,
        last_reviewed: new Date().toISOString()
      });

      // Update adaptive learning difficulty
      await updateWordDifficulty(currentWord.id, success, responseTime);
    }
  };

  const handleTestingModeNext = () => {
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      // Complete testing session
      const results: SessionResults = {
        totalWords: words.length,
        correctCount: testingResults.correct,
        incorrectCount: testingResults.incorrect,
        accuracy: (testingResults.correct / words.length) * 100,
        timeSpent: 0, // We don't track time in testing mode
        wordsReviewed: words.map(w => w.id),
        difficultWords: [] // Could be enhanced to track difficult words
      };
      handleSessionComplete(results);
    }
  };

  const startTestingMode = () => {
    setCurrentWordIndex(0);
    setTestingResults({ correct: 0, incorrect: 0 });
    setPracticeState('testing');
  };

  const restartPractice = () => {
    setPracticeState('configuration');
    setSessionResults(null);
    setWords([]);
    setCurrentWordIndex(0);
    setTestingResults({ correct: 0, incorrect: 0 });
    setChallengeProgress(0);
  };

  const reviewMistakes = () => {
    if (sessionResults?.difficultWords.length) {
      // Filter words to only show difficult ones
      const difficultWordsData = words.filter(word => 
        sessionResults.difficultWords.includes(word.id)
      );
      setWords(difficultWordsData);
      setPracticeState('session');
    }
  };

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
        <p className="text-muted-foreground mb-6">
          Please sign in to track your progress and access personalized practice sessions.
        </p>
        <Button onClick={() => navigate('/auth')}>
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="text-muted-foreground hover:text-foreground flex items-center transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back</span>
        </button>
        
        <h1 className="text-2xl font-bold">Practice Session</h1>
        
        <div></div>
      </div>

      {/* Daily Challenge Card */}
      {todayChallenge && practiceState === 'configuration' && (
        <div className="mb-8">
          <DailyChallengeCard 
            challenge={todayChallenge}
            userProgress={challengeProgress}
            onStartChallenge={() => toast.info('Challenge started! Keep practicing to complete it.')}
          />
        </div>
      )}

      {/* Practice States */}
      {practiceState === 'configuration' && (
        <Tabs defaultValue="traditional" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="traditional">Traditional Practice</TabsTrigger>
            <TabsTrigger value="adaptive">AI-Powered Learning</TabsTrigger>
            <TabsTrigger value="learning-path">Learning Paths</TabsTrigger>
          </TabsList>

          <TabsContent value="traditional" className="space-y-6">
            <PracticeConfiguration
              onStart={handleStartPractice}
              collections={getAllCollections().map(c => c.id)}
              selectedCollection={selectedCollection}
              onCollectionChange={setSelectedCollection}
            />
            
            {/* Testing Mode Option */}
            <div className="text-center">
              <Button 
                onClick={startTestingMode}
                variant="outline"
                className="w-full max-w-md"
              >
                Start Enhanced Testing Mode
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="adaptive">
            <AdaptiveLearningDashboard 
              onStartAdaptiveSession={handleStartAdaptiveSession}
            />
          </TabsContent>

          <TabsContent value="learning-path">
            <LearningPathGenerator />
          </TabsContent>
        </Tabs>
      )}

      {practiceState === 'adaptive-selection' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">AI Word Selection</h2>
            <Button 
              variant="outline" 
              onClick={() => setPracticeState('configuration')}
            >
              Back to Options
            </Button>
          </div>
          <SmartWordSelector
            onWordsSelected={handleAdaptiveWordsSelected}
            sessionType={adaptiveSessionType}
            targetCount={20}
          />
        </div>
      )}

      {practiceState === 'session' && (
        <PracticeSessionManager
          words={words}
          onSessionComplete={handleSessionComplete}
          onModeChange={setCurrentPracticeMode}
          currentMode={currentPracticeMode}
        />
      )}

      {practiceState === 'testing' && words[currentWordIndex] && (
        <EnhancedTestingMode
          word={words[currentWordIndex]}
          questionType={'multiple-choice' as QuestionType}
          otherWords={words.filter(w => w.id !== words[currentWordIndex].id)}
          onNext={handleTestingModeNext}
          onResult={handleTestingModeResult}
          questionNumber={currentWordIndex + 1}
          totalQuestions={words.length}
          timeLimit={30}
        />
      )}

      {practiceState === 'results' && sessionResults && (
        <PracticeResults
          results={sessionResults}
          onRestartSession={restartPractice}
          onBackToDashboard={() => navigate('/dashboard')}
          onReviewMistakes={reviewMistakes}
        />
      )}
    </div>
  );
};

export default Practice;
