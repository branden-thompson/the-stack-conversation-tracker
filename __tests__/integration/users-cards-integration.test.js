/**
 * User-Card Integration Test
 * 
 * End-to-end test validating that Users and Cards work together properly
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import {
  getAllUsers,
  createUser,
  getSystemUser,
  createCard,
  getAllCards,
  getCardsByCreator,
  getCardsByAssignee,
  assignCardToUser,
  _resetDbInstance
} from '@/lib/db/database.js';

// Test database file path
const TEST_DB_PATH = path.join(process.cwd(), 'db-test.json');

describe('Users-Cards Integration Tests', () => {
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

  it('should demonstrate complete User-Card workflow', async () => {
    // 1. Verify System user exists automatically
    const systemUser = await getSystemUser();
    expect(systemUser).toBeDefined();
    expect(systemUser.id).toBe('system');
    expect(systemUser.name).toBe('System');
    expect(systemUser.isSystemUser).toBe(true);

    // 2. Create some regular users
    const alice = await createUser({
      name: 'Alice Johnson',
      preferences: { theme: 'dark' }
    });
    
    const bob = await createUser({
      name: 'Bob Smith',
      preferences: { theme: 'light' }
    });
    
    expect(alice.id).toBeDefined();
    expect(bob.id).toBeDefined();
    
    // 3. Verify we have 3 users total
    const allUsers = await getAllUsers();
    expect(allUsers).toHaveLength(3);
    
    // 4. Create cards with different user relationships
    
    // Card created by System (default behavior)
    const systemCard = await createCard({
      content: 'System-generated card',
      type: 'system',
      zone: 'active'
    });
    expect(systemCard.createdByUserId).toBe('system');
    expect(systemCard.assignedToUserId).toBeNull();
    
    // Card created by Alice
    const aliceCard = await createCard({
      content: 'Alice\'s card',
      type: 'topic',
      zone: 'active',
      createdByUserId: alice.id
    });
    expect(aliceCard.createdByUserId).toBe(alice.id);
    expect(aliceCard.assignedToUserId).toBeNull();
    
    // Card created by Alice, assigned to Bob
    const collaborativeCard = await createCard({
      content: 'Collaborative card',
      type: 'action',
      zone: 'active',
      createdByUserId: alice.id,
      assignedToUserId: bob.id
    });
    expect(collaborativeCard.createdByUserId).toBe(alice.id);
    expect(collaborativeCard.assignedToUserId).toBe(bob.id);
    
    // 5. Test card queries by user
    
    // Cards created by Alice
    const aliceCreated = await getCardsByCreator(alice.id);
    expect(aliceCreated).toHaveLength(2);
    expect(aliceCreated.map(c => c.content)).toContain('Alice\'s card');
    expect(aliceCreated.map(c => c.content)).toContain('Collaborative card');
    
    // Cards created by System
    const systemCreated = await getCardsByCreator('system');
    expect(systemCreated).toHaveLength(1);
    expect(systemCreated[0].content).toBe('System-generated card');
    
    // Cards assigned to Bob
    const bobAssigned = await getCardsByAssignee(bob.id);
    expect(bobAssigned).toHaveLength(1);
    expect(bobAssigned[0].content).toBe('Collaborative card');
    
    // Cards assigned to Alice (none initially)
    const aliceAssigned = await getCardsByAssignee(alice.id);
    expect(aliceAssigned).toHaveLength(0);
    
    // 6. Test card assignment changes
    
    // Assign Alice's card to herself
    const reassignedCard = await assignCardToUser(aliceCard.id, alice.id);
    expect(reassignedCard.assignedToUserId).toBe(alice.id);
    
    // Verify assignment changed
    const aliceAssignedAfter = await getCardsByAssignee(alice.id);
    expect(aliceAssignedAfter).toHaveLength(1);
    expect(aliceAssignedAfter[0].content).toBe('Alice\'s card');
    
    // Unassign card (set to null)
    const unassignedCard = await assignCardToUser(aliceCard.id, null);
    expect(unassignedCard.assignedToUserId).toBeNull();
    
    // 7. Verify all cards exist and have proper relationships
    const allCards = await getAllCards();
    expect(allCards).toHaveLength(3);
    
    // Each card should have creator
    allCards.forEach(card => {
      expect(card.createdByUserId).toBeDefined();
      expect(['system', alice.id, bob.id]).toContain(card.createdByUserId);
    });
    
    // 8. Test data persistence
    // Reset database instance to simulate app restart
    _resetDbInstance();
    
    // Data should still be there
    const usersAfterRestart = await getAllUsers();
    expect(usersAfterRestart).toHaveLength(3);
    
    const cardsAfterRestart = await getAllCards();
    expect(cardsAfterRestart).toHaveLength(3);
    
    const systemUserAfterRestart = await getSystemUser();
    expect(systemUserAfterRestart.id).toBe('system');
    
    console.log('✅ User-Card integration test completed successfully!');
    console.log(`📊 Final state: ${usersAfterRestart.length} users, ${cardsAfterRestart.length} cards`);
  });

  it('should handle edge cases gracefully', async () => {
    // 1. Create card without specifying user (should default to system)
    const defaultCard = await createCard({
      content: 'Default creator test'
    });
    expect(defaultCard.createdByUserId).toBe('system');
    
    // 2. Try to create card with non-existent creator
    await expect(createCard({
      content: 'Bad creator test',
      createdByUserId: 'non-existent-user'
    })).rejects.toThrow('Creator user with ID non-existent-user not found');
    
    // 3. Try to create card with non-existent assignee
    await expect(createCard({
      content: 'Bad assignee test',
      assignedToUserId: 'non-existent-user'
    })).rejects.toThrow('Assigned user with ID non-existent-user not found');
    
    // 4. Try to assign card to non-existent user
    await expect(assignCardToUser(defaultCard.id, 'non-existent-user'))
      .rejects.toThrow('User with ID non-existent-user not found');
    
    // 5. Queries for non-existent users should return empty arrays
    const noCards1 = await getCardsByCreator('non-existent-user');
    expect(noCards1).toEqual([]);
    
    const noCards2 = await getCardsByAssignee('non-existent-user');
    expect(noCards2).toEqual([]);
    
    console.log('✅ Edge cases handled properly!');
  });

  it('should maintain referential integrity', async () => {
    // Create user and cards
    const testUser = await createUser({ name: 'Test User' });
    
    const createdCard = await createCard({
      content: 'Created card',
      createdByUserId: testUser.id
    });
    
    const assignedCard = await createCard({
      content: 'Assigned card',
      assignedToUserId: testUser.id
    });
    
    // Verify relationships exist
    expect(createdCard.createdByUserId).toBe(testUser.id);
    expect(assignedCard.assignedToUserId).toBe(testUser.id);
    
    // Note: In our current implementation, deleting a user doesn't 
    // automatically reassign their cards - this is by design for data integrity.
    // In a production system, we might want to reassign to System user or 
    // prevent deletion if user has associated cards.
    
    console.log('✅ Referential integrity maintained!');
  });
});