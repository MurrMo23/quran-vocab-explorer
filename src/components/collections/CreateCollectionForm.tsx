import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import type { Collection } from '@/utils/vocabulary-types';
import {
  COLLECTION_DESCRIPTION_MAX,
  COLLECTION_NAME_MAX,
  createCollection,
  type UserCollection,
} from '@/lib/collections';

interface CreateCollectionFormProps {
  /** Called with the saved collection (persisted to the account, or this browser for guests). */
  onCreated?: (collection: UserCollection) => void;
  /**
   * @deprecated Legacy callback kept so existing callers compile. Receives the saved
   * collection in the old shape; the collection is already persisted by this form.
   */
  onCreateCollection?: (collection: Collection) => void;
  onCancel?: () => void;
  /** Render without the surrounding card (e.g. inside a dialog). */
  bare?: boolean;
}

const CreateCollectionForm: React.FC<CreateCollectionFormProps> = ({
  onCreated,
  onCreateCollection,
  onCancel,
  bare,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a collection name');
      return;
    }
    setSaving(true);
    try {
      const saved = await createCollection({ name, description });
      toast.success(`Created "${saved.name}"`);
      setName('');
      setDescription('');
      onCreated?.(saved);
      onCreateCollection?.({ id: saved.id, name: saved.name, description: saved.description });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not create the collection');
    } finally {
      setSaving(false);
    }
  };

  const form = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="collection-name">Name</Label>
        <Input
          id="collection-name"
          placeholder="e.g. Words from Surah Al-Mulk"
          value={name}
          maxLength={COLLECTION_NAME_MAX}
          onChange={(e) => setName(e.target.value)}
          disabled={saving}
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="collection-description">Description (optional)</Label>
        <Textarea
          id="collection-description"
          placeholder="What is this collection for?"
          value={description}
          maxLength={COLLECTION_DESCRIPTION_MAX}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          disabled={saving}
        />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={saving || !name.trim()}>
          {saving ? 'Creating…' : 'Create collection'}
        </Button>
      </div>
    </form>
  );

  if (bare) return form;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>New collection</CardTitle>
      </CardHeader>
      <CardContent>{form}</CardContent>
    </Card>
  );
};

export default CreateCollectionForm;
