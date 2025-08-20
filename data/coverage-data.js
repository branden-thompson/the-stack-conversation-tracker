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
    { date: '2025-08-20T22:54:23.289Z', totalTests: 571, passed: 408, failed: 163, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-20T22:44:23.269Z', totalTests: 571, passed: 408, failed: 163, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-20T22:35:02.395Z', totalTests: 571, passed: 411, failed: 160, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-20T20:57:52.071Z', totalTests: 571, passed: 409, failed: 162, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-20T20:48:09.418Z', totalTests: 571, passed: 406, failed: 165, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-20T19:57:23.406Z', totalTests: 571, passed: 410, failed: 161, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-20T19:47:56.732Z', totalTests: 571, passed: 410, failed: 161, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-20T19:43:24.610Z', totalTests: 571, passed: 409, failed: 162, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-20T19:32:50.072Z', totalTests: 571, passed: 395, failed: 176, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-20T18:42:34.666Z', totalTests: 571, passed: 408, failed: 163, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-20T18:33:20.203Z', totalTests: 571, passed: 408, failed: 163, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-20T18:26:14.880Z', totalTests: 571, passed: 407, failed: 164, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-20T18:19:14.089Z', totalTests: 571, passed: 409, failed: 162, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-20T18:12:00.175Z', totalTests: 558, passed: 386, failed: 172, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-20T18:04:04.294Z', totalTests: 522, passed: 382, failed: 140, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-20T15:35:34.014Z', totalTests: 522, passed: 383, failed: 139, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
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











  ]
};

export const FILE_GROUPS = {
  'Hooks': ['useCards.ts', 'useConversations.ts', 'useGuestUsers.js', 'useUserTracking.js', 'useSessionEmitter.js'],
  'Components': ['Board.jsx', 'CardDialog.jsx', 'app-header.jsx', 'dev-header.jsx', 'compact-user-selector.jsx'],
  'API Routes': ['route.js'],
  'Utils': ['constants.js', 'ui-constants.js', 'session-constants.js', 'clear-guest-data.js'],
  'Services': ['storage.js', 'conversation-session-bridge.js']
};