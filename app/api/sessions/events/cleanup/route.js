/**
 * Event Cleanup API
 * DELETE /api/sessions/events/cleanup - Clean up orphaned events
 */

import { NextResponse } from 'next/server';

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const onlySimulated = searchParams.get('simulated') === 'true';
    
    // Import stores
    const { eventStore } = await import('../route.js');
    const { sessionStore } = await import('../../route.js');
    const { simulatedSessions } = await import('../../simulate/route.js');
    
    let cleanedSessions = 0;
    let cleanedEvents = 0;
    
    if (sessionId) {
      // Clean specific session's events
      if (eventStore.has(sessionId)) {
        const events = eventStore.get(sessionId);
        cleanedEvents = events ? events.length : 0;
        eventStore.delete(sessionId);
        cleanedSessions = 1;
      }
    } else if (onlySimulated) {
      // Clean all simulated session events
      for (const [id, events] of eventStore.entries()) {
        // Check if this is a simulated session (starts with 'sim_' or has simulated events)
        if (id.startsWith('sim_') || 
            (events && events.length > 0 && events[0].metadata?.simulated)) {
          cleanedEvents += events.length;
          eventStore.delete(id);
          cleanedSessions++;
        }
      }
    } else {
      // Clean orphaned events (sessions that don't exist anymore)
      const activeSessions = new Set();
      
      // Collect all active session IDs from sessionStore
      for (const [id] of sessionStore.entries()) {
        activeSessions.add(id);
      }
      
      // Collect simulated session IDs
      for (const [id] of simulatedSessions.entries()) {
        activeSessions.add(id);
      }
      
      console.log(`[Events Cleanup] Active sessions: ${activeSessions.size}`);
      console.log(`[Events Cleanup] Event store has ${eventStore.size} session entries`);
      
      // Remove events for non-existent sessions
      const toDelete = [];
      for (const [id, events] of eventStore.entries()) {
        if (!activeSessions.has(id)) {
          toDelete.push(id);
          cleanedEvents += events ? events.length : 0;
          cleanedSessions++;
        }
      }
      
      // Actually delete them
      toDelete.forEach(id => {
        eventStore.delete(id);
        console.log(`[Events Cleanup] Deleted events for orphaned session: ${id}`);
      });
    }
    
    console.log(`[Events Cleanup] Cleaned ${cleanedEvents} events from ${cleanedSessions} sessions`);
    
    return NextResponse.json({
      success: true,
      message: `Cleaned ${cleanedEvents} events from ${cleanedSessions} sessions`,
      cleanedSessions,
      cleanedEvents
    });
  } catch (error) {
    console.error('Error cleaning up events:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup events' },
      { status: 500 }
    );
  }
}