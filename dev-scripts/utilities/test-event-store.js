// Quick script to check event store state
async function checkEventStore() {
  const response = await fetch('http://localhost:3000/api/sessions/events?limit=100');
  const data = await response.json();
  
  // Group events by session
  const sessionEvents = {};
  data.events.forEach(event => {
    const sid = event.sessionId || 'unknown';
    if (!sessionEvents[sid]) {
      sessionEvents[sid] = [];
    }
    sessionEvents[sid].push(event);
  });
  
  console.log('Events by session:');
  Object.entries(sessionEvents).forEach(([sid, events]) => {
    const isSimulated = sid.startsWith('sim_') || events[0]?.metadata?.simulated;
    console.log(`- ${sid}: ${events.length} events (simulated: ${isSimulated})`);
  });
  
  // Check which sessions exist
  const sessionsResponse = await fetch('http://localhost:3000/api/sessions');
  const sessionsData = await sessionsResponse.json();
  
  const simResponse = await fetch('http://localhost:3000/api/sessions/simulate');
  const simData = await simResponse.json();
  
  console.log('\nActive sessions:');
  console.log(`- Regular: ${sessionsData.total}`);
  console.log(`- Simulated: ${simData.total}`);
  
  // Find orphaned events
  const activeSessions = new Set();
  Object.keys(sessionsData.grouped || {}).forEach(userId => {
    sessionsData.grouped[userId].forEach(s => activeSessions.add(s.id));
  });
  (sessionsData.guests || []).forEach(s => activeSessions.add(s.id));
  (simData.sessions || []).forEach(s => activeSessions.add(s.id));
  
  console.log('\nOrphaned event sessions:');
  Object.keys(sessionEvents).forEach(sid => {
    if (!activeSessions.has(sid)) {
      console.log(`- ${sid}: ${sessionEvents[sid].length} orphaned events`);
    }
  });
}

checkEventStore().catch(console.error);