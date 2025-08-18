/**
 * Safety Switch Management Dev Page
 * 
 * Provides real-time control over safety switches and circuit breakers
 * for debugging and emergency system control.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [switches, setSwitches] = useState({});
  const [circuitStats, setCircuitStats] = useState({});
  const [refreshInterval, setRefreshInterval] = useState(null);

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

  const getSwitchColor = (enabled) => enabled ? 'text-green-600' : 'text-red-600';
  const getCircuitColor = (state) => {
    switch (state) {
      case 'CLOSED': return 'text-green-600';
      case 'HALF_OPEN': return 'text-yellow-600';
      case 'OPEN': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          🔧 Safety Switch Control Panel
        </h1>
        <p className="text-gray-700">
          Monitor and control application safety switches and circuit breakers.
          <br />
          <strong>⚠️ Use with caution:</strong> Disabling switches may affect application functionality.
        </p>
      </div>

      {/* Emergency Controls */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-red-900 mb-3">🚨 Emergency Controls</h2>
        <div className="flex gap-4">
          <button
            onClick={handleEmergencyDisable}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-medium"
          >
            Emergency Disable All
          </button>
          <button
            onClick={handleEmergencyRecover}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium"
          >
            Emergency Recover
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Safety Switches */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">⚡ Safety Switches</h2>
          <div className="space-y-3">
            {Object.entries(switches).map(([switchName, enabled]) => (
              <div key={switchName} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <div className="font-medium text-gray-900 capitalize">
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
                    enabled ? 'bg-green-500' : 'bg-gray-300'
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
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">🔌 Circuit Breakers</h2>
          <div className="space-y-4">
            {Object.entries(circuitStats).map(([breakerName, stats]) => (
              <div key={breakerName} className="p-3 bg-gray-50 rounded">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900 capitalize">
                    {breakerName}
                  </div>
                  <div className={`text-sm font-semibold ${getCircuitColor(stats.state)}`}>
                    {stats.state}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                  <div>Total: {stats.totalRequests}</div>
                  <div>Success: {stats.successCount}</div>
                  <div>Failures: {stats.failureCount}</div>
                  <div>Rate: {stats.failureRate}%</div>
                </div>

                {stats.state === 'OPEN' && (
                  <div className="text-xs text-red-600 mb-2">
                    Next attempt: {stats.nextAttemptTime 
                      ? new Date(stats.nextAttemptTime).toLocaleTimeString()
                      : 'Unknown'
                    }
                  </div>
                )}

                <button
                  onClick={() => handleCircuitBreakerReset(breakerName)}
                  className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                >
                  Reset
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Status */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">📊 System Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="font-medium text-blue-900">Active Switches</div>
            <div className="text-blue-700">
              {Object.values(switches).filter(Boolean).length} / {Object.keys(switches).length}
            </div>
          </div>
          <div>
            <div className="font-medium text-blue-900">Circuit Breakers</div>
            <div className="text-blue-700">
              {Object.values(circuitStats).filter(s => s.state === 'CLOSED').length} Closed
            </div>
          </div>
          <div>
            <div className="font-medium text-blue-900">Open Circuits</div>
            <div className="text-blue-700">
              {Object.values(circuitStats).filter(s => s.state === 'OPEN').length}
            </div>
          </div>
          <div>
            <div className="font-medium text-blue-900">Last Update</div>
            <div className="text-blue-700">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">📖 Instructions</h2>
        <div className="text-sm text-gray-700 space-y-2">
          <p><strong>Safety Switches:</strong> Toggle individual system components on/off. Changes are applied immediately.</p>
          <p><strong>Circuit Breakers:</strong> Monitor automatic failure detection. Open circuits block operations to prevent cascading failures.</p>
          <p><strong>Emergency Disable:</strong> Instantly disables all systems. Use only in critical situations.</p>
          <p><strong>Environment Variables:</strong> Add NEXT_PUBLIC_*_ENABLED=false to .env.local for persistent disables.</p>
        </div>
      </div>
    </div>
  );
}