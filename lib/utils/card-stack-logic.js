/**
 * Card Stack Logic
 * Utilities for managing card stacks and flip states
 */

/**
 * Detects if cards are in a stack based on their positions
 * Cards are considered stacked if they overlap significantly
 * @param {Array} cards - Array of card objects with position data
 * @param {number} threshold - Distance threshold for considering cards stacked (default 50px)
 * @returns {Array} Array of stack groups, each containing card IDs
 */
export function detectCardStacks(cards, threshold = 50) {
  if (!cards || cards.length === 0) return [];
  
  // Group cards by zone first
  const cardsByZone = cards.reduce((acc, card) => {
    if (!acc[card.zone]) acc[card.zone] = [];
    acc[card.zone].push(card);
    return acc;
  }, {});
  
  const stacks = [];
  
  // Process each zone
  Object.values(cardsByZone).forEach(zoneCards => {
    // Sort by stackOrder (higher order = on top)
    const sortedCards = [...zoneCards].sort((a, b) => a.stackOrder - b.stackOrder);
    
    // Find stacks within the zone
    const processedCards = new Set();
    
    sortedCards.forEach(card => {
      if (processedCards.has(card.id)) return;
      
      // Find all cards that stack with this one
      const stack = [card];
      processedCards.add(card.id);
      
      sortedCards.forEach(otherCard => {
        if (processedCards.has(otherCard.id)) return;
        
        // Check if cards are close enough to be stacked
        const distance = Math.sqrt(
          Math.pow(card.position.x - otherCard.position.x, 2) +
          Math.pow(card.position.y - otherCard.position.y, 2)
        );
        
        if (distance < threshold) {
          stack.push(otherCard);
          processedCards.add(otherCard.id);
        }
      });
      
      // Only add if there's more than one card in the stack
      if (stack.length > 1) {
        // Sort stack by stackOrder (highest first = top card)
        stack.sort((a, b) => b.stackOrder - a.stackOrder);
        stacks.push(stack);
      }
    });
  });
  
  return stacks;
}

/**
 * Determines which cards should be face up or face down based on stack position
 * @param {Array} cards - Array of all cards
 * @returns {Object} Map of card IDs to their desired faceUp state
 */
export function getStackFlipStates(cards) {
  const stacks = detectCardStacks(cards);
  const flipStates = {};
  
  // Initialize all cards as face up
  cards.forEach(card => {
    flipStates[card.id] = true;
  });
  
  // Process each stack
  stacks.forEach(stack => {
    // First card (top) should be face up
    // All others should be face down (they're covered)
    stack.forEach((card, index) => {
      flipStates[card.id] = index === 0; // Only top card is face up
    });
  });
  
  return flipStates;
}

/**
 * Determines cards that need to be auto-flipped when a top card is removed
 * @param {Array} cardsBeforeRemoval - Cards before the removal
 * @param {string} removedCardId - ID of the card being removed
 * @returns {Array} Array of card IDs that should be auto-flipped to face up
 */
export function getCardsToAutoFlip(cardsBeforeRemoval, removedCardId) {
  const removedCard = cardsBeforeRemoval.find(c => c.id === removedCardId);
  if (!removedCard) return [];
  
  // Find the stack containing the removed card
  const stacks = detectCardStacks(cardsBeforeRemoval);
  const relevantStack = stacks.find(stack => 
    stack.some(card => card.id === removedCardId)
  );
  
  if (!relevantStack) return [];
  
  // If the removed card was the top card (index 0), the next card should flip
  const removedIndex = relevantStack.findIndex(card => card.id === removedCardId);
  if (removedIndex === 0 && relevantStack.length > 1) {
    // The card at index 1 becomes the new top card and should flip face up
    return [relevantStack[1].id];
  }
  
  return [];
}

/**
 * Updates card flip states after a card move
 * @param {Array} cards - Current cards array
 * @param {string} movedCardId - ID of the card that was moved
 * @param {string} fromZone - Zone the card was moved from
 * @param {string} toZone - Zone the card was moved to
 * @returns {Array} Array of objects with cardId and desired faceUp state
 */
export function getFlipUpdatesAfterMove(cards, movedCardId, fromZone, toZone) {
  const updates = [];
  
  // Get current stack states
  const flipStates = getStackFlipStates(cards);
  
  // Compare with current faceUp states and generate updates
  cards.forEach(card => {
    const desiredState = flipStates[card.id];
    if (card.faceUp !== desiredState) {
      updates.push({
        cardId: card.id,
        faceUp: desiredState,
        reason: 'auto' // These are auto-flips due to stack changes
      });
    }
  });
  
  // The moved card should always be face up (user is interacting with it)
  const movedCardUpdate = updates.find(u => u.cardId === movedCardId);
  if (movedCardUpdate) {
    movedCardUpdate.faceUp = true;
  } else if (!cards.find(c => c.id === movedCardId)?.faceUp) {
    updates.push({
      cardId: movedCardId,
      faceUp: true,
      reason: 'moved'
    });
  }
  
  return updates;
}

/**
 * Checks if a card is the top card in its stack
 * @param {Array} cards - Array of all cards
 * @param {string} cardId - ID of the card to check
 * @returns {boolean} True if the card is on top of its stack or not in a stack
 */
export function isTopCard(cards, cardId) {
  const stacks = detectCardStacks(cards);
  
  // Find if this card is in any stack
  const containingStack = stacks.find(stack =>
    stack.some(card => card.id === cardId)
  );
  
  // If not in a stack, it's considered a "top" card (standalone)
  if (!containingStack) return true;
  
  // Check if it's the first (top) card in the stack
  return containingStack[0].id === cardId;
}

/**
 * Gets the z-index for a card based on its stack position
 * @param {Array} cards - Array of all cards
 * @param {string} cardId - ID of the card
 * @returns {number} Z-index value for the card
 */
export function getCardZIndex(cards, cardId) {
  const card = cards.find(c => c.id === cardId);
  if (!card) return 0;
  
  // Base z-index from stackOrder
  return card.stackOrder || 0;
}