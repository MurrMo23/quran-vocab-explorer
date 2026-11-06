import React from 'react';
import { Link } from 'react-router-dom';
import { Cloud, HardDrive, CloudOff } from 'lucide-react';
import { useProgress } from '@/lib/progress';
import { cn } from '@/lib/utils';

/** Tells the learner where their answers are being saved. */
const ProgressSaveNotice: React.FC<{ className?: string }> = ({ className }) => {
  const { isGuest, offlineFallback, loading, pendingSync } = useProgress();
  if (loading) return null;

  let icon = <Cloud className="h-4 w-4 shrink-0" aria-hidden />;
  let text: React.ReactNode = pendingSync > 0 ? 'Saving to your account…' : 'Saved to your account';

  if (isGuest) {
    icon = <HardDrive className="h-4 w-4 shrink-0" aria-hidden />;
    text = (
      <>
        Saved in this browser —{' '}
        <Link to="/auth" className="underline underline-offset-2 hover:text-foreground">
          sign in to keep it
        </Link>
      </>
    );
  } else if (offlineFallback) {
    icon = <CloudOff className="h-4 w-4 shrink-0" aria-hidden />;
    text = 'Account sync is unavailable right now — progress is saved in this browser';
  }

  return (
    <p className={cn('flex items-center justify-center gap-2 text-xs text-muted-foreground', className)} role="status">
      {icon}
      <span>{text}</span>
    </p>
  );
};

export default ProgressSaveNotice;
