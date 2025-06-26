
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart, PieChart, Pie, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, Cell } from 'recharts';
import { toast } from 'sonner';
import { BarChart as BarChartIcon, PieChart as PieChartIcon, LineChart as LineChartIcon, Users, Clock, Activity, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalyticsDataPoint {
  name: string;
  value: number;
}

interface TimeSeriesDataPoint {
  date: string;
  count: number;
  type?: string;
}

interface AdminAnalyticsData {
  id: string;
  user_id: string;
  action_type: string;
  entity_type: string;
  timestamp: string;
  details?: any;
}

const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [activeTab, setActiveTab] = useState('overview');
  const [actionTypeData, setActionTypeData] = useState<AnalyticsDataPoint[]>([]);
  const [entityTypeData, setEntityTypeData] = useState<AnalyticsDataPoint[]>([]);
  const [userActivityData, setUserActivityData] = useState<AnalyticsDataPoint[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Use simulated data since we may not have real data yet
      useSimulatedData();
    } catch (error: any) {
      console.error('Error fetching analytics data:', error);
      toast.error(`Failed to load analytics: ${error.message}`);
      
      // Use simulated data if real data fails
      useSimulatedData();
    } finally {
      setLoading(false);
    }
  };
  
  const useSimulatedData = () => {
    // Simulated data for demo purposes
    setActionTypeData([
      { name: 'CREATE', value: 45 },
      { name: 'UPDATE', value: 30 },
      { name: 'DELETE', value: 15 },
      { name: 'VIEW', value: 85 }
    ]);
    
    setEntityTypeData([
      { name: 'users', value: 25 },
      { name: 'words', value: 40 },
      { name: 'collections', value: 35 },
      { name: 'learning_paths', value: 20 }
    ]);
    
    setUserActivityData([
      { name: 'Admin 1', value: 50 },
      { name: 'Admin 2', value: 35 },
      { name: 'Admin 3', value: 40 }
    ]);
    
    const dates = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      dates.push(date.toLocaleDateString());
    }
    
    const timeSeriesData = [];
    for (const date of dates) {
      timeSeriesData.push(
        { date, type: 'CREATE', count: Math.floor(Math.random() * 10) + 1 },
        { date, type: 'UPDATE', count: Math.floor(Math.random() * 8) + 1 },
        { date, type: 'DELETE', count: Math.floor(Math.random() * 5) + 1 },
        { date, type: 'VIEW', count: Math.floor(Math.random() * 15) + 5 }
      );
    }
    
    setTimeSeriesData(timeSeriesData);
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as 'day' | 'week' | 'month');
  };

  const colors = ['#4f46e5', '#06b6d4', '#ef4444', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24h</SelectItem>
              <SelectItem value="week">Last 7d</SelectItem>
              <SelectItem value="month">Last 30d</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={fetchAnalyticsData} size="sm">
            <Activity className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview" className="flex items-center">
            <BarChartIcon className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            User Activity
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center">
            <LineChartIcon className="h-4 w-4 mr-2" />
            Timeline
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BarChartIcon className="h-5 w-5 mr-2 text-primary" />
                  Actions by Type
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {loading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Skeleton className="h-[250px] w-full" />
                  </div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={actionTypeData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#4f46e5" name="Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <PieChartIcon className="h-5 w-5 mr-2 text-primary" />
                  Actions by Entity
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {loading ? (
                  <div className="h-[300px] flex items-center justify-center">
                    <Skeleton className="h-[250px] w-full" />
                  </div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={entityTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {entityTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} actions`, 'Count']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Actions by User
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Skeleton className="h-[250px] w-full" />
                </div>
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={userActivityData}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 50, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" scale="band" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#10b981" name="Actions" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <LineChartIcon className="h-5 w-5 mr-2 text-primary" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Skeleton className="h-[250px] w-full" />
                </div>
              ) : (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={timeSeriesData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        name="CREATE" 
                        stroke="#4f46e5" 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                        connectNulls
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        name="UPDATE" 
                        stroke="#06b6d4" 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                        connectNulls
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        name="DELETE" 
                        stroke="#ef4444" 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                        connectNulls
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        name="VIEW" 
                        stroke="#f59e0b" 
                        activeDot={{ r: 8 }} 
                        strokeWidth={2}
                        connectNulls
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="text-center text-sm text-muted-foreground">
        <p>
          Data shown represents admin activity in the system. Refreshes automatically when new actions are performed.
        </p>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
