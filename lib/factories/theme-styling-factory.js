/**
 * Theme-aware Styling Factory
 * 
 * Creates standardized theme-aware components with consistent styling patterns
 * that automatically adapt to light/dark modes and color themes.
 * Reduces theme-related code duplication across 20+ components.
 * 
 * Part of: Mini-Project 2 - Pattern Extraction & API Standardization
 */

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { 
  APP_THEME, 
  THEME, 
  getCurrentAppTheme,
  getAppThemeClasses,
  getThemeClasses 
} from '@/lib/utils/ui-constants';

/**
 * Default theme configurations
 */
const DEFAULT_THEME_CONFIG = {
  mode: 'auto', // 'light', 'dark', 'auto'
  colorTheme: 'gray', // Color theme ID
  context: 'app', // 'app' or 'dev'
  components: {
    card: {
      background: 'secondary',
      border: 'primary',
      shadow: 'sm',
      hover: 'hover',
      text: 'primary',
    },
    button: {
      background: 'primary',
      border: 'primary',
      text: 'primary',
      hover: 'hoverStrong',
    },
    section: {
      background: 'secondary',
      border: 'primary',
      text: 'primary',
    },
    dropdown: {
      background: 'secondary',
      border: 'primary',
      shadow: 'lg',
      text: 'primary',
    },
  },
  states: {
    hover: {
      background: 'hover',
      scale: 1.02,
      transition: 'transition-all duration-200',
    },
    active: {
      background: 'active',
      border: 'strong',
    },
    disabled: {
      opacity: 'opacity-50',
      cursor: 'cursor-not-allowed',
    },
    loading: {
      opacity: 'opacity-70',
      cursor: 'cursor-wait',
    },
  },
};

/**
 * Create theme-aware styling hook
 */
export function createThemeStyleHook(config = {}) {
  const {
    context = 'app',
    colorTheme = 'gray',
    components = {},
    states = {},
    customClasses = {},
  } = { ...DEFAULT_THEME_CONFIG, ...config };

  return function useThemeStyles(options = {}) {
    const {
      mode = 'auto',
      component = 'card',
      variant = 'default',
      state = 'default',
      className = '',
      theme: overrideTheme = null,
    } = options;

    // Get the appropriate theme based on context
    const currentTheme = useMemo(() => {
      if (overrideTheme) return overrideTheme;
      
      if (context === 'dev') {
        return THEME;
      } else {
        // For app context, use dynamic theme if available
        try {
          return getCurrentAppTheme(colorTheme, mode, 'light');
        } catch {
          return APP_THEME;
        }
      }
    }, [mode, overrideTheme]);

    // Get component configuration
    const componentConfig = useMemo(() => {
      const defaultConfig = DEFAULT_THEME_CONFIG.components[component] || DEFAULT_THEME_CONFIG.components.card;
      const customConfig = components[component] || {};
      return { ...defaultConfig, ...customConfig };
    }, [component]);

    // Get state configuration
    const stateConfig = useMemo(() => {
      const defaultStateConfig = DEFAULT_THEME_CONFIG.states[state] || {};
      const customStateConfig = states[state] || {};
      return { ...defaultStateConfig, ...customStateConfig };
    }, [state]);

    // Generate style classes
    const styles = useMemo(() => {
      const classes = [];

      // Base component styles
      if (componentConfig.background) {
        const bgClass = currentTheme.colors.background[componentConfig.background];
        if (bgClass) classes.push(bgClass);
      }

      if (componentConfig.border) {
        const borderClass = currentTheme.colors.border[componentConfig.border];
        if (borderClass) classes.push(borderClass);
      }

      if (componentConfig.text) {
        const textClass = currentTheme.colors.text[componentConfig.text];
        if (textClass) classes.push(textClass);
      }

      if (componentConfig.shadow) {
        const shadowClass = currentTheme.shadows[componentConfig.shadow];
        if (shadowClass) classes.push(shadowClass);
      }

      // State-specific styles
      if (state !== 'default') {
        if (stateConfig.background) {
          const stateBgClass = currentTheme.colors.background[stateConfig.background];
          if (stateBgClass) classes.push(stateBgClass);
        }

        if (stateConfig.border) {
          const stateBorderClass = currentTheme.colors.border[stateConfig.border];
          if (stateBorderClass) classes.push(stateBorderClass);
        }

        if (stateConfig.opacity) {
          classes.push(stateConfig.opacity);
        }

        if (stateConfig.cursor) {
          classes.push(stateConfig.cursor);
        }

        if (stateConfig.transition) {
          classes.push(stateConfig.transition);
        }
      }

      // Hover styles
      if (componentConfig.hover && state !== 'disabled') {
        const hoverClass = currentTheme.colors.background[componentConfig.hover];
        if (hoverClass) classes.push(hoverClass);
      }

      // Custom classes
      if (customClasses[component]) {
        classes.push(customClasses[component]);
      }

      // Additional className
      if (className) {
        classes.push(className);
      }

      return cn(classes);
    }, [currentTheme, componentConfig, stateConfig, state, component, className]);

    // Generate utility functions
    const utils = useMemo(() => ({
      // Get specific theme colors
      getBackgroundClass: (type = 'secondary') => currentTheme.colors.background[type] || '',
      getBorderClass: (type = 'primary') => currentTheme.colors.border[type] || '',
      getTextClass: (type = 'primary') => currentTheme.colors.text[type] || '',
      getShadowClass: (type = 'sm') => currentTheme.shadows[type] || '',
      
      // Get status colors
      getStatusClasses: (status = 'success') => {
        const statusConfig = currentTheme.colors.status[status];
        if (!statusConfig) return {};
        
        return {
          background: statusConfig.bg,
          border: statusConfig.border,
          text: statusConfig.text,
          icon: statusConfig.icon,
        };
      },

      // Get transitions
      getTransitionClass: (type = 'colors') => currentTheme.transitions[type] || '',

      // Generate component-specific classes
      getComponentClasses: (componentType) => {
        if (context === 'app') {
          return getAppThemeClasses(componentType);
        } else {
          return getThemeClasses(componentType);
        }
      },

      // Get theme object
      getTheme: () => currentTheme,
      
      // Check if dark mode
      isDark: () => mode === 'dark' || (mode === 'auto' && window?.matchMedia?.('(prefers-color-scheme: dark)')?.matches),
    }), [currentTheme, context, mode]);

    return {
      styles,
      theme: currentTheme,
      ...utils,
    };
  };
}

/**
 * Create theme-aware component factory
 */
export function createThemedComponent(config) {
  const {
    name,
    baseComponent: BaseComponent,
    defaultProps = {},
    themeConfig = {},
    stateHandlers = {},
    styleOverrides = {},
  } = config;

  const useThemeStyles = createThemeStyleHook(themeConfig);

  return function ThemedComponent(props) {
    const {
      variant = 'default',
      state = 'default',
      className = '',
      theme: themeProp,
      children,
      ...rest
    } = { ...defaultProps, ...props };

    // Get theme styles
    const { styles, ...themeUtils } = useThemeStyles({
      component: name.toLowerCase(),
      variant,
      state,
      className,
      theme: themeProp,
    });

    // Apply style overrides
    const finalStyles = useMemo(() => {
      if (styleOverrides[variant]) {
        return cn(styles, styleOverrides[variant]);
      }
      return styles;
    }, [styles, variant]);

    // Handle state changes
    const handleStateChange = useMemo(() => {
      if (stateHandlers[state]) {
        return stateHandlers[state];
      }
      return () => {};
    }, [state]);

    return (
      <BaseComponent
        className={finalStyles}
        {...rest}
        {...(typeof handleStateChange === 'function' ? handleStateChange(props) : {})}
      >
        {children}
      </BaseComponent>
    );
  };
}

/**
 * Preset theme configurations for common component types
 */
export const themePresets = {
  // App components (main board, timeline)
  app: {
    context: 'app',
    colorTheme: 'gray',
    components: {
      page: {
        background: 'primary',
        text: 'primary',
      },
      card: {
        background: 'secondary',
        border: 'primary',
        shadow: 'sm',
        hover: 'hover',
        text: 'primary',
      },
      section: {
        background: 'secondary',
        border: 'primary',
        text: 'primary',
      },
      zone: {
        background: 'secondary',
        border: 'primary',
        text: 'primary',
      },
      header: {
        background: 'secondary',
        border: 'primary',
        shadow: 'sm',
        text: 'primary',
      },
      dropdown: {
        background: 'secondary',
        border: 'primary',
        shadow: 'lg',
        text: 'primary',
      },
    },
  },
  
  // Dev components (development pages)
  dev: {
    context: 'dev',
    colorTheme: 'zinc',
    components: {
      card: {
        background: 'secondary',
        border: 'primary',
        shadow: 'sm',
        hover: 'hover',
        text: 'primary',
      },
      section: {
        background: 'secondary',
        border: 'primary',
        text: 'primary',
      },
      header: {
        background: 'tertiary',
        border: 'secondary',
        text: 'primary',
        hover: 'hoverStrong',
      },
      groupHeader: {
        background: 'tertiary',
        border: 'secondary',
        text: 'primary',
        hover: 'hoverStrong',
      },
      hoverRow: {
        hover: 'hover',
        transition: 'colors',
      },
    },
  },

  // Modal and overlay components
  modal: {
    context: 'app',
    components: {
      overlay: {
        background: 'rgba(0, 0, 0, 0.5)',
      },
      content: {
        background: 'secondary',
        border: 'primary',
        shadow: 'xl',
        text: 'primary',
      },
    },
  },

  // Button components
  button: {
    context: 'app',
    components: {
      primary: {
        background: 'bg-blue-600 dark:bg-blue-500',
        border: 'border-blue-600 dark:border-blue-500',
        text: 'text-white',
        hover: 'hover:bg-blue-700 dark:hover:bg-blue-600',
      },
      secondary: {
        background: 'secondary',
        border: 'primary',
        text: 'primary',
        hover: 'hover',
      },
      ghost: {
        background: 'transparent',
        text: 'primary',
        hover: 'hover',
      },
    },
  },
};

/**
 * Quick factory functions using presets
 */
export const createAppThemedComponent = (baseComponent, config = {}) => 
  createThemedComponent({
    ...config,
    baseComponent,
    themeConfig: { ...themePresets.app, ...config.themeConfig },
  });

export const createDevThemedComponent = (baseComponent, config = {}) => 
  createThemedComponent({
    ...config,
    baseComponent,
    themeConfig: { ...themePresets.dev, ...config.themeConfig },
  });

export const createModalThemedComponent = (baseComponent, config = {}) => 
  createThemedComponent({
    ...config,
    baseComponent,
    themeConfig: { ...themePresets.modal, ...config.themeConfig },
  });

/**
 * Helper hooks for common theme patterns
 */
export const useAppTheme = (options = {}) => createThemeStyleHook(themePresets.app)(options);
export const useDevTheme = (options = {}) => createThemeStyleHook(themePresets.dev)(options);
export const useModalTheme = (options = {}) => createThemeStyleHook(themePresets.modal)(options);

/**
 * Component styling utilities
 */
export const themeUtils = {
  /**
   * Generate component classes using legacy functions
   */
  getAppClasses: (type, variant) => getAppThemeClasses(type, variant),
  getDevClasses: (type, variant) => getThemeClasses(type, variant),
  
  /**
   * Merge theme classes with custom classes
   */
  mergeThemeClasses: (themeClasses, customClasses) => cn(themeClasses, customClasses),
  
  /**
   * Generate status classes
   */
  getStatusClasses: (status, theme = APP_THEME) => {
    const statusConfig = theme.colors.status[status];
    if (!statusConfig) return '';
    
    return cn(statusConfig.bg, statusConfig.border, statusConfig.text);
  },
  
  /**
   * Generate hover classes
   */
  getHoverClasses: (component, theme = APP_THEME) => {
    const hoverClass = theme.colors.background.hover;
    const transitionClass = theme.transitions.colors;
    return cn(hoverClass, transitionClass);
  },
};

/**
 * Export all utilities
 */
const ThemeStylingFactory = {
  createThemeStyleHook,
  createThemedComponent,
  createAppThemedComponent,
  createDevThemedComponent,
  createModalThemedComponent,
  useAppTheme,
  useDevTheme,
  useModalTheme,
  themePresets,
  themeUtils,
};

export default ThemeStylingFactory;