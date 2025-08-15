/**
 * Individual User API Routes
 * 
 * Handles operations on specific users
 * Routes: GET, PATCH, DELETE /api/users/[id]
 */

import { NextResponse } from 'next/server';
import {
  getUser,
  updateUser,
  deleteUser
} from '@/lib/db/database.js';

/**
 * GET /api/users/[id]
 * Fetch a specific user
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const user = await getUser(id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/[id]
 * Update a specific user
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const updates = await request.json();
    
    const updatedUser = await updateUser(id, updates);
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    
    // Handle validation errors
    if (error.message.includes('User name must be')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]
 * Delete a specific user
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    
    const success = await deleteUser(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    
    // Handle system user protection
    if (error.message.includes('Cannot delete system user')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}