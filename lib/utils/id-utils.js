/**
 * ID Generation Utilities
 * 
 * Utilities for generating unique identifiers for SSE events and connections
 */

/**
 * Generate unique ID with prefix
 */
export function generateId(prefix = 'id') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Generate UUID v4
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate short ID for events
 */
export function generateShortId() {
  return Math.random().toString(36).substr(2, 9);
}