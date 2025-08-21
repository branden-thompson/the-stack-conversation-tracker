# SSE Hook Coordination Debugging Session
## Date: 2025-08-21

### Initial Problem
API runaway detected with hundreds of `/api/sessions` requests every 20-30ms when optimized SSE hook was enabled, despite hook coordination system.

### Root Cause Analysis

#### Primary Issue: Multiple Dev Server Instances
**Discovery**: The apparent hook coordination failure was actually caused by multiple Next.js dev server instances running simultaneously on different ports (3000, 3001, 3002).

**Evidence**:
```bash
⚠ Port 3000 is in use by an unknown process, using available port 3001 instead.
```

**Solution**: Used `./dev-scripts/clean-start-dev.sh` to kill all dev processes and start clean single server.

#### Secondary Issue: Hardcoded Intervals in useSSEIntegration
**Discovery**: `useSSEIntegration` had hardcoded 3000ms default interval overriding safe configuration.

**Location**: `/lib/sse-infrastructure/core/useSSEIntegration.js:39`

**Fix**:
```javascript
// BEFORE
interval = 3000,

// AFTER  
const defaultSafeInterval = getPollingInterval('sessions');
interval = defaultSafeInterval, // Uses 5000ms in development
```

#### Persistent Issue: Optimized SSE Hook Architecture
**Status**: UNRESOLVED - Optimized SSE hook still causes API runaway despite interval fixes.

**Hypothesis**: Multiple timer/polling mechanisms active within SSE infrastructure components, bypassing top-level interval configuration.

### Hook Coordination System Validation

#### Registry Implementation
- **Global singleton registry**: ✅ Working correctly
- **Hook registration/rejection**: ✅ Prevents duplicate hooks per endpoint  
- **Lifecycle tracking**: ✅ Proper cleanup on unmount
- **Activity monitoring**: ✅ Tracks requests and errors

#### Integration Testing Results
```
Hook Registry Integration Test Results:
✅ Single hook registration: SUCCESS
✅ Duplicate hook rejection: SUCCESS (75% rejection rate as expected)
✅ Hook cleanup on component unmount: SUCCESS
✅ Cross-component coordination: SUCCESS
```

### Current Hook Status

#### Regular SSE Hook (useSSEActiveUsers)
- **Status**: ✅ WORKING CORRECTLY
- **Interval**: 5000ms (respects environment config)
- **Registry Integration**: ✅ Implemented
- **API Behavior**: Normal 5-second intervals
- **Ready for**: Card Event Migration

#### Optimized SSE Hook (useSSEActiveUsersOptimized)  
- **Status**: ❌ DISABLED - API runaway issue
- **Interval Configuration**: Fixed but still problematic
- **Registry Integration**: ✅ Implemented  
- **Issue**: Deeper infrastructure components bypassing interval
- **Next Steps**: Architectural debugging required

### Debugging Artifacts Added

#### Console Logging
```javascript
// useSSEActiveUsers.js
console.log('[useSSEActiveUsers] Using safe interval:', safeInterval, 'ms');
console.log('[useSSEActiveUsers] ATTEMPTING HOOK REGISTRATION for /api/sessions');
console.log('[useSSEActiveUsers] Interval tick - fetching data');

// useSSEActiveUsersOptimized.js  
console.log('[useSSEActiveUsersOptimized] ATTEMPTING HOOK REGISTRATION for /api/sessions (enabled:', enabled, ')');

// useSSEIntegration.js
console.log('[useSSEIntegration] Config received:', { endpoint, interval, defaultSafeInterval });
```

#### Registry Debug Output
```javascript
// hook-registry.js
console.log('[SSEHookRegistry] Hook REGISTERED:', hookId);
console.warn('[SSEHookRegistry] Registration REJECTED: Hook already active');
```

### Key Learning: Dev Server Management

**Critical Discovery**: Multiple dev servers cause session data splitting across different backend instances, breaking:
- Hook coordination (each server has its own registry)
- Session tracking (data split across ports)  
- API rate limiting (each server making independent requests)

**Solution**: Always use `./dev-scripts/clean-start-dev.sh` instead of `npm run dev`

### Recommended Next Steps

1. **Immediate**: Deeper investigation of optimized SSE infrastructure
2. **Focus**: Identify multiple timer sources in SSE components
3. **Alternative**: Use regular SSE hook for Card Event Migration
4. **Long-term**: Architectural review of SSE infrastructure layering

### Files Modified

- `/components/ui/active-users-display.jsx` - Hook selection logic and debugging
- `/lib/hooks/useSSEActiveUsers.js` - Registry integration and debugging
- `/lib/hooks/useSSEActiveUsersOptimized.js` - Registry integration and debugging  
- `/lib/sse-infrastructure/core/useSSEIntegration.js` - Fixed hardcoded interval
- `/lib/sse-infrastructure/registry/hook-registry.js` - Complete registry implementation

### Test Scenarios Validated

1. ✅ Single tab with regular SSE hook - Normal 5s intervals
2. ✅ Hook coordination prevents duplicates when switching hooks
3. ✅ Clean dev server startup prevents multiple instances
4. ❌ Optimized SSE hook still causes runaway (unresolved)
5. ⏳ Cross-tab coordination (pending optimized hook fix)

### Performance Impact

**Before Fix**: Hundreds of requests per second, causing potential server overload
**After Fix**: Normal 5-second intervals with regular SSE hook
**Optimized Hook**: Still problematic, disabled until architectural fix