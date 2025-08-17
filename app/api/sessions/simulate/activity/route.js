/**
 * Simulated Session Activity Control API
 * PATCH /api/sessions/simulate/activity - Start/stop activity for simulated sessions
 */

import { NextResponse } from 'next/server';

export async function PATCH(request) {
  try {
    const body = await request.json();
    const { action, sessionId } = body; // action: 'start' | 'stop'
    
    // Import simulated sessions store
    const { simulatedSessions } = await import('../route.js');
    
    if (!action || !['start', 'stop'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Use "start" or "stop"' },
        { status: 400 }
      );
    }
    
    let affected = 0;
    
    if (sessionId) {
      // Control specific session
      const simData = simulatedSessions.get(sessionId);
      if (simData) {
        if (action === 'stop' && simData.interval) {
          clearInterval(simData.interval);
          simData.interval = null;
          affected = 1;
          console.log('[Simulate Activity] Stopped activity for session:', sessionId);
        } else if (action === 'start' && !simData.interval) {
          // Restart activity for this session
          // We need to reimplement simulateActivity here since it's not exported
          simData.interval = setInterval(() => {
            // Inline simulation logic
            const events = [];
            
            fetch('http://localhost:3000/api/sessions/events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: simData.session.id,
                events,
              }),
            }).catch(console.error);
          }, 5000 + Math.random() * 10000);
          affected = 1;
          console.log('[Simulate Activity] Started activity for session:', sessionId);
        }
      }
    } else {
      // Control all simulated sessions
      for (const [id, simData] of simulatedSessions.entries()) {
        if (action === 'stop' && simData.interval) {
          clearInterval(simData.interval);
          simData.interval = null;
          affected++;
        } else if (action === 'start' && !simData.interval) {
          // Restart activity
          const { simulateActivity } = await import('../route.js');
          simData.interval = setInterval(() => {
            const events = simulateActivity(simData.session);
            
            fetch('http://localhost:3000/api/sessions/events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                sessionId: simData.session.id,
                events,
              }),
            }).catch(console.error);
          }, 5000 + Math.random() * 10000);
          affected++;
        }
      }
      console.log(`[Simulate Activity] ${action === 'stop' ? 'Stopped' : 'Started'} activity for ${affected} sessions`);
    }
    
    return NextResponse.json({
      success: true,
      action,
      affected,
      message: `Activity ${action === 'stop' ? 'paused' : 'resumed'} for ${affected} session(s)`
    });
  } catch (error) {
    console.error('Error controlling simulated activity:', error);
    return NextResponse.json(
      { error: 'Failed to control activity' },
      { status: 500 }
    );
  }
}