
import React from 'react';
import { Book, AlignLeft, BookOpen, Hash } from 'lucide-react';
import { Word } from '@/utils/vocabulary';
import AudioPlayer from './AudioPlayer';
import { cn } from '@/lib/utils';

interface WordDetailProps {
  word: Word;
  className?: string;
}

const WordDetail: React.FC<WordDetailProps> = ({ word, className }) => {
  return (
    <div className={cn("glass-card rounded-xl p-6", className)}>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-arabic mb-2">{word.arabic}</h1>
          <div className="text-lg text-muted-foreground mb-1">{word.transliteration}</div>
          <h2 className="text-2xl font-medium">{word.meaning}</h2>
        </div>
        
        <AudioPlayer 
          src={word.audioUrl} 
          text={word.arabic}
          voice="Sarah"
          label="Listen to pronunciation" 
          className="mt-4 md:mt-0"
        />
      </div>
      
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center">
          <div className="bg-primary/10 p-2 rounded-full mr-3">
            <Book className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Part of Speech</div>
            <div className="font-medium capitalize">{word.partOfSpeech}</div>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="bg-primary/10 p-2 rounded-full mr-3">
            <AlignLeft className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Root</div>
            <div className="font-medium font-arabic">{word.root}</div>
          </div>
        </div>
        
        <div className="flex items-center">
          <div className="bg-primary/10 p-2 rounded-full mr-3">
            <Hash className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Frequency</div>
            <div className="font-medium">{word.frequency} occurrences</div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3 flex items-center">
          <BookOpen className="h-5 w-5 mr-2 text-primary" />
          <span>Quranic Examples</span>
        </h3>
        
        <div className="space-y-4">
          {word.examples.map((example, index) => (
            <div key={index} className="bg-white/50 rounded-lg p-4">
              <div className="mb-2">
                <span className="text-sm text-muted-foreground">
                  Surah {example.surah}, Ayah {example.ayah}
                </span>
              </div>
              <div className="text-right mb-2">
                <p className="text-xl font-arabic leading-loose">{example.arabicText}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{example.translation}</p>
              </div>
              <div className="mt-3">
                <AudioPlayer
                  text={example.arabicText}
                  voice="Sarah"
                  label="Listen to verse"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {word.tags.map(tag => (
          <span 
            key={tag} 
            className="text-xs bg-gray-100 px-3 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default WordDetail;
