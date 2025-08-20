/**
 * Performance Chart Component
 * 
 * Visualizes performance metrics over time using charts and graphs
 * Navigation tracking has been intentionally disabled due to previous system interference
 */

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  Network, 
  MemoryStick,
  Activity
} from 'lucide-react';


export default function PerformanceChart({ metrics, timeWindow, theme }) {
  const [selectedMetricType, setSelectedMetricType] = useState('api_performance');
  const [chartType, setChartType] = useState('line');

  // Process metrics for charting - navigation metrics excluded for safety
  const chartData = useMemo(() => {
    if (!metrics || metrics.length === 0) return [];

    const cutoff = Date.now() - timeWindow;
    const recentMetrics = metrics.filter(metric => metric.timestamp > cutoff);

    // Group metrics by time buckets (e.g., every minute)
    const bucketSize = 60000; // 1 minute buckets
    const buckets = {};

    recentMetrics.forEach(metric => {
      const bucket = Math.floor(metric.timestamp / bucketSize) * bucketSize;
      if (!buckets[bucket]) {
        buckets[bucket] = {
          timestamp: bucket,
          time: new Date(bucket).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          api_performance: [],
          memory_usage: [],
          performance_resource: []
          // navigation_timing: [], // Intentionally disabled due to previous system interference
          // performance_navigation: [], // Caused core application functionality to break
        };
      }

      if (buckets[bucket][metric.type]) {
        buckets[bucket][metric.type].push(metric);
      }
    });

    // Calculate averages for each bucket
    return Object.values(buckets)
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(bucket => {
        const result = {
          time: bucket.time,
          timestamp: bucket.timestamp
        };

        // API Performance metrics
        if (bucket.api_performance.length > 0) {
          const apiMetrics = bucket.api_performance;
          result.avgApiResponse = apiMetrics.reduce((sum, m) => sum + m.data.duration, 0) / apiMetrics.length;
          result.apiRequests = apiMetrics.length;
          result.apiErrors = apiMetrics.filter(m => !m.data.ok).length;
          result.apiErrorRate = (result.apiErrors / result.apiRequests) * 100;
        }

        // Navigation metrics intentionally disabled due to previous system interference
        // Previous navigation tracking caused core application functionality to break

        // Memory metrics
        if (bucket.memory_usage.length > 0) {
          const memMetrics = bucket.memory_usage;
          const latestMem = memMetrics[memMetrics.length - 1];
          result.memoryUsage = latestMem.data.usedJSHeapSize / 1048576; // Convert to MB
          result.totalMemory = latestMem.data.totalJSHeapSize / 1048576;
        }

        // Performance Observer metrics (excluding navigation)
        const perfMetrics = [
          ...bucket.performance_resource
          // ...bucket.performance_navigation, // Disabled for safety
        ];

        if (perfMetrics.length > 0) {
          result.pageLoadTime = perfMetrics
            .filter(m => m.data.duration)
            .reduce((sum, m) => sum + m.data.duration, 0) / 
            Math.max(perfMetrics.filter(m => m.data.duration).length, 1);
        }

        return result;
      });
  }, [metrics, timeWindow]);

  // Chart configurations for different metric types (navigation removed)
  const getChartConfig = (type) => {
    switch (type) {
      case 'api_performance':
        return {
          title: 'API Performance',
          icon: <Network className="h-4 w-4" />,
          dataKeys: [
            { key: 'avgApiResponse', name: 'Avg Response Time (ms)', color: '#8884d8' },
            { key: 'apiErrorRate', name: 'Error Rate (%)', color: '#ff7300' }
          ],
          yAxisLabel: 'Time (ms) / Error Rate (%)'
        };
      case 'memory_usage':
        return {
          title: 'Memory Usage',
          icon: <MemoryStick className="h-4 w-4" />,
          dataKeys: [
            { key: 'memoryUsage', name: 'Used Memory (MB)', color: '#ffc658' },
            { key: 'totalMemory', name: 'Total Memory (MB)', color: '#ff7c7c' }
          ],
          yAxisLabel: 'Memory (MB)'
        };
      case 'system_overview':
        return {
          title: 'System Overview',
          icon: <Activity className="h-4 w-4" />,
          dataKeys: [
            { key: 'avgApiResponse', name: 'API Response (ms)', color: '#8884d8' },
            { key: 'memoryUsage', name: 'Memory Usage (MB)', color: '#ffc658' }
            // { key: 'avgNavTime', name: 'Navigation (ms)', color: '#82ca9d' }, // Disabled
          ],
          yAxisLabel: 'Time (ms) / Memory (MB)'
        };
      default:
        return {
          title: 'Performance Metrics',
          icon: <TrendingUp className="h-4 w-4" />,
          dataKeys: [],
          yAxisLabel: 'Value'
        };
    }
  };

  const config = getChartConfig(selectedMetricType);

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`${theme.colors.background.secondary} p-3 border rounded shadow-lg`}>
          <p className="font-medium">{`Time: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Render chart based on type
  const renderChart = () => {
    if (chartData.length === 0) {
      return (
        <div className={`flex items-center justify-center h-64 ${theme.colors.text.tertiary}`}>
          No data available for the selected time window
        </div>
      );
    }

    const commonProps = {
      width: '100%',
      height: 300,
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis label={{ value: config.yAxisLabel, angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomTooltip />} />
              {config.dataKeys.map((dataKey, index) => (
                <Area
                  key={dataKey.key}
                  type="monotone"
                  dataKey={dataKey.key}
                  stackId={selectedMetricType === 'memory_usage' ? "1" : undefined}
                  stroke={dataKey.color}
                  fill={dataKey.color}
                  fillOpacity={0.3}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
        
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis label={{ value: config.yAxisLabel, angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomTooltip />} />
              {config.dataKeys.map((dataKey, index) => (
                <Bar
                  key={dataKey.key}
                  dataKey={dataKey.key}
                  fill={dataKey.color}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
        
      default: // line chart
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis label={{ value: config.yAxisLabel, angle: -90, position: 'insideLeft' }} />
              <Tooltip content={<CustomTooltip />} />
              {config.dataKeys.map((dataKey, index) => (
                <Line
                  key={dataKey.key}
                  type="monotone"
                  dataKey={dataKey.key}
                  stroke={dataKey.color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <Card className={`${theme.colors.background.card} ${theme.colors.border.primary}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Charts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Metric:</span>
              <div className="flex gap-1">
                {[
                  { key: 'api_performance', label: 'API Performance' },
                  { key: 'memory_usage', label: 'Memory Usage' },
                  { key: 'system_overview', label: 'System Overview' }
                  // { key: 'navigation_timing', label: 'Navigation' }, // Disabled for safety
                ].map(option => (
                  <Button
                    key={option.key}
                    variant={selectedMetricType === option.key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedMetricType(option.key)}
                    className={selectedMetricType === option.key 
                      ? 'bg-zinc-600 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600' 
                      : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Chart:</span>
              <div className="flex gap-1">
                {[
                  { key: 'line', label: 'Line' },
                  { key: 'area', label: 'Area' },
                  { key: 'bar', label: 'Bar' }
                ].map(option => (
                  <Button
                    key={option.key}
                    variant={chartType === option.key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartType(option.key)}
                    className={chartType === option.key 
                      ? 'bg-zinc-600 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600' 
                      : 'border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className={`text-sm ${theme.colors.text.tertiary}`}>
            Showing data from the last {timeWindow / 60000} minutes ({chartData.length} data points)
            <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded text-xs">
              <strong>Note:</strong> Navigation tracking has been disabled for safety. Previous implementation 
              caused system interference and core application functionality issues.
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart Display */}
      <Card className={`${theme.colors.background.card} ${theme.colors.border.primary}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {config.icon}
            {config.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderChart()}
          
          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
            {config.dataKeys.map(dataKey => (
              <div key={dataKey.key} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: dataKey.color }}
                />
                <span className="text-sm">{dataKey.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chart Statistics */}
      {chartData.length > 0 && (
        <Card className={`${theme.colors.background.card} ${theme.colors.border.primary}`}>
          <CardHeader>
            <CardTitle>Chart Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className={`text-sm ${theme.colors.text.tertiary}`}>Data Points</p>
                <p className="text-xl font-bold">{chartData.length}</p>
              </div>
              <div>
                <p className={`text-sm ${theme.colors.text.tertiary}`}>Time Range</p>
                <p className="text-xl font-bold">{timeWindow / 60000}min</p>
              </div>
              <div>
                <p className={`text-sm ${theme.colors.text.tertiary}`}>Latest Update</p>
                <p className="text-xl font-bold">
                  {chartData.length > 0 ? chartData[chartData.length - 1].time : 'N/A'}
                </p>
              </div>
              <div>
                <p className={`text-sm ${theme.colors.text.tertiary}`}>Chart Type</p>
                <Badge variant="outline" className="text-xl border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300">
                  {chartType.charAt(0).toUpperCase() + chartType.slice(1)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}