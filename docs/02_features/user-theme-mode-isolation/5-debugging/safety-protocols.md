# User Theme Mode Isolation - Safety Protocols

**Feature**: User Theme Mode Isolation  
**Date**: 2025-08-21  
**SEV Level**: SEV-0 (System Stability Critical)

## Multi-Layer Safety Architecture

### **LAYER 1: INSTANT FEATURE DISABLE (0-5 seconds)**

#### Environment Feature Flag
```bash
# Instant disable via environment variable
NEXT_PUBLIC_ENABLE_USER_THEME_ISOLATION=false

# Or via runtime localStorage (for emergency)
localStorage.setItem('user_theme_isolation_disabled', 'true');
```

#### Automatic Feature Detection
```typescript
const isUserThemeIsolationEnabled = () => {
  // Check environment flag
  if (process.env.NEXT_PUBLIC_ENABLE_USER_THEME_ISOLATION !== 'true') {
    return false;
  }
  
  // Check emergency disable flag
  if (typeof window !== 'undefined') {
    const emergencyDisabled = localStorage.getItem('user_theme_isolation_disabled');
    if (emergencyDisabled === 'true') {
      return false;
    }
  }
  
  // Check SSE health status
  if (isSSEConnectionDegraded()) {
    console.warn('[Safety] SSE degradation detected, disabling user theme isolation');
    return false;
  }
  
  return true;
};
```

#### Emergency Disable Mechanism
```typescript
// Global emergency disable function
window.emergencyDisableUserThemeIsolation = () => {
  localStorage.setItem('user_theme_isolation_disabled', 'true');
  localStorage.setItem('theme_emergency_disable_reason', 'manual_emergency_disable');
  localStorage.setItem('theme_emergency_disable_time', Date.now().toString());
  
  // Force reload to apply changes
  window.location.reload();
};

// Expose in dev tools for debugging
if (process.env.NODE_ENV === 'development') {
  window.themeEmergencyControls = {
    disable: window.emergencyDisableUserThemeIsolation,
    enable: () => {
      localStorage.removeItem('user_theme_isolation_disabled');
      window.location.reload();
    },
    status: isUserThemeIsolationEnabled
  };
}
```

### **LAYER 2: GRACEFUL DEGRADATION (5-30 seconds)**

#### Error Boundary Protection
```jsx
class ThemeIsolationErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorCount: 0 };
  }

  static getDerivedStateFromError(error) {
    console.error('[ThemeIsolation] Error boundary caught:', error);
    return { hasError: true, errorCount: this.state?.errorCount + 1 || 1 };
  }

  componentDidCatch(error, errorInfo) {
    // Log error for monitoring
    console.error('[ThemeIsolation] Component error:', error, errorInfo);
    
    // Auto-disable if too many errors
    if (this.state.errorCount >= 3) {
      console.error('[ThemeIsolation] Too many errors, disabling feature');
      localStorage.setItem('user_theme_isolation_disabled', 'true');
      localStorage.setItem('theme_emergency_disable_reason', 'error_boundary_triggered');
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback to existing theme behavior
      return (
        <ThemeProvider {...this.props.nextThemesConfig}>
          <DynamicThemeProvider {...this.props.dynamicThemeConfig}>
            {this.props.children}
          </DynamicThemeProvider>
        </ThemeProvider>
      );
    }

    return this.props.children;
  }
}
```

#### Automatic Fallback Provider
```jsx
// Safe UserThemeProvider with automatic fallback
export function SafeUserThemeProvider({ children, ...props }) {
  const [fallbackMode, setFallbackMode] = useState(false);
  
  useEffect(() => {
    // Monitor for theme-related errors
    const handleError = (event) => {
      if (event.error?.message?.includes('theme') || 
          event.error?.stack?.includes('UserTheme')) {
        console.warn('[Safety] Theme error detected, enabling fallback mode');
        setFallbackMode(true);
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (!isUserThemeIsolationEnabled() || fallbackMode) {
    // Fallback to existing theme behavior
    return children;
  }

  return (
    <ThemeIsolationErrorBoundary>
      <UserThemeProvider {...props}>
        {children}
      </UserThemeProvider>
    </ThemeIsolationErrorBoundary>
  );
}
```

### **LAYER 3: SSE CONNECTION PROTECTION**

#### SSE Health Monitoring
```typescript
// SSE Connection State Tracker
class SSEHealthMonitor {
  private connections: Map<string, SSEConnectionHealth> = new Map();
  private healthCheckInterval: NodeJS.Timeout | null = null;

  startMonitoring() {
    this.healthCheckInterval = setInterval(() => {
      this.checkSSEHealth();
    }, 5000); // Check every 5 seconds
  }

  recordConnectionState(connectionId: string) {
    this.connections.set(connectionId, {
      isConnected: true,
      lastHeartbeat: Date.now(),
      errorCount: 0,
      lastError: null
    });
  }

  checkSSEHealth(): boolean {
    for (const [id, health] of this.connections.entries()) {
      // Check for stale connections
      if (Date.now() - health.lastHeartbeat > 30000) {
        console.warn(`[SSEHealth] Connection ${id} appears stale`);
        return false;
      }
      
      // Check error rate
      if (health.errorCount > 5) {
        console.warn(`[SSEHealth] Connection ${id} has high error rate`);
        return false;
      }
    }
    
    return true;
  }

  onThemeChange(callback: () => void) {
    const healthBefore = this.checkSSEHealth();
    
    callback();
    
    // Wait for SSE validation period
    setTimeout(() => {
      const healthAfter = this.checkSSEHealth();
      
      if (healthBefore && !healthAfter) {
        console.error('[Safety] SSE health degraded after theme change');
        this.triggerThemeRollback();
      }
    }, 2000);
  }

  triggerThemeRollback() {
    console.error('[Safety] Triggering theme isolation rollback due to SSE issues');
    localStorage.setItem('user_theme_isolation_disabled', 'true');
    localStorage.setItem('theme_emergency_disable_reason', 'sse_health_degradation');
    
    // Notify user (optional)
    if (window.confirm('Theme system detected connection issues. Disable advanced theming?')) {
      window.location.reload();
    }
  }
}

const sseHealthMonitor = new SSEHealthMonitor();
```

#### Protected Theme Operations
```typescript
// Wrap all theme operations with SSE protection
const protectedThemeOperation = async (operation: () => void | Promise<void>) => {
  const connectionsBefore = sseHealthMonitor.getConnectionCount();
  
  try {
    // Record SSE state before theme change
    sseHealthMonitor.recordPreThemeState();
    
    // Execute theme operation
    await operation();
    
    // Wait for system stability
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validate SSE connections are still healthy
    const connectionsAfter = sseHealthMonitor.getConnectionCount();
    if (connectionsAfter < connectionsBefore) {
      throw new Error(`SSE connections dropped: ${connectionsBefore} -> ${connectionsAfter}`);
    }
    
    const healthStatus = sseHealthMonitor.validateHealth();
    if (!healthStatus.healthy) {
      throw new Error(`SSE health degraded: ${healthStatus.reason}`);
    }
    
  } catch (error) {
    console.error('[Safety] Theme operation caused SSE issues:', error);
    
    // Auto-disable if SSE is affected
    sseHealthMonitor.triggerThemeRollback();
    
    throw error;
  }
};

// Apply protection to all theme changes
export const safeSetUserThemeMode = (userId: string, mode: string) => {
  return protectedThemeOperation(() => {
    setUserThemeMode(userId, mode);
  });
};
```

### **LAYER 4: PERFORMANCE CIRCUIT BREAKERS**

#### Performance Monitoring
```typescript
// Performance thresholds and monitoring
const PERFORMANCE_THRESHOLDS = {
  THEME_SWITCH_MAX_TIME: 200, // ms
  MEMORY_GROWTH_LIMIT: 5 * 1024 * 1024, // 5MB
  ERROR_RATE_LIMIT: 0.1, // 10%
  STORAGE_SIZE_LIMIT: 1024 * 1024 // 1MB
};

class ThemePerformanceMonitor {
  private metrics: ThemeMetrics = {
    themeSwitchTimes: [],
    errorCount: 0,
    totalOperations: 0,
    memoryBaseline: 0
  };

  recordThemeSwitch(startTime: number, endTime: number) {
    const duration = endTime - startTime;
    this.metrics.themeSwitchTimes.push(duration);
    this.metrics.totalOperations++;
    
    // Keep only recent measurements
    if (this.metrics.themeSwitchTimes.length > 100) {
      this.metrics.themeSwitchTimes = this.metrics.themeSwitchTimes.slice(-50);
    }
    
    // Check performance threshold
    if (duration > PERFORMANCE_THRESHOLDS.THEME_SWITCH_MAX_TIME) {
      console.warn(`[Performance] Slow theme switch: ${duration}ms`);
      this.checkPerformanceHealth();
    }
  }

  recordError() {
    this.metrics.errorCount++;
    this.checkPerformanceHealth();
  }

  checkPerformanceHealth(): boolean {
    const avgSwitchTime = this.metrics.themeSwitchTimes.reduce((a, b) => a + b, 0) 
                         / this.metrics.themeSwitchTimes.length;
    
    const errorRate = this.metrics.errorCount / Math.max(1, this.metrics.totalOperations);
    
    // Performance degradation checks
    if (avgSwitchTime > PERFORMANCE_THRESHOLDS.THEME_SWITCH_MAX_TIME) {
      this.triggerPerformanceRollback('slow_theme_switching');
      return false;
    }
    
    if (errorRate > PERFORMANCE_THRESHOLDS.ERROR_RATE_LIMIT) {
      this.triggerPerformanceRollback('high_error_rate');
      return false;
    }
    
    // Memory usage check (if available)
    if ('memory' in performance) {
      const currentMemory = (performance as any).memory.usedJSHeapSize;
      if (currentMemory > this.metrics.memoryBaseline + PERFORMANCE_THRESHOLDS.MEMORY_GROWTH_LIMIT) {
        this.triggerPerformanceRollback('memory_growth');
        return false;
      }
    }
    
    return true;
  }

  triggerPerformanceRollback(reason: string) {
    console.error(`[Performance] Triggering rollback due to: ${reason}`);
    localStorage.setItem('user_theme_isolation_disabled', 'true');
    localStorage.setItem('theme_emergency_disable_reason', `performance_${reason}`);
    
    // Optional: Show user notification
    console.warn('[Performance] Theme isolation disabled due to performance issues');
  }
}

const performanceMonitor = new ThemePerformanceMonitor();
```

### **LAYER 5: ROLLBACK EXECUTION PLANS**

#### Immediate Rollback (0-30 seconds)
```bash
# Emergency script for immediate disable
#!/bin/bash
echo "🚨 EMERGENCY THEME ROLLBACK INITIATED"

# 1. Set environment flag
export NEXT_PUBLIC_ENABLE_USER_THEME_ISOLATION=false

# 2. Update config if needed
sed -i 's/ENABLE_USER_THEME_ISOLATION=true/ENABLE_USER_THEME_ISOLATION=false/' .env.local

# 3. Restart dev server or trigger rebuild
echo "🔄 Restarting server with theme isolation disabled..."
```

#### Component Rollback (30 seconds - 5 minutes)
```typescript
// Rollback UserThemeProvider integration
const rollbackProviderIntegration = () => {
  // 1. Comment out UserThemeProvider in app/providers.jsx
  // 2. Restore original provider hierarchy
  // 3. Clear localStorage flags
  
  localStorage.setItem('theme_rollback_active', 'true');
  localStorage.removeItem('user_theme_isolation_disabled');
  
  // Force refresh to apply changes
  window.location.reload();
};
```

#### Data Preservation Strategy
```typescript
// Preserve user theme preferences for future re-enable
const preserveThemeData = () => {
  const themeBackup: Record<string, string> = {};
  
  // Collect all user theme data
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.includes('_theme_mode')) {
      themeBackup[key] = localStorage.getItem(key) || '';
    }
  }
  
  // Store in backup location
  localStorage.setItem('user_theme_backup', JSON.stringify(themeBackup));
  localStorage.setItem('theme_backup_timestamp', Date.now().toString());
};

// Restore theme data after fix
const restoreThemeData = () => {
  const backup = localStorage.getItem('user_theme_backup');
  if (backup) {
    const themeData = JSON.parse(backup);
    Object.entries(themeData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  }
};
```

## Monitoring and Alerting

### **Real-Time Health Dashboard**
```typescript
// Debug panel for monitoring theme system health
const ThemeHealthDashboard = () => {
  const [health, setHealth] = useState<ThemeHealthStatus | null>(null);
  
  useEffect(() => {
    const updateHealth = () => {
      setHealth({
        featureEnabled: isUserThemeIsolationEnabled(),
        sseConnections: sseHealthMonitor.getConnectionCount(),
        avgSwitchTime: performanceMonitor.getAverageTime(),
        errorRate: performanceMonitor.getErrorRate(),
        lastError: localStorage.getItem('theme_last_error'),
        storageUsage: getThemeStorageUsage()
      });
    };
    
    const interval = setInterval(updateHealth, 1000);
    return () => clearInterval(interval);
  }, []);
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded">
      <h3>Theme System Health</h3>
      <div>Status: {health?.featureEnabled ? '✅ Enabled' : '❌ Disabled'}</div>
      <div>SSE Connections: {health?.sseConnections}</div>
      <div>Avg Switch Time: {health?.avgSwitchTime}ms</div>
      <div>Error Rate: {((health?.errorRate || 0) * 100).toFixed(1)}%</div>
      {health?.lastError && <div>Last Error: {health.lastError}</div>}
    </div>
  );
};
```

### **Automated Error Reporting**
```typescript
// Automated error reporting to monitoring system
const reportThemeError = (error: Error, context: string) => {
  const errorReport = {
    timestamp: Date.now(),
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name
    },
    context,
    userAgent: navigator.userAgent,
    url: window.location.href,
    userId: getCurrentUser()?.id,
    featureFlags: {
      themeIsolationEnabled: isUserThemeIsolationEnabled(),
      sseEnabled: isSSEEnabled()
    },
    systemHealth: {
      sseConnections: sseHealthMonitor.getConnectionCount(),
      themePerformance: performanceMonitor.getMetrics()
    }
  };
  
  // Send to monitoring service (implement based on your monitoring setup)
  console.error('[ThemeError]', errorReport);
  
  // Store locally for debugging
  localStorage.setItem('theme_last_error', JSON.stringify(errorReport));
};
```

## Success Metrics and Validation

### **Safety Validation Checklist**
- [ ] Feature flag disable works within 5 seconds
- [ ] SSE connections remain stable during theme operations
- [ ] Error boundary catches and recovers from theme failures
- [ ] Performance circuit breakers activate on degradation
- [ ] User data preserved during rollback operations
- [ ] Emergency controls accessible via dev tools
- [ ] Monitoring dashboard shows accurate health status
- [ ] Automated error reporting captures sufficient context

### **Pre-Deployment Safety Tests**
1. **Feature Flag Test**: Disable/enable feature flag and verify behavior
2. **SSE Stability Test**: Monitor SSE during rapid theme switching
3. **Error Injection Test**: Simulate theme errors and verify recovery
4. **Performance Stress Test**: Rapid theme switching under load
5. **Rollback Test**: Execute full rollback and verify system recovery
6. **Data Preservation Test**: Verify user preferences survive rollback

---

**Safety Protocol Status**: ✅ **COMPREHENSIVE SAFETY ARCHITECTURE COMPLETE**  
**Risk Level**: Reduced from SEV-0 to manageable with multi-layer protection  
**Ready for**: Implementation with confidence in system stability