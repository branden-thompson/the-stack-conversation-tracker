/**
 * Theme Loader System
 * Automatically loads and validates color themes from the color-themes directory
 */

import { grayTheme } from './color-themes/gray.js';
import { blueTheme } from './color-themes/blue.js';
import { greenTheme } from './color-themes/green.js';
import { purpleTheme } from './color-themes/purple.js';
import { synthwaveSanDiegoTheme } from './color-themes/synthwave-san-diego.js';
import { monokaiLikeTheme } from './color-themes/monokai-like.js';
import { internationalOrangeTheme } from './color-themes/international-orange.js';
import { tiffanyBlueTheme } from './color-themes/tiffany-blue.js';

/**
 * Validates a theme object structure
 * @param {Object} theme - Theme object to validate
 * @returns {boolean} - Whether the theme is valid
 */
function validateTheme(theme) {
  try {
    // Check required top-level properties
    if (!theme.id || !theme.name || !theme.light || !theme.dark) {
      return false;
    }

    // Check required structure for both light and dark modes
    const modes = [theme.light, theme.dark];
    for (const mode of modes) {
      if (!mode.primary || !mode.secondary || !mode.tertiary || !mode.card) {
        return false;
      }
      
      if (!mode.border || !mode.border.primary || !mode.border.secondary) {
        return false;
      }
      
      if (!mode.text || !mode.text.primary || !mode.text.secondary) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.warn(`Theme validation failed for ${theme?.id || 'unknown'}:`, error);
    return false;
  }
}

/**
 * All available themes (manually imported for better tree-shaking and reliability)
 * To add a new theme: 
 * 1. Create a new theme file in /lib/themes/color-themes/
 * 2. Import it above
 * 3. Add it to this array
 */
const ALL_THEMES = [
  grayTheme,
  blueTheme,
  greenTheme,
  purpleTheme,
  synthwaveSanDiegoTheme,
  monokaiLikeTheme,
  internationalOrangeTheme,
  tiffanyBlueTheme,
];

/**
 * Get all valid color themes
 * @returns {Array} Array of valid theme objects
 */
export function getAvailableColorThemes() {
  return ALL_THEMES.filter(theme => {
    const isValid = validateTheme(theme);
    if (!isValid) {
      console.warn(`Invalid theme structure detected for theme: ${theme?.id || 'unknown'}`);
    }
    return isValid;
  });
}

/**
 * Get a specific theme by ID
 * @param {string} themeId - The theme ID to retrieve
 * @returns {Object|null} The theme object or null if not found
 */
export function getColorThemeById(themeId) {
  const themes = getAvailableColorThemes();
  return themes.find(theme => theme.id === themeId) || null;
}

/**
 * Get the default theme
 * @returns {Object} The default gray theme
 */
export function getDefaultColorTheme() {
  return grayTheme;
}

/**
 * Get theme colors for current light/dark mode
 * @param {Object} theme - Theme object
 * @param {string} currentTheme - Current theme mode ('light' | 'dark' | 'system')
 * @param {string} systemTheme - System theme if currentTheme is 'system'
 * @returns {Object} Color object for current mode
 */
export function getThemeColors(theme, currentTheme, systemTheme) {
  if (!theme || !validateTheme(theme)) {
    return getDefaultColorTheme().light;
  }

  // Determine effective theme
  const effectiveTheme = currentTheme === 'system' ? systemTheme : currentTheme;
  
  // Return appropriate color set
  return effectiveTheme === 'dark' ? theme.dark : theme.light;
}

/**
 * Generate APP_THEME object for a specific color theme
 * @param {Object} colorTheme - Color theme object
 * @param {string} currentTheme - Current theme mode
 * @param {string} systemTheme - System theme
 * @returns {Object} APP_THEME formatted object
 */
export function generateAppTheme(colorTheme, currentTheme, systemTheme) {
  const colors = getThemeColors(colorTheme, currentTheme, systemTheme);
  
  return {
    colors: {
      background: {
        primary: colors.primary,
        secondary: colors.secondary,
        tertiary: colors.tertiary,
        card: colors.card,
        dropdown: colors.dropdown,
        hover: colors.hover,
        hoverStrong: colors.hoverStrong,
        accent: colors.accent,
        // Add missing zone/page mappings
        zone: colors.secondary,
        zoneHeader: colors.tertiary,
        header: colors.tertiary,  // Match zone headers instead of zones
        page: colors.primary,
        // Add divider color - proper background color for dividers
        divider: colors.divider,
      },
      border: colors.border,
      text: colors.text,
      // Card type semantic colors
      cardTypes: colors.cardTypes || {},
      // Keep status colors consistent across all themes
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
        }
      }
    },
    // Shadow styles (consistent across themes)
    shadows: {
      sm: 'shadow-sm',
      md: 'shadow-md dark:shadow-gray-800/50',
      lg: 'shadow-lg dark:shadow-gray-800/70',
      xl: 'shadow-xl dark:shadow-gray-900/80',
    },
    // Transition styles (consistent across themes)
    transitions: {
      colors: 'transition-colors duration-200',
      all: 'transition-all duration-200',
      transform: 'transition-transform duration-200',
    },
  };
}