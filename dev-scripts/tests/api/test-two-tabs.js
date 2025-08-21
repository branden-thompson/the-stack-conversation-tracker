/**
 * Test two browser tabs to ensure each gets its own provisioned guest
 */

async function testTwoTabs() {
  console.log('🧪 Testing Two Browser Tabs\n');
  
  const baseUrl = 'http://localhost:3000';
  
  // Simulate Tab 1
  console.log('📱 Tab 1: Creating browser session...');
  const tab1SessionId = `bs_tab1_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const tab1Response = await fetch(`${baseUrl}/api/browser-sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      browserSessionId: tab1SessionId,
      metadata: { tab: 'Tab 1', route: '/' }
    })
  });
  
  const tab1BrowserSession = await tab1Response.json();
  console.log('✅ Tab 1 browser session created');
  console.log('   - Provisioned Guest:', tab1BrowserSession.provisionedGuest?.name);
  console.log('   - Guest ID:', tab1BrowserSession.provisionedGuest?.id);
  
  // Create session for Tab 1's provisioned guest
  const tab1SessionResponse = await fetch(`${baseUrl}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: tab1BrowserSession.provisionedGuest.id,
      userType: 'guest',
      browser: 'Chrome Tab 1',
      metadata: {
        userName: tab1BrowserSession.provisionedGuest.name,
        route: '/',
        provisioned: true
      }
    })
  });
  const tab1Session = await tab1SessionResponse.json();
  console.log('   - Session created:', tab1Session.id);
  
  // Small delay to simulate time between opening tabs
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Simulate Tab 2
  console.log('\n📱 Tab 2: Creating browser session...');
  const tab2SessionId = `bs_tab2_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const tab2Response = await fetch(`${baseUrl}/api/browser-sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      browserSessionId: tab2SessionId,
      metadata: { tab: 'Tab 2', route: '/dev/user-tracking' }
    })
  });
  
  const tab2BrowserSession = await tab2Response.json();
  console.log('✅ Tab 2 browser session created');
  console.log('   - Provisioned Guest:', tab2BrowserSession.provisionedGuest?.name);
  console.log('   - Guest ID:', tab2BrowserSession.provisionedGuest?.id);
  
  // Create session for Tab 2's provisioned guest
  const tab2SessionResponse = await fetch(`${baseUrl}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: tab2BrowserSession.provisionedGuest.id,
      userType: 'guest',
      browser: 'Chrome Tab 2',
      metadata: {
        userName: tab2BrowserSession.provisionedGuest.name,
        route: '/dev/user-tracking',
        provisioned: true
      }
    })
  });
  const tab2Session = await tab2SessionResponse.json();
  console.log('   - Session created:', tab2Session.id);
  
  // Verify they have different provisioned guests
  console.log('\n🔍 Verification:');
  if (tab1BrowserSession.provisionedGuest.id !== tab2BrowserSession.provisionedGuest.id) {
    console.log('✅ Each tab has a unique provisioned guest');
  } else {
    console.log('❌ Both tabs share the same provisioned guest!');
  }
  
  // Check sessions API
  console.log('\n📊 Checking sessions API...');
  const sessionsResponse = await fetch(`${baseUrl}/api/sessions`);
  const sessions = await sessionsResponse.json();
  
  console.log('Sessions state:');
  console.log('   - Registered users:', Object.keys(sessions.grouped).length);
  console.log('   - Guest users:', sessions.guests.length);
  
  if (sessions.guests.length === 2) {
    console.log('✅ Both provisioned guests appear in guests section');
    sessions.guests.forEach((guest, i) => {
      console.log(`   ${i + 1}. ${guest.userName} (${guest.userType})`);
    });
  } else {
    console.log('❌ Expected 2 guests, found:', sessions.guests.length);
  }
  
  // Clean up
  console.log('\n🧹 Cleaning up...');
  await fetch(`${baseUrl}/api/browser-sessions?id=${tab1SessionId}`, { method: 'DELETE' });
  await fetch(`${baseUrl}/api/browser-sessions?id=${tab2SessionId}`, { method: 'DELETE' });
  await fetch(`${baseUrl}/api/sessions/cleanup`, { method: 'DELETE' });
  
  console.log('✨ Test complete!');
}

testTwoTabs().catch(console.error);