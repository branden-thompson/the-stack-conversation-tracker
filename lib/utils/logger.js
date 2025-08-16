/**
 * Logger Utility
 * 
 * Provides environment-aware logging that can be easily toggled
 * without removing debug statements from the codebase.
 * 
 * Usage:
 *   import logger from '@/lib/utils/logger';
 *   
 *   logger.debug('Debug message', data);
 *   logger.info('Info message');
 *   logger.warn('Warning message');
 *   logger.error('Error message', error);
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isDebugEnabled = process.env.NEXT_PUBLIC_DEBUG === 'true';

// Log levels
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

// Current log level based on environment
const currentLogLevel = isDevelopment 
  ? (isDebugEnabled ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN)
  : LOG_LEVELS.ERROR;

const logger = {
  debug: (...args) => {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      console.log('[DEBUG]', ...args);
    }
  },
  
  info: (...args) => {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      console.log('[INFO]', ...args);
    }
  },
  
  warn: (...args) => {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
      console.warn('[WARN]', ...args);
    }
  },
  
  error: (...args) => {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
      console.error('[ERROR]', ...args);
    }
  },
  
  // Group logging for related messages
  group: (label) => {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      console.group(label);
    }
  },
  
  groupEnd: () => {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      console.groupEnd();
    }
  },
  
  // Conditional logging based on feature flags
  feature: (featureName, ...args) => {
    const featureFlag = process.env[`NEXT_PUBLIC_DEBUG_${featureName.toUpperCase()}`];
    if (featureFlag === 'true') {
      console.log(`[${featureName}]`, ...args);
    }
  }
};

export default logger;