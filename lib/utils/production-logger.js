/**
 * Production Logger Utility
 * 
 * Replaces console.log statements with production-safe logging
 * that only outputs in development mode.
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Log messages - only in development
   */
  log: (message, ...args) => {
    if (isDevelopment) {
      console.log(message, ...args);
    }
  },
  
  /**
   * Warning messages - always shown
   */
  warn: (message, ...args) => {
    console.warn(message, ...args);
  },
  
  /**
   * Error messages - always shown
   */
  error: (message, ...args) => {
    console.error(message, ...args);
  },
  
  /**
   * Debug messages - only in development with verbose flag
   */
  debug: (message, ...args) => {
    if (isDevelopment && process.env.NEXT_PUBLIC_DEBUG === 'true') {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  },
  
  /**
   * Performance messages - only in development
   */
  perf: (message, ...args) => {
    if (isDevelopment) {
      console.log(`[PERF] ${message}`, ...args);
    }
  }
};

// Export individual methods for cleaner imports
export const { log, warn, error, debug, perf } = logger;