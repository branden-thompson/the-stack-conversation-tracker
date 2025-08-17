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

/**
 * Get status color based on metric value and thresholds
 */
function getStatusColor(value, thresholds = { good: 90, warning: 70 }) {
  if (value >= thresholds.good) return {
    bg: 'bg-green-50 dark:bg-green-950/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-700 dark:text-green-300',
    icon: 'text-green-600 dark:text-green-400'
  };
  if (value >= thresholds.warning) return {
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-700 dark:text-yellow-300',
    icon: 'text-yellow-600 dark:text-yellow-400'
  };
  return {
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-700 dark:text-red-300',
    icon: 'text-red-600 dark:text-red-400'
  };
}

/**
 * Mini sparkline visualization
 */
function Sparkline({ data = [], width = 60, height = 20, className }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const isImproving = data[data.length - 1] > data[0];

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
        stroke={isImproving ? 'currentColor' : 'currentColor'}
        strokeWidth="1.5"
        className={isImproving ? 'text-green-500' : 'text-red-500'}
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

  const colors = getStatusColor(value, threshold);
  
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
          <Sparkline data={sparkline} className="ml-2" />
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
              <Minus className={cn('w-4 h-4 text-zinc-400')} />
            )}
            {trendValue !== null && (
              <span className={cn(
                'font-medium tabular-nums',
                trendValue > 0 ? 'text-green-600 dark:text-green-400' : 
                trendValue < 0 ? 'text-red-600 dark:text-red-400' : 
                'text-zinc-500'
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
            'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700',
            'text-zinc-700 dark:text-zinc-300',
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
  const colors = getStatusColor(value);
  
  return (
    <div className={cn(
      'flex items-center justify-between px-3 py-2 rounded-md',
      colors.bg,
      'border',
      colors.border,
      className
    )}>
      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <span className={cn('text-sm font-bold tabular-nums', colors.text)}>
          {value.toFixed(1)}{unit}
        </span>
        {trend && (
          <span className={cn(
            'text-xs',
            trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-zinc-500'
          )}>
            {trend > 0 ? '↑' : trend < 0 ? '↓' : '–'}
          </span>
        )}
      </div>
    </div>
  );
}