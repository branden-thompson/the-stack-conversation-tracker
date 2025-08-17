/**
 * CoverageBar Component
 * 
 * A reusable inline bar visualization for coverage metrics
 * with gradient colors and smooth animations
 */

'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

/**
 * Get color classes based on coverage percentage
 */
function getCoverageColor(percentage) {
  if (percentage >= 90) return {
    bg: 'bg-green-500 dark:bg-green-400',
    gradient: 'from-green-400 to-green-600 dark:from-green-300 dark:to-green-500',
    text: 'text-green-700 dark:text-green-300'
  };
  if (percentage >= 70) return {
    bg: 'bg-yellow-500 dark:bg-yellow-400',
    gradient: 'from-yellow-400 to-yellow-600 dark:from-yellow-300 dark:to-yellow-500',
    text: 'text-yellow-700 dark:text-yellow-300'
  };
  return {
    bg: 'bg-red-500 dark:bg-red-400',
    gradient: 'from-red-400 to-red-600 dark:from-red-300 dark:to-red-500',
    text: 'text-red-700 dark:text-red-300'
  };
}

export function CoverageBar({
  covered = 0,
  total = 100,
  percentage = null,
  height = 'sm', // sm, md, lg
  showPercentage = true,
  showValues = false,
  gradient = true,
  animated = true,
  className
}) {
  // Calculate percentage if not provided
  const coveragePercent = useMemo(() => {
    if (percentage !== null) return percentage;
    return total > 0 ? (covered / total) * 100 : 0;
  }, [covered, total, percentage]);

  const colors = getCoverageColor(coveragePercent);

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5'
  };

  return (
    <div className={cn('flex items-center gap-2 w-full', className)}>
      {/* Bar Container */}
      <div className="flex-1 min-w-0">
        <div className={cn(
          'relative w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden',
          heightClasses[height]
        )}>
          {/* Coverage Fill */}
          <div
            className={cn(
              'absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out',
              gradient ? `bg-gradient-to-r ${colors.gradient}` : colors.bg,
              animated && 'animate-in slide-in-from-left'
            )}
            style={{ width: `${coveragePercent}%` }}
          >
            {/* Shimmer effect for high coverage */}
            {coveragePercent >= 90 && animated && (
              <div className="absolute inset-0 opacity-30">
                <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Percentage Label */}
      {showPercentage && (
        <div className={cn(
          'text-xs font-medium tabular-nums min-w-[3rem] text-right',
          colors.text
        )}>
          {coveragePercent.toFixed(1)}%
        </div>
      )}

      {/* Values Label */}
      {showValues && (
        <div className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums min-w-[4rem] text-right">
          {covered}/{total}
        </div>
      )}
    </div>
  );
}

/**
 * Mini variant for inline table usage
 */
export function CoverageBarMini({ percentage, width = 60, height = 4, className }) {
  const colors = getCoverageColor(percentage);
  
  return (
    <div 
      className={cn('relative bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden', className)}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <div
        className={cn(
          'absolute top-0 left-0 h-full rounded-full transition-all duration-300',
          `bg-gradient-to-r ${colors.gradient}`
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

/**
 * Stacked variant showing multiple metrics
 */
export function CoverageBarStack({ 
  statements, 
  branches, 
  functions, 
  lines,
  showLabels = true,
  className 
}) {
  const metrics = [
    { label: 'Statements', value: statements },
    { label: 'Branches', value: branches },
    { label: 'Functions', value: functions },
    { label: 'Lines', value: lines }
  ];

  return (
    <div className={cn('space-y-2', className)}>
      {metrics.map((metric) => (
        <div key={metric.label} className="space-y-1">
          {showLabels && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-600 dark:text-zinc-400">
                {metric.label}
              </span>
              <span className={cn('text-xs font-medium', getCoverageColor(metric.value).text)}>
                {metric.value.toFixed(1)}%
              </span>
            </div>
          )}
          <CoverageBar
            percentage={metric.value}
            height="sm"
            showPercentage={false}
            animated={false}
          />
        </div>
      ))}
    </div>
  );
}