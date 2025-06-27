
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Settings, Save, Database, Mail, Shield, Globe, Palette, Bell } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface SystemConfig {
  site_name: string;
  site_description: string;
  site_url: string;
  contact_email: string;
  support_email: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  email_verification_required: boolean;
  max_users: number;
  session_timeout: number;
  default_theme: string;
  default_language: string;
  timezone: string;
  date_format: string;
  time_format: string;
  currency: string;
  pagination_size: number;
  upload_max_size: number;
  allowed_file_types: string[];
  backup_enabled: boolean;
  backup_frequency: string;
  analytics_enabled: boolean;
  error_reporting: boolean;
  debug_mode: boolean;
  cache_enabled: boolean;
  cdn_enabled: boolean;
  seo_enabled: boolean;
  social_login_enabled: boolean;
  two_factor_enabled: boolean;
  rate_limiting_enabled: boolean;
  notification_settings: {
    email_notifications: boolean;
    push_notifications: boolean;
    sms_notifications: boolean;
  };
}

interface SystemSettingsProps {
  onAuditLog?: (action: string, entityType: string, entityId: string | null, details?: any) => Promise<void>;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ onAuditLog }) => {
  const [config, setConfig] = useState<SystemConfig>({
    site_name: 'Arabic Learning Platform',
    site_description: 'Learn Arabic with interactive lessons and AI-powered features',
    site_url: 'https://your-domain.com',
    contact_email: 'contact@your-domain.com',
    support_email: 'support@your-domain.com',
    maintenance_mode: false,
    registration_enabled: true,
    email_verification_required: true,
    max_users: 10000,
    session_timeout: 3600,
    default_theme: 'light',
    default_language: 'en',
    timezone: 'UTC',
    date_format: 'MM/DD/YYYY',
    time_format: '12',
    currency: 'USD',
    pagination_size: 20,
    upload_max_size: 10,
    allowed_file_types: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'mp3', 'mp4'],
    backup_enabled: true,
    backup_frequency: 'daily',
    analytics_enabled: true,
    error_reporting: true,
    debug_mode: false,
    cache_enabled: true,
    cdn_enabled: false,
    seo_enabled: true,
    social_login_enabled: true,
    two_factor_enabled: false,
    rate_limiting_enabled: true,
    notification_settings: {
      email_notifications: true,
      push_notifications: false,
      sms_notifications: false
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const { hasRole } = usePermissions();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would load from a settings table
      const savedSettings = localStorage.getItem('systemSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setConfig(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would save to a database
      localStorage.setItem('systemSettings', JSON.stringify(config));
      
      if (onAuditLog) {
        await onAuditLog('UPDATE', 'system_settings', null, { settings: config });
      }
      
      toast.success('System settings saved successfully');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save system settings');
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (key: keyof SystemConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const updateNotificationSettings = (key: keyof SystemConfig['notification_settings'], value: boolean) => {
    setConfig(prev => ({
      ...prev,
      notification_settings: {
        ...prev.notification_settings,
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  if (!hasRole('admin')) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You need administrator privileges to access system settings.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Settings
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Configure system-wide settings and preferences
            </p>
            {hasChanges && (
              <Badge variant="secondary">Unsaved Changes</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Appearance
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Advanced
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">Site Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="site_name">Site Name</Label>
                    <Input
                      id="site_name"
                      value={config.site_name}
                      onChange={(e) => updateConfig('site_name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site_url">Site URL</Label>
                    <Input
                      id="site_url"
                      value={config.site_url}
                      onChange={(e) => updateConfig('site_url', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site_description">Site Description</Label>
                  <Textarea
                    id="site_description"
                    value={config.site_description}
                    onChange={(e) => updateConfig('site_description', e.target.value)}
                    rows={3}
                  />
                </div>
                
                <Separator />
                
                <h3 className="text-lg font-semibold">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">Contact Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={config.contact_email}
                      onChange={(e) => updateConfig('contact_email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support_email">Support Email</Label>
                    <Input
                      id="support_email"
                      type="email"
                      value={config.support_email}
                      onChange={(e) => updateConfig('support_email', e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                <h3 className="text-lg font-semibold">Localization</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="default_language">Default Language</Label>
                    <Select value={config.default_language} onValueChange={(value) => updateConfig('default_language', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={config.timezone} onValueChange={(value) => updateConfig('timezone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Asia/Dubai">Dubai</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={config.currency} onValueChange={(value) => updateConfig('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="AED">AED (د.إ)</SelectItem>
                        <SelectItem value="SAR">SAR (ر.س)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">User Registration</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="registration_enabled"
                      checked={config.registration_enabled}
                      onCheckedChange={(checked) => updateConfig('registration_enabled', checked)}
                    />
                    <Label htmlFor="registration_enabled">Enable User Registration</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="email_verification_required"
                      checked={config.email_verification_required}
                      onCheckedChange={(checked) => updateConfig('email_verification_required', checked)}
                    />
                    <Label htmlFor="email_verification_required">Require Email Verification</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_users">Maximum Users</Label>
                    <Input
                      id="max_users"
                      type="number"
                      value={config.max_users}
                      onChange={(e) => updateConfig('max_users', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <Separator />

                <h3 className="text-lg font-semibold">Security Features</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="two_factor_enabled"
                      checked={config.two_factor_enabled}
                      onCheckedChange={(checked) => updateConfig('two_factor_enabled', checked)}
                    />
                    <Label htmlFor="two_factor_enabled">Enable Two-Factor Authentication</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="rate_limiting_enabled"
                      checked={config.rate_limiting_enabled}
                      onCheckedChange={(checked) => updateConfig('rate_limiting_enabled', checked)}
                    />
                    <Label htmlFor="rate_limiting_enabled">Enable Rate Limiting</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="social_login_enabled"
                      checked={config.social_login_enabled}
                      onCheckedChange={(checked) => updateConfig('social_login_enabled', checked)}
                    />
                    <Label htmlFor="social_login_enabled">Enable Social Login</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">Theme Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="default_theme">Default Theme</Label>
                    <Select value={config.default_theme} onValueChange={(value) => updateConfig('default_theme', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pagination_size">Items Per Page</Label>
                    <Input
                      id="pagination_size"
                      type="number"
                      value={config.pagination_size}
                      onChange={(e) => updateConfig('pagination_size', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">Notification Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="email_notifications"
                      checked={config.notification_settings.email_notifications}
                      onCheckedChange={(checked) => updateNotificationSettings('email_notifications', checked)}
                    />
                    <Label htmlFor="email_notifications">Enable Email Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="push_notifications"
                      checked={config.notification_settings.push_notifications}
                      onCheckedChange={(checked) => updateNotificationSettings('push_notifications', checked)}
                    />
                    <Label htmlFor="push_notifications">Enable Push Notifications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sms_notifications"
                      checked={config.notification_settings.sms_notifications}
                      onCheckedChange={(checked) => updateNotificationSettings('sms_notifications', checked)}
                    />
                    <Label htmlFor="sms_notifications">Enable SMS Notifications</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">Performance Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cache_enabled"
                      checked={config.cache_enabled}
                      onCheckedChange={(checked) => updateConfig('cache_enabled', checked)}
                    />
                    <Label htmlFor="cache_enabled">Enable Caching</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cdn_enabled"
                      checked={config.cdn_enabled}
                      onCheckedChange={(checked) => updateConfig('cdn_enabled', checked)}
                    />
                    <Label htmlFor="cdn_enabled">Enable CDN</Label>
                  </div>
                </div>

                <Separator />

                <h3 className="text-lg font-semibold">File Upload Settings</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="upload_max_size">Maximum Upload Size (MB)</Label>
                    <Input
                      id="upload_max_size"
                      type="number"
                      value={config.upload_max_size}
                      onChange={(e) => updateConfig('upload_max_size', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <div className="grid gap-4">
                <h3 className="text-lg font-semibold">System Maintenance</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="maintenance_mode"
                      checked={config.maintenance_mode}
                      onCheckedChange={(checked) => updateConfig('maintenance_mode', checked)}
                    />
                    <Label htmlFor="maintenance_mode">Maintenance Mode</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="debug_mode"
                      checked={config.debug_mode}
                      onCheckedChange={(checked) => updateConfig('debug_mode', checked)}
                    />
                    <Label htmlFor="debug_mode">Debug Mode</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="error_reporting"
                      checked={config.error_reporting}
                      onCheckedChange={(checked) => updateConfig('error_reporting', checked)}
                    />
                    <Label htmlFor="error_reporting">Error Reporting</Label>
                  </div>
                </div>

                <Separator />

                <h3 className="text-lg font-semibold">Backup Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="backup_enabled"
                      checked={config.backup_enabled}
                      onCheckedChange={(checked) => updateConfig('backup_enabled', checked)}
                    />
                    <Label htmlFor="backup_enabled">Enable Automatic Backups</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backup_frequency">Backup Frequency</Label>
                    <Select value={config.backup_frequency} onValueChange={(value) => updateConfig('backup_frequency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end pt-6 border-t">
            <Button onClick={saveSettings} disabled={loading || !hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
