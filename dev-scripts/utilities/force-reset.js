/**
 * Force reset all sessions and browser sessions
 * This is more aggressive than cleanup - it forces the server to forget everything
 */

async function forceReset() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🔥 FORCE RESETTING ALL SESSIONS...\n');
  
  // First cleanup sessions
  try {
    await fetch(`${baseUrl}/api/sessions/cleanup`, { method: 'DELETE' });
    console.log('✅ Cleaned up sessions');
  } catch (error) {
    console.error('Error cleaning sessions:', error.message);
  }
  
  // Get all sessions
  const response = await fetch(`${baseUrl}/api/sessions`);
  const sessions = await response.json();
  
  console.log('\nCurrent state after cleanup:');
  console.log('  Total sessions:', sessions.total);
  console.log('  Registered:', Object.keys(sessions.grouped).length);
  console.log('  Guests:', sessions.guests.length);
  
  // If there are still sessions, we need to clear the server's memory
  if (sessions.total > 0) {
    console.log('\n⚠️  Sessions still exist in memory. Server restart required.');
    console.log('Please restart the server (Ctrl+C and npm run dev) to fully clear state.');
  } else {
    console.log('\n✅ All sessions cleared successfully!');
  }
  
  console.log('\n📝 Instructions for clean test:');
  console.log('1. Clear all browser data (cookies, localStorage, sessionStorage)');
  console.log('2. If sessions still exist, restart the server');
  console.log('3. Open fresh browser tabs');
  console.log('4. Navigate to http://localhost:3000/');
}

forceReset().catch(console.error);