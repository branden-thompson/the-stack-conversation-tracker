/**
 * Application constants
 * Defines card types, zones, and color schemes
 */

// Card types with their associated colors
export const CARD_TYPES = {
  topic: {
    value: 'topic',
    label: 'Conversation Topic',
    color: 'bg-white',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-900'
  },
  question: {
    value: 'question',
    label: 'Open Question',
    color: 'bg-blue-50',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-900'
  },
  accusation: {
    value: 'accusation',
    label: 'Accusation',
    color: 'bg-red-50',
    borderColor: 'border-red-300',
    textColor: 'text-red-900'
  },
  statement: {
    value: 'statement',
    label: 'Factual Statement',
    color: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    textColor: 'text-yellow-900'
  }
};

// Conversation zones
export const ZONES = {
  active: {
    id: 'active',
    title: 'Active Conversation',
    description: 'Topics currently being discussed',
    className: 'bg-green-50 border-green-200'
  },
  parking: {
    id: 'parking',
    title: 'Parking Lot',
    description: 'Topics to revisit later',
    className: 'bg-gray-50 border-gray-200'
  },
  resolved: {
    id: 'resolved',
    title: 'Resolved',
    description: 'Topics that have consensus / agreement',
    className: 'bg-blue-50 border-blue-200'
  },
  unresolved: {
    id: 'unresolved',
    title: 'Unresolved',
    description: 'Topics where agreement is not reached and require further discussion',
    className: 'bg-orange-50 border-orange-200'
  }
};

// Default card dimensions
export const CARD_DIMENSIONS = {
  width: 200,
  height: 120,
  stackOffset: 8, // Pixels to offset when stacking
  snapGrid: 10 // Grid size for snapping positions
};

// API endpoints
export const API_ENDPOINTS = {
  cards: '/api/cards'
};