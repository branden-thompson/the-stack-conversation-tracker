/**
 * Authentication Registration API
 * POST /api/auth/register
 * 
 * Handles new user registration with email verification and invitation system
 */

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { readData, writeData } from '@/lib/utils/storage';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session';
import { USER_ROLES } from '@/lib/types/auth';

export async function POST(request) {
  try {
    const { 
      name, 
      email, 
      password, 
      confirmPassword,
      inviteToken = null,
      role = USER_ROLES.PARTICIPANT 
    } = await request.json();

    // Validate input
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get current data
    const data = await readData();
    const users = data.users || [];

    // Check if email already exists
    const existingUser = users.find(u => u.email === email.toLowerCase());
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Validate invitation token if provided
    let invitedBy = null;
    if (inviteToken) {
      const inviter = users.find(u => 
        u.inviteToken === inviteToken && 
        u.inviteExpiresAt && 
        new Date(u.inviteExpiresAt) > new Date()
      );
      
      if (!inviter) {
        return NextResponse.json(
          { error: 'Invalid or expired invitation token' },
          { status: 400 }
        );
      }
      
      invitedBy = inviter.id;
    }

    // Check if registration is open or requires invitation
    const requiresInvitation = process.env.REQUIRE_INVITATION === 'true';
    if (requiresInvitation && !inviteToken) {
      return NextResponse.json(
        { error: 'Registration requires an invitation' },
        { status: 403 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new user
    const now = new Date().toISOString();
    const userId = nanoid();
    const newUser = {
      id: userId,
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
      role: invitedBy ? role : USER_ROLES.PARTICIPANT, // Invited users can have assigned roles
      isActive: true,
      isSystemUser: false,
      emailVerified: false, // Will be true after email verification
      profilePicture: null,
      preferences: {
        theme: 'system',
        notifications: true,
        defaultCardType: 'topic'
      },
      loginAttempts: 0,
      lockedUntil: null,
      twoFactorEnabled: false,
      invitedBy,
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now
    };

    // Add user to storage
    const updatedUsers = [...users, newUser];
    await writeData({ ...data, users: updatedUsers });

    // Create session token for immediate login
    const token = createSessionToken(newUser);
    
    // Set session cookie
    setSessionCookie(token);

    // Return user data (excluding sensitive information)
    const userResponse = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      profilePicture: newUser.profilePicture,
      preferences: newUser.preferences,
      isSystemUser: newUser.isSystemUser,
      emailVerified: newUser.emailVerified,
      createdAt: newUser.createdAt
    };

    return NextResponse.json({
      success: true,
      user: userResponse,
      token: token,
      message: 'Account created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
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