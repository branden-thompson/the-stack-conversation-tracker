/**
 * Unified Test & Coverage Dashboard
 * 
 * Combines test results and coverage metrics in a single view:
 * - Test status and execution controls
 * - File-by-file coverage breakdown
 * - Test execution history with coverage trends
 * - Export capabilities
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { DevHeader } from '@/components/ui/dev-header';
import { LeftTray } from '@/components/ui/left-tray';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import SectionCard from '@/components/ui/section-card';
import { TestHistoryChart } from '@/components/ui/charts/TestHistoryChart';
import { GroupedCoverageTable } from '@/components/ui/grouped-coverage-table';
import { 
  Play,
  Download,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  TestTube,
  Terminal,
  BarChart3,
  Eye
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { COVERAGE_DATA, FILE_GROUPS } from '@/data/coverage-data';

// Import coverage data from external file
const DETAILED_COVERAGE = COVERAGE_DATA;

// Extract test state from coverage data
const INITIAL_TEST_STATE = {
  status: 'idle',
  lastRun: DETAILED_COVERAGE.testHistory[0]?.date || null,
  results: {
    unit: {
      total: DETAILED_COVERAGE.testHistory[0]?.totalTests || 0,
      passed: DETAILED_COVERAGE.testHistory[0]?.passed || 0,
      failed: DETAILED_COVERAGE.testHistory[0]?.failed || 0,
      duration: (DETAILED_COVERAGE.testHistory[0]?.duration || 0) + 's',
    }
  },
  coverage: DETAILED_COVERAGE.summary
};

export default function TestsDashboardPage() {
  const [trayOpen, setTrayOpen] = useState(false);
  const [coverageTableControl, setCoverageTableControl] = useState(null);
  const [testHistoryControl, setTestHistoryControl] = useState(null);
  const [testState, setTestState] = useState(INITIAL_TEST_STATE);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const router = useRouter();

  // Simulate running tests (in real implementation, this would trigger actual test execution)
  const runTests = useCallback(async (type = 'unit') => {
    setIsRunningTests(true);
    setTestState(prev => ({ ...prev, status: 'running', lastRun: new Date().toISOString() }));
    
    // Simulate test execution delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In real implementation, this would execute: npm run test:run
    // and parse the results
    setTestState(prev => ({ 
      ...prev, 
      status: 'completed',
      lastRun: new Date().toISOString()
    }));
    setIsRunningTests(false);
  }, []);

  const rightControls = (
    <>
      <Button 
        onClick={() => runTests('unit')} 
        disabled={isRunningTests}
        className="h-[40px] leading-none"
      >
        {isRunningTests ? (
          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Play className="w-4 h-4 mr-2" />
        )}
        Run Tests
      </Button>
      <Button 
        variant="outline"
        onClick={() => {
          const blob = new Blob(
            [JSON.stringify(DETAILED_COVERAGE, null, 2)],
            { type: 'application/json' }
          );
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `coverage-report-${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }}
        className="h-[40px] leading-none"
      >
        <Download className="w-4 h-4 mr-2" />
        Export Report
      </Button>
    </>
  );

  return (
    <div className="h-screen flex flex-col bg-stone-50 dark:bg-stone-900">
      {/* Header */}
      <DevHeader
        onOpenTray={() => setTrayOpen(true)}
        rightControls={rightControls}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Test Status Banner */}
          <Card className="p-4 bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {testState.status === 'running' ? (
                  <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                ) : testState.results.unit.failed === 0 ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <div>
                  <h2 className="font-semibold">
                    {testState.status === 'running' ? 'Running Tests...' : 
                     testState.results.unit.failed === 0 ? 'All Tests Passing' : 
                     `${testState.results.unit.failed} Tests Failing`}
                  </h2>
                  {testState.lastRun && (
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      Last run: {new Date(testState.lastRun).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                  <span className="text-sm text-stone-500 dark:text-stone-400">{testState.results.unit.duration}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => runTests('unit')}>
                    <TestTube className="w-3 h-3 mr-1.5" />
                    Unit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => runTests('integration')}>
                    <Terminal className="w-3 h-3 mr-1.5" />
                    Integration
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => runTests('coverage')}>
                    <BarChart3 className="w-3 h-3 mr-1.5" />
                    Coverage
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => runTests('watch')}>
                    <Eye className="w-3 h-3 mr-1.5" />
                    Watch
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Coverage Summary */}
          <Card className="p-4 bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  testState.coverage.statements.percentage >= 90 ? 'text-green-600' :
                  testState.coverage.statements.percentage >= 70 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {testState.coverage.statements.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-stone-500 dark:text-stone-400">Statements</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  testState.coverage.branches.percentage >= 90 ? 'text-green-600' :
                  testState.coverage.branches.percentage >= 70 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {testState.coverage.branches.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-stone-500 dark:text-stone-400">Branches</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  testState.coverage.functions.percentage >= 90 ? 'text-green-600' :
                  testState.coverage.functions.percentage >= 70 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {testState.coverage.functions.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-stone-500 dark:text-stone-400">Functions</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  testState.coverage.lines.percentage >= 90 ? 'text-green-600' :
                  testState.coverage.lines.percentage >= 70 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {testState.coverage.lines.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-stone-500 dark:text-stone-400">Lines</div>
              </div>
            </div>
          </Card>

          {/* File-by-File Coverage */}
          <SectionCard
            title="File Coverage Details"
            headerControls={coverageTableControl}
            footerControls={coverageTableControl}
          >
            <GroupedCoverageTable 
              files={DETAILED_COVERAGE.files} 
              fileGroups={FILE_GROUPS}
              onControlsReady={setCoverageTableControl}
            />
          </SectionCard>

          {/* Test History with Line Chart */}
          <SectionCard
            title="Test History"
            headerControls={testHistoryControl}
            footerControls={testHistoryControl}
          >
            <TestHistoryChart 
              testHistory={DETAILED_COVERAGE.testHistory}
              maxItems={20}
              showFullHistory={false}
              onControlsReady={setTestHistoryControl}
            />
          </SectionCard>
        </div>
      </div>

      {/* Left Tray */}
      <LeftTray
        isOpen={trayOpen}
        onClose={() => setTrayOpen(false)}
        onNewCard={() => {}} // Disabled for dev pages
        onResetLayout={() => {}} // Disabled for dev pages  
        onRefreshCards={() => window.location.reload()}
        title="Dev Ops Center"
      />
    </div>
  );
}