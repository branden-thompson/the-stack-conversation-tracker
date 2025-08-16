/**
 * Reset cards for UI development
 * Cleans up test cards and creates a proper set for testing flip functionality
 */

import { getAllCards, deleteCard, createCard } from './lib/db/database.js';

async function resetCards() {
  console.log('Resetting cards for UI development...\n');
  
  try {
    // Get all current cards
    const existingCards = await getAllCards();
    console.log(`Found ${existingCards.length} existing cards`);
    
    // Delete all test cards
    for (const card of existingCards) {
      if (card.content.includes('Test card') || 
          card.content.includes('test') ||
          card.content.includes('demo')) {
        await deleteCard(card.id);
        console.log(`  Deleted test card: ${card.id}`);
      }
    }
    
    // Create a proper set of cards for UI testing
    console.log('\nCreating new cards for UI testing...');
    
    // Active zone - Create a small stack
    const card1 = await createCard({
      type: 'topic',
      content: 'Implement card flip animation with CSS transforms',
      zone: 'active',
      position: { x: 100, y: 100 },
      stackOrder: 0,
      faceUp: true
    });
    console.log('✓ Created card 1 (active zone, top of stack)');
    
    const card2 = await createCard({
      type: 'question',
      content: 'Should we use CSS or JavaScript for the flip animation?',
      zone: 'active',
      position: { x: 110, y: 110 },
      stackOrder: 1,
      faceUp: false // Should be face down (under card1)
    });
    console.log('✓ Created card 2 (active zone, under card 1)');
    
    // Parking zone - Standalone card
    const card3 = await createCard({
      type: 'opinion',
      content: 'CSS animations are more performant for simple transforms',
      zone: 'parking',
      position: { x: 50, y: 50 },
      stackOrder: 0,
      faceUp: true
    });
    console.log('✓ Created card 3 (parking zone, standalone)');
    
    // Resolved zone - Another standalone
    const card4 = await createCard({
      type: 'fact',
      content: 'CSS transform: rotateY() creates the flip effect',
      zone: 'resolved',
      position: { x: 50, y: 50 },
      stackOrder: 0,
      faceUp: true
    });
    console.log('✓ Created card 4 (resolved zone, standalone)');
    
    // Unresolved zone - Test face down card
    const card5 = await createCard({
      type: 'accusation',
      content: 'The current implementation lacks visual feedback',
      zone: 'unresolved',
      position: { x: 50, y: 50 },
      stackOrder: 0,
      faceUp: false // Intentionally face down for testing
    });
    console.log('✓ Created card 5 (unresolved zone, face down for testing)');
    
    console.log('\n✅ Card reset complete!');
    console.log('Cards ready for UI flip functionality testing.');
    
  } catch (error) {
    console.error('❌ Error resetting cards:', error);
  }
}

// Run the reset
resetCards();