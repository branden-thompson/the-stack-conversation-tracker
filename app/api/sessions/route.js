/**
 * Session Management API
 * GET /api/sessions - Get all active sessions
 * POST /api/sessions - Create a new session
 * DELETE /api/sessions/:id - End a session
 */

import { NextResponse } from 'next/server';
import { SESSION_STATUS } from '@/lib/utils/session-constants';

// In-memory session store (replace with Redis/DB in production)
const sessionStore = new Map();

// Cleanup old sessions periodically
setInterval(() => {
  const now = Date.now();
  const INACTIVE_TIMEOUT = 30 * 60 * 1000; // 30 minutes for inactive
  const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours for ended
  
  for (const [id, session] of sessionStore.entries()) {
    const age = now - session.lastActivityAt;
    
    // Mark inactive sessions as ended after 30 minutes
    if (session.status === SESSION_STATUS.ACTIVE && age > INACTIVE_TIMEOUT) {
      console.log('[Sessions Cleanup] Ending inactive session:', id);
      session.status = SESSION_STATUS.ENDED;
      session.endedAt = now;
    }
    
    // Delete ended sessions after 24 hours
    if (session.status === SESSION_STATUS.ENDED && age > SESSION_TIMEOUT) {
      console.log('[Sessions Cleanup] Deleting old session:', id);
      sessionStore.delete(id);
    }
  }
}, 5 * 60 * 1000); // Cleanup every 5 minutes

export async function GET(request) {
  try {
    // Import from other endpoints
    const { simulatedSessions } = await import('./simulate/route.js');
    const { eventStore } = await import('./events/route.js');
    
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
    // Group by route to handle multiple tabs properly
    const userSessions = new Map();
    for (const [id, session] of sessionStore.entries()) {
      if (session.userId === userId && session.status === SESSION_STATUS.ACTIVE) {
        const route = session.currentRoute || '/';
        if (!userSessions.has(route)) {
          userSessions.set(route, []);
        }
        userSessions.get(route).push({ id, session });
      }
    }
    
    const currentRoute = metadata?.route || '/';
    
    // If we have sessions for this route, reuse the most recent one
    if (userSessions.has(currentRoute)) {
      const routeSessions = userSessions.get(currentRoute);
      // Sort by last activity, most recent first
      routeSessions.sort((a, b) => b.session.lastActivityAt - a.session.lastActivityAt);
      const mostRecent = routeSessions[0];
      
      // Update the session
      mostRecent.session.lastActivityAt = Date.now();
      
      console.log('[Sessions API] Reusing most recent session for route:', mostRecent.id);
      return NextResponse.json(mostRecent.session, { status: 200 });
    }
    
    // Check if we have too many sessions for this user (max 2 - one per tab)
    const totalUserSessions = Array.from(userSessions.values()).flat().length;
    if (totalUserSessions >= 2) {
      // Find and end the oldest session
      const allSessions = Array.from(userSessions.values()).flat();
      allSessions.sort((a, b) => a.session.lastActivityAt - b.session.lastActivityAt);
      const oldest = allSessions[0];
      
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
    const { eventStore } = await import('./events/route.js');
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

// Export sessionStore for use in other endpoints
export { sessionStore };