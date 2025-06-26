
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Brain, 
  Clock, 
  Target, 
  BookOpen, 
  Zap,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

interface LearningMetrics {
  dailyProgress: Array<{ date: string; wordsLearned: number; accuracy: number; timeSpent: number }>;
  collectionProgress: Array<{ name: string; progress: number; wordsLearned: number }>;
  difficultyBreakdown: Array<{ level: string; count: number; accuracy: number }>;
  weeklyStats: {
    totalWords: number;
    averageAccuracy: number;
    totalTimeMinutes: number;
    streakDays: number;
    improvementRate: number;
  };
}

const LearningAnalyticsDashboard: React.FC = () => {
  const { session } = useAuth();
  const [metrics, setMetrics] = useState<LearningMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');

  useEffect(() => {
    if (session) {
      fetchAnalytics();
    }
  }, [session, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Mock data - in a real app, this would come from your analytics API
      const mockMetrics: LearningMetrics = {
        dailyProgress: [
          { date: '2024-01-01', wordsLearned: 12, accuracy: 85, timeSpent: 25 },
          { date: '2024-01-02', wordsLearned: 15, accuracy: 88, timeSpent: 30 },
          { date: '2024-01-03', wordsLearned: 8, accuracy: 82, timeSpent: 20 },
          { date: '2024-01-04', wordsLearned: 18, accuracy: 91, timeSpent: 35 },
          { date: '2024-01-05', wordsLearned: 22, accuracy: 89, timeSpent: 40 },
          { date: '2024-01-06', wordsLearned: 16, accuracy: 93, timeSpent: 28 },
          { date: '2024-01-07', wordsLearned: 14, accuracy: 87, timeSpent: 32 }
        ],
        collectionProgress: [
          { name: 'Faith & Theology', progress: 75, wordsLearned: 45 },
          { name: 'Prophets', progress: 60, wordsLearned: 32 },
          { name: 'Ethics & Morality', progress: 85, wordsLearned: 58 },
          { name: 'Afterlife', progress: 40, wordsLearned: 28 },
          { name: 'Worship', progress: 70, wordsLearned: 42 }
        ],
        difficultyBreakdown: [
          { level: 'Beginner', count: 85, accuracy: 92 },
          { level: 'Intermediate', count: 45, accuracy: 78 },
          { level: 'Advanced', count: 15, accuracy: 65 }
        ],
        weeklyStats: {
          totalWords: 105,
          averageAccuracy: 87,
          totalTimeMinutes: 210,
          streakDays: 7,
          improvementRate: 12
        }
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Please log in to view your learning analytics</p>
        </CardContent>
      </Card>
    );
  }

  if (loading || !metrics) {
    return (
      <Card>
        <CardContent className="text-center p-8">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </CardContent>
      </Card>
    );
  }

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Learning Analytics</h2>
        <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
          <TabsList>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="quarter">Quarter</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Words Learned</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.weeklyStats.totalWords}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +{metrics.weeklyStats.improvementRate}% from last week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.weeklyStats.averageAccuracy}%</div>
            <Badge variant="secondary" className="mt-1">
              {metrics.weeklyStats.averageAccuracy >= 90 ? 'Excellent' : 
               metrics.weeklyStats.averageAccuracy >= 80 ? 'Good' : 'Needs Work'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(metrics.weeklyStats.totalTimeMinutes / 60)}h</div>
            <div className="text-xs text-muted-foreground">
              {metrics.weeklyStats.totalTimeMinutes} minutes this week
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.weeklyStats.streakDays}</div>
            <div className="text-xs text-muted-foreground">consecutive days</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="progress" className="w-full">
        <TabsList>
          <TabsTrigger value="progress">Progress Trends</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="difficulty">Difficulty Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Learning Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.dailyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="wordsLearned" 
                    stroke="#8884d8" 
                    name="Words Learned"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#82ca9d" 
                    name="Accuracy %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Study Time Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={metrics.dailyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="timeSpent" fill="#ffc658" name="Minutes" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="collections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Collection Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.collectionProgress.map((collection, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{collection.name}</span>
                      <Badge variant="outline">{collection.wordsLearned} words</Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${collection.progress}%` }}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground text-right">
                      {collection.progress}% complete
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="difficulty" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Words by Difficulty</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={metrics.difficultyBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ level, count }) => `${level}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {metrics.difficultyBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Accuracy by Difficulty</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={metrics.difficultyBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="level" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="accuracy" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LearningAnalyticsDashboard;
