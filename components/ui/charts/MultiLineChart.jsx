/**
 * MultiLineChart Component
 * 
 * A reusable multi-line chart component built with Recharts
 * Supports multiple data series, legend, and customizable styling
 */

'use client';

import { useMemo } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Dot,
} from 'recharts';
import { cn } from '@/lib/utils';
import { CHART_CONFIG } from '@/lib/utils/ui-constants';

/**
 * Custom tooltip component for hover details
 */
function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className={cn(
      "bg-white dark:bg-stone-800 p-3 rounded-lg shadow-lg border border-stone-200 dark:border-stone-700",
      CHART_CONFIG.fonts.primary
    )}>
      {formatter ? (
        formatter(payload, label)
      ) : (
        <>
          <p className="font-semibold text-sm text-stone-800 dark:text-stone-200 mb-2">
            {label}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm">
              <span style={{ color: entry.color }} className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-medium" style={{ color: entry.color }}>
                {entry.value.toFixed(1)}%
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

/**
 * Custom legend component
 */
function CustomLegend({ payload }) {
  return (
    <div className={cn(
      "flex flex-wrap items-center justify-center gap-4 mt-4",
      CHART_CONFIG.fonts.primary
    )}>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <span 
            className="inline-block w-3 h-[2px]" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-stone-600 dark:text-stone-400">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function MultiLineChart({
  data = [],
  lines = [], // Array of { dataKey, name, color, strokeWidth, strokeDasharray }
  xDataKey = 'x',
  xLabel = 'X Axis',
  yLabel = 'Y Axis',
  height = CHART_CONFIG.layout.height.large,
  showGrid = true,
  showLegend = true,
  showDots = false,
  animationDuration = CHART_CONFIG.animation.duration,
  yDomain = CHART_CONFIG.axes.y.domain,
  yTicks = CHART_CONFIG.axes.y.ticks,
  xFormatter = (value) => value,
  yFormatter = (value) => `${value}%`,
  tooltipFormatter = null,
  className = '',
}) {
  // Don't render if no data
  if (!data || data.length === 0) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-stone-50 dark:bg-stone-900 rounded-lg',
        className
      )} style={{ height }}>
        <p className="text-stone-500 dark:text-stone-400">No data available</p>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={CHART_CONFIG.layout.margin}
        >
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="currentColor"
              className="text-stone-200 dark:text-stone-700"
            />
          )}
          
          <XAxis
            dataKey={xDataKey}
            tick={{ 
              fontSize: CHART_CONFIG.fonts.dataLabels.size, 
              fill: 'currentColor',
              fontFamily: CHART_CONFIG.fonts.primaryFamily
            }}
            tickFormatter={xFormatter}
            label={{
              value: xLabel,
              position: 'insideBottom',
              offset: -20,
              style: { 
                textAnchor: 'middle', 
                fontSize: CHART_CONFIG.fonts.dataLabels.size, 
                fill: 'currentColor',
                fontFamily: CHART_CONFIG.fonts.primaryFamily
              },
            }}
            className="text-stone-600 dark:text-stone-400"
          />
          
          <YAxis
            domain={yDomain}
            ticks={yTicks}
            tick={{ 
              fontSize: CHART_CONFIG.fonts.dataLabels.size, 
              fill: 'currentColor',
              fontFamily: CHART_CONFIG.fonts.primaryFamily
            }}
            tickFormatter={yFormatter}
            label={{
              value: yLabel,
              angle: -90,
              position: 'insideLeft',
              style: { 
                textAnchor: 'middle', 
                fontSize: CHART_CONFIG.fonts.dataLabels.size, 
                fill: 'currentColor',
                fontFamily: CHART_CONFIG.fonts.primaryFamily
              },
            }}
            className="text-stone-600 dark:text-stone-400"
          />
          
          <Tooltip
            content={<CustomTooltip formatter={tooltipFormatter} />}
            cursor={{ stroke: 'currentColor', strokeWidth: 1 }}
            wrapperClassName="!outline-none"
          />
          
          {showLegend && (
            <Legend 
              content={<CustomLegend />}
              wrapperStyle={{ paddingTop: '20px' }}
            />
          )}
          
          {/* Render multiple lines */}
          {lines.map((line, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={line.strokeWidth || 2}
              strokeDasharray={line.strokeDasharray || "0"}
              dot={showDots}
              activeDot={showDots ? { r: 4 } : false}
              animationDuration={animationDuration}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}