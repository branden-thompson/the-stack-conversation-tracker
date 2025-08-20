# Real-Time Runtime Performance Monitoring

## Overview

This document outlines the implementation of an in-app real-time performance monitoring system to surface performance metrics, monitor API/service health, and provide load testing capabilities.

## User Requirements

### Core Features
- **Performance Variables Dashboard**: Surface relevant metrics like API polling duration (2s), route resolution times, animation performance
- **API/Service Health Monitoring**: Detect polling runaways, service degradation, health status
- **Route Resolution Timing**: Monitor navigation performance and server-side processing
- **Animation Performance**: Track rendering performance if recommended
- **Real-time Updates**: Live monitoring of performance changes

### Load Testing Capabilities
- **Simulated Load Controls**: Put application under controlled stress
- **Common Scenarios**: Higher user load, concurrent operations, heavy API usage
- **Real-time Monitoring**: Watch metrics change during load tests
- **Vulnerability Detection**: Identify performance bottlenecks and failure points

### Performance Impact Controls
- **Non-intrusive Design**: Cannot significantly impact app performance
- **Filterable Impact**: Ability to exclude dev/performance overhead from metrics
- **Preserves Optimizations**: Must not violate existing performance improvements (smart polling, etc.)

## Technical Requirements

### Performance Preservation
- ✅ Must not break existing smart polling optimizations
- ✅ Monitoring overhead must be filterable/toggleable
- ✅ Real-time updates cannot create new polling runaways
- ✅ Load testing must be isolated to prevent production impact

### Comprehensive Monitoring
- API response times and health status
- Route navigation performance
- Component render times
- Memory usage tracking
- Network request monitoring
- Error rate tracking

## Recommended Architecture: Comprehensive Hybrid Monitoring

Based on requirements analysis, implementing a **comprehensive monitoring system** that leverages existing infrastructure while providing full visibility.

### Core Design Principles
1. **Piggyback Existing Polling**: Batch performance metrics with existing API calls
2. **Zero New Polling Loops**: Use existing smart polling intervals (2-5s)
3. **Dual Monitoring**: Both navigation timing AND server-side route processing
4. **Real-time + Historical**: Live dashboard + daily summary storage
5. **Full Coverage**: WebSocket, EventSource, all communication channels
6. **Granular Controls**: Toggle monitoring entirely + per-metric filtering

### Architecture Components

#### 1. Client-Side Performance Collection
- **Performance Observer API**: Navigation, Resource, Paint, Layout timing
- **WebVitals Monitoring**: CLS, FID, LCP, FCP metrics
- **Component Render Tracking**: React DevTools integration
- **Memory Usage**: Heap size, DOM node count, event listeners
- **Network Monitoring**: Request timing, payload size, error rates

#### 2. Server-Side Metrics Enhancement
- **API Endpoint Timing**: Response time tracking in existing routes
- **Route Processing Time**: Server-side execution measurement
- **Database Query Performance**: Connection pool, query duration
- **Memory/CPU Usage**: Server resource monitoring

#### 3. Smart Data Transport (Zero Performance Impact)
- **Piggyback Strategy**: Attach performance metrics to existing API responses
- **Batching Intelligence**: Collect 5-10 metrics per existing polling cycle  
- **Existing Interval Reuse**: Leverage current 2-5s smart polling (no new timers)
- **WebSocket for Load Testing**: Real-time updates only during load tests
- **Payload Optimization**: Compress metric data, delta encoding for efficiency

#### 4. Historical Storage Strategy
- **Monitoring API Endpoint**: `/api/performance-metrics`
- **Daily Summaries**: Aggregate and store daily performance reports
- **Retention Policy**: 30 days detailed, 6 months summaries
- **Export Capabilities**: JSON/CSV export for analysis

## Implementation Plan

### Phase 1: Core Metrics Collection
1. **Performance Tracking Service**
   - Route timing measurement
   - API response time tracking
   - Component render monitoring
   - Memory usage collection

2. **Health Monitoring**
   - API polling health checks
   - Error rate tracking
   - Service availability monitoring

### Phase 2: Real-Time Dashboard
1. **Dashboard UI** (`/dev/performance`)
   - Live metrics visualization
   - Health status indicators
   - Historical trend charts
   - Performance alerts

2. **Data Management**
   - Efficient storage (localStorage/memory)
   - Data retention policies
   - Export capabilities

### Phase 3: Comprehensive Load Testing
1. **Multi-Scenario Load Simulation**
   - **Concurrent Users**: 10-50 simulated users with guest creation
   - **API Stress Testing**: Rapid-fire API calls across all endpoints  
   - **Heavy Operations**: Card management, conversation creation, user coordination
   - **Real-world Scenarios**: Login storms, bulk data operations, concurrent navigation

2. **Advanced Load Testing Controls**
   - **Preset Scenarios**: "High User Load", "API Stress", "Memory Pressure", "Network Slow"
   - **Custom Parameters**: User count, duration, call frequency, data size
   - **Safety Systems**: Emergency stops, memory limits, error rate thresholds
   - **Real-time Monitoring**: Live metrics during load tests

### Phase 4: Filtering & Impact Control
1. **Monitoring Overhead Control**
   - Toggle monitoring on/off
   - Granular metric selection
   - Performance impact measurement

2. **Baseline Comparison**
   - Pre-monitoring baselines
   - Impact measurement
   - Performance regression detection

## Data Structure

### Performance Metrics
```javascript
{
  timestamp: '2025-08-18T16:00:00.000Z',
  route: '/dev/tests',
  metrics: {
    navigationTime: 88,      // ms
    apiResponseTime: 45,     // ms
    componentRenderTime: 12, // ms
    memoryUsage: 23.5,       // MB
    errorCount: 0
  },
  health: {
    apiPolling: 'healthy',   // healthy/degraded/failing
    serverResponse: 'good',  // good/slow/timeout
    clientPerformance: 'optimal' // optimal/degraded/poor
  }
}
```

### Load Test Configuration
```javascript
{
  scenario: 'high_user_load',
  parameters: {
    concurrentUsers: 10,
    duration: 60000,        // ms
    apiCallsPerUser: 5,
    delayBetweenCalls: 1000 // ms
  },
  safetyLimits: {
    maxMemoryUsage: 100,    // MB
    maxErrorRate: 0.05,     // 5%
    emergencyStop: true
  }
}
```

## File Structure

```
/app/dev/performance/
├── page.jsx                 # Main dashboard page
├── components/
│   ├── MetricsDashboard.jsx # Real-time metrics display
│   ├── LoadTestControls.jsx # Load testing interface
│   ├── HealthMonitor.jsx    # API/service health status
│   └── PerformanceChart.jsx # Metrics visualization
/lib/services/
├── performance-monitor.js   # Core monitoring service
├── load-tester.js          # Load testing utilities
└── metrics-collector.js    # Data collection service
/lib/hooks/
└── usePerformanceMonitor.js # React hook for metrics
```

## Success Criteria

### Performance Goals
- Dashboard loads in <200ms
- Real-time updates without creating polling loops
- Monitoring overhead <1% of baseline performance
- Load testing isolated from production traffic

### Monitoring Coverage
- 100% API endpoint coverage
- Route timing for all pages
- Component render tracking for critical paths
- Memory leak detection
- Error rate monitoring with alerting

### User Experience
- Intuitive dashboard interface
- Clear performance insights
- Easy load testing controls
- Filterable monitoring impact
- Export capabilities for analysis

## Risks & Mitigations

### Performance Regression Risk
**Risk**: Monitoring adds overhead that degrades app performance
**Mitigation**: 
- Implement performance budget checks
- Use requestIdleCallback for non-critical monitoring
- Provide easy disable/filter controls

### Load Testing Safety
**Risk**: Load tests impact production performance
**Mitigation**:
- Implement safety limits and emergency stops
- Use separate test data/endpoints where possible
- Clear warnings about load testing impact

### Data Storage Growth
**Risk**: Metrics data grows unbounded
**Mitigation**:
- Implement data retention policies
- Use efficient storage formats
- Provide cleanup utilities

---

**Next Steps:**
1. Implement core performance tracking service
2. Create basic metrics collection
3. Build real-time dashboard UI
4. Add load testing capabilities
5. Implement filtering controls

*This document will be updated as implementation progresses*