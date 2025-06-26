
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import BlogPostDetail from '@/components/blog/BlogPostDetail';
import BlogSidebar from '@/components/blog/BlogSidebar';
import AdPlaceholder from '@/components/ads/AdPlaceholder';
import AdSidebar from '@/components/ads/AdSidebar';
import { ChevronLeft } from 'lucide-react';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  if (!slug) {
    navigate('/blog');
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link to="/blog" className="flex items-center text-primary hover:underline">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Blog
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-3/4">
          <AdPlaceholder 
            adId="blog-post-top" 
            size="leaderboard"
            className="mx-auto mb-6"
          />
          
          <BlogPostDetail slug={slug} />
          
          <div className="mt-8">
            <AdPlaceholder 
              adId="blog-post-bottom" 
              size="leaderboard"
              className="mx-auto"
            />
          </div>
        </div>
        <aside className="w-full md:w-1/4">
          <BlogSidebar />
          <AdSidebar className="mt-8" />
        </aside>
      </div>
    </div>
  );
};

export default BlogPost;
