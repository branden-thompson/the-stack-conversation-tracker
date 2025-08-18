/**
 * Metrics Dashboard Component
 * 
 * Displays comprehensive performance metrics in an organized dashboard layout
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Zap, 
  MemoryStick, 
  Network, 
  Database,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { THEME } from '@/lib/utils/ui-constants';

export default function MetricsDashboard({ realtimeData, metrics, summary }) {
  if (!realtimeData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className={`${THEME.colors.background.card} ${THEME.colors.border.primary}`}>
          <CardHeader>
            <CardTitle>Loading Performance Data...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`${THEME.colors.text.tertiary}`}>Collecting metrics...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getTrendIcon = (current, previous) => {
    if (!previous) return <Minus className={`h-4 w-4 ${THEME.colors.text.tertiary}`} />;
    if (current > previous) return <TrendingUp className={`h-4 w-4 ${THEME.colors.status.error.icon}`} />;
    if (current < previous) return <TrendingDown className={`h-4 w-4 ${THEME.colors.status.success.icon}`} />;
    return <Minus className={`h-4 w-4 ${THEME.colors.text.tertiary}`} />;
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // API Performance Section
  const ApiPerformanceCard = () => (
    <Card className={`${THEME.colors.background.card} ${THEME.colors.border.primary}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          API Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {realtimeData.api ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${THEME.colors.text.tertiary}`}>Average Response Time</p>
                <p className="text-xl font-semibold">{realtimeData.api.averageResponseTime.toFixed(0)}ms</p>
              </div>
              <div>
                <p className={`text-sm ${THEME.colors.text.tertiary}`}>Total Requests</p>
                <p className="text-xl font-semibold">{realtimeData.api.totalRequests}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${THEME.colors.text.tertiary}`}>Fastest Request</p>
                <p className={`text-lg font-medium ${THEME.colors.status.success.text}`}>{realtimeData.api.fastestRequest.toFixed(0)}ms</p>
              </div>
              <div>
                <p className={`text-sm ${THEME.colors.text.tertiary}`}>Slowest Request</p>
                <p className={`text-lg font-medium ${THEME.colors.status.warning.text}`}>{realtimeData.api.slowestRequest.toFixed(0)}ms</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <p className={`text-sm ${THEME.colors.text.tertiary}`}>Error Rate</p>
                <Badge className={realtimeData.api.errorRate > 0.05 
                  ? `${THEME.colors.status.error.bg} ${THEME.colors.status.error.border} ${THEME.colors.status.error.text}` 
                  : `${THEME.colors.status.success.bg} ${THEME.colors.status.success.border} ${THEME.colors.status.success.text}`
                }>
                  {(realtimeData.api.errorRate * 100).toFixed(1)}%
                </Badge>
              </div>
              <Progress value={realtimeData.api.errorRate * 100} className="h-2" />
            </div>

            {realtimeData.api.endpointBreakdown && (
              <div>
                <p className="text-sm font-medium mb-2">Endpoint Performance</p>
                <div className="space-y-2">
                  {Object.entries(realtimeData.api.endpointBreakdown).map(([endpoint, stats]) => (
                    <div key={endpoint} className="flex justify-between items-center text-sm">
                      <span className="font-mono">{endpoint}</span>
                      <div className="flex items-center gap-2">
                        <span>{stats.count} calls</span>
                        <span className={`${THEME.colors.text.tertiary}`}>
                          {(stats.totalTime / stats.count).toFixed(0)}ms avg
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className={`${THEME.colors.text.tertiary}`}>No API metrics available</p>
        )}
      </CardContent>
    </Card>
  );

  // Navigation Performance Section - DISABLED FOR SAFETY
  // Navigation tracking has been intentionally disabled due to previous system interference issues
  // that caused core application functionality to break. This was a root cause of API runaways
  // and card flipping problems. Keeping this as an informational card.
  const NavigationInfoCard = () => (
    <Card className={`${THEME.colors.background.card} ${THEME.colors.border.primary} opacity-75`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MemoryStick className={`h-5 w-5 ${THEME.colors.text.tertiary}`} />
          Navigation Tracking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Badge variant="outline" className="bg-orange-50 dark:bg-orange-950 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800">
            Safety Disabled
          </Badge>
          <p className={`text-sm ${THEME.colors.text.tertiary}`}>
            Navigation performance tracking has been disabled to prevent system interference.
            Previous implementation caused core application features to malfunction.
          </p>
          <div className={`text-xs ${THEME.colors.text.muted} bg-gray-50 dark:bg-gray-800 p-3 rounded`}>
            <strong>Focus Areas:</strong>
            <ul className="mt-1 space-y-1">
              <li>• API Performance (working reliably)</li>
              <li>• Memory Usage (safe monitoring)</li>
              <li>• System Health (no interference)</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Memory Usage Section
  const MemoryUsageCard = () => (
    <Card className={`${THEME.colors.background.card} ${THEME.colors.border.primary}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MemoryStick className="h-5 w-5" />
          Memory Usage
        </CardTitle>
      </CardHeader>
      <CardContent>
        {realtimeData.memory ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${THEME.colors.text.tertiary}`}>Current Usage</p>
                <p className="text-xl font-semibold">{formatBytes(realtimeData.memory.currentUsage)}</p>
              </div>
              <div>
                <p className={`text-sm ${THEME.colors.text.tertiary}`}>Peak Usage</p>
                <p className="text-xl font-semibold">{formatBytes(realtimeData.memory.peakUsage)}</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <p className={`text-sm ${THEME.colors.text.tertiary}`}>Memory Trend</p>
                <div className="flex items-center gap-1">
                  {getTrendIcon(realtimeData.memory.currentUsage, realtimeData.memory.averageUsage)}
                  <span className="text-sm">
                    {realtimeData.memory.trend > 0 ? '+' : ''}{formatBytes(realtimeData.memory.trend)}
                  </span>
                </div>
              </div>
              <div className={`text-sm ${THEME.colors.text.tertiary}`}>
                Average: {formatBytes(realtimeData.memory.averageUsage)} | 
                Measurements: {realtimeData.memory.measurements}
              </div>
            </div>

            {/* Memory usage bar */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Memory Usage</span>
                <span>{((realtimeData.memory.currentUsage / realtimeData.memory.peakUsage) * 100).toFixed(1)}% of peak</span>
              </div>
              <Progress 
                value={(realtimeData.memory.currentUsage / realtimeData.memory.peakUsage) * 100} 
                className="h-2"
              />
            </div>
          </div>
        ) : (
          <p className={`${THEME.colors.text.tertiary}`}>No memory metrics available</p>
        )}
      </CardContent>
    </Card>
  );

  // System Overview Section
  const SystemOverviewCard = () => (
    <Card className={`${THEME.colors.background.card} ${THEME.colors.border.primary}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          System Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className={`text-sm ${THEME.colors.text.tertiary}`}>Total Metrics</p>
              <p className="text-xl font-semibold">{realtimeData.totalMetrics}</p>
            </div>
            <div>
              <p className={`text-sm ${THEME.colors.text.tertiary}`}>Time Window</p>
              <p className="text-xl font-semibold">{realtimeData.timeWindow / 60000}min</p>
            </div>
          </div>

          {realtimeData.monitoring && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Monitoring Status</span>
                <Badge 
                  variant={realtimeData.monitoring.enabled ? 'default' : 'secondary'}
                  className={realtimeData.monitoring.enabled 
                    ? 'bg-zinc-600 dark:bg-zinc-700 text-white' 
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                  }
                >
                  {realtimeData.monitoring.enabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              
              {realtimeData.monitoring.overhead && (
                <div className={`text-xs ${THEME.colors.text.tertiary}`}>
                  Overhead: {realtimeData.monitoring.overhead.averageCollectionTime?.toFixed(2)}ms avg,
                  {' '}{realtimeData.monitoring.overhead.totalCollectionTime?.toFixed(0)}ms total
                </div>
              )}
              
              {realtimeData.monitoring.sessionId && (
                <div className={`text-xs ${THEME.colors.text.tertiary}`}>
                  Session: {realtimeData.monitoring.sessionId.slice(-12)}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ApiPerformanceCard />
      <NavigationInfoCard />
      <MemoryUsageCard />
      <SystemOverviewCard />
    </div>
  );
}