import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/components/AuthProvider';
import Layout from '@/components/Layout';
import ScrollToTop from '@/components/ScrollToTop';
import RedirectToReview from '@/components/review/RedirectToReview';
// The home page stays in the main bundle so the first paint does not wait for a chunk.
import Index from '@/pages/Index';
// Prerendered pages (scripts/prerender.mjs) are bundled eagerly: hydrating a lazy route lets an
// early state update (auth, site settings) discard the server HTML and flash a spinner.
import Collections from '@/pages/Collections';
import CollectionDetails from '@/pages/CollectionDetails';
import WordView from '@/pages/WordView';
import Roots from '@/pages/Roots';
import RootDetails from '@/pages/RootDetails';
import Surahs from '@/pages/Surahs';
import SurahVocabulary from '@/pages/SurahVocabulary';
import NamesOfAllah from '@/pages/NamesOfAllah';
import NameOfAllah from '@/pages/NameOfAllah';
import Ramadan from '@/pages/Ramadan';

// Every other route is code-split.
const Auth = lazy(() => import('@/pages/Auth'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));


const Review = lazy(() => import('@/pages/Review'));

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
                <Route path="review" element={page(<Review />)} />
                {/* The old learning modes are one Review session now; keep their links working. */}
                <Route path="practice" element={<RedirectToReview />} />
                <Route path="quiz" element={<RedirectToReview />} />
                <Route path="enhanced-quiz" element={<RedirectToReview />} />
                <Route path="mobile-flashcards" element={<RedirectToReview />} />
                <Route path="word/:id" element={page(<WordView />)} />
                <Route path="roots" element={page(<Roots />)} />
                <Route path="root/:root" element={page(<RootDetails />)} />
                <Route path="surahs" element={page(<Surahs />)} />
                <Route path="surah/:number" element={page(<SurahVocabulary />)} />
                <Route path="names-of-allah" element={page(<NamesOfAllah />)} />
                <Route path="names-of-allah/:slug" element={page(<NameOfAllah />)} />
                <Route path="ramadan" element={page(<Ramadan />)} />
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
