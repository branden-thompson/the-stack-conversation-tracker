/**
 * Layout Constants - Centralized layout and spacing definitions
 * 
 * Provides consistent layout constants for the design system.
 * Integrates with theme factory and ui-constants for unified design.
 * 
 * @version 1.0.0
 * @date 2025-08-20
 */

/**
 * Responsive breakpoints (matches ui-constants.js)
 */
export const BREAKPOINTS = {
  mobile: 640,    // sm: screens >= 640px
  tablet: 768,    // md: screens >= 768px  
  desktop: 1024,  // lg: screens >= 1024px
  large: 1440,    // xl: screens >= 1440px
};

/**
 * Spacing scale following Tailwind conventions
 */
export const SPACING = {
  xs: '0.25rem',     // 4px
  sm: '0.5rem',      // 8px
  md: '1rem',        // 16px
  lg: '1.5rem',      // 24px
  xl: '2rem',        // 32px
  '2xl': '3rem',     // 48px
  '3xl': '4rem',     // 64px
  '4xl': '5rem',     // 80px
  '5xl': '6rem',     // 96px
};

/**
 * Grid and layout configurations
 */
export const GRID = {
  columns: {
    1: 'grid-cols-1',
    2: 'grid-cols-2', 
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    6: 'grid-cols-6',
    12: 'grid-cols-12',
    // Responsive variants
    responsive: {
      '1-2': 'grid-cols-1 md:grid-cols-2',
      '1-3': 'grid-cols-1 md:grid-cols-3',
      '2-4': 'grid-cols-2 md:grid-cols-4',
      '1-2-3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      '1-2-4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    }
  },
  gaps: {
    none: 'gap-0',
    xs: 'gap-1',      // 4px
    sm: 'gap-2',      // 8px  
    md: 'gap-4',      // 16px
    lg: 'gap-6',      // 24px
    xl: 'gap-8',      // 32px
    '2xl': 'gap-12',  // 48px
  }
};

/**
 * Flexbox utilities
 */
export const FLEX = {
  direction: {
    row: 'flex-row',
    column: 'flex-col',
    rowReverse: 'flex-row-reverse',
    columnReverse: 'flex-col-reverse',
  },
  wrap: {
    wrap: 'flex-wrap',
    nowrap: 'flex-nowrap',
    wrapReverse: 'flex-wrap-reverse',
  },
  justify: {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  },
  align: {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
  },
  gaps: GRID.gaps,
};

/**
 * Container configurations
 */
export const CONTAINERS = {
  // Page-level containers
  page: {
    maxWidth: 'max-w-7xl',
    padding: 'px-4 sm:px-6 lg:px-8',
    margin: 'mx-auto',
    combined: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  },
  
  // Content containers
  content: {
    maxWidth: 'max-w-4xl',
    padding: 'px-4 sm:px-6',
    margin: 'mx-auto',
    combined: 'max-w-4xl mx-auto px-4 sm:px-6',
  },
  
  // Section containers
  section: {
    padding: 'py-8 sm:py-12 lg:py-16',
    margin: 'my-4 sm:my-6 lg:my-8',
  },
  
  // Card containers
  card: {
    padding: 'p-4 sm:p-6',
    margin: 'm-2 sm:m-4',
    maxWidth: 'max-w-sm',
  },
  
  // Modal containers
  modal: {
    maxWidth: 'max-w-lg',
    padding: 'p-6',
    margin: 'mx-auto my-8',
    combined: 'max-w-lg mx-auto my-8 p-6',
  },
};

/**
 * Z-index hierarchy for layering
 */
export const Z_INDEX = {
  base: 'z-0',
  background: 'z-10',
  content: 'z-20', 
  header: 'z-30',
  overlay: 'z-40',
  modal: 'z-50',
  popover: 'z-50',
  tooltip: 'z-50',
  dropdown: 'z-50',
  notification: 'z-50',
};

/**
 * Border radius scale
 */
export const BORDER_RADIUS = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
};

/**
 * Shadow scale
 */
export const SHADOWS = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  inner: 'shadow-inner',
};

/**
 * Animation and transition utilities
 */
export const TRANSITIONS = {
  duration: {
    fastest: 'duration-75',
    fast: 'duration-150',
    normal: 'duration-200',
    slow: 'duration-300',
    slowest: 'duration-500',
  },
  easing: {
    linear: 'ease-linear',
    in: 'ease-in',
    out: 'ease-out',
    inOut: 'ease-in-out',
  },
  property: {
    all: 'transition-all',
    colors: 'transition-colors',
    opacity: 'transition-opacity',
    shadow: 'transition-shadow',
    transform: 'transition-transform',
  },
  combined: {
    fast: 'transition-all duration-150 ease-in-out',
    normal: 'transition-all duration-200 ease-in-out',
    slow: 'transition-all duration-300 ease-in-out',
    colors: 'transition-colors duration-200 ease-in-out',
    transform: 'transition-transform duration-200 ease-in-out',
  }
};

/**
 * Typography scale (integrates with theme system)
 */
export const TYPOGRAPHY = {
  size: {
    xs: 'text-xs',      // 12px
    sm: 'text-sm',      // 14px
    base: 'text-base',  // 16px
    lg: 'text-lg',      // 18px
    xl: 'text-xl',      // 20px
    '2xl': 'text-2xl',  // 24px
    '3xl': 'text-3xl',  // 30px
    '4xl': 'text-4xl',  // 36px
    '5xl': 'text-5xl',  // 48px
  },
  weight: {
    thin: 'font-thin',
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
  },
  lineHeight: {
    tight: 'leading-tight',
    snug: 'leading-snug',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose',
  },
  family: {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
  }
};

/**
 * Component-specific layout patterns
 */
export const COMPONENT_LAYOUTS = {
  // Card layouts
  card: {
    base: 'rounded-lg border shadow-sm',
    padded: 'rounded-lg border shadow-sm p-6',
    compact: 'rounded-md border shadow-sm p-4',
    elevated: 'rounded-lg border shadow-lg p-6',
  },
  
  // Button layouts
  button: {
    base: 'inline-flex items-center justify-center rounded-md transition-colors',
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-6 text-lg',
    icon: 'h-10 w-10',
  },
  
  // Form layouts
  form: {
    group: 'space-y-4',
    field: 'space-y-2',
    input: 'w-full rounded-md border px-3 py-2',
    label: 'text-sm font-medium',
    error: 'text-sm text-red-600',
    help: 'text-sm text-gray-500',
  },
  
  // List layouts
  list: {
    base: 'space-y-2',
    divided: 'divide-y',
    grid: 'grid gap-4',
    horizontal: 'flex space-x-4',
  },
  
  // Navigation layouts
  navigation: {
    horizontal: 'flex space-x-6',
    vertical: 'space-y-2',
    tabs: 'flex border-b',
    breadcrumb: 'flex items-center space-x-2',
  },
};

/**
 * Layout utility functions
 */
export const LayoutUtils = {
  /**
   * Combine layout classes safely
   */
  combine: (...classes) => {
    return classes.filter(Boolean).join(' ');
  },
  
  /**
   * Get responsive container classes
   */
  getContainer: (type = 'page', responsive = true) => {
    const config = CONTAINERS[type] || CONTAINERS.page;
    if (responsive && config.combined) {
      return config.combined;
    }
    return LayoutUtils.combine(config.maxWidth, config.padding, config.margin);
  },
  
  /**
   * Get responsive grid classes
   */
  getGrid: (columns, gap = 'md') => {
    const columnClass = typeof columns === 'string' 
      ? GRID.columns.responsive[columns] || GRID.columns[columns]
      : GRID.columns[columns];
    const gapClass = GRID.gaps[gap];
    return LayoutUtils.combine('grid', columnClass, gapClass);
  },
  
  /**
   * Get flex layout classes
   */
  getFlex: (direction = 'row', justify = 'start', align = 'center', gap = 'md') => {
    return LayoutUtils.combine(
      'flex',
      FLEX.direction[direction],
      FLEX.justify[justify],
      FLEX.align[align],
      FLEX.gaps[gap]
    );
  },
  
  /**
   * Get component layout classes
   */
  getComponent: (component, variant = 'base') => {
    return COMPONENT_LAYOUTS[component]?.[variant] || '';
  },
  
  /**
   * Get responsive breakpoint classes
   */
  getResponsive: (baseClasses, breakpointOverrides = {}) => {
    let result = baseClasses;
    
    Object.entries(breakpointOverrides).forEach(([breakpoint, classes]) => {
      if (classes) {
        const prefix = breakpoint === 'mobile' ? 'sm:' : 
                     breakpoint === 'tablet' ? 'md:' :
                     breakpoint === 'desktop' ? 'lg:' :
                     breakpoint === 'large' ? 'xl:' : `${breakpoint}:`;
        result += ` ${prefix}${classes}`;
      }
    });
    
    return result;
  }
};

/**
 * Export all layout constants and utilities
 */
export default {
  BREAKPOINTS,
  SPACING,
  GRID,
  FLEX, 
  CONTAINERS,
  Z_INDEX,
  BORDER_RADIUS,
  SHADOWS,
  TRANSITIONS,
  TYPOGRAPHY,
  COMPONENT_LAYOUTS,
  LayoutUtils,
};