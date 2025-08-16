# Development Scripts

This directory contains various development and testing scripts that are not part of the main application or test suite.

## Directory Structure

### 📁 node-tests/
Node.js executable test scripts for testing specific features in isolation.

**How to run:**
```bash
cd dev-scripts/node-tests
node test-flip-api.js
```

#### Available Scripts:
- **test-flip-api.js** - Tests the card flip API endpoint
- **test-flip-data.js** - Verifies the faceUp field in the database
- **test-stack-logic.js** - Tests card stacking logic functions
- **test-guest-avatars.js** - Tests guest avatar generation system

### 📁 browser-console/
Scripts designed to be run in the browser console for manual testing and debugging.

**How to use:**
1. Open your application in the browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Copy and paste the entire script content
5. Follow script-specific instructions

#### Available Scripts:
- **test-user-switching.js** - Manual tests for user switching functionality
- **debug-current-state.js** - Debugging tool to inspect current application state
- **manual-switching-tests.js** - Comprehensive test suite for user switching

### 📁 utilities/
Database and setup utilities for development.

**How to run:**
```bash
cd dev-scripts/utilities
node reset-cards-for-ui.js
```

#### Available Scripts:
- **reset-cards-for-ui.js** - Resets database cards to a clean state for UI testing

### 📁 test-pages/
HTML test pages for visual and interactive testing.

**How to use:**
1. Open the HTML file directly in your browser
2. Follow on-page instructions

#### Available Pages:
- **guest-avatars-test.html** - Visual gallery of generated guest avatars
- **test-guest-avatar-live.html** - Interactive test page with console commands for guest avatar API

### 📁 mock-scenarios/
Mock test data and scenario definitions for testing.

#### Available Files:
- **user-switching.test.js** - Mock test scenarios for user switching functionality (not an actual test file)

## Important Notes

⚠️ **These scripts are for development only** - Do not run in production environments

⚠️ **Database scripts may modify data** - Always backup before running utilities that touch the database

⚠️ **Browser scripts access internal state** - May break with application updates

## Quick Reference

### Testing the Flip API:
```bash
node dev-scripts/node-tests/test-flip-api.js
```

### Debugging User State:
```javascript
// In browser console:
// Copy contents of dev-scripts/browser-console/debug-current-state.js
// Then run:
debugCurrentState()
```

### Reset Test Data:
```bash
node dev-scripts/utilities/reset-cards-for-ui.js
```

## Adding New Scripts

When adding new development scripts:
1. Place in the appropriate subdirectory based on execution environment
2. Add clear header comments explaining purpose and usage
3. Update this README with the new script details
4. Consider if it should be a proper test in `__tests__/` instead