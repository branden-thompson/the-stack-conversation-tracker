# Dev Pages Automation

This document explains how the `/dev/tests/` page and coverage data file are automatically kept up-to-date with real test results and coverage data.

## Overview

The dev pages provide a real-time dashboard of:
- **Test Results**: Unit and integration test counts, pass/fail status, duration
- **Coverage Metrics**: Statement, branch, function, and line coverage percentages  
- **Test History**: Timeline of test runs with historical data and coverage trends
- **File-by-File Coverage**: Detailed breakdown of coverage by component with grouping

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
- Prevents infinite loops by skipping hooks on auto-generated commits

## What Gets Updated

### `/dev/tests/page.jsx`
- **Test Status Banner**: Real-time test execution status
- **INITIAL_TEST_STATE**: Real test counts and results
- **Unit Tests**: Count, pass/fail status, file breakdown
- **Integration Tests**: API and database test results
- **Coverage Summary**: Overall percentages for statements, branches, functions, lines
- **File Coverage**: Individual file coverage metrics with grouped views
- **Test History Chart**: Visual representation of test runs over time with coverage trends

### `/data/coverage-data.js`
- **Summary Metrics**: Calculated from actual coverage data
- **Test History**: Automatic entries with timestamps, test results, and coverage data
- **File Details**: Per-file coverage breakdowns
- **File Groups**: Logical grouping of files by functional area

## Critical Data Structures

### Coverage Data Structure
The coverage values in `INITIAL_TEST_STATE` are **simple numbers**, not objects:
```javascript
coverage: {
  statements: 85.20,  // Direct number, NOT { percentage: 85.20 }
  branches: 89.50,
  functions: 78.80,
  lines: 85.20
}
```

### Test History Entry Structure
Each test history entry MUST include coverage data:
```javascript
{
  date: '2025-08-16T23:28:13.133Z',
  totalTests: 454,
  passed: 358,
  failed: 96,
  duration: 0,
  coverage: {  // Required for chart display
    statements: 85.2,
    branches: 89.5,
    functions: 78.8,
    lines: 85.2
  }
}
```

## Data Sources

The automation script extracts data from:

1. **Vitest JSON Reporter**: Test counts, pass/fail, duration
2. **Coverage Reports**: Statement/branch/function/line percentages
3. **File System**: Test file structure and organization
4. **Git History**: Timestamps and metadata

## Safety Features

The automation includes multiple safeguards:

### 1. Infinite Loop Prevention
- Detects auto-commits by checking for "📊 Auto-update dev pages" in commit message
- Limits auto-commits to 3 per minute maximum
- Skips hook execution for auto-generated commits

### 2. Race Condition Protection
- Uses lockfile mechanism (`/tmp/dev-pages-update.lock`)
- Detects and removes stale locks
- Prevents concurrent update processes

### 3. Data Integrity Checks
- File size validation (1MB limit)
- Empty file detection
- Staged changes reasonableness check (10,000 line limit)
- Test history trimming (maintains only last 30 entries)

### 4. Timeout Protection
- 5-minute timeout for test execution
- Process termination for hung operations
- Graceful fallback on timeout

## Common Issues and Solutions

### Issue 1: Build Error - Missing Closing Braces
**Symptom**: `Unexpected token {. Expected identifier...`
**Cause**: Test history entries missing closing braces
**Solution**: Ensure `update-coverage-data.js` creates entries with proper format:
```javascript
{ date: '...', totalTests: N, passed: N, failed: N, duration: N, coverage: {...} },
```

### Issue 2: Runtime Error - Cannot read properties of undefined
**Symptom**: `Cannot read properties of undefined (reading 'toFixed')`
**Cause**: Coverage data structure mismatch (expecting nested objects vs simple numbers)
**Solution**: Ensure page uses correct property access:
```javascript
// Wrong: testState.coverage.statements.percentage.toFixed(1)
// Right: testState.coverage.statements.toFixed(1)
```

### Issue 3: Test History Chart Shows 0% Coverage
**Symptom**: Coverage lines all show as 0% in the chart
**Cause**: Test history entries missing `coverage` property
**Solution**: Update all entries to include coverage data and fix `update-coverage-data.js`

### Issue 4: Post-Commit Hook Creates Corrupted Data
**Symptom**: JSON parse errors after commits
**Cause**: Malformed entries being added to data files
**Solution**: Verify update scripts maintain proper JSON structure with closing braces

## Files Involved

- `scripts/update-dev-data.js` - Main automation script
- `scripts/update-coverage-data.js` - Coverage data file updater
- `.git/hooks/post-commit` - Git hook for automatic updates
- `app/dev/tests/page.jsx` - Unified test & coverage dashboard
- `data/coverage-data.js` - Centralized coverage data file
- `package.json` - NPM scripts for running automation

## Testing the Automation

### 1. Test Manual Update
```bash
npm run update-dev-data
# Check console output for errors
# Verify data/coverage-data.js was updated
```

### 2. Test Post-Commit Hook
```bash
echo "// test" >> test-file.js
git add test-file.js
git commit -m "Test commit"
# Watch for hook execution output
# Verify auto-commit was created
```

### 3. Verify Data Structure
```bash
node -e "
const data = require('./data/coverage-data.js').COVERAGE_DATA;
console.log('Latest entry:', JSON.stringify(data.testHistory[0], null, 2));
console.log('Has coverage:', !!data.testHistory[0].coverage);
"
```

### 4. Check for Runtime Errors
```bash
# Start dev server
npm run dev
# Visit http://localhost:3000/dev/tests
# Check browser console for errors
```

## Best Practices

1. **Always maintain data structure consistency** - The page expects specific formats
2. **Include coverage in test history** - Required for chart visualization
3. **Test changes locally** - Run `npm run update-dev-data` before committing
4. **Monitor history size** - Automatic trimming keeps last 30 entries
5. **Check for auto-commit loops** - Look for rapid "📊 Auto-update" commits
6. **Verify build after updates** - Run `npm run build` to catch syntax errors

## Example Dev Page Data

The system tracks:
- **454 total tests** (175 unit + 81 integration + expanded test suites)
- **Coverage**: 85.2% statements, 89.5% branches, 78.8% functions, 85.2% lines
- **Test Files**: Multiple test files across unit, integration, and UI regression suites
- **Components**: Varying coverage from 83% to 100% across different modules
- **Historical Trends**: 30-day history with coverage evolution over time

## Troubleshooting

If automation fails:

1. **Check test suite passes**: `npm run test:run`
2. **Verify script permissions**: `chmod +x scripts/update-dev-data.js`
3. **Test script manually**: `node scripts/update-dev-data.js`
4. **Check git hook**: `chmod +x .git/hooks/post-commit`
5. **Verify data structure**: Check `data/coverage-data.js` for malformed JSON
6. **Clear lockfile if stuck**: `rm /tmp/dev-pages-update.lock`
7. **Check for infinite loops**: `git log --oneline | head -20` (look for rapid auto-commits)
8. **Validate coverage data**: Ensure all test history entries have coverage property

The dev pages will show the last successfully captured data even if current run fails.

## Recovery Procedures

### If Data File is Corrupted
1. Check git history: `git log --oneline data/coverage-data.js`
2. Revert to last working version: `git checkout HEAD~1 data/coverage-data.js`
3. Manually fix syntax errors (usually missing closing braces)
4. Test with: `node -e "require('./data/coverage-data.js')"`

### If Page Shows Errors
1. Check browser console for specific error
2. Verify data structure matches page expectations
3. Check `/app/dev/tests/page.jsx` for correct property access
4. Ensure coverage values are numbers, not objects

### If Post-Commit Hook Fails
1. Check hook output for error messages
2. Verify npm is in PATH: `which npm`
3. Test update script directly: `npm run update-dev-data`
4. Check file permissions and ownership
5. Temporarily disable hook if needed: `mv .git/hooks/post-commit .git/hooks/post-commit.disabled`