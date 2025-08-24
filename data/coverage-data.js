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
    { date: '2025-08-24T14:49:39.652Z', totalTests: 623, passed: 458, failed: 165, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-24T14:47:34.080Z', totalTests: 623, passed: 458, failed: 165, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-24T05:07:15.841Z', totalTests: 623, passed: 462, failed: 161, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-24T05:00:12.755Z', totalTests: 623, passed: 459, failed: 164, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-24T04:34:34.511Z', totalTests: 623, passed: 462, failed: 161, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-23T23:39:07.956Z', totalTests: 623, passed: 462, failed: 161, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-23T17:38:58.267Z', totalTests: 623, passed: 460, failed: 163, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-23T00:13:01.853Z', totalTests: 623, passed: 459, failed: 164, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-23T00:07:40.563Z', totalTests: 623, passed: 461, failed: 162, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-22T03:46:47.388Z', totalTests: 623, passed: 462, failed: 161, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-21T22:30:02.297Z', totalTests: 623, passed: 457, failed: 166, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-21T21:44:40.890Z', totalTests: 623, passed: 458, failed: 165, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-21T18:30:20.534Z', totalTests: 623, passed: 463, failed: 160, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-21T16:12:21.475Z', totalTests: 623, passed: 463, failed: 160, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-21T15:41:16.830Z', totalTests: 604, passed: 442, failed: 162, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-21T15:33:34.400Z', totalTests: 604, passed: 442, failed: 162, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-21T15:03:22.015Z', totalTests: 571, passed: 410, failed: 161, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-21T15:01:35.337Z', totalTests: 571, passed: 407, failed: 164, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-21T06:59:56.684Z', totalTests: 571, passed: 407, failed: 164, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-21T04:53:30.402Z', totalTests: 571, passed: 409, failed: 162, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-21T04:49:47.416Z', totalTests: 571, passed: 407, failed: 164, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-21T04:26:21.405Z', totalTests: 571, passed: 407, failed: 164, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-21T04:11:14.932Z', totalTests: 571, passed: 409, failed: 162, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-21T03:54:54.241Z', totalTests: 571, passed: 409, failed: 162, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-21T03:40:11.126Z', totalTests: 571, passed: 408, failed: 163, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-21T03:30:42.195Z', totalTests: 571, passed: 406, failed: 165, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-21T03:27:39.164Z', totalTests: 571, passed: 406, failed: 165, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-21T03:02:32.414Z', totalTests: 571, passed: 407, failed: 164, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-21T01:39:24.732Z', totalTests: 571, passed: 408, failed: 163, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-21T01:34:44.191Z', totalTests: 571, passed: 408, failed: 163, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },










































  ]
};

export const FILE_GROUPS = {
  'Hooks': ['useCards.ts', 'useConversations.ts', 'useGuestUsers.js', 'useUserTracking.js', 'useSessionEmitter.js'],
  'Components': ['Board.jsx', 'CardDialog.jsx', 'app-header.jsx', 'dev-header.jsx', 'compact-user-selector.jsx'],
  'API Routes': ['route.js'],
  'Utils': ['constants.js', 'ui-constants.js', 'session-constants.js', 'clear-guest-data.js'],
  'Services': ['storage.js', 'conversation-session-bridge.js']
};