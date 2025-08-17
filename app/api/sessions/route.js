/**
 * Session Management API
 * GET /api/sessions - Get all active sessions
 * POST /api/sessions - Create a new session
 * DELETE /api/sessions/:id - End a session
 */

import { NextResponse } from 'next/server';
import { SESSION_STATUS } from '@/lib/utils/session-constants';
import sessionManager from '@/lib/services/session-manager';

// Get stores from session manager
const { sessionStore, eventStore, simulatedSessions } = sessionManager;

export async function GET(request) {
  try {
    // Stores are now from sessionManager
    
    // Get all active sessions from store
    const regularSessions = Array.from(sessionStore.values())
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

    return NextResponse.json({
      grouped,
      guests,
      total: sessions.length,
      timestamp: Date.now(),
    });
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
    const { userId, userType, browser, metadata, sessionId: existingSessionId } = body;

    // Validate userId
    if (!userId || userId === 'undefined' || userId === 'null') {
      console.error('[Sessions API] Invalid userId:', userId);
      return NextResponse.json(
        { error: 'Valid userId is required' },
        { status: 400 }
      );
    }

    console.log('[Sessions API] Session request for user:', userId, userType, 'Existing ID:', existingSessionId);

    // Check if we should reuse an existing session
    if (existingSessionId && sessionStore.has(existingSessionId)) {
      const existingSession = sessionStore.get(existingSessionId);
      
      // Verify it's for the same user and still active
      if (existingSession.userId === userId && existingSession.status === SESSION_STATUS.ACTIVE) {
        // Update activity timestamp and route
        existingSession.lastActivityAt = Date.now();
        existingSession.currentRoute = metadata?.route || existingSession.currentRoute;
        
        console.log('[Sessions API] Reusing existing session:', existingSessionId);
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
    
    const currentRoute = metadata?.route || '/';
    
    // For guest sessions, create separate sessions per route to track different tabs
    if (userType === 'guest') {
      // Check if we have an active session for this exact route
      const exactRouteMatch = userSessions.find(({ session }) => 
        session.currentRoute === currentRoute
      );
      
      if (exactRouteMatch) {
        // Only reuse if the route matches exactly and session is recent (< 5 minutes old)
        const age = Date.now() - exactRouteMatch.session.lastActivityAt;
        if (age < 5 * 60 * 1000) {
          // Update the session
          exactRouteMatch.session.lastActivityAt = Date.now();
          
          console.log('[Sessions API] Reusing guest session for same route:', exactRouteMatch.id, currentRoute);
          return NextResponse.json(exactRouteMatch.session, { status: 200 });
        }
      }
    } else {
      // For registered users, reuse any active session but update the route
      if (userSessions.length > 0) {
        const mostRecent = userSessions.sort((a, b) => b.session.lastActivityAt - a.session.lastActivityAt)[0];
        // Update the session route and activity
        mostRecent.session.lastActivityAt = Date.now();
        mostRecent.session.currentRoute = currentRoute;
        
        console.log('[Sessions API] Reusing registered user session, updating route:', mostRecent.id, currentRoute);
        return NextResponse.json(mostRecent.session, { status: 200 });
      }
    }
    
    // Check if we have too many sessions for this user (max 3 to allow for multiple tabs)
    if (userSessions.length >= 3) {
      // Find and end the oldest session
      userSessions.sort((a, b) => a.session.lastActivityAt - b.session.lastActivityAt);
      const oldest = userSessions[0];
      
      console.log('[Sessions API] Too many sessions, ending oldest:', oldest.id);
      oldest.session.status = SESSION_STATUS.ENDED;
      oldest.session.endedAt = Date.now();
    }

    // Create new session only if no valid existing session
    const session = {
      id: existingSessionId || crypto.randomUUID(),
      userId,
      userType,
      userName: metadata?.userName || userId,
      startedAt: Date.now(),
      lastActivityAt: Date.now(),
      status: SESSION_STATUS.ACTIVE,
      browser: browser || 'Unknown',
      currentRoute: metadata?.route || '/',
      eventCount: 0,
      recentActions: [],
      metadata: metadata || {},
    };

    // Store session
    sessionStore.set(session.id, session);
    
    // Also initialize in event store
    eventStore.set(session.id, []);
    
    console.log('[Sessions API] New session created:', session.id, 'Total sessions:', sessionStore.size);

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