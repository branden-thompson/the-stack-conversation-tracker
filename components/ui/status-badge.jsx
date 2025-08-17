/**
 * StatusBadge Component
 * 
 * A reusable badge component for displaying status with counts
 * and animated indicators
 */

'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';

/**
 * Get status configuration based on type
 */
function getStatusConfig(status) {
  const configs = {
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

  return configs[status] || configs.pending;
}

export function StatusBadge({
  status = 'pending', // passing, failing, warning, pending, running
  count = null,
  total = null,
  label = null,
  size = 'md', // s, md, lg
  variant = 'default', // default, pill, card
  animated = true,
  showIcon = true,
  className
}) {
  const config = getStatusConfig(status);
  const Icon = config.icon;
  
  const sizeClasses = {
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