# Development Scripts

This directory contains various development and testing scripts that are not part of the main application or test suite.

## Consolidated Directory Structure

### 📁 setup/
Development environment setup and configuration utilities.

**How to run:**
```bash
cd dev-scripts/setup
./clean-start-dev.sh
```

#### Available Scripts:
- **clean-start-dev.sh** - Clean development server startup script

### 📁 safety/
Safety switches, circuit breakers, and system control utilities.

**How to run:**
```bash
cd dev-scripts/safety
node reset-safety-switches.js
```

#### Available Scripts:
- **reset-safety-switches.js** - Reset all safety switches to default states
- **test-safety-switches.js** - Test safety switch functionality and circuit breakers

### 📁 debug/
All debugging tools, troubleshooting scripts, and system validation utilities.

**How to run:**
```bash
cd dev-scripts/debug
node debug-optimized-sse-isolated.js
```

#### Available Scripts:
- **debug-current-state.js** - Browser console debugging tool for application state
- **debug-optimized-sse-isolated.js** - Debug optimized SSE hooks in isolation
- **enable-phase4.js** - Enable Phase 4 development features
- **manual-switching-tests.js** - Manual user switching tests for browser console
- **test-hook-coordination.js** - Test hook coordination functionality
- **test-user-switching.js** - User switching tests for browser console
- **validate-api-runaway-fix.js** - Validate API runaway prevention fixes

### 📁 tests/
All test scripts organized by category and purpose.

#### 📁 tests/api/
Node.js executable test scripts for testing specific API features in isolation.

**How to run:**
```bash
cd dev-scripts/tests/api
node test-flip-api.js
```

**Available Scripts:**
- **test-browser-sessions.js** - Test browser session handling
- **test-complete-flow.js** - Test complete application flow
- **test-expanded-guest-system.js** - Test expanded guest system functionality
- **test-flip-api.js** - Tests the card flip API endpoint
- **test-flip-data.js** - Verifies the faceUp field in the database
- **test-guest-avatars.js** - Tests guest avatar generation system
- **test-guest-creation.js** - Tests guest user creation
- **test-stack-logic.js** - Tests card stacking logic functions
- **test-two-tabs.js** - Tests two-tab functionality

#### 📁 tests/integration/
Integration testing, migration testing, and performance analysis scripts.

**How to run:**
```bash
cd dev-scripts/tests/integration
node test-cards-migration.js
```

**Available Scripts:**
- **debug-system-user-switching.js** - Debug system user switching issues
- **enable-sse-optimization-testing.js** - Enable SSE optimization testing
- **test-cards-migration.js** - Test React Query cards migration
- **test-conversations-migration.js** - Test conversations migration
- **test-performance-benchmark.js** - Performance benchmark testing
- **test-react-query-timing-fix.js** - Test React Query timing fixes
- **test-react-query-vs-legacy.js** - Compare React Query vs legacy performance
- **test-sse-optimizations.js** - Test SSE infrastructure optimizations
- **test-system-user-switching-logs.js** - Test system user switching with logs
- **test-user-session-migration.js** - Test user session migration
- **test-user-session-simple.js** - Simple user session tests
- **test-user-switching-fix.js** - Test user switching fixes

#### 📁 tests/performance/
Performance testing and impact analysis scripts.

**How to run:**
```bash
cd dev-scripts/tests/performance
node performance-impact-test.js
```

**Available Scripts:**
- **performance-impact-test.js** - Tests performance monitoring system impact

#### 📁 tests/scenarios/
Mock test data and scenario definitions for testing.

**Available Files:**
- **user-switching.test.js** - Mock test scenarios for user switching functionality

#### 📁 tests/verification/
Verification scripts for testing component implementations.

**How to run:**
```bash
cd dev-scripts/tests/verification
node verify-chart-features.js
```

**Available Scripts:**
- **test-coverage-chart.js** - Tests coverage chart rendering and data
- **verify-chart-enhancements.js** - Verifies chart enhancement implementations
- **verify-chart-features.js** - Tests chart feature completeness
- **verify-compact-coverage.js** - Validates compact coverage display
- **verify-multi-line-chart.js** - Tests multi-line chart functionality
- **verify-size-increases.js** - Verifies UI size adjustments

### 📁 utilities/
Database and setup utilities for development.

**How to run:**
```bash
cd dev-scripts/utilities
node reset-cards-for-ui.js
```

#### Available Scripts:
- **clean-simulated.js** - Cleans up simulated sessions
- **cleanup-all.js** - Comprehensive cleanup utility
- **clear-browser-storage.js** - Clear browser storage data
- **force-reset.js** - Force reset system state
- **reset-cards-for-ui.js** - Resets database cards to a clean state for UI testing
- **test-event-store.js** - Tests event store functionality

### 📁 results/
Test results, performance data, and comparison reports.

#### Available Files:
- **performance-comparison-results.json** - Performance comparison data
- **test-results.json** - Latest vitest test execution results
- **test-results-cards.json** - Cards migration test results
- **test-results-conversations.json** - Conversations migration test results

### 📁 test-pages/
HTML test pages for visual and interactive testing.

**How to use:**
1. Open the HTML file directly in your browser
2. Follow on-page instructions

#### Available Pages:
- **test-guest-avatar-live.html** - Interactive test page with console commands for guest avatar API

### 📁 deprecated/
Deprecated code and legacy implementations.

## Important Notes

⚠️ **These scripts are for development only** - Do not run in production environments

⚠️ **Database scripts may modify data** - Always backup before running utilities that touch the database

⚠️ **Browser scripts access internal state** - May break with application updates

## Quick Reference

### Clean Development Startup:
```bash
./dev-scripts/setup/clean-start-dev.sh
```

### Safety Switch Management:
```bash
node dev-scripts/safety/reset-safety-switches.js
node dev-scripts/safety/test-safety-switches.js
```

### API Testing:
```bash
node dev-scripts/tests/api/test-flip-api.js
node dev-scripts/tests/api/test-guest-avatars.js
```

### Integration Testing:
```bash
node dev-scripts/tests/integration/test-cards-migration.js
node dev-scripts/tests/integration/test-sse-optimizations.js
```

### Performance Testing:
```bash
node dev-scripts/tests/performance/performance-impact-test.js
```

### Feature Verification:
```bash
node dev-scripts/tests/verification/verify-chart-features.js
```

### Debugging Issues:
```bash
node dev-scripts/debug/debug-optimized-sse-isolated.js
node dev-scripts/debug/validate-api-runaway-fix.js
```

### Browser Console Debugging:
```javascript
// In browser console:
// Copy contents of dev-scripts/debug/debug-current-state.js
// Then run:
debugCurrentState()
```

### Reset Test Data:
```bash
node dev-scripts/utilities/reset-cards-for-ui.js
```

## Adding New Scripts

When adding new development scripts:
1. **Place in appropriate concern-based folder**:
   - `setup/` - Environment setup and configuration
   - `safety/` - Safety switches and system controls
   - `debug/` - Debug scripts and troubleshooting tools
   - `tests/api/` - API testing scripts
   - `tests/integration/` - Integration and migration testing
   - `tests/performance/` - Performance testing scripts
   - `tests/scenarios/` - Test scenarios and mocks
   - `tests/verification/` - Component verification scripts
   - `utilities/` - Database and utility scripts
   - `results/` - Test results and data files
   - `test-pages/` - HTML test pages
2. Add clear header comments explaining purpose and usage
3. Update this README with the new script details
4. Consider if it should be a proper test in `__tests__/` instead

## Consolidation Benefits

✅ **Reduced Complexity**: 12 folders → 7 folders (42% reduction)
✅ **Clear Separation of Concerns**: Scripts organized by primary purpose
✅ **Logical Grouping**: Related functionality consolidated together
✅ **Easy Navigation**: Intuitive folder structure for finding scripts
✅ **Better Discoverability**: New team members can locate relevant tools quickly
✅ **Maintainable Structure**: Clear ownership and responsibility for each category
✅ **Reduced Duplication**: Similar scripts consolidated to avoid confusion

## Migration from Old Structure

**Consolidated Mappings:**
- `node-tests/` → `tests/api/`
- `tests/` → `tests/integration/`
- `testing/` → `tests/integration/`
- `verification/` → `tests/verification/`
- `performance/` → `tests/performance/`
- `mock-scenarios/` → `tests/scenarios/`
- `browser-console/` + `debugging/` → `debug/`

All file paths have been updated in script headers and cross-references.