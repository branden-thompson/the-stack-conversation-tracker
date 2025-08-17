/**
 * Clean up all sessions and browser sessions
 */

async function cleanupAll() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧹 Cleaning up all sessions and browser sessions...\n');
  
  // Clean up regular sessions
  try {
    const response = await fetch(`${baseUrl}/api/sessions/cleanup`, {
      method: 'DELETE'
    });
    const result = await response.json();
    console.log('✅ Sessions cleanup:', result.message);
  } catch (error) {
    console.error('❌ Failed to cleanup sessions:', error.message);
  }
  
  // Get all sessions to see what's there
  try {
    const response = await fetch(`${baseUrl}/api/sessions`);
    const sessions = await response.json();
    console.log('\n📊 Current state:');
    console.log('   - Registered users:', Object.keys(sessions.grouped).length);
    console.log('   - Guest users:', sessions.guests.length);
    console.log('   - Total sessions:', sessions.total);
    
    // Show details if any exist
    if (Object.keys(sessions.grouped).length > 0) {
      console.log('\n   Registered user sessions:');
      Object.entries(sessions.grouped).forEach(([userId, userSessions]) => {
        console.log(`     - ${userId}: ${userSessions.length} session(s)`);
        userSessions.forEach(s => {
          console.log(`       • ${s.userName || 'Unknown'} (${s.userType || 'unknown type'})`);
        });
      });
    }
    
    if (sessions.guests.length > 0) {
      console.log('\n   Guest sessions:');
      sessions.guests.forEach(s => {
        console.log(`     - ${s.userName}: ${s.userType} (${s.status})`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to get sessions:', error.message);
  }
  
  console.log('\n✨ Cleanup complete!');
}

cleanupAll().catch(console.error);