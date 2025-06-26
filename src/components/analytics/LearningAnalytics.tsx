
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Brain, 
  Star, 
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart as RechartsPieChart, Cell, BarChart, Bar } from 'recharts';

interface AnalyticsData {
  totalSessions: number;
  totalWords: number;
  averageAccuracy: number;
  timeSpent: number;
  streak: number;
  weakAreas: string[];
  strongAreas: string[];
  dailyProgress: Array<{
    date: string;
    accuracy: number;
    wordsLearned: number;
    timeSpent: number;
  }>;
  levelDistribution: Array<{
    level: string;
    count: number;
    accuracy: number;
  }>;
  categoryPerformance: Array<{
    category: string;
    correct: number;
    total: number;
  }>;
}

interface LearningAnalyticsProps {
  data: AnalyticsData;
}

const LearningAnalytics: React.FC<LearningAnalyticsProps> = ({ data }) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" />
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSessions}</div>
            <p className="text-sm text-muted-foreground">Practice sessions completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Words Learned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalWords}</div>
            <p className="text-sm text-muted-foreground">Vocabulary mastered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Average Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.averageAccuracy.toFixed(1)}%</div>
            <Progress value={data.averageAccuracy} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Invested
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatTime(data.timeSpent)}</div>
            <p className="text-sm text-muted-foreground">Total study time</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Daily Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.dailyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="accuracy" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="Accuracy %"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="wordsLearned" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="Words Learned"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Streak</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-4xl font-bold text-orange-500 mb-2">
                  🔥 {data.streak}
                </div>
                <p className="text-muted-foreground">Days in a row</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Level Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.levelDistribution.map((level, index) => (
                    <div key={level.level} className="flex justify-between items-center">
                      <span className="text-sm">{level.level}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={(level.count / data.totalWords) * 100} className="w-20" />
                        <span className="text-sm text-muted-foreground">{level.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Category Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="correct" fill="#82ca9d" name="Correct" />
                  <Bar dataKey="total" fill="#8884d8" name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Strong Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.strongAreas.map((area, index) => (
                    <Badge key={index} className="bg-green-100 text-green-800">
                      <Star className="h-3 w-3 mr-1" />
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Areas for Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {data.weakAreas.map((area, index) => (
                    <Badge key={index} variant="outline" className="text-red-600 border-red-200">
                      {area}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Learning Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">📈 Progress Trend</h4>
                <p className="text-blue-700 text-sm">
                  Your accuracy has improved by 15% over the last week. Keep up the great work!
                </p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">⚡ Best Performance Time</h4>
                <p className="text-green-700 text-sm">
                  You perform best during morning sessions (9-11 AM) with 89% average accuracy.
                </p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2">🎯 Recommendation</h4>
                <p className="text-orange-700 text-sm">
                  Focus more on intermediate-level words to boost your overall performance.
                </p>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">🏆 Achievement Unlocked</h4>
                <p className="text-purple-700 text-sm">
                  Consistency Champion - You've practiced 7 days in a row!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Learning Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Daily Practice Goal</span>
                    <span className="text-sm text-muted-foreground">12/15 min</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Weekly Words Goal</span>
                    <span className="text-sm text-muted-foreground">45/50 words</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Accuracy Target</span>
                    <span className="text-sm text-muted-foreground">85/90%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Next Milestones</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">🎯</Badge>
                    <span>Master 100 words (85/100)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">📚</Badge>
                    <span>Complete Beginner Level (75%)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">🔥</Badge>
                    <span>30-day streak (7/30)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LearningAnalytics;
