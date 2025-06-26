
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { WifiOff, Wifi, Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OfflineData {
  collections: any[];
  words: any[];
  userProgress: any;
  lastSync: string;
}

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData | null>(null);
  const [syncInProgress, setSyncInProgress] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load cached data
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineData = () => {
    try {
      const cached = localStorage.getItem('offline-learning-data');
      if (cached) {
        setOfflineData(JSON.parse(cached));
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
  };

  const cacheDataForOffline = async () => {
    setSyncInProgress(true);
    try {
      // In a real app, you'd fetch and cache essential data
      const dataToCache: OfflineData = {
        collections: [], // Would fetch from API
        words: [], // Would fetch from API
        userProgress: {}, // Would fetch from API
        lastSync: new Date().toISOString()
      };

      localStorage.setItem('offline-learning-data', JSON.stringify(dataToCache));
      setOfflineData(dataToCache);
    } catch (error) {
      console.error('Error caching data:', error);
    } finally {
      setSyncInProgress(false);
    }
  };

  const syncWhenOnline = async () => {
    if (!isOnline) return;
    
    setSyncInProgress(true);
    try {
      // In a real app, you'd sync pending changes to the server
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate sync
      await cacheDataForOffline(); // Refresh cache
    } catch (error) {
      console.error('Error syncing data:', error);
    } finally {
      setSyncInProgress(false);
    }
  };

  if (isOnline && !offlineData) {
    return (
      <Card className="mb-4 border-blue-200 bg-blue-50">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              Download content for offline learning
            </span>
          </div>
          <Button 
            size="sm" 
            onClick={cacheDataForOffline}
            disabled={syncInProgress}
          >
            {syncInProgress ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              'Download'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="fixed top-16 right-4 z-50">
      <Badge 
        variant={isOnline ? "default" : "destructive"}
        className="flex items-center gap-1 px-2 py-1"
      >
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3" />
            Online
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            Offline
          </>
        )}
      </Badge>
      
      {!isOnline && offlineData && (
        <Card className="mt-2 w-64 shadow-lg">
          <CardContent className="p-3">
            <div className="text-sm space-y-2">
              <div className="font-medium text-orange-800">Offline Mode Active</div>
              <div className="text-xs text-muted-foreground">
                Last synced: {new Date(offlineData.lastSync).toLocaleTimeString()}
              </div>
              <div className="text-xs text-muted-foreground">
                You can continue learning with cached content
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {isOnline && offlineData && (
        <Button 
          size="sm" 
          variant="outline" 
          className="mt-2"
          onClick={syncWhenOnline}
          disabled={syncInProgress}
        >
          {syncInProgress ? (
            <RefreshCw className="h-3 w-3 animate-spin mr-1" />
          ) : (
            'Sync'
          )}
        </Button>
      )}
    </div>
  );
};

export default OfflineIndicator;
