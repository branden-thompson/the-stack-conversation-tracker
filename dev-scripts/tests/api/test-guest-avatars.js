/**
 * Test script for guest avatar system
 * Run with: node test-guest-avatars.js
 */

import { getGuestAvatarDataURL, getGuestAvatarConfig, generateAvatarPool } from './lib/guest-avatars.js';

console.log('🎨 Testing Guest Avatar System\n');

// Test 1: Generate avatars for different guest IDs
console.log('1. Testing avatar generation for different guest IDs:');
const guestIds = ['guest_1', 'guest_2', 'guest_3', 'guest_abc', 'guest_xyz', 
                  'guest_monster', 'guest_happy', 'guest_cool', 'guest_ninja',
                  'guest_robot', 'guest_alien', 'guest_dragon'];

guestIds.forEach(id => {
  const config = getGuestAvatarConfig(id);
  console.log(`  ${id}: ${config.shape} monster, ${config.eyeStyle} eyes, ${config.mouthStyle} mouth, ${config.feature} feature`);
});

// Test 2: Generate data URLs
console.log('\n2. Testing data URL generation:');
const dataUrl = getGuestAvatarDataURL('guest_test');
console.log(`  Data URL generated: ${dataUrl.substring(0, 50)}...`);

// Test 3: Avatar pool
console.log('\n3. Testing avatar pool generation:');
const pool = generateAvatarPool(10);
console.log(`  Generated ${pool.length} avatars in pool`);
console.log('  First 3 avatars:');
pool.slice(0, 3).forEach(avatar => {
  console.log(`    - ${avatar.id}: ${avatar.shape} monster with ${avatar.eyeStyle} eyes, inUse: ${avatar.inUse}`);
});

// Test 4: Test avatar HTML output
console.log('\n4. Creating test HTML file to visualize avatars:');
const testHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Guest Avatar Test</title>
  <style>
    body { font-family: sans-serif; padding: 20px; background: #f5f5f5; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 20px; }
    .avatar-card { 
      background: white; 
      border-radius: 8px; 
      padding: 15px; 
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .avatar { width: 80px; height: 80px; margin: 0 auto 10px; }
    .label { font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <h1>Guest Avatar Gallery</h1>
  <div class="grid">
    ${guestIds.map(id => {
      const config = getGuestAvatarConfig(id);
      return `
        <div class="avatar-card">
          <div class="avatar">${config.svg}</div>
          <div class="label">${id}</div>
          <div class="label" style="font-size: 10px;">
            ${config.shape} • ${config.eyeStyle} eyes
          </div>
        </div>
      `;
    }).join('')}
  </div>
</body>
</html>`;

import fs from 'fs';
fs.writeFileSync('guest-avatars-test.html', testHtml);
console.log('  Created guest-avatars-test.html - open in browser to view avatars');

console.log('\n✅ Guest avatar system test complete!');