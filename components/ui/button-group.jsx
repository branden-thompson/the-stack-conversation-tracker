/**
 * ButtonGroup Component
 * 
 * Groups related buttons with consistent spacing and visual hierarchy
 */

'use client';

import { cn } from '@/lib/utils';
import { THEME } from '@/lib/utils/ui-constants';
import { Button } from '@/components/ui/button';

export function ButtonGroup({
  children,
  orientation = 'horizontal', // 'horizontal' | 'vertical'
  spacing = 'md', // 'sm' | 'md' | 'lg'
  variant = 'default', // 'default' | 'card' | 'toolbar'
  className
}) {
  const spacingClasses = {
    horizontal: {
      sm: 'gap-1',
      md: 'gap-2',
      lg: 'gap-3'
    },
    vertical: {
      sm: 'gap-1',
      md: 'gap-2', 
      lg: 'gap-3'
    }
  };

  const variantClasses = {
    default: '',
    card: cn(
      'p-3 rounded-lg border',
      THEME.colors.background.secondary,
      THEME.colors.border.primary
    ),
    toolbar: cn(
      'px-3 py-2 rounded-md',
      THEME.colors.background.tertiary,
      THEME.colors.border.primary,
      'border'
    )
  };

  const orientationClasses = {
    horizontal: 'flex flex-row flex-wrap items-center',
    vertical: 'flex flex-col items-stretch'
  };

  return (
    <div
      className={cn(
        orientationClasses[orientation],
        spacingClasses[orientation][spacing],
        variantClasses[variant],
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Conversation action buttons group
 */
export function ConversationActions({ 
  conversation, 
  onStart, 
  onPause, 
  onStop, 
  onDelete,
  compact = false,
  className 
}) {
  const isActive = conversation.status === 'active';
  
  return (
    <ButtonGroup 
      spacing={compact ? 'sm' : 'md'}
      className={className}
    >
      <Button
        size={compact ? 'sm' : 'default'}
        variant={isActive ? 'default' : 'outline'}
        onClick={(e) => {
          e.stopPropagation();
          onStart?.(conversation);
        }}
      >
        Start
      </Button>
      <Button
        size={compact ? 'sm' : 'default'}
        variant="outline"
        onClick={(e) => {
          e.stopPropagation();
          onPause?.(conversation);
        }}
      >
        Pause
      </Button>
      <Button
        size={compact ? 'sm' : 'default'}
        variant="outline"
        onClick={(e) => {
          e.stopPropagation();
          onStop?.(conversation);
        }}
      >
        Stop
      </Button>
      <Button
        size={compact ? 'sm' : 'default'}
        variant="destructive"
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.(conversation);
        }}
      >
        Delete
      </Button>
    </ButtonGroup>
  );
}

/**
 * Event action buttons group
 */
export function EventActions({
  eventTypes,
  onEmitEvent,
  compact = false,
  className
}) {
  return (
    <ButtonGroup 
      spacing={compact ? 'sm' : 'md'}
      variant="toolbar"
      className={className}
    >
      {eventTypes.map((eventType) => (
        <Button
          key={eventType.type}
          size={compact ? 'sm' : 'default'}
          variant="outline"
          onClick={() => onEmitEvent?.(eventType.type, eventType.payload)}
        >
          {eventType.label}
        </Button>
      ))}
    </ButtonGroup>
  );
}