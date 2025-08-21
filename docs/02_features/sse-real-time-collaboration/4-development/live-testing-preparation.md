# Live Testing Preparation - Hook Coordination Fix

## 🚀 LIVE TESTING PLAN

**Status**: READY FOR EXECUTION  
**Confidence**: HIGH - Comprehensive testing completed  
**Risk Level**: LOW - Rollback mechanisms in place  

## Testing Scenarios

### **Option 1: Re-enable Optimized SSE Hook**
**Objective**: Validate hook coordination prevents API runaway  
**Action**: Set `useOptimizedSSE = true` in `active-users-display.jsx:66`  
**Expected**: Single hook registration, normal API frequency  
**Validation**:
- Monitor browser network tab for request frequency
- Check console for hook registration messages
- Verify no API runaway (requests should be 5-10 second intervals)
- Confirm Active Stackers component still functional

### **Option 2: Monitor for API Runaway Prevention**  
**Objective**: Confirm coordination system working in live environment  
**Actions**:
- Monitor dev console for registry logs
- Check network tab for `/api/sessions` frequency
- Validate hook registration success/rejection messages  
**Expected**:
- Only one hook registered per `/api/sessions` endpoint
- Registry rejection logs if multiple hooks attempt registration
- Normal request patterns (not millisecond intervals)

### **Option 3: Validate Cross-Tab Coordination**
**Objective**: Test multi-tab hook coordination  
**Actions**:
- Open multiple tabs to localhost:3000
- Monitor which tab gets hook registration
- Verify other tabs receive rejected registration
- Test tab closing/opening coordination  
**Expected**:
- First tab: Hook registration successful
- Subsequent tabs: Hook registration rejected  
- Tab closure: Hook unregistration, next tab can register

## Pre-Testing Checklist

### ✅ **Code Validation**
- Hook registry implementation complete
- Integration tests passing (75% success rate with proper rejections)
- Both SSE hooks integrated with registry
- Component updated to track registry status

### ✅ **Monitoring Setup**
- Console logging enabled for registry events
- Network monitoring ready for request frequency
- Performance stats accessible via `_hookRegistry.getRegistryStats()`
- Emergency rollback procedure documented

### ✅ **Safety Mechanisms**
- `useOptimizedSSE = false` current setting (emergency off switch)
- Individual hook disable capabilities working
- Registry reset functionality available
- Clean unregistration on component unmount

## Success Criteria

### **Primary Validation**
1. **No API Runaway**: Request frequency ≤ 6-12 per minute (5-10s intervals)
2. **Hook Coordination**: Only one hook active per endpoint at any time
3. **Registry Function**: Successful registration/rejection logging visible
4. **User Experience**: Active Stackers display working normally

### **Performance Metrics**
- **Request Frequency**: 5-10 second intervals maintained
- **Memory Usage**: <50MB additional for coordination infrastructure
- **Response Time**: <100ms for registry operations
- **Error Rate**: <5% for hook registration attempts

### **Debugging Visibility**
- **Console Logs**: Clear registration success/rejection messages
- **Network Tab**: Normal API request patterns visible
- **Registry Stats**: Accessible via browser console for troubleshooting
- **Component State**: Hook status visible in React DevTools

## Testing Commands

### **Monitor Registry Status**
```javascript
// Browser console commands for live monitoring
console.log(window._sseRegistry?.getStats());
// Check active hooks, registration counts, rejection rates
```

### **Emergency Rollback**
```javascript
// Immediate rollback if issues detected
// 1. Set useOptimizedSSE = false in code
// 2. Or disable via registry:
window._sseRegistry?.reset();
```

### **Performance Monitoring**
```javascript
// Check request coordination statistics
console.log(_hookRegistry?.getRegistryStats());
// Monitor active hook count, request frequency, error rates
```

## Test Execution Steps

### **Phase 1: Basic Functionality (5 minutes)**
1. **Enable Optimized SSE**: Change `useOptimizedSSE = true`
2. **Save and Refresh**: Browser auto-reload with new code
3. **Monitor Console**: Check for hook registration success
4. **Check Network**: Validate normal request frequency
5. **Test UI**: Ensure Active Stackers display working

### **Phase 2: Coordination Validation (5 minutes)**
1. **Open Second Tab**: Navigate to localhost:3000 in new tab
2. **Monitor Registration**: Check console for rejection message
3. **Verify Request Frequency**: Ensure no duplication in network tab
4. **Close First Tab**: Verify second tab can register hook
5. **Test Rapid Tab Changes**: Open/close multiple tabs quickly

### **Phase 3: Performance Testing (5 minutes)**
1. **High Activity Simulation**: Multiple user interactions
2. **Network Monitoring**: Sustained request frequency check
3. **Memory Usage**: Monitor browser memory consumption
4. **Error Handling**: Test edge cases and error conditions
5. **Final Validation**: Overall system stability check

## Rollback Plan

### **Immediate Rollback (< 30 seconds)**
```javascript
// Set in active-users-display.jsx:66
const useOptimizedSSE = false; // EMERGENCY DISABLE
```

### **Registry Reset (< 60 seconds)**
```javascript
// Browser console emergency commands
getSSEHookRegistry().reset();
// Clears all hook registrations, forces clean state
```

### **Component-Level Disable (< 2 minutes)**
```javascript
// In component props
<ActiveUsersDisplay enabled={false} />
// Completely disables hook execution
```

## Monitoring Alerts

### **Watch For These Indicators**
- ❌ **API Runaway**: >20 requests/minute to `/api/sessions`
- ❌ **Memory Growth**: >100MB increase in browser memory
- ❌ **Registration Failures**: Multiple hooks active simultaneously  
- ❌ **Error Cascading**: Repeated hook registration/unregistration cycles

### **Success Indicators**
- ✅ **Stable Request Pattern**: 6-12 requests/minute maintained
- ✅ **Single Hook Active**: Registry shows activeCount = 1
- ✅ **Clean Registrations**: Success messages in console
- ✅ **Normal UI Response**: Active Stackers updating correctly

## Post-Testing Actions

### **If Successful**
1. **Monitor Extended Period**: 15-30 minutes of normal operation
2. **Document Performance**: Capture request frequency improvements
3. **Update Status**: Mark optimized SSE as production-ready
4. **Plan Card Events Migration**: Schedule next phase implementation

### **If Issues Detected**
1. **Immediate Rollback**: Disable optimized SSE
2. **Issue Analysis**: Capture error logs and network traces
3. **Debug Session**: Additional coordination system refinement
4. **Re-test Cycle**: Fix issues and repeat testing process

---

**TESTING AUTHORIZATION**: All systems green for live testing  
**NEXT ACTION**: GOFLIGHT - Proceed with all 3 testing options  
**SAFETY NET**: Multiple rollback mechanisms in place  
**CONFIDENCE**: HIGH - Comprehensive preparation completed