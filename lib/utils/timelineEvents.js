// Timeline event helper utilities
// Extracted from TimelineNode.jsx and CardSubBranch.jsx to reduce duplication

/**
 * Get event summary text based on event type and payload
 * @param {Object} event - Event object with type and payload
 * @returns {string} Human-readable event summary
 */
export function getEventSummary(event) {
  const { type, payload = {} } = event;
  
  switch (type) {
    case 'card.created':
      return `Created ${payload.type || 'card'} in ${payload.zone || 'unknown zone'}`;
    
    case 'card.moved':
      return `Moved from ${payload.from || '?'} to ${payload.to || '?'}`;
    
    case 'card.updated':
      const fields = payload.fields || Object.keys(payload).filter(k => k !== 'id');
      return `Updated ${fields.length ? fields.join(', ') : 'properties'}`;
    
    case 'card.deleted':
      return `Deleted from ${payload.zone || 'board'}`;
    
    default:
      return type;
  }
}

/**
 * Extract detailed payload information for hover tooltips
 * @param {Object} event - Event object with payload
 * @returns {Array} Array of {key, value} objects for display
 */
export function getPayloadDetails(event) {
  const { payload = {} } = event;
  const details = [];
  
  // Handle null or undefined payload
  if (!payload || typeof payload !== 'object') {
    return details;
  }
  
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      details.push({ key, value: String(value) });
    }
  });
  
  return details;
}