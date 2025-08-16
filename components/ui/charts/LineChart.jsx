/**
 * LineChart Component
 * 
 * A reusable, responsive line chart component built with Recharts
 * Supports dark mode, hover tooltips, and customizable styling
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
  Dot,
} from 'recharts';
import { cn } from '@/lib/utils';
import { CHART_CONFIG } from '@/lib/utils/ui-constants';

/**
 * Custom tooltip component for hover details
 */
function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  const metadata = data.payload.metadata || {};

  return (
    <div className={cn(
      "bg-white dark:bg-stone-800 p-3 rounded-lg shadow-lg border border-stone-200 dark:border-stone-700",
      CHART_CONFIG.fonts.primary
    )}>
      {formatter ? (
        formatter(data.value, label, metadata)
      ) : (
        <>
          <p className="font-semibold text-sm text-stone-800 dark:text-stone-200">
            {label}
          </p>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            Value: {data.value}
          </p>
        </>
      )}
    </div>
  );
}

/**
 * Custom dot component for data points
 */
function CustomDot(props) {
  const { cx, cy, payload } = props;
  const isHighlight = payload.metadata?.highlight;
  
  return (
    <Dot
      cx={cx}
      cy={cy}
      r={isHighlight ? 5 : 3}
      fill={isHighlight ? '#ef4444' : '#4f46e5'}
      strokeWidth={isHighlight ? 2 : 1}
      stroke={isHighlight ? '#dc2626' : '#4338ca'}
    />
  );
}

export function LineChart({
  data = [],
  xLabel = 'X Axis',
  yLabel = 'Y Axis',
  height = CHART_CONFIG.layout.height.large,
  showGrid = true,
  color = CHART_CONFIG.colors.primary,
  strokeWidth = 2,
  showDots = true,
  animationDuration = CHART_CONFIG.animation.duration,
  yDomain = CHART_CONFIG.axes.y.domain,
  yTicks = CHART_CONFIG.axes.y.ticks,
  xFormatter = (value) => value,
  yFormatter = (value) => `${value}%`,
  tooltipFormatter = null,
  className = '',
}) {
  // Memoize chart data processing
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
      ...item,
      x: item.x || '',
      y: item.y || 0,
      metadata: item.metadata || {},
    }));
  }, [data]);

  // Don't render if no data
  if (chartData.length === 0) {
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
          data={chartData}
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
            dataKey="x"
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
          
          <Line
            type="monotone"
            dataKey="y"
            stroke={color}
            strokeWidth={strokeWidth}
            dot={showDots ? <CustomDot /> : false}
            activeDot={{ r: 6 }}
            animationDuration={animationDuration}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}