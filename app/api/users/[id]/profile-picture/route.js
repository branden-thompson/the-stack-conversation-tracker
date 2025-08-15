/**
 * Profile Picture Upload API
 * 
 * POST /api/users/[id]/profile-picture - Upload/update profile picture
 * DELETE /api/users/[id]/profile-picture - Remove profile picture
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { updateUser, getUser } from '@/lib/db/database';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'profile-pictures');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Ensure upload directory exists
 */
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Get file extension from mime type
 */
function getFileExtension(mimeType) {
  const extensions = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg', 
    'image/png': 'png',
    'image/webp': 'webp'
  };
  return extensions[mimeType] || 'jpg';
}

/**
 * Generate unique filename
 */
function generateFileName(userId, mimeType) {
  const timestamp = Date.now();
  const extension = getFileExtension(mimeType);
  return `${userId}-${timestamp}.${extension}`;
}

/**
 * Remove old profile picture file
 */
async function removeOldProfilePicture(profilePicturePath) {
  if (!profilePicturePath) return;
  
  try {
    const fullPath = path.join(process.cwd(), 'public', profilePicturePath);
    if (existsSync(fullPath)) {
      await unlink(fullPath);
    }
  } catch (error) {
    console.warn('Failed to remove old profile picture:', error);
  }
}

/**
 * POST - Upload profile picture
 */
export async function POST(request, { params }) {
  try {
    const { id: userId } = params;
    
    // Verify user exists
    const user = await getUser(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get('profilePicture');
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    await ensureUploadDir();

    // Generate filename and get file path
    const fileName = generateFileName(userId, file.type);
    const filePath = path.join(UPLOAD_DIR, fileName);
    const relativePath = `/uploads/profile-pictures/${fileName}`;

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Remove old profile picture if it exists
    if (user.profilePicture) {
      await removeOldProfilePicture(user.profilePicture);
    }

    // Update user with new profile picture path
    const updatedUser = await updateUser(userId, {
      profilePicture: relativePath,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      profilePicture: relativePath
    });

  } catch (error) {
    console.error('Profile picture upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload profile picture' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Remove profile picture
 */
export async function DELETE(request, { params }) {
  try {
    const { id: userId } = params;
    
    // Verify user exists
    const user = await getUser(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Remove the file if it exists
    if (user.profilePicture) {
      await removeOldProfilePicture(user.profilePicture);
    }

    // Update user to remove profile picture
    const updatedUser = await updateUser(userId, {
      profilePicture: null,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile picture removal error:', error);
    return NextResponse.json(
      { error: 'Failed to remove profile picture' },
      { status: 500 }
    );
  }
}