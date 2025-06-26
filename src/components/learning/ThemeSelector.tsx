
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collection } from '@/utils/vocabulary-types';

interface ThemeSelectorProps {
  themeWordCounts: (Collection & { wordCount: number })[];
  selectedThemes: string[];
  onThemeToggle: (themeId: string) => void;
  onClearSelections: () => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  themeWordCounts, 
  selectedThemes, 
  onThemeToggle,
  onClearSelections
}) => {
  return (
    <div className="glass-card p-6 rounded-xl mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="h-5 w-5 text-primary mr-2" />
          <h2 className="text-xl font-semibold">Select Themes</h2>
        </div>
        <div>
          <span className="text-sm text-muted-foreground mr-2">
            {selectedThemes.length} selected
          </span>
          {selectedThemes.length > 0 && (
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
        {themeWordCounts.map((theme) => (
          <div 
            key={theme.id}
            className={`flex items-center space-x-2 border rounded-lg p-3 transition-colors ${
              selectedThemes.includes(theme.id) 
                ? 'border-primary bg-primary/5' 
                : 'border-transparent hover:bg-accent'
            }`}
          >
            <Checkbox 
              id={`theme-${theme.id}`}
              checked={selectedThemes.includes(theme.id)}
              onCheckedChange={() => onThemeToggle(theme.id)}
            />
            <div className="flex-1">
              <label 
                htmlFor={`theme-${theme.id}`}
                className="text-sm font-medium leading-none cursor-pointer flex justify-between"
              >
                <span>{theme.name}</span>
                <span className="text-muted-foreground">{theme.wordCount} words</span>
              </label>
              <p className="text-xs text-muted-foreground mt-1">{theme.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
