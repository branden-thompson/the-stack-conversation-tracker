/**
 * Safety Switch Management Dev Page
 * 
 * Provides real-time control over safety switches and circuit breakers
 * for debugging and emergency system control.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { UniversalDevHeader } from '@/components/ui/universal-dev-header';
import { LeftTray } from '@/components/ui/left-tray';
import { useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';
import { 
  useSafetySwitch, 
  getAllSafetySwitches, 
  setSafetySwitch,
  emergencyDisableAll,
  emergencyRecover,
  getAllCircuitBreakerStats,
  circuitBreakers 
} from '@/lib/utils/safety-switches';

export default function SafetyControlPage() {
  const dynamicTheme = useDynamicAppTheme();
  const [switches, setSwitches] = useState({});
  const [circuitStats, setCircuitStats] = useState({});
  const [refreshInterval, setRefreshInterval] = useState(null);
  const [trayOpen, setTrayOpen] = useState(false);

  // Refresh data
  const refreshData = useCallback(() => {
    setSwitches(getAllSafetySwitches());
    setCircuitStats(getAllCircuitBreakerStats());
  }, []);

  // Setup auto-refresh
  useEffect(() => {
    refreshData();
    
    const interval = setInterval(refreshData, 2000); // Refresh every 2 seconds
    setRefreshInterval(interval);
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [refreshData]);

  // Handle switch toggle
  const handleSwitchToggle = useCallback((switchName, enabled) => {
    setSafetySwitch(switchName, enabled);
    setTimeout(refreshData, 100); // Refresh after toggle
  }, [refreshData]);

  // Handle circuit breaker reset
  const handleCircuitBreakerReset = useCallback((breakerName) => {
    if (circuitBreakers[breakerName]) {
      circuitBreakers[breakerName].reset();
      setTimeout(refreshData, 100);
    }
  }, [refreshData]);

  // Emergency controls
  const handleEmergencyDisable = useCallback(() => {
    if (confirm('⚠️ EMERGENCY DISABLE ALL SYSTEMS?\n\nThis will disable all application functionality. Use only in emergencies.')) {
      emergencyDisableAll();
      setTimeout(refreshData, 100);
    }
  }, [refreshData]);

  const handleEmergencyRecover = useCallback(() => {
    emergencyRecover();
    setTimeout(refreshData, 100);
  }, [refreshData]);

  const getSwitchColor = (enabled) => enabled ? dynamicTheme.colors.status.success.text : dynamicTheme.colors.status.error.text;
  const getCircuitColor = (state) => {
    switch (state) {
      case 'CLOSED': return dynamicTheme.colors.status.success.text;
      case 'HALF_OPEN': return dynamicTheme.colors.status.warning.text;
      case 'OPEN': return dynamicTheme.colors.status.error.text;
      default: return dynamicTheme.colors.text.tertiary;
    }
  };

  // Handlers for UniversalDevHeader
  const handleExportAllData = () => {
    const exportData = {
      switches,
      circuitStats,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob(
      [JSON.stringify(exportData, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safety-control-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`h-screen flex flex-col ${dynamicTheme.colors.background.primary}`}>
      {/* Header */}
      <UniversalDevHeader
        onOpenTray={() => setTrayOpen(true)}
        onExportAllData={handleExportAllData}
      />

      {/* Main Content */}
      <div className={`flex-1 overflow-auto p-6 ${dynamicTheme.colors.text.primary}`}>
        <div className="container mx-auto space-y-8">
        {/* Header */}
        <div className={`${dynamicTheme.colors.status.warning.bg} border ${dynamicTheme.colors.status.warning.border} rounded-lg p-4`}>
          <h1 className={`text-2xl font-bold ${dynamicTheme.colors.text.primary} mb-2`}>
            🔧 Safety Switch Control Panel
          </h1>
          <p className={dynamicTheme.colors.text.secondary}>
            Monitor and control application safety switches and circuit breakers.
            <br />
            <strong>⚠️ Use with caution:</strong> Disabling switches may affect application functionality.
          </p>
        </div>

        {/* Emergency Controls */}
        <div className={`${dynamicTheme.colors.status.error.bg} border ${dynamicTheme.colors.status.error.border} rounded-lg p-4`}>
          <h2 className={`text-lg font-semibold ${dynamicTheme.colors.status.error.text} mb-3`}>🚨 Emergency Controls</h2>
        <div className="flex gap-4">
          <button
            onClick={handleEmergencyDisable}
            className={`${dynamicTheme.colors.status.error.bg} hover:opacity-80 text-white px-4 py-2 rounded font-medium border-0`}
          >
            Emergency Disable All
          </button>
          <button
            onClick={handleEmergencyRecover}
            className={`${dynamicTheme.colors.status.success.bg} hover:opacity-80 text-white px-4 py-2 rounded font-medium border-0`}
          >
            Emergency Recover
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Safety Switches */}
          <div className={`${dynamicTheme.colors.background.card} border ${dynamicTheme.colors.border.primary} rounded-lg p-6`}>
            <h2 className={`text-lg font-semibold ${dynamicTheme.colors.text.primary} mb-4`}>⚡ Safety Switches</h2>
          <div className="space-y-3">
            {Object.entries(switches).map(([switchName, enabled]) => (
              <div key={switchName} className={`flex items-center justify-between p-3 ${dynamicTheme.colors.background.tertiary} rounded`}>
                <div>
                  <div className={`font-medium ${dynamicTheme.colors.text.primary} capitalize`}>
                    {switchName.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div className={`text-sm ${getSwitchColor(enabled)}`}>
                    {enabled ? '✅ Enabled' : '❌ Disabled'}
                  </div>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => handleSwitchToggle(switchName, e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`relative w-10 h-6 rounded-full transition-colors ${
                    enabled ? dynamicTheme.colors.status.success.bg : dynamicTheme.colors.background.secondary
                  }`}>
                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      enabled ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Circuit Breakers */}
          <div className={`${dynamicTheme.colors.background.card} border ${dynamicTheme.colors.border.primary} rounded-lg p-6`}>
            <h2 className={`text-lg font-semibold ${dynamicTheme.colors.text.primary} mb-4`}>🔌 Circuit Breakers</h2>
          <div className="space-y-4">
            {Object.entries(circuitStats).map(([breakerName, stats]) => (
              <div key={breakerName} className={`p-3 ${dynamicTheme.colors.background.tertiary} rounded`}>
                <div className="flex items-center justify-between mb-2">
                  <div className={`font-medium ${dynamicTheme.colors.text.primary} capitalize`}>
                    {breakerName}
                  </div>
                  <div className={`text-sm font-semibold ${getCircuitColor(stats.state)}`}>
                    {stats.state}
                  </div>
                </div>
                
                <div className={`grid grid-cols-2 gap-2 text-sm ${dynamicTheme.colors.text.tertiary} mb-2`}>
                  <div>Total: {stats.totalRequests}</div>
                  <div>Success: {stats.successCount}</div>
                  <div>Failures: {stats.failureCount}</div>
                  <div>Rate: {stats.failureRate}%</div>
                </div>

                {stats.state === 'OPEN' && (
                  <div className={`text-xs ${dynamicTheme.colors.status.error.text} mb-2`}>
                    Next attempt: {stats.nextAttemptTime 
                      ? new Date(stats.nextAttemptTime).toLocaleTimeString()
                      : 'Unknown'
                    }
                  </div>
                )}

                <button
                  onClick={() => handleCircuitBreakerReset(breakerName)}
                  className={`text-xs ${dynamicTheme.colors.status.info.bg} hover:opacity-80 text-white px-2 py-1 rounded border-0`}
                >
                  Reset
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Status */}
        <div className={`${dynamicTheme.colors.status.info.bg} border ${dynamicTheme.colors.status.info.border} rounded-lg p-4`}>
          <h2 className={`text-lg font-semibold ${dynamicTheme.colors.status.info.text} mb-2`}>📊 System Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className={`font-medium ${dynamicTheme.colors.text.primary}`}>Active Switches</div>
            <div className={dynamicTheme.colors.text.secondary}>
              {Object.values(switches).filter(Boolean).length} / {Object.keys(switches).length}
            </div>
          </div>
          <div>
            <div className={`font-medium ${dynamicTheme.colors.text.primary}`}>Circuit Breakers</div>
            <div className={dynamicTheme.colors.text.secondary}>
              {Object.values(circuitStats).filter(s => s.state === 'CLOSED').length} Closed
            </div>
          </div>
          <div>
            <div className={`font-medium ${dynamicTheme.colors.text.primary}`}>Open Circuits</div>
            <div className={dynamicTheme.colors.text.secondary}>
              {Object.values(circuitStats).filter(s => s.state === 'OPEN').length}
            </div>
          </div>
          <div>
            <div className={`font-medium ${dynamicTheme.colors.text.primary}`}>Last Update</div>
            <div className={dynamicTheme.colors.text.secondary}>
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

        {/* Instructions */}
        <div className={`${dynamicTheme.colors.background.tertiary} border ${dynamicTheme.colors.border.primary} rounded-lg p-4`}>
          <h2 className={`text-lg font-semibold ${dynamicTheme.colors.text.primary} mb-2`}>📖 Instructions</h2>
          <div className={`text-sm ${dynamicTheme.colors.text.secondary} space-y-2`}>
            <p><strong>Safety Switches:</strong> Toggle individual system components on/off. Changes are applied immediately.</p>
            <p><strong>Circuit Breakers:</strong> Monitor automatic failure detection. Open circuits block operations to prevent cascading failures.</p>
            <p><strong>Emergency Disable:</strong> Instantly disables all systems. Use only in critical situations.</p>
            <p><strong>Environment Variables:</strong> Add NEXT_PUBLIC_*_ENABLED=false to .env.local for persistent disables.</p>
          </div>
        </div>
        </div>
      </div>

      {/* Left Tray */}
      <LeftTray
        isOpen={trayOpen}
        onClose={() => setTrayOpen(false)}
        onNewCard={() => {}} // Disabled for dev pages
        onResetLayout={() => {}} // Disabled for dev pages  
        onRefreshCards={() => window.location.reload()}
        title="Safety Control Panel"
      />
    </div>
  );
}