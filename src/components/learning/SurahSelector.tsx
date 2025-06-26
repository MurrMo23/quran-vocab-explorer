
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Define Surah data structure
export interface Surah {
  id: number;
  name: string;
  arabicName: string;
  verses: number;
  category: 'Meccan' | 'Medinan';
}

// Common Surahs for learning vocabulary
export const commonSurahs: Surah[] = [
  { id: 1, name: 'Al-Fatihah', arabicName: 'الفاتحة', verses: 7, category: 'Meccan' },
  { id: 2, name: 'Al-Baqarah', arabicName: 'البقرة', verses: 286, category: 'Medinan' },
  { id: 3, name: "Ali 'Imran", arabicName: 'آل عمران', verses: 200, category: 'Medinan' },
  { id: 4, name: 'An-Nisa', arabicName: 'النساء', verses: 176, category: 'Medinan' },
  { id: 12, name: 'Yusuf', arabicName: 'يوسف', verses: 111, category: 'Meccan' },
  { id: 18, name: 'Al-Kahf', arabicName: 'الكهف', verses: 110, category: 'Meccan' },
  { id: 19, name: 'Maryam', arabicName: 'مريم', verses: 98, category: 'Meccan' },
  { id: 36, name: 'Ya-Sin', arabicName: 'يس', verses: 83, category: 'Meccan' },
  { id: 55, name: 'Ar-Rahman', arabicName: 'الرحمن', verses: 78, category: 'Medinan' },
  { id: 56, name: "Al-Waqi'ah", arabicName: 'الواقعة', verses: 96, category: 'Meccan' },
  { id: 67, name: 'Al-Mulk', arabicName: 'الملك', verses: 30, category: 'Meccan' },
  { id: 112, name: 'Al-Ikhlas', arabicName: 'الإخلاص', verses: 4, category: 'Meccan' },
  { id: 113, name: 'Al-Falaq', arabicName: 'الفلق', verses: 5, category: 'Meccan' },
  { id: 114, name: 'An-Nas', arabicName: 'الناس', verses: 6, category: 'Meccan' },
];

interface SurahSelectorProps {
  selectedSurahs: number[];
  onSurahToggle: (surahId: number) => void;
  onClearSelections: () => void;
}

const SurahSelector: React.FC<SurahSelectorProps> = ({ 
  selectedSurahs, 
  onSurahToggle,
  onClearSelections
}) => {
  return (
    <div className="glass-card p-6 rounded-xl mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <BookOpen className="h-5 w-5 text-primary mr-2" />
          <h2 className="text-xl font-semibold">Select Surahs</h2>
        </div>
        <div>
          <span className="text-sm text-muted-foreground mr-2">
            {selectedSurahs.length} selected
          </span>
          {selectedSurahs.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearSelections}
            >
              Clear
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-3">
        {commonSurahs.map((surah) => (
          <div 
            key={surah.id}
            className={`flex items-center space-x-2 border rounded-lg p-3 transition-colors ${
              selectedSurahs.includes(surah.id) 
                ? 'border-primary bg-primary/5' 
                : 'border-transparent hover:bg-accent'
            }`}
          >
            <Checkbox 
              id={`surah-${surah.id}`}
              checked={selectedSurahs.includes(surah.id)}
              onCheckedChange={() => onSurahToggle(surah.id)}
            />
            <div className="flex-1">
              <label 
                htmlFor={`surah-${surah.id}`}
                className="text-sm font-medium cursor-pointer flex justify-between"
              >
                <div>
                  <span className="mr-2">{surah.id}.</span>
                  {surah.name}
                </div>
                <span className="text-muted-foreground">{surah.verses} verses</span>
              </label>
              <p className="text-xs text-primary font-arabic">{surah.arabicName}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SurahSelector;
