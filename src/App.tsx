
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/components/AuthProvider';
import Layout from '@/components/Layout';
import ScrollToTop from '@/components/ScrollToTop';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Collections from '@/pages/Collections';
import CollectionDetails from '@/pages/CollectionDetails';
import Practice from '@/pages/Practice';
import Quiz from '@/pages/Quiz';
import EnhancedQuiz from '@/pages/EnhancedQuiz';
import WordView from '@/pages/WordView';
import Admin from '@/pages/Admin';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';
import Notebook from '@/pages/Notebook';
import CustomLearning from '@/pages/CustomLearning';
import Community from '@/pages/Community';
import AudioPractice from '@/pages/AudioPractice';
import CommunityHub from '@/pages/CommunityHub';
import Blog from '@/pages/Blog';
import BlogCategory from '@/pages/BlogCategory';
import BlogTag from '@/pages/BlogTag';
import BlogPost from '@/pages/BlogPost';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <ScrollToTop />
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="auth" element={<Auth />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="collections" element={<Collections />} />
                  <Route path="collections/:id" element={<CollectionDetails />} />
                  <Route path="practice" element={<Practice />} />
                  <Route path="quiz" element={<Quiz />} />
                  <Route path="enhanced-quiz" element={<EnhancedQuiz />} />
                  <Route path="word/:id" element={<WordView />} />
                  <Route path="admin" element={<Admin />} />
                  <Route path="analytics" element={<Analytics />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="notebook" element={<Notebook />} />
                  <Route path="custom-learning" element={<CustomLearning />} />
                  <Route path="community" element={<Community />} />
                  <Route path="community-hub" element={<CommunityHub />} />
                  <Route path="audio-practice" element={<AudioPractice />} />
                  <Route path="blog" element={<Blog />} />
                  <Route path="blog/category/:category" element={<BlogCategory />} />
                  <Route path="blog/tag/:tag" element={<BlogTag />} />
                  <Route path="blog/:slug" element={<BlogPost />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
              <Toaster />
            </div>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
