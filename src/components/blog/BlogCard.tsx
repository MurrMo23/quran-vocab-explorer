
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Tag, Folder } from 'lucide-react';
import { BlogPost } from '@/utils/blog-types';

interface BlogCardProps {
  post: BlogPost;
  compact?: boolean;
}

const BlogCard = ({ post, compact = false }: BlogCardProps) => {
  const formattedDate = post.published_at 
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <Card className={`overflow-hidden ${compact ? 'h-full' : ''}`}>
      {post.featured_image && !compact && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={post.featured_image} 
            alt={post.title} 
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className={`font-semibold ${compact ? 'text-lg' : 'text-xl'} tracking-tight line-clamp-2`}>
              {post.title}
            </h3>
            {formattedDate && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                {formattedDate}
              </div>
            )}
          </div>
          {!compact && post.categories && post.categories.length > 0 && (
            <Badge variant="outline" className="bg-primary/10 text-primary">
              <Folder className="h-3 w-3 mr-1" />
              {post.categories[0].name}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!compact && (
          <p className="text-muted-foreground text-sm line-clamp-3">
            {post.excerpt || post.content.substring(0, 150)}...
          </p>
        )}
        {compact && (
          <p className="text-muted-foreground text-xs line-clamp-2">
            {post.excerpt || post.content.substring(0, 80)}...
          </p>
        )}
      </CardContent>
      <CardFooter className={`flex justify-between items-center ${compact ? 'pt-0 pb-3 px-4' : ''}`}>
        <Link 
          to={`/blog/${post.slug}`} 
          className="text-primary hover:underline text-sm font-medium"
        >
          Read more
        </Link>
        {post.tags && post.tags.length > 0 && !compact && (
          <div className="flex flex-wrap gap-1 justify-end">
            {post.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {post.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{post.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default BlogCard;
