# User Tracking System Documentation

## Overview

The conversation tracker implements a sophisticated user tracking system that manages both registered users and provisioned guests across browser tabs and sessions. This system ensures proper user isolation, session persistence, and seamless switching between different user contexts.

## Key Features

- **Unique provisioned guest per browser tab** - Each tab gets its own guest identity
- **Session persistence** - User sessions are tracked server-side
- **Seamless user switching** - Switch between registered users and guests without losing context
- **Automatic cleanup** - Sessions end properly when tabs close
- **Real-time tracking** - View all active users and sessions at `/dev/user-tracking`

## Expected Behaviors

### 1. NEW BROWSER TAB
**Requirement**: Each new browser tab should get its own unique provisioned guest

**Current Behavior**: ✅ Working correctly
- Opens with a unique provisioned guest (e.g., "Curious Owl", "Helpful Dolphin")
- Guest has a unique avatar and ID
- Session is created and tracked server-side
- Guest appears in "Active Provisioned Guests" section of tracking page

**Example**:
```
Tab 1: Opens → Creates "Engaged Falcon" (guest_n4s8qVO1)
Tab 2: Opens → Creates "Collaborative Fox" (guest_oxa6EadV)
Both tabs maintain separate identities
```

### 2. BROWSER REFRESH
**Requirement**: Remember last active user after refresh

**Current Behavior**: ⚠️ Partially working
- Creates a new provisioned guest on refresh (acceptable trade-off)
- Previous guest session is properly cleaned up
- No session accumulation or memory leaks

**Note**: Full persistence would require database/Redis storage. Current in-memory approach is simpler but resets on refresh.

**Example**:
```
Before refresh: "Quick Penguin" active
After refresh: New guest "Helpful Dolphin" created
Quick Penguin session marked as ended
```

### 3. BROWSER TAB CLOSE
**Requirement**: Clean up provisioned guest when tab closes

**Current Behavior**: ✅ Working correctly
- Uses `sendBeacon` API to notify server on tab close
- Session is marked as ended
- Guest removed from active users list
- No orphaned sessions

**Example**:
```
Tab with "Curious Owl" closes
→ sendBeacon fires
→ Session ends on server
→ "Curious Owl" disappears from tracking page
```

### 4. USER SWITCHING
**Requirement**: Support switching between registered users and guests

**Current Behavior**: ✅ Working correctly
- Switch from guest → registered user works
- Switch from registered → guest restores original provisioned guest
- Profile pictures and names maintain correctly
- Sessions transition between active/inactive states

**Example**:
```
Start: "Anonymous Penguin" (guest)
Switch to: "Branden" (registered)
Switch back: "Anonymous Penguin" restored (same guest, not new)
```

## Architecture

### Client-Side Components

1. **`/lib/hooks/useGuestUsers.js`**
   - Main hook managing guest users and switching logic
   - Handles provisioned guest creation and restoration
   - Manages browser session coordination

2. **`/lib/utils/browser-session.js`**
   - Creates unique browser session IDs using `sessionStorage`
   - Ensures tab isolation (each tab has unique ID)

3. **`/lib/contexts/GlobalSessionProvider.jsx`**
   - Global session management at app level
   - Auto-initializes sessions on app boot
   - Handles session lifecycle and cleanup

### Server-Side Components

1. **`/app/api/browser-sessions/route.js`**
   - Tracks browser sessions server-side
   - Creates provisioned guest for each browser tab
   - Maintains mapping between browser session and guest

2. **`/app/api/sessions/route.js`**
   - Main session management API
   - Creates, retrieves, and ends user sessions
   - Filters sessions by status (active/inactive/ended)

3. **`/lib/services/session-manager.js`**
   - Singleton service managing global session store
   - Handles automatic cleanup of stale sessions
   - Prevents memory leaks with periodic cleanup

## Common Issues and Solutions

### Issue 1: Sessions showing as "ended" immediately after creation
**Problem**: Cleanup interval was using wrong timestamp for age calculation
**Solution**: Fixed to use `endedAt` for ended sessions, `lastActivityAt` for active ones
```javascript
// Before (wrong):
const age = now - session.lastActivityAt;

// After (correct):
const referenceTime = session.status === SESSION_STATUS.ENDED 
  ? (session.endedAt || session.lastActivityAt)
  : session.lastActivityAt;
const age = now - referenceTime;
```

### Issue 2: Provisioned guest not restored when switching back from registered user
**Problem**: System was creating new guest instead of restoring browser session's guest
**Solution**: Modified `handleGuestModeSwitch` to check browser session first
```javascript
// Now fetches from browser session before creating new
let guestToUse = provisionedGuest;
if (!guestToUse) {
  // Try to get from browser session on server
  const response = await fetch(`/api/browser-sessions?id=${browserSessionId}`);
  // ... restore provisioned guest
}
```

### Issue 3: Null reference errors during user switching
**Problem**: Code referenced `provisionedGuest` variable that could be null
**Solution**: Use local `guestToUse` variable consistently after fetching

## Testing the System

### View Active Sessions
Navigate to `/dev/user-tracking` to see:
- Registered Users (with session counts)
- Active Provisioned Guests
- Inactive Provisioned Guests

### Test User Switching
1. Open browser tab (provisioned guest created)
2. Select registered user from dropdown
3. Select "Guest Mode" to switch back
4. Verify same provisioned guest is restored

### Test Tab Isolation
1. Open two browser tabs
2. Each should have different provisioned guest
3. User actions in one tab shouldn't affect the other

## Configuration

### Session Timeouts
Located in `/lib/services/session-manager.js`:
```javascript
const INACTIVE_TIMEOUT = 30 * 60 * 1000;  // 30 minutes
const SESSION_TIMEOUT = 24 * 60 * 60 * 1000;  // 24 hours
```

### Cleanup Interval
Sessions are cleaned up every 5 minutes:
```javascript
setInterval(() => { /* cleanup logic */ }, 5 * 60 * 1000);
```

---

## Technical Context for AI Agents

### System Architecture Deep Dive

#### Browser Session Management
The system uses `sessionStorage` to create unique browser session IDs that persist for the tab's lifetime but not across refreshes. This is intentional - using `localStorage` would share sessions across tabs, breaking the requirement for tab isolation.

```javascript
// Browser session created in /lib/utils/browser-session.js
const BROWSER_SESSION_KEY = 'browser_session_id';
let browserSessionId = sessionStorage.getItem(BROWSER_SESSION_KEY);
if (!browserSessionId) {
  browserSessionId = `bs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem(BROWSER_SESSION_KEY, browserSessionId);
}
```

#### Provisioned Guest Lifecycle

1. **Creation**: When a new tab opens, `useGuestUsers` hook initializes
2. **Server Registration**: Browser session ID sent to `/api/browser-sessions`
3. **Guest Provisioning**: Server creates unique guest with name/avatar
4. **Session Creation**: GlobalSessionProvider creates server-side session
5. **Activity Tracking**: Session updated with user actions
6. **Cleanup**: sendBeacon notifies server on tab close

#### Critical State Management

The system maintains several synchronized states:

1. **Client State** (React):
   - `provisionedGuest` - Current tab's guest user
   - `currentGuestUser` - Active guest (may differ during switching)
   - `isGuestMode` - Boolean flag for UI state

2. **Browser State** (sessionStorage):
   - `browser_session_id` - Unique tab identifier
   - `selectedUserId` - Last selected user (for restoration attempts)

3. **Server State** (in-memory):
   - `browserSessions` - Map of browser session ID → provisioned guest
   - `sessionStore` - Map of session ID → session data
   - `eventStore` - Map of session ID → events array

#### User Switching Flow

When switching from registered to guest:

1. `handleUserSelect` called with guest ID
2. `switchToUser` queues the switch request
3. `processSwitchQueue` debounces rapid switches (25ms)
4. `handleSpecificGuestSwitch` checks if guest is provisioned guest
5. If not found, `handleGuestModeSwitch` fetches from browser session
6. Session transitions handled after 5-second delay
7. GlobalSessionProvider notified of user change

#### Session Status Transitions

Sessions have three states:
- `active` - User currently active
- `inactive` - User switched away (after 5s delay)
- `ended` - Tab closed or session expired

Transitions are handled by `/api/sessions/transition` endpoint to avoid race conditions.

#### Memory Management

The session manager prevents memory leaks through:
1. Automatic cleanup every 5 minutes
2. Inactive sessions ended after 30 minutes
3. Ended sessions deleted after 24 hours
4. Browser sessions cleaned after 1 hour of inactivity

#### SendBeacon Cleanup

Tab close detection uses the Beacon API for reliability:
```javascript
window.addEventListener('beforeunload', () => {
  const url = `/api/browser-sessions?id=${browserSessionId}`;
  navigator.sendBeacon(url, JSON.stringify({ method: 'DELETE' }));
});
```

The API handles this as a POST with method: 'DELETE' due to sendBeacon limitations.

#### Known Limitations

1. **Refresh Behavior**: Creates new guest on refresh due to in-memory storage
   - Solution would require Redis/database persistence
   - Current behavior is acceptable for POC

2. **Session Restoration**: Cannot restore sessions after server restart
   - All sessions lost on server restart
   - Would need persistent storage for production

3. **Scalability**: In-memory storage won't work across multiple servers
   - Need shared session store (Redis) for horizontal scaling

#### Critical Files and Their Roles

- **`/lib/hooks/useGuestUsers.js`** (Lines 414-592)
  - Contains `handleGuestModeSwitch`, `handleSpecificGuestSwitch`, `handleRegisteredUserSwitch`
  - Manages user switching logic and state coordination

- **`/lib/contexts/GlobalSessionProvider.jsx`** (Lines 28-131)
  - `initializeSession` function handles session creation
  - Auto-initialization logic prevents System user sessions

- **`/app/api/browser-sessions/route.js`** (Lines 15-75)
  - POST creates/updates browser sessions
  - GET retrieves browser session with provisioned guest
  - DELETE (via sendBeacon) handles cleanup

- **`/app/api/sessions/route.js`** (Lines 85-298)
  - POST creates new sessions with validation
  - Prevents System user sessions (lines 121-134)
  - Handles session reuse logic (lines 138-225)

- **`/lib/services/session-manager.js`** (Lines 41-88)
  - Cleanup interval with fixed age calculation (lines 51-56)
  - Global singleton pattern using Node.js global

#### Debugging Tips

1. Check browser console for `[useGuestUsers]`, `[GlobalSessionProvider]`, `[BrowserSession]` logs
2. Visit `/dev/user-tracking` to see real-time session state
3. Sessions API returns all active sessions: `GET /api/sessions`
4. Browser sessions can be checked: `GET /api/browser-sessions?id=<browser_session_id>`
5. Look for "Transitioned to guest mode" log to confirm successful switches

#### Common Pitfalls to Avoid

1. Don't use `localStorage` for browser sessions - breaks tab isolation
2. Don't create sessions for System user - it's a placeholder
3. Don't delete guest sessions immediately on user switch - use inactive state
4. Don't trust `provisionedGuest` state var during switches - fetch from browser session
5. Don't assume sessions persist across refreshes - they don't by design