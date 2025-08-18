/**
 * Performance Metrics API
 * 
 * Handles collection, storage, and retrieval of performance metrics
 * Provides endpoints for real-time monitoring and historical analysis
 */

import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const METRICS_DIR = path.join(process.cwd(), 'data', 'performance');
const DAILY_METRICS_FILE = (date) => path.join(METRICS_DIR, `metrics-${date}.json`);
const SUMMARY_FILE = path.join(METRICS_DIR, 'performance-summary.json');

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

// Write daily metrics file
async function writeDailyMetrics(date, data) {
  try {
    await ensureMetricsDirectory();
    const filePath = DAILY_METRICS_FILE(date);
    await writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Failed to write metrics for ${date}:`, error);
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