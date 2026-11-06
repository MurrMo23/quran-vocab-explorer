import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NOTE_MAX_LENGTH, NOTE_TYPES, NOTE_TYPE_LABELS, type NoteType } from '@/lib/notes';

interface NoteFormProps {
  initialType?: NoteType;
  initialContent?: string;
  submitLabel?: string;
  onSubmit: (value: { noteType: NoteType; content: string }) => Promise<void> | void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

const NoteForm: React.FC<NoteFormProps> = ({
  initialType = 'general',
  initialContent = '',
  submitLabel = 'Save note',
  onSubmit,
  onCancel,
  autoFocus,
}) => {
  const [noteType, setNoteType] = useState<NoteType>(initialType);
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || saving) return;
    setSaving(true);
    try {
      await onSubmit({ noteType, content });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={noteType} onValueChange={(v) => setNoteType(v as NoteType)}>
          <SelectTrigger className="sm:w-48" aria-label="Note type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NOTE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {NOTE_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a memory aid, your own example sentence, or anything that helps you remember this word"
        rows={3}
        maxLength={NOTE_MAX_LENGTH}
        autoFocus={autoFocus}
        aria-label="Note"
        disabled={saving}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" disabled={saving || !content.trim()}>
          {saving ? 'Saving…' : submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default NoteForm;
