/**
 * Full Test Coverage Report
 * 
 * Comprehensive view of test results and code coverage metrics
 * - Detailed file-by-file coverage breakdown
 * - Test execution history
 * - Coverage trends and analysis
 * - Export capabilities
 */

'use client';

import { useState, useEffect } from 'react';
import { DevHeader } from '@/components/ui/dev-header';
import { LeftTray } from '@/components/ui/left-tray';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft,
  Download,
  RefreshCw,
  FileText,
  TrendingUp,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  BarChart3
} from 'lucide-react';
import { useRouter } from 'next/navigation';

// Detailed coverage data (would come from actual coverage reports)
const DETAILED_COVERAGE = {
                  summary: {
    statements: { covered: 170, total: 200, percentage: 85.20 },
    branches: { covered: 107, total: 120, percentage: 89.50 },
    functions: { covered: 55, total: 70, percentage: 78.80 },
    lines: { covered: 170, total: 200, percentage: 85.20 }
  },
    branches: { covered: 107, total: 120, percentage: 89.50 },
    functions: { covered: 55, total: 70, percentage: 78.80 },
    lines: { covered: 170, total: 200, percentage: 85.20 }
  },
    branches: { covered: 107, total: 120, percentage: 89.50 },
    functions: { covered: 55, total: 70, percentage: 78.80 },
    lines: { covered: 170, total: 200, percentage: 85.20 }
  },
    branches: { covered: 107, total: 120, percentage: 89.50 },
    functions: { covered: 55, total: 70, percentage: 78.80 },
    lines: { covered: 170, total: 200, percentage: 85.20 }
  },
    branches: { covered: 107, total: 120, percentage: 89.50 },
    functions: { covered: 55, total: 70, percentage: 78.80 },
    lines: { covered: 170, total: 200, percentage: 85.20 }
  },
    branches: { covered: 107, total: 120, percentage: 89.50 },
    functions: { covered: 55, total: 70, percentage: 78.80 },
    lines: { covered: 170, total: 200, percentage: 85.20 }
  },
    branches: { covered: 107, total: 120, percentage: 89.50 },
    functions: { covered: 55, total: 70, percentage: 78.80 },
    lines: { covered: 170, total: 200, percentage: 85.20 }
  },
    branches: { covered: 107, total: 120, percentage: 89.50 },
    functions: { covered: 55, total: 70, percentage: 78.80 },
    lines: { covered: 170, total: 200, percentage: 85.20 }
  },
    branches: { covered: 107, total: 120, percentage: 89.50 },
    functions: { covered: 55, total: 70, percentage: 78.80 },
    lines: { covered: 170, total: 200, percentage: 85.20 }
  },
  files: [
    {
      name: 'lib/hooks/useCards.js',
      path: '/lib/hooks/useCards.js',
      statements: { covered: 137, total: 140, percentage: 97.86 },
      branches: { covered: 32, total: 34, percentage: 94.11 },
      functions: { covered: 15, total: 15, percentage: 100 },
      lines: { covered: 137, total: 140, percentage: 97.86 },
      uncoveredLines: [45, 78, 123]
    },
    {
      name: 'lib/hooks/useConversationControls.js',
      path: '/lib/hooks/useConversationControls.js',
      statements: { covered: 89, total: 89, percentage: 100 },
      branches: { covered: 41, total: 46, percentage: 89.13 },
      functions: { covered: 12, total: 12, percentage: 100 },
      lines: { covered: 89, total: 89, percentage: 100 },
      uncoveredLines: []
    },
    {
      name: 'lib/hooks/useBoardDnD.js',
      path: '/lib/hooks/useBoardDnD.js',
      statements: { covered: 156, total: 156, percentage: 100 },
      branches: { covered: 29, total: 36, percentage: 80.56 },
      functions: { covered: 18, total: 18, percentage: 100 },
      lines: { covered: 156, total: 156, percentage: 100 },
      uncoveredLines: []
    },
    {
      name: 'components/ui/card.jsx',
      path: '/components/ui/card.jsx',
      statements: { covered: 32, total: 32, percentage: 100 },
      branches: { covered: 20, total: 20, percentage: 100 },
      functions: { covered: 7, total: 7, percentage: 100 },
      lines: { covered: 32, total: 32, percentage: 100 },
      uncoveredLines: []
    },
    {
      name: 'lib/utils.js',
      path: '/lib/utils.js',
      statements: { covered: 16, total: 16, percentage: 100 },
      branches: { covered: 8, total: 8, percentage: 100 },
      functions: { covered: 1, total: 1, percentage: 100 },
      lines: { covered: 16, total: 16, percentage: 100 },
      uncoveredLines: []
    },
    {
      name: 'app/api/cards/route.js',
      path: '/app/api/cards/route.js',
      statements: { covered: 148, total: 156, percentage: 94.87 },
      branches: { covered: 36, total: 39, percentage: 92.31 },
      functions: { covered: 4, total: 4, percentage: 100 },
      lines: { covered: 148, total: 156, percentage: 94.87 },
      uncoveredLines: [42, 68, 112, 150]
    },
    {
      name: 'app/api/conversations/[id]/events/route.js',
      path: '/app/api/conversations/[id]/events/route.js',
      statements: { covered: 23, total: 23, percentage: 100 },
      branches: { covered: 6, total: 7, percentage: 85.71 },
      functions: { covered: 3, total: 3, percentage: 100 },
      lines: { covered: 23, total: 23, percentage: 100 },
      uncoveredLines: []
    },
    {
      name: 'lib/db/database.js',
      path: '/lib/db/database.js',
      statements: { covered: 156, total: 168, percentage: 92.86 },
      branches: { covered: 24, total: 27, percentage: 88.89 },
      functions: { covered: 6, total: 6, percentage: 100 },
      lines: { covered: 156, total: 168, percentage: 92.86 },
      uncoveredLines: [45, 78, 111, 135, 158]
    }
  ],
  testHistory: [
                                        { date: '2025-08-14T20:22:51.214Z', totalTests: 160, passed: 160, failed: 0, duration: 0 },
    { date: '2025-08-14T20:22:48.688Z', totalTests: 160, passed: 159, failed: 1, duration: 0 },
    { date: '2025-08-14T20:22:46.075Z', totalTests: 160, passed: 159, failed: 1, duration: 0 },
    { date: '2025-08-14T20:22:43.496Z', totalTests: 160, passed: 159, failed: 1, duration: 0 },
    { date: '2025-08-14T20:22:40.980Z', totalTests: 160, passed: 160, failed: 0, duration: 0 },
    { date: '2025-08-14T20:22:38.400Z', totalTests: 160, passed: 160, failed: 0, duration: 0 },
    { date: '2025-08-14T20:22:35.691Z', totalTests: 160, passed: 160, failed: 0, duration: 0 },
    { date: '2025-08-14T20:22:33.132Z', totalTests: 160, passed: 160, failed: 0, duration: 0 },
    { date: '2025-08-14T20:07:17.579Z', totalTests: 160, passed: 160, failed: 0, duration: 0 },
    { date: '2025-08-14T20:35:00Z', totalTests: 160, passed: 160, failed: 0, duration: 4.25 },
    { date: '2025-08-14T20:15:00Z', totalTests: 152, passed: 152, failed: 0, duration: 3.95 },
    { date: '2025-08-14T19:30:00Z', totalTests: 94, passed: 94, failed: 0, duration: 2.15 },
    { date: '2025-08-14T18:45:00Z', totalTests: 57, passed: 55, failed: 2, duration: 2.1 },
    { date: '2025-08-14T17:20:00Z', totalTests: 54, passed: 54, failed: 0, duration: 1.8 },
    { date: '2025-08-14T16:10:00Z', totalTests: 51, passed: 48, failed: 3, duration: 2.3 },
    { date: '2025-08-14T15:30:00Z', totalTests: 45, passed: 45, failed: 0, duration: 1.5 }
  ]
};

function CoverageMetricCard({ title, metric, icon: Icon }) {
  const getColorClass = (percentage) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <Card className="p-4 bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-stone-400 dark:text-stone-500 dark:text-stone-400" />
          <span className="text-sm font-medium text-stone-600 dark:text-stone-300">{title}</span>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-bold ${getColorClass(metric.percentage)}`}>
          {metric.percentage.toFixed(1)}%
        </div>
      </div>
      <div className="flex items-center justify-between text-sm text-stone-400 dark:text-stone-500 dark:text-stone-400">
        <span>{metric.covered} / {metric.total}</span>
        <span className="text-xs">
          {metric.total - metric.covered} uncovered
        </span>
      </div>
      <div className="mt-2 w-full bg-stone-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${
            metric.percentage >= 90 ? 'bg-green-500' : 
            metric.percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${metric.percentage}%` }}
        ></div>
      </div>
    </Card>
  );
}

function FileRow({ file }) {
  const getStatusIcon = (percentage) => {
    if (percentage >= 90) return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (percentage >= 70) return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  const getColorClass = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <tr className="border-b border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {getStatusIcon(file.statements.percentage)}
          <span className="font-mono text-sm">{file.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <span className={`font-bold ${getColorClass(file.statements.percentage)}`}>
          {file.statements.percentage.toFixed(1)}%
        </span>
        <div className="text-xs text-stone-400 dark:text-stone-500">
          {file.statements.covered}/{file.statements.total}
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <span className={`font-bold ${getColorClass(file.branches.percentage)}`}>
          {file.branches.percentage.toFixed(1)}%
        </span>
        <div className="text-xs text-stone-400 dark:text-stone-500">
          {file.branches.covered}/{file.branches.total}
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <span className={`font-bold ${getColorClass(file.functions.percentage)}`}>
          {file.functions.percentage.toFixed(1)}%
        </span>
        <div className="text-xs text-stone-400 dark:text-stone-500">
          {file.functions.covered}/{file.functions.total}
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <span className={`font-bold ${getColorClass(file.lines.percentage)}`}>
          {file.lines.percentage.toFixed(1)}%
        </span>
        <div className="text-xs text-stone-400 dark:text-stone-500">
          {file.lines.covered}/{file.lines.total}
        </div>
      </td>
      <td className="px-4 py-3 text-right text-xs text-stone-400 dark:text-stone-500">
        {file.uncoveredLines.length > 0 ? (
          <details className="cursor-pointer">
            <summary>{file.uncoveredLines.length} lines</summary>
            <div className="mt-1 text-xs text-stone-400 dark:text-stone-500 dark:text-stone-400">
              Lines: {file.uncoveredLines.join(', ')}
            </div>
          </details>
        ) : (
          <span className="text-green-600">All covered</span>
        )}
      </td>
    </tr>
  );
}

export default function CoverageReportPage() {
  const [trayOpen, setTrayOpen] = useState(false);
  const router = useRouter();

  const rightControls = (
    <>
      <Button 
        variant="outline"
        onClick={() => router.push('/dev/tests')}
        className="h-[40px] leading-none"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Tests
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
        title="The Stack | D.O.C"
        subtitle="Full Coverage Report"
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CoverageMetricCard 
              title="Statements" 
              metric={DETAILED_COVERAGE.summary.statements}
              icon={FileText}
            />
            <CoverageMetricCard 
              title="Branches" 
              metric={DETAILED_COVERAGE.summary.branches}
              icon={TrendingUp}
            />
            <CoverageMetricCard 
              title="Functions" 
              metric={DETAILED_COVERAGE.summary.functions}
              icon={BarChart3}
            />
            <CoverageMetricCard 
              title="Lines" 
              metric={DETAILED_COVERAGE.summary.lines}
              icon={Calendar}
            />
          </div>

          {/* Test History */}
          <Card className="p-6 bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700">
            <h3 className="text-lg font-semibold mb-4">Recent Test Runs</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-700 text-left">
                    <th className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300">Date & Time</th>
                    <th className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300">Total Tests</th>
                    <th className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300">Passed</th>
                    <th className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300">Failed</th>
                    <th className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300">Duration</th>
                    <th className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300">Success Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {DETAILED_COVERAGE.testHistory.map((run, index) => (
                    <tr key={index} className="border-b border-stone-200 dark:border-stone-700">
                      <td className="px-4 py-3 text-sm font-mono">
                        {new Date(run.date).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">{run.totalTests}</td>
                      <td className="px-4 py-3 text-sm text-green-600 font-bold">{run.passed}</td>
                      <td className="px-4 py-3 text-sm text-red-600 font-bold">{run.failed}</td>
                      <td className="px-4 py-3 text-sm">{run.duration}s</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`font-bold ${
                          run.failed === 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {((run.passed / run.totalTests) * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* File-by-File Coverage */}
          <Card className="p-6 bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700">
            <h3 className="text-lg font-semibold mb-4">File Coverage Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-700 text-left">
                    <th className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300">File</th>
                    <th className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 text-right">Statements</th>
                    <th className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 text-right">Branches</th>
                    <th className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 text-right">Functions</th>
                    <th className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 text-right">Lines</th>
                    <th className="px-4 py-2 text-sm font-medium text-stone-600 dark:text-stone-300 text-right">Uncovered</th>
                  </tr>
                </thead>
                <tbody>
                  {DETAILED_COVERAGE.files.map((file, index) => (
                    <FileRow key={index} file={file} />
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Coverage Insights */}
          <Card className="p-6 bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700">
            <h3 className="text-lg font-semibold mb-4">Coverage Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-stone-600 dark:text-stone-300 mb-2">High Coverage Files (≥90%)</h4>
                <ul className="space-y-1">
                  {DETAILED_COVERAGE.files
                    .filter(f => f.statements.percentage >= 90)
                    .map((file, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span className="font-mono">{file.name}</span>
                        <span className="text-green-600 font-bold">
                          {file.statements.percentage.toFixed(1)}%
                        </span>
                      </li>
                    ))
                  }
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-stone-600 dark:text-stone-300 mb-2">Needs Attention (&lt;70%)</h4>
                <ul className="space-y-1">
                  {DETAILED_COVERAGE.files
                    .filter(f => f.statements.percentage < 70)
                    .map((file, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <XCircle className="w-3 h-3 text-red-500" />
                        <span className="font-mono">{file.name}</span>
                        <span className="text-red-600 font-bold">
                          {file.statements.percentage.toFixed(1)}%
                        </span>
                      </li>
                    ))
                  }
                </ul>
              </div>
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
        title="Dev Menu"
      />
    </div>
  );
}