
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

interface RateLimitEndpoint {
  endpoint: string;
  count: number;
  limit: number;
  resetAt: string;
  status: 'ok' | 'warning' | 'exceeded';
}

const RateLimitStatus: React.FC = () => {
  const { session } = useAuth();
  const [endpoints, setEndpoints] = useState<RateLimitEndpoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRateLimits = async () => {
      if (!session?.user) return;
      
      try {
        setLoading(true);
        
        // Sample data for demonstration - in production this would come from the database
        // We're using sample data since the table may not have data yet
        const sampleEndpoints = [
          { 
            endpoint: 'users/create', 
            count: 3, 
            limit: 10,
            resetAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            status: 'ok' as const
          },
          { 
            endpoint: 'words/delete', 
            count: 8, 
            limit: 10,
            resetAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            status: 'warning' as const
          },
          { 
            endpoint: 'collections/create', 
            count: 10, 
            limit: 10,
            resetAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
            status: 'exceeded' as const
          }
        ];
        
        setEndpoints(sampleEndpoints);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching rate limits:', error);
      }
    };
    
    fetchRateLimits();
    
    // Refresh rate limits every minute
    const interval = setInterval(fetchRateLimits, 60 * 1000);
    return () => clearInterval(interval);
  }, [session]);
  
  const getTimeRemaining = (resetAt: string): string => {
    const resetTime = new Date(resetAt).getTime();
    const now = Date.now();
    const diff = resetTime - now;
    
    if (diff <= 0) return 'Reset';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200"><CheckCircle2 className="h-3 w-3 mr-1" /> Normal</Badge>;
      case 'warning':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200"><AlertTriangle className="h-3 w-3 mr-1" /> High</Badge>;
      case 'exceeded':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200"><AlertTriangle className="h-3 w-3 mr-1" /> Exceeded</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading rate limit information...</div>;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">API Rate Limits</h3>
      
      {endpoints.map((endpoint) => (
        <div key={endpoint.endpoint} className="bg-card rounded-md p-3 border border-border">
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-sm">{endpoint.endpoint}</span>
            {getStatusBadge(endpoint.status)}
          </div>
          
          <div className="mb-1">
            <Progress 
              value={(endpoint.count / endpoint.limit) * 100} 
              className={`h-2 ${
                endpoint.status === 'ok' 
                  ? 'bg-muted' 
                  : endpoint.status === 'warning' 
                    ? 'bg-amber-100' 
                    : 'bg-red-100'
              }`}
            />
          </div>
          
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>{endpoint.count} of {endpoint.limit} requests</span>
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Reset in: {getTimeRemaining(endpoint.resetAt)}
            </span>
          </div>
        </div>
      ))}
      
      <div className="text-xs text-muted-foreground mt-2">
        Rate limits are per user and reset after a specific window.
      </div>
    </div>
  );
};

export default RateLimitStatus;
