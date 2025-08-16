/**
 * User Migration Script for Authentication System
 * 
 * Migrates existing users to include authentication fields:
 * - email, passwordHash, role, isActive, etc.
 */

import { getAllUsers, updateUser } from '../lib/db/database.js';
import bcrypt from 'bcryptjs';
import { USER_ROLES } from '../lib/types/auth.js';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';

// Direct database access for migration
async function getDatabase() {
  const dbPath = path.join(process.cwd(), 'data/db.json');
  const adapter = new JSONFile(dbPath);
  const db = new Low(adapter, { users: [], cards: [], conversations: [] });
  await db.read();
  return db;
}

async function migrateUsers() {
  try {
    console.log('Starting user authentication migration...');
    
    const db = await getDatabase();
    const users = db.data.users || [];
    
    if (users.length === 0) {
      console.log('No users found to migrate.');
      return;
    }

    const migratedUsers = [];
    
    for (const user of users) {
      // Skip if user already has authentication fields
      if (user.email && user.passwordHash) {
        console.log(`User ${user.name} already migrated, skipping...`);
        migratedUsers.push(user);
        continue;
      }

      console.log(`Migrating user: ${user.name}`);
      
      // Generate email if not exists (for demo purposes)
      const email = user.email || `${user.name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
      
      // Set default password (users will need to reset)
      const defaultPassword = 'password123'; // Users should change this immediately
      const passwordHash = await bcrypt.hash(defaultPassword, 12);
      
      // Determine role based on user type
      let role = USER_ROLES.PARTICIPANT;
      if (user.isSystemUser) {
        role = USER_ROLES.ADMIN; // System users become admins
      } else if (user.name.toLowerCase().includes('admin')) {
        role = USER_ROLES.ADMIN;
      } else if (user.name.toLowerCase().includes('facilitator') || user.name.toLowerCase().includes('moderator')) {
        role = USER_ROLES.FACILITATOR;
      }

      const migratedUser = {
        ...user,
        // Authentication fields
        email,
        passwordHash,
        role,
        isActive: true,
        emailVerified: true, // Skip verification for migrated users
        
        // Security fields
        loginAttempts: 0,
        lockedUntil: null,
        twoFactorEnabled: false,
        
        // Invitation fields
        invitedBy: null,
        inviteToken: null,
        inviteExpiresAt: null,
        
        // Timestamps
        lastLoginAt: null,
        updatedAt: new Date().toISOString()
      };

      migratedUsers.push(migratedUser);
      
      console.log(`✓ Migrated ${user.name} (${email}) with role: ${role}`);
    }

    // Update database
    db.data.users = migratedUsers;
    await db.write();
    
    console.log(`\n✅ Migration completed successfully!`);
    console.log(`Migrated ${migratedUsers.length} users.`);
    console.log(`\n🔐 Default password for all users: "password123"`);
    console.log(`Users should log in and change their passwords immediately.`);
    
    // Show role summary
    const roleCounts = migratedUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`\n📊 Role distribution:`);
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`  ${role}: ${count} users`);
    });

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateUsers();
}

export default migrateUsers;