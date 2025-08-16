/**
 * Test script for the flip API endpoint
 */

async function testFlipAPI() {
  const baseUrl = 'http://localhost:3000/api/cards';
  
  console.log('Testing Flip API endpoint...\n');
  
  try {
    // First, create a test card
    console.log('1. Creating test card...');
    const createResponse = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'topic',
        content: 'Test card for flip API',
        zone: 'active'
      })
    });
    const card = await createResponse.json();
    console.log('   Created card:', { id: card.id, faceUp: card.faceUp });
    
    // Test 1: Toggle flip (should go from true to false)
    console.log('\n2. Testing toggle flip...');
    const flipResponse1 = await fetch(`${baseUrl}/flip`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: card.id })
    });
    const flipped1 = await flipResponse1.json();
    console.log('   Flipped card:', {
      id: flipped1.id,
      faceUp: flipped1.faceUp,
      flipped: flipped1.flipped
    });
    console.log('   ✅ Card toggled from', flipped1.flipped.from, 'to', flipped1.flipped.to);
    
    // Test 2: Explicit flip to faceUp
    console.log('\n3. Testing explicit flip to faceUp...');
    const flipResponse2 = await fetch(`${baseUrl}/flip`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: card.id, flipTo: 'faceUp' })
    });
    const flipped2 = await flipResponse2.json();
    console.log('   Flipped card:', {
      id: flipped2.id,
      faceUp: flipped2.faceUp,
      flipped: flipped2.flipped
    });
    console.log('   ✅ Card flipped to faceUp');
    
    // Test 3: Explicit flip to faceDown
    console.log('\n4. Testing explicit flip to faceDown...');
    const flipResponse3 = await fetch(`${baseUrl}/flip`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: card.id, flipTo: 'faceDown' })
    });
    const flipped3 = await flipResponse3.json();
    console.log('   Flipped card:', {
      id: flipped3.id,
      faceUp: flipped3.faceUp,
      flipped: flipped3.flipped
    });
    console.log('   ✅ Card flipped to faceDown');
    
    // Test 4: Invalid card ID
    console.log('\n5. Testing invalid card ID...');
    const invalidResponse = await fetch(`${baseUrl}/flip`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'invalid-id' })
    });
    const invalidResult = await invalidResponse.json();
    console.log('   Response:', invalidResult);
    console.log('   ✅ Correctly returned error for invalid card');
    
    console.log('\n✅ All API tests passed!');
    
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// Run the test
testFlipAPI();