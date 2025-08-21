#!/usr/bin/env node

/**
 * Safety Switch Reset Utility
 * 
 * Resets all safety switches to their default states for optimization rollback scenarios.
 * Provides emergency reset capabilities and validation of safety system health.
 * 
 * @version 1.0.0
 * @date 2025-08-20
 * @classification MAJOR/SEV-0 Safety Infrastructure
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Logging utility
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  debug: (msg) => console.log(`${colors.cyan}🔍 ${msg}${colors.reset}`)
};

// Default safety switch states (should match safety-switches.js)
const DEFAULT_SWITCHES = {
  // React Query Migration
  reactQuery: true,
  
  // Core Application Systems  
  cardEvents: true,
  userTracking: true,
  sessionEvents: true,
  conversationPolling: true,
  
  // SSE Real-Time Collaboration
  sseEnabled: true,
  sseResourceMonitoring: true,
  sseAutoRecovery: true,
  sseBroadcasting: true,
  
  // User Presence Real-Time
  ssePresence: true,
  
  // SSE Conversation Events
  sseConversationEvents: true,
  sseConversationPollingFallback: false,
  
  // SSE Performance Monitoring Events
  ssePerformanceMonitoring: true,
  ssePerformancePollingFallback: false,
  
  // Performance Monitoring (keep disabled)
  performanceMonitoring: false,
  
  // Optimization-specific switches
  optimizedMutations: false,        // NEW: For React Query factory pattern
  unifiedThemeSystem: false,        // NEW: For design system migration
  featureModules: false,            // NEW: For feature-based modules
  sseUnifiedMigration: false,       // NEW: For SSE infrastructure migration
  
  // Emergency Global Disable
  emergencyDisable: false,
};

/**
 * Clear all localStorage safety switches
 */
function clearLocalStorageSwitches() {
  // This function would run in browser context, but we can prepare the logic
  const switchKeys = Object.keys(DEFAULT_SWITCHES).map(key => `safety-switch-${key}`);
  switchKeys.push('emergency-disable');
  
  log.info('Clearing localStorage safety switches...');
  
  // Since we're in Node.js, we'll output the commands to run in browser
  console.log('\n📋 Run these commands in browser console to clear localStorage:');
  console.log('```javascript');
  switchKeys.forEach(key => {
    console.log(`localStorage.removeItem('${key}');`);
  });
  console.log('localStorage.removeItem("emergency-disable");');
  console.log('window.dispatchEvent(new CustomEvent("safety-switch-changed"));');
  console.log('console.log("Safety switches cleared from localStorage");');
  console.log('```\n');
  
  return switchKeys;
}

/**
 * Validate safety switch configuration
 */
function validateSafetyConfiguration() {
  log.info('Validating safety switch configuration...');
  
  const projectRoot = path.resolve(__dirname, '..');
  const safetySwitchPath = path.join(projectRoot, 'lib', 'utils', 'safety-switches.js');
  
  if (!fs.existsSync(safetySwitchPath)) {
    log.error('Safety switches file not found');
    return false;
  }
  
  try {
    const safetySwitchContent = fs.readFileSync(safetySwitchPath, 'utf8');
    
    // Validate that required switches are present
    const requiredSwitches = ['sseEnabled', 'reactQuery', 'emergencyDisable'];
    const missingSwitch = requiredSwitches.find(switchName => 
      !safetySwitchContent.includes(switchName)
    );
    
    if (missingSwitch) {
      log.error(`Required safety switch missing: ${missingSwitch}`);
      return false;
    }
    
    log.success('Safety switch configuration validated');
    return true;
    
  } catch (error) {
    log.error(`Error validating safety switches: ${error.message}`);
    return false;
  }
}

/**
 * Reset environment variables
 */
function resetEnvironmentVariables() {
  log.info('Checking environment variables...');
  
  const envMapping = {
    reactQuery: 'NEXT_PUBLIC_USE_REACT_QUERY',
    cardEvents: 'NEXT_PUBLIC_CARD_EVENTS_ENABLED',
    userTracking: 'NEXT_PUBLIC_USER_TRACKING_ENABLED',
    sessionEvents: 'NEXT_PUBLIC_SESSION_EVENTS_ENABLED',
    conversationPolling: 'NEXT_PUBLIC_CONVERSATION_POLLING_ENABLED',
    performanceMonitoring: 'NEXT_PUBLIC_PERFORMANCE_MONITORING_ENABLED',
    sseEnabled: 'NEXT_PUBLIC_SSE_ENABLED',
    sseResourceMonitoring: 'NEXT_PUBLIC_SSE_RESOURCE_MONITORING',
    sseAutoRecovery: 'NEXT_PUBLIC_SSE_AUTO_RECOVERY',
    sseBroadcasting: 'NEXT_PUBLIC_SSE_BROADCASTING',
    ssePresence: 'NEXT_PUBLIC_SSE_PRESENCE',
    sseConversationEvents: 'NEXT_PUBLIC_SSE_CONVERSATION_EVENTS',
    emergencyDisable: 'NEXT_PUBLIC_EMERGENCY_DISABLE',
  };
  
  let envOverrides = [];
  
  Object.entries(envMapping).forEach(([switchName, envVar]) => {
    if (process.env[envVar] === 'false') {
      envOverrides.push({ switchName, envVar, value: process.env[envVar] });
    }
  });
  
  if (envOverrides.length > 0) {
    log.warning('Found environment variable overrides:');
    envOverrides.forEach(({ switchName, envVar, value }) => {
      console.log(`  ${switchName}: ${envVar}=${value}`);
    });
    
    console.log('\n📋 To reset environment variables:');
    envOverrides.forEach(({ envVar }) => {
      console.log(`unset ${envVar}`);
    });
    console.log('');
  } else {
    log.success('No environment variable overrides found');
  }
  
  return envOverrides;
}

/**
 * Create safety reset status report
 */
function createStatusReport() {
  const report = {
    timestamp: new Date().toISOString(),
    defaultSwitches: DEFAULT_SWITCHES,
    totalSwitches: Object.keys(DEFAULT_SWITCHES).length,
    criticalSwitches: [
      'sseEnabled',
      'emergencyDisable', 
      'reactQuery',
      'userTracking',
      'sessionEvents'
    ],
    optimizationSwitches: [
      'optimizedMutations',
      'unifiedThemeSystem', 
      'featureModules',
      'sseUnifiedMigration'
    ]
  };
  
  return report;
}

/**
 * Test safety switch functionality
 */
function testSafetySwitches() {
  log.info('Testing safety switch functionality...');
  
  try {
    // This would require loading the safety-switches module, but we're in Node.js
    // So we'll do a file-based validation instead
    
    const projectRoot = path.resolve(__dirname, '..');
    const safetySwitchPath = path.join(projectRoot, 'lib', 'utils', 'safety-switches.js');
    
    if (!fs.existsSync(safetySwitchPath)) {
      log.error('Safety switches file not found for testing');
      return false;
    }
    
    const content = fs.readFileSync(safetySwitchPath, 'utf8');
    
    // Check for required functions
    const requiredFunctions = [
      'getSafetySwitch',
      'useSafetySwitch', 
      'setSafetySwitch',
      'emergencyDisableAll',
      'emergencyRecover'
    ];
    
    const missingFunction = requiredFunctions.find(funcName => 
      !content.includes(`function ${funcName}`) && !content.includes(`${funcName}`)
    );
    
    if (missingFunction) {
      log.error(`Safety function missing: ${missingFunction}`);
      return false;
    }
    
    log.success('Safety switch functions validated');
    return true;
    
  } catch (error) {
    log.error(`Error testing safety switches: ${error.message}`);
    return false;
  }
}

/**
 * Generate reset instructions
 */
function generateResetInstructions() {
  console.log('\n' + '='.repeat(60));
  console.log('🔧 SAFETY SWITCH RESET INSTRUCTIONS');
  console.log('='.repeat(60));
  
  console.log('\n1. Browser localStorage Reset:');
  console.log('   Open browser dev tools and run the localStorage commands shown above.');
  
  console.log('\n2. Environment Variables:');
  console.log('   Unset any environment variables shown above, then restart the dev server.');
  
  console.log('\n3. Application Restart:');
  console.log('   npm run dev  # Start development server');
  
  console.log('\n4. Verification:');
  console.log('   - Check that all safety switches show default values');
  console.log('   - Verify that emergency disable is not active');
  console.log('   - Confirm that all systems are operational');
  
  console.log('\n5. Emergency Recovery (if needed):');
  console.log('   In browser console:');
  console.log('   ```javascript');
  console.log('   // Import safety functions (adjust path as needed)');
  console.log('   import { emergencyRecover } from "/lib/utils/safety-switches.js";');
  console.log('   emergencyRecover();');
  console.log('   ```');
  
  console.log('\n' + '='.repeat(60));
}

/**
 * Main reset function
 */
function main() {
  console.log(`${colors.magenta}🛡️  Safety Switch Reset Utility${colors.reset}`);
  console.log(`${colors.cyan}Resetting all safety switches to default states...${colors.reset}\n`);
  
  // Validate configuration
  if (!validateSafetyConfiguration()) {
    log.error('Safety configuration validation failed');
    process.exit(1);
  }
  
  // Test functionality
  if (!testSafetySwitches()) {
    log.error('Safety switch functionality test failed');
    process.exit(1);
  }
  
  // Clear localStorage switches
  const clearedSwitches = clearLocalStorageSwitches();
  
  // Reset environment variables
  const envOverrides = resetEnvironmentVariables();
  
  // Create status report
  const report = createStatusReport();
  
  // Generate instructions
  generateResetInstructions();
  
  // Output summary
  console.log('\n📊 RESET SUMMARY:');
  console.log(`  - Total switches: ${report.totalSwitches}`);
  console.log(`  - Critical switches: ${report.criticalSwitches.length}`);
  console.log(`  - Optimization switches: ${report.optimizationSwitches.length}`);
  console.log(`  - Environment overrides: ${envOverrides.length}`);
  
  log.success('Safety switch reset preparation complete');
  
  // Save report
  const reportPath = path.join(__dirname, '..', 'logs', 'safety-reset-report.json');
  try {
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    log.success(`Reset report saved: ${reportPath}`);
  } catch (error) {
    log.warning(`Could not save report: ${error.message}`);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  DEFAULT_SWITCHES,
  clearLocalStorageSwitches,
  validateSafetyConfiguration,
  resetEnvironmentVariables,
  createStatusReport,
  testSafetySwitches
};