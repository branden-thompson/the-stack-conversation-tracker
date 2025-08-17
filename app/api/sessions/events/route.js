/**
 * Session Events API
 * POST /api/sessions/events - Batch ingest events
 * GET /api/sessions/events?sessionId=xxx - Get events for a session
 */

import { NextResponse } from 'next/server';

// Import shared session store (in production, use proper data store)
// For now, we'll use a simple in-memory store
export const eventStore = new Map(); // sessionId -> events[]

// Maximum events to keep per session
const MAX_EVENTS_PER_SESSION = 1000;

export async function POST(request) {
  try {
    const body = await request.json();
    const { sessionId, events } = body;

    if (!sessionId || !events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Get or create event list for session
    if (!eventStore.has(sessionId)) {
      eventStore.set(sessionId, []);
    }

    const sessionEvents = eventStore.get(sessionId);
    
    // Add new events
    events.forEach(event => {
      sessionEvents.push({
        ...event,
        receivedAt: Date.now(),
      });
    });

    // Trim to max size (keep most recent)
    if (sessionEvents.length > MAX_EVENTS_PER_SESSION) {
      eventStore.set(
        sessionId, 
        sessionEvents.slice(-MAX_EVENTS_PER_SESSION)
      );
    }

    // Update session activity timestamp in the main session store
    try {
      const { sessionStore } = await import('../route.js');
      if (sessionStore.has(sessionId)) {
        const session = sessionStore.get(sessionId);
        session.lastActivityAt = Date.now();
        session.eventCount = sessionEvents.length;
        
        // Add most recent action to session
        if (events.length > 0) {
          const lastEvent = events[events.length - 1];
          if (!session.recentActions) {
            session.recentActions = [];
          }
          session.recentActions.unshift({
            type: lastEvent.type,
            timestamp: lastEvent.timestamp,
            metadata: lastEvent.metadata,
          });
          session.recentActions = session.recentActions.slice(0, 10);
        }
      }
    } catch (error) {
      console.error('Failed to update session:', error);
    }

    return NextResponse.json({ 
      success: true, 
      eventsReceived: events.length,
      totalEvents: sessionEvents.length,
    });
  } catch (error) {
    console.error('Error processing events:', error);
    return NextResponse.json(
      { error: 'Failed to process events' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '100');
    const category = searchParams.get('category');

    if (!sessionId) {
      // Return all recent events across sessions
      const allEvents = [];
      for (const [sid, events] of eventStore.entries()) {
        allEvents.push(...events.map(e => ({ ...e, sessionId: sid })));
      }
      
      // Sort by timestamp
      allEvents.sort((a, b) => b.timestamp - a.timestamp);
      
      // Apply category filter if specified
      let filtered = allEvents;
      if (category) {
        filtered = allEvents.filter(e => e.category === category);
      }
      
      return NextResponse.json({
        events: filtered.slice(0, limit),
        total: filtered.length,
      });
    }

    // Get events for specific session
    const events = eventStore.get(sessionId) || [];
    
    // Apply category filter if specified
    let filtered = events;
    if (category) {
      filtered = events.filter(e => e.category === category);
    }
    
    // Sort by timestamp (most recent first)
    filtered.sort((a, b) => b.timestamp - a.timestamp);
    
    return NextResponse.json({
      sessionId,
      events: filtered.slice(0, limit),
      total: filtered.length,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// Export the stores for use in other endpoints
export { eventStore };