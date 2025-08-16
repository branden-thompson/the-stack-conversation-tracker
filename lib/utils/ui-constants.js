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
  xs: 16,
  sm: 24,
  md: 32,
  lg: 40,
  xl: 48,
  compact: 50,          // Used in compact user selector
  large: 64,
  xl2: 80,
};

// ===========================================
// Z-INDEX HIERARCHY
// ===========================================
export const Z_INDEX = {
  base: 1,              // Base layer
  content: 10,          // Regular content overlays
  dropdown: 20,         // Dropdown menus
  modal: 30,           // Modal dialogs
  tooltip: 40,         // Tooltips
  dragOverlay: 50,     // Drag and drop overlays
  notification: 100,   // Notifications
  dragging: 1000,      // Items being dragged
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