/**
 * Legacy Constants - Deprecated
 * 
 * DEPRECATED: This file is deprecated. Please use the new consolidated constants:
 * - Card constants: import from './card-type-constants.js'
 * - UI constants: import from '../constants/ui/index.js'
 * 
 * @deprecated Use new consolidated constants files
 */

// Development deprecation warning
if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.warn('DEPRECATED: lib/utils/constants.js is deprecated. Use consolidated constants files instead.');
}

// Import from consolidated card constants file
import { 
  CARD_ZONES as NEW_ZONES,
  CARD_API_ENDPOINTS as NEW_API_ENDPOINTS,
  CARD_DIMENSIONS as NEW_CARD_DIMENSIONS,
  CARD_TYPES as NEW_CARD_TYPES
} from './card-type-constants.js';

// Legacy exports for backward compatibility
/**
 * @deprecated Use CARD_ZONES from './card-type-constants.js' instead
 */
export const ZONES = NEW_ZONES;

/**
 * @deprecated Use CARD_DIMENSIONS from './card-type-constants.js' instead
 */
export const CARD_DIMENSIONS = NEW_CARD_DIMENSIONS;

/**
 * @deprecated Use CARD_API_ENDPOINTS from './card-type-constants.js' instead
 */
export const API_ENDPOINTS = NEW_API_ENDPOINTS;

/**
 * @deprecated Use TYPE_COLORS and getTypeColors() from './card-type-constants.js' instead
 */
export const CARD_TYPES = NEW_CARD_TYPES;