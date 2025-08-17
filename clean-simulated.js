// Direct cleanup of simulated events via API
async function cleanSimulated() {
  // First, remove all simulated sessions
  console.log('Removing all simulated sessions...');
  const deleteSimResponse = await fetch('http://localhost:3000/api/sessions/simulate', {
    method: 'DELETE'
  });
  const deleteSimResult = await deleteSimResponse.json();
  console.log('Removed sessions:', deleteSimResult);
  
  // Force clean simulated events
  console.log('\nCleaning simulated events...');
  const cleanResponse = await fetch('http://localhost:3000/api/sessions/events/cleanup?simulated=true', {
    method: 'DELETE'
  });
  const cleanResult = await cleanResponse.json();
  console.log('Cleanup result:', cleanResult);
  
  // Check remaining events
  const eventsResponse = await fetch('http://localhost:3000/api/sessions/events?limit=100');
  const eventsData = await eventsResponse.json();
  
  const simulatedEvents = eventsData.events.filter(e => 
    e.sessionId?.startsWith('sim_') || e.metadata?.simulated === true
  );
  
  console.log('\nRemaining simulated events:', simulatedEvents.length);
  if (simulatedEvents.length > 0) {
    console.log('Still have phantom events from sessions:');
    const sessionIds = new Set(simulatedEvents.map(e => e.sessionId));
    sessionIds.forEach(id => console.log(`  - ${id}`));
  } else {
    console.log('All simulated events cleaned!');
  }
}

cleanSimulated().catch(console.error);