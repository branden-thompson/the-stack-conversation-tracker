/**
 * Session and User Tracking Constants
 * Centralized definitions for user session tracking, events, and behaviors
 */

/**
 * Session Event Types
 * Core event types that can be emitted during user sessions
 */
export const SESSION_EVENT_TYPES = {
  // Navigation events
  PAGE_VIEW: 'page_view',
  ROUTE_CHANGE: 'route_change',
  
  // Board interactions
  CARD_CREATED: 'card_created',
  CARD_UPDATED: 'card_updated',
  CARD_DELETED: 'card_deleted',
  CARD_MOVED: 'card_moved',
  CARD_FLIPPED: 'card_flipped',
  ZONE_INTERACTION: 'zone_interaction',
  
  // UI interactions
  DIALOG_OPENED: 'dialog_opened',
  DIALOG_CLOSED: 'dialog_closed',
  TRAY_OPENED: 'tray_opened',
  TRAY_CLOSED: 'tray_closed',
  BUTTON_CLICKED: 'button_clicked',
  
  // Test page interactions
  TEST_RUN: 'test_run',
  TEST_VIEW: 'test_view',
  COVERAGE_VIEW: 'coverage_view',
  
  // User/Session events
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  USER_IDLE: 'user_idle',
  USER_ACTIVE: 'user_active',
  USER_SWITCHED: 'user_switched',
  
  // Settings/Preferences
  THEME_CHANGED: 'theme_changed',
  ANIMATION_TOGGLED: 'animation_toggled',
  PREFERENCE_UPDATED: 'preference_updated',
};

/**
 * Event Categories for filtering and grouping
 */
export const EVENT_CATEGORIES = {
  NAVIGATION: 'navigation',
  BOARD: 'board',
  UI: 'ui',
  TESTS: 'tests',
  SESSION: 'session',
  SETTINGS: 'settings',
  CUSTOM: 'custom',
};

/**
 * Map event types to categories
 */
export const EVENT_TYPE_CATEGORY_MAP = {
  // Navigation events
  'page_view': EVENT_CATEGORIES.NAVIGATION,
  'route_change': EVENT_CATEGORIES.NAVIGATION,
  
  // Board interactions
  'card_created': EVENT_CATEGORIES.BOARD,
  'card_updated': EVENT_CATEGORIES.BOARD,
  'card_deleted': EVENT_CATEGORIES.BOARD,
  'card_moved': EVENT_CATEGORIES.BOARD,
  'card_flipped': EVENT_CATEGORIES.BOARD,
  'zone_interaction': EVENT_CATEGORIES.BOARD,
  
  // UI interactions
  'dialog_opened': EVENT_CATEGORIES.UI,
  'dialog_closed': EVENT_CATEGORIES.UI,
  'tray_opened': EVENT_CATEGORIES.UI,
  'tray_closed': EVENT_CATEGORIES.UI,
  'button_clicked': EVENT_CATEGORIES.UI,
  
  // Test page interactions
  'test_run': EVENT_CATEGORIES.TESTS,
  'test_view': EVENT_CATEGORIES.TESTS,
  'coverage_view': EVENT_CATEGORIES.TESTS,
  
  // User/Session events
  'session_start': EVENT_CATEGORIES.SESSION,
  'session_end': EVENT_CATEGORIES.SESSION,
  'user_idle': EVENT_CATEGORIES.SESSION,
  'user_active': EVENT_CATEGORIES.SESSION,
  'user_switched': EVENT_CATEGORIES.SESSION,
  
  // Settings/Preferences
  'theme_changed': EVENT_CATEGORIES.SETTINGS,
  'animation_toggled': EVENT_CATEGORIES.SETTINGS,
  'preference_updated': EVENT_CATEGORIES.SETTINGS,
};

/**
 * Session Status Types
 */
export const SESSION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  IDLE: 'idle',
  ENDED: 'ended',
};

/**
 * User Types for session tracking
 */
export const SESSION_USER_TYPES = {
  REGISTERED: 'registered',
  GUEST: 'guest',
  SYSTEM: 'system',
};

/**
 * Session Configuration Defaults
 */
export const SESSION_CONFIG = {
  // Idle detection
  IDLE_THRESHOLD_MS: 5 * 60 * 1000, // 5 minutes
  INACTIVE_THRESHOLD_MS: 30 * 1000, // 30 seconds
  
  // Event batching
  BATCH_SIZE: 10,
  BATCH_TIMEOUT_MS: 500,
  
  // Data retention
  EVENT_TTL_MS: 60 * 60 * 1000, // 1 hour for real-time events
  SESSION_TTL_MS: 24 * 60 * 60 * 1000, // 24 hours for session data
  
  // Performance tuning
  DEFAULT_MODE: 'polling', // 'polling' | 'push' | 'pubsub'
  POLL_INTERVAL_MS: 5000, // Optimized: 2000ms → 5000ms (2.5x reduction in API calls)
  
  // UI refresh
  UI_UPDATE_THROTTLE_MS: 100, // Throttle UI updates
};

/**
 * Browser Detection Helpers
 */
export function detectBrowser(userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '') {
  const ua = userAgent.toLowerCase();
  
  if (ua.includes('chrome') && !ua.includes('edg')) {
    const version = ua.match(/chrome\/(\d+)/)?.[1];
    return `Chrome ${version || ''}`.trim();
  }
  if (ua.includes('safari') && !ua.includes('chrome')) {
    const version = ua.match(/version\/(\d+)/)?.[1];
    return `Safari ${version || ''}`.trim();
  }
  if (ua.includes('firefox')) {
    const version = ua.match(/firefox\/(\d+)/)?.[1];
    return `Firefox ${version || ''}`.trim();
  }
  if (ua.includes('edg')) {
    const version = ua.match(/edg\/(\d+)/)?.[1];
    return `Edge ${version || ''}`.trim();
  }
  
  return 'Unknown Browser';
}

export function detectOS(userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '') {
  const ua = userAgent.toLowerCase();
  
  // Check mobile OS first (they often include 'linux' or 'mac' in UA)
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ipod')) return 'iOS';
  
  // Then desktop OS
  if (ua.includes('mac')) return 'macOS';
  if (ua.includes('win')) return 'Windows';
  if (ua.includes('linux')) return 'Linux';
  
  return 'Unknown OS';
}

export function getBrowserInfo(userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '') {
  return `${detectBrowser(userAgent)} on ${detectOS(userAgent)}`;
}

/**
 * Event Labels for UI Display
 */
export const SESSION_EVENT_LABELS = {
  // Navigation events
  'page_view': 'Viewed Page',
  'route_change': 'Navigated',
  
  // Board interactions
  'card_created': 'Created Card',
  'card_updated': 'Updated Card',
  'card_deleted': 'Deleted Card',
  'card_moved': 'Moved Card',
  'card_flipped': 'Flipped Card',
  'zone_interaction': 'Zone Interaction',
  
  // UI interactions
  'dialog_opened': 'Opened Dialog',
  'dialog_closed': 'Closed Dialog',
  'tray_opened': 'Opened Tray',
  'tray_closed': 'Closed Tray',
  'button_clicked': 'Clicked Button',
  
  // Test page interactions
  'test_run': 'Ran Tests',
  'test_view': 'Viewed Tests',
  'coverage_view': 'Viewed Coverage',
  
  // User/Session events
  'session_start': 'Session Started',
  'session_end': 'Session Ended',
  'user_idle': 'Went Idle',
  'user_active': 'Became Active',
  'user_switched': 'Switched User',
  
  // Settings/Preferences
  'theme_changed': 'Changed Theme',
  'animation_toggled': 'Toggled Animations',
  'preference_updated': 'Updated Preferences',
};

/**
 * Status Colors for UI
 */
export const SESSION_STATUS_COLORS = {
  'active': {
    bg: 'bg-green-100 dark:bg-green-900/30',
    border: 'border-green-400 dark:border-green-600',
    text: 'text-green-800 dark:text-green-200',
    indicator: 'bg-green-500',
  },
  'inactive': {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    border: 'border-yellow-400 dark:border-yellow-600',
    text: 'text-yellow-800 dark:text-yellow-200',
    indicator: 'bg-yellow-500',
  },
  'idle': {
    bg: 'bg-gray-100 dark:bg-gray-900/30',
    border: 'border-gray-400 dark:border-gray-600',
    text: 'text-gray-800 dark:text-gray-200',
    indicator: 'bg-gray-500',
  },
  'ended': {
    bg: 'bg-red-100 dark:bg-red-900/30',
    border: 'border-red-400 dark:border-red-600',
    text: 'text-red-800 dark:text-red-200',
    indicator: 'bg-red-500',
  },
};

/**
 * Generate UUID (works in both browser and Node)
 */
function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Helper to create a session event
 */
export function createSessionEvent(type, metadata = {}) {
  return {
    id: generateId(),
    type,
    category: EVENT_TYPE_CATEGORY_MAP[type] || EVENT_CATEGORIES.CUSTOM,
    timestamp: Date.now(),
    metadata,
  };
}

/**
 * Helper to create a new session
 */
export function createSession(userId, userType = SESSION_USER_TYPES.REGISTERED) {
  return {
    id: generateId(),
    userId,
    userType,
    startedAt: Date.now(),
    lastActivityAt: Date.now(),
    status: SESSION_STATUS.ACTIVE,
    browser: typeof window !== 'undefined' ? getBrowserInfo() : 'Unknown',
    currentRoute: typeof window !== 'undefined' ? window.location.pathname : '/',
    eventCount: 0,
    recentActions: [],
    metadata: {},
  };
}

/**
 * Helper to determine if session is considered idle
 */
export function isSessionIdle(lastActivityAt) {
  return Date.now() - lastActivityAt > SESSION_CONFIG.IDLE_THRESHOLD_MS;
}

/**
 * Helper to determine if session is considered inactive
 */
export function isSessionInactive(lastActivityAt) {
  return Date.now() - lastActivityAt > SESSION_CONFIG.INACTIVE_THRESHOLD_MS;
}