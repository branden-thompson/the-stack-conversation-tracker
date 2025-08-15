// Timeline styling utilities
// Common style patterns extracted from timeline components

import { cn } from '@/lib/utils';

/**
 * Common card styling classes for timeline components
 */
export const timelineCardStyles = {
  // Base card styles
  base: "transition-all duration-300 ease-out cursor-pointer",
  hover: "hover:scale-105 hover:shadow-lg hover:-translate-y-1",
  hoverSubtle: "hover:shadow-md hover:-translate-y-0.5",
  
  // Background styles
  backgrounds: {
    primary: "bg-white dark:bg-gray-800",
    secondary: "bg-gray-50 dark:bg-gray-800",
    accent: "bg-gray-100 dark:bg-gray-800"
  },
  
  // Border styles  
  borders: {
    default: "border border-gray-200 dark:border-gray-700",
    subtle: "border border-gray-300 dark:border-gray-600"
  }
};

/**
 * Animation classes for timeline components
 */
export const timelineAnimations = {
  slideInLeft: "animate-slide-in-left",
  slideInRight: "animate-slide-in-right", 
  fadeIn: "animate-fade-in",
  fadeInScale: "animate-fade-in-scale",
  pulse: "animate-pulse",
  ping: "animate-ping"
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
 * @param {string} status - The status value (active, completed, etc.)
 * @returns {string} CSS classes for status badge
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
 * Hover ring styling for interactive elements
 * @param {string} color - Color name (emerald, blue, etc.)
 * @param {boolean} isActive - Whether the ring should be visible
 * @returns {string} CSS classes for hover ring
 */
export function getHoverRingStyles(color = 'emerald', isActive = false) {
  if (!isActive) return '';
  return `ring-2 ring-opacity-50 ring-${color}-300 dark:ring-${color}-600`;
}

/**
 * Empty state styling utility
 * @param {string} iconSize - Size class for the icon (w-16, w-20, etc.)
 * @returns {Object} Style classes for empty state components
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
 * Grid layout classes for accordion/table views
 */
export const accordionStyles = {
  header: "bg-gray-50 dark:bg-gray-800 rounded-lg p-4 grid grid-cols-5 gap-4 text-sm font-medium text-gray-700 dark:text-gray-300",
  row: "bg-white dark:bg-gray-800 p-4 grid grid-cols-5 gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
  container: "border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
};

/**
 * Button styling for expansion controls
 */
export const expansionButtonStyles = {
  base: "p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
  expandAll: "px-4 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors text-sm",
  collapseAll: "px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
};