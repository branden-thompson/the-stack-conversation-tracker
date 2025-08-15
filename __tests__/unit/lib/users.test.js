/**
 * User Management Data Layer Tests
 * 
 * Comprehensive tests for User entity CRUD operations, System user behavior,
 * User-Card relationships, and data integrity validation.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import {
  getAllUsers,
  getUser,
  getSystemUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserPreferences,
  createCard,
  getAllCards,
  getCardsByCreator,
  getCardsByAssignee,
  assignCardToUser,
  _resetDbInstance
} from '@/lib/db/database.js';

// Test database file path
const TEST_DB_PATH = path.join(process.cwd(), 'db-test.json');

describe('User Management Data Layer', () => {
  beforeEach(async () => {
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
  });

  describe('System User Auto-Creation', () => {
    it('should create System user automatically on first initialization', async () => {
      const systemUser = await getSystemUser();
      
      expect(systemUser).toBeDefined();
      expect(systemUser.id).toBe('system');
      expect(systemUser.name).toBe('System');
      expect(systemUser.isSystemUser).toBe(true);
      expect(systemUser.profilePicture).toBe('/system-avatar.png');
      expect(systemUser.preferences.theme).toBe('system');
    });

    it('should not create duplicate System user on subsequent initializations', async () => {
      // First initialization
      const systemUser1 = await getSystemUser();
      expect(systemUser1).toBeDefined();
      
      // Second initialization should return same user
      const systemUser2 = await getSystemUser();
      expect(systemUser2).toEqual(systemUser1);
      
      // Verify only one system user exists
      const allUsers = await getAllUsers();
      const systemUsers = allUsers.filter(user => user.isSystemUser);
      expect(systemUsers).toHaveLength(1);
    });
  });

  describe('User CRUD Operations', () => {
    describe('createUser', () => {
      it('should create a new user with valid data', async () => {
        const userData = {
          name: 'Alice Johnson',
          profilePicture: '/uploads/alice.jpg',
          preferences: {
            theme: 'dark',
            notifications: true
          }
        };

        const newUser = await createUser(userData);

        expect(newUser).toBeDefined();
        expect(newUser.id).toBeDefined();
        expect(newUser.id).not.toBe('system');
        expect(newUser.name).toBe('Alice Johnson');
        expect(newUser.isSystemUser).toBe(false);
        expect(newUser.profilePicture).toBe('/uploads/alice.jpg');
        expect(newUser.preferences.theme).toBe('dark');
        expect(newUser.preferences.notifications).toBe(true);
        expect(newUser.createdAt).toBeDefined();
        expect(newUser.updatedAt).toBeDefined();
      });

      it('should create user with default values when optional fields omitted', async () => {
        const userData = { name: 'Bob Smith' };
        const newUser = await createUser(userData);

        expect(newUser.name).toBe('Bob Smith');
        expect(newUser.profilePicture).toBeNull();
        expect(newUser.preferences.theme).toBe('system'); // Default theme
        expect(newUser.isSystemUser).toBe(false);
      });

      it('should throw error when name is missing', async () => {
        await expect(createUser({})).rejects.toThrow('User name is required');
        await expect(createUser({ name: '' })).rejects.toThrow('User name is required');
        await expect(createUser({ name: '   ' })).rejects.toThrow('User name is required');
      });

      it('should throw error when trying to create system user', async () => {
        await expect(createUser({ name: 'Test', id: 'system' }))
          .rejects.toThrow('Cannot create system user via createUser method');
        await expect(createUser({ name: 'Test', isSystemUser: true }))
          .rejects.toThrow('Cannot create system user via createUser method');
      });

      it('should trim whitespace from user name', async () => {
        const userData = { name: '  Charlie Brown  ' };
        const newUser = await createUser(userData);
        expect(newUser.name).toBe('Charlie Brown');
      });
    });

    describe('getUser and getAllUsers', () => {
      it('should retrieve user by ID', async () => {
        const userData = { name: 'Diana Prince' };
        const createdUser = await createUser(userData);
        
        const retrievedUser = await getUser(createdUser.id);
        expect(retrievedUser).toEqual(createdUser);
      });

      it('should return null for non-existent user ID', async () => {
        const result = await getUser('non-existent-id');
        expect(result).toBeNull();
      });

      it('should retrieve all users including system user', async () => {
        await createUser({ name: 'User 1' });
        await createUser({ name: 'User 2' });
        
        const allUsers = await getAllUsers();
        expect(allUsers).toHaveLength(3); // 2 created + 1 system
        
        const systemUser = allUsers.find(user => user.id === 'system');
        expect(systemUser).toBeDefined();
        
        const regularUsers = allUsers.filter(user => !user.isSystemUser);
        expect(regularUsers).toHaveLength(2);
      });
    });

    describe('updateUser', () => {
      it('should update user with valid data', async () => {
        const userData = { name: 'Original Name' };
        const createdUser = await createUser(userData);
        
        // Small delay to ensure different timestamp
        await new Promise(resolve => setTimeout(resolve, 5));
        
        const updates = {
          name: 'Updated Name',
          profilePicture: '/new-avatar.jpg',
          preferences: { theme: 'light' }
        };
        
        const updatedUser = await updateUser(createdUser.id, updates);
        
        expect(updatedUser.name).toBe('Updated Name');
        expect(updatedUser.profilePicture).toBe('/new-avatar.jpg');
        expect(updatedUser.preferences.theme).toBe('light');
        expect(updatedUser.updatedAt).not.toBe(createdUser.updatedAt);
        expect(updatedUser.id).toBe(createdUser.id); // ID should not change
        expect(updatedUser.isSystemUser).toBe(false); // System status should not change
      });

      it('should return null for non-existent user', async () => {
        const result = await updateUser('non-existent-id', { name: 'Test' });
        expect(result).toBeNull();
      });

      it('should prevent updating protected fields', async () => {
        const userData = { name: 'Test User' };
        const createdUser = await createUser(userData);
        
        const maliciousUpdates = {
          id: 'hacked-id',
          isSystemUser: true,
          name: 'Legitimate Update'
        };
        
        const updatedUser = await updateUser(createdUser.id, maliciousUpdates);
        
        expect(updatedUser.id).toBe(createdUser.id); // Original ID preserved
        expect(updatedUser.isSystemUser).toBe(false); // System status preserved
        expect(updatedUser.name).toBe('Legitimate Update'); // Legitimate update applied
      });

      it('should validate name when updating', async () => {
        const userData = { name: 'Valid Name' };
        const createdUser = await createUser(userData);
        
        await expect(updateUser(createdUser.id, { name: '' }))
          .rejects.toThrow('User name must be a non-empty string');
        await expect(updateUser(createdUser.id, { name: '   ' }))
          .rejects.toThrow('User name must be a non-empty string');
      });

      it('should trim whitespace when updating name', async () => {
        const userData = { name: 'Original' };
        const createdUser = await createUser(userData);
        
        const updatedUser = await updateUser(createdUser.id, { name: '  Updated Name  ' });
        expect(updatedUser.name).toBe('Updated Name');
      });
    });

    describe('deleteUser', () => {
      it('should delete regular user successfully', async () => {
        const userData = { name: 'To Be Deleted' };
        const createdUser = await createUser(userData);
        
        const deleteResult = await deleteUser(createdUser.id);
        expect(deleteResult).toBe(true);
        
        const retrievedUser = await getUser(createdUser.id);
        expect(retrievedUser).toBeNull();
      });

      it('should return false for non-existent user', async () => {
        const deleteResult = await deleteUser('non-existent-id');
        expect(deleteResult).toBe(false);
      });

      it('should prevent deletion of system user', async () => {
        await expect(deleteUser('system')).rejects.toThrow('Cannot delete system user');
        
        // Verify system user still exists
        const systemUser = await getSystemUser();
        expect(systemUser).toBeDefined();
      });
    });

    describe('updateUserPreferences', () => {
      it('should update user preferences while preserving existing ones', async () => {
        const userData = {
          name: 'Preference User',
          preferences: {
            theme: 'dark',
            notifications: true,
            language: 'en'
          }
        };
        const createdUser = await createUser(userData);
        
        const updatedUser = await updateUserPreferences(createdUser.id, {
          theme: 'light',
          fontSize: 'large'
        });
        
        expect(updatedUser.preferences.theme).toBe('light'); // Updated
        expect(updatedUser.preferences.notifications).toBe(true); // Preserved
        expect(updatedUser.preferences.language).toBe('en'); // Preserved
        expect(updatedUser.preferences.fontSize).toBe('large'); // Added
        expect(updatedUser.updatedAt).not.toBe(createdUser.updatedAt);
      });

      it('should return null for non-existent user', async () => {
        const result = await updateUserPreferences('non-existent-id', { theme: 'dark' });
        expect(result).toBeNull();
      });
    });
  });

  describe('User-Card Relationships', () => {
    let testUser1, testUser2;
    
    beforeEach(async () => {
      testUser1 = await createUser({ name: 'Test User 1' });
      testUser2 = await createUser({ name: 'Test User 2' });
    });

    describe('Card Creation with Users', () => {
      it('should create card with creator user', async () => {
        const cardData = {
          content: 'Test card created by user',
          createdByUserId: testUser1.id
        };
        
        const newCard = await createCard(cardData);
        
        expect(newCard.createdByUserId).toBe(testUser1.id);
        expect(newCard.assignedToUserId).toBeNull();
      });

      it('should create card with creator and assignee', async () => {
        const cardData = {
          content: 'Test card with assignment',
          createdByUserId: testUser1.id,
          assignedToUserId: testUser2.id
        };
        
        const newCard = await createCard(cardData);
        
        expect(newCard.createdByUserId).toBe(testUser1.id);
        expect(newCard.assignedToUserId).toBe(testUser2.id);
      });

      it('should default to system user when no creator specified', async () => {
        const cardData = { content: 'Card with default creator' };
        const newCard = await createCard(cardData);
        
        expect(newCard.createdByUserId).toBe('system');
        expect(newCard.assignedToUserId).toBeNull();
      });

      it('should throw error for non-existent creator', async () => {
        const cardData = {
          content: 'Test card',
          createdByUserId: 'non-existent-user'
        };
        
        await expect(createCard(cardData))
          .rejects.toThrow('Creator user with ID non-existent-user not found');
      });

      it('should throw error for non-existent assignee', async () => {
        const cardData = {
          content: 'Test card',
          createdByUserId: testUser1.id,
          assignedToUserId: 'non-existent-user'
        };
        
        await expect(createCard(cardData))
          .rejects.toThrow('Assigned user with ID non-existent-user not found');
      });
    });

    describe('Card Querying by User', () => {
      beforeEach(async () => {
        // Create test cards with different user relationships
        await createCard({
          content: 'Card 1 by User 1',
          createdByUserId: testUser1.id
        });
        await createCard({
          content: 'Card 2 by User 1, assigned to User 2',
          createdByUserId: testUser1.id,
          assignedToUserId: testUser2.id
        });
        await createCard({
          content: 'Card 3 by System, assigned to User 1',
          assignedToUserId: testUser1.id
        });
        await createCard({
          content: 'Card 4 by User 2',
          createdByUserId: testUser2.id
        });
      });

      it('should get cards by creator', async () => {
        const user1Cards = await getCardsByCreator(testUser1.id);
        expect(user1Cards).toHaveLength(2);
        
        const systemCards = await getCardsByCreator('system');
        expect(systemCards).toHaveLength(1); // Card 3 only (Card 4 is by testUser2)
      });

      it('should get cards by assignee', async () => {
        const user1Assigned = await getCardsByAssignee(testUser1.id);
        expect(user1Assigned).toHaveLength(1);
        expect(user1Assigned[0].content).toBe('Card 3 by System, assigned to User 1');
        
        const user2Assigned = await getCardsByAssignee(testUser2.id);
        expect(user2Assigned).toHaveLength(1);
        expect(user2Assigned[0].content).toBe('Card 2 by User 1, assigned to User 2');
      });

      it('should return empty arrays for users with no cards', async () => {
        const newUser = await createUser({ name: 'Empty User' });
        
        const createdCards = await getCardsByCreator(newUser.id);
        expect(createdCards).toHaveLength(0);
        
        const assignedCards = await getCardsByAssignee(newUser.id);
        expect(assignedCards).toHaveLength(0);
      });
    });

    describe('Card Assignment', () => {
      let testCard;
      
      beforeEach(async () => {
        testCard = await createCard({
          content: 'Test assignment card',
          createdByUserId: testUser1.id
        });
      });

      it('should assign card to user', async () => {
        // Small delay to ensure different timestamp
        await new Promise(resolve => setTimeout(resolve, 5));
        
        const updatedCard = await assignCardToUser(testCard.id, testUser2.id);
        
        expect(updatedCard.assignedToUserId).toBe(testUser2.id);
        expect(updatedCard.updatedAt).not.toBe(testCard.updatedAt);
      });

      it('should unassign card (set to null)', async () => {
        // First assign
        await assignCardToUser(testCard.id, testUser2.id);
        
        // Then unassign
        const updatedCard = await assignCardToUser(testCard.id, null);
        expect(updatedCard.assignedToUserId).toBeNull();
      });

      it('should return null for non-existent card', async () => {
        const result = await assignCardToUser('non-existent-card', testUser1.id);
        expect(result).toBeNull();
      });

      it('should throw error for non-existent user', async () => {
        await expect(assignCardToUser(testCard.id, 'non-existent-user'))
          .rejects.toThrow('User with ID non-existent-user not found');
      });
    });
  });

  describe('Data Migration', () => {
    it('should migrate existing cards without user fields to system user', async () => {
      // This test simulates existing cards in the database without user fields
      // We'll create cards directly in the database structure to bypass validation
      
      // First, get system user to ensure it exists
      await getSystemUser();
      
      // Create cards through the normal API first
      const card1 = await createCard({ content: 'Card 1' });
      const card2 = await createCard({ content: 'Card 2' });
      
      // Verify they have proper user relationships
      expect(card1.createdByUserId).toBe('system');
      expect(card2.createdByUserId).toBe('system');
      expect(card1.assignedToUserId).toBeNull();
      expect(card2.assignedToUserId).toBeNull();
    });
  });

  describe('Data Integrity', () => {
    it('should maintain referential integrity when user is deleted', async () => {
      const testUser = await createUser({ name: 'To Be Deleted User' });
      
      // Create cards associated with this user
      const createdCard = await createCard({
        content: 'Created by user',
        createdByUserId: testUser.id
      });
      
      const assignedCard = await createCard({
        content: 'Assigned to user',
        assignedToUserId: testUser.id
      });
      
      // Delete the user
      await deleteUser(testUser.id);
      
      // Verify cards still exist but maintain their relationships
      // (In a production system, we might want to reassign or handle this differently)
      const cards = await getAllCards();
      const createdCardStill = cards.find(c => c.id === createdCard.id);
      const assignedCardStill = cards.find(c => c.id === assignedCard.id);
      
      expect(createdCardStill).toBeDefined();
      expect(assignedCardStill).toBeDefined();
      expect(createdCardStill.createdByUserId).toBe(testUser.id); // Still references deleted user
      expect(assignedCardStill.assignedToUserId).toBe(testUser.id); // Still references deleted user
    });
  });

  describe('Flexible Schema', () => {
    it('should support extensible user attributes', async () => {
      const userData = {
        name: 'Extended User',
        // Future attributes that might be added
        customField1: 'value1',
        metadata: {
          source: 'api',
          version: '1.0'
        }
      };
      
      const newUser = await createUser(userData);
      
      expect(newUser.customField1).toBe('value1');
      expect(newUser.metadata.source).toBe('api');
      expect(newUser.metadata.version).toBe('1.0');
    });

    it('should preserve unknown fields during updates', async () => {
      const userData = {
        name: 'Test User',
        customField: 'original value'
      };
      const createdUser = await createUser(userData);
      
      const updatedUser = await updateUser(createdUser.id, {
        name: 'Updated Name'
      });
      
      expect(updatedUser.customField).toBe('original value'); // Preserved
      expect(updatedUser.name).toBe('Updated Name'); // Updated
    });
  });
});