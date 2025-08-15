// Timeline event type constants and configurations
// Extracted from TimelineNode.jsx and CardSubBranch.jsx to reduce duplication

import { 
  Plus, 
  ArrowRight, 
  Edit, 
  Trash2,
  Info
} from 'lucide-react';

/**
 * Event type configurations for timeline components
 * Contains styling, icons, and metadata for each event type
 */
export const EVENT_TYPES = {
  'card.created': {
    icon: Plus,
    label: 'Card Created',
    color: 'emerald',
    bgClass: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    description: 'A new card was added to the conversation'
  },
  'card.moved': {
    icon: ArrowRight,
    label: 'Card Moved',
    color: 'blue',
    bgClass: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    iconClass: 'text-blue-600 dark:text-blue-400',
    description: 'A card was moved between zones'
  },
  'card.updated': {
    icon: Edit,
    label: 'Card Updated',
    color: 'amber',
    bgClass: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    iconClass: 'text-amber-600 dark:text-amber-400',
    description: 'Card content or properties were modified'
  },
  'card.deleted': {
    icon: Trash2,
    label: 'Card Deleted',
    color: 'rose',
    bgClass: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
    iconClass: 'text-rose-600 dark:text-rose-400',
    description: 'A card was removed from the conversation'
  }
};

/**
 * Default event configuration for unknown event types
 */
export const DEFAULT_EVENT_CONFIG = {
  icon: Info,
  label: 'Unknown Event',
  color: 'gray',
  bgClass: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800',
  iconClass: 'text-gray-600 dark:text-gray-400',
  description: 'Unknown event type'
};

/**
 * Get event configuration for a given event type
 * @param {string} eventType - The event type (e.g., 'card.created')
 * @returns {Object} Event configuration object
 */
export function getEventConfig(eventType) {
  return EVENT_TYPES[eventType] || {
    ...DEFAULT_EVENT_CONFIG,
    label: eventType
  };
}