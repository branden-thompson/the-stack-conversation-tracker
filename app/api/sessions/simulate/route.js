/**
 * Session Simulation API
 * POST /api/sessions/simulate - Create simulated guest sessions for testing
 * DELETE /api/sessions/simulate - Remove simulated sessions
 */

import { NextResponse } from 'next/server';
import { 
  SESSION_EVENT_TYPES, 
  SESSION_USER_TYPES,
  SESSION_STATUS,
  getBrowserInfo,
} from '@/lib/utils/session-constants';
import sessionManager from '@/lib/services/session-manager';

// Get stores from session manager
const { simulatedSessions, eventStore } = sessionManager;

// Export simulatedSessions for other routes that import it
export { simulatedSessions };

// Guest names for simulation
const GUEST_NAMES = [
  'Curious Cat', 'Happy Hippo', 'Brave Bear', 'Wise Owl',
  'Swift Fox', 'Gentle Giraffe', 'Clever Crow', 'Dancing Dolphin',
  'Eager Eagle', 'Friendly Frog', 'Jumping Jack', 'Lucky Lion',
];

// Routes for simulation
const SIMULATED_ROUTES = [
  '/',
  '/dev/tests',
  '/dev/convos',
  '/dev/user-tracking',
];

// Actions for simulation
const SIMULATED_ACTIONS = [
  { type: SESSION_EVENT_TYPES.CARD_CREATED, weight: 3 },
  { type: SESSION_EVENT_TYPES.CARD_UPDATED, weight: 5 },
  { type: SESSION_EVENT_TYPES.CARD_MOVED, weight: 4 },
  { type: SESSION_EVENT_TYPES.CARD_DELETED, weight: 1 },
  { type: SESSION_EVENT_TYPES.DIALOG_OPENED, weight: 2 },
  { type: SESSION_EVENT_TYPES.BUTTON_CLICKED, weight: 6 },
  { type: SESSION_EVENT_TYPES.TEST_VIEW, weight: 2 },
  { type: SESSION_EVENT_TYPES.THEME_CHANGED, weight: 1 },
];

// Browsers for simulation
const SIMULATED_BROWSERS = [
  'Chrome 120 on macOS',
  'Safari 17 on macOS',
  'Firefox 121 on Windows',
  'Chrome 120 on Windows',
  'Edge 120 on Windows',
  'Chrome 120 on Linux',
];

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function getWeightedRandom(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      return item.type;
    }
  }
  
  return items[0].type;
}

function generateGuestSession() {
  const sessionId = `sim_${crypto.randomUUID()}`;
  const guestName = getRandomElement(GUEST_NAMES);
  const guestId = `guest_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id: sessionId,
    userId: guestId,
    userName: guestName,
    userType: SESSION_USER_TYPES.GUEST,
    startedAt: Date.now() - Math.floor(Math.random() * 30 * 60 * 1000), // Random start within last 30 mins
    lastActivityAt: Date.now() - Math.floor(Math.random() * 5 * 60 * 1000), // Random activity within last 5 mins
    status: Math.random() > 0.7 ? SESSION_STATUS.IDLE : SESSION_STATUS.ACTIVE,
    browser: getRandomElement(SIMULATED_BROWSERS),
    currentRoute: getRandomElement(SIMULATED_ROUTES),
    eventCount: Math.floor(Math.random() * 50),
    recentActions: [],
    metadata: {
      simulated: true,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${guestName}`,
    },
  };
}

function simulateActivity(session) {
  // Generate random activity
  const action = getWeightedRandom(SIMULATED_ACTIONS);
  
  const event = {
    id: crypto.randomUUID(),
    type: action,
    timestamp: Date.now(),
    sessionId: session.id,
    userId: session.userId,
    metadata: {
      route: session.currentRoute,
      simulated: true,
    },
  };
  
  // Update session
  session.lastActivityAt = Date.now();
  session.eventCount++;
  session.recentActions.unshift(event);
  session.recentActions = session.recentActions.slice(0, 10);
  
  // Random route changes
  if (Math.random() < 0.1) {
    const newRoute = getRandomElement(SIMULATED_ROUTES);
    if (newRoute !== session.currentRoute) {
      session.currentRoute = newRoute;
      return [event, {
        id: crypto.randomUUID(),
        type: SESSION_EVENT_TYPES.ROUTE_CHANGE,
        timestamp: Date.now(),
        sessionId: session.id,
        userId: session.userId,
        metadata: {
          from: session.currentRoute,
          to: newRoute,
          simulated: true,
        },
      }];
    }
  }
  
  // Update status based on activity
  if (session.status === SESSION_STATUS.IDLE && Math.random() < 0.3) {
    session.status = SESSION_STATUS.ACTIVE;
  } else if (session.status === SESSION_STATUS.ACTIVE && Math.random() < 0.05) {
    session.status = SESSION_STATUS.IDLE;
  }
  
  return [event];
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { count = 1, autoActivity = false } = body;
    
    console.log(`[Simulate POST] Creating ${count} sessions, autoActivity: ${autoActivity}`);
    
    const sessions = [];
    
    for (let i = 0; i < count; i++) {
      const session = generateGuestSession();
      simulatedSessions.set(session.id, {
        session,
        interval: null,
      });
      
      // Start auto activity if requested
      if (autoActivity) {
        const simData = simulatedSessions.get(session.id);
        
        // Generate initial activity immediately
        const initialEvents = simulateActivity(session);
        fetch('http://localhost:3000/api/sessions/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: session.id,
            events: initialEvents,
          }),
        }).catch(console.error);
        
        // Then continue with interval
        simData.interval = setInterval(() => {
          const events = simulateActivity(session);
          
          // Send events to the event store (use absolute URL for internal fetch)
          fetch('http://localhost:3000/api/sessions/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId: session.id,
              events,
            }),
          }).catch(console.error);
        }, 5000 + Math.random() * 10000); // Random interval 5-15 seconds
      }
      
      sessions.push(session);
    }
    
    return NextResponse.json({
      success: true,
      sessions,
      totalSimulated: simulatedSessions.size,
    });
  } catch (error) {
    console.error('Error creating simulated sessions:', error);
    return NextResponse.json(
      { error: 'Failed to create simulated sessions' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    // Import event store for cleanup
    // eventStore already imported from sessionManager
    
    if (sessionId) {
      // Remove specific session
      const simData = simulatedSessions.get(sessionId);
      if (simData) {
        if (simData.interval) {
          clearInterval(simData.interval);
        }
        simulatedSessions.delete(sessionId);
        
        // Clean up events for this session
        if (eventStore.has(sessionId)) {
          const eventCount = eventStore.get(sessionId)?.length || 0;
          eventStore.delete(sessionId);
          console.log(`[Simulate] Cleaned ${eventCount} events for session ${sessionId}`);
        }
        
        return NextResponse.json({
          success: true,
          removed: 1,
        });
      } else {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }
    } else {
      // Remove all simulated sessions
      let cleanedEvents = 0;
      for (const [id, simData] of simulatedSessions.entries()) {
        if (simData.interval) {
          clearInterval(simData.interval);
        }
        
        // Clean up events for each session
        if (eventStore.has(id)) {
          cleanedEvents += eventStore.get(id)?.length || 0;
          eventStore.delete(id);
        }
      }
      
      const count = simulatedSessions.size;
      simulatedSessions.clear();
      
      console.log(`[Simulate] Removed ${count} sessions and cleaned ${cleanedEvents} events`);
      
      return NextResponse.json({
        success: true,
        removed: count,
      });
    }
  } catch (error) {
    console.error('Error removing simulated sessions:', error);
    return NextResponse.json(
      { error: 'Failed to remove simulated sessions' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const sessions = Array.from(simulatedSessions.values()).map(s => s.session);
    
    return NextResponse.json({
      sessions,
      total: sessions.length,
    });
  } catch (error) {
    console.error('Error fetching simulated sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch simulated sessions' },
      { status: 500 }
    );
  }
}

// Export for use in activity control endpoint
export { simulateActivity };