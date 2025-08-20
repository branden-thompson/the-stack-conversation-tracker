# Performance Monitoring Safety Controls

## Overview
This document describes the comprehensive safety controls implemented for the performance monitoring system to prevent data corruption, system interference, and performance degradation.

## Emergency Controls

### Environment Variable Kill Switch
```bash
# Completely disable performance monitoring
NEXT_PUBLIC_PERF_MONITORING_DISABLED=true
```

### Browser-based Emergency Controls
```javascript
// Disable via localStorage (persists across page reloads)
localStorage.setItem('perf-monitoring-disabled', 'true');

// Check if emergency disabled
localStorage.getItem('perf-monitoring-disabled') === 'true'
```

### Emergency Stop Button
- Available in `/dev/performance` dashboard
- Immediately disables monitoring and sets localStorage flag
- Prevents accidental re-enabling

## Circuit Breaker System

### Automatic Safety Limits
The system automatically disables monitoring when:
- **Overhead > 10ms**: Average collection time exceeds threshold
- **Memory increase > 50MB**: Memory usage spikes beyond baseline
- **Error rate > 10%**: More than 10% of operations fail
- **Consecutive errors ≥ 5**: Multiple failures in a row

### Circuit Breaker Recovery
- Automatically recovers after 5 minutes if limits are within bounds
- Resets error counters on successful recovery
- Logs recovery status for monitoring

### Manual Recovery
```javascript
// Clear emergency flags (development only)
localStorage.removeItem('perf-monitoring-disabled');
localStorage.removeItem('perf-monitoring-circuit-tripped');
```

## Data Protection Safeguards

### Atomic File Operations
```javascript
// Files are written atomically to prevent corruption
1. Write to temporary file (.tmp)
2. Validate data structure
3. Rename temp file to target (atomic operation)
4. Cleanup on failure
```

### Data Validation
Before writing metrics files, the system validates:
- **File size**: Maximum 10MB per file
- **Session count**: Maximum 500 sessions per day
- **Metrics per session**: Maximum 1000 metrics per session
- **Data structure**: Required fields and types

### Backup System
- Creates `.backup` file before overwriting existing data
- Enables recovery from corruption
- Warns but continues if backup creation fails

### Safety Limits
```javascript
const SAFETY_LIMITS = {
  MAX_FILE_SIZE_MB: 10,
  MAX_METRICS_PER_SESSION: 1000,
  MAX_SESSIONS_PER_DAY: 500,
  MAX_METRIC_SIZE_KB: 100
};
```

## Performance Protection

### Overhead Monitoring
- Tracks time spent in monitoring operations
- Auto-disables if overhead exceeds 15ms average
- Maintains sliding window of last 100 measurements

### Memory Leak Detection
- Monitors memory baseline vs current usage
- Trips circuit breaker on excessive memory growth
- Tracks JS heap size changes

### Request Filtering
- Only monitors `/api/*` requests to avoid tracking dev tools
- Skips external requests and static assets
- Prevents monitoring feedback loops

## Error Handling

### Graceful Degradation
- Monitoring failures don't affect core application
- Errors are logged but don't bubble up
- Circuit breaker prevents cascading failures

### Error Suppression
- First error logged, subsequent similar errors suppressed
- Prevents console spam during failure modes
- Maintains error counters for circuit breaker decisions

## Monitoring Controls

### Dashboard Status Indicators
- Emergency disabled state clearly shown
- Circuit breaker status with recovery countdown
- Real-time overhead and error rate display
- Safety limit warnings before auto-disable

### Manual Controls
- Toggle switch with safety checks
- Emergency stop button for immediate disable
- Flush metrics button (safe when disabled)
- Clear recovery countdown display

## Implementation Details

### Files Modified
1. **`app/api/performance-metrics/route.js`**
   - Added atomic writes with validation
   - Implemented backup system
   - Added comprehensive data validation

2. **`lib/services/performance-monitor.js`**
   - Added circuit breaker system
   - Implemented overhead tracking
   - Added emergency disable checks

3. **`lib/hooks/usePerformanceMonitor.js`**
   - Added emergency control integration
   - Enhanced error handling
   - Added circuit breaker status

4. **`app/dev/performance/page.jsx`**
   - Added safety status displays
   - Implemented emergency controls UI
   - Enhanced warning systems

### Key Functions Added
```javascript
// Data protection
validateMetricsData(data)
safeWriteMetrics(filePath, data)

// Circuit breaker
isCircuitBreakerTripped()
tripCircuitBreaker(reason)
recordOperation(success, type, data)

// Emergency controls
emergencyDisable()
```

## Usage Guidelines

### Development
- Use environment variable for complete disable during debugging
- Monitor overhead metrics during feature development
- Check circuit breaker status if monitoring stops working

### Production Considerations
- Set up external monitoring for circuit breaker trips
- Monitor file system usage for metrics storage
- Consider external APM tools for production workloads

### Troubleshooting
1. **Monitoring not starting**: Check environment variables and localStorage
2. **Frequent circuit breaker trips**: Review error logs and reduce monitoring scope
3. **High overhead warnings**: Consider reducing metrics collection frequency
4. **File corruption**: Check backup files and restore if needed

## Safety Philosophy

### Core Principles
1. **Core app functionality always takes precedence**
2. **Fail safely - disable rather than risk interference**
3. **Provide clear feedback about safety states**
4. **Allow manual override with appropriate warnings**

### Defense in Depth
- Multiple layers of protection (env vars, localStorage, circuit breaker)
- Redundant safety checks at different levels
- Graceful degradation at each layer
- Clear recovery paths

## Testing the Safety Controls

### Manual Tests
```bash
# Test environment disable
NEXT_PUBLIC_PERF_MONITORING_DISABLED=true npm run dev

# Test localStorage disable
# In browser console:
localStorage.setItem('perf-monitoring-disabled', 'true')
# Refresh page

# Test circuit breaker (simulate errors)
# Modify code to force errors and observe auto-disable
```

### Verification
- Dashboard shows correct status for each safety state
- Emergency controls work without page refresh
- File operations are atomic (no corruption on interrupt)
- Circuit breaker recovers automatically after timeout

---

*Last updated: 2025-08-18*  
*These safety controls ensure robust operation while maintaining the ability to quickly disable monitoring if issues arise.*