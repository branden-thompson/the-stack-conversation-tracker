/**
 * Users API Routes
 * 
 * Handles CRUD operations for User entities
 * Routes: GET /api/users, POST /api/users
 */

import { NextResponse } from 'next/server';
import {
  getAllUsers,
  createUser
} from '@/lib/db/database.js';

/**
 * GET /api/users
 * Fetch all users
 */
export async function GET() {
  try {
    const users = await getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Create a new user
 */
export async function POST(request) {
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
}