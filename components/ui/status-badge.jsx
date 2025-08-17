/**
 * StatusBadge Component
 * 
 * A unified status badge component that handles different types of statuses:
 * - Conversation status (active, paused, stopped, idle)
 * - Coverage status (passing, failing, partial, pending, unknown)
 * - Generic status with custom colors
 */

'use client';

import { cn } from '@/lib/utils';
import { THEME } from '@/lib/utils/ui-constants';
import { CheckCircle2, XCircle, AlertCircle, Clock, Loader2, Play, Pause, Square } from 'lucide-react';

/**
 * Get status configuration based on type and status type
 */
function getStatusConfig(status, type = 'coverage') {
  if (type === 'conversation') {
    const conversationConfigs = {
      active: {
        bg: 'bg-green-100 dark:bg-green-950/30',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-700 dark:text-green-300',
        icon: Play,
        iconColor: 'text-green-600 dark:text-green-400',
        pulse: true
      },
      paused: {
        bg: 'bg-yellow-100 dark:bg-yellow-950/30',
        border: 'border-yellow-200 dark:border-yellow-800',
        text: 'text-yellow-700 dark:text-yellow-300',
        icon: Pause,
        iconColor: 'text-yellow-600 dark:text-yellow-400',
        pulse: false
      },
      stopped: {
        bg: THEME.colors.background.accent,
        border: THEME.colors.border.primary,
        text: THEME.colors.text.muted,
        icon: Square,
        iconColor: THEME.colors.text.light,
        pulse: false
      },
      idle: {
        bg: THEME.colors.background.accent,
        border: THEME.colors.border.primary,
        text: THEME.colors.text.muted,
        icon: null,
        iconColor: THEME.colors.text.light,
        pulse: false
      }
    };
    return conversationConfigs[status] || conversationConfigs.idle;
  }

  // Coverage/test statuses
  const coverageConfigs = {
    passing: {
      bg: 'bg-green-100 dark:bg-green-950/30',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-300',
      icon: CheckCircle2,
      iconColor: 'text-green-600 dark:text-green-400',
      pulse: false
    },
    failing: {
      bg: 'bg-red-100 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-300',
      icon: XCircle,
      iconColor: 'text-red-600 dark:text-red-400',
      pulse: true
    },
    warning: {
      bg: 'bg-yellow-100 dark:bg-yellow-950/30',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-700 dark:text-yellow-300',
      icon: AlertCircle,
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      pulse: false
    },
    pending: {
      bg: 'bg-zinc-100 dark:bg-zinc-800',
      border: 'border-zinc-200 dark:border-zinc-700',
      text: 'text-zinc-600 dark:text-zinc-400',
      icon: Clock,
      iconColor: 'text-zinc-500 dark:text-zinc-400',
      pulse: false
    },
    running: {
      bg: 'bg-blue-100 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      icon: Loader2,
      iconColor: 'text-blue-600 dark:text-blue-400',
      pulse: false,
      animate: 'animate-spin'
    }
  };

  return coverageConfigs[status] || coverageConfigs.pending;
}

export function StatusBadge({
  status = 'pending', // passing, failing, warning, pending, running (coverage) | active, paused, stopped, idle (conversation)
  type = 'coverage', // 'coverage' | 'conversation'
  count = null,
  total = null,
  label = null,
  size = 'md', // xs, s, md, lg
  variant = 'default', // default, pill, card
  animated = true,
  showIcon = true,
  className
}) {
  const config = getStatusConfig(status, type);
  const Icon = config.icon;
  
  const sizeClasses = {
    xs: { 
      badge: 'px-1.5 py-0.5', 
      text: 'text-xs', 
      icon: 'w-2.5 h-2.5',
      gap: 'gap-1'
    },
    s: { 
      badge: 'px-2 py-0.5', 
      text: 'text-xs', 
      icon: 'w-3 h-3',
      gap: 'gap-1'
    },
    md: { 
      badge: 'px-3 py-1.5', 
      text: 'text-sm', 
      icon: 'w-4 h-4',
      gap: 'gap-1.5'
    },
    lg: { 
      badge: 'px-4 py-2', 
      text: 'text-base', 
      icon: 'w-5 h-5',
      gap: 'gap-2'
    }
  };

  const variantClasses = {
    default: 'rounded-md border',
    pill: 'rounded-full border',
    card: 'rounded-lg border shadow-sm'
  };

  const sizes = sizeClasses[size];

  // Determine display text
  const displayText = label || (count !== null && total !== null ? 
    `${count}/${total}` : 
    count !== null ? 
    `${count}` : 
    type === 'conversation' ? 
    status.charAt(0).toUpperCase() + status.slice(1) :
    status.charAt(0).toUpperCase() + status.slice(1)
  );

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
        animated && config.pulse && 'animate-pulse',
        className
      )}
    >
      {showIcon && (
        <Icon className={cn(
          sizes.icon,
          config.iconColor,
          config.animate
        )} />
      )}
      <span className={sizes.text}>
        {displayText}
      </span>
      {count !== null && total !== null && (
        <span className={cn(
          'tabular-nums font-normal opacity-70',
          sizes.text
        )}>
          ({((count / total) * 100).toFixed(0)}%)
        </span>
      )}
    </div>
  );
}

/**
 * Test result specific badge
 */
export function TestStatusBadge({
  passed,
  failed,
  skipped = 0,
  total,
  duration = null,
  size = 'md',
  className
}) {
  const status = failed > 0 ? 'failing' : 'passing';
  const percentage = total > 0 ? (passed / total) * 100 : 0;
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <StatusBadge
        status={status}
        count={passed}
        total={total}
        size={size}
        variant="pill"
      />
      
      {failed > 0 && (
        <StatusBadge
          status="failing"
          count={failed}
          label="failed"
          size={size}
          variant="pill"
        />
      )}
      
      {skipped > 0 && (
        <StatusBadge
          status="warning"
          count={skipped}
          label="skipped"
          size={size}
          variant="pill"
        />
      )}
      
      {duration && (
        <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-2">
          {duration}
        </span>
      )}
    </div>
  );
}

/**
 * Coverage threshold badge
 */
export function CoverageBadge({
  value,
  threshold = { good: 90, warning: 70 },
  label = 'Coverage',
  size = 'md',
  showLabel = false,
  className
}) {
  let status = 'failing';
  if (value >= threshold.good) status = 'passing';
  else if (value >= threshold.warning) status = 'warning';
  
  const displayText = showLabel ? `${label}: ${value.toFixed(1)}%` : `${value.toFixed(1)}%`;
  
  return (
    <StatusBadge
      status={status}
      label={displayText}
      size={size}
      variant="pill"
      className={className}
    />
  );
}

/**
 * Multi-status indicator for grouped items
 */
export function StatusGroup({
  items = [], // [{ label, status, count }]
  size = 's',
  className
}) {
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {items.map((item, index) => (
        <StatusBadge
          key={index}
          status={item.status}
          count={item.count}
          label={item.label}
          size={size}
          showIcon={false}
        />
      ))}
    </div>
  );
}

/**
 * Conversation status badge wrapper
 */
export function ConversationStatusBadge({
  status = 'idle',
  showIcon = true,
  size = 'md',
  variant = 'pill',
  className
}) {
  return (
    <StatusBadge
      status={status}
      type="conversation"
      size={size}
      variant={variant}
      showIcon={showIcon}
      className={className}
    />
  );
}

/**
 * Conversation status indicator with runtime display
 */
export function ConversationStatusIndicator({
  status,
  runtime = null,
  size = 'md',
  className
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <ConversationStatusBadge 
        status={status} 
        size={size}
        showIcon={true} 
      />
      {runtime && (
        <span className={cn(
          'font-mono',
          size === 'xs' ? 'text-xs' : 
          size === 's' ? 'text-xs' :
          size === 'md' ? 'text-sm' : 'text-base',
          THEME.colors.text.secondary
        )}>
          {runtime}
        </span>
      )}
    </div>
  );
}