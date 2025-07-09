import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, Image, Globe, Smartphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';

interface SiteBrandingProps {
  onAuditLog?: (action: string, entityType: string, entityId: string | null, details?: any) => Promise<void>;
}

interface SiteSettings {
  favicon_url: string;
  logo_url: string;
  og_image_url: string;
  site_name: string;
}

const SiteBranding: React.FC<SiteBrandingProps> = ({ onAuditLog }) => {
  const [settings, setSettings] = useState<SiteSettings>({
    favicon_url: '/favicon.ico',
    logo_url: '',
    og_image_url: '/og-image.png',
    site_name: 'Quranic Vocabulary Learning'
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState<{[key: string]: boolean}>({});
  const { hasRole } = usePermissions();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value, file_url');

      if (error) throw error;

      const settingsMap = data?.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.file_url || setting.setting_value || '';
        return acc;
      }, {} as any) || {};

      setSettings(prev => ({ ...prev, ...settingsMap }));
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load site settings');
    }
  };

  const handleFileUpload = async (file: File, settingKey: string) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploading(prev => ({ ...prev, [settingKey]: true }));

    try {
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${settingKey}-${Date.now()}.${fileExt}`;
      const filePath = `site-branding/${fileName}`;

      console.log('Uploading file:', fileName, 'to path:', filePath);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);

      // Update settings in database
      const { error: updateError } = await supabase
        .from('site_settings')
        .upsert({
          setting_key: settingKey,
          file_url: publicUrl,
          setting_value: publicUrl
        }, {
          onConflict: 'setting_key'
        });

      if (updateError) {
        console.error('Database update error:', updateError);
        throw updateError;
      }

      // Update local state immediately
      setSettings(prev => ({ ...prev, [settingKey]: publicUrl }));

      // Force update the global site settings in localStorage for immediate frontend updates
      const currentSettings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
      const updatedSettings = { ...currentSettings, [settingKey]: publicUrl };
      localStorage.setItem('siteSettings', JSON.stringify(updatedSettings));

      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('siteSettingsUpdated', { 
        detail: { [settingKey]: publicUrl }
      }));

      // Log audit event
      if (onAuditLog) {
        await onAuditLog('UPDATE', 'site_settings', settingKey, { 
          action: 'file_upload',
          file_url: publicUrl,
          setting_key: settingKey
        });
      }

      toast.success(`${settingKey.replace('_', ' ')} updated successfully`);

      // Update favicon in DOM if it's a favicon upload
      if (settingKey === 'favicon_url') {
        updateFavicon(publicUrl);
      }

    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(`Failed to upload file: ${error.message || 'Unknown error'}`);
    } finally {
      setUploading(prev => ({ ...prev, [settingKey]: false }));
    }
  };

  const updateFavicon = (url: string) => {
    // Update favicon in the DOM
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = url;
  };

  const FileUploadCard = ({ 
    title, 
    description, 
    settingKey, 
    icon: Icon,
    currentUrl 
  }: {
    title: string;
    description: string;
    settingKey: string;
    icon: React.ElementType;
    currentUrl: string;
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentUrl && (
          <div className="border rounded-lg p-4 bg-muted/50">
            <Label className="text-sm font-medium">Current {title}:</Label>
            <div className="mt-2">
              <img 
                src={currentUrl} 
                alt={title}
                className="max-w-full h-auto max-h-32 rounded border"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <p className="text-xs text-muted-foreground mt-1 break-all">{currentUrl}</p>
            </div>
          </div>
        )}
        
        <div>
          <Label htmlFor={`${settingKey}-upload`} className="text-sm font-medium">
            Upload New {title}
          </Label>
          <div className="mt-2">
            <input
              id={`${settingKey}-upload`}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file, settingKey);
                }
              }}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById(`${settingKey}-upload`)?.click()}
              disabled={uploading[settingKey]}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploading[settingKey] ? 'Uploading...' : `Upload ${title}`}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!hasRole('admin')) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You need administrator privileges to access site branding settings.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Site Branding</h2>
        <p className="text-muted-foreground">
          Upload and manage your website's branding assets including favicon, logo, and social media images.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FileUploadCard
          title="Favicon"
          description="Small icon displayed in browser tabs (recommended: 32x32px PNG/ICO)"
          settingKey="favicon_url"
          icon={Globe}
          currentUrl={settings.favicon_url}
        />

        <FileUploadCard
          title="Logo"
          description="Main navigation logo (recommended: 200x50px PNG with transparent background)"
          settingKey="logo_url"
          icon={Image}
          currentUrl={settings.logo_url}
        />

        <FileUploadCard
          title="Social Media Image"
          description="Image for social media sharing (recommended: 1200x630px)"
          settingKey="og_image_url"
          icon={Smartphone}
          currentUrl={settings.og_image_url}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usage Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Favicon:</strong> Will be automatically updated in browser tabs after upload.</p>
            <p><strong>Logo:</strong> Will be displayed in the navigation bar across all pages.</p>
            <p><strong>Social Media Image:</strong> Used when sharing your site on social platforms.</p>
            <p><strong>File Requirements:</strong> Max 5MB, supported formats: JPEG, PNG, GIF, WebP</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteBranding;