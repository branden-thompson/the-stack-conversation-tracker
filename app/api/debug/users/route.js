/**
 * Debug endpoint to check user state
 */

import { getUsers } from '@/lib/db/database.js';

export async function GET() {
  try {
    const users = await getUsers();
    
    return Response.json({
      success: true,
      users: users.map(user => ({
        id: user.id,
        name: user.name,
        isSystemUser: user.isSystemUser || false,
        email: user.email,
        profilePicture: user.profilePicture
      })),
      totalUsers: users.length,
      systemUsers: users.filter(u => u.isSystemUser),
      regularUsers: users.filter(u => !u.isSystemUser)
    });
  } catch (error) {
    console.error('Debug users error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}