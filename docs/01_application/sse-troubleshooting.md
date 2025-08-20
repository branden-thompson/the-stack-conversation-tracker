# SSE Troubleshooting - Application Level

**Purpose**: Application-level Server-Sent Events troubleshooting guide  
**Scope**: Project-wide SSE issues and systematic troubleshooting  
**Related**: See `/docs/05_for-agents/sev-0-sse-troubleshooting-framework.md` for emergency protocols

## SSE in Conversation Tracker

### Critical SSE Features
- **Active Stackers**: Real-time user presence across tabs
- **Card Operations**: Real-time card flips, moves, creation across tabs  
- **Cross-Tab Synchronization**: All collaborative features depend on SSE
- **User Events**: Join/leave events for real-time presence

### SSE Architecture
```
Browser Tab A ←→ EventSource ←→ SSE Server ←→ EventSource ←→ Browser Tab B
```

**Key Point**: SSE enables multiple browser tabs to stay synchronized with real-time updates.

## Common SSE Issues

### 1. Cross-Tab Sync Not Working

**Symptoms**:
- Active Stackers count wrong in different tabs
- Card flips not appearing in other tabs
- User joins/leaves not syncing

**Most Common Cause**: Multiple development servers (see `port-management.md`)

**Diagnostic Steps**:
1. **Check for multiple dev servers**:
   ```bash
   ps aux | grep "next.*dev"
   ```
2. **Verify all tabs connect to same port** in Network tab
3. **Use clean start script**:
   ```bash
   ./dev-scripts/clean-start-dev.sh
   ```

### 2. SSE Connection Errors

**Symptoms**:
- Console errors: "EventSource failed"
- Network tab shows failed SSE connections
- No real-time updates at all

**Diagnostic Steps**:
1. **Check SSE endpoint availability**:
   ```bash
   curl -H "Accept: text/event-stream" http://localhost:3000/api/sse/user-events
   ```
2. **Verify server logs** for SSE-related errors
3. **Check browser dev tools** Network tab for EventSource status

### 3. Events Received But No UI Updates

**Symptoms**:
- EventSource shows connected in Network tab
- Console may show events being received
- UI components don't update

**Diagnostic Steps**:
1. **Check React Query cache invalidation**
2. **Verify component subscription to SSE events**  
3. **Test with manual cache refresh**

### 4. Intermittent SSE Failures

**Symptoms**:
- Sometimes works, sometimes doesn't
- Random connection drops
- Inconsistent cross-tab behavior

**Common Causes**:
- Network issues or proxy interference
- Browser throttling background tabs
- Development server instability

## SSE Debugging Workflow

### Step 1: Verify Basic Connectivity
```bash
# 1. Ensure single dev server
./dev-scripts/clean-start-dev.sh

# 2. Check SSE endpoint
curl -H "Accept: text/event-stream" http://localhost:3000/api/sse/user-events
```

### Step 2: Browser Debugging
1. **Open dev tools** in all tabs
2. **Network tab** → Filter "EventSource" 
3. **Console tab** → Look for SSE-related logs
4. **Application tab** → Check localStorage/sessionStorage

### Step 3: Cross-Tab Testing
1. **Open 2+ tabs** to same conversation
2. **Perform test actions**:
   - Join/leave with different users
   - Flip cards
   - Create new cards
3. **Verify real-time updates** in all tabs (within 2 seconds)

### Step 4: Server-Side Verification
1. **Check server logs** for SSE connection messages
2. **Verify event broadcasting** in server logs
3. **Monitor API endpoints** for related errors

## Environment-Specific Issues

### Development Environment
- **Multiple server instances**: Use `clean-start-dev.sh`
- **Port conflicts**: Check `port-management.md`
- **Hot reload interference**: Restart dev server if SSE stops after code changes

### Docker Environment  
- **Port mapping issues**: Verify docker-compose port configuration
- **Container networking**: Ensure proper container communication
- **Resource limits**: Check if containers have sufficient resources

### Production Environment
- **Reverse proxy config**: Ensure proxy supports SSE
- **Connection limits**: Verify server connection limits
- **Timeout settings**: Check SSE timeout configurations

## Advanced Troubleshooting

### SSE Event Tracing
Add temporary logging to trace event flow:

```javascript
// In components using SSE
console.log('[SSE Debug] Event received:', event.type, event.data);

// In SSE event handlers  
console.log('[SSE Debug] Handler executed:', eventType, data);
```

### Network-Level Debugging
```bash
# Monitor network traffic to SSE endpoints
curl -v -H "Accept: text/event-stream" http://localhost:3000/api/sse/user-events

# Check for proxy interference
curl --noproxy "*" -H "Accept: text/event-stream" http://localhost:3000/api/sse/user-events
```

### React Query Integration Debug
```javascript
// Check query invalidation
queryClient.getQueryCache().findAll().forEach(query => {
  console.log('Query:', query.queryKey, 'State:', query.state);
});

// Force refresh specific queries
queryClient.invalidateQueries({ queryKey: ['sessions'] });
```

## Performance Considerations

### SSE Connection Limits
- **Browser limit**: ~6 connections per domain
- **Server limit**: Check server configuration  
- **Resource usage**: Monitor memory/CPU usage

### Event Frequency
- **High-frequency events**: May overwhelm browser
- **Batching**: Consider batching related events
- **Throttling**: Implement client-side throttling if needed

### Background Tab Handling
- **Browser throttling**: Background tabs may receive events slowly
- **Visibility API**: Consider using Page Visibility API
- **Connection management**: Handle tab focus/blur events

## Emergency Procedures

### Quick SSE Reset
```bash
# 1. Clean restart development server
./dev-scripts/clean-start-dev.sh

# 2. Clear browser data
# - Clear localStorage/sessionStorage
# - Hard refresh all tabs (Ctrl+Shift+R)

# 3. Test cross-tab sync immediately
```

### SSE Disable Fallback
If SSE completely fails, implement polling fallback:
- **NOT RECOMMENDED**: Polling was removed due to API runaway issues
- **Emergency only**: Use for critical demonstrations
- **Temporary**: Must be reverted to SSE as soon as possible

### Escalation Criteria
- **SSE down for >15 minutes**: Escalate to emergency protocols
- **Cross-tab sync broken**: High priority issue  
- **Multiple troubleshooting attempts failed**: Consider rollback
- **Production SSE issues**: Immediate escalation

## Prevention Best Practices

### Development Practices
1. **Always use clean-start script** for development
2. **Test cross-tab sync** after any SSE-related changes
3. **Monitor performance** impact of SSE modifications
4. **Document SSE changes** thoroughly

### Code Review Requirements
- **SSE changes require special review** attention
- **Cross-tab testing mandatory** before merge
- **Performance impact assessment** required
- **Rollback plan documented** for SSE changes

### Monitoring and Alerting
- **SSE connection health monitoring** in production
- **Cross-tab sync verification** in automated tests
- **Performance regression detection** for SSE features
- **Error rate monitoring** for SSE endpoints

---

**Key Principle**: SSE is critical infrastructure for this application. Any SSE issues should be treated as high-priority problems requiring systematic troubleshooting and careful resolution.

**Always remember**: Working real-time features > architectural idealism