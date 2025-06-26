
import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import Layout from "@/components/Layout";
import Index from "@/pages/Index";
import Collections from "@/pages/Collections";
import CollectionDetails from "@/pages/CollectionDetails";
import WordView from "@/pages/WordView";
import Quiz from "@/pages/Quiz";
import EnhancedQuiz from "@/pages/EnhancedQuiz";
import Practice from "@/pages/Practice";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Admin from "@/pages/Admin";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import BlogCategory from "@/pages/BlogCategory";
import BlogTag from "@/pages/BlogTag";
import Community from "@/pages/Community";
import CustomLearning from "@/pages/CustomLearning";
import Notebook from "@/pages/Notebook";
import NotFound from "@/pages/NotFound";
import ContentPage from "@/components/ContentPage";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/collections" element={<Collections />} />
                <Route path="/collections/:id" element={<CollectionDetails />} />
                <Route path="/word/:id" element={<WordView />} />
                <Route path="/quiz" element={<Quiz />} />
                <Route path="/enhanced-quiz" element={<EnhancedQuiz />} />
                <Route path="/practice" element={<Practice />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/blog/category/:category" element={<BlogCategory />} />
                <Route path="/blog/tag/:tag" element={<BlogTag />} />
                <Route path="/community" element={<Community />} />
                <Route path="/custom-learning" element={<CustomLearning />} />
                <Route path="/notebook" element={<Notebook />} />
                
                {/* Dynamic Content Pages */}
                <Route path="/privacy-policy" element={<ContentPage />} />
                <Route path="/terms-of-service" element={<ContentPage />} />
                <Route path="/about" element={<ContentPage />} />
                <Route path="/contact" element={<ContentPage />} />
                <Route path="/help" element={<ContentPage />} />
                
                {/* Catch all route for 404 */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
