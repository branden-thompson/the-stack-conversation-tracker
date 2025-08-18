/**
 * Session Management API
 * GET /api/sessions - Get all active sessions
 * POST /api/sessions - Create a new session
 * DELETE /api/sessions/:id - End a session
 */

import { NextResponse } from 'next/server';
import { SESSION_STATUS } from '@/lib/utils/session-constants';
import sessionManager from '@/lib/services/session-manager';
import { withCache, invalidateCachePattern } from '@/lib/cache/api-cache';

// Get stores from session manager
const { sessionStore, eventStore, simulatedSessions } = sessionManager;

export async function GET(request) {
  try {
    // Try cache first for sessions data
    const cache = withCache('sessions');
    const cachedData = cache.get();
    
    if (cachedData) {
      return NextResponse.json(cachedData);
    }
    
    // Cache miss - fetch fresh data
    // Get all active sessions from store
    const allSessions = Array.from(sessionStore.values());
    
    const regularSessions = allSessions
      .filter(session => session.status !== SESSION_STATUS.ENDED)
      .map(session => ({
        ...session,
        events: eventStore.get(session.id) || [],
      }));
    
    // Get simulated sessions
    const simSessions = Array.from(simulatedSessions?.values() || [])
      .map(sim => ({
        ...sim.session,
        events: eventStore.get(sim.session.id) || [],
      }));
    
    // Combine all sessions
    const sessions = [...regularSessions, ...simSessions];

    // Group sessions by userId for registered users
    const grouped = {};
    const guests = [];

    sessions.forEach(session => {
      if (session.userType === 'guest') {
        guests.push(session);
      } else {
        if (!grouped[session.userId]) {
          grouped[session.userId] = [];
        }
        grouped[session.userId].push(session);
      }
    });

    const data = {
      grouped,
      guests,
      total: sessions.length,
      timestamp: Date.now(),
    };
    
    // Cache the result
    cache.set(data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Handle DELETE via sendBeacon (which sends POST with method: 'DELETE')
    if (body.method === 'DELETE') {
      const { searchParams } = new URL(request.url);
      const sessionId = searchParams.get('id');
      
      if (sessionId && sessionStore.has(sessionId)) {
        const session = sessionStore.get(sessionId);
        // Ending session via sendBeacon
        session.status = SESSION_STATUS.ENDED;
        session.endedAt = Date.now();
        return NextResponse.json({ success: true, message: 'Session ended' });
      }
      
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    const { userId, userType, browser, metadata, sessionId: existingSessionId } = body;
    
    // POST request received

    // Validate userId
    if (!userId || userId === 'undefined' || userId === 'null') {
      console.error('[Sessions API] Invalid userId:', userId);
      return NextResponse.json(
        { error: 'Valid userId is required' },
        { status: 400 }
      );
    }
    
    // CRITICAL: Don't create sessions for system user
    if (userId === 'system' || metadata?.isSystemUser === true) {
      // Skipping session creation for system user
      return NextResponse.json(
        { 
          id: 'system-no-session',
          userId: 'system',
          userName: 'System',
          status: 'system',
          message: 'System user does not require sessions' 
        },
        { status: 200 }
      );
    }

    // Session request for user

    // Check if we should reuse an existing session
    if (existingSessionId && sessionStore.has(existingSessionId)) {
      const existingSession = sessionStore.get(existingSessionId);
      
      // Verify it's for the same user and still active
      if (existingSession.userId === userId && existingSession.status === SESSION_STATUS.ACTIVE) {
        // Update activity timestamp and route
        existingSession.lastActivityAt = Date.now();
        existingSession.currentRoute = metadata?.route || existingSession.currentRoute;
        
        // Track route history
        if (!existingSession.routeHistory) {
          existingSession.routeHistory = [];
        }
        if (metadata?.route && metadata.route !== existingSession.currentRoute) {
          // Add to route history if it's a new route
          existingSession.routeHistory.push({
            route: metadata.route,
            visitedAt: Date.now(),
            eventCount: 0
          });
        }
        
        // Reusing existing session
        return NextResponse.json(existingSession, { status: 200 });
      }
    }
    
    // Check for any active sessions for this user
    const userSessions = [];
    for (const [id, session] of sessionStore.entries()) {
      if (session.userId === userId && session.status === SESSION_STATUS.ACTIVE) {
        userSessions.push({ id, session });
      }
    }
    
    // Found existing sessions for user
    
    const currentRoute = metadata?.route || '/';
    
    // For guest sessions, handle provisioned guests differently than anonymous ones
    if (userType === 'guest') {
      // Check if this is a provisioned guest (has persistent name/avatar)
      const isProvisionedGuest = metadata?.provisioned === true;
      
      if (isProvisionedGuest && userSessions.length > 0) {
        // For provisioned guests, reuse any active session (same behavior as registered users)
        const mostRecent = userSessions.sort((a, b) => b.session.lastActivityAt - a.session.lastActivityAt)[0];
        
        // Update the session route and activity
        mostRecent.session.lastActivityAt = Date.now();
        mostRecent.session.currentRoute = currentRoute;
        
        // Reusing provisioned guest session, updating route
        return NextResponse.json(mostRecent.session, { status: 200 });
      } else if (!isProvisionedGuest) {
        // For anonymous guests, create separate sessions per route to track different tabs
        const exactRouteMatch = userSessions.find(({ session }) => 
          session.currentRoute === currentRoute
        );
        
        if (exactRouteMatch) {
          // Only reuse if the route matches exactly and session is recent (< 5 minutes old)
          const age = Date.now() - exactRouteMatch.session.lastActivityAt;
          if (age < 5 * 60 * 1000) {
            // Update the session
            exactRouteMatch.session.lastActivityAt = Date.now();
            
            // Reusing anonymous guest session for same route
            return NextResponse.json(exactRouteMatch.session, { status: 200 });
          }
        }
      }
    } else {
      // For registered users, reuse any active session but update the route
      if (userSessions.length > 0) {
        const mostRecent = userSessions.sort((a, b) => b.session.lastActivityAt - a.session.lastActivityAt)[0];
        // Update the session route and activity
        mostRecent.session.lastActivityAt = Date.now();
        
        // Track route history
        if (!mostRecent.session.routeHistory) {
          mostRecent.session.routeHistory = [{
            route: mostRecent.session.currentRoute || '/',
            visitedAt: mostRecent.session.startedAt || Date.now(),
            eventCount: 0
          }];
        }
        
        // Add to route history if it's a different route
        if (currentRoute !== mostRecent.session.currentRoute) {
          const existingRouteIndex = mostRecent.session.routeHistory.findIndex(r => r.route === currentRoute);
          
          if (existingRouteIndex >= 0) {
            // Update existing route entry
            mostRecent.session.routeHistory[existingRouteIndex].visitedAt = Date.now();
            mostRecent.session.routeHistory[existingRouteIndex].eventCount++;
          } else {
            // Add new route to history
            mostRecent.session.routeHistory.push({
              route: currentRoute,
              visitedAt: Date.now(),
              eventCount: 1
            });
          }
        }
        
        mostRecent.session.currentRoute = currentRoute;
        
        // Also clean up any guest sessions when switching to registered user
        const allGuestSessions = [];
        for (const [id, session] of sessionStore.entries()) {
          if (session.userType === 'guest' && session.status === SESSION_STATUS.ACTIVE) {
            allGuestSessions.push({ id, session });
          }
        }
        
        if (allGuestSessions.length > 0) {
          // Switching to registered user, ending guest sessions
          allGuestSessions.forEach(({ session }) => {
            session.status = SESSION_STATUS.ENDED;
            session.endedAt = Date.now();
          });
        }
        
        // Reusing registered user session, updating route
        return NextResponse.json(mostRecent.session, { status: 200 });
      }
    }
    
    // Note: Removed aggressive session cleanup logic
    // Session state transitions now handled by /api/sessions/transition endpoint
    // This allows for proper inactive state management instead of immediate deletion

    // Check if we have too many sessions for this user (max 3 to allow for multiple tabs)
    if (userSessions.length >= 3) {
      // Find and end the oldest session
      userSessions.sort((a, b) => a.session.lastActivityAt - b.session.lastActivityAt);
      const oldest = userSessions[0];
      
      // Too many sessions, ending oldest
      oldest.session.status = SESSION_STATUS.ENDED;
      oldest.session.endedAt = Date.now();
    }

    // Create new session only if no valid existing session
    // Creating session with active status
    
    const session = {
      id: existingSessionId || crypto.randomUUID(),
      userId,
      userType: userType || 'guest', // Default to guest if not specified
      userName: metadata?.userName || userId,
      startedAt: Date.now(),
      lastActivityAt: Date.now(),
      status: SESSION_STATUS.ACTIVE,
      browser: browser || 'Unknown',
      currentRoute: metadata?.route || '/',
      routeHistory: [{
        route: metadata?.route || '/',
        visitedAt: Date.now(),
        eventCount: 0
      }],
      eventCount: 0,
      recentActions: [],
      metadata: metadata || {},
    };
    
    // Session object created

    // Store session - with extra validation
    sessionStore.set(session.id, session);
    
    // Also initialize in event store
    eventStore.set(session.id, []);
    
    // Invalidate sessions cache since we created/modified a session
    invalidateCachePattern('api:sessions');
    invalidateCachePattern('api:session:');
    
    // Verify the session was stored correctly
    const storedSession = sessionStore.get(session.id);

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    const session = sessionStore.get(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Mark session as ended
    session.status = SESSION_STATUS.ENDED;
    session.endedAt = Date.now();

    // Keep in store for a while for historical data
    sessionStore.set(sessionId, session);
    
    // Invalidate sessions cache since we modified a session
    invalidateCachePattern('api:sessions');
    invalidateCachePattern('api:session:');

    return NextResponse.json({ 
      success: true, 
      session 
    });
  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    );
  }
}

// Export stores from session manager
export { sessionStore, eventStore, simulatedSessions };