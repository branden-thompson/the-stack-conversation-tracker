/**
 * CoverageBar Component
 * 
 * A reusable inline bar visualization for coverage metrics
 * with gradient colors and smooth animations
 */

'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';

/**
 * Get color classes based on coverage percentage
 * Note: Uses hardcoded hex colors for vibrant bar visualization.
 * Status colors from theme are too muted for effective data visualization.
 */
function getCoverageColor(percentage, dynamicTheme) {
  if (percentage >= 90) return {
    bg: "#10b981",  // green-500 - vibrant success green
    gradient: "#10b981",
    text: dynamicTheme.colors.status.success.text  // Keep text theme-aware
  };
  if (percentage >= 70) return {
    bg: "#f59e0b",  // amber-500 - vibrant warning amber
    gradient: "#f59e0b", 
    text: dynamicTheme.colors.status.warning.text  // Keep text theme-aware
  };
  return {
    bg: "#ef4444",  // red-500 - vibrant error red
    gradient: "#ef4444",
    text: dynamicTheme.colors.status.error.text  // Keep text theme-aware
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
  const dynamicTheme = useDynamicAppTheme();
  // Calculate percentage if not provided
  const coveragePercent = useMemo(() => {
    if (percentage !== null) return percentage;
    return total > 0 ? (covered / total) * 100 : 0;
  }, [covered, total, percentage]);

  const colors = getCoverageColor(coveragePercent, dynamicTheme);

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
          `relative w-full ${dynamicTheme.colors.background.tertiary} rounded-full overflow-hidden`,
          heightClasses[height]
        )}>
          {/* Coverage Fill */}
          <div
            className={cn(
              'absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out',
              animated && 'animate-in slide-in-from-left'
            )}
            style={{ 
              width: `${coveragePercent}%`,
              backgroundColor: colors.bg  // Use hex color directly in style
            }}
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
        <div className={`text-xs ${dynamicTheme.colors.text.tertiary} tabular-nums min-w-[4rem] text-right`}>
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
  const dynamicTheme = useDynamicAppTheme();
  const colors = getCoverageColor(percentage, dynamicTheme);
  
  return (
    <div 
      className={cn(`relative ${dynamicTheme.colors.background.tertiary} rounded-full overflow-hidden`, className)}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <div
        className="absolute top-0 left-0 h-full rounded-full transition-all duration-300"
        style={{ 
          width: `${percentage}%`,
          backgroundColor: colors.bg  // Use hex color directly in style
        }}
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
  const dynamicTheme = useDynamicAppTheme();
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
              <span className={`text-xs ${dynamicTheme.colors.text.tertiary}`}>
                {metric.label}
              </span>
              <span className={cn('text-xs font-medium', getCoverageColor(metric.value, dynamicTheme).text)}>
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