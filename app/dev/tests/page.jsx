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
import { UniversalDevHeader } from '@/components/ui/universal-dev-header';
import { LeftTray } from '@/components/ui/left-tray';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import SectionCard from '@/components/ui/section-card';
// Lazy-loaded heavy components for better performance
import { LazyTestHistoryChart } from '@/components/ui/charts/LazyTestHistoryChart';
import { LazyCoverageData } from '@/components/ui/LazyCoverageData';
import { MetricCard } from '@/components/ui/metric-card';
import { StatusBadge, TestStatusBadge } from '@/components/ui/status-badge';
import { CoverageBar } from '@/components/ui/coverage-bar';
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
// Coverage data now loaded lazily via LazyCoverageData component

// Extract test state from coverage data
const INITIAL_TEST_STATE = {
  status: 'idle',
  lastRun: null,
  results: {
    unit: {
      total: 175,
      passed: 175,
      failed: 0,
      duration: '0.00s',
      files: [
        {
                "name": "useCards.test.ts",
                "tests": 17,
                "passed": 17,
                "failed": 0
        },
        {
                "name": "useConversationControls.test.ts",
                "tests": 22,
                "passed": 22,
                "failed": 0
        },
        {
                "name": "useBoardDnD.test.ts",
                "tests": 18,
                "passed": 18,
                "failed": 0
        },
        {
                "name": "utils.test.js",
                "tests": 26,
                "passed": 26,
                "failed": 0
        },
        {
                "name": "card.test.jsx",
                "tests": 34,
                "passed": 34,
                "failed": 0
        },
        {
                "name": "TimelineNode.test.jsx",
                "tests": 14,
                "passed": 14,
                "failed": 0
        },
        {
                "name": "ConversationTimeline.test.jsx",
                "tests": 9,
                "passed": 9,
                "failed": 0
        },
        {
                "name": "timelineConstants.test.js",
                "tests": 8,
                "passed": 8,
                "failed": 0
        },
        {
                "name": "timelineEvents.test.js",
                "tests": 18,
                "passed": 18,
                "failed": 0
        },
        {
                "name": "useExpansionState.test.js",
                "tests": 9,
                "passed": 9,
                "failed": 0
        }
]
    },
    integration: {
      total: 81,
      passed: 81,
      failed: 0,
      duration: '0.00s',
      files: [
        {
                "name": "cards.test.js",
                "tests": 21,
                "passed": 21,
                "failed": 0
        },
        {
                "name": "events.test.js",
                "tests": 16,
                "passed": 16,
                "failed": 0
        },
        {
                "name": "database.test.js",
                "tests": 32,
                "passed": 32,
                "failed": 0
        },
        {
                "name": "TreeListViewSwitching.test.jsx",
                "tests": 12,
                "passed": 12,
                "failed": 0
        }
]
    }
  },
  coverage: {
    statements: 85.20,
    branches: 89.50,
    functions: 78.80,
    lines: 85.20,
    files: {
      'lib/hooks/useCards.js': { statements: 97.86, branches: 94.11, functions: 100, lines: 97.86 },
      'lib/hooks/useConversationControls.js': { statements: 100, branches: 89.13, functions: 100, lines: 100 },
      'lib/hooks/useBoardDnD.js': { statements: 100, branches: 80.55, functions: 100, lines: 100 },
      'lib/hooks/useExpansionState.js': { statements: 100, branches: 100, functions: 100, lines: 100 },
      'lib/utils.js': { statements: 100, branches: 100, functions: 100, lines: 100 },
      'lib/utils/timelineConstants.js': { statements: 100, branches: 100, functions: 100, lines: 100 },
      'lib/utils/timelineEvents.js': { statements: 100, branches: 95.83, functions: 100, lines: 100 },
      'lib/utils/timelineFormatters.js': { statements: 100, branches: 90.91, functions: 100, lines: 100 },
      'lib/utils/timelineStyles.js': { statements: 95.45, branches: 85.71, functions: 100, lines: 95.45 },
      'lib/utils/timelineTree.js': { statements: 93.06, branches: 87.50, functions: 100, lines: 93.06 },
      'components/ui/card.jsx': { statements: 100, branches: 100, functions: 100, lines: 100 },
      'components/timeline/TimelineNode.jsx': { statements: 92.31, branches: 83.33, functions: 100, lines: 92.31 },
      'components/timeline/ConversationTimeline.jsx': { statements: 88.89, branches: 80.00, functions: 100, lines: 88.89 },
      'components/timeline/TreeTimeline.jsx': { statements: 92.71, branches: 84.62, functions: 100, lines: 92.71 },
      'app/api/cards/route.js': { statements: 95.24, branches: 92.31, functions: 100, lines: 95.24 },
      'app/api/conversations/[id]/events/route.js': { statements: 100, branches: 85.71, functions: 100, lines: 100 },
      'lib/db/database.js': { statements: 92.86, branches: 88.89, functions: 100, lines: 92.86 }
    }
  }
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

  // Test Coverage Control handlers for UniversalDevHeader
  const handleRunTests = () => runTests('unit');
  
  const handleExportAllData = () => {
    const blob = new Blob(
      [JSON.stringify(testState.results, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coverage-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <UniversalDevHeader
        onOpenTray={() => setTrayOpen(true)}
        onRunTests={handleRunTests}
        onExportAllData={handleExportAllData}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Test Status Banner */}
          <Card className="p-4 bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
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
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Last run: {new Date(testState.lastRun).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">{testState.results.unit.duration}</span>
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

          {/* Coverage Summary with MetricCards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Statements"
              value={testState.coverage.statements}
              sparkline={[]}
              description="Code execution coverage"
              actionable={{
                text: "View uncovered statements",
                onClick: () => coverageTableControl?.scrollIntoView?.()
              }}
              size="md"
            />
            <MetricCard
              label="Branches"
              value={testState.coverage.branches}
              sparkline={[]}
              description="Conditional paths tested"
              actionable={{
                text: "Improve branch coverage",
                onClick: () => coverageTableControl?.scrollIntoView?.()
              }}
              size="md"
            />
            <MetricCard
              label="Functions"
              value={testState.coverage.functions}
              sparkline={[]}
              description="Functions executed"
              actionable={{
                text: "Find untested functions",
                onClick: () => coverageTableControl?.scrollIntoView?.()
              }}
              size="md"
            />
            <MetricCard
              label="Lines"
              value={testState.coverage.lines}
              sparkline={[]}
              description="Line-by-line coverage"
              actionable={{
                text: "Show uncovered lines",
                onClick: () => coverageTableControl?.scrollIntoView?.()
              }}
              size="md"
            />
          </div>

          {/* File-by-File Coverage */}
          <SectionCard
            title="File Coverage Details"
            headerControls={coverageTableControl}
            footerControls={coverageTableControl}
          >
            <LazyCoverageData 
              onControlsReady={setCoverageTableControl}
            />
          </SectionCard>

          {/* Test History with Line Chart */}
          <SectionCard
            title="Test History"
            headerControls={testHistoryControl}
            footerControls={testHistoryControl}
          >
            <LazyTestHistoryChart 
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