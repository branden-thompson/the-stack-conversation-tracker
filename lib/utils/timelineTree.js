// Tree data transformation utilities for timeline visualization

/**
 * Groups timeline events by card ID to create a tree structure
 * @param {Array} events - Array of timeline events
 * @returns {Object} Tree structure with card branches
 */
export function transformEventsToTree(events) {
  if (!events || events.length === 0) {
    return { cardBranches: [], orphanEvents: [] };
  }

  // Sort events chronologically
  const sortedEvents = [...events].sort((a, b) => a.at - b.at);
  
  // Group events by card ID
  const cardGroups = new Map();
  const orphanEvents = [];

  sortedEvents.forEach(event => {
    const cardId = event.payload?.id;
    
    if (!cardId) {
      // Events without card IDs are orphans (shouldn't happen but handle gracefully)
      orphanEvents.push(event);
      return;
    }

    if (!cardGroups.has(cardId)) {
      cardGroups.set(cardId, {
        cardId,
        rootEvent: null,
        childEvents: [],
        firstEventTime: event.at
      });
    }

    const cardGroup = cardGroups.get(cardId);

    if (event.type === 'card.created') {
      cardGroup.rootEvent = event;
    } else {
      cardGroup.childEvents.push(event);
    }
  });

  // Convert to array and sort by first event time (creation time)
  const cardBranches = Array.from(cardGroups.values())
    .filter(group => group.rootEvent) // Only include cards that have creation events
    .sort((a, b) => a.firstEventTime - b.firstEventTime);

  // Sort child events within each card group
  cardBranches.forEach(branch => {
    branch.childEvents.sort((a, b) => a.at - b.at);
  });

  return {
    cardBranches,
    orphanEvents
  };
}

/**
 * Gets the display name for a card based on its creation event
 * @param {Object} rootEvent - The card.created event
 * @returns {string} Display name for the card
 */
export function getCardDisplayName(rootEvent) {
  if (!rootEvent || !rootEvent.payload) {
    return 'Unknown Card';
  }

  const { payload } = rootEvent;
  
  // Try to get a meaningful name from the payload
  if (payload.content) {
    // Truncate long content for display
    const content = payload.content.toString().trim();
    if (content.length > 30) {
      return content.substring(0, 30) + '...';
    }
    return content;
  }

  // Fallback to card type and ID
  const cardType = payload.type || 'card';
  const shortId = payload.id ? payload.id.slice(0, 8) : 'unknown';
  
  return `${cardType} (${shortId})`;
}

/**
 * Calculates the lifecycle duration of a card
 * @param {Object} cardBranch - Card branch with rootEvent and childEvents
 * @returns {number} Duration in milliseconds, or null if card is still active
 */
export function getCardLifecycleDuration(cardBranch) {
  if (!cardBranch.rootEvent) return null;

  const startTime = cardBranch.rootEvent.at;
  
  // Check if card was deleted
  const deleteEvent = cardBranch.childEvents.find(event => event.type === 'card.deleted');
  if (deleteEvent) {
    return deleteEvent.at - startTime;
  }

  // Card is still active - return null to indicate ongoing
  return null;
}

/**
 * Gets the current status of a card based on its events
 * @param {Object} cardBranch - Card branch with rootEvent and childEvents
 * @returns {string} Card status: 'active', 'deleted', or current zone
 */
export function getCardCurrentStatus(cardBranch) {
  if (!cardBranch.rootEvent) return 'unknown';

  // Check if deleted
  const deleteEvent = cardBranch.childEvents.find(event => event.type === 'card.deleted');
  if (deleteEvent) {
    return 'deleted';
  }

  // Find the most recent zone from move events
  const moveEvents = cardBranch.childEvents
    .filter(event => event.type === 'card.moved')
    .sort((a, b) => b.at - a.at); // Most recent first

  if (moveEvents.length > 0) {
    return moveEvents[0].payload?.to || 'unknown';
  }

  // Return original zone from creation
  return cardBranch.rootEvent.payload?.zone || 'active';
}

/**
 * Calculates tree layout positions for rendering
 * @param {Array} cardBranches - Array of card branches
 * @returns {Array} Card branches with layout positions
 */
export function calculateTreeLayout(cardBranches) {
  const TRUNK_X = 50; // Percentage from left
  const BRANCH_LENGTH = 20; // Percentage
  const VERTICAL_SPACING = 120; // Pixels between cards
  const SUB_BRANCH_SPACING = 60; // Pixels between sub-events

  return cardBranches.map((branch, index) => {
    const baseY = index * VERTICAL_SPACING;
    
    // Calculate positions for child events
    const childPositions = branch.childEvents.map((event, childIndex) => ({
      ...event,
      x: TRUNK_X + BRANCH_LENGTH + 10, // Sub-branch extends further right
      y: baseY + (childIndex + 1) * SUB_BRANCH_SPACING
    }));

    return {
      ...branch,
      layout: {
        trunkX: TRUNK_X,
        branchY: baseY,
        branchEndX: TRUNK_X + BRANCH_LENGTH,
        totalHeight: baseY + Math.max(1, branch.childEvents.length) * SUB_BRANCH_SPACING
      },
      childEvents: childPositions
    };
  });
}