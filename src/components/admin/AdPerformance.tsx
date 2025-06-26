
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AdImpression, AdClick } from '@/utils/ads-utils';
import { AdConfig } from '@/utils/ads-types';
import { formatDistanceToNow } from 'date-fns';

interface AdPerformanceProps {
  ads: AdConfig[];
}

const AdPerformance: React.FC<AdPerformanceProps> = ({ ads }) => {
  const [impressions, setImpressions] = useState<AdImpression[]>([]);
  const [clicks, setClicks] = useState<AdClick[]>([]);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month'>('day');
  
  useEffect(() => {
    // Load ad performance data from localStorage
    try {
      const storedImpressions = localStorage.getItem('adImpressions');
      const storedClicks = localStorage.getItem('adClicks');
      
      if (storedImpressions) {
        setImpressions(JSON.parse(storedImpressions));
      }
      
      if (storedClicks) {
        setClicks(JSON.parse(storedClicks));
      }
    } catch (error) {
      console.error('Error loading ad performance data:', error);
    }
  }, []);
  
  // Filter data based on selected timeframe
  const filterByTimeframe = (data: (AdImpression | AdClick)[]) => {
    const now = Date.now();
    let cutoff: number;
    
    switch (timeframe) {
      case 'day':
        cutoff = now - 24 * 60 * 60 * 1000; // 24 hours ago
        break;
      case 'week':
        cutoff = now - 7 * 24 * 60 * 60 * 1000; // 7 days ago
        break;
      case 'month':
        cutoff = now - 30 * 24 * 60 * 60 * 1000; // 30 days ago
        break;
    }
    
    return data.filter(item => item.timestamp >= cutoff);
  };
  
  // Get filtered data
  const filteredImpressions = filterByTimeframe(impressions);
  const filteredClicks = filterByTimeframe(clicks);
  
  // Calculate CTR (Click-Through Rate)
  const calculateCTR = (adId: string) => {
    const adImpressions = filteredImpressions.filter(imp => imp.adId === adId).length;
    const adClicks = filteredClicks.filter(click => click.adId === adId).length;
    
    if (adImpressions === 0) return 0;
    return (adClicks / adImpressions) * 100;
  };
  
  // Prepare data for charts
  const prepareChartData = () => {
    const adPerformance = ads.map(ad => {
      const adImpressions = filteredImpressions.filter(imp => imp.adId === ad.id).length;
      const adClicks = filteredClicks.filter(click => click.adId === ad.id).length;
      const ctr = adImpressions > 0 ? (adClicks / adImpressions) * 100 : 0;
      
      return {
        name: ad.name,
        impressions: adImpressions,
        clicks: adClicks,
        ctr: parseFloat(ctr.toFixed(2))
      };
    });
    
    return adPerformance;
  };
  
  // Prepare time series data
  const prepareTimeSeriesData = () => {
    const timeIntervals = 24; // 24 hours, 24 days, or 24 weeks depending on timeframe
    const now = Date.now();
    let intervalSize: number;
    
    switch (timeframe) {
      case 'day':
        intervalSize = 60 * 60 * 1000; // 1 hour in ms
        break;
      case 'week':
        intervalSize = 7 * 24 * 60 * 60 * 1000 / timeIntervals; // ~7 hours
        break;
      case 'month':
        intervalSize = 30 * 24 * 60 * 60 * 1000 / timeIntervals; // ~30 hours
        break;
    }
    
    const timeSeriesData = [];
    
    for (let i = timeIntervals - 1; i >= 0; i--) {
      const intervalStart = now - (i + 1) * intervalSize;
      const intervalEnd = now - i * intervalSize;
      
      const intervalImpressions = filteredImpressions.filter(
        imp => imp.timestamp >= intervalStart && imp.timestamp < intervalEnd
      ).length;
      
      const intervalClicks = filteredClicks.filter(
        click => click.timestamp >= intervalStart && click.timestamp < intervalEnd
      ).length;
      
      let timeLabel: string;
      switch (timeframe) {
        case 'day':
          timeLabel = `${new Date(intervalStart).getHours()}:00`;
          break;
        case 'week':
          timeLabel = `Day ${7 - Math.floor(i / (timeIntervals / 7))}`;
          break;
        case 'month':
          timeLabel = `Week ${4 - Math.floor(i / (timeIntervals / 4))}`;
          break;
      }
      
      timeSeriesData.push({
        time: timeLabel,
        impressions: intervalImpressions,
        clicks: intervalClicks
      });
    }
    
    return timeSeriesData;
  };
  
  const chartData = prepareChartData();
  const timeSeriesData = prepareTimeSeriesData();
  
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all ad performance data? This cannot be undone.')) {
      localStorage.removeItem('adImpressions');
      localStorage.removeItem('adClicks');
      setImpressions([]);
      setClicks([]);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ad Performance</CardTitle>
        <CardDescription>
          Track impressions, clicks, and click-through rates for your ads
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <TabsList>
            <TabsTrigger 
              value="day" 
              onClick={() => setTimeframe('day')}
              className={timeframe === 'day' ? 'bg-primary text-primary-foreground' : ''}
            >
              Last 24 Hours
            </TabsTrigger>
            <TabsTrigger 
              value="week" 
              onClick={() => setTimeframe('week')}
              className={timeframe === 'week' ? 'bg-primary text-primary-foreground' : ''}
            >
              Last 7 Days
            </TabsTrigger>
            <TabsTrigger 
              value="month" 
              onClick={() => setTimeframe('month')}
              className={timeframe === 'month' ? 'bg-primary text-primary-foreground' : ''}
            >
              Last 30 Days
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Impressions</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-bold">{filteredImpressions.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Clicks</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-bold">{filteredClicks.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Avg. CTR</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-bold">
                {filteredImpressions.length > 0 
                  ? ((filteredClicks.length / filteredImpressions.length) * 100).toFixed(2) 
                  : '0.00'}%
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="summary">
          <TabsList className="mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="impressions" name="Impressions" fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="clicks" name="Clicks" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="timeline">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="impressions" name="Impressions" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="clicks" name="Clicks" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="details">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Impressions</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>CTR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ads.map(ad => {
                    const adImpressions = filteredImpressions.filter(imp => imp.adId === ad.id).length;
                    const adClicks = filteredClicks.filter(click => click.adId === ad.id).length;
                    const ctr = adImpressions > 0 ? (adClicks / adImpressions) * 100 : 0;
                    
                    return (
                      <TableRow key={ad.id}>
                        <TableCell>{ad.name}</TableCell>
                        <TableCell>{ad.size}</TableCell>
                        <TableCell>{ad.location}</TableCell>
                        <TableCell>{adImpressions}</TableCell>
                        <TableCell>{adClicks}</TableCell>
                        <TableCell>{ctr.toFixed(2)}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {(filteredImpressions.length > 0 || filteredClicks.length > 0) && (
              <div className="mt-4 flex justify-end">
                <Button variant="destructive" size="sm" onClick={handleClearData}>
                  Clear All Data
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Recent Activity</h3>
          <div className="space-y-2">
            {[...filteredClicks, ...filteredImpressions]
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, 5)
              .map((activity, index) => {
                const isClick = 'adId' in activity && filteredClicks.some(click => 
                  click.adId === activity.adId && click.timestamp === activity.timestamp
                );
                
                const ad = ads.find(a => a.id === activity.adId);
                
                return (
                  <div key={index} className="text-sm">
                    <span className="text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}:
                    </span>{' '}
                    <span className={isClick ? "text-primary font-medium" : ""}>
                      {isClick ? 'Click' : 'Impression'} on ad "{ad?.name || activity.adId}"
                    </span>
                  </div>
                );
              })}
            
            {filteredClicks.length === 0 && filteredImpressions.length === 0 && (
              <div className="text-muted-foreground text-sm">No recent activity</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdPerformance;
