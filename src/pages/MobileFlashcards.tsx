
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import MobileFlashcards from '@/components/mobile/MobileFlashcards';
import OfflineIndicator from '@/components/mobile/OfflineIndicator';
import { getWordsByCollection, getDailyWords } from '@/utils/vocabulary';

const MobileFlashcardsPage = () => {
  const navigate = useNavigate();
  const { collectionId } = useParams();
  const [sessionResults, setSessionResults] = useState<{ easy: number; difficult: number } | null>(null);

  const words = collectionId 
    ? getWordsByCollection(collectionId).slice(0, 20) 
    : getDailyWords(20);

  const handleSessionComplete = (results: { easy: number; difficult: number }) => {
    setSessionResults(results);
    // In a real app, you'd save this progress to the backend
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <OfflineIndicator />
      
      <div className="max-w-sm mx-auto space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">Mobile Flashcards</h1>
        </div>

        <MobileFlashcards
          words={words}
          onComplete={handleSessionComplete}
        />
      </div>
    </div>
  );
};

export default MobileFlashcardsPage;
