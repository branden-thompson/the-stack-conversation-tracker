# Coverage Data Module

## Overview
This directory contains the centralized data files for test coverage and other metrics. All coverage-related UI components should import their data from these files rather than hardcoding data inline.

## Files

### `coverage-data.js`
The single source of truth for all coverage metrics, including:
- **FILE_GROUPS**: Logical groupings of files by functional area
- **COVERAGE_DATA**: Complete coverage data structure containing:
  - `summary`: Overall coverage percentages
  - `files`: Detailed per-file coverage metrics
  - `testHistory`: Historical test run data with coverage trends

## Usage

### In Components
```javascript
import { COVERAGE_DATA, FILE_GROUPS } from '@/data/coverage-data';

// Use the data
const coverageMetrics = COVERAGE_DATA.summary;
const fileGroups = FILE_GROUPS;
const testHistory = COVERAGE_DATA.testHistory;
```

### Auto-Updates
The `coverage-data.js` file is automatically updated by:
1. **Post-commit hook** (`.git/hooks/post-commit`)
2. **Update script** (`scripts/update-coverage-data.js`)

These scripts:
- Run tests and extract real coverage metrics
- Update the data file with new test results
- Add entries to the test history
- Maintain a rolling window of 30 most recent test runs

## Adding New Coverage Modules

When creating new coverage-related components:

1. **Always import from `@/data/coverage-data`**
   ```javascript
   import { COVERAGE_DATA } from '@/data/coverage-data';
   ```

2. **Never hardcode coverage data in components**
   - This ensures consistency across all views
   - Makes updates automatic via the post-commit hook

3. **Use the existing data structure**
   - Access summary: `COVERAGE_DATA.summary`
   - Access files: `COVERAGE_DATA.files`
   - Access history: `COVERAGE_DATA.testHistory`
   - Access groupings: `FILE_GROUPS`

## Data Structure

### FILE_GROUPS
```javascript
{
  'Core Board Functionality': [...],
  'Conversation Cards': [...],
  'Timeline & Events': [...],
  'API & Data': [...],
  'Authentication & Security': [...],
  'UI Components': [...],
  'Tests': [...]
}
```

### COVERAGE_DATA
```javascript
{
  summary: {
    statements: { covered, total, percentage },
    branches: { covered, total, percentage },
    functions: { covered, total, percentage },
    lines: { covered, total, percentage }
  },
  files: [
    {
      name: 'file.js',
      path: '/path/to/file.js',
      statements: { covered, total, percentage },
      branches: { covered, total, percentage },
      functions: { covered, total, percentage },
      lines: { covered, total, percentage },
      uncoveredLines: [...]
    }
  ],
  testHistory: [
    {
      date: 'ISO-8601',
      totalTests: number,
      passed: number,
      failed: number,
      duration: number,
      coverage: {
        statements: percentage,
        branches: percentage,
        functions: percentage,
        lines: percentage
      }
    }
  ]
}
```

## Maintenance

### Manual Updates
While the file is auto-generated, if manual updates are needed:
1. Maintain the exact structure shown above
2. Ensure all percentages are numbers (not strings)
3. Keep dates in ISO-8601 format
4. Preserve the export statements

### Troubleshooting
- If coverage data isn't updating: Check the post-commit hook is executable
- If data seems stale: Run `npm run update-dev-data` manually
- If file gets corrupted: Check git history for last known good version

## Future Enhancements
- Add coverage trends analysis
- Include per-test-suite breakdowns
- Add coverage goals/thresholds
- Include branch coverage details