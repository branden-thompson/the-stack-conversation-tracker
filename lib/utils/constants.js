// lib/utils/constants.js

// Import UI constants for consistency
import { CARD_LAYOUT, CARD_HEIGHTS } from './ui-constants';

// ----- Zones (panel styling with dark mode variants) -----
export const ZONES = {
  active: {
    title: 'Active Conversation',
    description: 'Topics currently being discussed',
    className: 'bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700',
  },
  parking: {
    title: 'Parking Lot',
    description: 'Topics to revisit later',
    className: 'bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700',
  },
  resolved: {
    title: 'Resolved',
    description: 'Topics that have been addressed',
    className: 'bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700',
  },
  unresolved: {
    title: 'Unresolved',
    description: 'Topics requiring further discussion',
    className: 'bg-white border-gray-200 dark:bg-gray-900 dark:border-gray-700',
  },
};

// ----- Card sizes & stacking -----
export const CARD_DIMENSIONS = {
  width: 320,       // baseline hint; component enforces min/max itself
  height: CARD_HEIGHTS.desktop.base,
  stackOffset: CARD_LAYOUT.stackOffset,  // pixel offset for overlapping stacks
};

// ----- API endpoints -----
export const API_ENDPOINTS = {
  cards: '/api/cards',
  people: '/api/people',
};

// ----- Card types (light + dark palettes; DARK = SOLID, no translucency) -----
export const CARD_TYPES = {
  topic: {
    label: 'TOPIC',
    container:
      'bg-white border-gray-300 text-gray-800 ' +
      'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100',
    borderColor: 'border-gray-300 dark:border-gray-600',
    color: 'bg-white dark:bg-gray-800',
    textColor: 'text-gray-800 dark:text-gray-100',
  },

  question: {
    label: 'QUESTION',
    container:
      'bg-blue-50 border-blue-300 text-blue-900 ' +
      'dark:bg-blue-900 dark:border-blue-600 dark:text-blue-100',
    borderColor: 'border-blue-300 dark:border-blue-600',
    color: 'bg-blue-50 dark:bg-blue-900',
    textColor: 'text-blue-900 dark:text-blue-100',
  },

  accusation: {
    label: 'ACCUSATION',
    container:
      'bg-red-50 border-red-300 text-red-900 ' +
      'dark:bg-red-900 dark:border-red-600 dark:text-red-100',
    borderColor: 'border-red-300 dark:border-red-600',
    color: 'bg-red-50 dark:bg-red-900',
    textColor: 'text-red-900 dark:text-red-100',
  },

  fact: {
    label: 'FACT',
    container:
      'bg-yellow-50 border-yellow-300 text-yellow-900 ' +
      'dark:bg-yellow-900 dark:border-yellow-600 dark:text-yellow-100',
    borderColor: 'border-yellow-300 dark:border-yellow-600',
    color: 'bg-yellow-50 dark:bg-yellow-900',
    textColor: 'text-yellow-900 dark:text-yellow-100',
  },

  guess: {
    label: 'GUESS',
    container:
      'bg-purple-50 border-purple-300 text-purple-900 ' +
      'dark:bg-purple-900 dark:border-purple-600 dark:text-purple-100',
    borderColor: 'border-purple-300 dark:border-purple-600',
    color: 'bg-purple-50 dark:bg-purple-900',
    textColor: 'text-purple-900 dark:text-purple-100',
  },

  opinion: {
    label: 'OPINION',
    container:
      'bg-pink-50 border-pink-300 text-pink-900 ' +
      'dark:bg-pink-900 dark:border-pink-600 dark:text-pink-100',
    borderColor: 'border-pink-300 dark:border-pink-600',
    color: 'bg-pink-50 dark:bg-pink-900',
    textColor: 'text-pink-900 dark:text-pink-100',
  },
};