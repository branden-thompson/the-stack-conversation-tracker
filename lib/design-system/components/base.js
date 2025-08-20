/**
 * Base Design System Components
 * 
 * Foundational components that integrate themes, layouts, and factories.
 * Provides consistent building blocks for the entire application.
 * 
 * Part of: Mini-Project 3 - Design System Integration
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useThemeClasses } from '../themes/provider.js';
import { LayoutUtils, COMPONENT_LAYOUTS } from '../../constants/ui/layout.js';

/**
 * Base Card Component
 * Integrates theme system with layout utilities
 */
export function BaseCard({ 
  variant = 'base',
  theme = 'secondary',
  padding = true,
  shadow = true,
  border = true,
  className = '',
  children,
  ...props 
}) {
  const getCardClasses = useThemeClasses('card');
  
  const cardClasses = cn(
    // Base layout from component layouts
    COMPONENT_LAYOUTS.card[variant] || COMPONENT_LAYOUTS.card.base,
    // Theme-aware classes
    getCardClasses(),
    // Conditional styling
    !padding && 'p-0',
    !shadow && 'shadow-none',
    !border && 'border-0',
    // Custom classes
    className
  );

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
}

/**
 * Base Container Component
 * Provides responsive container layouts
 */
export function BaseContainer({ 
  type = 'page',
  responsive = true,
  className = '',
  children,
  ...props 
}) {
  const containerClasses = cn(
    LayoutUtils.getContainer(type, responsive),
    className
  );

  return (
    <div className={containerClasses} {...props}>
      {children}
    </div>
  );
}

/**
 * Base Grid Component
 * Provides responsive grid layouts
 */
export function BaseGrid({ 
  columns = 3,
  gap = 'md',
  responsive = true,
  className = '',
  children,
  ...props 
}) {
  const gridColumns = responsive && typeof columns === 'number' && columns > 1
    ? `1-${columns}` // Use responsive pattern
    : columns;
    
  const gridClasses = cn(
    LayoutUtils.getGrid(gridColumns, gap),
    className
  );

  return (
    <div className={gridClasses} {...props}>
      {children}
    </div>
  );
}

/**
 * Base Flex Component
 * Provides flexible layouts
 */
export function BaseFlex({ 
  direction = 'row',
  justify = 'start',
  align = 'center',
  gap = 'md',
  wrap = false,
  className = '',
  children,
  ...props 
}) {
  const flexClasses = cn(
    LayoutUtils.getFlex(direction, justify, align, gap),
    wrap && 'flex-wrap',
    className
  );

  return (
    <div className={flexClasses} {...props}>
      {children}
    </div>
  );
}

/**
 * Base Button Component
 * Theme-aware button with consistent styling
 */
export function BaseButton({ 
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  children,
  ...props 
}) {
  const getButtonClasses = useThemeClasses('button', variant);
  
  const buttonClasses = cn(
    // Base button layout
    COMPONENT_LAYOUTS.button.base,
    COMPONENT_LAYOUTS.button[size],
    // Theme-aware classes
    getButtonClasses(),
    // State classes
    disabled && 'opacity-50 cursor-not-allowed',
    loading && 'opacity-70 cursor-wait',
    // Custom classes
    className
  );

  return (
    <button 
      className={buttonClasses} 
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          {children}
        </span>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * Base Text Component
 * Theme-aware typography with consistent styling
 */
export function BaseText({ 
  variant = 'primary',
  size = 'base',
  weight = 'normal',
  family = 'sans',
  className = '',
  children,
  as: Component = 'span',
  ...props 
}) {
  const getTextClasses = useThemeClasses('text', variant);
  
  const textClasses = cn(
    // Typography utilities from layout constants
    `text-${size}`,
    `font-${weight}`,
    `font-${family}`,
    // Theme-aware text colors
    getTextClasses(),
    // Custom classes
    className
  );

  return (
    <Component className={textClasses} {...props}>
      {children}
    </Component>
  );
}

/**
 * Base Section Component
 * Provides consistent section layouts
 */
export function BaseSection({ 
  padding = true,
  spacing = 'normal',
  background = false,
  className = '',
  children,
  ...props 
}) {
  const getSectionClasses = useThemeClasses('section');
  
  const spacingMap = {
    tight: 'py-4 sm:py-6',
    normal: 'py-8 sm:py-12 lg:py-16',
    loose: 'py-12 sm:py-16 lg:py-20',
  };
  
  const sectionClasses = cn(
    // Conditional padding
    padding && (spacingMap[spacing] || spacingMap.normal),
    // Theme-aware background
    background && getSectionClasses(),
    // Custom classes
    className
  );

  return (
    <section className={sectionClasses} {...props}>
      {children}
    </section>
  );
}

/**
 * Loading Spinner Component
 * Consistent loading indicator
 */
export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };
  
  return (
    <div 
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeMap[size],
        className
      )}
      aria-label="Loading..."
    />
  );
}

/**
 * Status Badge Component
 * Theme-aware status indicators
 */
export function StatusBadge({ 
  status = 'info',
  size = 'md',
  className = '',
  children,
  ...props 
}) {
  const statusClasses = {
    success: 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    warning: 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    error: 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    info: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  };
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };
  
  const badgeClasses = cn(
    'inline-flex items-center rounded-full border font-medium',
    statusClasses[status],
    sizeClasses[size],
    className
  );

  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
}

/**
 * Export all base components
 */
export default {
  BaseCard,
  BaseContainer,
  BaseGrid,
  BaseFlex,
  BaseButton,
  BaseText,
  BaseSection,
  LoadingSpinner,
  StatusBadge,
};