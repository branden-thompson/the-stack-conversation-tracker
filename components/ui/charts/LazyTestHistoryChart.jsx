/**
 * LazyTestHistoryChart - Dynamic Import Wrapper
 * 
 * Lazy-loads the heavy TestHistoryChart component with Recharts library
 * Also dynamically loads test history data to reduce initial bundle size
 */

'use client';

import { Suspense, lazy, useState, useEffect } from 'react';
import { Loader2, TrendingUp } from 'lucide-react';

// Dynamically import the heavy chart component
const TestHistoryChart = lazy(() => 
  import('./TestHistoryChart').then(module => ({
    default: module.TestHistoryChart
  }))
);

// Dynamically import test history data
const getTestHistoryData = () => 
  import('@/data/coverage-data').then(module => module.COVERAGE_DATA.testHistory);

/**
 * Loading fallback component
 */
function ChartSkeleton() {
  return (
    <div className="w-full h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <TrendingUp className="h-5 w-5" />
        <span className="text-sm">Loading chart...</span>
      </div>
    </div>
  );
}

/**
 * Data loader component for test history
 */
function TestHistoryDataLoader({ children, ...props }) {
  const [testHistory, setTestHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    getTestHistoryData()
      .then(data => {
        if (mounted) {
          setTestHistory(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <ChartSkeleton />;
  }

  if (error) {
    return (
      <div className="w-full h-64 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-center">
        <div className="text-red-800 dark:text-red-200 text-sm">
          Failed to load test history: {error.message}
        </div>
      </div>
    );
  }

  return children({ ...props, testHistory });
}

/**
 * Lazy-loaded TestHistoryChart with suspense boundary and data loading
 */
export function LazyTestHistoryChart(props) {
  return (
    <TestHistoryDataLoader {...props}>
      {(chartProps) => (
        <Suspense fallback={<ChartSkeleton />}>
          <TestHistoryChart {...chartProps} />
        </Suspense>
      )}
    </TestHistoryDataLoader>
  );
}

export default LazyTestHistoryChart;