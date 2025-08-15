// Timeline styling utilities
// Common style patterns extracted from timeline components

import { cn } from '@/lib/utils';

/**
 * Common card styling classes for timeline components
 */
export const timelineCardStyles = {
  // Base card styles
  base: "transition-all duration-300 ease-out cursor-pointer transform-gpu",
  hover: "hover:scale-105 hover:shadow-lg hover:-translate-y-1",
  hoverSubtle: "hover:shadow-md hover:-translate-y-0.5",
  hoverEnhanced: "hover:scale-[1.02] hover:shadow-2xl hover:-translate-y-2 hover:rotate-1",
  
  // Background styles with enhanced gradients
  backgrounds: {
    primary: "bg-white dark:bg-gray-800",
    secondary: "bg-gray-50 dark:bg-gray-800",
    accent: "bg-gray-100 dark:bg-gray-800",
    gradient: "bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-700 dark:to-gray-800"
  },
  
  // Border styles with glow effects
  borders: {
    default: "border border-gray-200 dark:border-gray-700",
    subtle: "border border-gray-300 dark:border-gray-600",
    glow: "border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:shadow-emerald-200/50 dark:hover:shadow-emerald-800/50"
  },
  
  // Interactive states
  interactive: {
    idle: "opacity-100 scale-100",
    hover: "opacity-100 scale-105 shadow-lg",
    active: "opacity-95 scale-95",
    focus: "ring-2 ring-emerald-400 ring-offset-2"
  }
};

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
 * Text color utilities for timeline components
 */
export const timelineTextColors = {
  primary: "text-gray-900 dark:text-gray-100",
  secondary: "text-gray-700 dark:text-gray-300", 
  muted: "text-gray-600 dark:text-gray-400",
  subtle: "text-gray-500 dark:text-gray-400",
  accent: "text-gray-400 dark:text-gray-500"
};

/**
 * Status badge styling utility
 */
export function getStatusBadgeStyles(status) {
  const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
  
  const statusStyles = {
    active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
    completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300", 
    paused: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
    failed: "bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300",
    default: "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300"
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
 * Empty state styling utility
 */
export function getEmptyStateStyles(iconSize = 'w-20') {
  return {
    container: "flex items-center justify-center h-full",
    content: "text-center text-gray-500 dark:text-gray-400 animate-fade-in",
    iconWrapper: "relative mb-6",
    icon: `${iconSize} ${iconSize.replace('w-', 'h-')} mx-auto opacity-30`,
    iconWithPulse: `${iconSize} ${iconSize.replace('w-', 'h-')} mx-auto opacity-30 animate-pulse`,
    iconRing: `absolute inset-0 ${iconSize} ${iconSize.replace('w-', 'h-')} mx-auto border-2 border-gray-300 dark:border-gray-600 rounded-full animate-ping opacity-20`,
    title: "text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300",
    subtitle: "text-gray-500 dark:text-gray-400 mb-2", 
    description: "text-sm text-gray-400 dark:text-gray-500"
  };
}

/**
 * Enhanced grid layout classes for accordion/table views
 */
export const accordionStyles = {
  header: "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 grid grid-cols-5 gap-4 text-sm font-semibold text-gray-700 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-600",
  row: "bg-white dark:bg-gray-800 p-4 grid grid-cols-5 gap-4 cursor-pointer hover:bg-gradient-to-r hover:from-gray-50 hover:to-white dark:hover:from-gray-700 dark:hover:to-gray-800 transition-all duration-200 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]",
  container: "border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
};

/**
 * Enhanced button styling for expansion controls
 */
export const expansionButtonStyles = {
  base: "p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200 hover:scale-105 active:scale-95",
  expandAll: "px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-700 dark:text-blue-300 rounded-lg hover:from-blue-200 hover:to-blue-100 dark:hover:from-blue-800/30 dark:hover:to-blue-900/30 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md hover:scale-105 active:scale-95",
  collapseAll: "px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:from-gray-200 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
};

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