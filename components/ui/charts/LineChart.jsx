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
import { CHART_CONFIG, THEME } from '@/lib/utils/ui-constants';
import { useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';

/**
 * Get actual hex colors for SVG elements
 * Note: Uses hardcoded hex colors because SVG elements require actual color values,
 * not CSS class names. Chart visibility needs consistent, vibrant colors across themes.
 */
function getChartColors(dynamicTheme) {
  return {
    primary: "#3b82f6",    // blue-500 - vibrant blue for primary data
    success: "#10b981",    // green-500 - success/positive trends  
    warning: "#f59e0b",    // amber-500 - warning/neutral trends
    danger: "#ef4444",     // red-500 - error/negative trends
    grid: "#e5e7eb",       // gray-200 - subtle grid lines
  };
}

/**
 * Custom tooltip component for hover details
 */
function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  const metadata = data.payload.metadata || {};

  return (
    <div className={cn(
      `${THEME.colors.background.secondary} p-3 rounded-lg ${THEME.shadows.lg} border ${THEME.colors.border.primary}`,
      CHART_CONFIG.fonts.primary
    )}>
      {formatter ? (
        formatter(data.value, label, metadata)
      ) : (
        <>
          <p className={`font-semibold text-sm ${THEME.colors.text.primary}`}>
            {label}
          </p>
          <p className={`text-sm ${THEME.colors.text.secondary}`}>
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
  const dynamicTheme = useDynamicAppTheme();
  const { cx, cy, payload } = props;
  const isHighlight = payload.metadata?.highlight;
  const colors = getChartColors(dynamicTheme);
  
  return (
    <Dot
      cx={cx}
      cy={cy}
      r={isHighlight ? 5 : 3}
      fill={isHighlight ? colors.danger : colors.primary}
      strokeWidth={isHighlight ? 2 : 1}
      stroke={isHighlight ? colors.danger : colors.primary}
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
        `flex items-center justify-center ${THEME.colors.background.primary} rounded-lg`,
        className
      )} style={{ height }}>
        <p className={THEME.colors.text.muted}>No data available</p>
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
              className={THEME.colors.text.light}
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
            className={THEME.colors.text.secondary}
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
            className={THEME.colors.text.secondary}
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