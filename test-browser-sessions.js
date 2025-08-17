/**
 * Test script for browser session functionality
 * Run this to verify the implementation is working correctly
 */

async function testBrowserSessions() {
  console.log('🧪 Testing Browser Session Implementation\n');
  
  const baseUrl = 'http://localhost:3000';
  
  // Test 1: Create a new browser session
  console.log('Test 1: Creating new browser session...');
  const browserSessionId = `bs_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    const createResponse = await fetch(`${baseUrl}/api/browser-sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        browserSessionId,
        metadata: {
          userAgent: 'Test Script',
          testRun: true
        }
      })
    });
    
    if (createResponse.ok) {
      const browserSession = await createResponse.json();
      console.log('✅ Browser session created successfully');
      console.log('   - Session ID:', browserSession.id);
      console.log('   - Provisioned Guest:', browserSession.provisionedGuest?.name);
      console.log('   - Active User:', browserSession.activeUserId);
      
      // Test 2: Retrieve the browser session
      console.log('\nTest 2: Retrieving browser session...');
      const getResponse = await fetch(`${baseUrl}/api/browser-sessions?id=${browserSessionId}`);
      
      if (getResponse.ok) {
        const retrievedSession = await getResponse.json();
        console.log('✅ Browser session retrieved successfully');
        console.log('   - Matches created session:', retrievedSession.id === browserSession.id);
      } else {
        console.log('❌ Failed to retrieve browser session');
      }
      
      // Test 3: Update browser session (switch to registered user)
      console.log('\nTest 3: Updating browser session (switching to registered user)...');
      const updateResponse = await fetch(`${baseUrl}/api/browser-sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          browserSessionId,
          activeUserId: 'branden',
          activeUserType: 'registered'
        })
      });
      
      if (updateResponse.ok) {
        const updatedSession = await updateResponse.json();
        console.log('✅ Browser session updated successfully');
        console.log('   - Active User:', updatedSession.activeUserId);
        console.log('   - Active User Type:', updatedSession.activeUserType);
      } else {
        console.log('❌ Failed to update browser session');
      }
      
      // Test 4: Delete browser session
      console.log('\nTest 4: Deleting browser session...');
      const deleteResponse = await fetch(`${baseUrl}/api/browser-sessions?id=${browserSessionId}`, {
        method: 'DELETE'
      });
      
      if (deleteResponse.ok) {
        console.log('✅ Browser session deleted successfully');
        
        // Verify it's gone
        const verifyResponse = await fetch(`${baseUrl}/api/browser-sessions?id=${browserSessionId}`);
        if (verifyResponse.status === 404) {
          console.log('✅ Verified: Browser session no longer exists');
        } else {
          console.log('❌ Browser session still exists after deletion');
        }
      } else {
        console.log('❌ Failed to delete browser session');
      }
      
    } else {
      console.log('❌ Failed to create browser session:', createResponse.status);
      const error = await createResponse.text();
      console.log('   Error:', error);
    }
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }
  
  console.log('\n✨ Browser session tests complete!');
}

// Run the tests
testBrowserSessions().catch(console.error);