/**
 * TestHistoryChart Component
 * 
 * Specialized wrapper around LineChart for displaying test history data
 * Formats test run data and provides custom tooltips with detailed information
 */

'use client';

import { useMemo, useState, useEffect } from 'react';
import { MultiLineChart } from './MultiLineChart';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Table, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CHART_CONFIG } from '@/lib/utils/ui-constants';
import { cn } from '@/lib/utils';

/**
 * Format date for X-axis labels
 */
function formatDateForAxis(dateString) {
  const date = new Date(dateString);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const hour = date.getHours();
  
  // Show time if multiple runs on same day
  if (hour !== 0) {
    return `${month} ${day} ${hour}:00`;
  }
  return `${month} ${day}`;
}

/**
 * Format full date for tooltips
 */
function formatFullDate(dateString) {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Custom tooltip formatter for multi-line chart with coverage
 */
function multiLineTooltipFormatter(payload, label) {
  if (!payload || payload.length === 0) return null;
  
  // Find the test success entry to get metadata
  const testEntry = payload.find(p => p.dataKey === 'testSuccess');
  const metadata = testEntry?.payload || {};
  
  return (
    <div 
      className="space-y-2"
      style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
    >
      <div className="font-semibold text-sm text-stone-800 dark:text-stone-200 border-b border-stone-200 dark:border-stone-700 pb-1">
        {formatFullDate(label)}
      </div>
      
      {/* Test metrics */}
      {testEntry && (
        <div className="space-y-1 text-xs">
          <div className="font-medium">Test Results:</div>
          <div className="pl-2 space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-stone-600 dark:text-stone-400">Passed:</span>
              <span className="font-medium text-green-600 dark:text-green-400">
                {metadata.passed} / {metadata.totalTests}
              </span>
            </div>
            {metadata.failed > 0 && (
              <div className="flex justify-between gap-4">
                <span className="text-stone-600 dark:text-stone-400">Failed:</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {metadata.failed}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Coverage metrics */}
      <div className="space-y-1 text-xs">
        <div className="font-medium">Coverage:</div>
        <div className="pl-2">
          {payload.map((entry, index) => {
            if (entry.name === 'Test Success') return null;
            return (
              <div key={index} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1">
                  <span 
                    className="inline-block w-2 h-2 rounded-full" 
                    style={{ backgroundColor: entry.color }} 
                  />
                  <span className="text-stone-600 dark:text-stone-400">
                    {entry.name}:
                  </span>
                </span>
                <span className="font-medium" style={{ color: entry.color }}>
                  {entry.value.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function TestHistoryChart({ 
  testHistory = [], 
  maxItems = 20,
  showFullHistory = false,
  onToggleFullHistory = null,
  onControlsReady,
}) {
  const [showTable, setShowTable] = useState(false);
  
  // Process and limit test history data for multi-line chart
  const chartData = useMemo(() => {
    // Take most recent items (already sorted by date descending)
    const recentRuns = testHistory.slice(0, maxItems);
    
    // Reverse to show chronologically (oldest to newest)
    return recentRuns.reverse().map(run => ({
      x: run.date,
      testSuccess: run.totalTests > 0 ? (run.passed / run.totalTests) * 100 : 0,
      statements: run.coverage?.statements || 0,
      branches: run.coverage?.branches || 0,
      functions: run.coverage?.functions || 0,
      lines: run.coverage?.lines || 0,
      // Metadata for tooltip
      totalTests: run.totalTests,
      passed: run.passed,
      failed: run.failed,
      duration: run.duration || 0,
    }));
  }, [testHistory, maxItems]);
  
  // Define the lines to display
  const chartLines = [
    { 
      dataKey: 'testSuccess', 
      name: 'Test Success', 
      color: CHART_CONFIG.colors.primary,
      strokeWidth: 3 
    },
    { 
      dataKey: 'statements', 
      name: 'Statements', 
      color: CHART_CONFIG.colors.success,
      strokeWidth: 2 
    },
    { 
      dataKey: 'branches', 
      name: 'Branches', 
      color: CHART_CONFIG.colors.warning,
      strokeWidth: 2 
    },
    { 
      dataKey: 'functions', 
      name: 'Functions', 
      color: CHART_CONFIG.colors.danger,
      strokeWidth: 2 
    },
    { 
      dataKey: 'lines', 
      name: 'Lines', 
      color: '#8b5cf6', // Purple
      strokeWidth: 2,
      strokeDasharray: "5 5" 
    },
  ];

  // Calculate trend for test success
  const trend = useMemo(() => {
    if (chartData.length < 2) return null;
    
    const firstValue = chartData[0].testSuccess;
    const lastValue = chartData[chartData.length - 1].testSuccess;
    const change = lastValue - firstValue;
    
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'flat',
      percentage: Math.abs(change).toFixed(1),
    };
  }, [chartData]);

  // Calculate average success rate
  const avgSuccessRate = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, item) => acc + item.testSuccess, 0);
    return (sum / chartData.length).toFixed(1);
  }, [chartData]);
  
  // Create the view toggle control button
  const viewToggleControl = (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowTable(!showTable)}
      className="h-8"
    >
      {showTable ? (
        <>
          <LineChart className="w-3 h-3 mr-1.5" />
          Show Chart
        </>
      ) : (
        <>
          <Table className="w-3 h-3 mr-1.5" />
          Show Table
        </>
      )}
    </Button>
  );
  
  // Pass control to parent if callback provided
  useEffect(() => {
    if (onControlsReady) {
      onControlsReady(viewToggleControl);
    }
  }, [showTable]);

  return (
    <div className="space-y-4">
      {/* Chart Stats Summary */}
      <div 
        className="flex items-center gap-4"
        style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
      >
        <div className="text-sm text-stone-600 dark:text-stone-400">
          <span className="font-medium">Last {chartData.length} runs</span>
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${
            trend.direction === 'up' ? 'text-green-600 dark:text-green-400' :
            trend.direction === 'down' ? 'text-red-600 dark:text-red-400' :
            'text-stone-600 dark:text-stone-400'
          }`}>
            {trend.direction === 'up' ? (
              <TrendingUp className="w-4 h-4" />
            ) : trend.direction === 'down' ? (
              <TrendingDown className="w-4 h-4" />
            ) : null}
            <span className="font-medium">{trend.percentage}%</span>
          </div>
        )}
        
        <div className="text-sm text-stone-600 dark:text-stone-400">
          Avg: <span className="font-medium text-stone-800 dark:text-stone-200">{avgSuccessRate}%</span>
        </div>
      </div>

      {/* Chart or Table View */}
      {!showTable ? (
        <MultiLineChart
          data={chartData}
          lines={chartLines}
          xDataKey="x"
          xLabel="Date"
          yLabel="Percentage (%)"
          height={CHART_CONFIG.layout.height.medium}
          showGrid={true}
          showLegend={true}
          showDots={false}
          yDomain={CHART_CONFIG.axes.y.domain}
          yTicks={CHART_CONFIG.axes.y.ticks}
          xFormatter={formatDateForAxis}
          yFormatter={(value) => `${value}%`}
          tooltipFormatter={multiLineTooltipFormatter}
          className="bg-stone-50 dark:bg-stone-900 rounded-lg p-4"
        />
      ) : (
        <div 
          className="overflow-x-auto bg-white dark:bg-stone-800 rounded-lg p-4"
          style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-700 text-left">
                <th className="px-2 py-1.5 text-stone-600 dark:text-stone-300" 
                    style={{ fontSize: CHART_CONFIG.fonts.table.headerSize, fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}>Date</th>
                <th className="px-2 py-1.5 text-stone-600 dark:text-stone-300 text-right"
                    style={{ fontSize: CHART_CONFIG.fonts.table.headerSize, fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}>Tests</th>
                <th className="px-2 py-1.5 text-stone-600 dark:text-stone-300 text-right"
                    style={{ fontSize: CHART_CONFIG.fonts.table.headerSize, fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}>Pass</th>
                <th className="px-2 py-1.5 text-stone-600 dark:text-stone-300 text-right"
                    style={{ fontSize: CHART_CONFIG.fonts.table.headerSize, fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}>Fail</th>
                <th className="px-2 py-1.5 text-stone-600 dark:text-stone-300 text-right"
                    style={{ fontSize: CHART_CONFIG.fonts.table.headerSize, fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}>Success</th>
                <th className="px-2 py-1.5 text-stone-600 dark:text-stone-300 text-right"
                    style={{ fontSize: CHART_CONFIG.fonts.table.headerSize, fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}>Stmt</th>
                <th className="px-2 py-1.5 text-stone-600 dark:text-stone-300 text-right"
                    style={{ fontSize: CHART_CONFIG.fonts.table.headerSize, fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}>Branch</th>
                <th className="px-2 py-1.5 text-stone-600 dark:text-stone-300 text-right"
                    style={{ fontSize: CHART_CONFIG.fonts.table.headerSize, fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}>Func</th>
                <th className="px-2 py-1.5 text-stone-600 dark:text-stone-300 text-right"
                    style={{ fontSize: CHART_CONFIG.fonts.table.headerSize, fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}>Lines</th>
              </tr>
            </thead>
            <tbody>
              {testHistory.slice(0, showFullHistory ? undefined : maxItems).map((run, index) => {
                const successRate = run.totalTests > 0 
                  ? ((run.passed / run.totalTests) * 100).toFixed(1)
                  : '0.0';
                  
                return (
                  <tr key={index} className="border-b border-stone-100 dark:border-stone-800">
                    <td className="px-2 py-1.5" style={{ fontSize: CHART_CONFIG.fonts.table.cellSize, fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}>
                      {formatFullDate(run.date)}
                    </td>
                    <td className="px-2 py-1.5 text-right" style={{ fontSize: CHART_CONFIG.fonts.table.cellSize, fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}>
                      {run.totalTests}
                    </td>
                    <td className="px-2 py-1.5 text-right text-green-600 dark:text-green-400"
                        style={{ fontSize: CHART_CONFIG.fonts.table.cellSize, fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}>
                      {run.passed}
                    </td>
                    <td className="px-2 py-1.5 text-right text-red-600 dark:text-red-400"
                        style={{ fontSize: CHART_CONFIG.fonts.table.cellSize, fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}>
                      {run.failed}
                    </td>
                    <td className="px-2 py-1.5 text-right"
                        style={{ fontSize: CHART_CONFIG.fonts.table.cellSize, fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}>
                      <span className={
                        parseFloat(successRate) >= 90 ? 'text-green-600 dark:text-green-400' :
                        parseFloat(successRate) >= 70 ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-red-600 dark:text-red-400'
                      }>
                        {successRate}%
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-right text-blue-600 dark:text-blue-400"
                        style={{ fontSize: CHART_CONFIG.fonts.table.cellSize, fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}>
                      {run.coverage?.statements?.toFixed(1) || '-'}%
                    </td>
                    <td className="px-2 py-1.5 text-right text-purple-600 dark:text-purple-400"
                        style={{ fontSize: CHART_CONFIG.fonts.table.cellSize, fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}>
                      {run.coverage?.branches?.toFixed(1) || '-'}%
                    </td>
                    <td className="px-2 py-1.5 text-right text-orange-600 dark:text-orange-400"
                        style={{ fontSize: CHART_CONFIG.fonts.table.cellSize, fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}>
                      {run.coverage?.functions?.toFixed(1) || '-'}%
                    </td>
                    <td className="px-2 py-1.5 text-right text-teal-600 dark:text-teal-400"
                        style={{ fontSize: CHART_CONFIG.fonts.table.cellSize, fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}>
                      {run.coverage?.lines?.toFixed(1) || '-'}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {testHistory.length > maxItems && onToggleFullHistory && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleFullHistory}
              >
                {showFullHistory ? 'Show Less' : `Show All ${testHistory.length} Runs`}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}