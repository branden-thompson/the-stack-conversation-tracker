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
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Guest Avatar Gallery - Dev Scripts</title>
  <link rel="stylesheet" href="../shared/ui-framework.css">
  <style>
    .avatar-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--space-lg);
      margin: var(--space-xl) 0;
    }
    
    .avatar-card {
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-md);
      padding: var(--space-lg);
      text-align: center;
      transition: all 0.2s ease;
    }
    
    .avatar-card:hover {
      border-color: var(--text-accent);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }
    
    .avatar-display {
      width: 80px;
      height: 80px;
      margin: 0 auto var(--space-md);
      border-radius: var(--radius-sm);
    }
    
    .avatar-id {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--text-accent);
      margin-bottom: var(--space-sm);
    }
    
    .avatar-details {
      font-size: 0.75rem;
      color: var(--text-secondary);
      line-height: 1.3;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: var(--space-md);
      margin: var(--space-xl) 0;
    }
    
    .stat-card {
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-md);
      padding: var(--space-md);
      text-align: center;
    }
    
    .stat-number {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-accent);
      margin-bottom: var(--space-xs);
    }
    
    .stat-label {
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
  </style>
</head>
<body class="dev-page">
  <header class="dev-header">
    <a href="../index.html" class="back-link">← Dev Scripts</a>
    <h1>🎨 Guest Avatar Gallery</h1>
  </header>

  <main class="dev-content">
    <div class="dev-card">
      <h2 class="dev-card-title">Generated Guest Avatars</h2>
      <p class="dev-card-description">
        Visual gallery of all generated guest avatar configurations.
        Each avatar is procedurally generated based on the guest ID using consistent algorithms.
      </p>
      
      <div class="dev-status dev-status-success">
        <span>✅</span>
        Generated ${guestIds.length} unique avatars
      </div>
    </div>

    <!-- Statistics -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-number">${guestIds.length}</div>
        <div class="stat-label">Total Avatars</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${new Set(guestIds.map(id => getGuestAvatarConfig(id).shape)).size}</div>
        <div class="stat-label">Unique Shapes</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${new Set(guestIds.map(id => getGuestAvatarConfig(id).eyeStyle)).size}</div>
        <div class="stat-label">Eye Styles</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">${new Set(guestIds.map(id => getGuestAvatarConfig(id).mouthStyle)).size}</div>
        <div class="stat-label">Mouth Styles</div>
      </div>
    </div>

    <!-- Avatar Gallery -->
    <div class="avatar-gallery">
      ${guestIds.map(id => {
        const config = getGuestAvatarConfig(id);
        return `
          <div class="avatar-card">
            <div class="avatar-display">${config.svg}</div>
            <div class="avatar-id">${id}</div>
            <div class="avatar-details">
              ${config.shape} monster<br>
              ${config.eyeStyle} eyes<br>
              ${config.mouthStyle} mouth<br>
              ${config.feature} feature
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- Technical Details -->
    <div class="dev-card">
      <h3 class="dev-card-title">🔧 Technical Details</h3>
      <ul style="color: var(--text-secondary); line-height: 1.6;">
        <li><strong>Generation Method:</strong> Deterministic based on guest ID hash</li>
        <li><strong>Format:</strong> SVG embedded as data URLs</li>
        <li><strong>Consistency:</strong> Same ID always generates same avatar</li>
        <li><strong>Uniqueness:</strong> Different IDs generate visually distinct avatars</li>
        <li><strong>Performance:</strong> Generated on-demand, no external dependencies</li>
      </ul>
      
      <div class="dev-status dev-status-info mt-md">
        <span>💡</span>
        Generated at ${new Date().toLocaleString()}
      </div>
    </div>
  </main>
</body>
</html>`;

import fs from 'fs';
fs.writeFileSync('guest-avatars-test.html', testHtml);
console.log('  Created guest-avatars-test.html - open in browser to view polished avatar gallery');

console.log('\n✅ Guest avatar system test complete!');