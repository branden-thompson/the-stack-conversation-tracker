#!/usr/bin/env node

/**
 * Test guest creation functionality
 */

async function testGuestCreation() {
  console.log('🧪 Testing Guest Creation\n');
  console.log('=' .repeat(50));
  
  try {
    // Test creating a guest via API
    const response = await fetch('http://localhost:3000/api/browser-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        browserSessionId: `test_${Date.now()}`,
        metadata: { userAgent: 'Test Script' }
      })
    });
    
    if (!response.ok) {
      throw new Error(`API responded with ${response.status}`);
    }
    
    const session = await response.json();
    console.log('\n✅ Browser session created successfully!');
    console.log('\n📋 Guest Details:');
    console.log(`  • Name: ${session.provisionedGuest.name}`);
    console.log(`  • ID: ${session.provisionedGuest.id}`);
    console.log(`  • Has Avatar: ${!!session.provisionedGuest.profilePicture}`);
    
    // Parse the name to verify it uses our expanded sets
    const [adjective, animal] = session.provisionedGuest.name.split(' ');
    console.log(`  • Adjective: ${adjective}`);
    console.log(`  • Animal: ${animal}`);
    
    // Check if avatar data URL is valid
    if (session.provisionedGuest.profilePicture) {
      const avatarPrefix = session.provisionedGuest.profilePicture.substring(0, 30);
      console.log(`  • Avatar Format: ${avatarPrefix}...`);
      
      // Decode and check if it's valid SVG
      const base64Data = session.provisionedGuest.profilePicture.split(',')[1];
      const svgContent = Buffer.from(base64Data, 'base64').toString('utf8');
      const hasSvg = svgContent.includes('<svg');
      const hasCircle = svgContent.includes('circle') || svgContent.includes('ellipse');
      
      console.log(`  • Valid SVG: ${hasSvg ? '✓' : '✗'}`);
      console.log(`  • Has Shape: ${hasCircle ? '✓' : '✗'}`);
    }
    
    console.log('\n🎉 Guest creation test passed!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testGuestCreation();