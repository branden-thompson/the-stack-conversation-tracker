/**
 * User Preferences API Route
 * 
 * Handles user preference updates
 * Routes: PATCH /api/users/[id]/preferences
 */

import { NextResponse } from 'next/server';
import { updateUserPreferences } from '@/lib/db/database.js';

/**
 * PATCH /api/users/[id]/preferences
 * Update user preferences
 */
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const preferences = await request.json();
    
    // Validate that preferences is an object
    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'Preferences must be a valid object' },
        { status: 400 }
      );
    }
    
    const updatedUser = await updateUserPreferences(id, preferences);
    
    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update user preferences' },
      { status: 500 }
    );
  }
}