import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface AdvancedGradingToggleProps {
  id: string;
  checked: boolean;
  onCheckedChange: (on: boolean) => void;
  className?: string;
}

/**
 * The opt-in "Advanced grading" switch (Again / Hard / Good / Easy instead of Yes / No). The whole
 * row is the label, so the tap target is well over 44px even though the switch itself is small.
 */
const AdvancedGradingToggle: React.FC<AdvancedGradingToggleProps> = ({ id, checked, onCheckedChange, className }) => (
  <div className={cn('flex min-h-11 items-start justify-between gap-4', className)}>
    <Label htmlFor={id} className="min-w-0 flex-1 cursor-pointer py-1">
      <span className="block font-bold">Advanced grading</span>
      <span className="mt-1 block text-xs font-normal leading-snug text-muted-foreground">
        Rate each word Again, Hard, Good or Easy instead of answering Yes or No. Off by default. Saved in this browser.
      </span>
    </Label>
    <Switch
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="mt-1"
      data-testid="advanced-grading-toggle"
    />
  </div>
);

export default AdvancedGradingToggle;
