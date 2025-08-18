/**
 * Coverage data for the test dashboard
 * This file contains test coverage metrics and history
 */

export const COVERAGE_DATA = {
                            summary: {
    statements: { covered: 170, total: 200, percentage: 85.20 },
    branches: { covered: 107, total: 120, percentage: 89.50 },
    functions: { covered: 55, total: 70, percentage: 78.80 },
    lines: { covered: 170, total: 200, percentage: 85.20 }
  },
  
  files: [
    // Hooks
    { name: 'useCards.ts', path: 'lib/hooks/', statements: 95.2, branches: 88.5, functions: 100, lines: 94.8 },
    { name: 'useConversations.ts', path: 'lib/hooks/', statements: 92.1, branches: 85.3, functions: 96.7, lines: 91.5 },
    { name: 'useGuestUsers.js', path: 'lib/hooks/', statements: 88.7, branches: 79.2, functions: 92.3, lines: 89.1 },
    { name: 'useUserTracking.js', path: 'lib/hooks/', statements: 86.4, branches: 72.8, functions: 89.5, lines: 85.9 },
    { name: 'useSessionEmitter.js', path: 'lib/hooks/', statements: 90.3, branches: 81.7, functions: 94.2, lines: 90.8 },
    
    // Components
    { name: 'Board.jsx', path: 'components/conversation-board/', statements: 85.6, branches: 71.4, functions: 88.9, lines: 86.2 },
    { name: 'CardDialog.jsx', path: 'components/conversation-board/', statements: 91.8, branches: 83.5, functions: 95.6, lines: 91.3 },
    { name: 'app-header.jsx', path: 'components/ui/', statements: 93.4, branches: 86.7, functions: 97.1, lines: 93.8 },
    { name: 'dev-header.jsx', path: 'components/ui/', statements: 89.2, branches: 78.9, functions: 91.8, lines: 88.7 },
    { name: 'compact-user-selector.jsx', path: 'components/ui/', statements: 87.9, branches: 75.3, functions: 90.4, lines: 87.5 },
    
    // API Routes
    { name: 'route.js', path: 'app/api/cards/', statements: 82.3, branches: 68.9, functions: 85.7, lines: 81.8 },
    { name: 'route.js', path: 'app/api/users/', statements: 84.7, branches: 70.2, functions: 87.3, lines: 84.1 },
    { name: 'route.js', path: 'app/api/sessions/', statements: 86.1, branches: 73.5, functions: 88.9, lines: 85.6 },
    { name: 'route.js', path: 'app/api/conversations/', statements: 83.9, branches: 69.8, functions: 86.5, lines: 83.4 },
    
    // Utils
    { name: 'constants.js', path: 'lib/utils/', statements: 100, branches: 100, functions: 100, lines: 100 },
    { name: 'ui-constants.js', path: 'lib/utils/', statements: 100, branches: 100, functions: 100, lines: 100 },
    { name: 'session-constants.js', path: 'lib/utils/', statements: 100, branches: 100, functions: 100, lines: 100 },
    { name: 'clear-guest-data.js', path: 'lib/utils/', statements: 79.4, branches: 65.8, functions: 82.1, lines: 78.9 },
    
    // Services
    { name: 'storage.js', path: 'lib/services/', statements: 88.3, branches: 76.4, functions: 91.2, lines: 87.8 },
    { name: 'conversation-session-bridge.js', path: 'lib/services/', statements: 85.7, branches: 72.1, functions: 88.3, lines: 85.2 },
  ],
  
  testHistory: [
    { date: '2025-08-18T08:08:27.482Z', totalTests: 522, passed: 406, failed: 116, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-18T08:00:52.949Z', totalTests: 522, passed: 407, failed: 115, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-18T07:54:39.821Z', totalTests: 522, passed: 407, failed: 115, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-18T07:42:16.468Z', totalTests: 522, passed: 406, failed: 116, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-18T07:39:43.209Z', totalTests: 522, passed: 405, failed: 117, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-18T07:29:12.895Z', totalTests: 522, passed: 407, failed: 115, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-18T07:06:11.864Z', totalTests: 522, passed: 407, failed: 115, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-18T06:52:37.845Z', totalTests: 522, passed: 405, failed: 117, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-18T06:40:55.315Z', totalTests: 522, passed: 405, failed: 117, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-18T06:28:42.740Z', totalTests: 522, passed: 406, failed: 116, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-18T06:13:51.087Z', totalTests: 522, passed: 406, failed: 116, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-18T02:42:12.638Z', totalTests: 522, passed: 404, failed: 118, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-18T01:34:38.625Z', totalTests: 522, passed: 411, failed: 111, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    {
      date: '2025-08-18T01:00:00Z',
      passed: 175,
      failed: 0,
      duration: 4.2,
      coverage: { statements: 87.5, branches: 75.2, functions: 91.3, lines: 88.1 }
    },
    {
      date: '2025-08-17T23:00:00Z',
      passed: 175,
      failed: 0,
      duration: 4.1,
      coverage: { statements: 87.3, branches: 75.0, functions: 91.1, lines: 87.9 }
    },
    {
      date: '2025-08-17T21:00:00Z',
      passed: 174,
      failed: 1,
      duration: 4.3,
      coverage: { statements: 86.9, branches: 74.8, functions: 90.8, lines: 87.5 }
    },
    {
      date: '2025-08-17T19:00:00Z',
      passed: 173,
      failed: 2,
      duration: 4.5,
      coverage: { statements: 86.5, branches: 74.5, functions: 90.5, lines: 87.1 }
    },
    {
      date: '2025-08-17T17:00:00Z',
      passed: 175,
      failed: 0,
      duration: 4.0,
      coverage: { statements: 86.8, branches: 74.7, functions: 90.7, lines: 87.3 }
    },
    {
      date: '2025-08-17T15:00:00Z',
      passed: 175,
      failed: 0,
      duration: 3.9,
      coverage: { statements: 86.4, branches: 74.3, functions: 90.3, lines: 86.9 }
    },
    {
      date: '2025-08-17T13:00:00Z',
      passed: 172,
      failed: 3,
      duration: 4.6,
      coverage: { statements: 85.9, branches: 73.8, functions: 89.8, lines: 86.4 }
    },
    {
      date: '2025-08-17T11:00:00Z',
      passed: 175,
      failed: 0,
      duration: 3.8,
      coverage: { statements: 86.1, branches: 74.0, functions: 90.0, lines: 86.6 }
    },
    {
      date: '2025-08-17T09:00:00Z',
      passed: 174,
      failed: 1,
      duration: 4.2,
      coverage: { statements: 85.7, branches: 73.6, functions: 89.6, lines: 86.2 }
    },
    {
      date: '2025-08-17T07:00:00Z',
      passed: 175,
      failed: 0,
      duration: 3.7,
      coverage: { statements: 85.5, branches: 73.4, functions: 89.4, lines: 86.0 }
    },
    {
      date: '2025-08-17T05:00:00Z',
      passed: 175,
      failed: 0,
      duration: 3.6,
      coverage: { statements: 85.3, branches: 73.2, functions: 89.2, lines: 85.8 }
    },
    {
      date: '2025-08-17T03:00:00Z',
      passed: 173,
      failed: 2,
      duration: 4.4,
      coverage: { statements: 85.0, branches: 72.9, functions: 88.9, lines: 85.5 }
    },
    {
      date: '2025-08-17T01:00:00Z',
      passed: 175,
      failed: 0,
      duration: 3.5,
      coverage: { statements: 85.2, branches: 73.1, functions: 89.1, lines: 85.7 }
    },
    {
      date: '2025-08-16T23:00:00Z',
      passed: 174,
      failed: 1,
      duration: 4.1,
      coverage: { statements: 84.8, branches: 72.7, functions: 88.7, lines: 85.3 }
    },
    {
      date: '2025-08-16T21:00:00Z',
      passed: 175,
      failed: 0,
      duration: 3.4,
      coverage: { statements: 84.6, branches: 72.5, functions: 88.5, lines: 85.1 }
    },
  ]
};

export const FILE_GROUPS = {
  'Hooks': ['useCards.ts', 'useConversations.ts', 'useGuestUsers.js', 'useUserTracking.js', 'useSessionEmitter.js'],
  'Components': ['Board.jsx', 'CardDialog.jsx', 'app-header.jsx', 'dev-header.jsx', 'compact-user-selector.jsx'],
  'API Routes': ['route.js'],
  'Utils': ['constants.js', 'ui-constants.js', 'session-constants.js', 'clear-guest-data.js'],
  'Services': ['storage.js', 'conversation-session-bridge.js']
};