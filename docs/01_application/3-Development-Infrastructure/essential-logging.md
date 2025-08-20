# Essential Logging Documentation

## Overview
This document catalogs the essential console statements that remain in the codebase after cleanup. These logs serve critical production debugging and monitoring purposes.

## Critical Error Handlers

### API Error Responses
All API routes maintain error logging for debugging failed requests:

```javascript
// Pattern used across all API routes
console.error('[Context] Error description:', error);
```

**Files with error handlers:**
- `/app/api/**/*.js` - All API routes
- `/lib/hooks/*.js` - Hook error handling
- `/lib/services/*.js` - Service layer errors

## Session Management Logs

### Session Cleanup (session-manager.js)
**Purpose**: Monitor automatic session cleanup and prevent memory leaks

```javascript
console.log('[SessionManager] Ending inactive session:', id, 'age:', minutes);
console.log('[SessionManager] Deleting old ended session:', id);
console.log('[SessionManager] Deleting old simulated session:', id);
console.log('[SessionManager] Deleting old browser session:', id);
```

**Why Keep**: Essential for monitoring session lifecycle and cleanup operations

## Authentication Events

### Login/Logout Tracking
**Location**: `/app/api/auth/logout/route.js`
```javascript
console.log(`User ${session.user.name} (${session.user.email}) logged out at ${timestamp}`);
```

**Why Keep**: Security audit trail for user authentication events

## Database Operations

### Initialization Success
**Location**: `/lib/db/database.js`
```javascript
console.log('✅ System user created');
console.log(`✅ Migrated ${migrationCount} existing cards to System user`);
console.log(`✅ Migrated ${migrationCount} users with animationsEnabled preference`);
```

**Why Keep**: Confirms critical database migrations and setup

### Database Errors
```javascript
console.error('Database initialization error:', error);
```

**Why Keep**: Critical for debugging database connection issues

## Development-Only Logs

Some logs remain but only run in development mode:
- Test script outputs in `/dev-scripts/**`
- Verification scripts
- Debug utilities

## Network Request Errors

### Session Event Sending
**Location**: `/lib/services/session-tracker.js`
```javascript
console.error('Failed to send session events:', response.statusText);
console.error('Error sending session events:', error);
```

**Why Keep**: Monitors event batching and network issues

### API Communication
```javascript
console.error('[GlobalSessionProvider] Error fetching browser session:', error);
console.error('[GlobalSessionProvider] Failed to create session, status:', response.status);
console.error('[GlobalSessionProvider] Failed to create/reuse session:', error);
```

**Why Keep**: Critical for debugging session initialization failures

## Warning Logs

### Session State Warnings
```javascript
console.warn('[SessionTracker] No current session, cannot emit event:', type);
console.warn('Failed to store guest session:', error);
console.warn('Failed to retrieve guest session:', error);
```

**Why Keep**: Identifies edge cases and state management issues

## Cleanup Operation Logs

### Event Store Cleanup
**Location**: `/app/api/sessions/events/cleanup/route.js`
```javascript
console.log(`[Events Cleanup] Active sessions: ${activeSessions.size}`);
console.log(`[Events Cleanup] Event store has ${eventStore.size} session entries`);
console.log(`[Events Cleanup] Deleted events for orphaned session: ${id}`);
console.log(`[Events Cleanup] Cleaned ${cleanedEvents} events from ${cleanedSessions} sessions`);
```

**Why Keep**: Monitors cleanup operations and memory management

### Session Reset
**Location**: `/app/api/sessions/reset/route.js`
```javascript
console.log('[Session Reset] Cleared all session data');
console.log(`  - ${sessionCount} sessions`);
console.log(`  - ${totalEvents} events from ${eventSessionCount} sessions`);
console.log(`  - ${simulatedCount} simulated sessions`);
```

**Why Keep**: Confirms complete reset operations

## Best Practices

### When to Add New Logs
- **ALWAYS** log errors in catch blocks
- **ALWAYS** log authentication events
- **ALWAYS** log data cleanup operations
- **NEVER** log sensitive data (passwords, tokens)
- **CONSIDER** using debug flags for verbose logging

### Log Format
```javascript
// Good - includes context
console.error('[ComponentName] Operation failed:', error);

// Bad - no context
console.log('Error');
```

### Production vs Development
```javascript
// Use environment checks for debug logs
if (process.env.NODE_ENV === 'development') {
  console.log('[Debug] Detailed information');
}
```

## Summary Statistics

After cleanup:
- **Total console statements remaining**: ~100
- **Error handlers**: ~60
- **Critical operations**: ~25
- **Warnings**: ~10
- **Debug (dev-only)**: ~5

## Future Improvements

Consider implementing:
1. Structured logging library (winston, pino)
2. Log levels (ERROR, WARN, INFO, DEBUG)
3. Log aggregation service for production
4. Performance monitoring integration

---

*Last updated after console.log cleanup on provisioned guest system implementation*