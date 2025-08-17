/**
 * Browser Session Management API
 * 
 * Tracks individual browser tabs/windows and their associated users
 * Ensures each tab has its own provisioned guest and maintains user selection across refreshes
 * 
 * GET /api/browser-sessions/:id - Get browser session info
 * POST /api/browser-sessions - Create or update browser session
 * DELETE /api/browser-sessions/:id - End browser session
 */

import { NextResponse } from 'next/server';
import sessionManager from '@/lib/services/session-manager';
import { createGuestUser } from '@/lib/auth/guest-session';

const { browserSessions, sessionStore } = sessionManager;

/**
 * GET - Retrieve browser session information
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const browserSessionId = searchParams.get('id');
    
    if (!browserSessionId) {
      return NextResponse.json(
        { error: 'Browser session ID required' },
        { status: 400 }
      );
    }
    
    const browserSession = browserSessions.get(browserSessionId);
    
    if (!browserSession) {
      console.log('[BrowserSessions API] Browser session not found:', browserSessionId);
      return NextResponse.json(
        { error: 'Browser session not found' },
        { status: 404 }
      );
    }
    
    console.log('[BrowserSessions API] Retrieved browser session:', browserSessionId, {
      activeUserId: browserSession.activeUserId,
      activeUserType: browserSession.activeUserType
    });
    
    return NextResponse.json(browserSession);
  } catch (error) {
    console.error('[BrowserSessions API] Error retrieving browser session:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve browser session' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create or update browser session
 * This is called when a browser tab initializes or switches users
 * Also handles DELETE via sendBeacon (which can only send POST)
 */
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Handle DELETE via sendBeacon (which sends POST with method: 'DELETE')
    if (body.method === 'DELETE') {
      const { searchParams } = new URL(request.url);
      const browserSessionId = searchParams.get('id');
      
      if (!browserSessionId) {
        return NextResponse.json(
          { error: 'Browser session ID required for deletion' },
          { status: 400 }
        );
      }
      
      const browserSession = browserSessions.get(browserSessionId);
      
      if (!browserSession) {
        return NextResponse.json(
          { error: 'Browser session not found' },
          { status: 404 }
        );
      }
      
      console.log('[BrowserSessions API] Ending browser session (via sendBeacon):', browserSessionId);
      
      // Mark any active sessions for the provisioned guest as ended
      if (browserSession.provisionedGuest) {
        for (const [id, session] of sessionStore.entries()) {
          if (session.userId === browserSession.provisionedGuest.id && 
              session.status === 'active') {
            console.log('[BrowserSessions API] Ending provisioned guest session:', id);
            session.status = 'ended';
            session.endedAt = Date.now();
          }
        }
      }
      
      // Delete the browser session
      browserSessions.delete(browserSessionId);
      
      return NextResponse.json({ 
        success: true,
        message: 'Browser session ended via sendBeacon',
        browserSessionId 
      });
    }
    
    const { 
      browserSessionId, 
      activeUserId,
      activeUserType,
      metadata 
    } = body;
    
    if (!browserSessionId) {
      return NextResponse.json(
        { error: 'Browser session ID required' },
        { status: 400 }
      );
    }
    
    // Check if browser session exists
    let browserSession = browserSessions.get(browserSessionId);
    
    if (!browserSession) {
      // Create new browser session
      console.log('[BrowserSessions API] Creating new browser session:', browserSessionId);
      
      // Generate a provisioned guest for this browser session
      const existingUsers = Array.from(sessionStore.values())
        .filter(s => s.userType === 'registered')
        .map(s => ({ id: s.userId, name: s.userName }));
      
      const provisionedGuest = createGuestUser(existingUsers);
      
      browserSession = {
        id: browserSessionId,
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        provisionedGuest: {
          id: provisionedGuest.id,
          name: provisionedGuest.name,
          profilePicture: provisionedGuest.profilePicture,
          preferences: provisionedGuest.preferences,
          isGuest: true  // Critical: Mark as guest so GlobalSessionProvider knows the type
        },
        activeUserId: activeUserId || provisionedGuest.id,
        activeUserType: activeUserType || 'guest',
        metadata: metadata || {}
      };
      
      browserSessions.set(browserSessionId, browserSession);
      
      console.log('[BrowserSessions API] Created browser session with provisioned guest:', 
        provisionedGuest.name, provisionedGuest.id);
      
      return NextResponse.json(browserSession, { status: 201 });
    }
    
    // Update existing browser session
    console.log('[BrowserSessions API] Updating browser session:', browserSessionId, {
      oldUser: browserSession.activeUserId,
      newUser: activeUserId
    });
    
    // Update active user if provided
    if (activeUserId !== undefined) {
      browserSession.activeUserId = activeUserId;
      browserSession.activeUserType = activeUserType;
    }
    
    browserSession.lastActivityAt = Date.now();
    
    // Update metadata if provided
    if (metadata) {
      browserSession.metadata = {
        ...browserSession.metadata,
        ...metadata
      };
    }
    
    return NextResponse.json(browserSession);
  } catch (error) {
    console.error('[BrowserSessions API] Error managing browser session:', error);
    return NextResponse.json(
      { error: 'Failed to manage browser session' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - End browser session (tab closed)
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const browserSessionId = searchParams.get('id');
    
    if (!browserSessionId) {
      return NextResponse.json(
        { error: 'Browser session ID required' },
        { status: 400 }
      );
    }
    
    const browserSession = browserSessions.get(browserSessionId);
    
    if (!browserSession) {
      return NextResponse.json(
        { error: 'Browser session not found' },
        { status: 404 }
      );
    }
    
    console.log('[BrowserSessions API] Ending browser session:', browserSessionId, {
      activeUserId: browserSession.activeUserId,
      provisionedGuestId: browserSession.provisionedGuest?.id
    });
    
    // Mark any active sessions for the provisioned guest as ended
    if (browserSession.provisionedGuest) {
      for (const [id, session] of sessionStore.entries()) {
        if (session.userId === browserSession.provisionedGuest.id && 
            session.status === 'active') {
          console.log('[BrowserSessions API] Ending provisioned guest session:', id);
          session.status = 'ended';
          session.endedAt = Date.now();
        }
      }
    }
    
    // Delete the browser session
    browserSessions.delete(browserSessionId);
    
    return NextResponse.json({ 
      success: true,
      message: 'Browser session ended',
      browserSessionId 
    });
  } catch (error) {
    console.error('[BrowserSessions API] Error ending browser session:', error);
    return NextResponse.json(
      { error: 'Failed to end browser session' },
      { status: 500 }
    );
  }
}