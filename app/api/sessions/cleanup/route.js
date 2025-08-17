/**
 * Session Cleanup API
 * DELETE /api/sessions/cleanup?userId=xxx - End all sessions for a user
 * DELETE /api/sessions/cleanup - End all sessions
 */

import { NextResponse } from 'next/server';
import { SESSION_STATUS } from '@/lib/utils/session-constants';

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // Import session store
    const { sessionStore } = await import('../route.js');
    
    let endedCount = 0;
    
    if (userId) {
      // End all sessions for specific user
      for (const [id, session] of sessionStore.entries()) {
        if (session.userId === userId && session.status === SESSION_STATUS.ACTIVE) {
          session.status = SESSION_STATUS.ENDED;
          session.endedAt = Date.now();
          endedCount++;
          console.log('[Session Cleanup] Ended session:', id, 'for user:', userId);
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `Ended ${endedCount} sessions for user ${userId}`,
        endedCount,
      });
    } else {
      // End ALL active sessions (nuclear option)
      for (const [id, session] of sessionStore.entries()) {
        if (session.status === SESSION_STATUS.ACTIVE) {
          session.status = SESSION_STATUS.ENDED;
          session.endedAt = Date.now();
          endedCount++;
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `Ended ${endedCount} active sessions`,
        endedCount,
      });
    }
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup sessions' },
      { status: 500 }
    );
  }
}