
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookText, ExternalLink, Search } from 'lucide-react';

interface QuranicReference {
  surah: number;
  ayah: number;
  surahName: string;
  arabicText: string;
  translation: string;
  context: string;
}

interface QuranicConnectionsProps {
  wordId: string;
  arabic: string;
  references?: QuranicReference[];
}

const QuranicConnections: React.FC<QuranicConnectionsProps> = ({
  wordId,
  arabic,
  references = []
}) => {
  // Mock Quranic references - in a real app, this would come from a database
  const mockReferences: QuranicReference[] = references.length > 0 ? references : [
    {
      surah: 2,
      ayah: 255,
      surahName: "Al-Baqarah",
      arabicText: `اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ`,
      translation: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep.",
      context: "Ayat al-Kursi - one of the most famous verses about Allah's attributes"
    },
    {
      surah: 1,
      ayah: 2,
      surahName: "Al-Fatihah",
      arabicText: `الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ`,
      translation: "[All] praise is [due] to Allah, Lord of the worlds.",
      context: "The opening chapter of the Quran, recited in every prayer"
    },
    {
      surah: 112,
      ayah: 1,
      surahName: "Al-Ikhlas",
      arabicText: `قُلْ هُوَ اللَّهُ أَحَدٌ`,
      translation: "Say, \"He is Allah, [who is] One,\"",
      context: "Surah Al-Ikhlas declares the absolute unity of Allah"
    }
  ];

  const handleViewVerse = (surah: number, ayah: number) => {
    // In a real app, this would navigate to a Quranic verse viewer
    console.log(`Viewing Surah ${surah}, Ayah ${ayah}`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookText className="h-5 w-5" />
            Quranic Occurrences
            <Badge variant="outline" className="ml-auto">
              {mockReferences.length} references
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockReferences.map((ref, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="default">
                    {ref.surah}:{ref.ayah}
                  </Badge>
                  <span className="font-medium text-sm">{ref.surahName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewVerse(ref.surah, ref.ayah)}
                  className="h-8 px-2"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="text-right font-arabic text-lg leading-relaxed">
                  {ref.arabicText}
                </div>
                <div className="text-sm text-muted-foreground italic">
                  {ref.translation}
                </div>
                <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                  <strong>Context:</strong> {ref.context}
                </div>
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Find More Occurrences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuranicConnections;
