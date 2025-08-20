// Timeline styling utilities
// Common style patterns extracted from timeline components

import { cn } from '@/lib/utils';
import { APP_THEME } from '@/lib/utils/ui-constants';

/**
 * Theme-aware styling functions for timeline components
 * These functions accept a theme object and return appropriate classes
 */

/**
 * Get theme-aware card styles for timeline components
 */
export function getTimelineCardStyles(theme = APP_THEME) {
  return {
    // Base card styles
    base: "transition-all duration-300 ease-out cursor-pointer transform-gpu",
    hover: "hover:scale-105 hover:shadow-lg hover:-translate-y-1",
    hoverSubtle: "hover:shadow-md hover:-translate-y-0.5",
    hoverEnhanced: "hover:scale-[1.02] hover:shadow-2xl hover:-translate-y-2 hover:rotate-1",
    
    // Background styles with theme awareness
    backgrounds: {
      primary: theme.colors.background.secondary,
      secondary: theme.colors.background.card,
      accent: theme.colors.background.tertiary,
      gradient: theme.colors.background.secondary // Simplified for theme compatibility
    },
    
    // Border styles with theme awareness
    borders: {
      default: `border ${theme.colors.border.primary}`,
      subtle: `border ${theme.colors.border.secondary}`,
      glow: `border ${theme.colors.border.primary} hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-emerald-200/50 dark:hover:shadow-emerald-800/50`
    },
    
    // Interactive states
    interactive: {
      idle: "opacity-100 scale-100",
      hover: "opacity-100 scale-105 shadow-lg",
      active: "opacity-95 scale-95",
      focus: "ring-2 ring-emerald-400 ring-offset-2"
    }
  };
}

// Legacy export for backward compatibility
export const timelineCardStyles = getTimelineCardStyles();

/**
 * Enhanced animation classes for timeline components
 */
export const timelineAnimations = {
  slideInLeft: "animate-slide-in-left",
  slideInRight: "animate-slide-in-right", 
  fadeIn: "animate-fade-in",
  fadeInScale: "animate-fade-in-scale",
  pulse: "animate-pulse",
  ping: "animate-ping",
  bounce: "animate-bounce",
  bounceSubtle: "animate-bounce-subtle",
  
  // Entrance animations
  slideUp: "animate-[slideUp_0.5s_ease-out]",
  slideDown: "animate-[slideDown_0.5s_ease-out]",
  scaleIn: "animate-[scaleIn_0.3s_ease-out]",
  
  // Attention animations
  wiggle: "animate-[wiggle_0.5s_ease-in-out]",
  shake: "animate-[shake_0.5s_ease-in-out]",
  heartbeat: "animate-[heartbeat_1s_ease-in-out_infinite]"
};

/**
 * Get theme-aware text colors for timeline components
 */
export function getTimelineTextColors(theme = APP_THEME) {
  return {
    primary: theme.colors.text.primary,
    secondary: theme.colors.text.secondary, 
    muted: theme.colors.text.muted,
    subtle: theme.colors.text.tertiary,
    accent: theme.colors.text.light
  };
}

// Legacy export for backward compatibility
export const timelineTextColors = getTimelineTextColors();

/**
 * Theme-aware status badge styling utility
 */
export function getStatusBadgeStyles(status, theme = APP_THEME) {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
  
  const statusStyles = {
    active: `${theme.colors.status.success.bg} ${theme.colors.status.success.text}`,
    completed: `${theme.colors.status.info.bg} ${theme.colors.status.info.text}`, 
    paused: `${theme.colors.status.warning.bg} ${theme.colors.status.warning.text}`,
    failed: `${theme.colors.status.error.bg} ${theme.colors.status.error.text}`,
    default: `${theme.colors.background.tertiary} ${theme.colors.text.secondary}`
  };
  
  return cn(baseClasses, statusStyles[status] || statusStyles.default);
}

/**
 * Enhanced hover ring styling for interactive elements
 */
export function getHoverRingStyles(color = 'emerald', isActive = false, intensity = 'normal') {
  if (!isActive) return '';
  
  const intensityStyles = {
    subtle: `ring-1 ring-opacity-30 ring-${color}-200 dark:ring-${color}-700`,
    normal: `ring-2 ring-opacity-50 ring-${color}-300 dark:ring-${color}-600`,
    strong: `ring-4 ring-opacity-70 ring-${color}-400 dark:ring-${color}-500 shadow-lg shadow-${color}-200/50 dark:shadow-${color}-800/50`
  };
  
  return intensityStyles[intensity] || intensityStyles.normal;
}

/**
 * Get theme-aware empty state styles
 */
export function getEmptyStateStyles(iconSize = 'w-20', theme = APP_THEME) {
  return {
    container: "flex items-center justify-center h-full",
    content: `text-center ${theme.colors.text.muted} animate-fade-in`,
    iconWrapper: "relative mb-6",
    icon: `${iconSize} ${iconSize.replace('w-', 'h-')} mx-auto opacity-30`,
    iconWithPulse: `${iconSize} ${iconSize.replace('w-', 'h-')} mx-auto opacity-30 animate-pulse`,
    iconRing: `absolute inset-0 ${iconSize} ${iconSize.replace('w-', 'h-')} mx-auto border-2 ${theme.colors.border.secondary} rounded-full animate-ping opacity-20`,
    title: `text-xl font-semibold mb-3 ${theme.colors.text.secondary}`,
    subtitle: `${theme.colors.text.muted} mb-2`, 
    description: `text-sm ${theme.colors.text.light}`
  };
}

/**
 * Get theme-aware accordion/table layout styles
 */
export function getAccordionStyles(theme = APP_THEME) {
  return {
    header: `${theme.colors.background.tertiary} rounded-lg p-4 grid grid-cols-5 gap-4 text-sm font-semibold ${theme.colors.text.secondary} ${theme.shadows.sm} border ${theme.colors.border.primary}`,
    row: `${theme.colors.background.secondary} p-4 grid grid-cols-5 gap-4 cursor-pointer ${theme.colors.background.hover} ${theme.transitions.all} hover:shadow-md hover:scale-[1.01] active:scale-[0.99]`,
    container: `border ${theme.colors.border.primary} rounded-lg overflow-hidden ${theme.shadows.sm} hover:shadow-lg transition-shadow duration-300`
  };
}

// Legacy export for backward compatibility  
export const accordionStyles = getAccordionStyles();

/**
 * Get theme-aware expansion button styles
 */
export function getExpansionButtonStyles(theme = APP_THEME) {
  return {
    base: `p-1 rounded-md ${theme.colors.background.hover} ${theme.transitions.all} hover:scale-105 active:scale-95`,
    expandAll: `px-4 py-2 ${theme.colors.status.info.bg} ${theme.colors.status.info.text} rounded-lg ${theme.colors.background.hoverStrong} ${theme.transitions.all} text-sm font-medium ${theme.shadows.sm} hover:shadow-md hover:scale-105 active:scale-95`,
    collapseAll: `px-4 py-2 ${theme.colors.background.tertiary} ${theme.colors.text.secondary} rounded-lg ${theme.colors.background.hoverStrong} ${theme.transitions.all} text-sm font-medium ${theme.shadows.sm} hover:shadow-md hover:scale-105 active:scale-95`
  };
}

// Legacy export for backward compatibility
export const expansionButtonStyles = getExpansionButtonStyles();

/**
 * Micro-interaction utilities for enhanced card animations
 */
export const microInteractions = {
  bounce: "hover:animate-bounce",
  tiltLeft: "hover:-rotate-1 transition-transform duration-300",
  tiltRight: "hover:rotate-1 transition-transform duration-300",
  breathe: "animate-pulse hover:animate-none",
  shimmer: "relative overflow-hidden",
  magnetic: "transition-all duration-300 hover:scale-105 hover:shadow-lg hover:-translate-y-1 active:scale-95 active:translate-y-0"
};

/**
 * Staggered animation delays for list items
 */
export function getStaggeredDelay(index, delay = 100) {
  return {
    animationDelay: `${index * delay}ms`
  };
}

/**
 * Card depth layers for z-index management
 */
export const cardDepth = {
  base: "z-10",
  hover: "z-20",
  active: "z-30",
  modal: "z-40",
  tooltip: "z-50"
};