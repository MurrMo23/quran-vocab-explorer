
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';

interface ContentPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  is_published: boolean;
  page_type: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  created_at: string;
  updated_at: string;
}

interface AdminContentProps {
  onAuditLog?: (action: string, entityType: string, entityId: string | null, details?: any) => Promise<void>;
}

const AdminContent: React.FC<AdminContentProps> = ({ onAuditLog }) => {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<ContentPage | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ContentPage>>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    is_published: true,
    page_type: 'static',
    seo_title: '',
    seo_description: '',
    seo_keywords: []
  });
  const { hasRole } = usePermissions();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error: any) {
      console.error('Error fetching pages:', error);
      toast.error('Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.title || !formData.content) {
        toast.error('Title and content are required');
        return;
      }

      // Generate slug if not provided
      const slug = formData.slug || formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

      // Handle seo_keywords properly with explicit typing
      const processedKeywords: string[] = (() => {
        if (!formData.seo_keywords) return [];
        if (Array.isArray(formData.seo_keywords)) return formData.seo_keywords;
        if (typeof formData.seo_keywords === 'string') {
          return formData.seo_keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
        }
        return [];
      })();

      const pageData = {
        title: formData.title,
        content: formData.content,
        slug,
        excerpt: formData.excerpt || '',
        is_published: formData.is_published ?? true,
        page_type: formData.page_type || 'static',
        seo_title: formData.seo_title || '',
        seo_description: formData.seo_description || '',
        seo_keywords: processedKeywords
      };

      if (selectedPage) {
        // Update existing page
        const { error } = await supabase
          .from('content_pages')
          .update(pageData)
          .eq('id', selectedPage.id);

        if (error) throw error;
        
        if (onAuditLog) {
          await onAuditLog('UPDATE', 'content_page', selectedPage.id, pageData);
        }
        
        toast.success('Page updated successfully');
      } else {
        // Create new page
        const { data, error } = await supabase
          .from('content_pages')
          .insert(pageData)
          .select()
          .single();

        if (error) throw error;
        
        if (onAuditLog) {
          await onAuditLog('CREATE', 'content_page', data.id, pageData);
        }
        
        toast.success('Page created successfully');
      }

      await fetchPages();
      setIsEditing(false);
      setSelectedPage(null);
      resetForm();
    } catch (error: any) {
      console.error('Error saving page:', error);
      toast.error('Failed to save page');
    }
  };

  const handleDelete = async (page: ContentPage) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;

    try {
      const { error } = await supabase
        .from('content_pages')
        .delete()
        .eq('id', page.id);

      if (error) throw error;
      
      if (onAuditLog) {
        await onAuditLog('DELETE', 'content_page', page.id);
      }
      
      toast.success('Page deleted successfully');
      await fetchPages();
    } catch (error: any) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page');
    }
  };

  const handleEdit = (page: ContentPage) => {
    setSelectedPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      excerpt: page.excerpt || '',
      is_published: page.is_published,
      page_type: page.page_type,
      seo_title: page.seo_title || '',
      seo_description: page.seo_description || '',
      seo_keywords: page.seo_keywords || []
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      is_published: true,
      page_type: 'static',
      seo_title: '',
      seo_description: '',
      seo_keywords: []
    });
    setSelectedPage(null);
  };

  const handleNewPage = () => {
    resetForm();
    setIsEditing(true);
  };

  const handleSeoKeywordsChange = (value: string) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0);
    setFormData(prev => ({ ...prev, seo_keywords: keywords }));
  };

  if (!hasRole('admin')) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You need administrator privileges to manage content.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Content Management</span>
            <Button onClick={handleNewPage}>
              <Plus className="h-4 w-4 mr-2" />
              New Page
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading pages...</div>
          ) : pages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pages found. Create your first page to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-1 rounded">
                        /{page.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{page.page_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={page.is_published ? "default" : "secondary"}>
                        {page.is_published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(page.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(page)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(page)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {isEditing && (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedPage ? 'Edit Page' : 'Create New Page'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Page title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="page-url-slug"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description of the page"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Page content (supports HTML)"
                  rows={10}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="page_type">Page Type</Label>
                  <Select
                    value={formData.page_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, page_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="static">Static Page</SelectItem>
                      <SelectItem value="landing">Landing Page</SelectItem>
                      <SelectItem value="help">Help Page</SelectItem>
                      <SelectItem value="legal">Legal Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                  />
                  <Label htmlFor="published">Published</Label>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold">SEO Settings</h4>
                <div className="space-y-2">
                  <Label htmlFor="seo_title">SEO Title</Label>
                  <Input
                    id="seo_title"
                    value={formData.seo_title || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_title: e.target.value }))}
                    placeholder="SEO optimized title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo_description">SEO Description</Label>
                  <Textarea
                    id="seo_description"
                    value={formData.seo_description || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, seo_description: e.target.value }))}
                    placeholder="SEO meta description"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo_keywords">SEO Keywords</Label>
                  <Input
                    id="seo_keywords"
                    value={Array.isArray(formData.seo_keywords) ? formData.seo_keywords.join(', ') : ''}
                    onChange={(e) => handleSeoKeywordsChange(e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  {selectedPage ? 'Update Page' : 'Create Page'}
                </Button>
                <Button variant="outline" onClick={() => {
                  setIsEditing(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminContent;
