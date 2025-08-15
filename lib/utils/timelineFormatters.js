// Timeline date/time formatting utilities
// Extracted from multiple timeline components to reduce duplication

/**
 * Format timestamp to display time only (HH:MM:SS)
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Formatted time string
 */
export function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Format timestamp to display date only (Month Day, Year)
 * @param {number} timestamp - Unix timestamp in milliseconds
 * @returns {string} Formatted date string
 */
export function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format duration in milliseconds to human readable format
 * @param {number} ms - Duration in milliseconds
 * @returns {string|null} Formatted duration string or null if no duration
 */
export function formatDuration(ms) {
  if (!ms || ms < 0) return null;
  
  if (ms < 60000) { // < 1 minute
    return `${Math.floor(ms / 1000)}s`;
  } else if (ms < 3600000) { // < 1 hour
    return `${Math.floor(ms / 60000)}m`;
  } else {
    return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
  }
}

/**
 * Calculate time difference between two events in human readable format
 * @param {Object} currentEvent - Event object with 'at' timestamp
 * @param {Object} previousEvent - Previous event object with 'at' timestamp
 * @returns {string|null} Time difference string or null if no previous event
 */
export function getTimeBetweenEvents(currentEvent, previousEvent) {
  if (!previousEvent) return null;
  
  const diff = currentEvent.at - previousEvent.at;
  if (diff < 60000) { // < 1 minute
    return `${Math.floor(diff / 1000)}s`;
  } else if (diff < 3600000) { // < 1 hour
    return `${Math.floor(diff / 60000)}m`;
  } else {
    return `${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`;
  }
}