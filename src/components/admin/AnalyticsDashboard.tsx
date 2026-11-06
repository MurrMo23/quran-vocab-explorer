
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart, PieChart, Pie, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, Cell } from 'recharts';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
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

  // Aggregates real admin activity from public.audit_logs for the selected range.
  // Shows empty charts (not invented numbers) when there is no activity.
  const fetchAnalyticsData = async () => {
    const days = timeRange === 'day' ? 1 : timeRange === 'week' ? 7 : 30;
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('audit_logs')
        .select('action, entity_type, user_id, created_at')
        .gte('created_at', since.toISOString())
        .order('created_at', { ascending: true })
        .limit(5000);
      if (error) throw error;
      const rows = data ?? [];

      const countBy = (key: (r: (typeof rows)[number]) => string): AnalyticsDataPoint[] => {
        const m = new Map<string, number>();
        for (const r of rows) m.set(key(r), (m.get(key(r)) ?? 0) + 1);
        return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
      };
      setActionTypeData(countBy(r => r.action || 'unknown'));
      setEntityTypeData(countBy(r => r.entity_type || 'unknown'));
      setUserActivityData(countBy(r => (r.user_id ? `${r.user_id.slice(0, 8)}…` : 'system')).slice(0, 5));

      const series: TimeSeriesDataPoint[] = [];
      const actions = [...new Set(rows.map(r => r.action || 'unknown'))];
      for (let i = 0; i < days; i++) {
        const d = new Date(since);
        d.setDate(since.getDate() + i);
        const label = d.toLocaleDateString();
        for (const type of actions) {
          const count = rows.filter(r => (r.action || 'unknown') === type && new Date(r.created_at).toLocaleDateString() === label).length;
          series.push({ date: label, type, count });
        }
      }
      setTimeSeriesData(series);
    } catch (error: any) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load admin activity');
      setActionTypeData([]);
      setEntityTypeData([]);
      setUserActivityData([]);
      setTimeSeriesData([]);
    } finally {
      setLoading(false);
    }
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
