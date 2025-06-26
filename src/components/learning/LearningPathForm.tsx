
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

interface LearningPathFormProps {
  onSave: (data: {
    name: string;
    description: string;
    difficulty: DifficultyLevel;
    isPublic: boolean;
  }) => void;
  disabled?: boolean;
}

const LearningPathForm: React.FC<LearningPathFormProps> = ({ onSave, disabled = false }) => {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
  const [isPublic, setIsPublic] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      description,
      difficulty,
      isPublic,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="glass-card p-6 rounded-xl mb-6">
      <h2 className="text-xl font-semibold mb-4">Learning Path Details</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="path-name">Path Name</Label>
          <Input
            id="path-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Quran Basics, Essential Vocabulary"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="path-description">Description</Label>
          <Textarea
            id="path-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this learning path focuses on"
            rows={3}
          />
        </div>
        
        <div>
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Select 
            value={difficulty} 
            onValueChange={(val) => setDifficulty(val as DifficultyLevel)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="public-path" 
            checked={isPublic}
            onCheckedChange={setIsPublic}
          />
          <Label htmlFor="public-path">Make this path public for others to use</Label>
        </div>
        
        <Button type="submit" className="w-full gap-2" disabled={disabled || !name}>
          <Save className="h-4 w-4" />
          Save Learning Path
        </Button>
      </div>
    </form>
  );
};

export default LearningPathForm;
