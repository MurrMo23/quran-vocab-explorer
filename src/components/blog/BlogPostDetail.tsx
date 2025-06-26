
import React from 'react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, User, Tag, Folder, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

interface BlogPostDetailProps {
  slug: string;
}

const BlogPostDetail = ({ slug }: BlogPostDetailProps) => {
  const { post, loading, error } = useBlogPosts(slug);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-64 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <Card className="p-6 text-center">
        <div className="flex flex-col items-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Post Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The blog post you're looking for doesn't exist or is no longer available.
          </p>
          <Link 
            to="/blog" 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Back to Blog
          </Link>
        </div>
      </Card>
    );
  }

  const formattedDate = post.published_at 
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date(post.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  return (
    <>
      <Helmet>
        <title>{post.seo_title || post.title}</title>
        <meta name="description" content={post.seo_description || post.excerpt || post.content.substring(0, 160)} />
        <meta property="og:title" content={post.seo_title || post.title} />
        <meta property="og:description" content={post.seo_description || post.excerpt || post.content.substring(0, 160)} />
        {post.featured_image && <meta property="og:image" content={post.featured_image} />}
        <meta property="og:type" content="article" />
        <meta property="og:article:published_time" content={post.published_at || post.created_at} />
        <meta property="og:article:modified_time" content={post.updated_at} />
        {post.tags?.map(tag => (
          <meta key={tag} property="og:article:tag" content={tag} />
        ))}
      </Helmet>

      <article className="space-y-6">
        <header className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{post.title}</h1>
          
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {formattedDate}
            </div>
            {post.author_name && (
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {post.author_name}
              </div>
            )}
          </div>

          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.categories.map(category => (
                <Link to={`/blog/category/${category.slug}`} key={category.id}>
                  <Badge className="flex items-center bg-primary/10 text-primary hover:bg-primary/20">
                    <Folder className="h-3 w-3 mr-1" />
                    {category.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </header>

        {post.featured_image && (
          <div className="relative h-64 md:h-96 overflow-hidden rounded-lg">
            <img 
              src={post.featured_image} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none">
          {/* Render the post content - in a real app you might want to use a markdown renderer */}
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {post.tags && post.tags.length > 0 && (
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="font-medium">Tags:</span>
                {post.tags.map((tag, index) => (
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
      </article>
    </>
  );
};

export default BlogPostDetail;
