/**
 * Users API Routes
 * 
 * Handles CRUD operations for User entities with authentication and permissions
 * Routes: GET /api/users, POST /api/users
 */

import { NextResponse } from 'next/server';
import {
  getAllUsers,
  createUser
} from '@/lib/db/database.js';
import { withOptionalAuth, withPermission } from '@/lib/auth/middleware';
import { PERMISSIONS } from '@/lib/types/auth';
import { filterUsersForDisplay } from '@/lib/auth/permissions';

/**
 * GET /api/users
 * Fetch all users (with optional authentication and filtering)
 */
export const GET = withOptionalAuth(async (request) => {
  try {
    const users = await getAllUsers();
    
    // If not authenticated, return basic user info for collaboration
    if (!request.authenticated) {
      const basicUsers = users.map(user => ({
        id: user.id,
        name: user.name,
        profilePicture: user.profilePicture,
        isSystemUser: user.isSystemUser,
        isActive: user.isActive !== false // Default to true if not set
      }));
      return NextResponse.json(basicUsers);
    }
    
    // If authenticated, return filtered data based on permissions
    const filteredUsers = filterUsersForDisplay(users, request.user);
    return NextResponse.json(filteredUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
});

/**
 * POST /api/users
 * Create a new user (requires user management permission)
 */
export const POST = withPermission(PERMISSIONS.USER_CREATE)(async (request) => {
  try {
    const userData = await request.json();
    
    // Validate required fields
    if (!userData.name || typeof userData.name !== 'string' || userData.name.trim() === '') {
      return NextResponse.json(
        { error: 'User name is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const newUser = await createUser(userData);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Handle validation errors
    if (error.message.includes('User name is required')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    if (error.message.includes('Cannot create system user')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
});