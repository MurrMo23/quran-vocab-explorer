
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdConfig, AdConfigResponse } from '@/utils/ads-types';
import { toast } from 'sonner';
import { initializeDefaultAds } from '@/utils/ads-utils';

const GoogleAdsScript = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAdsData = async () => {
      try {
        // Set up the global object to store ad data
        if (typeof window !== 'undefined') {
          window.googleAdsData = window.googleAdsData || {};
          
          // Initialize default ads if none exist
          await initializeDefaultAds();
          
          // Try to fetch from Supabase
          const { data, error } = await (supabase as any)
            .from('ad_configs')
            .select('*')
            .eq('is_active', true);
          
          if (error) {
            console.error('Error loading ad configurations:', error);
            // Fall back to localStorage if Supabase fails
            loadFromLocalStorage();
            return;
          }
          
          // If we successfully retrieved data from Supabase
          if (data && data.length > 0) {
            // Map the ad configurations to our global object
            data.forEach((ad: AdConfigResponse) => {
              window.googleAdsData![ad.id] = ad.code;
            });
            setIsLoading(false);
          } else {
            // If no data in Supabase, fall back to localStorage
            loadFromLocalStorage();
          }
        }
      } catch (error) {
        console.error('Error in GoogleAdsScript:', error);
        // Fall back to localStorage if anything fails
        loadFromLocalStorage();
      }
    };
    
    const loadFromLocalStorage = () => {
      // Load ad configurations from localStorage as fallback
      if (typeof window !== 'undefined') {
        const savedAds = localStorage.getItem('googleAdsConfigs');
        if (savedAds) {
          try {
            const configs = JSON.parse(savedAds);
            configs.forEach((ad: AdConfig) => {
              if (ad.is_active) {
                window.googleAdsData![ad.id] = ad.code;
              }
            });
          } catch (e) {
            console.error('Error parsing localStorage ads:', e);
          }
        }
        setIsLoading(false);
      }
    };

    loadAdsData();
    loadAdSenseScript();
  }, []);

  const loadAdSenseScript = () => {
    // Load and inject AdSense script from localStorage
    const savedScript = localStorage.getItem('adSenseScript');
    if (savedScript && savedScript.trim()) {
      updateDocumentAdSenseScript(savedScript);
    }
  };

  const updateDocumentAdSenseScript = (scriptContent: string) => {
    // Remove existing AdSense script if it exists
    const existingScript = document.querySelector('script[src*="googlesyndication.com/pagead/js/adsbygoogle.js"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Parse the new script and add it to the head
    if (scriptContent.trim()) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(scriptContent, 'text/html');
      const newScript = doc.querySelector('script');
      
      if (newScript) {
        const scriptElement = document.createElement('script');
        if (newScript.src) {
          scriptElement.src = newScript.src;
        }
        if (newScript.getAttribute('crossorigin')) {
          scriptElement.setAttribute('crossorigin', newScript.getAttribute('crossorigin') || '');
        }
        if (newScript.hasAttribute('async')) {
          scriptElement.async = true;
        }
        if (newScript.textContent) {
          scriptElement.textContent = newScript.textContent;
        }
        
        document.head.appendChild(scriptElement);
      }
    }
  };

  // This is a non-visual component, so we don't render anything
  return null;
};

export default GoogleAdsScript;
