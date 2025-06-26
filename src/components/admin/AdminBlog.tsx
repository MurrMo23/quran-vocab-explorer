import React, { useState } from 'react';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { useBlogCategories } from '@/hooks/useBlogCategories';
import { BlogPost, BlogCategory } from '@/utils/blog-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, FileText, Edit, Trash, MoreVertical, Search, Check, X, Folder, 
  Calendar, ArrowUpDown, RefreshCw, PlusCircle
} from 'lucide-react';
import BlogForm from './BlogForm';

interface AdminBlogProps {
  onAuditLog?: (action: string, entityType: string, entityId: string | null, details?: any) => Promise<void>;
}

const AdminBlog = ({ onAuditLog }: AdminBlogProps) => {
  const [activeTab, setActiveTab] = useState('posts');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'title' | 'created_at'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Category state
  const [createCategoryDialogOpen, setCreateCategoryDialogOpen] = useState(false);
  const [editCategoryDialogOpen, setEditCategoryDialogOpen] = useState(false);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');

  const { posts, loading: postsLoading, createPost, updatePost, deletePost, refetch: refetchPosts } = useBlogPosts();
  const { 
    categories, 
    loading: categoriesLoading, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    assignCategoryToPost,
    removeCategoryFromPost,
    refetch: refetchCategories
  } = useBlogCategories();

  // Filter and sort posts
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortField === 'title') {
      return sortDirection === 'asc'
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else {
      return sortDirection === 'asc'
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const toggleSort = (field: 'title' | 'created_at') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Post handlers
  const handleCreatePost = async (postData: Partial<BlogPost>, selectedCategoryIds: string[]) => {
    try {
      const postId = await createPost(postData);
      if (postId && selectedCategoryIds.length > 0) {
        // Assign categories
        for (const categoryId of selectedCategoryIds) {
          await assignCategoryToPost(postId, categoryId);
        }
      }

      if (postId && onAuditLog) {
        await onAuditLog('CREATE', 'blog_post', postId, { title: postData.title });
      }
      
      if (postId) {
        setCreateDialogOpen(false);
        await refetchPosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
  };

  const handleUpdatePost = async (postData: Partial<BlogPost>, selectedCategoryIds: string[]) => {
    if (!selectedPost) return;
    
    try {
      const success = await updatePost(selectedPost.id, postData);
      if (success) {
        // Get the current categories
        const currentCategoryIds = selectedPost.categories?.map(c => c.id) || [];
        
        // Categories to add
        const categoriesToAdd = selectedCategoryIds.filter(id => !currentCategoryIds.includes(id));
        
        // Categories to remove
        const categoriesToRemove = currentCategoryIds.filter(id => !selectedCategoryIds.includes(id));
        
        // Add new categories
        for (const categoryId of categoriesToAdd) {
          await assignCategoryToPost(selectedPost.id, categoryId);
        }
        
        // Remove categories that were unselected
        for (const categoryId of categoriesToRemove) {
          await removeCategoryFromPost(selectedPost.id, categoryId);
        }

        if (onAuditLog) {
          await onAuditLog('UPDATE', 'blog_post', selectedPost.id, { title: postData.title });
        }
        setEditDialogOpen(false);
        setSelectedPost(null);
        await refetchPosts();
      }
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    }
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;
    
    try {
      const success = await deletePost(selectedPost.id);
      if (success) {
        if (onAuditLog) {
          await onAuditLog('DELETE', 'blog_post', selectedPost.id, { title: selectedPost.title });
        }
        setDeleteDialogOpen(false);
        setSelectedPost(null);
        await refetchPosts();
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handlePublishToggle = async (post: BlogPost) => {
    try {
      const success = await updatePost(post.id, { 
        published: !post.published,
        published_at: !post.published ? new Date().toISOString() : null
      });
      
      if (success && onAuditLog) {
        await onAuditLog(
          post.published ? 'UNPUBLISH' : 'PUBLISH', 
          'blog_post', 
          post.id, 
          { title: post.title }
        );
      }
    } catch (error) {
      console.error('Error toggling publish status:', error);
      toast.error('Failed to update publish status');
    }
  };

  // Category handlers
  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const generatedSlug = categorySlug.trim() || categoryName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      const categoryId = await createCategory({
        name: categoryName.trim(),
        slug: generatedSlug,
        description: categoryDescription.trim() || undefined
      });

      if (categoryId) {
        if (onAuditLog) {
          await onAuditLog('CREATE', 'blog_category', categoryId, { name: categoryName });
        }
        setCategoryName('');
        setCategorySlug('');
        setCategoryDescription('');
        setCreateCategoryDialogOpen(false);
        await refetchCategories();
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory || !categoryName.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const success = await updateCategory(selectedCategory.id, {
        name: categoryName.trim(),
        slug: categorySlug.trim(),
        description: categoryDescription.trim() || undefined
      });

      if (success) {
        if (onAuditLog) {
          await onAuditLog('UPDATE', 'blog_category', selectedCategory.id, { name: categoryName });
        }
        setCategoryName('');
        setCategorySlug('');
        setCategoryDescription('');
        setEditCategoryDialogOpen(false);
        setSelectedCategory(null);
        await refetchCategories();
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    
    try {
      const success = await deleteCategory(selectedCategory.id);
      if (success) {
        if (onAuditLog) {
          await onAuditLog('DELETE', 'blog_category', selectedCategory.id, { name: selectedCategory.name });
        }
        setDeleteCategoryDialogOpen(false);
        setSelectedCategory(null);
        await refetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const openEditCategory = (category: BlogCategory) => {
    setSelectedCategory(category);
    setCategoryName(category.name);
    setCategorySlug(category.slug);
    setCategoryDescription(category.description || '');
    setEditCategoryDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Blog Management
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Create and manage blog posts and categories
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  refetchPosts();
                  refetchCategories();
                }}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                onClick={() => setCreateDialogOpen(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Blog Post
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Posts ({posts.length})
              </TabsTrigger>
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                Categories ({categories.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search posts..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button onClick={() => setCreateDialogOpen(true)} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  New Post
                </Button>
              </div>

              {postsLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4">
                      <Skeleton className="h-12 w-12 rounded-md" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              ) : sortedPosts.length === 0 ? (
                <div className="text-center p-8 border rounded-md">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">No Posts Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? `No posts match your search for "${searchQuery}"`
                      : "You haven't created any blog posts yet."}
                  </p>
                  <Button onClick={() => setCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Post
                  </Button>
                </div>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[350px]">
                          <Button 
                            variant="ghost" 
                            className="gap-1 p-0 font-medium" 
                            onClick={() => toggleSort('title')}
                          >
                            Title
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">Categories</TableHead>
                        <TableHead className="hidden md:table-cell">
                          <Button 
                            variant="ghost" 
                            className="gap-1 p-0 font-medium" 
                            onClick={() => toggleSort('created_at')}
                          >
                            Date
                            <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedPosts.map((post) => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium">{post.title}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={post.published}
                                onCheckedChange={() => handlePublishToggle(post)}
                              />
                              <span className={post.published ? "text-green-600" : "text-amber-600"}>
                                {post.published ? "Published" : "Draft"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {post.categories && post.categories.length > 0 ? (
                                post.categories.map((category) => (
                                  <Badge key={category.id} variant="outline" className="text-xs">
                                    {category.name}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-xs">None</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            <div className="flex items-center text-xs">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(post.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedPost(post);
                                    setEditDialogOpen(true);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedPost(post);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="cursor-pointer text-destructive"
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Blog Categories</h3>
                <Button onClick={() => setCreateCategoryDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Category
                </Button>
              </div>

              {categoriesLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center p-8 border rounded-md">
                  <Folder className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">No Categories Found</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't created any blog categories yet.
                  </p>
                  <Button onClick={() => setCreateCategoryDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Category
                  </Button>
                </div>
              ) : (
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">Slug</TableHead>
                        <TableHead className="hidden md:table-cell">Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((category) => (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">{category.name}</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">
                            {category.slug}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {category.description ? (
                              <span className="text-sm text-muted-foreground line-clamp-1">
                                {category.description}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">No description</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openEditCategory(category)}
                                  className="cursor-pointer"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedCategory(category);
                                    setDeleteCategoryDialogOpen(true);
                                  }}
                                  className="cursor-pointer text-destructive"
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Post Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Create New Blog Post
            </DialogTitle>
            <DialogDescription>
              Create a new blog post to share with your audience. Fill in the details below and publish when ready.
            </DialogDescription>
          </DialogHeader>
          <BlogForm 
            onSubmit={handleCreatePost}
            onCancel={() => setCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>
              Make changes to your blog post
            </DialogDescription>
          </DialogHeader>
          {selectedPost && (
            <BlogForm 
              post={selectedPost}
              onSubmit={handleUpdatePost}
              onCancel={() => {
                setEditDialogOpen(false);
                setSelectedPost(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Post Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Blog Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedPost?.title}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePost}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Category Dialog */}
      <Dialog open={createCategoryDialogOpen} onOpenChange={setCreateCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Add a new category for your blog posts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Category Name <span className="text-destructive">*</span>
              </label>
              <Input 
                value={categoryName} 
                onChange={(e) => setCategoryName(e.target.value)} 
                placeholder="e.g. Grammar Tips"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Slug (URL path)
              </label>
              <Input 
                value={categorySlug} 
                onChange={(e) => setCategorySlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} 
                placeholder="e.g. grammar-tips"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to generate automatically from the name
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Description
              </label>
              <Textarea 
                value={categoryDescription} 
                onChange={(e) => setCategoryDescription(e.target.value)} 
                placeholder="Optional description of this category"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setCategoryName('');
                  setCategorySlug('');
                  setCategoryDescription('');
                  setCreateCategoryDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateCategory}>
                <Check className="h-4 w-4 mr-2" />
                Create Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={editCategoryDialogOpen} onOpenChange={setEditCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the selected category
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Category Name <span className="text-destructive">*</span>
              </label>
              <Input 
                value={categoryName} 
                onChange={(e) => setCategoryName(e.target.value)} 
                placeholder="e.g. Grammar Tips"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Slug (URL path)
              </label>
              <Input 
                value={categorySlug} 
                onChange={(e) => setCategorySlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} 
                placeholder="e.g. grammar-tips"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                Description
              </label>
              <Textarea 
                value={categoryDescription} 
                onChange={(e) => setCategoryDescription(e.target.value)} 
                placeholder="Optional description of this category"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setCategoryName('');
                  setCategorySlug('');
                  setCategoryDescription('');
                  setEditCategoryDialogOpen(false);
                  setSelectedCategory(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateCategory}>
                <Check className="h-4 w-4 mr-2" />
                Update Category
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={deleteCategoryDialogOpen} onOpenChange={setDeleteCategoryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the category "{selectedCategory?.name}"?
              Posts will not be deleted, but they will no longer be associated with this category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBlog;
