#!/usr/bin/env node

/**
 * Update Coverage Data Script
 * 
 * This script updates the coverage data file with new test results.
 * It's called by the post-commit hook to keep coverage data current.
 */

import { readFile, writeFile } from 'fs/promises';
import path from 'path';

async function updateCoverageDataFile(testResults, coverage) {
  console.log('📊 Updating coverage data file...');
  
  const dataFilePath = path.join(process.cwd(), 'data/coverage-data.js');
  
  // Read the current data file
  let content;
  try {
    content = await readFile(dataFilePath, 'utf8');
    
    // Safety check
    if (content.length > 2000000) { // 2MB limit
      throw new Error(`Coverage data file too large: ${content.length} bytes`);
    }
    
    if (content.length === 0) {
      throw new Error('Coverage data file is empty');
    }
  } catch (error) {
    console.error('❌ Error reading coverage data file:', error.message);
    return false;
  }
  
  // Update summary
  const totalLines = Math.round(coverage.lines > 0 ? 200 : 180);
  const coveredLines = Math.round(totalLines * (coverage.statements / 100));
  
  const newSummary = `  summary: {
    statements: { covered: ${coveredLines}, total: ${totalLines}, percentage: ${coverage.statements.toFixed(2)} },
    branches: { covered: ${Math.round(totalLines * 0.6 * (coverage.branches / 100))}, total: ${Math.round(totalLines * 0.6)}, percentage: ${coverage.branches.toFixed(2)} },
    functions: { covered: ${Math.round(totalLines * 0.35 * (coverage.functions / 100))}, total: ${Math.round(totalLines * 0.35)}, percentage: ${coverage.functions.toFixed(2)} },
    lines: { covered: ${coveredLines}, total: ${totalLines}, percentage: ${coverage.lines.toFixed(2)} }
  }`;

  // Add new test history entry with coverage
  const now = new Date().toISOString();
  const newHistoryEntry = `    { date: '${now}', totalTests: ${testResults.totalTests}, passed: ${testResults.passedTests}, failed: ${testResults.failedTests}, duration: ${parseFloat(testResults.duration)} },`;
  
  // Replace summary
  let updatedContent = content.replace(
    /summary:\s*\{[\s\S]*?\n\s*\}/,
    newSummary
  );
  
  // Add new history entry at the beginning of testHistory array
  updatedContent = updatedContent.replace(
    /(testHistory:\s*\[\s*\n)/,
    `$1${newHistoryEntry}\n`
  );
  
  // Prevent runaway history - keep only last 30 entries
  const historyMatch = updatedContent.match(/(testHistory:\s*\[\s*\n)([\s\S]*?)(\s*\]\s*\})/);
  if (historyMatch) {
    const entries = historyMatch[2].split('\n').filter(line => line.trim().startsWith('{ date:'));
    if (entries.length > 30) {
      console.log(`📋 Trimming history from ${entries.length} to 30 entries`);
      const trimmedEntries = entries.slice(0, 30).join('\n');
      updatedContent = updatedContent.replace(
        /(testHistory:\s*\[\s*\n)[\s\S]*?(\s*\]\s*\})/,
        `$1${trimmedEntries}\n$2`
      );
    }
  }
  
  // Safety checks
  if (updatedContent === content) {
    console.warn('⚠️  No changes detected in coverage data');
    return false;
  }
  
  if (updatedContent.length > 2000000) { // 2MB limit
    console.error('❌ Updated content too large, aborting write');
    return false;
  }
  
  try {
    await writeFile(dataFilePath, updatedContent);
    console.log('✅ Coverage data file updated successfully');
    return true;
  } catch (error) {
    console.error('❌ Error writing coverage data file:', error.message);
    return false;
  }
}

export { updateCoverageDataFile };