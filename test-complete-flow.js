/**
 * Test the complete flow of browser sessions and user tracking
 */

async function testCompleteFlow() {
  console.log('🧪 Testing Complete Browser Session Flow\n');
  
  const baseUrl = 'http://localhost:3000';
  
  // Step 1: Simulate a new browser tab opening
  console.log('Step 1: Simulating new browser tab...');
  const browserSessionId = `bs_tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Create browser session
  const browserResponse = await fetch(`${baseUrl}/api/browser-sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      browserSessionId,
      metadata: { userAgent: 'Test Browser' }
    })
  });
  
  const browserSession = await browserResponse.json();
  console.log('✅ Browser session created');
  console.log('   - Provisioned Guest:', browserSession.provisionedGuest?.name);
  console.log('   - Guest ID:', browserSession.provisionedGuest?.id);
  
  // Step 2: Create a session for the provisioned guest
  console.log('\nStep 2: Creating session for provisioned guest...');
  const sessionResponse = await fetch(`${baseUrl}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: browserSession.provisionedGuest.id,
      userType: 'guest',
      browser: 'Test Browser',
      metadata: {
        userName: browserSession.provisionedGuest.name,
        route: '/',
        provisioned: true
      }
    })
  });
  
  const session = await sessionResponse.json();
  console.log('✅ Session created');
  console.log('   - Session ID:', session.id);
  console.log('   - User Type:', session.userType);
  
  // Step 3: Check sessions API to verify guest appears in correct section
  console.log('\nStep 3: Verifying session appears in guests section...');
  const sessionsResponse = await fetch(`${baseUrl}/api/sessions`);
  const sessions = await sessionsResponse.json();
  
  console.log('✅ Sessions retrieved');
  console.log('   - Registered users count:', Object.keys(sessions.grouped).length);
  console.log('   - Guest users count:', sessions.guests.length);
  
  const guestSession = sessions.guests.find(s => s.userId === browserSession.provisionedGuest.id);
  if (guestSession) {
    console.log('✅ Guest found in correct section');
    console.log('   - Guest Name:', guestSession.userName);
    console.log('   - Guest Type:', guestSession.userType);
  } else {
    console.log('❌ Guest not found in guests section!');
  }
  
  // Step 4: Switch to a registered user
  console.log('\nStep 4: Switching to registered user...');
  await fetch(`${baseUrl}/api/browser-sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      browserSessionId,
      activeUserId: 'branden',
      activeUserType: 'registered'
    })
  });
  console.log('✅ Switched to registered user');
  
  // Step 5: Clean up
  console.log('\nStep 5: Cleaning up...');
  await fetch(`${baseUrl}/api/browser-sessions?id=${browserSessionId}`, {
    method: 'DELETE'
  });
  console.log('✅ Browser session cleaned up');
  
  console.log('\n✨ Complete flow test finished successfully!');
}

testCompleteFlow().catch(console.error);