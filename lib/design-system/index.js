/**
 * Design System Entry Point
 * 
 * Centralized exports for the unified design system.
 * Provides themes, utilities, and constants for consistent UI.
 * 
 * @version 1.0.0
 * @date 2025-08-20
 */

// Theme system
export * from './themes/factory.js';
export * from './themes/provider.js';

// Constants integration
export * from '../constants/ui/layout.js';

// Legacy compatibility - these will be phased out
export { THEME, APP_THEME } from '../utils/ui-constants.js';

/**
 * Design system configuration and metadata
 */
export const DESIGN_SYSTEM_CONFIG = {
  version: '1.0.0',
  buildDate: '2025-08-20',
  
  // Feature flags for migration
  features: {
    factoryThemes: true,        // Theme factory system enabled
    legacyThemes: true,         // Legacy theme constants still available
    themeProvider: true,        // React theme provider enabled
    cssCustomProperties: true   // CSS custom properties support
  },
  
  // Migration status
  migration: {
    phase: 'active',           // active, complete, deprecated
    legacySupport: true,       // Still supporting legacy imports
    breakingChanges: false     // No breaking changes yet
  }
};

/**
 * Design system utilities
 */
export const DesignSystem = {
  // Theme utilities
  themes: {
    factory: () => import('./themes/factory.js'),
    provider: () => import('./themes/provider.js')
  },
  
  // Layout utilities (when available)
  // layout: () => import('../constants/ui/layout.js'),
  
  // Version and config
  getConfig: () => DESIGN_SYSTEM_CONFIG,
  getVersion: () => DESIGN_SYSTEM_CONFIG.version,
  
  // Migration helpers
  checkLegacyUsage: () => {
    console.warn('Consider migrating to the new theme factory system');
    return DESIGN_SYSTEM_CONFIG.migration;
  }
};

export default DesignSystem;