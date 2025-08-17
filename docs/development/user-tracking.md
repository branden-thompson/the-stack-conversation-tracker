# User Tracking System Documentation

## Overview

The User Tracking system provides real-time monitoring of user sessions and activity across the application. It tracks user behavior, session states, navigation patterns, and interactions with automatic event batching, session persistence, and flexible data collection.

## Critical Implementation Notes ⚠️

### Session Management Complexity
The session tracking system is **highly complex** due to multiple layers of state management and persistence. Key challenges addressed:

1. **Session Persistence Across Refreshes**: Sessions must survive browser refreshes
2. **Prevention of Duplicate Sessions**: Each refresh was creating new sessions
3. **Multi-Tab Support**: Different tabs need separate sessions per route
4. **User Switching**: Sessions must properly handle user context changes
5. **Cleanup**: Stale sessions need automatic cleanup

### Key Implementation Decisions

#### 1. Session Storage Strategy
Sessions are persisted using localStorage with a 30-minute timeout:
```javascript
// lib/utils/session-storage.js
const SESSION_STORAGE_KEY = 'conversation_tracker_session';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
```

#### 2. Session Reuse Logic
The API checks for existing sessions before creating new ones:
```javascript
// Check order:
1. Exact sessionId match (from localStorage)
2. Same user + same route (for tab refresh)
3. Create new only if no match found
```

#### 3. Maximum Sessions Per User
Limited to 2 concurrent sessions (typical use case: 2 tabs):
```javascript
if (totalUserSessions >= 2) {
  // End oldest session automatically
}
```

## Event Types and Tracking Implementation

### Tracked Event Categories

The system tracks events across six main categories:

1. **Navigation Events** (`navigation`)
   - `page_view`: Initial page load
   - `route_change`: Client-side navigation

2. **Board Events** (`board`)
   - `card_created`: New card added
   - `card_updated`: Card content modified
   - `card_deleted`: Card removed
   - `card_moved`: Card zone changed
   - `card_flipped`: Card face toggled

3. **UI Events** (`ui`)
   - `button_clicked`: Any button interaction
   - `dialog_opened`: Modal/dialog shown
   - `dialog_closed`: Modal/dialog hidden
   - `tray_opened`: Side panel opened
   - `tray_closed`: Side panel closed

4. **Test Events** (`tests`)
   - `test_run`: Test suite executed
   - `test_view`: Test results viewed
   - `coverage_view`: Coverage report viewed

5. **Session Events** (`session`)
   - `session_start`: User session begins
   - `session_end`: User session ends
   - `user_idle`: User inactive for 5 minutes
   - `user_active`: User returns from idle
   - `user_switched`: Different user selected

6. **Settings Events** (`settings`)
   - `theme_changed`: Light/dark mode toggle
   - `animation_toggled`: Animations enabled/disabled
   - `preference_updated`: Other preferences changed

### Event Emission Points

Events are emitted from various components:

```javascript
// Board.jsx - Card operations
emitCardEvent('moved', {
  cardId: id,
  from: before.zone,
  to: updates.zone,
});

// FlippableCard.jsx - Flip tracking
emitCardEvent('flipped', {
  cardId: card.id,
  flippedBy: source,
  zone: card.zone,
  from: isFlipped ? 'faceDown' : 'faceUp',
  flippedTo: isFlipped ? 'faceUp' : 'faceDown',
});

// Global button tracking via useButtonTracking hook
emitUIEvent('buttonClick', {
  label: buttonText,
  variant: buttonVariant,
  hasIcon: hasIcon
});
```

### Event Flow Pipeline

1. **Component Action** → Triggers event emission
2. **GlobalSessionProvider** → Maps event type to constant
3. **SessionTracker** → Batches events (10 events or 500ms)
4. **API Endpoint** → `/api/sessions/events` receives batch
5. **Event Store** → In-memory storage with TTL
6. **User Tracking UI** → Polls and displays events

## Architecture

### Core Components with Implementation Details

```
┌─────────────────────────────────────────────────┐
│              SessionManager Service              │
│  - Singleton pattern using global variables     │
│  - Ensures session stores shared across routes  │
│  - Manages cleanup intervals                    │
└─────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────┐
│              GlobalSessionProvider               │
│  - Wraps entire app in providers.jsx            │
│  - Manages session lifecycle                    │
│  - Handles localStorage persistence             │
└─────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────┐
│                Board Component                   │
│  - Uses useGlobalSession hook                   │
│  - Triggers session init when user available    │
│  - Emits events for card operations             │
└─────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────┐
│              Session Tracker Service             │
│  - Client-side event batching                   │
│  - Idle detection                               │
│  - Event queue management                       │
└─────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────┐
│                   API Layer                      │
│  /api/sessions - Session CRUD + reuse logic     │
│  /api/sessions/events - Event ingestion         │
│  /api/sessions/cleanup - Manual cleanup         │
│  /api/sessions/simulate - Test sessions         │
└─────────────────────────────────────────────────┘
```

### Data Flow with Debugging Points

1. **App Load**
   - Console: `[GlobalSessionProvider] Initializing default session`
   - Console: `[Board] User state: {user object or null}`

2. **Session Creation/Reuse**
   - Console: `[Sessions API] Session request for user: X`
   - Console: `[GlobalSessionProvider] Session created/reused: {id}`
   - localStorage: Check for `conversation_tracker_session` key

3. **Event Emission**
   - Console: `[SessionTracker] Emitting event: {type}`
   - Network: POST to `/api/sessions/events`

## Debugging Guide 🔍

### Common Issues and Solutions

#### 1. Multiple Sessions Per Refresh
**Symptom**: User shows 8+ active sessions after refreshing multiple times

**Root Causes**:
- Session not being persisted to localStorage
- Session ID not being sent on subsequent requests
- User context changing unexpectedly

**Solution**:
```javascript
// Check localStorage
localStorage.getItem('conversation_tracker_session')

// Verify session reuse in API logs
[Sessions API] Reusing existing session: {id}

// Clear all sessions for user
curl -X DELETE "http://localhost:3000/api/sessions/cleanup?userId=USER_ID"
```

#### 2. Sessions Not Being Created
**Symptom**: No sessions appear in /dev/user-tracking

**Debugging Steps**:
```javascript
// 1. Check console for initialization
[Board] Initializing session for user: NAME

// 2. Check network tab for POST /api/sessions
// Should see 200 (reused) or 201 (created)

// 3. Verify user is available
console.log(currentUser) // Should not be null

// 4. Check API directly
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"userId": "test", "userType": "registered"}'
```

#### 3. Session Persistence Not Working
**Symptom**: New session created on every refresh

**Check**:
```javascript
// localStorage should contain session
const stored = JSON.parse(localStorage.getItem('conversation_tracker_session'))
console.log('Stored session:', stored)

// Session should be within timeout
const age = Date.now() - stored.timestamp
console.log('Session age (ms):', age)
console.log('Expired?', age > 30 * 60 * 1000)
```

### Console Log Flow (Expected)

Normal page refresh should show:
```
[Board] User state: null
[Board] No current user available yet
[Board] User state: {id: 'system', ...}
[Board] Initializing session for user: System system
[GlobalSessionProvider] Initializing session for user: System
[GlobalSessionProvider] Found stored session: {sessionId}
[Sessions API] Reusing existing session: {sessionId}
[GlobalSessionProvider] Session reused: {sessionId}
[Board] User state: {id: 'branden', ...}
[Board] Initializing session for user: Branden
[GlobalSessionProvider] Session reused: {sessionId}
```

### API Testing Commands

```bash
# Check all sessions
curl http://localhost:3000/api/sessions | jq '.'

# Check session count by user
curl http://localhost:3000/api/sessions | jq '.grouped | to_entries[] | {user: .key, count: .value | length}'

# Create test session
curl -X POST http://localhost:3000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"userId": "test", "userType": "registered"}'

# Clean up user sessions
curl -X DELETE "http://localhost:3000/api/sessions/cleanup?userId=USER_ID"

# Create simulated sessions
curl -X POST http://localhost:3000/api/sessions/simulate \
  -H "Content-Type: application/json" \
  -d '{"count": 2, "autoActivity": true}'
```

## Implementation Details

### SessionManager Singleton Pattern

The SessionManager (`/lib/services/session-manager.js`) ensures all API routes share the same session stores:

```javascript
class SessionManager {
  constructor() {
    // Use global variables to ensure singleton across API routes
    if (!global.sessionStore) {
      global.sessionStore = new Map();
      global.eventStore = new Map();
      global.simulatedSessions = new Map();
      this.startCleanup();
    }
  }
  
  get sessionStore() {
    return global.sessionStore;
  }
}

// Export singleton instance
const sessionManager = new SessionManager();
export default sessionManager;
```

**Why This Pattern?**
- Next.js API routes can be loaded in different module contexts
- Regular module exports don't guarantee singleton behavior
- Global variables persist across all API route invocations
- Prevents session store fragmentation between routes

**Usage in API Routes**:
```javascript
import sessionManager from '@/lib/services/session-manager';
const { sessionStore, eventStore } = sessionManager;
```

### Session Initialization Flow

1. **App Providers Load** (`app/providers.jsx`)
   ```javascript
   <GlobalSessionProvider>
     {children}
   </GlobalSessionProvider>
   ```

2. **Board Component Mounts** (`components/conversation-board/Board.jsx`)
   ```javascript
   const { currentUser } = useGuestUsers();
   const { initializeSession } = useGlobalSession();
   
   useEffect(() => {
     if (currentUser?.id) {
       initializeSession(currentUser);
     }
   }, [currentUser, initializeSession]);
   ```

3. **GlobalSessionProvider Handles Init** (`lib/contexts/GlobalSessionProvider.jsx`)
   ```javascript
   // Check for stored session
   const storedSessionId = getStoredSessionId(user.id);
   
   // Create or reuse session
   const response = await fetch('/api/sessions', {
     method: 'POST',
     body: JSON.stringify({
       userId: user.id,
       sessionId: storedSessionId, // Reuse if exists
       ...
     })
   });
   ```

4. **API Determines Reuse** (`app/api/sessions/route.js`)
   ```javascript
   // Validation
   if (!userId || userId === 'undefined') {
     return NextResponse.json({ error: 'Valid userId required' }, { status: 400 });
   }
   
   // Check for exact session match
   if (existingSessionId && sessionStore.has(existingSessionId)) {
     // Reuse exact session
   }
   
   // Check for user+route match
   for (const [id, session] of sessionStore.entries()) {
     if (session.userId === userId && session.currentRoute === route) {
       // Reuse session for same route
     }
   }
   ```

### Session Storage Schema

```javascript
// localStorage
{
  "sessionId": "uuid",
  "userId": "user_id",
  "timestamp": 1234567890 // Last update time
}

// In-memory session store
{
  "id": "uuid",
  "userId": "user_id",
  "userType": "registered|guest",
  "userName": "Display Name",
  "startedAt": 1234567890,
  "lastActivityAt": 1234567890,
  "status": "active|inactive|idle|ended",
  "browser": "Chrome 120 on macOS",
  "currentRoute": "/path",
  "eventCount": 42,
  "recentActions": [...],
  "metadata": {}
}
```

### Cleanup Mechanisms

1. **Automatic Cleanup** (Every 5 minutes)
   ```javascript
   // Mark inactive after 30 minutes
   if (session.status === 'active' && age > 30 * 60 * 1000) {
     session.status = 'ended';
   }
   
   // Delete ended sessions after 24 hours
   if (session.status === 'ended' && age > 24 * 60 * 60 * 1000) {
     sessionStore.delete(id);
   }
   ```

2. **Tab Close Cleanup**
   ```javascript
   window.addEventListener('beforeunload', () => {
     navigator.sendBeacon(`/api/sessions?id=${sessionId}`, 
       JSON.stringify({ method: 'DELETE' }));
     clearStoredSession();
   });
   ```

3. **Manual Cleanup**
   ```bash
   # End all sessions for user
   curl -X DELETE "http://localhost:3000/api/sessions/cleanup?userId=USER_ID"
   
   # End all active sessions
   curl -X DELETE "http://localhost:3000/api/sessions/cleanup"
   ```

## Key Learnings

### What Works Well
1. **Session Reuse**: Using localStorage to persist session IDs works reliably
2. **Route-Based Sessions**: One session per route prevents confusion
3. **Automatic Cleanup**: 30-minute inactive timeout keeps data clean
4. **Validation**: Rejecting undefined/null userIds prevents orphan sessions

### Gotchas to Avoid
1. **Don't create sessions before user is known** - Wait for currentUser
2. **Don't trust sessionStorage** - Use localStorage for persistence
3. **Don't skip validation** - Always check userId validity
4. **Don't create unlimited sessions** - Enforce max 2 per user

### Performance Considerations
1. **Event Batching**: 10 events or 500ms timeout
2. **Polling Interval**: 2 seconds for real-time updates
3. **Session Limit**: Max 2 concurrent per user
4. **Cleanup Frequency**: Every 5 minutes for inactive sessions

## Testing Strategy

### Unit Test Coverage
```javascript
// Test session persistence
it('should reuse existing session on refresh', async () => {
  const sessionId = 'test-123';
  storeSessionId(sessionId, 'user1');
  
  const stored = getStoredSessionId('user1');
  expect(stored).toBe(sessionId);
});

// Test session timeout
it('should reject expired sessions', async () => {
  const oldSession = {
    sessionId: 'old-123',
    userId: 'user1',
    timestamp: Date.now() - 31 * 60 * 1000 // 31 minutes ago
  };
  localStorage.setItem('conversation_tracker_session', JSON.stringify(oldSession));
  
  const stored = getStoredSessionId('user1');
  expect(stored).toBeNull();
});
```

### Integration Test Scenarios
1. **New User Flow**: No session → Create new → Store in localStorage
2. **Returning User**: Has localStorage → Reuse session → Update activity
3. **Multi-Tab**: Tab 1 creates → Tab 2 creates different → Both active
4. **User Switch**: System → Branden → New session for Branden
5. **Cleanup**: Inactive 30min → Marked ended → Deleted after 24hr

## Migration Notes

### From Old System (Multiple Sessions Per Refresh)
1. Clear all existing sessions: `/api/sessions/cleanup`
2. Clear localStorage: `localStorage.clear()`
3. Deploy new code with session reuse logic
4. Monitor for duplicate sessions

### Simulation System Details

#### How Auto-Activity Works
1. **Creation**: `POST /api/sessions/simulate` with `autoActivity: true`
2. **Interval Setup**: Each session gets a `setInterval(5-15 seconds)`
3. **Event Generation**: Random events from weighted pool
4. **Event Submission**: POSTs to `/api/sessions/events`

#### Auto-Activity Control
```bash
# Pause all simulated activity
curl -X PATCH http://localhost:3000/api/sessions/simulate/activity \
  -H "Content-Type: application/json" \
  -d '{"action": "stop"}'

# Resume all simulated activity  
curl -X PATCH http://localhost:3000/api/sessions/simulate/activity \
  -H "Content-Type: application/json" \
  -d '{"action": "start"}'

# Remove all simulated sessions (also stops activity)
curl -X DELETE http://localhost:3000/api/sessions/simulate
```

#### Known Issues with Simulated Sessions
1. **Orphaned Intervals**: Deleting sessions doesn't always clear intervals
2. **Event Persistence**: Events remain after session deletion
3. **Memory Leaks**: Intervals can accumulate if not properly cleared
4. **Solution**: Server restart is the only guaranteed way to clear all intervals

### Future Improvements
1. **Redis/Database Backend**: Replace in-memory stores
2. **WebSocket Support**: Real-time updates without polling
3. **Session Analytics**: Aggregated metrics dashboard
4. **Cross-Tab Sync**: Share session across tabs via BroadcastChannel
5. **Offline Support**: Queue events when offline, sync on reconnect
6. **Global Interval Tracker**: Track all intervals to prevent orphans
7. **Event TTL**: Auto-expire old events to prevent accumulation

## Emergency Procedures

### If Sessions Explode (100+ sessions)
```bash
# 1. Stop session creation
curl -X DELETE "http://localhost:3000/api/sessions/cleanup"

# 2. Clear localStorage on all clients
localStorage.clear()

# 3. Restart server to clear in-memory stores
npm run dev

# 4. Monitor new session creation
watch 'curl -s http://localhost:3000/api/sessions | jq .total'
```

### If Sessions Won't Create
```javascript
// 1. Check user context
console.log('Current user:', currentUser);

// 2. Force session creation
const response = await fetch('/api/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'test-user',
    userType: 'registered',
    browser: navigator.userAgent
  })
});
console.log('Session response:', await response.json());

// 3. Check for errors
// Look for: "Valid userId is required"
// Look for: "Failed to create session"
```

### If Phantom Simulated Events Appear (No Simulated Users but Events Keep Coming)

**Symptom**: Timeline shows simulated events even though no simulated users are visible

**Root Cause**: JavaScript intervals from deleted simulated sessions continue running in Node.js memory

**Diagnosis**:
```bash
# Check for phantom events
curl -s "http://localhost:3000/api/sessions/events?limit=10" | \
  jq '[.events[] | select(.metadata.simulated == true)] | length'

# Check active simulated sessions
curl -s http://localhost:3000/api/sessions/simulate | jq '.total'

# If events > 0 but sessions = 0, you have orphaned intervals
```

**Solution**:
1. **Immediate Fix - Restart Dev Server** (REQUIRED):
   ```bash
   # Stop the server
   Ctrl+C
   
   # Restart
   npm run dev
   ```

2. **Clean Up Data**:
   ```bash
   # Nuclear option - clears all session data
   curl -X DELETE http://localhost:3000/api/sessions/reset
   ```

3. **Verify Fix**:
   ```bash
   # Should return 0
   curl -s "http://localhost:3000/api/sessions/events?limit=10" | \
     jq '[.events[] | select(.metadata.simulated == true)] | length'
   ```

**Prevention**:
- Always pause auto-activity before removing simulated sessions
- Use "Remove All" button in UI instead of individual deletions
- Restart dev server if you see phantom events

**Technical Details**:
- `setInterval()` creates timer references in Node.js event loop
- Clearing Maps doesn't clear the intervals themselves
- Intervals continue firing even after their parent objects are deleted
- Only process restart truly clears all intervals

## Key Files and Components

### Core Implementation Files

1. **Session Management**
   - `/lib/services/session-manager.js` - Singleton session store manager
   - `/lib/contexts/GlobalSessionProvider.jsx` - Main session context
   - `/lib/services/session-tracker.js` - Client-side tracking service
   - `/lib/utils/session-storage.js` - localStorage persistence
   - `/lib/utils/session-constants.js` - Event types and labels

2. **Event Tracking Hooks**
   - `/lib/hooks/useSessionEmitter.js` - Event emission logic
   - `/lib/hooks/useButtonTracking.js` - Global button click tracking
   - `/lib/hooks/useUserTracking.js` - Subscribe to session updates

3. **API Endpoints**
   - `/app/api/sessions/route.js` - Session CRUD with reuse logic
   - `/app/api/sessions/events/route.js` - Event ingestion
   - `/app/api/sessions/simulate/route.js` - Test session generation
   - `/app/api/sessions/cleanup/route.js` - Manual cleanup

4. **UI Components**
   - `/app/dev/user-tracking/page.jsx` - Main tracking dashboard
   - `/components/ui/activity-timeline.jsx` - Event timeline display
   - `/components/ui/session-card.jsx` - Session status cards
   - `/components/conversation-board/FlippableCard.jsx` - Card flip tracking

5. **Integration Points**
   - `/components/conversation-board/Board.jsx` - Card event emissions
   - `/app/providers.jsx` - GlobalSessionProvider wrapper

## Related Documentation

- [UI Constants](./ui-constants.md) - Theme and styling system
- [Card Type Constants](./card-type-constants.md) - Card system constants
- [Database Schema](./database.md) - Data persistence layer
- [Testing Guide](./testing.md) - Test writing and running

## Common Issues and Solutions

### Issue: Events Not Appearing in Timeline

**Symptoms**: 
- Only seeing session start/end events
- Card/UI events missing from timeline

**Diagnosis**:
```bash
# Check if events are being received
curl -s "http://localhost:3000/api/sessions/events?limit=20" | jq '[.events[].type] | unique'

# Should see various types like:
# ["button_clicked", "card_moved", "session_start", "user_active"]
```

**Solutions**:
1. Verify sessionTracker is initialized:
   - Check console for `[SessionTracker] Starting session for:` message
   - Ensure GlobalSessionProvider wraps the app

2. Check event emission:
   - Look for console warnings: `[SessionTracker] No current session, cannot emit event`
   - Verify user context is available before emitting

3. Verify event batching is working:
   - Events are sent in batches (10 events or 500ms timeout)
   - Check Network tab for POST to `/api/sessions/events`

### Issue: Event Labels Show Raw Type Strings

**Symptoms**:
- Seeing "card_moved" instead of "Moved Card"
- Event types not human-readable

**Solution**:
Ensure `SESSION_EVENT_LABELS` uses string keys:
```javascript
// ✅ Correct
'card_moved': 'Moved Card'

// ❌ Wrong
[SESSION_EVENT_TYPES.CARD_MOVED]: 'Moved Card'
```

### Issue: Button Clicks Not Tracked

**Symptoms**:
- No `button_clicked` events in timeline
- UI interactions not captured

**Solution**:
1. Ensure `useButtonTracking` hook is imported and called in main components
2. Check that buttons are actual `<button>` elements (not divs with onClick)
3. Verify GlobalSessionProvider is initialized before button clicks

## Quick Troubleshooting Checklist

When user tracking issues occur, follow this checklist in order:

1. **Check Browser Console**
   - Look for `[Board]`, `[GlobalSessionProvider]`, `[Sessions API]` logs
   - Check for errors in network tab

2. **Verify Session State**
   ```bash
   # Total sessions
   curl -s http://localhost:3000/api/sessions | jq '.total'
   
   # Simulated sessions
   curl -s http://localhost:3000/api/sessions/simulate | jq '.total'
   
   # Recent events
   curl -s "http://localhost:3000/api/sessions/events?limit=5" | jq '.events[].type'
   ```

3. **Check localStorage**
   ```javascript
   localStorage.getItem('conversation_tracker_session')
   ```

4. **Clean Up If Needed**
   ```bash
   # Clean specific user sessions
   curl -X DELETE "http://localhost:3000/api/sessions/cleanup?userId=USER_ID"
   
   # Clean simulated sessions
   curl -X DELETE http://localhost:3000/api/sessions/simulate
   
   # Nuclear reset
   curl -X DELETE http://localhost:3000/api/sessions/reset
   ```

5. **Restart Dev Server** (Last Resort)
   - Fixes orphaned intervals
   - Clears in-memory stores
   - Resets all event listeners

## Key Lessons Learned

### Session Persistence Challenge
**Problem**: Every browser refresh created new sessions, leading to 8+ sessions per user.

**Solution**: 
- Store session ID in localStorage with timestamp
- Check for existing session before creating new one
- Reuse sessions within 30-minute window
- Limit to 2 concurrent sessions per user

### Provisioned Guest Session Duplication
**Problem**: Each page refresh created a new provisioned guest session instead of reusing the existing one.

**Root Cause**:
- Guest ID was generated using `Date.now()` on every initialization
- No persistence mechanism for guest IDs across refreshes
- Auto-initialization in GlobalSessionProvider created new guest on every mount

**Solution**:
1. Store provisioned guest ID in sessionStorage:
```javascript
const GUEST_ID_KEY = 'provisioned_guest_id';
let guestId = window.sessionStorage.getItem(GUEST_ID_KEY);
if (!guestId) {
  guestId = `guest_${Date.now()}`;
  window.sessionStorage.setItem(GUEST_ID_KEY, guestId);
}
```
2. Modified auto-initialization to only run once per page load
3. Added logic to upgrade from guest to registered user sessions

### Registered User Sessions Not Showing
**Problem**: Registered user sessions (like Branden) weren't appearing in the active sessions table.

**Root Cause**:
- GlobalSessionProvider was auto-creating a guest session on mount
- When Board component later called `initializeSession(currentUser)`, it was skipped because a session already existed
- The provisioned guest session wasn't being upgraded to a registered user session
- An `isInitialized` flag was preventing session upgrades

**Solution**:
1. Removed the `isInitialized` flag that was blocking session upgrades
2. Updated session initialization to handle all user switching scenarios:
```javascript
// Handle user switching scenarios:
// 1. Provisioned guest → Registered user
// 2. Registered user → Different registered user
// 3. Registered user → Guest (including provisioned)
// 4. Guest → Different guest

if (currentSession?.userId === user?.id && currentSession?.userType === (user?.isGuest ? 'guest' : 'registered')) {
  // Skip if already have session for exact same user
  return;
}
```
3. For registered users, reuse any active session but update the route
4. For guest users, create separate sessions per route for multi-tab support

### Phantom Events Challenge
**Problem**: Simulated events continued appearing even after deleting all simulated users.

**Root Cause**: 
- JavaScript `setInterval()` creates references in Node.js event loop
- Clearing Map entries doesn't clear the intervals
- Intervals continue firing indefinitely

**Solution**:
- Properly clear intervals before deleting sessions
- Clean up events when sessions are deleted
- Server restart as nuclear option
- Added pause/resume functionality for better control

### Event Tracking Initialization Issue
**Problem**: Card events weren't being tracked in the session timeline, only session start/end events appeared.

**Root Cause**:
- The client-side `sessionTracker` wasn't initialized for reused sessions
- Only new sessions triggered `sessionTracker.startSession()`
- Without an active session in sessionTracker, events couldn't be emitted

**Solution**:
```javascript
// Always initialize client-side tracker for all sessions
await sessionTracker.startSession(user.id, userType);
```
- Modified to check if session already exists for same user
- Prevents duplicate session creation while ensuring tracker is active

### Event Label and Category Mapping Issue
**Problem**: Events showed raw type strings like "card_moved" instead of readable labels like "Moved Card".

**Root Cause**:
- Event labels were keyed by constant references: `[SESSION_EVENT_TYPES.CARD_MOVED]: 'Moved Card'`
- But lookups used string values: `SESSION_EVENT_LABELS[event.type]` where `event.type = 'card_moved'`
- JavaScript object keys using computed properties evaluate to their values

**Solution**:
```javascript
// Changed from constant references to string literals
export const SESSION_EVENT_LABELS = {
  'card_moved': 'Moved Card',
  'card_created': 'Created Card',
  'button_clicked': 'Clicked Button',
  // ... etc
};
```

### Card Flip Event Tracking
**Problem**: Card flip events weren't being tracked in the session timeline.

**Solution**:
1. Added `useGlobalSession` hook to FlippableCard component
2. Emit event after successful flip:
```javascript
emitCardEvent('flipped', {
  cardId: card.id,
  flippedBy: source,
  zone: card.zone,
  from: isFlipped ? 'faceDown' : 'faceUp',
  flippedTo: isFlipped ? 'faceUp' : 'faceDown',
});
```

### Global Button Click Tracking
**Problem**: Button clicks throughout the app weren't being tracked.

**Solution**: Created a global button tracking system using event delegation:

1. Created `useButtonTracking` hook that listens to all clicks
2. Uses event delegation to catch all button clicks at document level
3. Automatically extracts button metadata:
   - Label from aria-label, title, or text content
   - Variant from className analysis
   - Icon presence detection
4. Added to main components (Board, UserTracking page)

**Benefits**:
- No need to modify individual buttons
- Works automatically for all current and future buttons
- Captures rich metadata for analytics

### Event Count Not Incrementing
**Problem**: Session event counts remained at 0 even though events were being tracked.

**Root Cause**:
- The client-side `sessionTracker` was creating its own session with `createSession()` which generated a different ID
- Events were being sent with the sessionTracker's ID, but the API was looking for events with the API's session ID
- Mismatch between client and server session IDs meant events couldn't be associated with sessions

**Solution**:
1. Modified `sessionTracker.startSession()` to accept an optional session ID parameter:
```javascript
async startSession(userId, userType, existingSessionId = null) {
  if (existingSessionId) {
    // Use the session ID from the API
    this.currentSession = {
      id: existingSessionId,
      // ... other session properties
    };
  } else {
    // Create new session with generated ID
    this.currentSession = createSession(userId, userType);
  }
}
```
2. Pass the API session ID to sessionTracker when initializing:
```javascript
await sessionTracker.startSession(user.id, userType, session.id);
```

### Guest User ID Normalization Issue
**Problem**: Guest users were being tracked but their sessions weren't working properly.

**Root Cause**:
In `useGuestUsers.js`, the `getCurrentUser` function was overriding guest IDs:
```javascript
// Old problematic code:
if (isGuestMode && currentGuestUser) {
  return { ...currentGuestUser, id: 'guest' }; // This broke session tracking!
}
```

**Solution**:
Keep the actual guest ID for proper session tracking:
```javascript
if (isGuestMode && currentGuestUser) {
  return currentGuestUser; // Preserve the actual guest ID
}
```

### React Key Prop Warning in Timeline
**Problem**: "Each child in a list should have a unique key prop" warning in ActivityTimeline.

**Root Cause**:
- Some events from the API might have duplicate IDs or missing IDs
- React requires unique keys for list items to properly track component state

**Solution**:
Added deduplication and ID generation in the `filteredEvents` useMemo:
```javascript
const filteredEvents = useMemo(() => {
  // First, deduplicate events by ID
  const uniqueEvents = [];
  const seenIds = new Set();
  
  for (const event of events) {
    // Ensure event has an ID, generate one if missing
    const eventId = event.id || `fallback-${event.timestamp}-${event.type}`;
    if (!seenIds.has(eventId)) {
      seenIds.add(eventId);
      uniqueEvents.push({ ...event, id: eventId });
    }
  }
  // ... rest of filtering logic
}, [events, selectedCategory, maxItems]);
```

### Implementation Complexity
The session tracking system touches many layers:
- **Frontend**: React hooks, context providers, localStorage
- **Backend**: API routes, in-memory stores, event batching
- **State Management**: User context, session lifecycle, event queues
- **Cleanup**: Automatic timeouts, manual cleanup, interval management
- **Synchronization**: Client and server session IDs must match for event tracking

Success requires coordination across all layers and careful attention to cleanup.

## Best Practices and Lessons Learned

### Session Management Best Practices

1. **Always Use Stable IDs**
   - Use localStorage for cross-tab persistence (not sessionStorage)
   - Generate IDs with timestamps for debugging: `guest_${Date.now()}`
   - Store complete guest data (ID, name, avatar) to maintain consistency

2. **Synchronize Client and Server Session IDs**
   - Pass API session ID to client-side trackers
   - Never let client generate its own session ID if server provides one
   - Always verify ID match when debugging event tracking

3. **Handle All User Switching Scenarios**
   - Guest → Registered user
   - Registered → Different registered user
   - Registered → Guest (back to provisioned)
   - Guest → Different guest
   - Test each scenario when making session changes

4. **Avoid State Flags That Block Updates**
   - Don't use `isInitialized` flags that prevent session upgrades
   - Let the session initialization function handle deduplication
   - Allow session "upgrades" from provisioned to real users

5. **Deduplicate at Multiple Levels**
   - API level: Check for existing sessions before creating
   - Client level: Check for stored sessions in localStorage
   - Event level: Deduplicate events by ID before rendering

### Debugging Checklist

When sessions aren't working correctly:

1. **Check Session Creation**
   ```javascript
   // Console should show:
   [GlobalSessionProvider] User switch detected: {from: "Guest", to: "Branden", ...}
   [Board] Initializing session for user: Branden spf6lSu8SSOxZIOsYlYVd isGuest: false
   ```

2. **Verify Session IDs Match**
   ```bash
   # Check API sessions
   curl -s http://localhost:3000/api/sessions | jq '.grouped'
   
   # Check event store has matching session ID
   curl -s "http://localhost:3000/api/sessions/events?sessionId=SESSION_ID" | jq '.events[0]'
   ```

3. **Check localStorage State**
   ```javascript
   // Should have provisioned guest data
   localStorage.getItem('provisioned_guest_data')
   
   // Should have session storage
   localStorage.getItem('conversation_tracker_session')
   ```

4. **Verify User Context**
   ```javascript
   // In console, check current user
   console.log('Current user:', currentUser)
   // Should show actual ID, not 'guest' for guest users
   ```

### Common Pitfalls to Avoid

1. **Don't Override Guest IDs** - Keep actual IDs for tracking
2. **Don't Use sessionStorage for Cross-Tab Data** - Use localStorage
3. **Don't Skip Event Deduplication** - Assume duplicates will happen
4. **Don't Trust Initial State** - Users can switch at any time
5. **Don't Forget Session Cleanup** - Old sessions accumulate quickly

## Conclusion

The User Tracking system is a complex but robust solution for monitoring user sessions. The key to its reliability is:

1. **Session persistence** through localStorage with proper expiry
2. **Intelligent reuse logic** to prevent duplicates while allowing upgrades
3. **ID synchronization** between client and server for event tracking
4. **Proper cleanup** of intervals and events
5. **Server restart** as the ultimate reset for phantom events

When debugging, always check the console logs, localStorage state, and API responses in that order. The system is designed to handle edge cases like browser refreshes, multiple tabs, and user switching while preventing session explosion through automatic cleanup and validation.

Most importantly: **When in doubt, restart the dev server** - it solves 90% of phantom event issues.