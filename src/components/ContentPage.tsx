
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import { toast } from 'sonner';

interface ContentPageData {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  page_type: string;
  created_at: string;
  updated_at: string;
}

const ContentPage: React.FC = () => {
  const location = useLocation();
  const [page, setPage] = useState<ContentPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract slug from pathname (remove leading slash)
    const slug = location.pathname.replace('/', '');
    if (slug) {
      fetchPage(slug);
    }
  }, [location.pathname]);

  const fetchPage = async (pageSlug: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .eq('slug', pageSlug)
        .eq('is_published', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Page not found
          setPage(null);
        } else {
          throw error;
        }
        return;
      }

      setPage(data);
    } catch (error) {
      console.error('Error fetching page:', error);
      toast.error('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Page Not Found</h1>
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={page.seo_title || page.title}
        description={page.seo_description || page.excerpt || `${page.title} - Arabic Vocabulary Learning Platform`}
        keywords={page.seo_keywords || ['Arabic', 'vocabulary', 'learning']}
      />
      
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{page.title}</CardTitle>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: page.content.replace(/\n/g, '<br>') }}
              className="text-gray-700 leading-relaxed"
            />
            
            {page.page_type === 'legal' && (
              <div className="mt-8 pt-4 border-t text-sm text-muted-foreground">
                <p>
                  Last updated: {new Date(page.updated_at).toLocaleDateString()}
                </p>
                <p className="mt-2">
                  If you have any questions about this {page.title.toLowerCase()}, 
                  please contact us at support@arabicvocabulary.com
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ContentPage;
