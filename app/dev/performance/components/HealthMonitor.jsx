/**
 * Health Monitor Component
 * 
 * Displays system health status, identifies performance issues,
 * and provides alerts for degraded performance
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Activity,
  Clock,
  Network,
  MemoryStick,
  TrendingUp,
  Shield
} from 'lucide-react';
import { THEME } from '@/lib/utils/ui-constants';

export default function HealthMonitor({ healthStatus, realtimeData }) {
  if (!healthStatus) {
    return (
      <Card className={`${THEME.colors.background.card} ${THEME.colors.border.primary}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`${THEME.colors.text.tertiary}`}>Loading health status...</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'optimal': return `${THEME.colors.status.success.text} ${THEME.colors.status.success.bg} ${THEME.colors.status.success.border}`;
      case 'degraded': return `${THEME.colors.status.warning.text} ${THEME.colors.status.warning.bg} ${THEME.colors.status.warning.border}`;
      case 'poor': return `${THEME.colors.status.error.text} ${THEME.colors.status.error.bg} ${THEME.colors.status.error.border}`;
      default: return `${THEME.colors.text.secondary} ${THEME.colors.background.secondary} ${THEME.colors.border.primary}`;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'optimal': return <CheckCircle className="h-5 w-5" />;
      case 'degraded': return <AlertTriangle className="h-5 w-5" />;
      case 'poor': return <XCircle className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  // Health metrics breakdown
  const getHealthMetrics = () => {
    const metrics = [];
    
    if (realtimeData?.api) {
      metrics.push({
        category: 'API Performance',
        icon: <Network className="h-4 w-4" />,
        value: `${realtimeData.api.averageResponseTime.toFixed(0)}ms`,
        status: realtimeData.api.averageResponseTime > 1000 ? 'poor' : 
                realtimeData.api.averageResponseTime > 500 ? 'degraded' : 'optimal',
        details: `${realtimeData.api.totalRequests} requests, ${(realtimeData.api.errorRate * 100).toFixed(1)}% error rate`
      });
    }
    
    // Navigation metrics intentionally disabled due to previous system interference
    // Previous navigation tracking caused core application functionality to break
    
    if (realtimeData?.memory) {
      const memoryMB = realtimeData.memory.currentUsage / 1048576;
      metrics.push({
        category: 'Memory Usage',
        icon: <MemoryStick className="h-4 w-4" />,
        value: `${memoryMB.toFixed(1)}MB`,
        status: memoryMB > 100 ? 'poor' : memoryMB > 50 ? 'degraded' : 'optimal',
        details: `Peak: ${(realtimeData.memory.peakUsage / 1048576).toFixed(1)}MB, Trend: ${realtimeData.memory.trend > 0 ? '+' : ''}${(realtimeData.memory.trend / 1048576).toFixed(1)}MB`
      });
    }
    
    return metrics;
  };

  const healthMetrics = getHealthMetrics();

  return (
    <div className="space-y-6">
      {/* Overall Health Status */}
      <Card className={`border-2 ${getStatusColor(healthStatus.status)}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(healthStatus.status)}
            System Health: {healthStatus.status.charAt(0).toUpperCase() + healthStatus.status.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm ${THEME.colors.text.tertiary} mb-4">
            Last checked: {new Date(healthStatus.checkedAt).toLocaleTimeString()}
          </p>
          
          {healthStatus.issues && healthStatus.issues.length > 0 && (
            <Alert className="mb-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Issues detected:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {healthStatus.issues.map((issue, index) => (
                    <li key={index} className="text-sm">{issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {healthStatus.warnings && healthStatus.warnings.length > 0 && (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Warnings:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {healthStatus.warnings.map((warning, index) => (
                    <li key={index} className="text-sm">{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {healthStatus.status === 'optimal' && (
            <div className={`flex items-center gap-2 ${THEME.colors.status.success.text}`}>
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">All systems operating normally</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {healthMetrics.map((metric, index) => (
          <Card key={index} className={`${THEME.colors.background.card} border ${getStatusColor(metric.status)}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {metric.icon}
                  <span className="text-sm font-medium">{metric.category}</span>
                </div>
                <Badge 
                  variant={metric.status === 'optimal' ? 'default' : 
                          metric.status === 'degraded' ? 'secondary' : 'destructive'}
                >
                  {metric.status}
                </Badge>
              </div>
              <p className="text-xl font-bold mb-1">{metric.value}</p>
              <p className={`text-xs ${THEME.colors.text.tertiary}`}>{metric.details}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Recommendations */}
      {(healthStatus.issues?.length > 0 || healthStatus.warnings?.length > 0) && (
        <Card className={`${THEME.colors.background.card} ${THEME.colors.border.primary}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {healthStatus.issues?.includes('High API response times detected') && (
                <div className={`p-3 ${THEME.colors.status.error.bg} border ${THEME.colors.status.error.border} rounded-md`}>
                  <p className={`text-sm font-medium ${THEME.colors.status.error.text}`}>API Performance Issue</p>
                  <p className={`text-sm ${THEME.colors.status.error.text}`}>Consider optimizing API endpoints, adding caching, or checking server resources.</p>
                </div>
              )}
              
              {/* Navigation performance issue alerts removed - tracking disabled for safety */}
              
              {healthStatus.issues?.includes('High memory usage detected') && (
                <div className={`p-3 ${THEME.colors.status.error.bg} border ${THEME.colors.status.error.border} rounded-md`}>
                  <p className={`text-sm font-medium ${THEME.colors.status.error.text}`}>Memory Usage Issue</p>
                  <p className={`text-sm ${THEME.colors.status.error.text}`}>Look for memory leaks, large data structures, or inefficient component rerenders.</p>
                </div>
              )}
              
              {healthStatus.warnings?.includes('Elevated API response times') && (
                <div className={`p-3 ${THEME.colors.status.warning.bg} border ${THEME.colors.status.warning.border} rounded-md`}>
                  <p className={`text-sm font-medium ${THEME.colors.status.warning.text}`}>API Performance Warning</p>
                  <p className={`text-sm ${THEME.colors.status.warning.text}`}>Monitor API performance closely. Consider preemptive optimizations.</p>
                </div>
              )}
              
              {/* Navigation performance warning alerts removed - tracking disabled for safety */}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historical Health Summary */}
      {healthStatus.summary && (
        <Card className={`${THEME.colors.background.card} ${THEME.colors.border.primary}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Current Session Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className={`${THEME.colors.text.tertiary}`}>Monitoring Duration</p>
                <p className="font-medium">{Math.round(healthStatus.summary.timeWindow / 60000)} minutes</p>
              </div>
              <div>
                <p className={`${THEME.colors.text.tertiary}`}>Total Metrics</p>
                <p className="font-medium">{healthStatus.summary.totalMetrics}</p>
              </div>
              <div>
                <p className={`${THEME.colors.text.tertiary}`}>Session ID</p>
                <p className="font-mono text-xs">{healthStatus.summary.monitoring?.sessionId?.slice(-12) || 'N/A'}</p>
              </div>
              <div>
                <p className={`${THEME.colors.text.tertiary}`}>Generated At</p>
                <p className="font-medium">{new Date(healthStatus.summary.generatedAt).toLocaleTimeString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}