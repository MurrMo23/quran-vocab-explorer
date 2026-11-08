import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import {
  DEFAULT_VOICE,
  PRONUNCIATION_VOICES,
  type PronunciationVoice,
  getPronunciationVoice,
  onPronunciationVoiceChange,
  setPronunciationVoice,
} from '@/utils/audio';

/**
 * Choose the AI voice for word pronunciations (saved in this browser). Starts on the default so
 * prerendered HTML matches hydration, then shows the stored choice.
 */
const VoicePicker: React.FC<{ className?: string; label?: string }> = ({ className, label = 'Voice' }) => {
  const [voice, setVoice] = useState<PronunciationVoice>(DEFAULT_VOICE);
  useEffect(() => {
    setVoice(getPronunciationVoice());
    return onPronunciationVoiceChange(setVoice);
  }, []);

  return (
    <div role="radiogroup" aria-label="Pronunciation voice" className={cn('inline-flex items-center gap-2 text-[13px]', className)}>
      {label && <span className="font-semibold text-muted-foreground">{label}</span>}
      <div className="inline-flex rounded-xl border border-border bg-card p-0.5">
        {PRONUNCIATION_VOICES.map((v) => (
          <button
            key={v.id}
            type="button"
            role="radio"
            aria-checked={voice === v.id}
            onClick={(e) => {
              e.stopPropagation();
              setPronunciationVoice(v.id);
            }}
            className={cn(
              'min-h-9 rounded-[10px] px-3 font-bold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              voice === v.id ? 'bg-secondary text-secondary-foreground' : 'text-foreground/70 hover:bg-muted',
            )}
          >
            {v.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VoicePicker;
