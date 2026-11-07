import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { ProgressProvider } from '@/lib/progress'
import ErrorBoundary from '@/components/ErrorBoundary'
import { installErrorReporting } from '@/lib/error-reporting'
import './index.css'

installErrorReporting();

const root = document.getElementById("root")!;
// ProgressProvider reads auth from supabase.auth directly, so it can sit outside AuthProvider
// (which lives inside App). ErrorBoundary renders its children unchanged until something throws,
// so prerendered markup still hydrates as-is.
const app = (
  <ErrorBoundary>
    <BrowserRouter>
      <ProgressProvider>
        <App />
      </ProgressProvider>
    </BrowserRouter>
  </ErrorBoundary>
);

// Public pages are prerendered at build time (scripts/prerender.mjs): hydrate that markup so
// there is no flash. Everything else mounts normally.
if (root.dataset.prerendered === 'true') {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
