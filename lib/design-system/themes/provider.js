/**
 * Theme Provider System
 * 
 * Provides theme context and utilities for components.
 * Integrates with the theme factory system for consistent theming.
 * 
 * @version 1.0.0
 * @date 2025-08-20
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createTheme, BUILT_IN_THEMES, validateTheme, mergeThemes } from './factory.js';

/**
 * Theme context for providing theme data throughout the app
 */
const ThemeContext = createContext({
  currentTheme: null,
  setTheme: () => {},
  themes: {},
  isValidTheme: () => false,
  createCustomTheme: () => {},
  resetToDefault: () => {}
});

/**
 * Theme Provider component
 */
export function ThemeProvider({ 
  children, 
  defaultTheme = 'app',
  customThemes = {},
  onThemeChange = null 
}) {
  // Initialize available themes
  const [themes] = useState(() => ({
    ...BUILT_IN_THEMES,
    ...customThemes
  }));
  
  // Current theme state
  const [currentTheme, setCurrentTheme] = useState(() => {
    const theme = themes[defaultTheme] || BUILT_IN_THEMES.app;
    const validation = validateTheme(theme);
    
    if (!validation.valid) {
      console.warn('Invalid default theme:', validation.errors);
      return BUILT_IN_THEMES.app;
    }
    
    return theme;
  });
  
  // Set theme with validation
  const setTheme = useCallback((themeNameOrObject) => {
    let newTheme;
    
    if (typeof themeNameOrObject === 'string') {
      newTheme = themes[themeNameOrObject];
      if (!newTheme) {
        console.warn(`Theme '${themeNameOrObject}' not found`);
        return false;
      }
    } else if (typeof themeNameOrObject === 'object') {
      newTheme = themeNameOrObject;
    } else {
      console.warn('Invalid theme parameter:', themeNameOrObject);
      return false;
    }
    
    // Validate theme structure
    const validation = validateTheme(newTheme);
    if (!validation.valid) {
      console.warn('Invalid theme structure:', validation.errors);
      return false;
    }
    
    setCurrentTheme(newTheme);
    
    // Notify of theme change
    if (onThemeChange) {
      onThemeChange(newTheme, themeNameOrObject);
    }
    
    return true;
  }, [themes, onThemeChange]);
  
  // Check if theme is valid
  const isValidTheme = useCallback((theme) => {
    return validateTheme(theme).valid;
  }, []);
  
  // Create custom theme from color palette
  const createCustomTheme = useCallback((colorName, options = {}) => {
    try {
      return createTheme(colorName, options);
    } catch (error) {
      console.warn('Failed to create custom theme:', error.message);
      return null;
    }
  }, []);
  
  // Reset to default theme
  const resetToDefault = useCallback(() => {
    const defaultThemeObj = themes[defaultTheme] || BUILT_IN_THEMES.app;
    setCurrentTheme(defaultThemeObj);
    
    if (onThemeChange) {
      onThemeChange(defaultThemeObj, defaultTheme);
    }
  }, [themes, defaultTheme, onThemeChange]);
  
  // Context value
  const contextValue = {
    currentTheme,
    setTheme,
    themes,
    isValidTheme,
    createCustomTheme,
    resetToDefault
  };
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook to use theme context
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}

/**
 * Hook to get theme classes for component styling
 */
export function useThemeClasses(componentType, variant = 'primary') {
  const { currentTheme } = useTheme();
  
  return useCallback((overrides = {}) => {
    if (!currentTheme) return '';
    
    // Get base classes from theme
    let baseClasses = '';
    
    switch (componentType) {
      case 'card':
        baseClasses = `${currentTheme.colors.background.secondary} ${currentTheme.colors.border.primary} ${currentTheme.shadows.sm}`;
        break;
        
      case 'section':
        baseClasses = `${currentTheme.colors.background.secondary} ${currentTheme.colors.border.primary} p-4`;
        break;
        
      case 'header':
        baseClasses = `${currentTheme.colors.background.secondary} ${currentTheme.colors.border.primary} ${currentTheme.shadows.sm}`;
        break;
        
      case 'button':
        if (variant === 'primary') {
          baseClasses = `${currentTheme.colors.status.info.bg} ${currentTheme.colors.status.info.border} ${currentTheme.colors.status.info.text}`;
        } else if (variant === 'secondary') {
          baseClasses = `${currentTheme.colors.background.secondary} ${currentTheme.colors.border.primary} ${currentTheme.colors.text.secondary}`;
        } else if (variant === 'success') {
          baseClasses = `${currentTheme.colors.status.success.bg} ${currentTheme.colors.status.success.border} ${currentTheme.colors.status.success.text}`;
        } else if (variant === 'error') {
          baseClasses = `${currentTheme.colors.status.error.bg} ${currentTheme.colors.status.error.border} ${currentTheme.colors.status.error.text}`;
        }
        break;
        
      case 'text':
        if (variant === 'primary') {
          baseClasses = currentTheme.colors.text.primary;
        } else if (variant === 'secondary') {
          baseClasses = currentTheme.colors.text.secondary;
        } else if (variant === 'muted') {
          baseClasses = currentTheme.colors.text.muted;
        }
        break;
        
      case 'background':
        if (variant === 'primary') {
          baseClasses = currentTheme.colors.background.primary;
        } else if (variant === 'secondary') {
          baseClasses = currentTheme.colors.background.secondary;
        } else if (variant === 'card') {
          baseClasses = currentTheme.colors.background.card;
        }
        break;
        
      default:
        console.warn(`Unknown component type: ${componentType}`);
        return '';
    }
    
    // Apply overrides
    if (overrides.replace) {
      return overrides.replace;
    }
    
    if (overrides.add) {
      baseClasses += ` ${overrides.add}`;
    }
    
    return baseClasses.trim();
  }, [currentTheme, componentType, variant]);
}

/**
 * Hook for theme-aware CSS custom properties
 */
export function useThemeCSSProperties() {
  const { currentTheme } = useTheme();
  
  return useCallback(() => {
    if (!currentTheme) return {};
    
    // Extract colors for CSS custom properties
    const cssProps = {};
    
    // Background colors
    if (currentTheme.colors?.background) {
      cssProps['--theme-bg-primary'] = currentTheme.colors.background.primary;
      cssProps['--theme-bg-secondary'] = currentTheme.colors.background.secondary;
      cssProps['--theme-bg-card'] = currentTheme.colors.background.card;
    }
    
    // Text colors
    if (currentTheme.colors?.text) {
      cssProps['--theme-text-primary'] = currentTheme.colors.text.primary;
      cssProps['--theme-text-secondary'] = currentTheme.colors.text.secondary;
      cssProps['--theme-text-muted'] = currentTheme.colors.text.muted;
    }
    
    // Border colors
    if (currentTheme.colors?.border) {
      cssProps['--theme-border-primary'] = currentTheme.colors.border.primary;
      cssProps['--theme-border-secondary'] = currentTheme.colors.border.secondary;
    }
    
    // Shadows
    if (currentTheme.shadows) {
      cssProps['--theme-shadow-sm'] = currentTheme.shadows.sm;
      cssProps['--theme-shadow-md'] = currentTheme.shadows.md;
      cssProps['--theme-shadow-lg'] = currentTheme.shadows.lg;
    }
    
    return cssProps;
  }, [currentTheme]);
}

/**
 * Higher-order component for theme injection
 */
export function withTheme(Component) {
  const ThemedComponent = (props) => {
    const theme = useTheme();
    return <Component {...props} theme={theme} />;
  };
  
  ThemedComponent.displayName = `withTheme(${Component.displayName || Component.name})`;
  return ThemedComponent;
}

/**
 * Theme utilities for non-React contexts
 */
export const ThemeUtils = {
  // Create theme instance outside React
  createStandaloneTheme: (colorName, options = {}) => {
    try {
      const theme = createTheme(colorName, options);
      const validation = validateTheme(theme);
      
      if (!validation.valid) {
        throw new Error(`Invalid theme: ${validation.errors.join(', ')}`);
      }
      
      return theme;
    } catch (error) {
      console.warn('Failed to create standalone theme:', error.message);
      return null;
    }
  },
  
  // Merge themes outside React
  combineThemes: (baseTheme, ...overrideThemes) => {
    try {
      let result = baseTheme;
      
      for (const override of overrideThemes) {
        result = mergeThemes(result, override);
      }
      
      const validation = validateTheme(result);
      if (!validation.valid) {
        throw new Error(`Invalid merged theme: ${validation.errors.join(', ')}`);
      }
      
      return result;
    } catch (error) {
      console.warn('Failed to combine themes:', error.message);
      return baseTheme;
    }
  }
};

const ThemeProviderExports = {
  ThemeProvider,
  useTheme,
  useThemeClasses,
  useThemeCSSProperties,
  withTheme,
  ThemeUtils
};

export default ThemeProviderExports;