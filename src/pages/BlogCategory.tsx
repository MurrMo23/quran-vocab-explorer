
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import BlogList from '@/components/blog/BlogList';
import BlogSidebar from '@/components/blog/BlogSidebar';
import { useBlogCategories } from '@/hooks/useBlogCategories';
import { ChevronLeft } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { Skeleton } from '@/components/ui/skeleton';

const BlogCategory = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { category, loading } = useBlogCategories(slug);

  if (!slug) {
    navigate('/blog');
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{category ? `${category.name} | Blog` : 'Category | Blog'}</title>
        <meta 
          name="description" 
          content={category?.description || `Browse articles in the ${slug} category.`} 
        />
      </Helmet>

      <div className="container mx-auto py-8">
        <div className="mb-6">
          <Link to="/blog" className="flex items-center text-primary hover:underline">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Blog
          </Link>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-3/4">
            <header className="mb-8">
              {loading ? (
                <Skeleton className="h-8 w-1/2 mb-2" />
              ) : (
                <h1 className="text-3xl font-bold mb-2">
                  {category ? category.name : 'Category not found'}
                </h1>
              )}
              
              {loading ? (
                <Skeleton className="h-4 w-3/4" />
              ) : (
                <p className="text-muted-foreground">
                  {category?.description || `Browse all articles in the ${slug} category.`}
                </p>
              )}
            </header>
            <BlogList categorySlug={slug} />
          </div>
          <aside className="w-full md:w-1/4">
            <BlogSidebar />
          </aside>
        </div>
      </div>
    </>
  );
};

export default BlogCategory;
