/**
 * SSE Event Hub API Endpoint
 * 
 * CLASSIFICATION: APPLICATION LEVEL | SEV-0 | CRITICAL INFRASTRUCTURE
 * Central SSE endpoint for real-time event distribution
 * 
 * Features:
 * - Real-time event streaming to clients
 * - Connection health monitoring
 * - Circuit breaker protection
 * - Emergency controls
 * - Event validation and routing
 */

import { NextResponse } from 'next/server';
import { SSEHub } from '@/lib/services/sse-hub';
import { EmergencyController } from '@/lib/services/emergency-controller';
import { validateSSEAuthorization } from '@/lib/auth/sse-auth';

/**
 * SSE Connection Handler
 * Establishes real-time event stream for authenticated clients
 */
export async function GET(request) {
  try {
    // Emergency kill switch check
    if (!EmergencyController.isSSEEnabled()) {
      return new NextResponse('SSE system disabled via emergency control', { 
        status: 503,
        headers: { 'Retry-After': '60' }
      });
    }

    // Extract connection parameters
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');
    const clientId = searchParams.get('clientId') || generateClientId();

    // Validate authorization
    const authResult = await validateSSEAuthorization(sessionId, userId, request);
    if (!authResult.authorized) {
      console.warn(`SSE authorization failed: ${authResult.reason}`);
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log(`SSE connection request: userId=${userId}, sessionId=${sessionId}, clientId=${clientId}`);

    // Create SSE response stream
    const stream = new ReadableStream({
      start(controller) {
        // Register connection with SSE Hub
        const connection = SSEHub.createConnection({
          sessionId,
          userId,
          clientId,
          controller,
          request
        });

        // Send initial connection confirmation
        controller.enqueue(formatSSEMessage({
          eventType: 'connection.established',
          eventData: {
            connectionId: connection.id,
            timestamp: Date.now(),
            serverTime: new Date().toISOString()
          }
        }));

        // Send periodic heartbeat
        const heartbeatInterval = setInterval(() => {
          if (!connection.isActive) {
            clearInterval(heartbeatInterval);
            return;
          }

          try {
            controller.enqueue(formatSSEMessage({
              eventType: 'heartbeat',
              eventData: { timestamp: Date.now() }
            }));
          } catch (error) {
            console.warn('Heartbeat failed, cleaning up connection:', error.message);
            clearInterval(heartbeatInterval);
            SSEHub.removeConnection(connection.id);
          }
        }, 30000); // 30 second heartbeat

        // Handle connection cleanup on abort
        const cleanup = () => {
          clearInterval(heartbeatInterval);
          SSEHub.removeConnection(connection.id);
          console.log(`SSE connection cleaned up: ${connection.id}`);
        };

        // Listen for abort signal
        request.signal.addEventListener('abort', cleanup);
        
        // Store cleanup function for manual cleanup
        connection.cleanup = cleanup;
      }
    });

    // Return SSE response with proper headers
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    });

  } catch (error) {
    console.error('SSE endpoint error:', error);
    
    // Report error to monitoring
    SSEHub.reportError('sse-endpoint-error', error);
    
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

/**
 * Event Emission Endpoint
 * Receives events from clients and broadcasts them through the hub
 */
export async function POST(request) {
  try {
    // Emergency kill switch check
    if (!EmergencyController.isSSEEnabled()) {
      return NextResponse.json(
        { error: 'SSE system disabled via emergency control' },
        { status: 503 }
      );
    }

    // Parse event data
    const eventData = await request.json();
    
    // Extract authorization info
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId') || eventData.sessionId;
    const userId = searchParams.get('userId') || eventData.userId;

    // Validate authorization
    const authResult = await validateSSEAuthorization(sessionId, userId, request);
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Emit event through SSE Hub
    const result = await SSEHub.emit({
      ...eventData,
      sessionId,
      userId,
      timestamp: Date.now(),
      source: 'client'
    });

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        eventId: result.eventId,
        timestamp: result.timestamp
      });
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('SSE event emission error:', error);
    
    // Report error to monitoring
    SSEHub.reportError('sse-emission-error', error);
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * Health Check Endpoint
 * Returns SSE hub health status
 */
export async function HEAD(request) {
  try {
    const health = SSEHub.getHealthStatus();
    
    return new NextResponse(null, {
      status: health.status === 'healthy' ? 200 : 503,
      headers: {
        'X-SSE-Health': health.status,
        'X-SSE-Connections': health.metrics.connections.active.toString(),
        'X-SSE-Latency': health.metrics.performance.averageLatency.toString()
      }
    });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}

/**
 * Utility Functions
 */

function generateClientId() {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function formatSSEMessage(event) {
  const data = JSON.stringify({
    eventType: event.eventType,
    eventData: event.eventData,
    timestamp: event.timestamp || Date.now()
  });
  
  return `data: ${data}\n\n`;
}