/**
 * Session Reset API
 * DELETE /api/sessions/reset - Nuclear option to reset all session data
 * Use with caution - this clears EVERYTHING
 */

import { NextResponse } from 'next/server';
import sessionManager from '@/lib/services/session-manager';

export async function DELETE(request) {
  try {
    // Get stores from session manager
    const { sessionStore, eventStore, simulatedSessions } = sessionManager;
    
    // Count before clearing
    const sessionCount = sessionStore.size;
    const eventSessionCount = eventStore.size;
    const simulatedCount = simulatedSessions.size;
    
    let totalEvents = 0;
    for (const [, events] of eventStore.entries()) {
      totalEvents += events?.length || 0;
    }
    
    // Clear intervals for simulated sessions
    for (const [, simData] of simulatedSessions.entries()) {
      if (simData.interval) {
        clearInterval(simData.interval);
      }
    }
    
    // Clear everything
    sessionStore.clear();
    eventStore.clear();
    simulatedSessions.clear();
    
    console.log('[Session Reset] Cleared all session data');
    console.log(`  - ${sessionCount} sessions`);
    console.log(`  - ${totalEvents} events from ${eventSessionCount} sessions`);
    console.log(`  - ${simulatedCount} simulated sessions`);
    
    return NextResponse.json({
      success: true,
      message: 'All session data cleared',
      cleared: {
        sessions: sessionCount,
        eventSessions: eventSessionCount,
        totalEvents,
        simulatedSessions: simulatedCount
      }
    });
  } catch (error) {
    console.error('Error resetting sessions:', error);
    return NextResponse.json(
      { error: 'Failed to reset sessions' },
      { status: 500 }
    );
  }
}