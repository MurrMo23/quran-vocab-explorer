
import React from 'react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import BlogCard from './BlogCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle } from 'lucide-react';

interface BlogListProps {
  categorySlug?: string;
  limit?: number;
}

const BlogList = ({ categorySlug, limit }: BlogListProps) => {
  const { posts, loading, error } = useBlogPosts(undefined, categorySlug, limit);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Blog Posts</h2>
        <p className="text-muted-foreground">
          There was a problem loading the blog posts. Please try again later.
        </p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
        <h2 className="text-xl font-semibold mb-2">No Posts Found</h2>
        <p className="text-muted-foreground">
          {categorySlug 
            ? "No posts are available in this category yet."
            : "No blog posts have been published yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default BlogList;
