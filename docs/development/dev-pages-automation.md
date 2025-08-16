# Dev Pages Automation

This document explains how the `/dev/tests/` and `/dev/coverage/` pages are automatically kept up-to-date with real test results and coverage data.

## Overview

The dev pages provide a real-time dashboard of:
- **Test Results**: Unit and integration test counts, pass/fail status, duration
- **Coverage Metrics**: Statement, branch, function, and line coverage percentages  
- **Test History**: Timeline of test runs with historical data
- **File-by-File Coverage**: Detailed breakdown of coverage by component

## Automation System

### 1. Manual Updates
Run the update script manually:
```bash
npm run update-dev-data
```

### 2. Run Tests + Update
Run tests and automatically update dev pages:
```bash
npm run test:update-dev
```

### 3. Automatic Git Hook
The system includes a `post-commit` git hook that:
- Detects commits affecting test files or configurations
- Runs the test suite to get fresh data
- Updates the dev pages with current results
- Auto-commits the updated dev pages

## What Gets Updated

### `/dev/tests/page.jsx`
- **INITIAL_TEST_STATE**: Real test counts and results
- **Unit Tests**: Count, pass/fail status, file breakdown
- **Integration Tests**: API and database test results
- **Coverage Summary**: Overall percentages for statements, branches, functions, lines
- **File Coverage**: Individual file coverage metrics

### `/dev/coverage/page.jsx`
- **Summary Metrics**: Calculated from actual coverage data
- **Test History**: Automatic entries with timestamps and results
- **File Details**: Per-file coverage breakdowns
- **Coverage Insights**: High/low coverage file lists

## Data Sources

The automation script extracts data from:

1. **Vitest JSON Reporter**: Test counts, pass/fail, duration
2. **Coverage Reports**: Statement/branch/function/line percentages
3. **File System**: Test file structure and organization
4. **Git History**: Timestamps and metadata

## Benefits

✅ **Always Accurate**: Dev pages reflect current state  
✅ **Zero Maintenance**: Updates happen automatically  
✅ **Historical Tracking**: Maintains test run history  
✅ **Real Coverage**: Uses actual coverage data, not mock values  
✅ **Git Integration**: Seamlessly works with development workflow  

## Files Involved

- `scripts/update-dev-data.js` - Main automation script
- `.git/hooks/post-commit` - Git hook for automatic updates
- `app/dev/tests/page.jsx` - Test dashboard page
- `app/dev/coverage/page.jsx` - Coverage report page
- `package.json` - NPM scripts for running automation

## Example Dev Page Data

The system tracks:
- **160 total tests** (117 unit + 43 integration)
- **Coverage**: 85.2% statements, 89.5% branches, 78.8% functions
- **Test Files**: 8 test files across unit and integration suites
- **Components**: card.jsx at 100% coverage, utils.js at 100% coverage
- **APIs**: cards and events endpoints with 95%+ coverage
- **Database**: Full CRUD operation testing

## Troubleshooting

If automation fails:
1. Check test suite passes: `npm run test:run`
2. Verify script permissions: `chmod +x scripts/update-dev-data.js`
3. Test script manually: `node scripts/update-dev-data.js`
4. Check git hook: `chmod +x .git/hooks/post-commit`

The dev pages will show the last successfully captured data even if current run fails.