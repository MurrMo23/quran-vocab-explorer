
import { AdConfig } from './ads-types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Default ad configurations for the application
 */
export const DEFAULT_AD_CONFIGS: AdConfig[] = [
  {
    id: 'blog-top',
    name: 'Blog Top Banner',
    size: 'leaderboard',
    code: '<div class="ad-placeholder">Your ad code here</div>',
    is_active: true,
    location: 'blog-top'
  },
  {
    id: 'blog-bottom',
    name: 'Blog Bottom Banner',
    size: 'leaderboard',
    code: '<div class="ad-placeholder">Your ad code here</div>',
    is_active: true,
    location: 'blog-bottom'
  },
  {
    id: 'sidebar-top',
    name: 'Sidebar Top Ad',
    size: 'medium-rectangle',
    code: '<div class="ad-placeholder">Your ad code here</div>',
    is_active: true,
    location: 'sidebar'
  },
  {
    id: 'sidebar-bottom',
    name: 'Sidebar Bottom Ad',
    size: 'medium-rectangle',
    code: '<div class="ad-placeholder">Your ad code here</div>',
    is_active: true,
    location: 'sidebar'
  },
  {
    id: 'blog-post-top',
    name: 'Blog Post Top Banner',
    size: 'leaderboard',
    code: '<div class="ad-placeholder">Your ad code here</div>',
    is_active: true,
    location: 'blog-post'
  },
  {
    id: 'blog-post-bottom',
    name: 'Blog Post Bottom Banner',
    size: 'leaderboard',
    code: '<div class="ad-placeholder">Your ad code here</div>',
    is_active: true,
    location: 'blog-post'
  },
  {
    id: 'practice-top',
    name: 'Practice Page Top',
    size: 'leaderboard',
    code: '<div class="ad-placeholder">Your ad code here</div>',
    is_active: true,
    location: 'practice'
  },
  {
    id: 'collections-sidebar',
    name: 'Collections Sidebar',
    size: 'medium-rectangle',
    code: '<div class="ad-placeholder">Your ad code here</div>',
    is_active: true,
    location: 'collections'
  },
  {
    id: 'mobile-banner-top',
    name: 'Mobile Top Banner',
    size: 'mobile-banner',
    code: '<div class="ad-placeholder">Mobile ad here</div>',
    is_active: true,
    location: 'mobile-top'
  },
  {
    id: 'custom-learning-sidebar',
    name: 'Custom Learning Sidebar',
    size: 'medium-rectangle',
    code: '<div class="ad-placeholder">Your ad code here</div>',
    is_active: true,
    location: 'custom-learning'
  },
  {
    id: 'square-inline-responsive',
    name: 'Square Inline - Responsive',
    size: 'medium-rectangle',
    code: '<!-- Square Inline - All Pages --><ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-9516200521702404" data-ad-slot="4124075621" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script>',
    is_active: true,
    location: 'homepage-features'
  }
];

/**
 * Initialize default ad configurations if none exist
 */
export const initializeDefaultAds = async () => {
  try {
    // Check if we have any ad configurations
    const { data, error } = await (supabase as any)
      .from('ad_configs')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Error checking ad configs:', error);
      return;
    }
    
    // If no ads exist, add the default ones
    if (!data || data.length === 0) {
      const { error: insertError } = await (supabase as any)
        .from('ad_configs')
        .insert(DEFAULT_AD_CONFIGS);
      
      if (insertError) {
        console.error('Error inserting default ads:', insertError);
        // Fall back to localStorage
        localStorage.setItem('googleAdsConfigs', JSON.stringify(DEFAULT_AD_CONFIGS));
      } else {
        console.log('Default ad configurations created successfully');
      }
    }
  } catch (error) {
    console.error('Error in initializeDefaultAds:', error);
    // Fall back to localStorage
    localStorage.setItem('googleAdsConfigs', JSON.stringify(DEFAULT_AD_CONFIGS));
  }
};

// Ad tracking interfaces and functions
export interface AdImpression {
  adId: string;
  timestamp: number;
  location: string;
  userId?: string;
}

export interface AdClick {
  adId: string;
  timestamp: number;
  location: string;
  userId?: string;
}

// Store impressions in localStorage for now (would use a database in production)
export const trackAdImpression = (adId: string, location: string, userId?: string) => {
  try {
    const impression: AdImpression = {
      adId,
      timestamp: Date.now(),
      location,
      userId
    };
    
    // Get existing impressions
    const existingImpressions = JSON.parse(localStorage.getItem('adImpressions') || '[]');
    existingImpressions.push(impression);
    
    // Store updated impressions
    localStorage.setItem('adImpressions', JSON.stringify(existingImpressions));
    
    // Limit stored impressions to prevent localStorage from getting too large
    if (existingImpressions.length > 1000) {
      localStorage.setItem('adImpressions', 
        JSON.stringify(existingImpressions.slice(existingImpressions.length - 1000))
      );
    }
    
    return true;
  } catch (error) {
    console.error('Error tracking ad impression:', error);
    return false;
  }
};

export const trackAdClick = (adId: string, location: string, userId?: string) => {
  try {
    const click: AdClick = {
      adId,
      timestamp: Date.now(),
      location,
      userId
    };
    
    // Get existing clicks
    const existingClicks = JSON.parse(localStorage.getItem('adClicks') || '[]');
    existingClicks.push(click);
    
    // Store updated clicks
    localStorage.setItem('adClicks', JSON.stringify(existingClicks));
    
    // Limit stored clicks to prevent localStorage from getting too large
    if (existingClicks.length > 1000) {
      localStorage.setItem('adClicks', 
        JSON.stringify(existingClicks.slice(existingClicks.length - 1000))
      );
    }
    
    return true;
  } catch (error) {
    console.error('Error tracking ad click:', error);
    return false;
  }
};

// Ad rotation functions
export const getNextAdForPlacement = (location: string, adsForLocation: AdConfig[]): AdConfig | null => {
  if (!adsForLocation || adsForLocation.length === 0) return null;
  
  // Get the previously shown ad index from localStorage
  const rotationKey = `adRotation_${location}`;
  const prevIndex = parseInt(localStorage.getItem(rotationKey) || '0');
  
  // Calculate the next index
  const nextIndex = (prevIndex + 1) % adsForLocation.length;
  
  // Save the next index
  localStorage.setItem(rotationKey, nextIndex.toString());
  
  // Return the ad at the next index
  return adsForLocation[nextIndex];
};

// Ad frequency capping
export const shouldShowAdToUser = (adId: string, userId?: string): boolean => {
  try {
    // If no user ID, always show the ad
    if (!userId) return true;
    
    const cappingKey = `adFrequencyCap_${userId}_${adId}`;
    const lastShownTimestamp = parseInt(localStorage.getItem(cappingKey) || '0');
    const now = Date.now();
    
    // Check if enough time has passed (e.g., 10 minutes)
    const timeElapsed = now - lastShownTimestamp;
    const minTimeInterval = 10 * 60 * 1000; // 10 minutes in milliseconds
    
    if (timeElapsed < minTimeInterval) {
      return false;
    }
    
    // Update the last shown timestamp
    localStorage.setItem(cappingKey, now.toString());
    return true;
  } catch (error) {
    console.error('Error in frequency capping:', error);
    return true; // Default to showing the ad if there's an error
  }
};

// Ad blocker detection
export const detectAdBlocker = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Create a bait element that ad blockers typically block
    const bait = document.createElement('div');
    bait.className = 'ad-banner ad-placement adsbox';
    bait.style.position = 'absolute';
    bait.style.opacity = '0';
    bait.style.height = '1px';
    bait.style.width = '1px';
    document.body.appendChild(bait);
    
    // Check after a short delay if the bait was hidden or removed by an ad blocker
    setTimeout(() => {
      let adBlockerDetected = false;
      
      if (bait.offsetHeight === 0 || 
          bait.offsetWidth === 0 || 
          !document.body.contains(bait)) {
        adBlockerDetected = true;
      }
      
      // Clean up
      if (document.body.contains(bait)) {
        document.body.removeChild(bait);
      }
      
      resolve(adBlockerDetected);
    }, 100);
  });
};
