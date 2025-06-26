
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SurahSelector from '@/components/learning/SurahSelector';
import ThemeSelector from '@/components/learning/ThemeSelector';
import { useCustomLearning } from '@/hooks/useCustomLearning';
import AdPlaceholder from '@/components/ads/AdPlaceholder';
import AdSidebar from '@/components/ads/AdSidebar';
import { useMediaQuery } from '@/hooks/use-mobile';
import { Helmet } from 'react-helmet';

const CustomLearning = () => {
  const { 
    loading, 
    selectedSurahs,
    selectedThemes,
    handleSurahToggle,
    handleThemeToggle,
    handleClearSelections,
    themeWordCounts
  } = useCustomLearning();
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="h-8 w-64 mx-auto bg-gray-200 animate-pulse rounded mb-4"></div>
          <div className="h-4 w-96 mx-auto bg-gray-200 animate-pulse rounded"></div>
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
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-3/4">
            <Card>
              <CardHeader>
                <CardTitle>Create Custom Learning Path</CardTitle>
                <CardDescription>
                  Customize your Arabic vocabulary learning based on your interests and goals
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
                
                <Tabs defaultValue="surah">
                  <TabsList className="mb-4">
                    <TabsTrigger value="surah">Learn from Quran</TabsTrigger>
                    <TabsTrigger value="theme">Learn by Theme</TabsTrigger>
                  </TabsList>
                  <TabsContent value="surah">
                    <SurahSelector 
                      selectedSurahs={selectedSurahs}
                      onSurahToggle={handleSurahToggle}
                      onClearSelections={handleClearSelections}
                    />
                  </TabsContent>
                  <TabsContent value="theme">
                    <ThemeSelector 
                      themeWordCounts={themeWordCounts}
                      selectedThemes={selectedThemes}
                      onThemeToggle={handleThemeToggle}
                      onClearSelections={handleClearSelections}
                    />
                  </TabsContent>
                </Tabs>
                
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
          </div>
          
          <aside className="w-full md:w-1/4">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal pl-5">
                  <li>Select a Quran surah or theme that interests you</li>
                  <li>Choose your difficulty level and word count</li>
                  <li>Generate your personalized vocabulary list</li>
                  <li>Study and practice with the custom word set</li>
                  <li>Track your progress and mastery over time</li>
                </ol>
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
