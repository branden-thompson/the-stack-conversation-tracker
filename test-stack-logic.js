/**
 * Test script for card stack logic
 */

import { 
  detectCardStacks, 
  getStackFlipStates, 
  getCardsToAutoFlip,
  isTopCard 
} from './lib/utils/card-stack-logic.js';

// Test data - simulating cards in different configurations
const testCards = [
  // Stack 1 in active zone (3 cards stacked)
  { id: 'card1', zone: 'active', position: { x: 100, y: 100 }, stackOrder: 2, faceUp: true },
  { id: 'card2', zone: 'active', position: { x: 105, y: 105 }, stackOrder: 1, faceUp: true },
  { id: 'card3', zone: 'active', position: { x: 110, y: 110 }, stackOrder: 0, faceUp: true },
  
  // Stack 2 in parking zone (2 cards stacked)
  { id: 'card4', zone: 'parking', position: { x: 200, y: 200 }, stackOrder: 1, faceUp: true },
  { id: 'card5', zone: 'parking', position: { x: 205, y: 205 }, stackOrder: 0, faceUp: true },
  
  // Standalone card in resolved zone
  { id: 'card6', zone: 'resolved', position: { x: 300, y: 300 }, stackOrder: 0, faceUp: true },
  
  // Another standalone card far from others
  { id: 'card7', zone: 'active', position: { x: 500, y: 500 }, stackOrder: 0, faceUp: true },
];

console.log('Testing Card Stack Logic\n');
console.log('=' .repeat(50));

// Test 1: Detect stacks
console.log('\n1. Detecting Card Stacks:');
const stacks = detectCardStacks(testCards);
console.log(`   Found ${stacks.length} stacks:`);
stacks.forEach((stack, i) => {
  console.log(`   Stack ${i + 1}: ${stack.map(c => c.id).join(' > ')} (${stack.length} cards)`);
});

// Test 2: Get flip states
console.log('\n2. Determining Flip States:');
const flipStates = getStackFlipStates(testCards);
Object.entries(flipStates).forEach(([cardId, shouldBeFaceUp]) => {
  console.log(`   ${cardId}: should be ${shouldBeFaceUp ? 'face up ↑' : 'face down ↓'}`);
});

// Test 3: Check top cards
console.log('\n3. Checking Top Cards:');
testCards.forEach(card => {
  const isTop = isTopCard(testCards, card.id);
  console.log(`   ${card.id}: ${isTop ? '✓ is top card' : '✗ is covered'}`);
});

// Test 4: Auto-flip when removing top card
console.log('\n4. Testing Auto-flip on Card Removal:');
console.log('   Removing card1 (top of stack 1)...');
const cardsToFlip = getCardsToAutoFlip(testCards, 'card1');
if (cardsToFlip.length > 0) {
  console.log(`   Cards to auto-flip: ${cardsToFlip.join(', ')}`);
} else {
  console.log('   No cards need auto-flipping');
}

// Test 5: Removing a middle card (shouldn't trigger auto-flip)
console.log('\n5. Testing Removal of Middle Card:');
console.log('   Removing card2 (middle of stack 1)...');
const cardsToFlip2 = getCardsToAutoFlip(testCards, 'card2');
if (cardsToFlip2.length > 0) {
  console.log(`   Cards to auto-flip: ${cardsToFlip2.join(', ')}`);
} else {
  console.log('   No cards need auto-flipping (correct - not top card)');
}

// Test 6: Removing standalone card
console.log('\n6. Testing Removal of Standalone Card:');
console.log('   Removing card6 (standalone)...');
const cardsToFlip3 = getCardsToAutoFlip(testCards, 'card6');
if (cardsToFlip3.length > 0) {
  console.log(`   Cards to auto-flip: ${cardsToFlip3.join(', ')}`);
} else {
  console.log('   No cards need auto-flipping (correct - no stack)');
}

console.log('\n' + '=' .repeat(50));
console.log('✅ Stack logic tests complete!');