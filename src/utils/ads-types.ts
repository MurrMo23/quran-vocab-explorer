
// Extend the Window interface to include our Google Ads data
export interface GoogleAdsData {
  [adId: string]: string; // Maps ad IDs to their HTML code
}

declare global {
  interface Window {
    googleAdsData?: GoogleAdsData;
  }
}

export type AdSize = 
  | 'medium-rectangle'  // 300x250
  | 'leaderboard'       // 728x90
  | 'large-mobile'      // 320x100
  | 'mobile-banner'     // 320x50
  | 'wide-skyscraper'   // 160x600
  | 'large-rectangle'   // 336x280
  | 'custom';           // Custom size

export interface AdConfig {
  id: string;
  name: string;
  size: string;
  code: string;
  is_active: boolean;
  location: string;
  publisher_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Type for Supabase ad_configs table response
export interface AdConfigResponse {
  id: string;
  name: string;
  size: string;
  code: string;
  is_active: boolean;
  location: string;
  publisher_id?: string;
  created_at: string;
  updated_at: string;
}
