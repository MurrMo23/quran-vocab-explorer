import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/components/AuthProvider';
import Layout from '@/components/Layout';
import ScrollToTop from '@/components/ScrollToTop';
// The home page stays in the main bundle so the first paint does not wait for a chunk.
import Index from '@/pages/Index';
// Prerendered pages (scripts/prerender.mjs) are bundled eagerly: hydrating a lazy route lets an
// early state update (auth, site settings) discard the server HTML and flash a spinner.
import Collections from '@/pages/Collections';
import CollectionDetails from '@/pages/CollectionDetails';
import WordView from '@/pages/WordView';

// Every other route is code-split.
const Auth = lazy(() => import('@/pages/Auth'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));


const Practice = lazy(() => import('@/pages/Practice'));
const Quiz = lazy(() => import('@/pages/Quiz'));
const EnhancedQuiz = lazy(() => import('@/pages/EnhancedQuiz'));

const Admin = lazy(() => import('@/pages/Admin'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Settings = lazy(() => import('@/pages/Settings'));
const Notebook = lazy(() => import('@/pages/Notebook'));
const CustomLearning = lazy(() => import('@/pages/CustomLearning'));
const AudioPractice = lazy(() => import('@/pages/AudioPractice'));
const Blog = lazy(() => import('@/pages/Blog'));
const BlogCategory = lazy(() => import('@/pages/BlogCategory'));
const BlogTag = lazy(() => import('@/pages/BlogTag'));
const BlogPost = lazy(() => import('@/pages/BlogPost'));
const MobileFlashcards = lazy(() => import('@/pages/MobileFlashcards'));
const ContentPage = lazy(() => import('@/components/ContentPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const RouteFallback = () => (
  <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
    <span className="sr-only">Loading…</span>
  </div>
);

const page = (el: React.ReactNode) => <Suspense fallback={<RouteFallback />}>{el}</Suspense>;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <ScrollToTop />
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="auth" element={page(<Auth />)} />
                <Route path="reset-password" element={page(<ResetPassword />)} />
                <Route path="dashboard" element={page(<Dashboard />)} />
                <Route path="collections" element={page(<Collections />)} />
                <Route path="collections/:id" element={page(<CollectionDetails />)} />
                <Route path="practice" element={page(<Practice />)} />
                <Route path="quiz" element={page(<Quiz />)} />
                <Route path="enhanced-quiz" element={page(<EnhancedQuiz />)} />
                <Route path="word/:id" element={page(<WordView />)} />
                <Route path="admin" element={page(<Admin />)} />
                <Route path="analytics" element={page(<Analytics />)} />
                <Route path="settings" element={page(<Settings />)} />
                <Route path="notebook" element={page(<Notebook />)} />
                <Route path="custom-learning" element={page(<CustomLearning />)} />
                {/* Community features were mock-only and had no moderation; removed. */}
                <Route path="community" element={<Navigate to="/" replace />} />
                <Route path="community-hub" element={<Navigate to="/" replace />} />
                <Route path="audio-practice" element={page(<AudioPractice />)} />
                <Route path="blog" element={page(<Blog />)} />
                <Route path="blog/category/:category" element={page(<BlogCategory />)} />
                <Route path="blog/tag/:tag" element={page(<BlogTag />)} />
                <Route path="blog/:slug" element={page(<BlogPost />)} />
                <Route path="mobile-flashcards" element={page(<MobileFlashcards />)} />
                <Route path="help" element={page(<ContentPage />)} />
                <Route path="about" element={page(<ContentPage />)} />
                <Route path="contact" element={page(<ContentPage />)} />
                <Route path="privacy-policy" element={page(<ContentPage />)} />
                <Route path="terms-of-service" element={page(<ContentPage />)} />
                <Route path="*" element={page(<NotFound />)} />
              </Route>
            </Routes>
            <Toaster />
          </div>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
