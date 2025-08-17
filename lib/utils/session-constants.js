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
  [SESSION_EVENT_TYPES.PAGE_VIEW]: EVENT_CATEGORIES.NAVIGATION,
  [SESSION_EVENT_TYPES.ROUTE_CHANGE]: EVENT_CATEGORIES.NAVIGATION,
  
  [SESSION_EVENT_TYPES.CARD_CREATED]: EVENT_CATEGORIES.BOARD,
  [SESSION_EVENT_TYPES.CARD_UPDATED]: EVENT_CATEGORIES.BOARD,
  [SESSION_EVENT_TYPES.CARD_DELETED]: EVENT_CATEGORIES.BOARD,
  [SESSION_EVENT_TYPES.CARD_MOVED]: EVENT_CATEGORIES.BOARD,
  [SESSION_EVENT_TYPES.CARD_FLIPPED]: EVENT_CATEGORIES.BOARD,
  [SESSION_EVENT_TYPES.ZONE_INTERACTION]: EVENT_CATEGORIES.BOARD,
  
  [SESSION_EVENT_TYPES.DIALOG_OPENED]: EVENT_CATEGORIES.UI,
  [SESSION_EVENT_TYPES.DIALOG_CLOSED]: EVENT_CATEGORIES.UI,
  [SESSION_EVENT_TYPES.TRAY_OPENED]: EVENT_CATEGORIES.UI,
  [SESSION_EVENT_TYPES.TRAY_CLOSED]: EVENT_CATEGORIES.UI,
  [SESSION_EVENT_TYPES.BUTTON_CLICKED]: EVENT_CATEGORIES.UI,
  
  [SESSION_EVENT_TYPES.TEST_RUN]: EVENT_CATEGORIES.TESTS,
  [SESSION_EVENT_TYPES.TEST_VIEW]: EVENT_CATEGORIES.TESTS,
  [SESSION_EVENT_TYPES.COVERAGE_VIEW]: EVENT_CATEGORIES.TESTS,
  
  [SESSION_EVENT_TYPES.SESSION_START]: EVENT_CATEGORIES.SESSION,
  [SESSION_EVENT_TYPES.SESSION_END]: EVENT_CATEGORIES.SESSION,
  [SESSION_EVENT_TYPES.USER_IDLE]: EVENT_CATEGORIES.SESSION,
  [SESSION_EVENT_TYPES.USER_ACTIVE]: EVENT_CATEGORIES.SESSION,
  [SESSION_EVENT_TYPES.USER_SWITCHED]: EVENT_CATEGORIES.SESSION,
  
  [SESSION_EVENT_TYPES.THEME_CHANGED]: EVENT_CATEGORIES.SETTINGS,
  [SESSION_EVENT_TYPES.ANIMATION_TOGGLED]: EVENT_CATEGORIES.SETTINGS,
  [SESSION_EVENT_TYPES.PREFERENCE_UPDATED]: EVENT_CATEGORIES.SETTINGS,
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
  POLL_INTERVAL_MS: 2000,
  
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
  [SESSION_EVENT_TYPES.PAGE_VIEW]: 'Viewed Page',
  [SESSION_EVENT_TYPES.ROUTE_CHANGE]: 'Navigated',
  [SESSION_EVENT_TYPES.CARD_CREATED]: 'Created Card',
  [SESSION_EVENT_TYPES.CARD_UPDATED]: 'Updated Card',
  [SESSION_EVENT_TYPES.CARD_DELETED]: 'Deleted Card',
  [SESSION_EVENT_TYPES.CARD_MOVED]: 'Moved Card',
  [SESSION_EVENT_TYPES.CARD_FLIPPED]: 'Flipped Card',
  [SESSION_EVENT_TYPES.ZONE_INTERACTION]: 'Zone Interaction',
  [SESSION_EVENT_TYPES.DIALOG_OPENED]: 'Opened Dialog',
  [SESSION_EVENT_TYPES.DIALOG_CLOSED]: 'Closed Dialog',
  [SESSION_EVENT_TYPES.TRAY_OPENED]: 'Opened Tray',
  [SESSION_EVENT_TYPES.TRAY_CLOSED]: 'Closed Tray',
  [SESSION_EVENT_TYPES.BUTTON_CLICKED]: 'Clicked Button',
  [SESSION_EVENT_TYPES.TEST_RUN]: 'Ran Tests',
  [SESSION_EVENT_TYPES.TEST_VIEW]: 'Viewed Tests',
  [SESSION_EVENT_TYPES.COVERAGE_VIEW]: 'Viewed Coverage',
  [SESSION_EVENT_TYPES.SESSION_START]: 'Session Started',
  [SESSION_EVENT_TYPES.SESSION_END]: 'Session Ended',
  [SESSION_EVENT_TYPES.USER_IDLE]: 'Went Idle',
  [SESSION_EVENT_TYPES.USER_ACTIVE]: 'Became Active',
  [SESSION_EVENT_TYPES.USER_SWITCHED]: 'Switched User',
  [SESSION_EVENT_TYPES.THEME_CHANGED]: 'Changed Theme',
  [SESSION_EVENT_TYPES.ANIMATION_TOGGLED]: 'Toggled Animations',
  [SESSION_EVENT_TYPES.PREFERENCE_UPDATED]: 'Updated Preferences',
};

/**
 * Status Colors for UI
 */
export const SESSION_STATUS_COLORS = {
  [SESSION_STATUS.ACTIVE]: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    border: 'border-green-400 dark:border-green-600',
    text: 'text-green-800 dark:text-green-200',
    indicator: 'bg-green-500',
  },
  [SESSION_STATUS.INACTIVE]: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    border: 'border-yellow-400 dark:border-yellow-600',
    text: 'text-yellow-800 dark:text-yellow-200',
    indicator: 'bg-yellow-500',
  },
  [SESSION_STATUS.IDLE]: {
    bg: 'bg-gray-100 dark:bg-gray-900/30',
    border: 'border-gray-400 dark:border-gray-600',
    text: 'text-gray-800 dark:text-gray-200',
    indicator: 'bg-gray-500',
  },
  [SESSION_STATUS.ENDED]: {
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