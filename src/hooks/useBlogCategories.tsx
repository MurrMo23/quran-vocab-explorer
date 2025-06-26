import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BlogCategory } from '@/utils/blog-types';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthProvider';

export const useBlogCategories = (slug?: string) => {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [category, setCategory] = useState<BlogCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { session } = useAuth();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('blog_categories')
        .select('*')
        .order('name', { ascending: true });

      if (slug) {
        // Fetch single category by slug
        const { data, error: fetchError } = await query.eq('slug', slug).single();
        if (fetchError) throw fetchError;
        setCategory(data);
        setCategories([]);
      } else {
        // Fetch all categories
        const { data, error: fetchError } = await query;
        if (fetchError) throw fetchError;
        setCategories(data || []);
        setCategory(null);
      }
    } catch (err: any) {
      console.error('Error fetching blog categories:', err);
      setError(err);
      if (slug) {
        toast.error(`Failed to load category: ${err.message}`);
      } else {
        toast.error(`Failed to load categories: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [slug]);

  const hasModeratorPermission = async (): Promise<boolean> => {
    try {
      const { data } = await supabase.rpc('get_user_roles');
      return data?.some((role: any) => ['admin', 'moderator'].includes(role.role)) || false;
    } catch (err) {
      console.error('Error checking permissions:', err);
      return false;
    }
  };

  const createCategory = async (categoryData: Partial<BlogCategory>): Promise<string | null> => {
    try {
      if (!session?.user) {
        toast.error('You must be logged in to create a category');
        return null;
      }

      if (!(await hasModeratorPermission())) {
        toast.error('You do not have permission to create categories');
        return null;
      }

      if (!categoryData.name || !categoryData.slug) {
        toast.error('Name and slug are required');
        return null;
      }

      const { data, error } = await supabase
        .from('blog_categories')
        .insert({
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description
        })
        .select('id')
        .single();

      if (error) throw error;

      toast.success('Category created successfully');
      await fetchCategories();
      return data.id;
    } catch (err: any) {
      console.error('Error creating blog category:', err);
      toast.error(`Failed to create category: ${err.message}`);
      return null;
    }
  };

  const updateCategory = async (id: string, categoryData: Partial<BlogCategory>): Promise<boolean> => {
    try {
      if (!session?.user) {
        toast.error('You must be logged in to update a category');
        return false;
      }

      const { error } = await supabase
        .from('blog_categories')
        .update({
          name: categoryData.name,
          slug: categoryData.slug,
          description: categoryData.description
        })
        .eq('id', id);

      if (error) throw error;

      toast.success('Category updated successfully');
      await fetchCategories();
      return true;
    } catch (err: any) {
      console.error('Error updating blog category:', err);
      toast.error(`Failed to update category: ${err.message}`);
      return false;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      if (!session?.user) {
        toast.error('You must be logged in to delete a category');
        return false;
      }

      const { error } = await supabase
        .from('blog_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Category deleted successfully');
      await fetchCategories();
      return true;
    } catch (err: any) {
      console.error('Error deleting blog category:', err);
      toast.error(`Failed to delete category: ${err.message}`);
      return false;
    }
  };

  const assignCategoryToPost = async (postId: string, categoryId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('blog_post_categories')
        .insert({
          post_id: postId,
          category_id: categoryId
        });

      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error('Error assigning category to post:', err);
      toast.error(`Failed to assign category: ${err.message}`);
      return false;
    }
  };

  const removeCategoryFromPost = async (postId: string, categoryId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('blog_post_categories')
        .delete()
        .eq('post_id', postId)
        .eq('category_id', categoryId);

      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error('Error removing category from post:', err);
      toast.error(`Failed to remove category: ${err.message}`);
      return false;
    }
  };

  return {
    categories,
    category,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    assignCategoryToPost,
    removeCategoryFromPost,
    refetch: fetchCategories
  };
};
