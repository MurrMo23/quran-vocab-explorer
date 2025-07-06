
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import SurahSelector from '@/components/learning/SurahSelector';
import ThemeSelector from '@/components/learning/ThemeSelector';
import LearningPathForm from '@/components/learning/LearningPathForm';
import { useCustomLearning } from '@/hooks/useCustomLearning';
import AdPlaceholder from '@/components/ads/AdPlaceholder';
import AdSidebar from '@/components/ads/AdSidebar';
import { useMediaQuery } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  Play, 
  Eye, 
  Trash2, 
  ExternalLink,
  Star,
  Users,
  Clock,
  Target
} from 'lucide-react';

const CustomLearning = () => {
  const { 
    loading, 
    selectedSurahs,
    selectedThemes,
    userPaths,
    publicPaths,
    handleSurahToggle,
    handleThemeToggle,
    handleClearSelections,
    themeWordCounts,
    getSelectedWords,
    getPathWords,
    saveLearningPath,
    deleteLearningPath
  } = useCustomLearning();
  
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [currentStep, setCurrentStep] = useState<'select' | 'preview' | 'create' | 'manage'>('select');
  const [activeTab, setActiveTab] = useState<'surah' | 'theme'>('theme');

  // Calculate current selection stats
  const selectedWords = useMemo(() => getSelectedWords(), [selectedSurahs, selectedThemes]);
  const hasSelections = selectedSurahs.length > 0 || selectedThemes.length > 0;
  const totalWordCount = selectedWords.length;

  const handleCreatePath = async (pathData: {
    name: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    isPublic: boolean;
  }) => {
    const savedPath = await saveLearningPath(pathData);
    if (savedPath) {
      setCurrentStep('manage');
    }
  };

  const handleStartPractice = (words: any[]) => {
    // Store words in localStorage for practice session
    localStorage.setItem('customPracticeWords', JSON.stringify(words));
    navigate('/practice?mode=custom');
  };

  const handleStartQuiz = (words: any[]) => {
    // Store words in localStorage for quiz session
    localStorage.setItem('customQuizWords', JSON.stringify(words));
    navigate('/quiz?mode=custom');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="h-8 w-64 mx-auto bg-muted animate-pulse rounded mb-4"></div>
          <div className="h-4 w-96 mx-auto bg-muted animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Custom Learning Path | Arabic Words</title>
        <meta name="description" content="Create your own personalized Arabic learning path based on themes or Quranic surahs." />
      </Helmet>
      
      <div className="container mx-auto py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Custom Learning Path</h1>
            <div className="flex items-center gap-2">
              {currentStep !== 'select' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentStep('select')}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Selection
                </Button>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className={`flex items-center gap-2 ${currentStep === 'select' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'select' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                1
              </div>
              <span className="font-medium">Select Content</span>
            </div>
            <div className="h-px bg-border flex-1" />
            <div className={`flex items-center gap-2 ${currentStep === 'preview' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'preview' ? 'bg-primary text-primary-foreground' : hasSelections ? 'bg-accent' : 'bg-muted'}`}>
                2
              </div>
              <span className="font-medium">Preview Words</span>
            </div>
            <div className="h-px bg-border flex-1" />
            <div className={`flex items-center gap-2 ${currentStep === 'create' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'create' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                3
              </div>
              <span className="font-medium">Create Path</span>
            </div>
            <div className="h-px bg-border flex-1" />
            <div className={`flex items-center gap-2 ${currentStep === 'manage' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'manage' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                4
              </div>
              <span className="font-medium">Manage Paths</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-3/4">
            {/* Step 1: Selection */}
            {currentStep === 'select' && (
              <Card>
                <CardHeader>
                  <CardTitle>Choose Your Learning Content</CardTitle>
                  <CardDescription>
                    Select Quranic surahs or vocabulary themes to build your personalized learning path
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isMobile && (
                    <div className="mb-6">
                      <AdPlaceholder 
                        adId="custom-learning-mobile" 
                        size="mobile-banner"
                        className="mx-auto"
                        location="custom-learning-mobile"
                      />
                    </div>
                  )}
                  
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'surah' | 'theme')}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="theme">Learn by Theme</TabsTrigger>
                      <TabsTrigger value="surah">Learn from Quran</TabsTrigger>
                    </TabsList>
                    <TabsContent value="theme">
                      <ThemeSelector 
                        themeWordCounts={themeWordCounts}
                        selectedThemes={selectedThemes}
                        onThemeToggle={handleThemeToggle}
                        onClearSelections={handleClearSelections}
                      />
                    </TabsContent>
                    <TabsContent value="surah">
                      <SurahSelector 
                        selectedSurahs={selectedSurahs}
                        onSurahToggle={handleSurahToggle}
                        onClearSelections={handleClearSelections}
                      />
                    </TabsContent>
                  </Tabs>
                  
                  {hasSelections && (
                    <div className="mt-6 p-4 bg-accent rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Current Selection</h3>
                          <p className="text-sm text-muted-foreground">
                            ~{totalWordCount} words selected
                          </p>
                        </div>
                        <Button onClick={() => setCurrentStep('preview')}>
                          Preview Words
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {!isMobile && (
                    <div className="mt-8">
                      <AdPlaceholder 
                        adId="custom-learning-bottom" 
                        size="leaderboard"
                        className="mx-auto"
                        location="custom-learning"
                        lazyLoad={true}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Preview */}
            {currentStep === 'preview' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Word Preview
                    </CardTitle>
                    <CardDescription>
                      Review the {totalWordCount} words in your selection
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4">
                      {/* Selection Summary */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedThemes.map(themeId => {
                          const theme = themeWordCounts.find(t => t.id === themeId);
                          return (
                            <Badge key={themeId} variant="secondary">
                              {theme?.name} ({theme?.wordCount} words)
                            </Badge>
                          );
                        })}
                        {selectedSurahs.map(surahId => {
                          const surah = themeWordCounts.find(s => s.id === surahId.toString());
                          return (
                            <Badge key={surahId} variant="outline">
                              Surah {surahId}
                            </Badge>
                          );
                        })}
                      </div>

                      {/* Quick Actions */}
                      <div className="flex flex-wrap gap-3 mb-6">
                        <Button onClick={() => handleStartPractice(selectedWords)}>
                          <Play className="h-4 w-4 mr-2" />
                          Start Practice Now
                        </Button>
                        <Button variant="outline" onClick={() => handleStartQuiz(selectedWords)}>
                          <Target className="h-4 w-4 mr-2" />
                          Start Quiz Now
                        </Button>
                        <Button variant="outline" onClick={() => setCurrentStep('create')}>
                          <BookOpen className="h-4 w-4 mr-2" />
                          Save as Learning Path
                        </Button>
                      </div>

                      <Separator />

                      {/* Word List Preview */}
                      <div className="max-h-96 overflow-y-auto">
                        <div className="grid gap-3">
                          {selectedWords.slice(0, 20).map((word, index) => (
                            <div key={word.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <div className="font-arabic text-lg font-semibold">{word.arabic}</div>
                                <div className="text-sm text-muted-foreground">{word.transliteration}</div>
                                <div className="text-sm">{word.meaning}</div>
                              </div>
                              <Badge variant={word.level === 'beginner' ? 'default' : word.level === 'intermediate' ? 'secondary' : 'destructive'}>
                                {word.level}
                              </Badge>
                            </div>
                          ))}
                          {selectedWords.length > 20 && (
                            <div className="text-center text-muted-foreground text-sm py-4">
                              ... and {selectedWords.length - 20} more words
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Create Path */}
            {currentStep === 'create' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Save Your Learning Path</CardTitle>
                    <CardDescription>
                      Create a reusable learning path with {totalWordCount} words
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LearningPathForm 
                      onSave={handleCreatePath}
                      disabled={loading}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4: Manage Paths */}
            {currentStep === 'manage' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Learning Paths</CardTitle>
                    <CardDescription>
                      Manage your saved learning paths and explore public ones
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="my-paths">
                      <TabsList className="mb-4">
                        <TabsTrigger value="my-paths">My Paths ({userPaths.length})</TabsTrigger>
                        <TabsTrigger value="public-paths">Public Paths ({publicPaths.length})</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="my-paths" className="space-y-4">
                        {userPaths.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No learning paths created yet.</p>
                            <Button 
                              variant="outline" 
                              className="mt-4"
                              onClick={() => setCurrentStep('select')}
                            >
                              Create Your First Path
                            </Button>
                          </div>
                        ) : (
                          userPaths.map(path => (
                            <Card key={path.id} className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold">{path.name}</h3>
                                  <p className="text-sm text-muted-foreground mb-2">{path.description}</p>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <BookOpen className="h-4 w-4" />
                                      {getPathWords(path).length} words
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4" />
                                      {path.difficulty}
                                    </div>
                                    {path.is_public && (
                                      <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        Public
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {new Date(path.created_at).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleStartPractice(getPathWords(path))}
                                  >
                                    <Play className="h-4 w-4 mr-1" />
                                    Practice
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleStartQuiz(getPathWords(path))}
                                  >
                                    <Target className="h-4 w-4 mr-1" />
                                    Quiz
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => deleteLearningPath(path.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))
                        )}
                      </TabsContent>
                      
                      <TabsContent value="public-paths" className="space-y-4">
                        {publicPaths.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No public learning paths available yet.</p>
                          </div>
                        ) : (
                          publicPaths.map(path => (
                            <Card key={path.id} className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold">{path.name}</h3>
                                  <p className="text-sm text-muted-foreground mb-2">{path.description}</p>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <BookOpen className="h-4 w-4" />
                                      {getPathWords(path).length} words
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Star className="h-4 w-4" />
                                      {path.difficulty}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {new Date(path.created_at).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleStartPractice(getPathWords(path))}
                                  >
                                    <Play className="h-4 w-4 mr-1" />
                                    Practice
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleStartQuiz(getPathWords(path))}
                                  >
                                    <Target className="h-4 w-4" />
                                    Quiz
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <aside className="w-full lg:w-1/4">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Learning Path Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current Progress */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{Math.round(((['select', 'preview', 'create', 'manage'].indexOf(currentStep) + 1) / 4) * 100)}%</span>
                    </div>
                    <Progress value={((['select', 'preview', 'create', 'manage'].indexOf(currentStep) + 1) / 4) * 100} />
                  </div>
                  
                  <Separator />
                  
                  {/* Quick Stats */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Selected Themes:</span>
                      <span className="font-medium">{selectedThemes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Selected Surahs:</span>
                      <span className="font-medium">{selectedSurahs.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Words:</span>
                      <span className="font-medium">{totalWordCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Your Paths:</span>
                      <span className="font-medium">{userPaths.length}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setCurrentStep('manage')}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      View My Paths
                    </Button>
                    {hasSelections && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => handleStartPractice(selectedWords)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Quick Practice
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <AdSidebar location="custom-learning-sidebar" />
          </aside>
        </div>
      </div>
    </>
  );
};

export default CustomLearning;
