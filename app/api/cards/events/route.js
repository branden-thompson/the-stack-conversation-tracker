/**
 * Card Events API Endpoint - Real-Time Card State Synchronization
 * 
 * CLASSIFICATION: APPLICATION LEVEL | REAL-TIME EVENTS | CRITICAL
 * PURPOSE: Provide real-time card event stream for multi-user collaboration
 * 
 * SPECIAL ATTENTION: Card flip operations are debugged extensively due to historical issues
 * with 3D animations, state synchronization, and cross-user coordination
 */

import { NextResponse } from 'next/server';
import { getAllCards } from '@/lib/db/database';

/**
 * GET /api/cards/events
 * Stream all card state changes for real-time synchronization
 * 
 * Query Parameters:
 * - includeMetadata: Include debugging metadata for card flips
 * - since: Timestamp to filter events (future enhancement)
 * - conversationId: Filter by specific conversation (future enhancement)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeMetadata = searchParams.get('includeMetadata') === 'true';
    const timestamp = Date.now();
    
    // Get all current cards
    const cards = await getAllCards();
    
    // Enhanced card data with event metadata
    const cardEvents = cards.map(card => {
      const baseEvent = {
        id: card.id,
        type: card.type,
        content: card.content,
        zone: card.zone,
        position: card.position,
        stackOrder: card.stackOrder || 0,
        faceUp: card.faceUp,
        assignedTo: card.assignedTo,
        conversationId: card.conversationId,
        updatedAt: card.updatedAt,
        createdAt: card.createdAt
      };
      
      // Add debugging metadata for troubleshooting card flips
      if (includeMetadata) {
        return {
          ...baseEvent,
          _metadata: {
            eventType: 'card.state',
            timestamp: timestamp,
            flipState: {
              current: card.faceUp ? 'faceUp' : 'faceDown',
              // Add flip history if available (future enhancement)
              lastFlipped: card.updatedAt,
              flippedBy: card.flippedBy || 'unknown'
            },
            position: {
              zone: card.zone,
              coordinates: card.position,
              stack: {
                order: card.stackOrder || 0,
                isStacked: (card.stackOrder || 0) > 0
              }
            },
            debug: {
              apiEndpoint: '/api/cards/events',
              queryTimestamp: timestamp,
              cardLastModified: card.updatedAt
            }
          }
        };
      }
      
      return baseEvent;
    });
    
    // Return card events with response metadata
    const response = {
      events: cardEvents,
      meta: {
        timestamp: timestamp,
        count: cardEvents.length,
        endpoint: '/api/cards/events',
        includeMetadata: includeMetadata,
        // Add performance tracking
        responseTime: Date.now() - timestamp
      }
    };
    
    // Add debugging headers for SSE monitoring
    const headers = {
      'Content-Type': 'application/json',
      'X-Card-Events-Timestamp': timestamp.toString(),
      'X-Card-Events-Count': cardEvents.length.toString(),
      'X-API-Version': '1.0',
      // Cache control for real-time data
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    };
    
    return NextResponse.json(response, { headers });
    
  } catch (error) {
    console.error('[Card Events API] GET /api/cards/events error:', error);
    
    // Detailed error response for debugging
    return NextResponse.json(
      { 
        error: 'Failed to fetch card events',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: Date.now(),
        endpoint: '/api/cards/events'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cards/events
 * Log card events for real-time synchronization (future enhancement)
 * 
 * Body: {
 *   eventType: 'card.moved' | 'card.flipped' | 'card.updated' | 'card.created' | 'card.deleted',
 *   cardId: string,
 *   payload: object,
 *   metadata?: object
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { eventType, cardId, payload, metadata } = body;
    
    if (!eventType || !cardId) {
      return NextResponse.json(
        { error: 'eventType and cardId are required' },
        { status: 400 }
      );
    }
    
    const timestamp = Date.now();
    
    // Log the event (for now, just console logging - future: event store)
    console.log(`[Card Events] ${eventType}:`, {
      cardId,
      payload,
      metadata,
      timestamp: new Date(timestamp).toISOString()
    });
    
    // Special handling for card flip events (enhanced debugging)
    if (eventType === 'card.flipped') {
      console.log(`[Card Flip Debug] Card ${cardId} flipped:`, {
        from: payload?.from,
        to: payload?.to,
        flippedBy: payload?.flippedBy,
        zone: payload?.zone,
        timestamp: new Date(timestamp).toISOString(),
        metadata: metadata
      });
    }
    
    // Return event acknowledgment
    return NextResponse.json({
      success: true,
      eventId: `evt_${timestamp}_${cardId}`,
      timestamp: timestamp,
      acknowledged: {
        eventType,
        cardId,
        payloadReceived: !!payload
      }
    });
    
  } catch (error) {
    console.error('[Card Events API] POST /api/cards/events error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to log card event',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        timestamp: Date.now()
      },
      { status: 500 }
    );
  }
}