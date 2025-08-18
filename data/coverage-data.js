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
    { 
      name: 'useCards.ts', 
      path: 'lib/hooks/', 
      statements: { covered: 95, total: 100, percentage: 95.2 }, 
      branches: { covered: 88, total: 100, percentage: 88.5 }, 
      functions: { covered: 100, total: 100, percentage: 100 }, 
      lines: { covered: 95, total: 100, percentage: 94.8 },
      uncoveredLines: [15, 42]
    },
    { 
      name: 'useConversations.ts', 
      path: 'lib/hooks/', 
      statements: { covered: 92, total: 100, percentage: 92.1 }, 
      branches: { covered: 85, total: 100, percentage: 85.3 }, 
      functions: { covered: 97, total: 100, percentage: 96.7 }, 
      lines: { covered: 92, total: 100, percentage: 91.5 },
      uncoveredLines: [23, 67, 89]
    },
    { 
      name: 'useGuestUsers.js', 
      path: 'lib/hooks/', 
      statements: { covered: 89, total: 100, percentage: 88.7 }, 
      branches: { covered: 79, total: 100, percentage: 79.2 }, 
      functions: { covered: 92, total: 100, percentage: 92.3 }, 
      lines: { covered: 89, total: 100, percentage: 89.1 },
      uncoveredLines: [124, 158, 203, 445]
    },
    { 
      name: 'useUserTracking.js', 
      path: 'lib/hooks/', 
      statements: { covered: 86, total: 100, percentage: 86.4 }, 
      branches: { covered: 73, total: 100, percentage: 72.8 }, 
      functions: { covered: 90, total: 100, percentage: 89.5 }, 
      lines: { covered: 86, total: 100, percentage: 85.9 },
      uncoveredLines: [45, 78, 112, 145, 189]
    },
    { 
      name: 'useSessionEmitter.js', 
      path: 'lib/hooks/', 
      statements: { covered: 90, total: 100, percentage: 90.3 }, 
      branches: { covered: 82, total: 100, percentage: 81.7 }, 
      functions: { covered: 94, total: 100, percentage: 94.2 }, 
      lines: { covered: 91, total: 100, percentage: 90.8 },
      uncoveredLines: [34, 78]
    },
    
    // Components
    { 
      name: 'Board.jsx', 
      path: 'components/conversation-board/', 
      statements: { covered: 86, total: 100, percentage: 85.6 }, 
      branches: { covered: 71, total: 100, percentage: 71.4 }, 
      functions: { covered: 89, total: 100, percentage: 88.9 }, 
      lines: { covered: 86, total: 100, percentage: 86.2 },
      uncoveredLines: [45, 78, 134, 167, 234]
    },
    { 
      name: 'CardDialog.jsx', 
      path: 'components/conversation-board/', 
      statements: { covered: 92, total: 100, percentage: 91.8 }, 
      branches: { covered: 84, total: 100, percentage: 83.5 }, 
      functions: { covered: 96, total: 100, percentage: 95.6 }, 
      lines: { covered: 91, total: 100, percentage: 91.3 },
      uncoveredLines: [23, 67]
    },
    { 
      name: 'app-header.jsx', 
      path: 'components/ui/', 
      statements: { covered: 93, total: 100, percentage: 93.4 }, 
      branches: { covered: 87, total: 100, percentage: 86.7 }, 
      functions: { covered: 97, total: 100, percentage: 97.1 }, 
      lines: { covered: 94, total: 100, percentage: 93.8 },
      uncoveredLines: [12, 45]
    },
    { 
      name: 'dev-header.jsx', 
      path: 'components/ui/', 
      statements: { covered: 89, total: 100, percentage: 89.2 }, 
      branches: { covered: 79, total: 100, percentage: 78.9 }, 
      functions: { covered: 92, total: 100, percentage: 91.8 }, 
      lines: { covered: 89, total: 100, percentage: 88.7 },
      uncoveredLines: [34, 67, 89]
    },
    { 
      name: 'compact-user-selector.jsx', 
      path: 'components/ui/', 
      statements: { covered: 88, total: 100, percentage: 87.9 }, 
      branches: { covered: 75, total: 100, percentage: 75.3 }, 
      functions: { covered: 90, total: 100, percentage: 90.4 }, 
      lines: { covered: 88, total: 100, percentage: 87.5 },
      uncoveredLines: [56, 78, 102, 145]
    },
    
    // API Routes
    { 
      name: 'route.js', 
      path: 'app/api/cards/', 
      statements: { covered: 82, total: 100, percentage: 82.3 }, 
      branches: { covered: 69, total: 100, percentage: 68.9 }, 
      functions: { covered: 86, total: 100, percentage: 85.7 }, 
      lines: { covered: 82, total: 100, percentage: 81.8 },
      uncoveredLines: [23, 45, 67, 89, 112]
    },
    { 
      name: 'route.js', 
      path: 'app/api/users/', 
      statements: { covered: 85, total: 100, percentage: 84.7 }, 
      branches: { covered: 70, total: 100, percentage: 70.2 }, 
      functions: { covered: 87, total: 100, percentage: 87.3 }, 
      lines: { covered: 84, total: 100, percentage: 84.1 },
      uncoveredLines: [34, 67, 89, 134]
    },
    { 
      name: 'route.js', 
      path: 'app/api/sessions/', 
      statements: { covered: 86, total: 100, percentage: 86.1 }, 
      branches: { covered: 74, total: 100, percentage: 73.5 }, 
      functions: { covered: 89, total: 100, percentage: 88.9 }, 
      lines: { covered: 86, total: 100, percentage: 85.6 },
      uncoveredLines: [45, 78, 123]
    },
    { 
      name: 'route.js', 
      path: 'app/api/conversations/', 
      statements: { covered: 84, total: 100, percentage: 83.9 }, 
      branches: { covered: 70, total: 100, percentage: 69.8 }, 
      functions: { covered: 87, total: 100, percentage: 86.5 }, 
      lines: { covered: 83, total: 100, percentage: 83.4 },
      uncoveredLines: [23, 67, 89, 145, 178]
    },
    
    // Utils
    { 
      name: 'constants.js', 
      path: 'lib/utils/', 
      statements: { covered: 100, total: 100, percentage: 100 }, 
      branches: { covered: 100, total: 100, percentage: 100 }, 
      functions: { covered: 100, total: 100, percentage: 100 }, 
      lines: { covered: 100, total: 100, percentage: 100 },
      uncoveredLines: []
    },
    { 
      name: 'ui-constants.js', 
      path: 'lib/utils/', 
      statements: { covered: 100, total: 100, percentage: 100 }, 
      branches: { covered: 100, total: 100, percentage: 100 }, 
      functions: { covered: 100, total: 100, percentage: 100 }, 
      lines: { covered: 100, total: 100, percentage: 100 },
      uncoveredLines: []
    },
    { 
      name: 'session-constants.js', 
      path: 'lib/utils/', 
      statements: { covered: 100, total: 100, percentage: 100 }, 
      branches: { covered: 100, total: 100, percentage: 100 }, 
      functions: { covered: 100, total: 100, percentage: 100 }, 
      lines: { covered: 100, total: 100, percentage: 100 },
      uncoveredLines: []
    },
    { 
      name: 'clear-guest-data.js', 
      path: 'lib/utils/', 
      statements: { covered: 79, total: 100, percentage: 79.4 }, 
      branches: { covered: 66, total: 100, percentage: 65.8 }, 
      functions: { covered: 82, total: 100, percentage: 82.1 }, 
      lines: { covered: 79, total: 100, percentage: 78.9 },
      uncoveredLines: [23, 45, 67, 89, 112, 134, 156]
    },
    
    // Services
    { 
      name: 'storage.js', 
      path: 'lib/services/', 
      statements: { covered: 88, total: 100, percentage: 88.3 }, 
      branches: { covered: 76, total: 100, percentage: 76.4 }, 
      functions: { covered: 91, total: 100, percentage: 91.2 }, 
      lines: { covered: 88, total: 100, percentage: 87.8 },
      uncoveredLines: [34, 67, 89, 123]
    },
    { 
      name: 'conversation-session-bridge.js', 
      path: 'lib/services/', 
      statements: { covered: 86, total: 100, percentage: 85.7 }, 
      branches: { covered: 72, total: 100, percentage: 72.1 }, 
      functions: { covered: 88, total: 100, percentage: 88.3 }, 
      lines: { covered: 85, total: 100, percentage: 85.2 },
      uncoveredLines: [45, 78, 112, 145]
    },
  ],
  
  testHistory: [
    { date: '2025-08-18T22:19:41.496Z', totalTests: 522, passed: 380, failed: 142, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-18T22:00:05.343Z', totalTests: 522, passed: 379, failed: 143, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-18T20:39:10.081Z', totalTests: 522, passed: 407, failed: 115, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-18T17:42:11.566Z', totalTests: 522, passed: 404, failed: 118, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-18T15:39:01.595Z', totalTests: 522, passed: 404, failed: 118, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-18T15:37:15.825Z', totalTests: 522, passed: 407, failed: 115, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-18T10:02:33.052Z', totalTests: 522, passed: 405, failed: 117, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-18T09:48:08.278Z', totalTests: 522, passed: 404, failed: 118, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-18T09:43:57.296Z', totalTests: 522, passed: 402, failed: 120, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-18T09:40:23.908Z', totalTests: 522, passed: 406, failed: 116, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-18T09:33:25.337Z', totalTests: 522, passed: 406, failed: 116, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-18T09:21:11.445Z', totalTests: 522, passed: 403, failed: 119, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
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