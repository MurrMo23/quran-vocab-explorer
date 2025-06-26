
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Trash2, EyeIcon, Code, Settings, BarChart } from 'lucide-react';
import { AdConfig, AdConfigResponse } from '@/utils/ads-types';
import { supabase } from '@/integrations/supabase/client';
import AdPlaceholder from '@/components/ads/AdPlaceholder';
import { usePermissions } from '@/hooks/usePermissions';
import AdPerformance from './AdPerformance';
import { initializeDefaultAds, DEFAULT_AD_CONFIGS } from '@/utils/ads-utils';

interface AdminAdsProps {
  onAuditLog?: (action: string, entityType: string, entityId: string | null, details?: any) => Promise<void>;
}

const defaultAdConfig: AdConfig = {
  id: '',
  name: '',
  size: 'medium-rectangle',
  code: '',
  is_active: true,
  location: 'sidebar'
};

const AdminAds: React.FC<AdminAdsProps> = ({ onAuditLog }) => {
  const [ads, setAds] = useState<AdConfig[]>([]);
  const [newAd, setNewAd] = useState<AdConfig>({ ...defaultAdConfig, id: `ad-${Date.now()}` });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewAd, setPreviewAd] = useState<AdConfig | null>(null);
  const { hasRole } = usePermissions();
  
  useEffect(() => {
    const loadAds = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Initialize default ads if none exist
        await initializeDefaultAds();
        
        // First try to load from Supabase
        const { data, error } = await (supabase as any)
          .from('ad_configs')
          .select('*');
        
        if (error) {
          console.error('Error loading ad configurations:', error);
          // Fall back to localStorage
          loadFromLocalStorage();
          return;
        }
        
        // Convert the data to our AdConfig format
        const adConfigs: AdConfig[] = data.map((ad: AdConfigResponse) => ({
          id: ad.id,
          name: ad.name,
          size: ad.size,
          code: ad.code,
          is_active: ad.is_active,
          location: ad.location,
          created_at: ad.created_at,
          updated_at: ad.updated_at
        }));
        
        setAds(adConfigs);
        // Also save to localStorage as backup
        localStorage.setItem('googleAdsConfigs', JSON.stringify(adConfigs));
      } catch (err) {
        console.error('Error in loadAds:', err);
        setError('Failed to load ad configurations');
        // Fall back to localStorage
        loadFromLocalStorage();
      } finally {
        setLoading(false);
      }
    };
    
    const loadFromLocalStorage = () => {
      const savedAds = localStorage.getItem('googleAdsConfigs');
      if (savedAds) {
        try {
          const parsedAds = JSON.parse(savedAds);
          setAds(parsedAds);
        } catch (e) {
          console.error('Error parsing localStorage ads:', e);
          setError('Failed to parse saved ad configurations');
          setAds([]);
        }
      } else {
        // If no saved ads in localStorage, use default configs
        setAds(DEFAULT_AD_CONFIGS);
        localStorage.setItem('googleAdsConfigs', JSON.stringify(DEFAULT_AD_CONFIGS));
      }
    };
    
    loadAds();
  }, []);
  
  const handleSaveAd = async () => {
    if (!newAd.name || !newAd.code) {
      toast.error('Please fill out all required fields');
      return;
    }
    
    try {
      // First try to save to Supabase
      const { data, error } = await (supabase as any)
        .from('ad_configs')
        .insert({
          id: newAd.id,
          name: newAd.name,
          size: newAd.size,
          code: newAd.code,
          is_active: newAd.is_active,
          location: newAd.location
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error saving ad configuration to Supabase:', error);
        throw error;
      }
      
      // Convert to our AdConfig format
      const newAdConfig: AdConfig = {
        id: data.id,
        name: data.name,
        size: data.size,
        code: data.code,
        is_active: data.is_active,
        location: data.location,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      // Add the new ad to the list
      const updatedAds = [...ads, newAdConfig];
      setAds(updatedAds);
      
      // Also update localStorage as backup
      localStorage.setItem('googleAdsConfigs', JSON.stringify(updatedAds));
      
      // Reset the form
      setNewAd({ ...defaultAdConfig, id: `ad-${Date.now()}` });
      
      // Log the action
      if (onAuditLog) {
        await onAuditLog('CREATE', 'ad', data.id, { ad: data });
      }
      
      toast.success('Ad configuration saved');
    } catch (err) {
      console.error('Error in handleSaveAd:', err);
      
      // Fall back to localStorage only
      const newAdToSave = { ...newAd };
      const updatedAds = [...ads, newAdToSave];
      setAds(updatedAds);
      
      localStorage.setItem('googleAdsConfigs', JSON.stringify(updatedAds));
      setNewAd({ ...defaultAdConfig, id: `ad-${Date.now()}` });
      
      toast.success('Ad configuration saved to localStorage (database unavailable)');
    }
  };
  
  const handleToggleActive = async (id: string, currentIsActive: boolean) => {
    try {
      // First try to update in Supabase
      const { error } = await (supabase as any)
        .from('ad_configs')
        .update({ is_active: !currentIsActive })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating ad status in Supabase:', error);
        throw error;
      }
      
      // Update the ads list
      const updatedAds = ads.map(ad => 
        ad.id === id ? { ...ad, is_active: !currentIsActive } : ad
      );
      setAds(updatedAds);
      
      // Also update localStorage as backup
      localStorage.setItem('googleAdsConfigs', JSON.stringify(updatedAds));
      
      // Log the action
      if (onAuditLog) {
        await onAuditLog('UPDATE', 'ad', id, { status: !currentIsActive });
      }
      
      toast.success(`Ad ${!currentIsActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      console.error('Error in handleToggleActive:', err);
      
      // Fall back to localStorage only
      const updatedAds = ads.map(ad => 
        ad.id === id ? { ...ad, is_active: !currentIsActive } : ad
      );
      setAds(updatedAds);
      
      localStorage.setItem('googleAdsConfigs', JSON.stringify(updatedAds));
      
      toast.success(`Ad ${!currentIsActive ? 'activated' : 'deactivated'} (database unavailable)`);
    }
  };
  
  const handleDeleteAd = async (id: string) => {
    try {
      // First try to delete from Supabase
      const { error } = await (supabase as any)
        .from('ad_configs')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting ad from Supabase:', error);
        throw error;
      }
      
      // Update the ads list
      const updatedAds = ads.filter(ad => ad.id !== id);
      setAds(updatedAds);
      
      // Also update localStorage as backup
      localStorage.setItem('googleAdsConfigs', JSON.stringify(updatedAds));
      
      // Log the action
      if (onAuditLog) {
        await onAuditLog('DELETE', 'ad', id);
      }
      
      toast.success('Ad configuration deleted');
    } catch (err) {
      console.error('Error in handleDeleteAd:', err);
      
      // Fall back to localStorage only
      const updatedAds = ads.filter(ad => ad.id !== id);
      setAds(updatedAds);
      
      localStorage.setItem('googleAdsConfigs', JSON.stringify(updatedAds));
      
      toast.success('Ad configuration deleted (database unavailable)');
    }
  };
  
  const handlePreviewAd = (ad: AdConfig) => {
    setPreviewAd(ad);
  };
  
  const getAdSizeDisplay = (size: string) => {
    switch (size) {
      case 'banner': return 'Banner (468×60)';
      case 'leaderboard': return 'Leaderboard (728×90)';
      case 'large-rectangle': return 'Large Rectangle (336×280)';
      case 'medium-rectangle': return 'Medium Rectangle (300×250)';
      case 'wide-skyscraper': return 'Wide Skyscraper (160×600)';
      case 'mobile-banner': return 'Mobile Banner (320×50)';
      default: return size;
    }
  };

  const resetToDefaultAds = async () => {
    if (window.confirm('Are you sure you want to reset to default ad configurations? This will replace all your current ad settings.')) {
      try {
        // Delete all existing ads in Supabase
        const { error: deleteError } = await (supabase as any)
          .from('ad_configs')
          .delete()
          .neq('id', 'dummy'); // Delete all records
        
        if (deleteError) {
          console.error('Error deleting existing ads:', deleteError);
        }
        
        // Insert default ads
        const { error: insertError } = await (supabase as any)
          .from('ad_configs')
          .insert(DEFAULT_AD_CONFIGS);
        
        if (insertError) {
          console.error('Error inserting default ads:', insertError);
          throw insertError;
        }
        
        // Update local state
        setAds(DEFAULT_AD_CONFIGS);
        
        // Update localStorage
        localStorage.setItem('googleAdsConfigs', JSON.stringify(DEFAULT_AD_CONFIGS));
        
        // Log the action
        if (onAuditLog) {
          await onAuditLog('RESET', 'ad_configs', null, { reset_to_defaults: true });
        }
        
        toast.success('Ad configurations reset to defaults');
      } catch (err) {
        console.error('Error in resetToDefaultAds:', err);
        
        // Fall back to localStorage only
        setAds(DEFAULT_AD_CONFIGS);
        localStorage.setItem('googleAdsConfigs', JSON.stringify(DEFAULT_AD_CONFIGS));
        
        toast.success('Ad configurations reset to defaults (database unavailable)');
      }
    }
  };

  if (!hasRole('admin')) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You need administrator privileges to manage ads.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Google Ads Management</CardTitle>
          <CardDescription>
            Configure and manage Google Ads to display on your website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="ads-list">
            <TabsList className="mb-4">
              <TabsTrigger value="ads-list">
                <Settings className="h-4 w-4 mr-2" />
                Ad Configurations
              </TabsTrigger>
              <TabsTrigger value="add-new">
                <Plus className="h-4 w-4 mr-2" />
                Add New Ad
              </TabsTrigger>
              <TabsTrigger value="performance">
                <BarChart className="h-4 w-4 mr-2" />
                Performance
              </TabsTrigger>
              {previewAd && (
                <TabsTrigger value="preview">
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Preview
                </TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="ads-list">
              {loading ? (
                <div className="flex justify-center my-8">
                  <p>Loading ad configurations...</p>
                </div>
              ) : error ? (
                <div className="bg-destructive/10 p-4 rounded-md mb-4">
                  <p className="text-destructive">{error}</p>
                </div>
              ) : ads.length === 0 ? (
                <div className="text-center my-8">
                  <p className="text-muted-foreground mb-4">No ad configurations found.</p>
                  <Button onClick={() => document.getElementById('add-new-tab')?.click()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Ad
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex justify-end mb-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={resetToDefaultAds}
                    >
                      Reset to Defaults
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Active</TableHead>
                          <TableHead className="w-[180px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ads.map(ad => (
                          <TableRow key={ad.id}>
                            <TableCell>{ad.name}</TableCell>
                            <TableCell>{getAdSizeDisplay(ad.size)}</TableCell>
                            <TableCell>{ad.location}</TableCell>
                            <TableCell>
                              <Switch 
                                checked={ad.is_active} 
                                onCheckedChange={() => handleToggleActive(ad.id, ad.is_active)} 
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handlePreviewAd(ad)}
                                >
                                  <EyeIcon className="h-4 w-4 mr-1" />
                                  Preview
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDeleteAd(ad.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </TabsContent>
            
            <TabsContent value="add-new" id="add-new-tab">
              <Card>
                <CardHeader>
                  <CardTitle>Add New Ad Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ad-name">Ad Name</Label>
                        <Input 
                          id="ad-name"
                          placeholder="Header Banner" 
                          value={newAd.name}
                          onChange={(e) => setNewAd({...newAd, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ad-size">Ad Size</Label>
                        <Select 
                          value={newAd.size} 
                          onValueChange={(value) => setNewAd({...newAd, size: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Ad Size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="banner">Banner (468×60)</SelectItem>
                            <SelectItem value="leaderboard">Leaderboard (728×90)</SelectItem>
                            <SelectItem value="large-rectangle">Large Rectangle (336×280)</SelectItem>
                            <SelectItem value="medium-rectangle">Medium Rectangle (300×250)</SelectItem>
                            <SelectItem value="wide-skyscraper">Wide Skyscraper (160×600)</SelectItem>
                            <SelectItem value="mobile-banner">Mobile Banner (320×50)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ad-location">Ad Location</Label>
                      <Input 
                        id="ad-location"
                        placeholder="blog-top, sidebar, footer, etc." 
                        value={newAd.location}
                        onChange={(e) => setNewAd({...newAd, location: e.target.value})}
                      />
                      <p className="text-xs text-muted-foreground">
                        This ID will be used in AdPlaceholder components to identify where to display this ad.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="ad-code">Ad Code</Label>
                        <div className="flex items-center space-x-2">
                          <Code className="h-4 w-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Paste Google Ads code here</span>
                        </div>
                      </div>
                      <Textarea 
                        id="ad-code"
                        placeholder="<script>...</script>" 
                        rows={6}
                        value={newAd.code}
                        onChange={(e) => setNewAd({...newAd, code: e.target.value})}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="ad-active"
                        checked={newAd.is_active} 
                        onCheckedChange={(checked) => setNewAd({...newAd, is_active: checked})} 
                      />
                      <Label htmlFor="ad-active">Active</Label>
                    </div>
                    
                    <Button onClick={handleSaveAd}>Save Ad Configuration</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="performance">
              <AdPerformance ads={ads} />
            </TabsContent>
            
            {previewAd && (
              <TabsContent value="preview">
                <Card>
                  <CardHeader>
                    <CardTitle>Ad Preview: {previewAd.name}</CardTitle>
                    <CardDescription>
                      {getAdSizeDisplay(previewAd.size)} - Location: {previewAd.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center space-y-4">
                      <div className="border border-dashed border-gray-300 p-4 rounded-md">
                        <div dangerouslySetInnerHTML={{ __html: previewAd.code }} />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Placeholder as it would appear if no ad is loaded:
                        </p>
                        <AdPlaceholder 
                          adId={previewAd.id}
                          size={previewAd.size as any}
                          location={previewAd.location}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAds;
