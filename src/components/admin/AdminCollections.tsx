
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, Save, Plus, Check, FileDown, FileUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { collections, getWordsByCollection } from '@/utils/vocabulary';
import { Collection } from '@/utils/vocabulary-types';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Define validation schema
const collectionSchema = z.object({
  name: z.string().min(3, { message: "Collection name must be at least 3 characters" }),
  description: z.string().optional(),
});

type CollectionFormValues = z.infer<typeof collectionSchema>;

interface AdminCollectionsProps {
  onAuditLog?: (action: string, entityType: string, entityId: string | null, details?: any) => Promise<void>;
}

const AdminCollections: React.FC<AdminCollectionsProps> = ({ onAuditLog }) => {
  const [allCollections, setAllCollections] = useState<Collection[]>(collections);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [bulkActionMode, setBulkActionMode] = useState(false);
  
  // Initialize form
  const form = useForm<CollectionFormValues>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: '',
      description: '',
    }
  });
  
  const handleEditCollection = async (collection: Collection) => {
    if (onAuditLog) {
      await onAuditLog('EDIT_START', 'collection', collection.id, { collectionId: collection.id });
    }
    
    setSelectedCollection(collection);
    form.reset({
      name: collection.name,
      description: collection.description || '',
    });
    setIsEditing(true);
  };
  
  const handleNewCollection = async () => {
    if (onAuditLog) {
      await onAuditLog('NEW_COLLECTION_START', 'collection', null);
    }
    
    setSelectedCollection(null);
    form.reset({
      name: '',
      description: '',
    });
    setIsEditing(true);
  };
  
  const handleDeleteCollection = async (collectionId: string) => {
    // In a real app, this would delete from your database
    if (onAuditLog) {
      await onAuditLog('DELETE', 'collection', collectionId);
    }
    
    toast.success('Collection deleted successfully (demo only)');
    setAllCollections(collections => collections.filter(c => c.id !== collectionId));
  };

  const handleBulkDelete = async () => {
    if (selectedCollections.length === 0) {
      toast.error('No collections selected');
      return;
    }

    // Generate a CSRF token for this operation
    const csrfToken = await generateCSRFToken();
    
    if (onAuditLog) {
      await onAuditLog('BULK_DELETE', 'collection', null, { 
        collectionIds: selectedCollections,
        csrfToken
      });
    }
    
    // In a real app, you would send the CSRF token with your request
    // Here we're just simulating the deletion
    setAllCollections(prevCollections => 
      prevCollections.filter(c => !selectedCollections.includes(c.id))
    );
    
    toast.success(`${selectedCollections.length} collections deleted successfully (demo only)`);
    setSelectedCollections([]);
    setBulkActionMode(false);
  };
  
  const handleSaveCollection = async (data: CollectionFormValues) => {
    // Generate a CSRF token for this operation
    const csrfToken = await generateCSRFToken();
    
    // In a real app, you would send this token with your form submission
    if (onAuditLog) {
      await onAuditLog(
        selectedCollection ? 'UPDATE' : 'CREATE', 
        'collection', 
        selectedCollection?.id || null, 
        { 
          collectionData: data,
          csrfToken
        }
      );
    }
    
    toast.success(selectedCollection ? 'Collection updated successfully (demo only)' : 'New collection created successfully (demo only)');
    setIsEditing(false);
    
    // Demo update UI
    if (selectedCollection) {
      setAllCollections(prev => 
        prev.map(c => c.id === selectedCollection.id ? {...c, ...data} : c)
      );
    } else if (data.name) {
      const newId = Date.now().toString();
      setAllCollections(prev => [...prev, {
        id: newId,
        name: data.name,
        description: data.description || ''
      }]);
    }
  };

  const toggleCollectionSelection = (collectionId: string) => {
    setSelectedCollections(prev => {
      if (prev.includes(collectionId)) {
        return prev.filter(id => id !== collectionId);
      } else {
        return [...prev, collectionId];
      }
    });
  };

  const toggleBulkActionMode = () => {
    setBulkActionMode(!bulkActionMode);
    if (bulkActionMode) {
      setSelectedCollections([]);
    }
  };

  const exportSelectedCollections = async () => {
    if (selectedCollections.length === 0) {
      toast.error('No collections selected');
      return;
    }

    const csrfToken = await generateCSRFToken();
    
    if (onAuditLog) {
      await onAuditLog('EXPORT', 'collection', null, { 
        collectionIds: selectedCollections,
        csrfToken
      });
    }
    
    // In a real app, this would generate a file for download
    const collectionsToExport = allCollections.filter(c => 
      selectedCollections.includes(c.id)
    );
    
    const dataStr = JSON.stringify(collectionsToExport, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportFileDefaultName = 'collections.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success(`${selectedCollections.length} collections exported successfully`);
  };

  // For demo purposes - in a real app this would be handled by your backend
  const generateCSRFToken = async (): Promise<string> => {
    // This is a simplified example - in a real app, you would request a token from your server
    return `csrf-${Math.random().toString(36).substring(2, 15)}`;
  };

  // Schedule backup simulation for demo purposes
  React.useEffect(() => {
    const simulateBackup = async () => {
      // In a real app, this would be handled by a server-side cron job
      console.log('Simulating automated backup...');
      
      // Generate a demonstration backup record
      const backupTime = new Date().toISOString();
      const backupId = `backup-${Date.now()}`;
      
      if (onAuditLog) {
        await onAuditLog('AUTOMATED_BACKUP', 'system', backupId, {
          timestamp: backupTime,
          collections: allCollections.length,
          status: 'completed'
        });
      }
      
      console.log(`Backup ${backupId} completed at ${backupTime}`);
    };
    
    // Schedule a simulated backup every 30 minutes
    const backupInterval = setInterval(simulateBackup, 30 * 60 * 1000);
    
    // Run once at component mount for demonstration
    simulateBackup();
    
    return () => clearInterval(backupInterval);
  }, [onAuditLog]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Collections</h2>
        <div className="flex gap-2">
          <Button onClick={toggleBulkActionMode} className={bulkActionMode ? "bg-amber-500 hover:bg-amber-600" : ""}>
            {bulkActionMode ? "Exit Bulk Mode" : "Bulk Actions"}
          </Button>
          {bulkActionMode && (
            <>
              <Button onClick={handleBulkDelete} variant="destructive" disabled={selectedCollections.length === 0}>
                Delete Selected
              </Button>
              <Button onClick={exportSelectedCollections} variant="outline" disabled={selectedCollections.length === 0} className="gap-2">
                <FileDown className="h-4 w-4" />
                Export
              </Button>
            </>
          )}
          {!bulkActionMode && !isEditing && (
            <Button onClick={handleNewCollection} className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Collection
            </Button>
          )}
        </div>
      </div>
      
      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>{selectedCollection ? 'Edit Collection' : 'Add New Collection'}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSaveCollection)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collection Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)} type="button">
                    Cancel
                  </Button>
                  <Button className="gap-2" type="submit">
                    <Save className="h-4 w-4" />
                    Save Collection
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : bulkActionMode ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Select</TableHead>
              <TableHead>Collection</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Word Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allCollections.map((collection) => {
              const wordCount = getWordsByCollection(collection.id).length;
              const isSelected = selectedCollections.includes(collection.id);
              
              return (
                <TableRow key={collection.id} className={isSelected ? "bg-primary/10" : ""}>
                  <TableCell>
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => toggleCollectionSelection(collection.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{collection.name}</div>
                  </TableCell>
                  <TableCell>{collection.description}</TableCell>
                  <TableCell>{wordCount}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allCollections.map((collection) => {
            const wordCount = getWordsByCollection(collection.id).length;
            
            return (
              <Card key={collection.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{collection.name}</h3>
                      <p className="text-muted-foreground text-sm mb-2">{collection.description}</p>
                      <div className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full inline-block">
                        {wordCount} words
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditCollection(collection)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCollection(collection.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminCollections;
