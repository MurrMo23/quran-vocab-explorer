
import React from 'react';
import { useBlogCategories } from '@/hooks/useBlogCategories';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Folder, Calendar, Tag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import BlogCard from './BlogCard';

const BlogSidebar = () => {
  const { categories, loading: categoriesLoading } = useBlogCategories();
  const { posts: recentPosts, loading: postsLoading } = useBlogPosts(undefined, undefined, 3);

  // Extract all tags from recent posts
  const allTags = recentPosts
    .flatMap(post => post.tags || [])
    .filter(Boolean);
  
  // Count occurrences of each tag and sort by frequency
  const tagCounts = allTags.reduce((acc, tag) => {
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const popularTags = Object.keys(tagCounts)
    .sort((a, b) => tagCounts[b] - tagCounts[a])
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {categoriesLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          ) : (
            <ul className="space-y-1">
              {categories.length === 0 ? (
                <li className="text-muted-foreground text-sm">No categories found</li>
              ) : (
                categories.map(category => (
                  <li key={category.id}>
                    <Link 
                      to={`/blog/category/${category.slug}`} 
                      className="flex items-center text-sm py-1 hover:text-primary"
                    >
                      <Folder className="h-4 w-4 mr-2" />
                      {category.name}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {postsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {recentPosts.map(post => (
                <BlogCard key={post.id} post={post} compact />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {popularTags.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Popular Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag, index) => (
                <Link to={`/blog/tag/${encodeURIComponent(tag)}`} key={index}>
                  <Badge variant="outline" className="hover:bg-primary/10">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BlogSidebar;
