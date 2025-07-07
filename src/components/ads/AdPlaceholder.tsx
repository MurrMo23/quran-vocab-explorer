
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';
import { 
  trackAdImpression, 
  trackAdClick, 
  shouldShowAdToUser, 
  getNextAdForPlacement 
} from '@/utils/ads-utils';
import { sanitizeAdContent } from '@/utils/security';

export type AdSize = 
  | 'banner' // 468x60
  | 'leaderboard' // 728x90
  | 'large-rectangle' // 336x280
  | 'medium-rectangle' // 300x250
  | 'wide-skyscraper' // 160x600
  | 'mobile-banner'; // 320x50

interface AdPlaceholderProps {
  adId: string;
  size: AdSize;
  className?: string;
  fallbackContent?: React.ReactNode;
  location?: string;
  lazyLoad?: boolean;
}

const getAdSizeDimensions = (size: AdSize): { width: number; height: number } => {
  switch (size) {
    case 'banner':
      return { width: 468, height: 60 };
    case 'leaderboard':
      return { width: 728, height: 90 };
    case 'large-rectangle':
      return { width: 336, height: 280 };
    case 'medium-rectangle':
      return { width: 300, height: 250 };
    case 'wide-skyscraper':
      return { width: 160, height: 600 };
    case 'mobile-banner':
      return { width: 320, height: 50 };
  }
};

const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ 
  adId, 
  size, 
  className,
  fallbackContent,
  location = 'unknown',
  lazyLoad = true
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  const dimensions = getAdSizeDimensions(size);
  const { session } = useAuth();
  const userId = session?.user?.id;
  const [adBlockerDetected, setAdBlockerDetected] = useState(false);
  const [isVisible, setIsVisible] = useState(!lazyLoad);
  const [adRendered, setAdRendered] = useState(false);
  
  // Check for ad blocker on component mount
  useEffect(() => {
    const checkForAdBlocker = async () => {
      try {
        const detected = await import('@/utils/ads-utils').then(module => 
          module.detectAdBlocker()
        );
        setAdBlockerDetected(detected);
      } catch (error) {
        console.error('Error detecting ad blocker:', error);
      }
    };
    
    checkForAdBlocker();
  }, []);
  
  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!lazyLoad || isVisible) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      });
    }, { rootMargin: '200px' }); // Load ads when they're 200px from viewport
    
    if (adRef.current) {
      observer.observe(adRef.current);
    }
    
    return () => observer.disconnect();
  }, [lazyLoad, isVisible]);
  
  // Load and render the ad when visible
  useEffect(() => {
    if (!isVisible || adRendered || adBlockerDetected) return;
    
    const renderAd = () => {
      const adContainer = adRef.current;
      
      if (adContainer && window.googleAdsData) {
        // Check frequency capping
        if (!shouldShowAdToUser(adId, userId)) {
          console.log(`Ad ${adId} skipped due to frequency capping for user ${userId}`);
          return;
        }
        
        // Clean up previous ad content if any
        while (adContainer.firstChild) {
          adContainer.removeChild(adContainer.firstChild);
        }
        
        // Get the ad code for this location or specific ad ID
        let adToShow = null;
        
        // Try to get specific ad first
        if (window.googleAdsData[adId]) {
          adToShow = { id: adId, code: window.googleAdsData[adId] };
        } else {
          // Fall back to any ad for this location
          const locationAds = Object.entries(window.googleAdsData)
            .filter(([id, code]) => id.includes(location))
            .map(([id, code]) => ({ 
              id, 
              code, 
              name: id,
              size: size,
              is_active: true,
              location: location
            }));
          
          if (locationAds.length > 0) {
            adToShow = getNextAdForPlacement(location, locationAds);
          }
        }
        
        // Insert the ad code
        if (adToShow && adToShow.code) {
          try {
            // SECURITY: Sanitize ad content to prevent XSS attacks
            const sanitizedAdCode = sanitizeAdContent(adToShow.code);
            
            // Track impression
            trackAdImpression(adToShow.id, location, userId);
            
            // Safely insert sanitized HTML
            adContainer.innerHTML = sanitizedAdCode;
            
            // Initialize Google AdSense if ads are present
            if (sanitizedAdCode.includes('adsbygoogle')) {
              // Ensure adsbygoogle is available
              if (typeof window !== 'undefined') {
                (window as any).adsbygoogle = (window as any).adsbygoogle || [];
                
                // Push ads to Google AdSense
                try {
                  const adsbyGoogleElements = adContainer.querySelectorAll('.adsbygoogle');
                  adsbyGoogleElements.forEach(() => {
                    (window as any).adsbygoogle.push({});
                  });
                } catch (adsError) {
                  console.log('AdSense initialization:', adsError);
                }
              }
            }
            
            // Add click tracking to the container
            adContainer.addEventListener('click', () => {
              trackAdClick(adToShow.id, location, userId);
            });
            
            setAdRendered(true);
          } catch (error) {
            console.error('Error inserting ad code:', error);
            // Show fallback content on error
            adContainer.innerHTML = '<div class="text-xs text-gray-400 text-center p-2">Ad could not be loaded</div>';
          }
        }
      }
    };
    
    // Small delay to ensure window.googleAdsData is loaded
    const timer = setTimeout(renderAd, 100);
    return () => clearTimeout(timer);
  }, [adId, isVisible, adRendered, adBlockerDetected, userId, location, size]);
  
  if (adBlockerDetected) {
    return (
      <div 
        className={cn(
          "ad-blocker-message p-4 text-center border border-dashed border-gray-300 bg-gray-50",
          className
        )}
        style={{ 
          width: dimensions.width, 
          height: dimensions.height,
          maxWidth: '100%'
        }}
      >
        <p className="text-sm text-gray-500">
          We noticed you're using an ad blocker. Our ads help support the site.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Please consider disabling your ad blocker for this site.
        </p>
      </div>
    );
  }
  
  return (
    <div 
      ref={adRef}
      id={`ad-${adId}`}
      className={cn(
        "ad-container border border-dashed border-gray-300 flex items-center justify-center bg-gray-50",
        className
      )}
      style={{ 
        width: dimensions.width, 
        height: dimensions.height,
        maxWidth: '100%'
      }}
    >
      {!isVisible || (!adRendered && fallbackContent) ? (
        fallbackContent || (
          <div className="text-xs text-gray-400 text-center p-2">
            <p>Ad Space</p>
            <p>{dimensions.width}x{dimensions.height}</p>
          </div>
        )
      ) : null}
    </div>
  );
};

export default AdPlaceholder;
