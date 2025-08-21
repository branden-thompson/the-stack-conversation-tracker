/**
 * UI Constants - Centralized exports for all UI constants
 * 
 * Provides unified access to layout, theme, and component constants.
 * Integrates with the design system for consistent UI development.
 * 
 * @version 1.0.0
 * @date 2025-08-20
 */

// Layout and spacing constants
export * from './layout.js';

// Theme constants (consolidated)
export * from './themes.js';

// Legacy constants for backward compatibility (with deprecation warnings)
export * from '../../utils/ui-constants.js';

/**
 * UI Constants configuration and metadata
 */
export const UI_CONSTANTS_CONFIG = {
  version: '1.0.0',
  buildDate: '2025-08-20',
  
  // Integration status
  integration: {
    layoutConstants: true,    // New layout constants available
    legacyConstants: true,    // Legacy ui-constants still available
    designSystem: true,       // Integrated with design system
    themeAware: true,         // Theme-aware components supported
  },
  
  // Migration guidance
  migration: {
    recommended: {
      // Recommend new constants over legacy ones
      spacing: 'Use SPACING from layout.js instead of manual spacing',
      grid: 'Use GRID utilities instead of custom grid classes',
      containers: 'Use CONTAINERS for consistent layout patterns',
      typography: 'Use TYPOGRAPHY scale for consistent text sizing',
    },
    
    // Legacy support timeline
    legacy: {
      phase: 'maintenance',     // maintenance, deprecated, removed
      endOfLife: '2025-12-31',  // When legacy support ends
      breakingChanges: false    // No breaking changes planned
    }
  }
};

/**
 * Quick access utilities for common patterns
 */
export const QuickUtils = {
  // Common layout patterns
  layouts: {
    // Centered container with padding
    centeredContainer: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    
    // Card with standard styling
    standardCard: 'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm',
    
    // Flex row with gap
    flexRow: 'flex items-center gap-4',
    
    // Flex column with gap
    flexCol: 'flex flex-col gap-4',
    
    // Grid with responsive columns
    responsiveGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    
    // Section with padding
    section: 'py-8 sm:py-12 lg:py-16',
  },
  
  // Common interactive states
  interactions: {
    // Hover effects
    hover: 'transition-all duration-200 hover:shadow-md hover:scale-105',
    
    // Button hover
    buttonHover: 'transition-colors duration-200 hover:opacity-90',
    
    // Link styling
    link: 'text-blue-600 dark:text-blue-400 hover:underline',
    
    // Focus states
    focus: 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  },
  
  // Common text patterns
  text: {
    // Headings
    h1: 'text-3xl font-bold text-gray-900 dark:text-gray-100',
    h2: 'text-2xl font-semibold text-gray-900 dark:text-gray-100',
    h3: 'text-xl font-medium text-gray-900 dark:text-gray-100',
    
    // Body text
    body: 'text-base text-gray-700 dark:text-gray-300',
    muted: 'text-sm text-gray-500 dark:text-gray-400',
    
    // Status text
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400',
  },
  
  // Common background patterns
  backgrounds: {
    // Status backgrounds
    success: 'bg-green-100 dark:bg-green-950/30 border-green-200 dark:border-green-800',
    warning: 'bg-yellow-100 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800',
    error: 'bg-red-100 dark:bg-red-950/30 border-red-200 dark:border-red-800',
    info: 'bg-blue-100 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
    
    // Neutral backgrounds
    card: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    section: 'bg-gray-50 dark:bg-gray-900',
    overlay: 'bg-black/50 dark:bg-black/70',
  }
};

/**
 * Helper function to combine utility classes
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Helper function to get quick utility classes
 */
export function getQuickUtils(category, variant) {
  return QuickUtils[category]?.[variant] || '';
}

/**
 * Export configuration and utilities
 */
const uiConstantsExports = {
  UI_CONSTANTS_CONFIG,
  QuickUtils,
  cn,
  getQuickUtils,
};

export default uiConstantsExports;