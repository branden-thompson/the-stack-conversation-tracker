/**
 * Clear Theme Emergency Disable Utility
 * 
 * Clears the emergency disable flag that blocks user theme isolation.
 * This flag gets set automatically when the error boundary triggers too many times.
 * 
 * Usage: node dev-scripts/utilities/clear-theme-emergency-disable.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('🔧 Theme Emergency Disable Utility');
  console.log('==================================');
  console.log('');
  console.log('This utility will help you clear the emergency disable flag');
  console.log('that may be blocking user theme isolation functionality.');
  console.log('');
  console.log('🚨 IMPORTANT: You need to run this in the browser console');
  console.log('because localStorage is only accessible client-side.');
  console.log('');
  
  const proceed = await askQuestion('Continue? (y/n): ');
  
  if (proceed.toLowerCase() !== 'y') {
    console.log('Operation cancelled.');
    rl.close();
    return;
  }
  
  console.log('');
  console.log('📋 INSTRUCTIONS:');
  console.log('================');
  console.log('');
  console.log('1. Open your browser and navigate to the app');
  console.log('2. Open Developer Tools (F12)');
  console.log('3. Go to the Console tab');
  console.log('4. Copy and paste the following code:');
  console.log('');
  console.log('━'.repeat(60));
  console.log('// Check emergency disable status');
  console.log('const isDisabled = localStorage.getItem("user_theme_isolation_disabled") === "true";');
  console.log('const reason = localStorage.getItem("theme_emergency_disable_reason");');
  console.log('const time = localStorage.getItem("theme_emergency_disable_time");');
  console.log('');
  console.log('console.log("Emergency Disabled:", isDisabled);');
  console.log('if (isDisabled) {');
  console.log('  console.log("Reason:", reason);');
  console.log('  console.log("Time:", new Date(parseInt(time)).toLocaleString());');
  console.log('  ');
  console.log('  // Clear the flags');
  console.log('  localStorage.removeItem("user_theme_isolation_disabled");');
  console.log('  localStorage.removeItem("theme_emergency_disable_reason");');
  console.log('  localStorage.removeItem("theme_emergency_disable_time");');
  console.log('  ');
  console.log('  console.log("✅ Emergency disable cleared! Please refresh the page.");');
  console.log('} else {');
  console.log('  console.log("✅ Emergency disable was not active.");');
  console.log('}');
  console.log('━'.repeat(60));
  console.log('');
  console.log('5. Press Enter to execute the code');
  console.log('6. Refresh the page to re-enable theme isolation');
  console.log('');
  
  rl.close();
}

main().catch(console.error);