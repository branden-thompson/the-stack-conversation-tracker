/**
 * MetricCard Component
 * 
 * A reusable card for displaying metrics with trends, sparklines,
 * and actionable insights
 */

'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CoverageBar } from './coverage-bar';
import { useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';

/**
 * Get status color based on metric value and thresholds using dynamic theme
 */
function getStatusColor(value, thresholds = { good: 90, warning: 70 }, dynamicTheme) {
  if (value >= thresholds.good) return {
    bg: dynamicTheme.colors.status.success.bg,
    border: dynamicTheme.colors.status.success.border,
    text: dynamicTheme.colors.status.success.text,
    icon: dynamicTheme.colors.status.success.icon
  };
  if (value >= thresholds.warning) return {
    bg: dynamicTheme.colors.status.warning.bg,
    border: dynamicTheme.colors.status.warning.border,
    text: dynamicTheme.colors.status.warning.text,
    icon: dynamicTheme.colors.status.warning.icon
  };
  return {
    bg: dynamicTheme.colors.status.error.bg,
    border: dynamicTheme.colors.status.error.border,
    text: dynamicTheme.colors.status.error.text,
    icon: dynamicTheme.colors.status.error.icon
  };
}

/**
 * Mini sparkline visualization
 * Note: Uses hardcoded hex colors because SVG elements require actual color values,
 * not CSS class names. CSS classes don't work with stroke attribute in SVG polylines.
 */
function Sparkline({ data = [], width = 60, height = 20, className, dynamicTheme }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const isImproving = data[data.length - 1] > data[0];
  
  // Hardcoded hex colors for SVG compatibility - CSS classes don't work with SVG stroke
  const improvingColor = "#10b981"; // green-500 - success color
  const decliningColor = "#ef4444"; // red-500 - error color

  return (
    <svg 
      width={width} 
      height={height} 
      className={cn('inline-block', className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      <polyline
        points={points}
        fill="none"
        stroke={isImproving ? improvingColor : decliningColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MetricCard({
  label,
  value,
  previousValue = null,
  trend = null, // number or 'up' | 'down' | 'stable'
  sparkline = [],
  threshold = { good: 90, warning: 70 },
  unit = '%',
  description = null,
  actionable = null, // { text: string, onClick: () => void }
  size = 'md', // sm, md, lg
  className
}) {
  const dynamicTheme = useDynamicAppTheme();
  // Calculate trend if not provided
  const calculatedTrend = useMemo(() => {
    if (trend !== null) return trend;
    if (previousValue === null) return null;
    const diff = value - previousValue;
    if (Math.abs(diff) < 0.1) return 'stable';
    return diff > 0 ? 'up' : 'down';
  }, [trend, value, previousValue]);

  const trendValue = useMemo(() => {
    if (typeof trend === 'number') return trend;
    if (previousValue !== null) return value - previousValue;
    return null;
  }, [trend, value, previousValue]);

  const colors = getStatusColor(value, threshold, dynamicTheme);
  
  const sizeClasses = {
    sm: { card: 'p-3', title: 'text-xs', value: 'text-lg', trend: 'text-xs' },
    md: { card: 'p-4', title: 'text-sm', value: 'text-2xl', trend: 'text-sm' },
    lg: { card: 'p-5', title: 'text-base', value: 'text-3xl', trend: 'text-base' }
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn(
      'rounded-lg border transition-all duration-200',
      colors.bg,
      colors.border,
      'hover:shadow-md dark:hover:shadow-zinc-800/50',
      sizes.card,
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className={cn('font-medium text-zinc-600 dark:text-zinc-400', sizes.title)}>
            {label}
          </div>
          {description && (
            <div className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5">
              {description}
            </div>
          )}
        </div>
        {sparkline.length > 0 && (
          <Sparkline data={sparkline} className="ml-2" dynamicTheme={dynamicTheme} />
        )}
      </div>

      {/* Value and Trend */}
      <div className="flex items-end justify-between mb-3">
        <div className={cn('font-bold tabular-nums', sizes.value, colors.text)}>
          {value.toFixed(1)}{unit}
        </div>
        
        {calculatedTrend && (
          <div className={cn('flex items-center gap-1', sizes.trend)}>
            {calculatedTrend === 'up' ? (
              <TrendingUp className={cn('w-4 h-4', colors.icon)} />
            ) : calculatedTrend === 'down' ? (
              <TrendingDown className={cn('w-4 h-4', colors.icon)} />
            ) : (
              <Minus className={cn('w-4 h-4', dynamicTheme.colors.text.tertiary)} />
            )}
            {trendValue !== null && (
              <span className={cn(
                'font-medium tabular-nums',
                trendValue > 0 ? dynamicTheme.colors.status.success.text : 
                trendValue < 0 ? dynamicTheme.colors.status.error.text : 
                dynamicTheme.colors.text.tertiary
              )}>
                {trendValue > 0 ? '+' : ''}{trendValue.toFixed(1)}{unit}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <CoverageBar
        percentage={value}
        height="sm"
        showPercentage={false}
        animated={true}
        className="mb-3"
      />

      {/* Actionable Insight */}
      {actionable && (
        <button
          onClick={actionable.onClick}
          className={cn(
            'w-full text-left rounded-md px-2 py-1.5 text-xs font-medium',
            dynamicTheme.colors.background.secondary,
            `hover:${dynamicTheme.colors.background.tertiary}`,
            dynamicTheme.colors.text.secondary,
            'transition-colors duration-150',
            'flex items-center gap-1.5'
          )}
        >
          <Info className="w-3 h-3" />
          {actionable.text}
        </button>
      )}
    </div>
  );
}

/**
 * Compact variant for space-constrained areas
 */
export function MetricCardCompact({
  label,
  value,
  trend = null,
  unit = '%',
  className
}) {
  const dynamicTheme = useDynamicAppTheme();
  const colors = getStatusColor(value, { good: 90, warning: 70 }, dynamicTheme);
  
  return (
    <div className={cn(
      'flex items-center justify-between px-3 py-2 rounded-md',
      colors.bg,
      'border',
      colors.border,
      className
    )}>
      <span className={`text-xs font-medium ${dynamicTheme.colors.text.secondary}`}>
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span className={cn('text-sm font-bold tabular-nums', colors.text)}>
          {value.toFixed(1)}{unit}
        </span>
        {trend && (
          <span className={cn(
            'text-xs',
            trend > 0 ? dynamicTheme.colors.status.success.text : 
            trend < 0 ? dynamicTheme.colors.status.error.text : 
            dynamicTheme.colors.text.tertiary
          )}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '–'}
          </span>
        )}
      </div>
    </div>
  );
}