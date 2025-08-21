#!/usr/bin/env node

/**
 * Enable Phase 4 SSE-Only Mode
 * 
 * CLASSIFICATION: APPLICATION LEVEL | SEV-0 | CONFIGURATION SCRIPT
 * PURPOSE: Enable Phase 4 SSE-only operation mode
 */

const fs = require('fs');
const path = require('path');

const ENV_FILE = path.join(__dirname, '..', '.env.local');

function enablePhase4() {
  console.log('🚀 Enabling Phase 4 SSE-Only Mode...');
  
  let envContent = '';
  
  // Read existing .env.local if it exists
  if (fs.existsSync(ENV_FILE)) {
    envContent = fs.readFileSync(ENV_FILE, 'utf8');
  }
  
  // Check if Phase 4 setting already exists
  if (envContent.includes('NEXT_PUBLIC_PHASE4_SSE_ONLY')) {
    // Update existing setting
    envContent = envContent.replace(
      /NEXT_PUBLIC_PHASE4_SSE_ONLY=.*/,
      'NEXT_PUBLIC_PHASE4_SSE_ONLY=true'
    );
    console.log('✅ Updated existing Phase 4 setting');
  } else {
    // Add new setting
    envContent += '\n# Phase 4 SSE-Only Mode\nNEXT_PUBLIC_PHASE4_SSE_ONLY=true\n';
    console.log('✅ Added Phase 4 setting');
  }
  
  // Write back to file
  fs.writeFileSync(ENV_FILE, envContent);
  
  console.log('🎯 Phase 4 SSE-Only Mode ENABLED');
  console.log('📍 Config written to:', ENV_FILE);
  console.log('🔄 Restart development server to apply changes');
  console.log('🧪 Test at: http://localhost:3000/dev/phase4-validation');
  console.log('');
  console.log('Phase 4 Features:');
  console.log('  ✅ UI Events: SSE-only (no polling)');
  console.log('  ✅ Session Events: SSE-only (no polling)');
  console.log('  ❌ Card Events: Polling maintained (Phase 5 target)');
  console.log('  🔧 Expected: 40-50% network traffic reduction');
}

function disablePhase4() {
  console.log('🛑 Disabling Phase 4 SSE-Only Mode...');
  
  if (!fs.existsSync(ENV_FILE)) {
    console.log('⚠️  No .env.local file found - Phase 4 already disabled');
    return;
  }
  
  let envContent = fs.readFileSync(ENV_FILE, 'utf8');
  
  // Update or remove Phase 4 setting
  if (envContent.includes('NEXT_PUBLIC_PHASE4_SSE_ONLY')) {
    envContent = envContent.replace(
      /NEXT_PUBLIC_PHASE4_SSE_ONLY=.*/,
      'NEXT_PUBLIC_PHASE4_SSE_ONLY=false'
    );
    fs.writeFileSync(ENV_FILE, envContent);
    console.log('✅ Phase 4 SSE-Only Mode DISABLED');
  } else {
    console.log('⚠️  Phase 4 setting not found - already disabled');
  }
  
  console.log('🔄 Restart development server to apply changes');
}

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'enable':
    enablePhase4();
    break;
  case 'disable':
    disablePhase4();
    break;
  case 'status':
    if (fs.existsSync(ENV_FILE)) {
      const envContent = fs.readFileSync(ENV_FILE, 'utf8');
      const match = envContent.match(/NEXT_PUBLIC_PHASE4_SSE_ONLY=(.*)/);
      if (match) {
        const enabled = match[1].trim() === 'true';
        console.log(`Phase 4 Status: ${enabled ? 'ENABLED' : 'DISABLED'}`);
      } else {
        console.log('Phase 4 Status: DISABLED (not configured)');
      }
    } else {
      console.log('Phase 4 Status: DISABLED (no .env.local)');
    }
    break;
  default:
    console.log('Usage: node enable-phase4.js [enable|disable|status]');
    console.log('');
    console.log('Commands:');
    console.log('  enable  - Enable Phase 4 SSE-only mode');
    console.log('  disable - Disable Phase 4 SSE-only mode');
    console.log('  status  - Check current Phase 4 status');
}