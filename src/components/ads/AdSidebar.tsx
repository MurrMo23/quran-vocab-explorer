
import React, { useEffect, useState } from 'react';
import AdPlaceholder from './AdPlaceholder';
import { useMediaQuery } from '@/hooks/use-mobile';

interface AdSidebarProps {
  className?: string;
  location?: string;
}

const AdSidebar: React.FC<AdSidebarProps> = ({ className, location = 'sidebar' }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [showMobileAd, setShowMobileAd] = useState(false);
  
  // Only show mobile banner on small screens after a delay
  useEffect(() => {
    if (isMobile) {
      const timer = setTimeout(() => {
        setShowMobileAd(true);
      }, 2000); // Wait 2 seconds before showing mobile ad
      
      return () => clearTimeout(timer);
    }
  }, [isMobile]);
  
  return (
    <div className={className}>
      {isMobile ? (
        // Mobile layout - show mobile banner if needed
        showMobileAd && (
          <div className="mb-6">
            <AdPlaceholder 
              adId="mobile-banner-top" 
              size="mobile-banner"
              className="mx-auto"
              location={`${location}-mobile`}
              fallbackContent={
                <div className="text-center p-2">
                  <p className="text-sm text-muted-foreground">Advertisement</p>
                </div>
              }
            />
          </div>
        )
      ) : (
        // Desktop layout
        <>
          <div className="mb-6">
            <AdPlaceholder 
              adId={`${location}-top`} 
              size="medium-rectangle"
              className="mx-auto"
              location={location}
              fallbackContent={
                <div className="text-center p-2">
                  <p className="text-sm text-muted-foreground">Advertisement</p>
                </div>
              }
            />
          </div>
          <div className="mt-8">
            <AdPlaceholder 
              adId={`${location}-bottom`} 
              size="medium-rectangle"
              className="mx-auto"
              location={location}
              lazyLoad={true}
              fallbackContent={
                <div className="text-center p-2">
                  <p className="text-sm text-muted-foreground">Advertisement</p>
                </div>
              }
            />
          </div>
        </>
      )}
    </div>
  );
};

export default AdSidebar;
