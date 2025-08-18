/**
 * Current User API
 * GET /api/auth/me
 * 
 * Returns current authenticated user information
 */

import { NextResponse } from 'next/server';
import { getSessionFromCookie, shouldRefreshSession, createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { getUserById, getAllUsers } from '@/lib/db/database';

export async function GET(request) {
  try {
    // Get current session from cookie
    const session = await getSessionFromCookie();
    
    if (!session.valid) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get fresh user data from storage
    const users = await getAllUsers();
    const currentUser = users.find(u => u.id === session.user.id);

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user account is still active
    if (currentUser.isActive === false) {
      return NextResponse.json(
        { error: 'Account is disabled' },
        { status: 403 }
      );
    }

    // Check if session should be refreshed
    if (shouldRefreshSession(session)) {
      const newToken = createSessionToken(currentUser);
      setSessionCookie(newToken);
    }

    // Return user data (excluding sensitive information)
    const userResponse = {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      role: currentUser.role,
      profilePicture: currentUser.profilePicture,
      preferences: currentUser.preferences,
      isSystemUser: currentUser.isSystemUser || false,
      emailVerified: currentUser.emailVerified || false,
      lastLoginAt: currentUser.lastLoginAt,
      createdAt: currentUser.createdAt
    };

    return NextResponse.json({
      success: true,
      user: userResponse
    });

  } catch (error) {
    console.error('Current user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}