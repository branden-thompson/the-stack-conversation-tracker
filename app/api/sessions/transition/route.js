/**
 * Session State Transition API
 * Handles transitions between active/inactive states with 5-second delays
 */

import { NextResponse } from 'next/server';
import sessionManager from '@/lib/services/session-manager';
import { SESSION_STATUS } from '@/lib/utils/session-constants';

const { sessionStore } = sessionManager;

// PATCH /api/sessions/transition - Transition session state
export async function PATCH(request) {
  try {
    const { userId, newStatus, reason } = await request.json();
    
    if (!userId || !newStatus) {
      return NextResponse.json(
        { error: 'userId and newStatus are required' },
        { status: 400 }
      );
    }
    
    if (!Object.values(SESSION_STATUS).includes(newStatus)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: active, inactive, idle, ended' },
        { status: 400 }
      );
    }
    
    console.log(`[Sessions Transition] Transitioning user ${userId} to ${newStatus} (reason: ${reason || 'none'})`);
    
    // Find all sessions for this user
    const userSessions = [];
    for (const [sessionId, session] of sessionStore.entries()) {
      if (session.userId === userId) {
        userSessions.push({ id: sessionId, session });
      }
    }
    
    if (userSessions.length === 0) {
      return NextResponse.json(
        { error: 'No sessions found for user' },
        { status: 404 }
      );
    }
    
    // Update all sessions for this user
    let updatedCount = 0;
    userSessions.forEach(({ session }) => {
      if (session.status !== newStatus) {
        session.status = newStatus;
        session.lastActivityAt = Date.now();
        session.statusChangedAt = Date.now();
        session.statusChangeReason = reason || 'manual_transition';
        updatedCount++;
      }
    });
    
    console.log(`[Sessions Transition] Updated ${updatedCount} sessions for user ${userId} to ${newStatus}`);
    
    return NextResponse.json({
      success: true,
      message: `Transitioned ${updatedCount} session(s) to ${newStatus}`,
      userId,
      newStatus,
      updatedCount,
      reason
    });
    
  } catch (error) {
    console.error('[Sessions Transition] Error transitioning session state:', error);
    return NextResponse.json(
      { error: 'Failed to transition session state' },
      { status: 500 }
    );
  }
}