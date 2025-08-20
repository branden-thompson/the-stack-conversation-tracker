/**
 * Design System Entry Point
 * 
 * Centralized exports for the unified design system.
 * Provides themes, utilities, constants, and integrated components for consistent UI.
 * 
 * @version 2.0.0
 * @date 2025-08-20
 */

// Theme system
export * from './themes/factory.js';
export * from './themes/provider.js';

// Base components
export * from './components/base.js';

// Integrated factories (combines Mini-Project 2 with design system)
export * from './factories/integrated-factory.js';

// Constants integration
export * from '../constants/ui/layout.js';
export * from '../constants/ui/index.js';

// Legacy compatibility - these will be phased out
export { THEME, APP_THEME } from '../utils/ui-constants.js';

/**
 * Design system configuration and metadata
 */
export const DESIGN_SYSTEM_CONFIG = {
  version: '2.0.0',
  buildDate: '2025-08-20',
  
  // Feature flags for migration
  features: {
    factoryThemes: true,        // Theme factory system enabled
    legacyThemes: true,         // Legacy theme constants still available
    themeProvider: true,        // React theme provider enabled
    cssCustomProperties: true,  // CSS custom properties support
    baseComponents: true,       // Base design system components available
    integratedFactories: true,  // Mini-Project 2 factories integrated
    layoutConstants: true,      // Layout and spacing constants available
    responsiveUtilities: true,  // Responsive layout utilities available
  },
  
  // Integration status with Mini-Project 2
  integration: {
    themeFactory: true,         // Theme styling factory integrated
    timelineFactory: true,      // Timeline card factory integrated
    queryFactory: true,         // Query hook factory integrated
    apiFactory: true,           // API route factory available (not directly integrated)
    layoutSystem: true,         // Layout constants and utilities integrated
  },
  
  // Migration status
  migration: {
    phase: 'enhanced',         // enhanced with Mini-Project 2 integration
    legacySupport: true,       // Still supporting legacy imports
    breakingChanges: false,    // No breaking changes yet
    newCapabilities: [
      'Integrated factory system',
      'Enhanced component creation',
      'Theme-aware factories',
      'Layout utility integration',
      'Responsive design patterns'
    ]
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