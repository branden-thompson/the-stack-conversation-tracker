/**
 * UI Constants - Centralized dimensions, sizes, and values
 * 
 * This file contains all repeated UI constants to ensure consistency
 * and make updates easier by changing values in a single location.
 */

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