/**
 * LazyCoverageData - Dynamic Coverage Data Loader
 * 
 * Lazy-loads coverage data and components to reduce initial bundle size
 * Only loads heavy coverage processing when dev/tests page is accessed
 */

'use client';

import { Suspense, lazy, useState, useEffect } from 'react';
import { Loader2, Database } from 'lucide-react';
import { useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';

// Dynamically import coverage data and components
const getCoverageData = () => 
  import('@/data/coverage-data').then(module => ({
    coverageData: module.COVERAGE_DATA,
    fileGroups: module.FILE_GROUPS
  }));

const getGroupedCoverageTable = () =>
  import('@/components/ui/grouped-coverage-table').then(module => ({
    default: module.GroupedCoverageTable
  }));

/**
 * Loading fallback for coverage data
 */
function CoverageDataSkeleton() {
  const dynamicTheme = useDynamicAppTheme();
  
  return (
    <div className="space-y-4">
      <div className={`${dynamicTheme.colors.background.secondary} rounded-lg p-6 flex items-center justify-center`}>
        <div className={`flex items-center gap-2 ${dynamicTheme.colors.text.tertiary}`}>
          <Database className="h-5 w-5" />
          <span className="text-sm">Loading coverage data...</span>
        </div>
      </div>
      <div className={`${dynamicTheme.colors.background.secondary} rounded-lg h-32 flex items-center justify-center`}>
        <Loader2 className={`h-6 w-6 animate-spin ${dynamicTheme.colors.text.tertiary}`} />
      </div>
    </div>
  );
}

/**
 * Async coverage data loader component
 */
function CoverageDataLoader({ children }) {
  const [coverageData, setCoverageData] = useState(null);
  const [fileGroups, setFileGroups] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    getCoverageData()
      .then(data => {
        if (mounted) {
          setCoverageData(data.coverageData);
          setFileGroups(data.fileGroups);
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
    return <CoverageDataSkeleton />;
  }

  if (error) {
    const dynamicTheme = useDynamicAppTheme();
    
    return (
      <div className={`${dynamicTheme.colors.status.error.bg} ${dynamicTheme.colors.status.error.border} rounded-lg p-4`}>
        <div className={`${dynamicTheme.colors.status.error.text} text-sm`}>
          Failed to load coverage data: {error.message}
        </div>
      </div>
    );
  }

  return children(coverageData, fileGroups);
}

/**
 * Lazy-loaded coverage table component
 */
const LazyGroupedCoverageTable = lazy(getGroupedCoverageTable);

/**
 * Main export - lazy coverage data with table
 */
export function LazyCoverageData({ ...tableProps }) {
  return (
    <CoverageDataLoader>
      {(coverageData, fileGroups) => (
        <Suspense fallback={<CoverageDataSkeleton />}>
          <LazyGroupedCoverageTable 
            {...tableProps}
            files={coverageData.files}
            fileGroups={fileGroups}
            summary={coverageData.summary}
          />
        </Suspense>
      )}
    </CoverageDataLoader>
  );
}

export default LazyCoverageData;