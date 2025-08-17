/**
 * EmptyState Component
 * 
 * A reusable component for displaying empty states with consistent styling
 * and optional action buttons
 */

'use client';

import { cn } from '@/lib/utils';
import { THEME } from '@/lib/utils/ui-constants';
import { Button } from '@/components/ui/button';

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  size = 'md', // sm, md, lg
  className
}) {
  const sizeClasses = {
    sm: {
      container: 'p-4',
      title: 'text-sm font-medium',
      description: 'text-xs',
      icon: 'w-8 h-8 mb-2',
      gap: 'space-y-1'
    },
    md: {
      container: 'p-6',
      title: 'text-base font-semibold',
      description: 'text-sm',
      icon: 'w-12 h-12 mb-3',
      gap: 'space-y-2'
    },
    lg: {
      container: 'p-8',
      title: 'text-lg font-bold',
      description: 'text-base',
      icon: 'w-16 h-16 mb-4',
      gap: 'space-y-3'
    }
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn(
      'text-center flex flex-col items-center justify-center',
      sizes.container,
      sizes.gap,
      className
    )}>
      {Icon && (
        <Icon className={cn(
          sizes.icon,
          THEME.colors.text.light
        )} />
      )}
      
      {title && (
        <h3 className={cn(
          sizes.title,
          THEME.colors.text.secondary
        )}>
          {title}
        </h3>
      )}
      
      {description && (
        <p className={cn(
          sizes.description,
          THEME.colors.text.muted
        )}>
          {description}
        </p>
      )}
      
      {action && (
        <div className="mt-4">
          {typeof action === 'string' ? (
            <p className={cn(
              'text-sm',
              THEME.colors.text.tertiary
            )}>
              {action}
            </p>
          ) : (
            action
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Common empty state variants for specific use cases
 */

export function NoDataEmptyState({
  title = "No data available",
  description = "There's nothing to show here yet.",
  size = 'md',
  className
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      size={size}
      className={className}
    />
  );
}

export function SelectionEmptyState({
  title = "Make a selection",
  description = "Choose an item from the list to view details.",
  size = 'md',
  className
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      size={size}
      className={className}
    />
  );
}

export function LoadingEmptyState({
  title = "Loading...",
  description = "Please wait while we fetch your data.",
  size = 'md',
  className
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      size={size}
      className={className}
    />
  );
}