import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { ProgressProvider } from '@/lib/progress'
import './index.css'

const root = document.getElementById("root")!;
// ProgressProvider reads auth from supabase.auth directly, so it can sit outside AuthProvider
// (which lives inside App).
const app = (
  <BrowserRouter>
    <ProgressProvider>
      <App />
    </ProgressProvider>
  </BrowserRouter>
);

// Public pages are prerendered at build time (scripts/prerender.mjs): hydrate that markup so
// there is no flash. Everything else mounts normally.
if (root.dataset.prerendered === 'true') {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
