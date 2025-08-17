/**
 * EventTypeBadge Component
 * 
 * A specialized badge for displaying event types with proper colors and icons
 */

'use client';

import { cn } from '@/lib/utils';
import { EVENT_TYPES, EVENT_LABELS, EVENT_BADGE_CONFIG } from '@/lib/utils/ui-constants';
import { Plus, ArrowRight, Edit, Trash2, RotateCcw } from 'lucide-react';

/**
 * Get icon for event type
 */
function getEventIcon(eventType) {
  const iconMap = {
    [EVENT_TYPES.CARD_CREATED]: Plus,
    [EVENT_TYPES.CARD_MOVED]: ArrowRight,
    [EVENT_TYPES.CARD_UPDATED]: Edit,
    [EVENT_TYPES.CARD_DELETED]: Trash2,
    [EVENT_TYPES.CARD_FLIPPED]: RotateCcw
  };
  
  return iconMap[eventType] || null;
}

export function EventTypeBadge({
  eventType,
  showIcon = true,
  showLabel = true,
  size = 'sm', // xs, sm, md
  variant = 'pill', // pill, default
  className
}) {
  const config = EVENT_BADGE_CONFIG[eventType];
  const Icon = getEventIcon(eventType);
  const label = EVENT_LABELS[eventType] || eventType;
  
  if (!config) {
    // Fallback for unknown event types
    return (
      <span className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
        className
      )}>
        {showLabel ? label : eventType}
      </span>
    );
  }
  
  const sizeClasses = {
    xs: { 
      badge: 'px-1.5 py-0.5', 
      text: 'text-xs', 
      icon: 'w-2.5 h-2.5',
      gap: 'gap-1'
    },
    sm: { 
      badge: 'px-2 py-0.5', 
      text: 'text-xs', 
      icon: 'w-3 h-3',
      gap: 'gap-1'
    },
    md: { 
      badge: 'px-3 py-1', 
      text: 'text-sm', 
      icon: 'w-3.5 h-3.5',
      gap: 'gap-1.5'
    }
  };

  const variantClasses = {
    default: 'rounded-md border',
    pill: 'rounded-full border'
  };

  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        'inline-flex items-center font-medium transition-all duration-200',
        sizes.badge,
        sizes.gap,
        config.bg,
        config.text,
        variantClasses[variant],
        config.border,
        className
      )}
    >
      {showIcon && Icon && (
        <Icon className={cn(
          sizes.icon,
          config.icon
        )} />
      )}
      {showLabel && (
        <span className={sizes.text}>
          {label}
        </span>
      )}
    </div>
  );
}

/**
 * Event type indicator for use in lists and tables
 */
export function EventTypeIndicator({
  eventType,
  compact = false,
  className
}) {
  return (
    <EventTypeBadge
      eventType={eventType}
      showIcon={!compact}
      showLabel={!compact}
      size={compact ? 'xs' : 'sm'}
      variant="pill"
      className={className}
    />
  );
}