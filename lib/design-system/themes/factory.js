/**
 * Theme Factory System
 * 
 * Generates consistent theme objects from base color palettes.
 * Eliminates theme duplication by using mathematical color relationships.
 * 
 * @version 1.0.0
 * @date 2025-08-20
 */

/**
 * Base theme structure template
 */
const THEME_TEMPLATE = {
  colors: {
    background: {
      primary: '',
      secondary: '',
      tertiary: '',
      card: '',
      hover: '',
      hoverStrong: '',
      accent: '',
      active: ''
    },
    border: {
      primary: '',
      secondary: '',
      strong: ''
    },
    text: {
      primary: '',
      secondary: '',
      tertiary: '',
      muted: '',
      light: ''
    },
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
    }
  },
  shadows: {
    sm: 'shadow-sm',
    md: '',
    lg: '',
    xl: ''
  },
  transitions: {
    colors: 'transition-colors duration-200',
    all: 'transition-all duration-200',
    transform: 'transition-transform duration-200',
  }
};

/**
 * Color scale definitions for supported theme colors
 */
const COLOR_SCALES = {
  gray: {
    50: '50',
    100: '100', 
    200: '200',
    300: '300',
    400: '400',
    500: '500',
    600: '600',
    700: '700',
    800: '800',
    900: '900',
    darkBase: 'gray'
  },
  zinc: {
    50: '50',
    100: '100',
    200: '200', 
    300: '300',
    400: '400',
    500: '500',
    600: '600',
    700: '700',
    800: '800',
    900: '900',
    darkBase: 'zinc'
  },
  blue: {
    50: '50',
    100: '100',
    200: '200',
    300: '300', 
    400: '400',
    500: '500',
    600: '600',
    700: '700',
    800: '800',
    900: '900',
    darkBase: 'blue'
  },
  green: {
    50: '50',
    100: '100',
    200: '200',
    300: '300',
    400: '400',
    500: '500',
    600: '600',
    700: '700',
    800: '800',
    900: '900',
    darkBase: 'green'
  }
};

/**
 * Create a theme object from a base color palette
 */
export function createTheme(colorName, options = {}) {
  const scale = COLOR_SCALES[colorName];
  if (!scale) {
    throw new Error(`Unknown color scale: ${colorName}. Available: ${Object.keys(COLOR_SCALES).join(', ')}`);
  }
  
  const theme = JSON.parse(JSON.stringify(THEME_TEMPLATE));
  const darkBase = scale.darkBase;
  
  // Generate background colors
  theme.colors.background = {
    primary: `bg-${colorName}-50 dark:bg-${darkBase}-900`,
    secondary: `bg-white dark:bg-${darkBase}-800`,
    tertiary: `bg-${colorName}-100 dark:bg-${darkBase}-700`,
    card: `bg-${colorName}-50 dark:bg-${darkBase}-700`,
    hover: `hover:bg-${colorName}-50 dark:hover:bg-${darkBase}-800/50`,
    hoverStrong: `hover:bg-${colorName}-100 dark:hover:bg-${darkBase}-700`,
    accent: `bg-${colorName}-50 dark:bg-${darkBase}-700`,
    active: `bg-${colorName}-600 dark:bg-${darkBase}-700`
  };
  
  // Generate border colors
  theme.colors.border = {
    primary: `border-${colorName}-200 dark:border-${darkBase}-700`,
    secondary: `border-${colorName}-300 dark:border-${darkBase}-600`,
    strong: `border-${colorName}-400 dark:border-${darkBase}-500`
  };
  
  // Generate text colors
  theme.colors.text = {
    primary: `text-${colorName}-900 dark:text-${darkBase}-100`,
    secondary: `text-${colorName}-700 dark:text-${darkBase}-300`,
    tertiary: `text-${colorName}-600 dark:text-${darkBase}-400`,
    muted: `text-${colorName}-500 dark:text-${darkBase}-400`,
    light: `text-${colorName}-400 dark:text-${darkBase}-500`
  };
  
  // Generate shadow colors
  theme.shadows = {
    sm: 'shadow-sm',
    md: `shadow-md dark:shadow-${darkBase}-800/50`,
    lg: `shadow-lg dark:shadow-${darkBase}-800/70`,
    xl: `shadow-xl dark:shadow-${darkBase}-900/80`
  };
  
  // Apply custom options
  if (options.customColors) {
    Object.assign(theme.colors, options.customColors);
  }
  
  if (options.customShadows) {
    Object.assign(theme.shadows, options.customShadows);
  }
  
  return theme;
}

/**
 * Generate theme variants for different contexts
 */
export function generateThemeVariants(baseTheme, variants = {}) {
  const result = {};
  
  // Default variants
  const defaultVariants = {
    app: baseTheme,
    dev: baseTheme,
    ...variants
  };
  
  Object.entries(defaultVariants).forEach(([key, theme]) => {
    result[key] = typeof theme === 'string' 
      ? createTheme(theme)
      : theme;
  });
  
  return result;
}

/**
 * Pre-built theme configurations
 */
export const BUILT_IN_THEMES = {
  // Main application theme (gray-based)
  app: createTheme('gray'),
  
  // Development pages theme (zinc-based)
  dev: createTheme('zinc'),
  
  // Alternative themes
  blue: createTheme('blue'),
  green: createTheme('green')
};

/**
 * Validate theme structure
 */
export function validateTheme(theme) {
  const required = [
    'colors.background.primary',
    'colors.background.secondary',
    'colors.border.primary',
    'colors.text.primary',
    'colors.status.success',
    'shadows.sm'
  ];
  
  const errors = [];
  
  required.forEach(path => {
    const keys = path.split('.');
    let current = theme;
    
    for (const key of keys) {
      if (!current || typeof current !== 'object' || !(key in current)) {
        errors.push(`Missing required theme property: ${path}`);
        break;
      }
      current = current[key];
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Merge themes with deep merge support
 */
export function mergeThemes(baseTheme, overrideTheme) {
  const result = JSON.parse(JSON.stringify(baseTheme));
  
  function deepMerge(target, source) {
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key] || typeof target[key] !== 'object') {
          target[key] = {};
        }
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }
  
  return deepMerge(result, overrideTheme);
}

/**
 * Theme utilities for component styling
 */
export const ThemeUtils = {
  // Get theme-aware classes for common component types
  getComponentClasses: (theme, componentType, variant = 'primary') => {
    const classMap = {
      card: `${theme.colors.background.secondary} ${theme.colors.border.primary} ${theme.shadows.sm}`,
      section: `${theme.colors.background.secondary} ${theme.colors.border.primary} p-4`,
      header: `${theme.colors.background.secondary} ${theme.colors.border.primary} ${theme.shadows.sm}`,
      'hover-row': `${theme.colors.background.hover} ${theme.transitions.colors}`,
      dropdown: `${theme.colors.background.secondary} ${theme.colors.border.primary} ${theme.shadows.lg}`,
      button: {
        primary: `${theme.colors.status.info.bg} ${theme.colors.status.info.border} ${theme.colors.status.info.text}`,
        secondary: `${theme.colors.background.secondary} ${theme.colors.border.primary} ${theme.colors.text.secondary}`,
        success: `${theme.colors.status.success.bg} ${theme.colors.status.success.border} ${theme.colors.status.success.text}`,
        error: `${theme.colors.status.error.bg} ${theme.colors.status.error.border} ${theme.colors.status.error.text}`
      }
    };
    
    const classes = classMap[componentType];
    return typeof classes === 'object' ? classes[variant] || classes.primary : classes || '';
  },
  
  // Generate responsive classes
  generateResponsiveClasses: (baseClasses, breakpointOverrides = {}) => {
    let result = baseClasses;
    
    Object.entries(breakpointOverrides).forEach(([breakpoint, classes]) => {
      if (classes) {
        result += ` ${breakpoint}:${classes}`;
      }
    });
    
    return result;
  }
};

const ThemeFactory = {
  createTheme,
  generateThemeVariants,
  BUILT_IN_THEMES,
  validateTheme,
  mergeThemes,
  ThemeUtils,
  COLOR_SCALES
};

export default ThemeFactory;