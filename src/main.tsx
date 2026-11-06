import { createRoot } from 'react-dom/client'
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

// Standard React mounting
createRoot(root).render(app);
