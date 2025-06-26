
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BlogPost, BlogCategory } from '@/utils/blog-types';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthProvider';

export const useBlogPosts = (slug?: string, categorySlug?: string, limit?: number) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { session } = useAuth();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('blog_posts')
        .select(`
          *,
          blog_post_categories(
            blog_categories(*)
          )
        `);

      // If not authenticated or not admin/moderator, only show published posts
      if (!session?.user || !(await hasModeratorPermission())) {
        query = query.eq('published', true);
      }

      // Filter by slug if provided
      if (slug) {
        query = query.eq('slug', slug).single() as any;
      } 
      // Filter by category if provided
      else if (categorySlug) {
        query = query.eq('blog_post_categories.blog_categories.slug', categorySlug);
      }

      // Apply limit if provided
      if (limit && !slug) {
        query = query.limit(limit);
      }

      // Order by publish date or created date
      if (!slug) {
        query = query.order('published_at', { ascending: false, nullsFirst: false }) as any;
        query = query.order('created_at', { ascending: false }) as any;
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Process and format the data
      if (slug && data) {
        // Single post
        const processedPost = processPost(data as any);
        setPost(processedPost);
        setPosts([processedPost]);
      } else if (Array.isArray(data)) {
        // Multiple posts
        const processedPosts = data.map((post: any) => processPost(post));
        setPosts(processedPosts);
        setPost(null);
      }
    } catch (err: any) {
      console.error('Error fetching blog posts:', err);
      setError(err);
      toast.error(`Failed to load blog content: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [slug, categorySlug, limit, session]);

  // Process post to extract categories from the nested structure
  const processPost = (post: any): BlogPost => {
    const categories = post.blog_post_categories?.map((item: any) => item.blog_categories) || [];
    
    return {
      ...post,
      categories: categories.filter(Boolean),
      blog_post_categories: undefined // Remove the nested structure
    };
  };

  const hasModeratorPermission = async (): Promise<boolean> => {
    try {
      const { data } = await supabase.rpc('get_user_roles');
      return data?.some((role: any) => ['admin', 'moderator'].includes(role.role)) || false;
    } catch (err) {
      console.error('Error checking permissions:', err);
      return false;
    }
  };

  const createPost = async (postData: Partial<BlogPost>): Promise<string | null> => {
    try {
      if (!session?.user) {
        toast.error('You must be logged in to create a post');
        return null;
      }

      // Check if user has permission
      if (!(await hasModeratorPermission())) {
        toast.error('You do not have permission to create posts');
        return null;
      }

      // Generate slug if not provided
      const slug = postData.slug || postData.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';
      
      // Ensure required fields are present
      if (!postData.title || !postData.content) {
        toast.error('Title and content are required');
        return null;
      }
      
      // Create properly typed insertion data
      const insertData = {
        title: postData.title,
        content: postData.content,
        slug,
        author_id: session.user.id,
        published: postData.published || false,
        published_at: postData.published ? new Date().toISOString() : null,
        excerpt: postData.excerpt,
        featured_image: postData.featured_image,
        seo_title: postData.seo_title,
        seo_description: postData.seo_description,
        tags: postData.tags || []
      };

      const { data, error } = await supabase
        .from('blog_posts')
        .insert(insertData)
        .select('id')
        .single();

      if (error) throw error;
      
      toast.success('Post created successfully');
      // Refresh the posts list
      await fetchPosts();
      return data.id;
    } catch (err: any) {
      console.error('Error creating blog post:', err);
      toast.error(`Failed to create post: ${err.message}`);
      return null;
    }
  };

  const updatePost = async (id: string, postData: Partial<BlogPost>): Promise<boolean> => {
    try {
      if (!session?.user) {
        toast.error('You must be logged in to update a post');
        return false;
      }

      // If we're publishing for the first time, set published_at
      const updates: any = { ...postData };
      if (postData.published && !post?.published_at) {
        updates.published_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Post updated successfully');
      // Refresh the posts list
      await fetchPosts();
      return true;
    } catch (err: any) {
      console.error('Error updating blog post:', err);
      toast.error(`Failed to update post: ${err.message}`);
      return false;
    }
  };

  const deletePost = async (id: string): Promise<boolean> => {
    try {
      if (!session?.user) {
        toast.error('You must be logged in to delete a post');
        return false;
      }

      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Post deleted successfully');
      // Refresh the posts list
      await fetchPosts();
      return true;
    } catch (err: any) {
      console.error('Error deleting blog post:', err);
      toast.error(`Failed to delete post: ${err.message}`);
      return false;
    }
  };

  return {
    posts,
    post,
    loading,
    error,
    createPost,
    updatePost,
    deletePost,
    refetch: fetchPosts
  };
};
