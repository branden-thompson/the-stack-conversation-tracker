/**
 * Development-only logging utility
 * Automatically strips all logging in production builds
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Development-only logger that gets stripped in production
 */
export const devLog = {
  log: isDevelopment ? console.log.bind(console) : () => {},
  warn: isDevelopment ? console.warn.bind(console) : () => {},
  error: console.error.bind(console), // Always keep errors
  info: isDevelopment ? console.info.bind(console) : () => {},
  debug: isDevelopment ? console.debug.bind(console) : () => {},
};

/**
 * Performance logging - only in development
 */
export const perfLog = {
  time: isDevelopment ? console.time.bind(console) : () => {},
  timeEnd: isDevelopment ? console.timeEnd.bind(console) : () => {},
  mark: isDevelopment ? (label, data) => console.log(`[PERF] ${label}:`, data) : () => {},
};

/**
 * Component logging with consistent prefixes
 */
export const componentLog = {
  mount: isDevelopment ? (componentName, data) => console.log(`[${componentName}] Mounted:`, data) : () => {},
  update: isDevelopment ? (componentName, data) => console.log(`[${componentName}] Updated:`, data) : () => {},
  unmount: isDevelopment ? (componentName) => console.log(`[${componentName}] Unmounted`) : () => {},
  action: isDevelopment ? (componentName, action, data) => console.log(`[${componentName}] ${action}:`, data) : () => {},
  state: isDevelopment ? (componentName, state) => console.log(`[${componentName}] State:`, state) : () => {},
};

/**
 * API logging - only in development
 */
export const apiLog = {
  request: isDevelopment ? (method, url, data) => console.log(`[API] ${method} ${url}:`, data) : () => {},
  response: isDevelopment ? (method, url, status, data) => console.log(`[API] ${method} ${url} ${status}:`, data) : () => {},
  error: (method, url, error) => console.error(`[API] ${method} ${url} ERROR:`, error),
};