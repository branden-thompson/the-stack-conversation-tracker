/**
 * Theme Constants - Centralized theme definitions
 * 
 * Consolidated theme system with app and dev themes.
 * Moved from lib/utils/ui-constants.js for better organization.
 * 
 * @version 1.0.0
 * @date 2025-08-20
 */

// ===========================================
// APP THEME (Main Application)
// ===========================================

/**
 * App theme for main board/timeline pages (slate/gray)
 * Used in conversation boards, timeline views, and main application UI
 */
export const APP_THEME = {
  colors: {
    // Background colors
    background: {
      primary: 'bg-gray-50 dark:bg-gray-900',
      secondary: 'bg-white dark:bg-gray-800',
      tertiary: 'bg-gray-100 dark:bg-gray-700',
      card: 'bg-gray-50 dark:bg-gray-700', // Card background - one shade lighter than secondary
      hover: 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
      hoverStrong: 'hover:bg-gray-100 dark:hover:bg-gray-700',
      accent: 'bg-gray-50 dark:bg-gray-700',
    },
    // Border colors
    border: {
      primary: 'border-gray-200 dark:border-gray-700',
      secondary: 'border-gray-300 dark:border-gray-600',
      strong: 'border-gray-400 dark:border-gray-500',
    },
    // Text colors
    text: {
      primary: 'text-gray-900 dark:text-gray-100',
      secondary: 'text-gray-700 dark:text-gray-300',
      tertiary: 'text-gray-600 dark:text-gray-400',
      muted: 'text-gray-500 dark:text-gray-400',
      light: 'text-gray-400 dark:text-gray-500',
    },
    // Status colors (consistent across themes)
    status: {
      success: {
        bg: 'bg-green-100 dark:bg-green-950/30',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-700 dark:text-green-300',
        icon: 'text-green-600 dark:text-green-400',
      },
      warning: {
        bg: 'bg-yellow-100 dark:bg-yellow-950/30',
        border: 'border-yellow-200 dark:border-yellow-800',
        text: 'text-yellow-700 dark:text-yellow-300',
        icon: 'text-yellow-600 dark:text-yellow-400',
      },
      error: {
        bg: 'bg-red-100 dark:bg-red-950/30',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-700 dark:text-red-300',
        icon: 'text-red-600 dark:text-red-400',
      },
      info: {
        bg: 'bg-blue-100 dark:bg-blue-950/30',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-700 dark:text-blue-300',
        icon: 'text-blue-600 dark:text-blue-400',
      },
      inactive: {
        bg: 'bg-gray-100 dark:bg-gray-950/30',
        border: 'border-gray-200 dark:border-gray-800',
        text: 'text-gray-700 dark:text-gray-300',
        icon: 'text-gray-600 dark:text-gray-400',
      },
    },
  },
  // Shadow styles
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md dark:shadow-gray-800/50',
    lg: 'shadow-lg dark:shadow-gray-800/70',
    xl: 'shadow-xl dark:shadow-gray-900/80',
  },
  // Transition styles
  transitions: {
    colors: 'transition-colors duration-200',
    all: 'transition-all duration-200',
    transform: 'transition-transform duration-200',
  },
};

// ===========================================
// DEV THEME (Development Pages)
// ===========================================

/**
 * Dev theme for development pages (zinc/neutral)
 * Used in test pages, performance monitoring, and development tools
 */
export const THEME = {
  // Primary theme color (zinc/neutral for dev pages)
  colors: {
    // Background colors
    background: {
      primary: 'bg-zinc-50 dark:bg-zinc-900',
      secondary: 'bg-white dark:bg-zinc-800',
      tertiary: 'bg-zinc-100 dark:bg-zinc-800',
      card: 'bg-zinc-50 dark:bg-zinc-700', // Card background - one shade lighter than secondary
      hover: 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
      hoverStrong: 'hover:bg-zinc-200 dark:hover:bg-zinc-700',
      accent: 'bg-zinc-100 dark:bg-zinc-800/25',
      active: 'bg-zinc-600 dark:bg-zinc-700', // Active state background
    },
    // Border colors
    border: {
      primary: 'border-zinc-200 dark:border-zinc-700',
      secondary: 'border-zinc-300 dark:border-zinc-600',
      strong: 'border-zinc-400 dark:border-zinc-500',
    },
    // Text colors
    text: {
      primary: 'text-zinc-900 dark:text-zinc-100',
      secondary: 'text-zinc-700 dark:text-zinc-300',
      tertiary: 'text-zinc-600 dark:text-zinc-400',
      muted: 'text-zinc-500 dark:text-zinc-400',
      light: 'text-zinc-400 dark:text-zinc-500',
    },
    // Status colors (consistent with app theme)
    status: {
      success: {
        bg: 'bg-green-100 dark:bg-green-950/30',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-700 dark:text-green-300',
        icon: 'text-green-600 dark:text-green-400',
      },
      warning: {
        bg: 'bg-yellow-100 dark:bg-yellow-950/30',
        border: 'border-yellow-200 dark:border-yellow-800',
        text: 'text-yellow-700 dark:text-yellow-300',
        icon: 'text-yellow-600 dark:text-yellow-400',
      },
      error: {
        bg: 'bg-red-100 dark:bg-red-950/30',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-700 dark:text-red-300',
        icon: 'text-red-600 dark:text-red-400',
      },
      info: {
        bg: 'bg-blue-100 dark:bg-blue-950/30',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-700 dark:text-blue-300',
        icon: 'text-blue-600 dark:text-blue-400',
      },
    },
  },
  // Shadow styles
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md dark:shadow-zinc-800/50',
    lg: 'shadow-lg dark:shadow-zinc-800/70',
    xl: 'shadow-xl dark:shadow-zinc-900/80',
  },
  // Transition styles
  transitions: {
    colors: 'transition-colors duration-200',
    all: 'transition-all duration-200',
    transform: 'transition-transform duration-200',
  },
};

// ===========================================
// THEME UTILITIES
// ===========================================

/**
 * Helper function to get app theme classes for different page contexts
 * @param {string} context - The context type (page, header, card, button, etc.)
 * @returns {string} - Combined theme classes
 */
export function getAppThemeClasses(context = 'page') {
  const themeMap = {
    // Page-level contexts
    page: `${APP_THEME.colors.background.primary}`,
    header: `${APP_THEME.colors.background.secondary} ${APP_THEME.colors.border.primary} border-b`,
    footer: `${APP_THEME.colors.background.tertiary} ${APP_THEME.colors.border.primary} border-t`,
    
    // Component contexts
    card: `${APP_THEME.colors.background.card} ${APP_THEME.colors.border.primary} border ${APP_THEME.shadows.sm}`,
    button: `${APP_THEME.colors.background.secondary} ${APP_THEME.colors.border.primary} border ${APP_THEME.colors.text.primary} ${APP_THEME.transitions.colors}`,
    input: `${APP_THEME.colors.background.secondary} ${APP_THEME.colors.border.primary} border ${APP_THEME.colors.text.primary}`,
    
    // Interactive states
    hover: APP_THEME.colors.background.hover,
    active: `${APP_THEME.colors.background.tertiary} ${APP_THEME.colors.border.secondary} border`,
  };
  
  return themeMap[context] || APP_THEME.colors.background.primary;
}

/**
 * Helper function to get dev theme classes for development page contexts
 * @param {string} context - The context type (page, header, card, button, etc.)
 * @returns {string} - Combined theme classes
 */
export function getDevThemeClasses(context = 'page') {
  const themeMap = {
    // Page-level contexts
    page: `${THEME.colors.background.primary}`,
    header: `${THEME.colors.background.secondary} ${THEME.colors.border.primary} border-b`,
    footer: `${THEME.colors.background.tertiary} ${THEME.colors.border.primary} border-t`,
    
    // Component contexts
    card: `${THEME.colors.background.card} ${THEME.colors.border.primary} border ${THEME.shadows.sm}`,
    button: `${THEME.colors.background.secondary} ${THEME.colors.border.primary} border ${THEME.colors.text.primary} ${THEME.transitions.colors}`,
    input: `${THEME.colors.background.secondary} ${THEME.colors.border.primary} border ${THEME.colors.text.primary}`,
    
    // Interactive states
    hover: THEME.colors.background.hover,
    active: `${THEME.colors.background.active} ${THEME.colors.border.secondary} border`,
  };
  
  return themeMap[context] || THEME.colors.background.primary;
}

// ===========================================
// THEME METADATA
// ===========================================

export const THEME_CONFIG = {
  version: '1.0.0',
  buildDate: '2025-08-20',
  
  // Available themes
  themes: {
    app: {
      name: 'App Theme',
      description: 'Slate/gray theme for main application pages',
      primaryColor: 'gray',
      usage: ['conversation-board', 'timeline', 'main-pages'],
    },
    dev: {
      name: 'Dev Theme', 
      description: 'Zinc/neutral theme for development pages',
      primaryColor: 'zinc',
      usage: ['test-pages', 'performance', 'dev-tools'],
    },
  },
  
  // Migration status
  migration: {
    status: 'consolidated',
    migratedFrom: 'lib/utils/ui-constants.js',
    compatibilityMaintained: true,
  },
};