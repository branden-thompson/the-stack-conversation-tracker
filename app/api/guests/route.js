/**
 * Guest Users API Routes
 * 
 * Handles guest user creation, session management, and coordination
 * Routes: GET /api/guests, POST /api/guests, PATCH /api/guests/[id]
 */

import { NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/db/database.js';
import { 
  createGuestUser, 
  guestCleanup 
} from '@/lib/auth/guest-session.js';
import { serverGuestSession } from '@/lib/auth/guest-session-server.js';
import { avatarPool, getGuestAvatarDataURL } from '@/lib/guest-avatars.js';

// In-memory storage for active guest sessions
// In production, this would be stored in Redis or a database
let activeGuestSessions = new Map();

/**
 * Cleanup expired guest sessions periodically
 */
function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [sessionId, sessionData] of activeGuestSessions.entries()) {
    if (now > sessionData.expiresAt) {
      // Release avatar before deleting session
      if (sessionData && sessionData.user) {
        avatarPool.releaseAvatar(sessionData.user.id);
      }
      activeGuestSessions.delete(sessionId);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredSessions, 5 * 60 * 1000);

/**
 * GET /api/guests
 * Fetch active guest users and session information
 */
export async function GET(request) {
  try {
    cleanupExpiredSessions();
    
    // Get current active guest sessions
    const activeSessions = Array.from(activeGuestSessions.values())
      .filter(session => Date.now() < session.expiresAt)
      .map(session => ({
        user: {
          id: session.user.id,
          name: session.user.name,
          isGuest: true,
          isActive: true,
          profilePicture: null
        },
        sessionId: session.sessionId,
        lastActive: session.lastActive,
        createdAt: session.createdAt
      }));

    return NextResponse.json({
      activeGuests: activeSessions,
      totalActiveSessions: activeSessions.length
    });
  } catch (error) {
    console.error('Error fetching guest sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guest sessions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/guests
 * Create a new guest user session
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { customName, sessionFingerprint } = body;

    // Get existing users to avoid name conflicts
    const existingUsers = await getAllUsers();
    const existingGuestUsers = Array.from(activeGuestSessions.values())
      .map(session => session.user);
    
    const allUsers = [...existingUsers, ...existingGuestUsers];

    // Create new guest user
    const guestUser = createGuestUser(allUsers, customName);
    
    // Assign an avatar to the guest user
    const avatar = avatarPool.assignAvatar(guestUser.id);
    guestUser.profilePicture = avatar.svg ? getGuestAvatarDataURL(guestUser.id) : null;
    guestUser.avatarConfig = {
      color: avatar.color,
      shape: avatar.shape,
      pattern: avatar.pattern
    };
    
    // Generate session ID and create session data
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessionData = {
      sessionId,
      user: guestUser,
      fingerprint: sessionFingerprint,
      createdAt: Date.now(),
      lastActive: Date.now(),
      expiresAt: guestUser.sessionExpires
    };

    // Store session
    activeGuestSessions.set(sessionId, sessionData);

    // Create guest session token for API authentication
    const sessionToken = serverGuestSession.createToken(guestUser);

    return NextResponse.json({
      user: guestUser,
      sessionId,
      token: sessionToken,
      expiresAt: guestUser.sessionExpires
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating guest user:', error);
    return NextResponse.json(
      { error: 'Failed to create guest user' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/guests
 * Update guest user information or extend session
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { sessionId, updates, action } = body;

    if (!sessionId || !activeGuestSessions.has(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 404 }
      );
    }

    const sessionData = activeGuestSessions.get(sessionId);
    
    // Check if session is expired
    if (Date.now() > sessionData.expiresAt) {
      activeGuestSessions.delete(sessionId);
      return NextResponse.json(
        { error: 'Session expired' },
        { status: 410 }
      );
    }

    if (action === 'extend') {
      // Extend session
      const newExpiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      sessionData.expiresAt = newExpiresAt;
      sessionData.user.sessionExpires = newExpiresAt;
      sessionData.lastActive = Date.now();
      
      activeGuestSessions.set(sessionId, sessionData);
      
      return NextResponse.json({
        user: sessionData.user,
        expiresAt: newExpiresAt
      });
    }

    if (action === 'update' && updates) {
      // Update user information
      const updatedUser = {
        ...sessionData.user,
        ...updates,
        updatedAt: Date.now()
      };
      
      sessionData.user = updatedUser;
      sessionData.lastActive = Date.now();
      activeGuestSessions.set(sessionId, sessionData);
      
      return NextResponse.json({
        user: updatedUser
      });
    }

    if (action === 'heartbeat') {
      // Update last active timestamp
      sessionData.lastActive = Date.now();
      activeGuestSessions.set(sessionId, sessionData);
      
      return NextResponse.json({
        acknowledged: true,
        lastActive: sessionData.lastActive
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating guest session:', error);
    return NextResponse.json(
      { error: 'Failed to update guest session' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/guests
 * Remove a guest session
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    if (activeGuestSessions.has(sessionId)) {
      const sessionData = activeGuestSessions.get(sessionId);
      // Release the avatar back to the pool
      if (sessionData && sessionData.user) {
        avatarPool.releaseAvatar(sessionData.user.id);
      }
      activeGuestSessions.delete(sessionId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Session not found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error deleting guest session:', error);
    return NextResponse.json(
      { error: 'Failed to delete guest session' },
      { status: 500 }
    );
  }
}