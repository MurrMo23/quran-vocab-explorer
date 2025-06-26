
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Users, BookOpen, MessageSquare, Award, Activity, AlertTriangle } from 'lucide-react';

const AdminOverview = () => {
  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12.3%',
      changeType: 'positive' as const,
      icon: Users
    },
    {
      title: 'Active Vocabulary',
      value: '2,847',
      change: '+5.2%',
      changeType: 'positive' as const,
      icon: BookOpen
    },
    {
      title: 'Quiz Sessions',
      value: '15,678',
      change: '+8.7%',
      changeType: 'positive' as const,
      icon: Activity
    },
    {
      title: 'Community Posts',
      value: '456',
      change: '-2.1%',
      changeType: 'negative' as const,
      icon: MessageSquare
    }
  ];

  const systemHealth = [
    { name: 'Database', status: 'healthy', uptime: '99.9%' },
    { name: 'API Services', status: 'healthy', uptime: '99.8%' },
    { name: 'File Storage', status: 'warning', uptime: '98.5%' },
    { name: 'Search Index', status: 'healthy', uptime: '99.7%' }
  ];

  const recentActivities = [
    { type: 'user', action: 'New user registration', user: 'Ahmed Hassan', time: '2 minutes ago' },
    { type: 'content', action: 'New vocabulary word added', user: 'Sarah Admin', time: '15 minutes ago' },
    { type: 'system', action: 'Backup completed successfully', user: 'System', time: '1 hour ago' },
    { type: 'moderation', action: 'Comment flagged for review', user: 'Auto Moderator', time: '2 hours ago' },
    { type: 'achievement', action: 'User earned "Scholar" badge', user: 'Fatima Al-Zahra', time: '3 hours ago' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return Users;
      case 'content': return BookOpen;
      case 'system': return Activity;
      case 'moderation': return AlertTriangle;
      case 'achievement': return Award;
      default: return Activity;
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <div className="flex items-center mt-1">
                      {stat.changeType === 'positive' ? (
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`text-sm ${stat.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemHealth.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`} />
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">{service.uptime}</span>
                  <Badge variant={service.status === 'healthy' ? 'default' : service.status === 'warning' ? 'secondary' : 'destructive'}>
                    {service.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 text-left border rounded-lg hover:bg-muted transition-colors">
                <BookOpen className="h-5 w-5 mb-2" />
                <div className="text-sm font-medium">Add Vocabulary</div>
                <div className="text-xs text-muted-foreground">Create new word</div>
              </button>
              <button className="p-3 text-left border rounded-lg hover:bg-muted transition-colors">
                <Users className="h-5 w-5 mb-2" />
                <div className="text-sm font-medium">Manage Users</div>
                <div className="text-xs text-muted-foreground">User administration</div>
              </button>
              <button className="p-3 text-left border rounded-lg hover:bg-muted transition-colors">
                <MessageSquare className="h-5 w-5 mb-2" />
                <div className="text-sm font-medium">Moderate Content</div>
                <div className="text-xs text-muted-foreground">Review flagged items</div>
              </button>
              <button className="p-3 text-left border rounded-lg hover:bg-muted transition-colors">
                <Activity className="h-5 w-5 mb-2" />
                <div className="text-sm font-medium">View Analytics</div>
                <div className="text-xs text-muted-foreground">Platform insights</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <div key={index} className="flex items-center space-x-4">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">by {activity.user}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Database</span>
              <span>2.3 GB / 10 GB</span>
            </div>
            <Progress value={23} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>File Storage</span>
              <span>5.7 GB / 50 GB</span>
            </div>
            <Progress value={11.4} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Audio Files</span>
              <span>1.2 GB / 20 GB</span>
            </div>
            <Progress value={6} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOverview;
