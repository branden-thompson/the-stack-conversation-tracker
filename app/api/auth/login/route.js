/**
 * Authentication Login API
 * POST /api/auth/login
 * 
 * Handles user login with email/password authentication
 */

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getAllUsers, updateUser } from '@/lib/db/database';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { USER_ROLES } from '@/lib/types/auth';

export async function POST(request) {
  try {
    const { email, password, rememberMe = false } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Get users from database
    const users = await getAllUsers();

    // Find user by email
    const user = users.find(u => u.email === email.toLowerCase());
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account is active
    if (user.isActive === false) {
      return NextResponse.json(
        { error: 'Account is disabled. Please contact an administrator.' },
        { status: 403 }
      );
    }

    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      return NextResponse.json(
        { error: 'Account is temporarily locked due to multiple failed login attempts' },
        { status: 423 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      // Increment failed login attempts
      const updatedUser = {
        ...user,
        loginAttempts: (user.loginAttempts || 0) + 1,
        lockedUntil: (user.loginAttempts || 0) >= 4 ? 
          new Date(Date.now() + 15 * 60 * 1000) : // Lock for 15 minutes after 5 attempts
          user.lockedUntil
      };

      // Update user in database
      await updateUser(user.id, {
        failedLoginAttempts: updatedUser.failedLoginAttempts,
        lockedUntil: updatedUser.lockedUntil
      });

      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Successful login - reset login attempts and update last login
    const now = new Date().toISOString();
    const updatedUser = {
      ...user,
      loginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: now,
      updatedAt: now
    };

    // Update user in database
    await updateUser(user.id, {
      lastLoginAt: updatedUser.lastLoginAt,
      failedLoginAttempts: 0,
      lockedUntil: null
    });

    // Create session token
    const token = createSessionToken(updatedUser);
    
    // Set session cookie
    setSessionCookie(token);

    // Return user data (excluding sensitive information)
    const userResponse = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profilePicture: updatedUser.profilePicture,
      preferences: updatedUser.preferences,
      isSystemUser: updatedUser.isSystemUser || false,
      lastLoginAt: updatedUser.lastLoginAt
    };

    return NextResponse.json({
      success: true,
      user: userResponse,
      token: token // Also return token for client-side storage if needed
    });

  } catch (error) {
    console.error('Login error:', error);
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}