/**
 * User API Integration Tests
 * 
 * Tests for the User API endpoints
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { GET, POST } from '@/app/api/users/route.js';
import { GET as getUserById, PATCH, DELETE } from '@/app/api/users/[id]/route.js';
import { PATCH as patchPreferences } from '@/app/api/users/[id]/preferences/route.js';
import { _resetDbInstance } from '@/lib/db/database.js';

// Test database file path
const TEST_DB_PATH = path.join(process.cwd(), 'db-test.json');

// Mock NextRequest
class MockRequest {
  constructor(body = {}) {
    this.body = body;
  }
  
  async json() {
    return this.body;
  }
}

describe('User API Integration Tests', () => {
  beforeEach(async () => {
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    // Clean up any existing test database
    try {
      await fs.unlink(TEST_DB_PATH);
    } catch (error) {
      // Ignore if file doesn't exist
    }
    
    // Reset the database singleton
    _resetDbInstance();
  });

  afterEach(async () => {
    // Clean up test database after each test
    try {
      await fs.unlink(TEST_DB_PATH);
    } catch (error) {
      // Ignore if file doesn't exist
    }
    
    // Reset the database singleton
    _resetDbInstance();
    
    // Reset environment
    delete process.env.NODE_ENV;
  });

  describe('GET /api/users', () => {
    it('should return users including system user', async () => {
      const response = await GET();
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(1); // Should contain system user
      
      const systemUser = data.find(user => user.id === 'system');
      expect(systemUser).toBeDefined();
      expect(systemUser.name).toBe('System');
      expect(systemUser.isSystemUser).toBe(true);
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        name: 'Alice Johnson',
        preferences: {
          theme: 'dark',
          notifications: true
        }
      };
      
      const request = new MockRequest(userData);
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.id).toBeDefined();
      expect(data.name).toBe('Alice Johnson');
      expect(data.isSystemUser).toBe(false);
      expect(data.preferences.theme).toBe('dark');
      expect(data.preferences.notifications).toBe(true);
      expect(data.createdAt).toBeDefined();
      expect(data.updatedAt).toBeDefined();
    });

    it('should return 400 for missing name', async () => {
      const request = new MockRequest({ preferences: { theme: 'dark' } });
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('User name is required and must be a non-empty string');
    });

    it('should return 400 for empty name', async () => {
      const request = new MockRequest({ name: '   ' });
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('User name is required and must be a non-empty string');
    });

    it('should return 403 when trying to create system user', async () => {
      const request = new MockRequest({ name: 'Test', isSystemUser: true });
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(403);
      expect(data.error).toBe('Cannot create system user via createUser method');
    });
  });

  describe('GET /api/users/[id]', () => {
    let testUser;
    
    beforeEach(async () => {
      // Create a test user
      const userData = { name: 'Test User' };
      const request = new MockRequest(userData);
      const createResponse = await POST(request);
      testUser = await createResponse.json();
    });

    it('should return user by ID', async () => {
      const response = await getUserById(null, { params: { id: testUser.id } });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.id).toBe(testUser.id);
      expect(data.name).toBe('Test User');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await getUserById(null, { params: { id: 'non-existent' } });
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });

    it('should return system user', async () => {
      const response = await getUserById(null, { params: { id: 'system' } });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.id).toBe('system');
      expect(data.name).toBe('System');
      expect(data.isSystemUser).toBe(true);
    });
  });

  describe('PATCH /api/users/[id]', () => {
    let testUser;
    
    beforeEach(async () => {
      // Create a test user
      const userData = {
        name: 'Original Name',
        preferences: { theme: 'dark' }
      };
      const request = new MockRequest(userData);
      const createResponse = await POST(request);
      testUser = await createResponse.json();
    });

    it('should update user successfully', async () => {
      const updates = {
        name: 'Updated Name',
        preferences: { theme: 'light', fontSize: 'large' }
      };
      
      const request = new MockRequest(updates);
      const response = await PATCH(request, { params: { id: testUser.id } });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.id).toBe(testUser.id);
      expect(data.name).toBe('Updated Name');
      expect(data.preferences.theme).toBe('light');
      expect(data.preferences.fontSize).toBe('large');
      expect(data.updatedAt).not.toBe(testUser.updatedAt);
    });

    it('should return 404 for non-existent user', async () => {
      const request = new MockRequest({ name: 'Updated' });
      const response = await PATCH(request, { params: { id: 'non-existent' } });
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });

    it('should return 400 for invalid name', async () => {
      const request = new MockRequest({ name: '' });
      const response = await PATCH(request, { params: { id: testUser.id } });
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('User name must be a non-empty string');
    });

    it('should prevent updating protected fields', async () => {
      const updates = {
        id: 'hacked-id',
        isSystemUser: true,
        name: 'Legitimate Update'
      };
      
      const request = new MockRequest(updates);
      const response = await PATCH(request, { params: { id: testUser.id } });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.id).toBe(testUser.id); // Original ID preserved
      expect(data.isSystemUser).toBe(false); // System status preserved
      expect(data.name).toBe('Legitimate Update'); // Legitimate update applied
    });
  });

  describe('DELETE /api/users/[id]', () => {
    let testUser;
    
    beforeEach(async () => {
      // Create a test user
      const userData = { name: 'To Be Deleted' };
      const request = new MockRequest(userData);
      const createResponse = await POST(request);
      testUser = await createResponse.json();
    });

    it('should delete user successfully', async () => {
      const response = await DELETE(null, { params: { id: testUser.id } });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      // Verify user is deleted
      const getResponse = await getUserById(null, { params: { id: testUser.id } });
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent user', async () => {
      const response = await DELETE(null, { params: { id: 'non-existent' } });
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });

    it('should return 403 when trying to delete system user', async () => {
      const response = await DELETE(null, { params: { id: 'system' } });
      const data = await response.json();
      
      expect(response.status).toBe(403);
      expect(data.error).toBe('Cannot delete system user');
    });
  });

  describe('PATCH /api/users/[id]/preferences', () => {
    let testUser;
    
    beforeEach(async () => {
      // Create a test user
      const userData = {
        name: 'Preference User',
        preferences: {
          theme: 'dark',
          notifications: true,
          language: 'en'
        }
      };
      const request = new MockRequest(userData);
      const createResponse = await POST(request);
      testUser = await createResponse.json();
    });

    it('should update user preferences successfully', async () => {
      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 5));
      
      const preferences = {
        theme: 'light',
        fontSize: 'large'
      };
      
      const request = new MockRequest(preferences);
      const response = await patchPreferences(request, { params: { id: testUser.id } });
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.id).toBe(testUser.id);
      expect(data.preferences.theme).toBe('light'); // Updated
      expect(data.preferences.notifications).toBe(true); // Preserved
      expect(data.preferences.language).toBe('en'); // Preserved
      expect(data.preferences.fontSize).toBe('large'); // Added
      expect(data.updatedAt).not.toBe(testUser.updatedAt);
    });

    it('should return 404 for non-existent user', async () => {
      const request = new MockRequest({ theme: 'light' });
      const response = await patchPreferences(request, { params: { id: 'non-existent' } });
      const data = await response.json();
      
      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });

    it('should return 400 for invalid preferences', async () => {
      const request = new MockRequest('not an object');
      const response = await patchPreferences(request, { params: { id: testUser.id } });
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.error).toBe('Preferences must be a valid object');
    });
  });

  describe('Data Flow Integration', () => {
    it('should handle complete user lifecycle', async () => {
      // 1. Get initial users (should have system user)
      let response = await GET();
      let users = await response.json();
      expect(users).toHaveLength(1);
      expect(users[0].id).toBe('system');

      // 2. Create new user
      const userData = {
        name: 'Integration Test User',
        preferences: { theme: 'dark' }
      };
      
      response = await POST(new MockRequest(userData));
      const newUser = await response.json();
      expect(response.status).toBe(201);

      // 3. Verify user exists in list
      response = await GET();
      users = await response.json();
      expect(users).toHaveLength(2);
      
      // 4. Get user by ID
      response = await getUserById(null, { params: { id: newUser.id } });
      expect(response.status).toBe(200);
      const fetchedUser = await response.json();
      expect(fetchedUser.name).toBe('Integration Test User');

      // 5. Update user
      const updates = { name: 'Updated User Name' };
      response = await PATCH(new MockRequest(updates), { params: { id: newUser.id } });
      const updatedUser = await response.json();
      expect(response.status).toBe(200);
      expect(updatedUser.name).toBe('Updated User Name');

      // 6. Update preferences
      const preferences = { theme: 'light', fontSize: 'large' };
      response = await patchPreferences(new MockRequest(preferences), { params: { id: newUser.id } });
      const userWithPrefs = await response.json();
      expect(response.status).toBe(200);
      expect(userWithPrefs.preferences.theme).toBe('light');
      expect(userWithPrefs.preferences.fontSize).toBe('large');

      // 7. Delete user
      response = await DELETE(null, { params: { id: newUser.id } });
      const deleteResult = await response.json();
      expect(response.status).toBe(200);
      expect(deleteResult.success).toBe(true);

      // 8. Verify user is gone
      response = await getUserById(null, { params: { id: newUser.id } });
      expect(response.status).toBe(404);

      // 9. Verify only system user remains
      response = await GET();
      users = await response.json();
      expect(users).toHaveLength(1);
      expect(users[0].id).toBe('system');
    });
  });
});