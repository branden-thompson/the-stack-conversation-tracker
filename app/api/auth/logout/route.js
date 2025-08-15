/**
 * Authentication Logout API
 * POST /api/auth/logout
 * 
 * Handles user logout and session cleanup
 */

import { NextResponse } from 'next/server';
import { clearSessionCookie, getSessionFromCookie } from '@/lib/auth/session';

export async function POST(request) {
  try {
    // Get current session to log the logout
    const session = getSessionFromCookie();
    
    // Clear the session cookie
    clearSessionCookie();

    // Optional: Log the logout event
    if (session.valid) {
      console.log(`User ${session.user.name} (${session.user.email}) logged out at ${new Date().toISOString()}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, clear the cookie to ensure logout
    clearSessionCookie();
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}