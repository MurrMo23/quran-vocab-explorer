import React, { Suspense, lazy } from 'react';

// The note form (and the Radix Select it uses) only appears after a click, so word pages load it
// on demand instead of shipping it in the main bundle. Never rendered during hydration.
const NoteForm = lazy(() => import('./NoteForm'));

const LazyNoteForm: React.FC<React.ComponentProps<typeof NoteForm>> = (props) => (
  <Suspense fallback={<div className="h-32 rounded-lg bg-muted animate-pulse" aria-busy="true" />}>
    <NoteForm {...props} />
  </Suspense>
);

export default LazyNoteForm;
