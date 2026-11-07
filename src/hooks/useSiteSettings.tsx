import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettings {
  favicon_url: string;
  logo_url: string;
  og_image_url: string;
  site_name: string;
  ads_enabled: string;
}

const DEFAULTS: SiteSettings = {
  favicon_url: '/favicon.ico',
  logo_url: '',
  og_image_url: '/og-image.png',
  site_name: 'QuranVocab',
  ads_enabled: 'false'
};

// The last fetched settings are kept so repeat visits show the logo right after hydration
// instead of waiting for the network. Applied in an effect, so prerendered markup still matches.
const CACHE_KEY = 'qv-site-settings';

const readCache = (): Partial<SiteSettings> | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeCache = (value: Partial<SiteSettings>) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode, quota): the settings still apply for this page view.
  }
};

// Run after the page has loaded and the main thread is idle: branding is not needed for first paint.
const whenIdle = (fn: () => void) => {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(fn, { timeout: 3000 });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(fn, 1500);
  return () => window.clearTimeout(id);
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value, file_url');

      if (error) throw error;

      const settingsMap = (data ?? []).reduce((acc, setting) => {
        // Prioritize file_url over setting_value, and ensure we get a valid string
        acc[setting.setting_key] = setting.file_url || setting.setting_value || '';
        return acc;
      }, {} as Record<string, string>);

      writeCache(settingsMap as Partial<SiteSettings>);
      setSettings({ ...DEFAULTS, ...settingsMap });
    } catch (error) {
      console.error('Error loading site settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = readCache();
    if (cached) setSettings({ ...DEFAULTS, ...cached });

    // No realtime subscription here: it opened a websocket on every public page. The admin
    // panel announces its own edits through the 'siteSettingsUpdated' event below.
    const cancel = whenIdle(() => { void loadSettings(); });

    const handleSettingsUpdate = (event: CustomEvent) => {
      setSettings(prev => {
        const next = { ...prev, ...event.detail };
        writeCache(next);
        return next;
      });
    };

    window.addEventListener('siteSettingsUpdated', handleSettingsUpdate as EventListener);

    return () => {
      cancel();
      window.removeEventListener('siteSettingsUpdated', handleSettingsUpdate as EventListener);
    };
  }, [loadSettings]);

  return { settings, loading, refetch: loadSettings };
};
