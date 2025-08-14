/**
 * Test Results & Coverage Dashboard
 * 
 * A standalone, resilient page that shows:
 * - Unit test results and status
 * - Integration test results (when available)
 * - Code coverage metrics
 * - Test execution controls
 * 
 * This page is designed to ALWAYS WORK, even if the main app fails.
 * It includes error boundaries and fallback states.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { DevHeader } from '@/components/ui/dev-header';
import { LeftTray } from '@/components/ui/left-tray';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw, 
  TestTube, 
  BarChart3, 
  AlertCircle,
  Terminal
} from 'lucide-react';

// Mock test data structure (will be replaced with real data)
const INITIAL_TEST_STATE = {
  status: 'idle',
  lastRun: null,
  results: {
    unit: {
      total: 117,
      passed: 117,
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
        }
]
    },
    integration: {
      total: 69,
      passed: 69,
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
      'lib/utils.js': { statements: 100, branches: 100, functions: 100, lines: 100 },
      'components/ui/card.jsx': { statements: 100, branches: 100, functions: 100, lines: 100 },
      'app/api/cards/route.js': { statements: 95.24, branches: 92.31, functions: 100, lines: 95.24 },
      'app/api/conversations/[id]/events/route.js': { statements: 100, branches: 85.71, functions: 100, lines: 100 },
      'lib/db/database.js': { statements: 92.86, branches: 88.89, functions: 100, lines: 92.86 }
    }
  }
};

function TestResultsCard({ title, results, icon: Icon }) {
  const successRate = results.total > 0 ? (results.passed / results.total) * 100 : 0;
  const isSuccess = results.failed === 0 && results.total > 0;
  
  return (
    <Card className="p-6 bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <div className={`px-2 py-1 rounded text-sm font-medium ${
          isSuccess ? 'bg-green-100 text-green-800' : results.total === 0 ? 'bg-stone-100 text-stone-600 dark:text-stone-300' : 'bg-red-100 text-red-800'
        }`}>
          {results.total === 0 ? 'No Tests' : isSuccess ? 'All Passing' : `${results.failed} Failed`}
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-stone-900 dark:text-stone-100">{results.total}</div>
          <div className="text-sm text-stone-500 dark:text-stone-400">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{results.passed}</div>
          <div className="text-sm text-stone-500 dark:text-stone-400">Passed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{results.failed}</div>
          <div className="text-sm text-stone-500 dark:text-stone-400">Failed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{successRate.toFixed(0)}%</div>
          <div className="text-sm text-stone-500 dark:text-stone-400">Success</div>
        </div>
      </div>
      
      {results.duration && (
        <div className="text-sm text-stone-500 dark:text-stone-400">
          Duration: {results.duration}
        </div>
      )}
      
      {/* Individual test files */}
      {results.files && results.files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-stone-600 dark:text-stone-300">Test Files:</h4>
          {results.files.map((file) => (
            <div key={file.name} className="flex items-center justify-between p-2 bg-stone-50 dark:bg-stone-800 rounded">
              <span className="text-sm">{file.name}</span>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm">{file.passed}/{file.tests}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function CoverageCard({ coverage }) {
  const coverageItems = [
    { label: 'Statements', value: coverage.statements },
    { label: 'Branches', value: coverage.branches },
    { label: 'Functions', value: coverage.functions },
    { label: 'Lines', value: coverage.lines }
  ];

  const getColorClass = (value) => {
    if (value >= 90) return 'text-green-600';
    if (value >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="p-6 bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">Code Coverage</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {coverageItems.map((item) => (
          <div key={item.label} className="text-center">
            <div className={`text-2xl font-bold ${getColorClass(item.value)}`}>
              {item.value.toFixed(1)}%
            </div>
            <div className="text-sm text-stone-500 dark:text-stone-400">{item.label}</div>
          </div>
        ))}
      </div>
      
      {/* Top files by coverage */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-stone-600 dark:text-stone-300">Hook Coverage:</h4>
        {Object.entries(coverage.files).map(([file, metrics]) => (
          <div key={file} className="flex items-center justify-between p-2 bg-stone-50 dark:bg-stone-800 rounded">
            <span className="text-sm font-mono">{file.split('/').pop()}</span>
            <span className={`text-sm font-medium ${getColorClass(metrics.statements)}`}>
              {metrics.statements.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ErrorBoundary({ children, fallback }) {
  try {
    return children;
  } catch (error) {
    console.error('Test Dashboard Error:', error);
    return fallback || (
      <Card className="p-6 bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>Error loading test data</span>
        </div>
      </Card>
    );
  }
}

export default function TestsPage() {
  const [testState, setTestState] = useState(INITIAL_TEST_STATE);
  const [trayOpen, setTrayOpen] = useState(false);
  const [isRunningTests, setIsRunningTests] = useState(false);

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

  // Load test results on mount (in real implementation, would read from test output files)
  useEffect(() => {
    // This would typically read from:
    // - Vitest JSON reporter output
    // - Coverage reports (coverage/coverage-summary.json)
    // - Custom test result files
    
    setTestState(prev => ({ ...prev, lastRun: new Date().toISOString() }));
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
        onClick={() => window.open('/dev/coverage', '_blank')}
        className="h-[40px] leading-none"
      >
        <BarChart3 className="w-4 h-4 mr-2" />
        Full Report
      </Button>
    </>
  );

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col bg-stone-50 dark:bg-stone-900">
        {/* Header */}
        <DevHeader
          onOpenTray={() => setTrayOpen(true)}
          rightControls={rightControls}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Status Banner */}
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
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-stone-400 dark:text-stone-500" />
                  <span className="text-sm text-stone-500 dark:text-stone-400">{testState.results.unit.duration}</span>
                </div>
              </div>
            </Card>

            {/* Test Results Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TestResultsCard 
                title="Unit Tests" 
                results={testState.results.unit}
                icon={TestTube}
              />
              <TestResultsCard 
                title="Integration Tests" 
                results={testState.results.integration}
                icon={Terminal}
              />
            </div>

            {/* Coverage */}
            <CoverageCard coverage={testState.coverage} />

            {/* Test Commands */}
            <Card className="p-6 bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700">
              <h3 className="text-lg font-semibold mb-4">Test Commands</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Button variant="outline" onClick={() => runTests('unit')}>
                  <TestTube className="w-4 h-4 mr-2" />
                  Unit Tests
                </Button>
                <Button variant="outline" onClick={() => runTests('integration')}>
                  <Terminal className="w-4 h-4 mr-2" />
                  Integration Tests
                </Button>
                <Button variant="outline" onClick={() => runTests('coverage')}>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Coverage Report
                </Button>
                <Button variant="outline" onClick={() => runTests('watch')}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Watch Mode
                </Button>
              </div>
            </Card>
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
    </ErrorBoundary>
  );
}