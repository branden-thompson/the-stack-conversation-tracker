/**
 * Performance Monitoring Dashboard
 * 
 * Real-time performance monitoring page with comprehensive metrics,
 * load testing capabilities, and health monitoring.
 */

'use client';

import { useState, useEffect } from 'react';
import { DevHeader } from '@/components/ui/dev-header';
import { LeftTray } from '@/components/ui/left-tray';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Monitor, 
  Clock, 
  MemoryStick, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Play,
  Square,
  TrendingUp
} from 'lucide-react';
import { THEME } from '@/lib/utils/ui-constants';
import usePerformanceMonitor from '@/lib/hooks/usePerformanceMonitor';

// Performance metrics dashboard components
import MetricsDashboard from './components/MetricsDashboard';
import LoadTestControls from './components/LoadTestControls';
import HealthMonitor from './components/HealthMonitor';
import PerformanceChart from './components/PerformanceChart';

export default function PerformancePage() {
  const {
    isEnabled,
    summary,
    metrics,
    overheadImpact,
    circuitBreakerStatus,
    emergencyDisabled,
    toggleMonitoring,
    emergencyDisable,
    getPerformanceSummary,
    getHealthStatus,
    flushMetrics
  } = usePerformanceMonitor();

  const [realtimeData, setRealtimeData] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [isLoadTesting, setIsLoadTesting] = useState(false);
  const [selectedTimeWindow, setSelectedTimeWindow] = useState(300000); // 5 minutes
  const [trayOpen, setTrayOpen] = useState(false);

  // Update real-time data periodically
  useEffect(() => {
    if (!isEnabled) return;

    const updateData = () => {
      const performanceSummary = getPerformanceSummary(selectedTimeWindow);
      const health = getHealthStatus();
      
      setRealtimeData(performanceSummary);
      setHealthStatus(health);
    };

    // Initial update
    updateData();

    // Set up interval for real-time updates
    const interval = setInterval(updateData, 2000); // Every 2 seconds

    return () => clearInterval(interval);
  }, [isEnabled, selectedTimeWindow, getPerformanceSummary, getHealthStatus]);

  // Health status indicator
  const getHealthIndicator = (status) => {
    switch (status) {
      case 'optimal':
        return <Badge className={`${THEME.colors.status.success.bg} ${THEME.colors.status.success.border} ${THEME.colors.status.success.text}`}><CheckCircle className={`w-3 h-3 mr-1 ${THEME.colors.status.success.icon}`} />Optimal</Badge>;
      case 'degraded':
        return <Badge className={`${THEME.colors.status.warning.bg} ${THEME.colors.status.warning.border} ${THEME.colors.status.warning.text}`}><AlertTriangle className={`w-3 h-3 mr-1 ${THEME.colors.status.warning.icon}`} />Degraded</Badge>;
      case 'poor':
        return <Badge className={`${THEME.colors.status.error.bg} ${THEME.colors.status.error.border} ${THEME.colors.status.error.text}`}><XCircle className={`w-3 h-3 mr-1 ${THEME.colors.status.error.icon}`} />Poor</Badge>;
      default:
        return <Badge className={`${THEME.colors.background.secondary} ${THEME.colors.border.primary} ${THEME.colors.text.tertiary}`}>Unknown</Badge>;
    }
  };

  // Quick stats component - focusing on working metrics only
  const QuickStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className={`${THEME.colors.background.card} ${THEME.colors.border.primary}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${THEME.colors.text.tertiary}`}>API Response</p>
              <p className={`text-2xl font-bold ${THEME.colors.text.primary}`}>
                {realtimeData?.api ? `${realtimeData.api.averageResponseTime.toFixed(0)}ms` : '-'}
              </p>
              <p className={`text-xs ${THEME.colors.text.muted} mt-1`}>
                {realtimeData?.api ? `${realtimeData.api.totalRequests} requests` : 'No data'}
              </p>
            </div>
            <Clock className={`h-8 w-8 ${THEME.colors.status.info.icon}`} />
          </div>
        </CardContent>
      </Card>

      <Card className={`${THEME.colors.background.card} ${THEME.colors.border.primary}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${THEME.colors.text.tertiary}`}>Memory Usage</p>
              <p className={`text-2xl font-bold ${THEME.colors.text.primary}`}>
                {realtimeData?.memory ? `${(realtimeData.memory.currentUsage / 1048576).toFixed(1)}MB` : '-'}
              </p>
              <p className={`text-xs ${THEME.colors.text.muted} mt-1`}>
                {realtimeData?.memory ? `Peak: ${(realtimeData.memory.peakUsage / 1048576).toFixed(1)}MB` : 'No data'}
              </p>
            </div>
            <MemoryStick className={`h-8 w-8 ${THEME.colors.text.secondary}`} />
          </div>
        </CardContent>
      </Card>

      <Card className={`${THEME.colors.background.card} ${THEME.colors.border.primary}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${THEME.colors.text.tertiary}`}>System Health</p>
              <div className="mt-1">
                {healthStatus ? getHealthIndicator(healthStatus.status) : <Badge variant="outline">Loading</Badge>}
              </div>
              <p className={`text-xs ${THEME.colors.text.muted} mt-1`}>
                {healthStatus?.issues?.length > 0 ? `${healthStatus.issues.length} issues` : 
                 healthStatus?.warnings?.length > 0 ? `${healthStatus.warnings.length} warnings` : 'All systems normal'}
              </p>
            </div>
            <Activity className={`h-8 w-8 ${THEME.colors.status.success.icon}`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Control panel component
  const ControlPanel = () => (
    <Card className={`mb-6 ${THEME.colors.background.card} ${THEME.colors.border.primary}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Performance Monitoring Controls
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={isEnabled}
              onCheckedChange={toggleMonitoring}
              disabled={emergencyDisabled || (circuitBreakerStatus?.isTripped && !isEnabled)}
              id="monitoring-toggle"
              className="data-[state=checked]:bg-zinc-600 data-[state=unchecked]:bg-zinc-200 dark:data-[state=unchecked]:bg-zinc-700"
            />
            <div className="flex flex-col">
              <label htmlFor="monitoring-toggle" className="text-sm font-medium">
                {emergencyDisabled ? 'Emergency Disabled' : 
                 circuitBreakerStatus?.isTripped ? 'Circuit Breaker Tripped' :
                 isEnabled ? 'Monitoring Enabled' : 'Monitoring Disabled'}
              </label>
              {(emergencyDisabled || circuitBreakerStatus?.isTripped) && (
                <span className="text-xs text-red-600 dark:text-red-400">
                  {emergencyDisabled ? 'Check environment variables or localStorage' :
                   `Tripped due to safety limits (${circuitBreakerStatus?.consecutiveErrors} errors)`}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Time Window:</label>
            <select
              value={selectedTimeWindow}
              onChange={(e) => setSelectedTimeWindow(parseInt(e.target.value))}
              className="text-sm border rounded px-2 py-1"
            >
              <option value={60000}>1 minute</option>
              <option value={300000}>5 minutes</option>
              <option value={900000}>15 minutes</option>
              <option value={3600000}>1 hour</option>
            </select>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => flushMetrics()}
            disabled={!isEnabled}
            className="border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Flush Metrics
          </Button>
          
          {isEnabled && !emergencyDisabled && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={emergencyDisable}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Emergency Stop
            </Button>
          )}

          <div className={`text-sm ${THEME.colors.text.tertiary}`}>
            Session: {summary?.sessionId?.slice(-8) || 'N/A'} | 
            Uptime: {summary?.uptime ? `${Math.round(summary.uptime / 1000)}s` : 'N/A'} |
            Metrics: {metrics?.length || 0}
            {overheadImpact && (
              <> | Overhead: {overheadImpact.averageCollectionTime?.toFixed(2)}ms avg</>
            )}
            {circuitBreakerStatus && (
              <> | Errors: {circuitBreakerStatus.totalErrors}/{circuitBreakerStatus.totalOperations}</>
            )}
          </div>
          
          {isEnabled && (!realtimeData || !realtimeData.api) && (
            <div className={`mt-3 p-3 ${THEME.colors.status.info.bg} border ${THEME.colors.status.info.border} rounded-lg`}>
              <p className={`text-sm ${THEME.colors.status.info.text}`}>
                <strong>Getting Started:</strong> Performance monitoring is active and collecting data. 
                Navigate between pages, make API calls, or use the load testing features to generate metrics. 
                Data will appear within a few seconds of activity.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderContent = () => {
    if (!isEnabled) {
      return (
        <div className="max-w-2xl">
          <Card className={THEME.colors.background.card + ' ' + THEME.colors.border.primary}>
            <CardHeader>
              <CardTitle>Performance Monitoring Disabled</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm ${THEME.colors.text.tertiary} mb-4">
                Enable performance monitoring to track real-time metrics, API performance, 
                navigation timing, and system health.
              </p>
              <Button 
                onClick={() => toggleMonitoring(true)}
                className="bg-zinc-600 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Enable Monitoring
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <ControlPanel />
        <QuickStats />

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className={`${THEME.colors.background.secondary} ${THEME.colors.border.primary} gap-3`}>
            <TabsTrigger value="dashboard" className={`data-[state=active]:${THEME.colors.background.active} data-[state=active]:text-white data-[state=inactive]:${THEME.colors.text.secondary} ${THEME.colors.background.hover}`}>Dashboard</TabsTrigger>
            <TabsTrigger value="health" className={`data-[state=active]:${THEME.colors.background.active} data-[state=active]:text-white data-[state=inactive]:${THEME.colors.text.secondary} ${THEME.colors.background.hover}`}>Health Monitor</TabsTrigger>
            <TabsTrigger value="load-testing" className={`data-[state=active]:${THEME.colors.background.active} data-[state=active]:text-white data-[state=inactive]:${THEME.colors.text.secondary} ${THEME.colors.background.hover}`}>Load Testing</TabsTrigger>
            <TabsTrigger value="charts" className={`data-[state=active]:${THEME.colors.background.active} data-[state=active]:text-white data-[state=inactive]:${THEME.colors.text.secondary} ${THEME.colors.background.hover}`}>Performance Charts</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <MetricsDashboard 
              realtimeData={realtimeData}
              metrics={metrics}
              summary={summary}
            />
          </TabsContent>

          <TabsContent value="health">
            <HealthMonitor 
              healthStatus={healthStatus}
              realtimeData={realtimeData}
            />
          </TabsContent>

          <TabsContent value="load-testing">
            <LoadTestControls 
              onLoadTestStart={() => setIsLoadTesting(true)}
              onLoadTestStop={() => setIsLoadTesting(false)}
              isRunning={isLoadTesting}
            />
          </TabsContent>

          <TabsContent value="charts">
            <PerformanceChart 
              metrics={metrics}
              timeWindow={selectedTimeWindow}
            />
          </TabsContent>
        </Tabs>

        {/* Safety Status and Warnings */}
        {(emergencyDisabled || circuitBreakerStatus?.isTripped || (overheadImpact && overheadImpact.averageCollectionTime > 5)) && (
          <div className="space-y-4">
            {/* Emergency Disabled Warning */}
            {emergencyDisabled && (
              <Card className="border-red-500 bg-red-50 dark:bg-red-950">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">Emergency Controls Active</p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        Performance monitoring is disabled via emergency controls. Check environment variables (NEXT_PUBLIC_PERF_MONITORING_DISABLED) or localStorage flags.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Circuit Breaker Warning */}
            {circuitBreakerStatus?.isTripped && (
              <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">Circuit Breaker Activated</p>
                      <p className="text-sm text-orange-700 dark:text-orange-300">
                        Monitoring was automatically disabled due to safety limits. 
                        {circuitBreakerStatus.consecutiveErrors} consecutive errors detected. 
                        Will auto-recover in {Math.round((300000 - (Date.now() - (circuitBreakerStatus.trippedAt || 0))) / 60000)} minutes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Performance Impact Warning */}
            {overheadImpact && overheadImpact.averageCollectionTime > 5 && (
              <Card className={`${THEME.colors.status.warning.border} ${THEME.colors.status.warning.bg}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`h-5 w-5 ${THEME.colors.status.warning.icon} mt-0.5`} />
                    <div>
                      <p className={`text-sm font-medium ${THEME.colors.status.warning.text}`}>Performance Impact Detected</p>
                      <p className={`text-sm ${THEME.colors.status.warning.text}`}>
                        Monitoring overhead is {overheadImpact.averageCollectionTime.toFixed(2)}ms on average. 
                        {overheadImpact.averageCollectionTime > 10 ? 'Monitoring will be automatically disabled at 15ms average.' :
                         'Consider reducing metrics collection frequency or disabling detailed tracking.'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    );
  };

  // Right controls for DevHeader
  const rightControls = (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => flushMetrics()}
        className="border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        Flush Metrics
      </Button>
      {overheadImpact && overheadImpact.averageCollectionTime > 5 && (
        <Badge variant="secondary" className="bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">High Impact</Badge>
      )}
    </div>
  );

  return (
    <div className={`h-screen flex flex-col ${THEME.colors.background.primary}`}>
      {/* Header */}
      <DevHeader
        onOpenTray={() => setTrayOpen(true)}
        rightControls={rightControls}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="mb-6">
            <h1 className={`text-3xl font-bold mb-2 ${THEME.colors.text.primary}`}>Performance Monitoring</h1>
            <p className={`${THEME.colors.text.secondary}`}>Real-time application performance monitoring and load testing</p>
          </div>

          {renderContent()}
        </div>
      </div>

      {/* Left Tray */}
      <LeftTray
        isOpen={trayOpen}
        onClose={() => setTrayOpen(false)}
        onNewCard={() => {}} // Disabled for dev pages
        onResetLayout={() => {}} // Disabled for dev pages  
        onRefreshCards={() => window.location.reload()}
        title="Dev Ops Center"
      />
    </div>
  );
}