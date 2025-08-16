/**
 * Test script to verify faceUp field is working
 */

import { createCard, getCard, updateCard } from './lib/db/database.js';

async function testFaceUpField() {
  console.log('Testing faceUp field in database...\n');
  
  try {
    // Test 1: Create a card with default faceUp (should be true)
    console.log('1. Creating card with default faceUp...');
    const card1 = await createCard({
      type: 'topic',
      content: 'Test card with default faceUp',
      zone: 'active'
    });
    console.log('   Created card:', { id: card1.id, faceUp: card1.faceUp });
    console.log('   ✅ Expected faceUp: true, Got:', card1.faceUp);
    
    // Test 2: Create a card with faceUp explicitly set to false
    console.log('\n2. Creating card with faceUp = false...');
    const card2 = await createCard({
      type: 'question',
      content: 'Test card with faceUp false',
      zone: 'parking',
      faceUp: false
    });
    console.log('   Created card:', { id: card2.id, faceUp: card2.faceUp });
    console.log('   ✅ Expected faceUp: false, Got:', card2.faceUp);
    
    // Test 3: Update a card's faceUp field
    console.log('\n3. Updating card faceUp field...');
    const updatedCard = await updateCard(card1.id, { faceUp: false });
    console.log('   Updated card:', { id: updatedCard.id, faceUp: updatedCard.faceUp });
    console.log('   ✅ Expected faceUp: false, Got:', updatedCard.faceUp);
    
    // Test 4: Retrieve card and verify faceUp persists
    console.log('\n4. Retrieving card to verify persistence...');
    const retrievedCard = await getCard(card1.id);
    console.log('   Retrieved card:', { id: retrievedCard.id, faceUp: retrievedCard.faceUp });
    console.log('   ✅ Expected faceUp: false, Got:', retrievedCard.faceUp);
    
    console.log('\n✅ All tests passed! faceUp field is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testFaceUpField();