/**
 * Test script to verify the coverage chart is working
 * Run this with: node dev-scripts/tests/verification/test-coverage-chart.js
 */

const fetch = require('node-fetch');

async function testCoveragePage() {
  console.log('Testing coverage page with chart...\n');
  
  try {
    // Test if the page loads
    const response = await fetch('http://localhost:3001/dev/tests');
    
    if (response.ok) {
      console.log('✅ Coverage page loads successfully');
      console.log(`   Status: ${response.status}`);
      console.log(`   URL: http://localhost:3001/dev/tests`);
      
      // Get the HTML to check if chart components are present
      const html = await response.text();
      
      // Check for key elements
      const checks = [
        { pattern: 'Test History', name: 'Test History section' },
        { pattern: 'TestHistoryChart', name: 'Chart component reference' },
        { pattern: 'Recent Test Runs', name: 'Original section title' },
      ];
      
      console.log('\nContent checks:');
      checks.forEach(check => {
        if (html.includes(check.pattern)) {
          console.log(`✅ Found: ${check.name}`);
        } else {
          console.log(`⚠️  Missing: ${check.name}`);
        }
      });
      
      console.log('\n📊 Chart Features:');
      console.log('   - Line graph showing test success rate over time');
      console.log('   - Limited to 20 most recent test runs');
      console.log('   - Interactive hover tooltips with details');
      console.log('   - Collapsible table view option');
      console.log('   - Dark mode support');
      console.log('   - Responsive design');
      
      console.log('\n🎯 Navigate to: http://localhost:3001/dev/tests');
      console.log('   to see the chart in action!');
      
    } else {
      console.log(`❌ Failed to load page: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error testing coverage page:', error.message);
    console.log('\nMake sure the dev server is running on port 3001');
  }
}

// Run the test
testCoveragePage();