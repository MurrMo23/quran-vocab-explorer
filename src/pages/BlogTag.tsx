
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import BlogCard from '@/components/blog/BlogCard';
import BlogSidebar from '@/components/blog/BlogSidebar';
import { ChevronLeft, Tag, AlertTriangle } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { Skeleton } from '@/components/ui/skeleton';

const BlogTag = () => {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const decodedTag = tag ? decodeURIComponent(tag) : '';
  
  // We need to get all posts and filter on the client side because
  // Supabase doesn't have a built-in way to filter by array elements
  const { posts: allPosts, loading } = useBlogPosts();
  
  const filteredPosts = allPosts.filter(post => 
    post.tags?.includes(decodedTag)
  );

  if (!tag) {
    navigate('/blog');
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{`Posts tagged with "${decodedTag}" | Blog`}</title>
        <meta 
          name="description" 
          content={`Browse all articles tagged with ${decodedTag}.`} 
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
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Tag className="h-6 w-6 mr-2" />
                {decodedTag}
              </h1>
              <p className="text-muted-foreground">
                Browse all articles tagged with "{decodedTag}".
              </p>
            </header>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
                <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2">No Posts Found</h2>
                <p className="text-muted-foreground">
                  No posts with the tag "{decodedTag}" were found.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPosts.map(post => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </div>
          <aside className="w-full md:w-1/4">
            <BlogSidebar />
          </aside>
        </div>
      </div>
    </>
  );
};

export default BlogTag;
