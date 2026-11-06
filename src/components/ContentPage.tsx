
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import SEO from '@/components/SEO';
import ContentPageNavigation from '@/components/ContentPageNavigation';
import ContactForm from '@/components/ContactForm';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

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

// Content is stored as HTML in the DB. Older rows were plain text with line breaks,
// so only convert newlines to <br> when the content contains no block-level HTML.
const renderContent = (content: string) =>
  /<(p|h[1-6]|ul|ol|li|div|section|table)[\s>]/i.test(content)
    ? content
    : content.replace(/\n/g, '<br>');

const ContentPage: React.FC = () => {
  const location = useLocation();
  const [page, setPage] = useState<ContentPageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract slug from pathname (remove leading slash)
    const slug = location.pathname.replace(/^\/+|\/+$/g, '');
    if (slug) {
      fetchPage(slug);
    } else {
      setPage(null);
      setLoading(false);
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
        .maybeSingle();

      if (error) throw error;

      // null => no published page with this slug; rendered as a noindex 404 below
      setPage(data);
    } catch (error) {
      console.error('Error fetching page:', error);
      setPage(null);
      toast.error('Failed to load page');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="animate-pulse">
                <div className="h-64 bg-muted rounded-lg"></div>
              </div>
            </div>
            <div className="lg:col-span-3">
              <Card className="shadow-lg">
                <CardContent className="p-8">
                  <div className="animate-pulse space-y-6">
                    <div className="h-10 bg-muted rounded w-1/2"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-5/6"></div>
                      <div className="h-4 bg-muted rounded w-4/6"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <>
      <Helmet>
        <title>Page not found | QuranVocab</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <ContentPageNavigation />
            </div>
            <div className="lg:col-span-3">
              <Card className="shadow-lg">
                <CardContent className="p-8 text-center">
                  <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
                  <p className="text-muted-foreground mb-6">
                    This page couldn't be loaded. It may not exist, or there may be a temporary connection problem.
                  </p>
                  <Button asChild>
                    <Link to="/">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Home
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  const currentSlug = location.pathname.replace(/^\/+|\/+$/g, '');
  const isContactPage = currentSlug === 'contact';

  return (
    <>
      <SEO
        title={page.seo_title || page.title}
        description={page.seo_description || page.excerpt || `${page.title} — QuranVocab`}
        keywords={page.seo_keywords || ['QuranVocab', 'Quranic Arabic', 'vocabulary']}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <nav className="flex items-center space-x-2 text-sm">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground font-medium">{page.title}</span>
            </nav>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <ContentPageNavigation currentSlug={currentSlug} />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <Card className="shadow-lg">
                <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-secondary/5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {page.title}
                    </CardTitle>
                  </div>
                  {page.excerpt && (
                    <p className="mt-2 text-lg text-muted-foreground">{page.excerpt}</p>
                  )}
                </CardHeader>
                
                <CardContent className="p-8">
                  {isContactPage ? (
                    <div className="space-y-8">
                      {/* Enhanced Contact Content */}
                      <div 
                        dangerouslySetInnerHTML={{ __html: renderContent(page.content) }}
                        className="prose prose-lg max-w-none text-foreground"
                      />
                      
                      <Separator className="my-8" />
                      
                      {/* Contact Form */}
                      <ContactForm />
                    </div>
                  ) : (
                    <div className="prose prose-lg max-w-none text-foreground">
                      <div 
                        dangerouslySetInnerHTML={{ __html: renderContent(page.content) }}
                        className="leading-relaxed"
                      />
                    </div>
                  )}
                  
                  {/* Internal Navigation Links */}
                  <div className="mt-12 pt-8 border-t">
                    <h3 className="text-lg font-semibold mb-4">Related Pages</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentSlug !== 'help' && (
                        <Button asChild variant="outline" className="justify-start h-auto p-4">
                          <Link to="/help" className="flex flex-col items-start space-y-1">
                            <span className="font-medium">Help & Support</span>
                            <span className="text-sm text-muted-foreground">Get help and find answers</span>
                          </Link>
                        </Button>
                      )}
                      {currentSlug !== 'about' && (
                        <Button asChild variant="outline" className="justify-start h-auto p-4">
                          <Link to="/about" className="flex flex-col items-start space-y-1">
                            <span className="font-medium">About QuranVocab</span>
                            <span className="text-sm text-muted-foreground">What it is and where the data comes from</span>
                          </Link>
                        </Button>
                      )}
                      {currentSlug !== 'contact' && (
                        <Button asChild variant="outline" className="justify-start h-auto p-4">
                          <Link to="/contact" className="flex flex-col items-start space-y-1">
                            <span className="font-medium">Contact Us</span>
                            <span className="text-sm text-muted-foreground">Get in touch with us</span>
                          </Link>
                        </Button>
                      )}
                      {!['privacy-policy', 'terms-of-service'].includes(currentSlug) && (
                        <Button asChild variant="outline" className="justify-start h-auto p-4">
                          <Link to="/privacy-policy" className="flex flex-col items-start space-y-1">
                            <span className="font-medium">Privacy Policy</span>
                            <span className="text-sm text-muted-foreground">What data we collect and why</span>
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>

                  {page.page_type === 'legal' && (
                    <div className="mt-8 pt-6 border-t bg-muted/30 -mx-8 px-8 pb-8">
                      <div className="text-sm text-muted-foreground space-y-2">
                        <p>
                          If you have any questions about this {page.title.toLowerCase()}, 
                          please <Link to="/contact" className="text-primary hover:underline">contact us</Link> using
                          the form on our contact page.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContentPage;
