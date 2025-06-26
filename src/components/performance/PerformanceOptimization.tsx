
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Database, 
  Globe, 
  Activity, 
  Clock, 
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  target: number;
}

const PerformanceOptimization: React.FC = () => {
  const metrics: PerformanceMetric[] = [
    { name: 'Page Load Time', value: 1.2, unit: 's', status: 'good', target: 2.0 },
    { name: 'Database Query Time', value: 150, unit: 'ms', status: 'good', target: 300 },
    { name: 'CDN Cache Hit Rate', value: 95, unit: '%', status: 'good', target: 90 },
    { name: 'API Response Time', value: 250, unit: 'ms', status: 'warning', target: 200 },
    { name: 'Memory Usage', value: 75, unit: '%', status: 'warning', target: 80 },
    { name: 'Error Rate', value: 0.5, unit: '%', status: 'good', target: 1.0 }
  ];

  const optimizations = [
    {
      category: 'Database',
      items: [
        { name: 'Query Optimization', status: 'completed', description: 'Indexed frequently queried columns' },
        { name: 'Connection Pooling', status: 'completed', description: 'Implemented connection pooling for better performance' },
        { name: 'Caching Layer', status: 'in-progress', description: 'Redis caching for frequently accessed data' },
        { name: 'Read Replicas', status: 'planned', description: 'Set up read replicas for scaling' }
      ]
    },
    {
      category: 'CDN & Assets',
      items: [
        { name: 'Audio File CDN', status: 'completed', description: 'Audio files served from global CDN' },
        { name: 'Image Optimization', status: 'completed', description: 'WebP format and lazy loading implemented' },
        { name: 'Static Asset Caching', status: 'completed', description: 'Long-term caching for static resources' },
        { name: 'Compression', status: 'completed', description: 'Gzip compression enabled' }
      ]
    },
    {
      category: 'API & Rate Limiting',
      items: [
        { name: 'Rate Limiting', status: 'completed', description: 'Implemented per-user rate limiting' },
        { name: 'Response Caching', status: 'in-progress', description: 'Cache API responses for better performance' },
        { name: 'Request Batching', status: 'planned', description: 'Batch multiple requests for efficiency' },
        { name: 'GraphQL Optimization', status: 'planned', description: 'Optimize GraphQL queries and resolvers' }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'planned':
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getMetricProgress = (metric: PerformanceMetric) => {
    if (metric.unit === '%') {
      return metric.value;
    }
    return Math.min((metric.target / metric.value) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{metric.name}</span>
                  <Badge variant={metric.status === 'good' ? 'default' : metric.status === 'warning' ? 'secondary' : 'destructive'}>
                    {metric.status}
                  </Badge>
                </div>
                <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                  {metric.value}{metric.unit}
                </div>
                <div className="text-xs text-muted-foreground">
                  Target: {metric.target}{metric.unit}
                </div>
                <Progress 
                  value={getMetricProgress(metric)} 
                  className="mt-2 h-2" 
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {optimizations.map((category, categoryIndex) => (
        <Card key={categoryIndex}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {category.category === 'Database' && <Database className="h-5 w-5" />}
              {category.category === 'CDN & Assets' && <Globe className="h-5 w-5" />}
              {category.category === 'API & Rate Limiting' && <Zap className="h-5 w-5" />}
              {category.category} Optimizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getStatusIcon(item.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Real-time Monitoring</h3>
              <p className="text-sm text-blue-700">
                Continuous monitoring of application performance with automatic alerts for degradation.
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Automated Scaling</h3>
              <p className="text-sm text-green-700">
                Auto-scaling infrastructure based on traffic patterns and resource usage.
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-2">Performance Analytics</h3>
              <p className="text-sm text-purple-700">
                Detailed analytics and reporting on application performance trends.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceOptimization;
