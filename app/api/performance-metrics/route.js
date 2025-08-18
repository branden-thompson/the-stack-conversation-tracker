/**
 * Performance Metrics API
 * 
 * Handles collection, storage, and retrieval of performance metrics
 * Provides endpoints for real-time monitoring and historical analysis
 */

import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir, copyFile, rename } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const METRICS_DIR = path.join(process.cwd(), 'data', 'performance');
const DAILY_METRICS_FILE = (date) => path.join(METRICS_DIR, `metrics-${date}.json`);
const SUMMARY_FILE = path.join(METRICS_DIR, 'performance-summary.json');

// Safety limits for data protection
const SAFETY_LIMITS = {
  MAX_FILE_SIZE_MB: 10,
  MAX_METRICS_PER_SESSION: 1000,
  MAX_SESSIONS_PER_DAY: 500,
  MAX_METRIC_SIZE_KB: 100
};

// Ensure metrics directory exists
async function ensureMetricsDirectory() {
  try {
    if (!existsSync(METRICS_DIR)) {
      await mkdir(METRICS_DIR, { recursive: true });
    }
  } catch (error) {
    console.error('Failed to create metrics directory:', error);
  }
}

// Get today's date string
function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

// Read daily metrics file
async function readDailyMetrics(date) {
  try {
    const filePath = DAILY_METRICS_FILE(date);
    if (!existsSync(filePath)) {
      return { date, sessions: {}, summary: null };
    }
    const content = await readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to read metrics for ${date}:`, error);
    return { date, sessions: {}, summary: null };
  }
}

/**
 * Validate metrics data structure to prevent corruption
 */
function validateMetricsData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Metrics data must be an object');
  }
  
  if (!data.date || typeof data.date !== 'string') {
    throw new Error('Metrics data must have a valid date string');
  }
  
  if (!data.sessions || typeof data.sessions !== 'object') {
    throw new Error('Metrics data must have a sessions object');
  }
  
  // Check session limits
  const sessionCount = Object.keys(data.sessions).length;
  if (sessionCount > SAFETY_LIMITS.MAX_SESSIONS_PER_DAY) {
    throw new Error(`Too many sessions: ${sessionCount} > ${SAFETY_LIMITS.MAX_SESSIONS_PER_DAY}`);
  }
  
  // Check metrics per session
  for (const [sessionId, session] of Object.entries(data.sessions)) {
    if (!session.metrics || !Array.isArray(session.metrics)) {
      throw new Error(`Session ${sessionId} must have metrics array`);
    }
    
    if (session.metrics.length > SAFETY_LIMITS.MAX_METRICS_PER_SESSION) {
      throw new Error(`Session ${sessionId} has too many metrics: ${session.metrics.length} > ${SAFETY_LIMITS.MAX_METRICS_PER_SESSION}`);
    }
  }
  
  // Check data size
  const dataString = JSON.stringify(data);
  const sizeKB = Buffer.byteLength(dataString, 'utf8') / 1024;
  const sizeMB = sizeKB / 1024;
  
  if (sizeMB > SAFETY_LIMITS.MAX_FILE_SIZE_MB) {
    throw new Error(`Metrics file too large: ${sizeMB.toFixed(2)}MB > ${SAFETY_LIMITS.MAX_FILE_SIZE_MB}MB`);
  }
  
  return { sizeKB, sizeMB, sessionCount };
}

/**
 * Atomic write operation with backup and validation
 */
async function safeWriteMetrics(filePath, data) {
  // Validate data structure first
  const validation = validateMetricsData(data);
  
  await ensureMetricsDirectory();
  
  // Create backup if file exists
  if (existsSync(filePath)) {
    const backupPath = filePath + '.backup';
    try {
      await copyFile(filePath, backupPath);
    } catch (error) {
      console.warn(`Failed to create backup for ${filePath}:`, error.message);
      // Continue anyway - backup failure shouldn't block writes
    }
  }
  
  // Atomic write using temporary file
  const tempPath = filePath + '.tmp';
  const dataString = JSON.stringify(data, null, 2);
  
  try {
    await writeFile(tempPath, dataString, 'utf8');
    await rename(tempPath, filePath); // Atomic on most filesystems
    
    return {
      success: true,
      validation,
      filePath,
      timestamp: Date.now()
    };
  } catch (error) {
    // Clean up temp file if it exists
    try {
      if (existsSync(tempPath)) {
        await require('fs/promises').unlink(tempPath);
      }
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp file:', cleanupError.message);
    }
    throw error;
  }
}

// Write daily metrics file with safety measures
async function writeDailyMetrics(date, data) {
  try {
    const result = await safeWriteMetrics(DAILY_METRICS_FILE(date), data);
    
    // Log successful write with metrics
    console.log(`[Performance Metrics] Successfully wrote ${date} metrics:`, {
      sessions: result.validation.sessionCount,
      sizeMB: result.validation.sizeMB.toFixed(2),
      file: path.basename(result.filePath)
    });
    
    return result;
  } catch (error) {
    console.error(`[Performance Metrics] Failed to write metrics for ${date}:`, {
      error: error.message,
      date,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

// Process and store metrics
async function storeMetrics(metrics) {
  const today = getTodayString();
  const dailyData = await readDailyMetrics(today);

  // Group metrics by session
  metrics.forEach(metric => {
    const sessionId = metric.sessionId;
    
    if (!dailyData.sessions[sessionId]) {
      dailyData.sessions[sessionId] = {
        sessionId,
        startTime: metric.timestamp,
        lastActivity: metric.timestamp,
        metrics: [],
        summary: {
          apiCalls: 0,
          navigations: 0,
          memoryMeasurements: 0,
          averageApiTime: 0,
          averageNavTime: 0,
          peakMemory: 0,
          errors: 0
        }
      };
    }

    const session = dailyData.sessions[sessionId];
    session.metrics.push(metric);
    session.lastActivity = Math.max(session.lastActivity, metric.timestamp);

    // Update session summary
    switch (metric.type) {
      case 'api_performance':
        session.summary.apiCalls++;
        session.summary.averageApiTime = 
          (session.summary.averageApiTime * (session.summary.apiCalls - 1) + metric.data.duration) / 
          session.summary.apiCalls;
        if (!metric.data.ok) session.summary.errors++;
        break;
        
      case 'navigation_timing':
        session.summary.navigations++;
        session.summary.averageNavTime = 
          (session.summary.averageNavTime * (session.summary.navigations - 1) + metric.data.navigationTime) / 
          session.summary.navigations;
        break;
        
      case 'memory_usage':
        session.summary.memoryMeasurements++;
        session.summary.peakMemory = Math.max(session.summary.peakMemory, metric.data.usedJSHeapSize);
        break;
    }
  });

  // Generate daily summary
  const sessions = Object.values(dailyData.sessions);
  dailyData.summary = {
    date: today,
    totalSessions: sessions.length,
    totalMetrics: sessions.reduce((sum, s) => sum + s.metrics.length, 0),
    averageApiTime: sessions.reduce((sum, s) => sum + s.summary.averageApiTime, 0) / Math.max(sessions.length, 1),
    averageNavTime: sessions.reduce((sum, s) => sum + s.summary.averageNavTime, 0) / Math.max(sessions.length, 1),
    totalApiCalls: sessions.reduce((sum, s) => sum + s.summary.apiCalls, 0),
    totalNavigations: sessions.reduce((sum, s) => sum + s.summary.navigations, 0),
    totalErrors: sessions.reduce((sum, s) => sum + s.summary.errors, 0),
    peakMemoryUsage: Math.max(...sessions.map(s => s.summary.peakMemory)),
    generatedAt: Date.now()
  };

  await writeDailyMetrics(today, dailyData);
  return dailyData.summary;
}

// Calculate performance health status
function calculateHealthStatus(summary) {
  const issues = [];
  const warnings = [];
  
  if (summary.averageApiTime > 1000) {
    issues.push('High API response times');
  } else if (summary.averageApiTime > 500) {
    warnings.push('Elevated API response times');
  }
  
  if (summary.averageNavTime > 2000) {
    issues.push('Slow navigation times');
  } else if (summary.averageNavTime > 1000) {
    warnings.push('Navigation could be faster');
  }
  
  const errorRate = summary.totalApiCalls > 0 ? summary.totalErrors / summary.totalApiCalls : 0;
  if (errorRate > 0.05) {
    issues.push('High error rate');
  } else if (errorRate > 0.01) {
    warnings.push('Some errors detected');
  }
  
  const memoryUsageMB = summary.peakMemoryUsage / 1048576;
  if (memoryUsageMB > 100) {
    issues.push('High memory usage');
  } else if (memoryUsageMB > 50) {
    warnings.push('Elevated memory usage');
  }

  let status = 'optimal';
  if (issues.length > 0) {
    status = 'poor';
  } else if (warnings.length > 0) {
    status = 'degraded';
  }

  return {
    status,
    issues,
    warnings,
    errorRate,
    memoryUsageMB
  };
}

// POST - Store performance metrics
export async function POST(request) {
  try {
    const { metrics } = await request.json();
    
    if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No metrics provided' 
      }, { status: 400 });
    }

    // Store metrics and get summary
    const summary = await storeMetrics(metrics);
    const health = calculateHealthStatus(summary);

    return NextResponse.json({ 
      success: true, 
      stored: metrics.length,
      summary: {
        ...summary,
        health
      }
    });
    
  } catch (error) {
    console.error('Failed to store performance metrics:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to store metrics' 
    }, { status: 500 });
  }
}

// GET - Retrieve performance metrics and summaries
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get('date') || getTodayString();
    const sessionId = url.searchParams.get('sessionId');
    const summary = url.searchParams.get('summary') === 'true';
    const health = url.searchParams.get('health') === 'true';
    const days = parseInt(url.searchParams.get('days') || '7');

    // Health check request
    if (health) {
      const today = getTodayString();
      const dailyData = await readDailyMetrics(today);
      
      if (!dailyData.summary) {
        return NextResponse.json({
          status: 'optimal',
          message: 'No metrics available yet',
          timestamp: Date.now()
        });
      }

      const healthStatus = calculateHealthStatus(dailyData.summary);
      return NextResponse.json({
        ...healthStatus,
        summary: dailyData.summary,
        timestamp: Date.now()
      });
    }

    // Multi-day summary request
    if (summary) {
      const summaries = [];
      const today = new Date();
      
      for (let i = 0; i < days; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        const dailyData = await readDailyMetrics(dateString);
        if (dailyData.summary) {
          summaries.push({
            ...dailyData.summary,
            health: calculateHealthStatus(dailyData.summary)
          });
        }
      }
      
      return NextResponse.json({
        summaries,
        period: `${days} days`,
        generatedAt: Date.now()
      });
    }

    // Specific session request
    if (sessionId) {
      const dailyData = await readDailyMetrics(date);
      const session = dailyData.sessions[sessionId];
      
      if (!session) {
        return NextResponse.json({ 
          error: 'Session not found' 
        }, { status: 404 });
      }
      
      return NextResponse.json(session);
    }

    // Daily data request
    const dailyData = await readDailyMetrics(date);
    
    // Return summary by default, full data if requested
    const full = url.searchParams.get('full') === 'true';
    if (full) {
      return NextResponse.json(dailyData);
    } else {
      return NextResponse.json({
        date: dailyData.date,
        summary: dailyData.summary,
        sessionCount: Object.keys(dailyData.sessions).length,
        sessions: Object.values(dailyData.sessions).map(s => ({
          sessionId: s.sessionId,
          startTime: s.startTime,
          lastActivity: s.lastActivity,
          metricsCount: s.metrics.length,
          summary: s.summary
        }))
      });
    }
    
  } catch (error) {
    console.error('Failed to retrieve performance metrics:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve metrics' 
    }, { status: 500 });
  }
}

// DELETE - Clean up old metrics
export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const daysBefore = parseInt(url.searchParams.get('daysBefore') || '30');
    
    // This would implement cleanup of old metric files
    // For now, just return success
    return NextResponse.json({ 
      success: true,
      message: `Would clean up metrics older than ${daysBefore} days`
    });
    
  } catch (error) {
    console.error('Failed to clean up metrics:', error);
    return NextResponse.json({ 
      error: 'Failed to clean up metrics' 
    }, { status: 500 });
  }
}