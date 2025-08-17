/**
 * UI Constants - Centralized dimensions, sizes, and values
 * 
 * This file contains all repeated UI constants to ensure consistency
 * and make updates easier by changing values in a single location.
 */

// ===========================================
// COLOR THEME SYSTEM
// ===========================================

// App theme for main board/timeline pages (slate/gray)
export const APP_THEME = {
  colors: {
    // Background colors
    background: {
      primary: 'bg-gray-50 dark:bg-gray-900',
      secondary: 'bg-white dark:bg-gray-800',
      tertiary: 'bg-gray-100 dark:bg-gray-700',
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

// Dev theme for development pages (zinc/neutral)
export const THEME = {
  // Primary theme color (zinc/neutral for dev pages)
  colors: {
    // Background colors
    background: {
      primary: 'bg-zinc-50 dark:bg-zinc-900',
      secondary: 'bg-white dark:bg-zinc-800',
      tertiary: 'bg-zinc-100 dark:bg-zinc-800',
      hover: 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
      hoverStrong: 'hover:bg-zinc-200 dark:hover:bg-zinc-700',
      accent: 'bg-zinc-100 dark:bg-zinc-800/25',
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

// Helper function to get theme classes (dev pages - zinc theme)
export function getThemeClasses(type, variant = 'primary') {
  if (type === 'card') {
    return `${THEME.colors.background.secondary} ${THEME.colors.border.primary} ${THEME.shadows.sm}`;
  }
  if (type === 'section') {
    return `${THEME.colors.background.secondary} ${THEME.colors.border.primary} p-4`;
  }
  if (type === 'header') {
    return `${THEME.colors.text.primary} ${THEME.colors.border.primary}`;
  }
  if (type === 'hover-row') {
    return `${THEME.colors.background.hover} ${THEME.transitions.colors}`;
  }
  if (type === 'group-header') {
    return `${THEME.colors.background.tertiary} ${THEME.colors.border.secondary} ${THEME.colors.background.hoverStrong}`;
  }
  return '';
}

// Helper function to get app theme classes (main app pages - gray theme)
export function getAppThemeClasses(type, variant = 'primary') {
  if (type === 'page') {
    return `${APP_THEME.colors.background.primary}`;
  }
  if (type === 'card') {
    return `${APP_THEME.colors.background.secondary} ${APP_THEME.colors.border.primary} ${APP_THEME.shadows.sm}`;
  }
  if (type === 'section') {
    return `${APP_THEME.colors.background.secondary} ${APP_THEME.colors.border.primary} p-4`;
  }
  if (type === 'header') {
    return `${APP_THEME.colors.background.secondary} ${APP_THEME.colors.border.primary} ${APP_THEME.shadows.sm}`;
  }
  if (type === 'zone') {
    return `${APP_THEME.colors.background.secondary} ${APP_THEME.colors.border.primary}`;
  }
  if (type === 'zone-header') {
    return `${APP_THEME.colors.background.secondary} ${APP_THEME.colors.border.primary}`;
  }
  if (type === 'hover-row') {
    return `${APP_THEME.colors.background.hover} ${APP_THEME.transitions.colors}`;
  }
  if (type === 'dropdown') {
    return `${APP_THEME.colors.background.secondary} ${APP_THEME.colors.border.primary} ${APP_THEME.shadows.lg}`;
  }
  return '';
}

// ===========================================
// RESPONSIVE BREAKPOINTS
// ===========================================
export const BREAKPOINTS = {
  mobile: 640,    // sm: screens >= 640px
  tablet: 768,    // md: screens >= 768px  
  desktop: 1024,  // lg: screens >= 1024px
  large: 1440,    // xl: screens >= 1440px
};

// ===========================================
// CARD DIMENSIONS
// ===========================================
export const CARD_RESPONSIVE_WIDTHS = {
  // Mobile: smaller cards for better mobile experience
  mobile: { min: 220, max: 240 },
  // Small tablets: slightly larger
  tablet: { min: 245, max: 265 },
  // Desktop: optimal width for readability
  desktop: { min: 250, max: 250 },
  // Large screens: consistent with desktop
  large: { min: 250, max: 250 }
};

export const CARD_HEIGHTS = {
  mobile: {
    base: 120,
    header: 36,
    footer: 40,
  },
  desktop: {
    base: 160,
    header: 48,
    footer: 50,
  }
};

export const CARD_LAYOUT = {
  stackOffset: 12,        // Pixel offset for overlapping stacks
  stackGap: 20,          // Gap between card stacks
  contentPadding: 24,    // Vertical padding for card content
  minCoreWidth: 220,     // Absolute minimum card width
  maxWidth: 250,         // Current maximum card width
};

export const CARD_CONTROL_RAIL = {
  mobile: {
    width: 32,
    buttonSize: 32,
  },
  desktop: {
    width: 44,
    buttonSize: 36,
  },
  gap: 8,
  topBottomPadding: 8,
  buttonCount: 5,
};

// ===========================================
// COMMON UI HEIGHTS
// ===========================================
export const UI_HEIGHTS = {
  toolbar: 40,           // Standard toolbar/header height
  button: 40,           // Standard button height
  compactButton: 32,    // Smaller button height
  input: 40,            // Standard input height
  compactInput: 32,     // Smaller input height
};

// ===========================================
// PROFILE PICTURES
// ===========================================
export const PROFILE_PICTURE_SIZES = {
  xs: 24,   // was w-6 h-6 (1.5rem = 24px)
  sm: 32,   // was w-8 h-8 (2rem = 32px)  
  md: 40,   // was w-10 h-10 (2.5rem = 40px)
  lg: 48,   // was w-12 h-12 (3rem = 48px)
  xl: 64,   // was w-16 h-16 (4rem = 64px)
  compact: 50,          // Used in compact user selector
  large: 64,
  xl2: 80,
};

// ===========================================
// USER SELECTOR
// ===========================================
export const USER_SELECTOR = {
  dropdownMinWidth: 350,  // Minimum width for dropdown to accommodate longer guest names
  dropdownMaxWidth: 400,  // Maximum width to prevent overly wide dropdowns
  // Dropdown background colors - NOTE: Used directly in className strings
  dropdownBackground: {
    light: 'bg-gray-100',  // Noticeably gray, provides clear contrast from white containers
    dark: 'bg-gray-950',  // Very dark but not black, noticeably darker than app containers
  },
  dropdownBorder: {
    light: 'border-gray-400',  // Darker border for definition against gray-100 bg
    dark: 'border-gray-600',  // Slightly lighter border for visibility
  },
  dropdownHover: {
    light: 'hover:bg-gray-200',  // Even darker gray for clear hover feedback
    dark: 'hover:bg-gray-900',  // Lighter than bg-gray-950 for hover state
  }
};

// ===========================================
// Z-INDEX HIERARCHY
// ===========================================
export const Z_INDEX = {
  base: 1,              // Base layer
  content: 10,          // Regular content overlays
  dropdown: 50,         // Dropdown menus (using z-50 Tailwind class)
  modal: 50,            // Modal dialogs (using z-50 Tailwind class)
  tooltip: 40,          // Tooltips
  dragOverlay: 50,      // Drag and drop overlays
  notification: 50,     // Notifications
  dragging: 1000,       // Items being dragged
};

// Standard Tailwind z-index classes to use directly
export const Z_INDEX_CLASSES = {
  base: 'z-10',         // Base layer
  content: 'z-20',      // Regular content overlays
  dropdown: 'z-50',     // Dropdown menus - high priority
  modal: 'z-50',        // Modal dialogs - high priority
  tooltip: 'z-40',      // Tooltips
  dragOverlay: 'z-50',  // Drag and drop overlays
  notification: 'z-50', // Notifications - high priority
  dragging: 'z-50',     // Items being dragged - very high priority
};

// ===========================================
// ANIMATION DURATIONS (in milliseconds)
// ===========================================
export const ANIMATION_DURATION = {
  fast: 150,           // Quick transitions
  normal: 200,         // Standard transitions
  slow: 300,           // Slower transitions
  entrance: 200,       // Component entrance animations
  exit: 150,           // Component exit animations
  cardFlip: 300,       // Card flip animation duration
};

// ===========================================
// ANIMATION SETTINGS
// ===========================================
export const ANIMATION = {
  duration: ANIMATION_DURATION,
  easing: {
    default: 'ease-in-out',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    flip: 'cubic-bezier(0.4, 0, 0.2, 1)', // Smooth flip animation
  },
  card: {
    flip: {
      duration: ANIMATION_DURATION.cardFlip,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      perspective: '1000px', // 3D perspective for flip
    },
    drag: {
      transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
    hover: {
      scale: 1.02,
      transition: 'all 150ms ease',
    },
  },
  zone: {
    highlight: {
      duration: 200,
      easing: 'ease-in-out',
    },
  },
};

// ===========================================
// CHART CONFIGURATION
// ===========================================
export const CHART_CONFIG = {
  fonts: {
    primary: 'font-mono',  // Tailwind class for monospace
    primaryFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',  // CSS font-family
    dataLabels: {
      size: 12,  // Font size for axis labels (increased from 11)
      color: 'currentColor',
    },
    tooltips: {
      size: 13,  // Font size for tooltips (increased from 12)
      titleSize: 14,  // Font size for tooltip titles (increased from 13)
    },
    table: {
      headerSize: 13,  // Table header font size (increased from 12)
      cellSize: 12,    // Table cell font size (increased from 11)
    }
  },
  axes: {
    y: {
      tickInterval: 5,  // Y-axis increments (5% for percentage charts)
      domain: [0, 100],  // Default domain for percentage charts
      ticks: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100],
    },
    x: {
      angleRotation: -45,  // Rotation angle for long x-axis labels
      maxLabelLength: 12,  // Max characters before truncation
    }
  },
  colors: {
    primary: '#4f46e5',  // Primary line color (indigo)
    success: '#10b981',  // Success color (green)
    warning: '#f59e0b',  // Warning color (amber)
    danger: '#ef4444',   // Danger color (red)
    grid: {
      light: '#e5e7eb',  // Grid color in light mode
      dark: '#374151',   // Grid color in dark mode
    }
  },
  animation: {
    duration: 500,  // Default animation duration in ms
    easing: 'ease-in-out',
  },
  layout: {
    margin: { top: 10, right: 30, left: 10, bottom: 30 },
    height: {
      small: 500,   // Small chart height (increased 2.5x from 200)
      medium: 625,  // Medium chart height (increased 2.5x from 250)
      large: 750,   // Large chart height (increased 2.5x from 300)
    }
  }
};

// ===========================================
// SPACING CONSTANTS
// ===========================================
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ===========================================
// ZONE DIMENSIONS
// ===========================================
export const ZONE_LAYOUT = {
  mobile: {
    minHeight: 200,
    padding: 16,
  },
  desktop: {
    minHeight: 300,
    padding: 20,
  },
  dropAreaPadding: 16,
  borderWidth: 2,
  borderWidthThick: 4,
};

// ===========================================
// DRAG & DROP CONSTANTS
// ===========================================
export const DRAG_DROP = {
  zIndex: {
    base: Z_INDEX.content,
    dropArea: Z_INDEX.dropdown,
    dragOverlay: Z_INDEX.dragOverlay,
  },
  opacity: {
    subtle: 0.3,       // 30% opacity
    medium: 0.4,       // 40% opacity
    strong: 0.5,       // 50% opacity
    overlay: 0.8,      // 80% opacity
  }
};

// ===========================================
// FILE UPLOAD CONSTRAINTS
// ===========================================
export const FILE_UPLOAD = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
};

// ===========================================
// EVENT SYSTEM CONSTANTS
// ===========================================
export const EVENT_TYPES = {
  CARD_CREATED: 'card.created',
  CARD_MOVED: 'card.moved',
  CARD_UPDATED: 'card.updated',
  CARD_DELETED: 'card.deleted',
  CARD_FLIPPED: 'card.flipped'
};

export const EVENT_COLORS = {
  [EVENT_TYPES.CARD_CREATED]: 'bg-emerald-500',
  [EVENT_TYPES.CARD_MOVED]: 'bg-sky-500',
  [EVENT_TYPES.CARD_UPDATED]: 'bg-amber-500',
  [EVENT_TYPES.CARD_DELETED]: 'bg-rose-500',
  [EVENT_TYPES.CARD_FLIPPED]: 'bg-pink-500'
};

export const EVENT_LABELS = {
  [EVENT_TYPES.CARD_CREATED]: 'Card created',
  [EVENT_TYPES.CARD_MOVED]: 'Card moved',
  [EVENT_TYPES.CARD_UPDATED]: 'Card updated',
  [EVENT_TYPES.CARD_DELETED]: 'Card deleted',
  [EVENT_TYPES.CARD_FLIPPED]: 'Card flipped'
};

// Event badge configurations with full color schemes
export const EVENT_BADGE_CONFIG = {
  [EVENT_TYPES.CARD_CREATED]: {
    bg: 'bg-emerald-100 dark:bg-emerald-950/30',
    border: 'border-emerald-200 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-300',
    icon: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500'
  },
  [EVENT_TYPES.CARD_MOVED]: {
    bg: 'bg-sky-100 dark:bg-sky-950/30',
    border: 'border-sky-200 dark:border-sky-800',
    text: 'text-sky-700 dark:text-sky-300',
    icon: 'text-sky-600 dark:text-sky-400',
    dot: 'bg-sky-500'
  },
  [EVENT_TYPES.CARD_UPDATED]: {
    bg: 'bg-amber-100 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-300',
    icon: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500'
  },
  [EVENT_TYPES.CARD_DELETED]: {
    bg: 'bg-rose-100 dark:bg-rose-950/30',
    border: 'border-rose-200 dark:border-rose-800',
    text: 'text-rose-700 dark:text-rose-300',
    icon: 'text-rose-600 dark:text-rose-400',
    dot: 'bg-rose-500'
  },
  [EVENT_TYPES.CARD_FLIPPED]: {
    bg: 'bg-pink-100 dark:bg-pink-950/30',
    border: 'border-pink-200 dark:border-pink-800',
    text: 'text-pink-700 dark:text-pink-300',
    icon: 'text-pink-600 dark:text-pink-400',
    dot: 'bg-pink-500'
  }
};

// ===========================================
// DEV PAGE LAYOUT CONSTANTS
// ===========================================
export const DEV_LAYOUT = {
  // Panel dimensions
  leftPanelWidth: '320px',
  
  // Auto-refresh intervals (ms)
  conversationRefreshInterval: 2000,
  eventPollInterval: 1000,
  
  // Grid spacing
  gridGap: 4,
  sectionPadding: 'p-6',
  
  // Two-column split layout
  timelineEventsGrid: 'grid-cols-2',
  
  // Export filename patterns
  exportFilenames: {
    allConversations: 'dev-conversations',
    singleConversation: 'conversation'
  }
};

// ===========================================
// FORM VALIDATION
// ===========================================
export const FORM_LIMITS = {
  cardContent: {
    min: 1,
    max: 500,
  },
  userName: {
    min: 1,
    max: 100,
  },
  email: {
    max: 255,
  },
  password: {
    min: 8,
    max: 128,
  }
};

// ===========================================
// HELPER FUNCTIONS
// ===========================================

/**
 * Get responsive card width based on screen width
 */
export function getResponsiveCardWidth(screenWidth) {
  if (screenWidth < BREAKPOINTS.mobile) {
    return CARD_RESPONSIVE_WIDTHS.mobile;
  } else if (screenWidth < BREAKPOINTS.desktop) {
    return CARD_RESPONSIVE_WIDTHS.tablet;
  } else if (screenWidth < BREAKPOINTS.large) {
    return CARD_RESPONSIVE_WIDTHS.desktop;
  }
  return CARD_RESPONSIVE_WIDTHS.large;
}

/**
 * Get responsive card heights based on screen width
 */
export function getResponsiveCardHeights(screenWidth) {
  return screenWidth < BREAKPOINTS.mobile 
    ? CARD_HEIGHTS.mobile 
    : CARD_HEIGHTS.desktop;
}

/**
 * Get control rail dimensions based on screen width
 */
export function getControlRailDimensions(screenWidth) {
  return screenWidth < BREAKPOINTS.mobile 
    ? CARD_CONTROL_RAIL.mobile 
    : CARD_CONTROL_RAIL.desktop;
}

/**
 * Calculate minimum rail height
 */
export function getMinRailHeight(screenWidth) {
  const rail = getControlRailDimensions(screenWidth);
  return (
    CARD_CONTROL_RAIL.topBottomPadding * 2 +
    rail.buttonSize * CARD_CONTROL_RAIL.buttonCount +
    CARD_CONTROL_RAIL.gap * (CARD_CONTROL_RAIL.buttonCount - 1)
  );
}

/**
 * Get base minimum card height
 */
export function getBaseMinCardHeight(screenWidth) {
  if (screenWidth < BREAKPOINTS.mobile) {
    return CARD_HEIGHTS.mobile.base;
  }
  
  const heights = getResponsiveCardHeights(screenWidth);
  const minRailHeight = getMinRailHeight(screenWidth);
  
  return Math.max(
    CARD_HEIGHTS.desktop.base,
    minRailHeight + heights.header + heights.footer
  );
}