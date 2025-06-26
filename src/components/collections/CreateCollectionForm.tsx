
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Collection } from '@/utils/vocabulary-types';
import { collections } from '@/utils/vocabulary';
import { Label } from '@/components/ui/label';

interface CreateCollectionFormProps {
  onCreateCollection: (collection: Collection) => void;
  onCancel: () => void;
}

const CreateCollectionForm: React.FC<CreateCollectionFormProps> = ({
  onCreateCollection,
  onCancel
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a collection name');
      return;
    }
    
    setLoading(true);
    
    // Check if collection with same name exists
    const existingCollection = collections.find(c => 
      c.name.toLowerCase() === name.trim().toLowerCase()
    );
    
    if (existingCollection) {
      toast.error('A collection with this name already exists');
      setLoading(false);
      return;
    }
    
    // Generate a unique ID
    const id = `custom-${Date.now()}`;
    
    // Create the new collection
    const newCollection: Collection = {
      id,
      name: name.trim(),
      description: description.trim()
    };
    
    // Add the collection
    onCreateCollection(newCollection);
    
    toast.success('Collection created successfully');
    setLoading(false);
    
    // Reset form
    setName('');
    setDescription('');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Collection</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Collection Name</Label>
            <Input
              id="name"
              placeholder="Enter collection name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter collection description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              disabled={loading}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              Create Collection
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateCollectionForm;
