
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
  }, []);

  // This is a non-visual component, so we don't render anything
  return null;
};

export default GoogleAdsScript;
