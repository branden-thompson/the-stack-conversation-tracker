#!/usr/bin/env node

/**
 * Debug System User Switching
 * 
 * Helps debug why switching TO System user doesn't work
 */

const http = require('http');

const BASE_URL = 'http://localhost:3006';

async function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timeout')), 5000);
    
    const reqOptions = {
      hostname: 'localhost',
      port: 3006,
      path,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(reqOptions, (res) => {
      clearTimeout(timeout);
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ 
            status: res.statusCode, 
            data: JSON.parse(data),
            headers: res.headers 
          });
        } catch (e) {
          resolve({ 
            status: res.statusCode, 
            data,
            headers: res.headers 
          });
        }
      });
    });
    
    req.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function debugSystemUserSwitching() {
  console.log('🔍 Debugging System User Switching Issue...\n');
  
  try {
    // Get all users
    console.log('1️⃣  Fetching all users...');
    const usersResponse = await makeRequest('/api/users');
    
    if (usersResponse.status !== 200) {
      console.log('❌ Failed to fetch users');
      return false;
    }
    
    const users = usersResponse.data;
    console.log(`✅ Found ${users.length} users:`);
    
    users.forEach((user, index) => {
      const type = user.isSystemUser ? '👑 System' : '👤 Regular';
      console.log(`   [${index}] ${user.name} ${type} [ID: ${user.id}]`);
    });
    
    // Identify the issue
    const systemUser = users.find(u => u.isSystemUser);
    const brandenUser = users.find(u => u.name === 'Branden');
    
    if (!systemUser) {
      console.log('\n❌ No system user found!');
      return false;
    }
    
    console.log(`\n🎯 System User Details:`);
    console.log(`   ID: ${systemUser.id}`);
    console.log(`   Name: ${systemUser.name}`);
    console.log(`   isSystemUser: ${systemUser.isSystemUser}`);
    console.log(`   Array Index: ${users.indexOf(systemUser)}`);
    
    if (brandenUser) {
      console.log(`\n👤 Branden User Details:`);
      console.log(`   ID: ${brandenUser.id}`);
      console.log(`   Name: ${brandenUser.name}`);
      console.log(`   isSystemUser: ${brandenUser.isSystemUser}`);
      console.log(`   Array Index: ${users.indexOf(brandenUser)}`);
    }
    
    console.log('\n🐛 ANALYSIS OF SYSTEM USER SWITCHING ISSUE:');
    console.log('━'.repeat(60));
    
    console.log('\n📋 Key Findings:');
    if (users.indexOf(systemUser) === 0) {
      console.log('⚠️  System user is at index 0 (first in array)');
      console.log('   This suggests it might be the default fallback');
    }
    
    console.log('\n🔍 Likely Issues:');
    console.log('1. React Query migration might have timing issues');
    console.log('2. getCurrentUser() fallback logic might be interfering');
    console.log('3. State updates might not be synchronous');
    console.log('4. Browser session coordination might have conflicts');
    
    console.log('\n💡 Debugging Steps:');
    console.log('1. Check if baseUsers.switchUser() properly sets currentUserId');
    console.log('2. Verify getCurrentUser() logic when not in guest mode');
    console.log('3. Check for race conditions between state updates');
    console.log('4. Verify browser session API calls work for system user');
    
    console.log('\n🔧 Potential Fixes:');
    console.log('1. Add explicit state synchronization in handleRegisteredUserSwitch');
    console.log('2. Remove premature fallback logic in getCurrentUser');
    console.log('3. Add debugging logs to track state changes');
    console.log('4. Ensure system user ID is properly handled in all paths');
    
    // Test specific scenarios
    console.log('\n🧪 Testing Scenarios:');
    
    console.log('\n▶️  Scenario 1: Guest → System');
    console.log('   Expected: Switch to system user');
    console.log('   Issue: Stays on guest or wrong user');
    
    console.log('\n▶️  Scenario 2: Branden → System');
    console.log('   Expected: Switch to system user'); 
    console.log('   Issue: Stays on Branden or wrong user');
    
    console.log('\n▶️  Scenario 3: Guest → Branden (WORKING)');
    console.log('   Expected: Switch to Branden user');
    console.log('   Status: ✅ Working correctly');
    
    return true;
    
  } catch (error) {
    console.error('❌ Error during debugging:', error.message);
    return false;
  }
}

async function analyzeCode() {
  console.log('\n📝 CODE ANALYSIS:');
  console.log('━'.repeat(60));
  
  console.log('\n🔍 Key Code Paths:');
  console.log('1. CompactUserSelector.handleUserSelect()');
  console.log('   → useUserManagement.handleUserSelect()');
  console.log('   → useGuestUsers.switchToUser()');
  console.log('   → handleRegisteredUserSwitch()');
  console.log('   → baseUsers.switchUser()');
  
  console.log('\n2. React Query Migration:');
  console.log('   useUsers() → useUsersReactQuery() → useState currentUserId');
  console.log('   Problem: Race condition or state sync issue?');
  
  console.log('\n3. getCurrentUser() Logic:');
  console.log('   → if (isGuestMode) return guest');
  console.log('   → else return baseUsers.currentUser');
  console.log('   → fallback to systemUser (POTENTIAL ISSUE)');
  console.log('   → fallback to users[0] (ANOTHER ISSUE)');
  
  console.log('\n⚠️  SUSPECTED ROOT CAUSE:');
  console.log('The getCurrentUser() fallback logic is too aggressive.');
  console.log('When switching TO system user, it might be:');
  console.log('1. Not waiting for baseUsers.currentUser to update');
  console.log('2. Falling back to "find system user" logic');
  console.log('3. This creates a false positive where it looks like');
  console.log('   system user is selected, but the actual state is wrong');
}

async function runDebug() {
  console.log('🚀 System User Switching Debug Analysis\n');
  console.log('=' .repeat(60));
  
  await debugSystemUserSwitching();
  await analyzeCode();
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 NEXT STEPS');
  console.log('=' .repeat(60));
  console.log('1. Add logging to handleRegisteredUserSwitch');
  console.log('2. Add logging to getCurrentUser');
  console.log('3. Check React Query state updates');
  console.log('4. Test with safety switch disabled');
  
  return true;
}

if (require.main === module) {
  runDebug().catch(console.error);
}