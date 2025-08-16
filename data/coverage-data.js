/**
 * Coverage Data File
 * 
 * This file contains all test coverage data that is automatically updated
 * by the post-commit hook. The coverage page imports this data rather than
 * having it hardcoded inline.
 * 
 * DO NOT EDIT MANUALLY - This file is auto-generated
 */

// Functional groupings for files
export const FILE_GROUPS = {
  'Core Board Functionality': [
    'lib/hooks/useBoardDnD.js',
    'lib/hooks/useExpansionState.js',
    'components/conversation-board/Board.jsx',
    'components/conversation-board/BoardCanvas.jsx',
    'components/conversation-board/Zone.jsx'
  ],
  'Conversation Cards': [
    'lib/hooks/useCards.js',
    'lib/hooks/useConversationControls.js',
    'components/conversation-board/ConversationCard.jsx',
    'components/conversation-board/FlippableCard.jsx',
    'components/conversation-board/CardFace.jsx',
    'components/conversation-board/CardBack.jsx',
    'lib/utils/card-stack-logic.js'
  ],
  'Timeline & Events': [
    'lib/utils/timelineConstants.js',
    'lib/utils/timelineEvents.js',
    'lib/utils/timelineFormatters.js',
    'lib/utils/timelineStyles.js',
    'lib/utils/timelineTree.js',
    'components/timeline/TimelineNode.jsx',
    'components/timeline/ConversationTimeline.jsx',
    'components/timeline/TreeTimeline.jsx'
  ],
  'API & Data': [
    'app/api/cards/route.js',
    'app/api/cards/flip/route.js',
    'app/api/conversations/[id]/events/route.js',
    'lib/db/database.js'
  ],
  'Authentication & Security': [
    'lib/auth/session.js',
    'lib/auth/permissions.js'
  ],
  'UI Components': [
    'components/ui/card.jsx',
    'components/ui/compact-user-selector.jsx',
    'components/ui/conversation-controls.jsx',
    'lib/utils.js'
  ],
  'Tests': [
    '__tests__/ui-regression/responsive-layout.test.jsx',
    '__tests__/ui-regression/drag-drop-visual.test.jsx',
    '__tests__/ui-regression/card-flip-visual.test.jsx',
    '__tests__/unit/components/FlippableCard.test.jsx',
    '__tests__/integration/api/cards-flip.test.js'
  ]
};

// Detailed coverage data
export const COVERAGE_DATA = {
            summary: {
    statements: { covered: 170, total: 200, percentage: 85.20 },
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
    },
    {
      name: 'lib/hooks/useExpansionState.js',
      path: '/lib/hooks/useExpansionState.js',
      statements: { covered: 42, total: 42, percentage: 100 },
      branches: { covered: 18, total: 18, percentage: 100 },
      functions: { covered: 7, total: 7, percentage: 100 },
      lines: { covered: 42, total: 42, percentage: 100 },
      uncoveredLines: []
    },
    {
      name: 'lib/utils/timelineConstants.js',
      path: '/lib/utils/timelineConstants.js',
      statements: { covered: 28, total: 28, percentage: 100 },
      branches: { covered: 12, total: 12, percentage: 100 },
      functions: { covered: 3, total: 3, percentage: 100 },
      lines: { covered: 28, total: 28, percentage: 100 },
      uncoveredLines: []
    },
    {
      name: 'lib/utils/timelineEvents.js',
      path: '/lib/utils/timelineEvents.js',
      statements: { covered: 45, total: 45, percentage: 100 },
      branches: { covered: 23, total: 24, percentage: 95.83 },
      functions: { covered: 4, total: 4, percentage: 100 },
      lines: { covered: 45, total: 45, percentage: 100 },
      uncoveredLines: []
    },
    {
      name: 'lib/utils/timelineFormatters.js',
      path: '/lib/utils/timelineFormatters.js',
      statements: { covered: 34, total: 34, percentage: 100 },
      branches: { covered: 10, total: 11, percentage: 90.91 },
      functions: { covered: 6, total: 6, percentage: 100 },
      lines: { covered: 34, total: 34, percentage: 100 },
      uncoveredLines: []
    },
    {
      name: 'lib/utils/timelineStyles.js',
      path: '/lib/utils/timelineStyles.js',
      statements: { covered: 21, total: 22, percentage: 95.45 },
      branches: { covered: 6, total: 7, percentage: 85.71 },
      functions: { covered: 2, total: 2, percentage: 100 },
      lines: { covered: 21, total: 22, percentage: 95.45 },
      uncoveredLines: [18]
    },
    {
      name: 'lib/utils/timelineTree.js',
      path: '/lib/utils/timelineTree.js',
      statements: { covered: 67, total: 72, percentage: 93.06 },
      branches: { covered: 28, total: 32, percentage: 87.50 },
      functions: { covered: 8, total: 8, percentage: 100 },
      lines: { covered: 67, total: 72, percentage: 93.06 },
      uncoveredLines: [23, 45, 78, 95, 112]
    },
    {
      name: 'components/timeline/TimelineNode.jsx',
      path: '/components/timeline/TimelineNode.jsx',
      statements: { covered: 48, total: 52, percentage: 92.31 },
      branches: { covered: 15, total: 18, percentage: 83.33 },
      functions: { covered: 4, total: 4, percentage: 100 },
      lines: { covered: 48, total: 52, percentage: 92.31 },
      uncoveredLines: [15, 28, 45, 67]
    },
    {
      name: 'components/timeline/ConversationTimeline.jsx',
      path: '/components/timeline/ConversationTimeline.jsx',
      statements: { covered: 64, total: 72, percentage: 88.89 },
      branches: { covered: 16, total: 20, percentage: 80.00 },
      functions: { covered: 5, total: 5, percentage: 100 },
      lines: { covered: 64, total: 72, percentage: 88.89 },
      uncoveredLines: [32, 56, 78, 91, 105, 118, 134, 167]
    },
    {
      name: 'components/timeline/TreeTimeline.jsx',
      path: '/components/timeline/TreeTimeline.jsx',
      statements: { covered: 89, total: 96, percentage: 92.71 },
      branches: { covered: 22, total: 26, percentage: 84.62 },
      functions: { covered: 6, total: 6, percentage: 100 },
      lines: { covered: 89, total: 96, percentage: 92.71 },
      uncoveredLines: [45, 78, 112, 134, 156, 189, 203]
    },
    {
      name: 'lib/auth/session.js',
      path: '/lib/auth/session.js',
      statements: { covered: 40, total: 42, percentage: 95.24 },
      branches: { covered: 14, total: 16, percentage: 87.50 },
      functions: { covered: 8, total: 8, percentage: 100 },
      lines: { covered: 40, total: 42, percentage: 95.24 },
      uncoveredLines: [45, 78]
    },
    {
      name: 'lib/auth/permissions.js',
      path: '/lib/auth/permissions.js',
      statements: { covered: 36, total: 36, percentage: 100 },
      branches: { covered: 17, total: 18, percentage: 94.44 },
      functions: { covered: 9, total: 9, percentage: 100 },
      lines: { covered: 36, total: 36, percentage: 100 },
      uncoveredLines: []
    },
    {
      name: 'components/ui/compact-user-selector.jsx',
      path: '/components/ui/compact-user-selector.jsx',
      statements: { covered: 52, total: 58, percentage: 89.66 },
      branches: { covered: 11, total: 14, percentage: 78.57 },
      functions: { covered: 7, total: 7, percentage: 100 },
      lines: { covered: 52, total: 58, percentage: 89.66 },
      uncoveredLines: [67, 89, 134]
    },
    {
      name: 'components/ui/conversation-controls.jsx',
      path: '/components/ui/conversation-controls.jsx',
      statements: { covered: 24, total: 24, percentage: 100 },
      branches: { covered: 6, total: 7, percentage: 85.71 },
      functions: { covered: 3, total: 3, percentage: 100 },
      lines: { covered: 24, total: 24, percentage: 100 },
      uncoveredLines: []
    },
    {
      name: '__tests__/ui-regression/responsive-layout.test.jsx',
      path: '/__tests__/ui-regression/responsive-layout.test.jsx',
      statements: { covered: 13, total: 13, percentage: 100 },
      branches: { covered: 8, total: 8, percentage: 100 },
      functions: { covered: 13, total: 13, percentage: 100 },
      lines: { covered: 13, total: 13, percentage: 100 },
      uncoveredLines: []
    },
    {
      name: '__tests__/ui-regression/drag-drop-visual.test.jsx',
      path: '/__tests__/ui-regression/drag-drop-visual.test.jsx',
      statements: { covered: 13, total: 13, percentage: 100 },
      branches: { covered: 6, total: 6, percentage: 100 },
      functions: { covered: 13, total: 13, percentage: 100 },
      lines: { covered: 13, total: 13, percentage: 100 },
      uncoveredLines: []
    }
  ],
  // Test history - Auto-updated by post-commit hook
  testHistory: [
    { date: '2025-08-16T23:37:42.098Z', totalTests: 454, passed: 361, failed: 93, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-16T23:36:57.081Z', totalTests: 454, passed: 358, failed: 96, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-16T23:36:15.954Z', totalTests: 454, passed: 361, failed: 93, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-16T23:28:13.133Z', totalTests: 454, passed: 358, failed: 96, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-16T23:24:21.882Z', totalTests: 454, passed: 364, failed: 90, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-16T21:39:33.665Z', totalTests: 454, passed: 357, failed: 97, duration: 0, coverage: { statements: 84.8, branches: 89.2, functions: 78.5, lines: 84.8 } },
    { date: '2025-08-16T20:57:38.539Z', totalTests: 454, passed: 364, failed: 90, duration: 0, coverage: { statements: 85.1, branches: 89.4, functions: 78.7, lines: 85.1 } },
    { date: '2025-08-16T18:36:55.310Z', totalTests: 454, passed: 366, failed: 88, duration: 0, coverage: { statements: 85.3, branches: 89.6, functions: 78.9, lines: 85.3 } },
    { date: '2025-08-16T16:55:19.315Z', totalTests: 423, passed: 352, failed: 71, duration: 0, coverage: { statements: 84.5, branches: 88.8, functions: 78.2, lines: 84.5 } },
    { date: '2025-08-16T04:38:53.196Z', totalTests: 423, passed: 350, failed: 73, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-16T04:31:32.008Z', totalTests: 423, passed: 350, failed: 73, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-16T04:12:18.553Z', totalTests: 423, passed: 351, failed: 72, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-16T03:54:11.626Z', totalTests: 423, passed: 350, failed: 73, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-16T03:43:09.185Z', totalTests: 423, passed: 351, failed: 72, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-16T03:12:05.671Z', totalTests: 423, passed: 351, failed: 72, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-16T00:59:39.445Z', totalTests: 423, passed: 351, failed: 72, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-16T00:48:43.777Z', totalTests: 423, passed: 355, failed: 68, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-16T00:40:19.450Z', totalTests: 423, passed: 338, failed: 85, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-15T23:49:10.224Z', totalTests: 423, passed: 356, failed: 67, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-15T21:46:32.625Z', totalTests: 423, passed: 397, failed: 26, duration: 6.26, coverage: { statements: 88.5, branches: 92.1, functions: 82.3, lines: 88.5 } },
    { date: '2025-08-15T21:25:22.585Z', totalTests: 397, passed: 324, failed: 73, duration: 0, coverage: { statements: 83.5, branches: 87.8, functions: 77.4, lines: 83.5 } },
    { date: '2025-08-15T17:54:30.464Z', totalTests: 397, passed: 322, failed: 75, duration: 0, coverage: { statements: 83.3, branches: 87.6, functions: 77.2, lines: 83.3 } },
    { date: '2025-08-15T17:40:49.036Z', totalTests: 397, passed: 321, failed: 76, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-15T17:27:57.562Z', totalTests: 397, passed: 323, failed: 74, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-15T17:20:38.405Z', totalTests: 397, passed: 328, failed: 69, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-15T15:50:39.306Z', totalTests: 334, passed: 308, failed: 26, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-15T15:40:16.369Z', totalTests: 319, passed: 295, failed: 24, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-15T15:32:18.067Z', totalTests: 312, passed: 291, failed: 21, duration: 0, coverage: { statements: 85.2, branches: 89.5, functions: 78.8, lines: 85.2 } },
    { date: '2025-08-15T15:24:44.005Z', totalTests: 275, passed: 275, failed: 0, duration: 0, coverage: { statements: 91.2, branches: 94.5, functions: 85.3, lines: 91.2 } },
    { date: '2025-08-15T14:55:14.474Z', totalTests: 239, passed: 239, failed: 0, duration: 0, coverage: { statements: 91.5, branches: 94.8, functions: 85.6, lines: 91.5 } },





  ]
};

export default COVERAGE_DATA;