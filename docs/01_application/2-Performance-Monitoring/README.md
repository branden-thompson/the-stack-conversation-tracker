# Performance Monitoring Documentation

## Overview
This folder contains documentation for the application's performance monitoring system, including safety controls, real-time monitoring, and resource protection mechanisms.

## Contents

### Safety Controls
- `performance-monitoring-safety-controls.md` - Emergency controls and circuit breakers for performance monitoring
- `realtime-runtime-perf-monitoring.md` - Real-time performance tracking and resource monitoring

## Related Systems
- Session tracking and user activity monitoring (see `/3-Development-Infrastructure/user-tracking.md`)
- Error handling and recovery mechanisms (see `/4-Troubleshooting/`)
- Architecture overview with performance considerations (see `/1-Architecture/`)

## Quick Reference
- **Emergency Disable**: Environment variable `DISABLE_PERFORMANCE_MONITORING=true`
- **Circuit Breakers**: Automatic protection when resource thresholds exceeded
- **Monitoring Scope**: API response times, memory usage, render performance