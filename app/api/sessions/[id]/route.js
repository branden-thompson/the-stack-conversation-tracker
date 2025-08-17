/**
 * Session Operations API
 * Dynamic routes for individual session operations
 */

import { NextResponse } from 'next/server';
import sessionManager from '@/lib/services/session-manager';

const { sessionStore } = sessionManager;

// PATCH /api/sessions/[id] - Update session properties
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Find session in the store
    const session = sessionStore.get(id);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Update session properties
    if (body.route !== undefined) {
      session.currentRoute = body.route;
      console.log(`[Sessions API] Updated route for session ${id}: ${body.route}`);
    }
    
    if (body.status !== undefined) {
      session.status = body.status;
    }
    
    // Always update last activity
    session.lastActivityAt = Date.now();
    
    return NextResponse.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

// DELETE /api/sessions/[id] - End a specific session
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    const session = sessionStore.get(id);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Mark as ended rather than deleting immediately
    session.status = 'ended';
    session.endedAt = Date.now();
    
    console.log(`[Sessions API] Ended session ${id}`);
    
    return NextResponse.json({
      success: true,
      message: 'Session ended'
    });
  } catch (error) {
    console.error('Error ending session:', error);
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    );
  }
}