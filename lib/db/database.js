/**
 * Database configuration using LowDB
 * This module handles all data persistence for conversation cards
 * Data is stored in a local JSON file
 */

import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { nanoid } from 'nanoid';
import path from 'path';

// Define the database structure
const defaultData = {
  cards: [],
  users: [],
  conversations: []
};

// Database instance (singleton)
let db = null;

/**
 * Reset database instance (for testing)
 * @private
 */
export function _resetDbInstance() {
  db = null;
}

/**
 * Initialize the database connection
 * Creates a new db.json file if it doesn't exist
 * Ensures System user exists
 */
async function initDb() {
  if (db) return db;

  try {
    // Set up the database file path (use test db during testing)
    const dbFileName = process.env.NODE_ENV === 'test' ? 'db-test.json' : 'db.json';
    const file = path.join(process.cwd(), dbFileName);
    const adapter = new JSONFile(file);
    db = new Low(adapter, defaultData);
    
    // Read data from JSON file
    await db.read();
    
    // Initialize with default data if file is empty
    db.data ||= defaultData;
    
    // Ensure collections exist
    db.data.cards ||= [];
    db.data.users ||= [];
    db.data.conversations ||= [];
    
    // Ensure System user exists (create only once)
    await ensureSystemUser();
    
    // Migrate existing cards to have user relationships
    await migrateExistingCards();
    
    // Migrate user preferences
    await migrateUserPreferences();
    
    // Write data to file
    await db.write();
    
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

/**
 * Ensure the System user exists (internal function)
 * Creates the System user if it doesn't exist
 */
async function ensureSystemUser() {
  const systemUser = db.data.users.find(user => user.id === 'system');
  
  if (!systemUser) {
    const systemUserData = {
      id: 'system',
      name: 'System',
      isSystemUser: true,
      profilePicture: '/system-avatar.png', // Reserved system avatar
      preferences: {
        theme: 'system' // System follows system theme
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.data.users.push(systemUserData);
    console.log('✅ System user created');
  }
}

/**
 * Migrate existing cards to have user relationships and faceUp field (internal function)
 * Assigns existing cards without user fields to the System user
 * Adds faceUp field to cards that don't have it
 */
async function migrateExistingCards() {
  let migrationCount = 0;
  
  db.data.cards.forEach(card => {
    if (!card.createdByUserId) {
      card.createdByUserId = 'system';
      migrationCount++;
    }
    if (card.assignedToUserId === undefined) {
      card.assignedToUserId = null;
    }
    // Add faceUp field to existing cards
    if (card.faceUp === undefined) {
      card.faceUp = true; // Default existing cards to face up
      migrationCount++;
    }
  });
  
  if (migrationCount > 0) {
    console.log(`✅ Migrated ${migrationCount} existing cards to System user`);
  }
}

/**
 * Migrate existing users to have animationsEnabled preference (internal function)
 * Adds animationsEnabled preference to users that don't have it
 */
async function migrateUserPreferences() {
  let migrationCount = 0;
  
  db.data.users.forEach(user => {
    if (!user.preferences) {
      user.preferences = {};
    }
    // Add animationsEnabled preference if not present
    if (user.preferences.animationsEnabled === undefined) {
      user.preferences.animationsEnabled = true; // Default to animations enabled
      migrationCount++;
    }
  });
  
  if (migrationCount > 0) {
    console.log(`✅ Migrated ${migrationCount} users with animationsEnabled preference`);
  }
}

/**
 * Get all cards from the database
 * @returns {Promise<Array>} Array of all conversation cards
 */
export async function getAllCards() {
  const database = await initDb();
  await database.read();
  return database.data.cards || [];
}

/**
 * Get a single card by ID
 * @param {string} id - The card ID
 * @returns {Promise<Object|null>} The card object or null if not found
 */
export async function getCard(id) {
  const database = await initDb();
  await database.read();
  return database.data.cards.find(card => card.id === id) || null;
}

/**
 * Create a new card
 * @param {Object} cardData - The card data
 * @param {string} [cardData.createdByUserId] - ID of user creating the card (defaults to system)
 * @param {string} [cardData.assignedToUserId] - ID of user assigned to the card
 * @returns {Promise<Object>} The created card with generated ID
 */
export async function createCard(cardData) {
  const database = await initDb();
  await database.read();
  
  // Default to system user if no creator specified
  const createdByUserId = cardData.createdByUserId || 'system';
  
  // Verify creator user exists (allow guest users)
  const isGuestUser = createdByUserId === 'guest' || createdByUserId.startsWith('guest_');
  if (!isGuestUser) {
    const creatorExists = database.data.users.find(user => user.id === createdByUserId);
    if (!creatorExists) {
      throw new Error(`Creator user with ID ${createdByUserId} not found`);
    }
  }
  
  // Verify assigned user exists (if specified, allow guest users)
  if (cardData.assignedToUserId) {
    const isAssigneeGuest = cardData.assignedToUserId === 'guest' || cardData.assignedToUserId.startsWith('guest_');
    if (!isAssigneeGuest) {
      const assigneeExists = database.data.users.find(user => user.id === cardData.assignedToUserId);
      if (!assigneeExists) {
        throw new Error(`Assigned user with ID ${cardData.assignedToUserId} not found`);
      }
    }
  }
  
  const newCard = {
    id: nanoid(),
    type: cardData.type || 'topic',
    content: cardData.content || '',
    zone: cardData.zone || 'active',
    position: cardData.position || { x: 0, y: 0 },
    stackOrder: cardData.stackOrder || 0,
    faceUp: cardData.faceUp !== undefined ? cardData.faceUp : true, // Default to face up
    createdByUserId: createdByUserId,
    assignedToUserId: cardData.assignedToUserId || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  database.data.cards.push(newCard);
  await database.write();
  
  return newCard;
}

/**
 * Update an existing card
 * @param {string} id - The card ID
 * @param {Object} updates - The fields to update
 * @returns {Promise<Object|null>} The updated card or null if not found
 */
export async function updateCard(id, updates) {
  const database = await initDb();
  await database.read();
  
  const cardIndex = database.data.cards.findIndex(card => card.id === id);
  
  if (cardIndex === -1) {
    return null;
  }
  
  // Update the card with new data
  database.data.cards[cardIndex] = {
    ...database.data.cards[cardIndex],
    ...updates,
    id: database.data.cards[cardIndex].id, // Prevent ID from being changed
    updatedAt: new Date().toISOString()
  };
  
  await database.write();
  
  return database.data.cards[cardIndex];
}

/**
 * Delete a card
 * @param {string} id - The card ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function deleteCard(id) {
  const database = await initDb();
  await database.read();
  
  const initialLength = database.data.cards.length;
  database.data.cards = database.data.cards.filter(card => card.id !== id);
  
  await database.write();
  
  return database.data.cards.length < initialLength;
}

/**
 * Update multiple cards at once (useful for batch position updates)
 * @param {Array} updates - Array of {id, ...updateFields} objects
 * @returns {Promise<Array>} Array of updated cards
 */
export async function updateMultipleCards(updates) {
  const database = await initDb();
  await database.read();
  
  const updatedCards = [];
  
  updates.forEach(update => {
    const cardIndex = database.data.cards.findIndex(card => card.id === update.id);
    if (cardIndex !== -1) {
      database.data.cards[cardIndex] = {
        ...database.data.cards[cardIndex],
        ...update,
        id: database.data.cards[cardIndex].id,
        updatedAt: new Date().toISOString()
      };
      updatedCards.push(database.data.cards[cardIndex]);
    }
  });
  
  await database.write();
  
  return updatedCards;
}

// ============================================================================
// USER MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * Get all users from the database
 * @returns {Promise<Array>} Array of all users
 */
export async function getAllUsers() {
  const database = await initDb();
  await database.read();
  return database.data.users || [];
}

/**
 * Get a single user by ID
 * @param {string} id - The user ID
 * @returns {Promise<Object|null>} The user object or null if not found
 */
export async function getUser(id) {
  const database = await initDb();
  await database.read();
  return database.data.users.find(user => user.id === id) || null;
}

/**
 * Get the System user
 * @returns {Promise<Object>} The system user object
 */
export async function getSystemUser() {
  const database = await initDb();
  await database.read();
  return database.data.users.find(user => user.id === 'system');
}

/**
 * Create a new user
 * @param {Object} userData - The user data
 * @param {string} userData.name - Required user name
 * @param {string} [userData.profilePicture] - Optional profile picture path
 * @param {Object} [userData.preferences] - Optional user preferences
 * @returns {Promise<Object>} The created user with generated ID
 */
export async function createUser(userData) {
  if (!userData.name || typeof userData.name !== 'string' || userData.name.trim() === '') {
    throw new Error('User name is required and must be a non-empty string');
  }

  const database = await initDb();
  await database.read();
  
  // Prevent creation of system user via this method
  if (userData.id === 'system' || userData.isSystemUser) {
    throw new Error('Cannot create system user via createUser method');
  }
  
  const newUser = {
    id: nanoid(),
    name: userData.name.trim(),
    isSystemUser: false,
    profilePicture: userData.profilePicture || null,
    preferences: {
      theme: 'system', // Default to system theme
      animationsEnabled: true, // Default to animations enabled
      ...userData.preferences
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Extensible: additional fields can be added here in the future
    ...userData
  };
  
  // Ensure required fields aren't overridden (apply after spread)
  newUser.isSystemUser = false;
  newUser.name = userData.name.trim(); // Ensure trimming after spread
  newUser.id = newUser.id; // Keep generated ID
  
  database.data.users.push(newUser);
  await database.write();
  
  return newUser;
}

/**
 * Update an existing user
 * @param {string} id - The user ID
 * @param {Object} updates - The fields to update
 * @returns {Promise<Object|null>} The updated user or null if not found
 */
export async function updateUser(id, updates) {
  const database = await initDb();
  await database.read();
  
  const userIndex = database.data.users.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    return null;
  }
  
  // Prevent updating system user status or ID
  const protectedFields = ['id', 'isSystemUser'];
  const sanitizedUpdates = Object.fromEntries(
    Object.entries(updates).filter(([key]) => !protectedFields.includes(key))
  );
  
  // Validate name if being updated
  if (sanitizedUpdates.name !== undefined) {
    if (!sanitizedUpdates.name || typeof sanitizedUpdates.name !== 'string' || sanitizedUpdates.name.trim() === '') {
      throw new Error('User name must be a non-empty string');
    }
    sanitizedUpdates.name = sanitizedUpdates.name.trim();
  }
  
  // Update the user with new data
  database.data.users[userIndex] = {
    ...database.data.users[userIndex],
    ...sanitizedUpdates,
    id: database.data.users[userIndex].id, // Prevent ID from being changed
    isSystemUser: database.data.users[userIndex].isSystemUser, // Prevent system status change
    updatedAt: new Date().toISOString()
  };
  
  await database.write();
  
  return database.data.users[userIndex];
}

/**
 * Delete a user (cannot delete system user)
 * @param {string} id - The user ID
 * @returns {Promise<boolean>} True if deleted, false if not found or system user
 */
export async function deleteUser(id) {
  if (id === 'system') {
    throw new Error('Cannot delete system user');
  }

  const database = await initDb();
  await database.read();
  
  const initialLength = database.data.users.length;
  database.data.users = database.data.users.filter(user => user.id !== id);
  
  await database.write();
  
  return database.data.users.length < initialLength;
}

/**
 * Update user preferences
 * @param {string} userId - The user ID
 * @param {Object} preferences - The preferences to update
 * @returns {Promise<Object|null>} The updated user or null if not found
 */
export async function updateUserPreferences(userId, preferences) {
  const database = await initDb();
  await database.read();
  
  const userIndex = database.data.users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return null;
  }
  
  // Merge preferences while preserving existing ones
  database.data.users[userIndex].preferences = {
    ...database.data.users[userIndex].preferences,
    ...preferences
  };
  
  database.data.users[userIndex].updatedAt = new Date().toISOString();
  
  await database.write();
  
  return database.data.users[userIndex];
}

// ============================================================================
// USER-CARD RELATIONSHIP FUNCTIONS
// ============================================================================

/**
 * Get all cards created by a specific user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} Array of cards created by the user
 */
export async function getCardsByCreator(userId) {
  const database = await initDb();
  await database.read();
  return database.data.cards.filter(card => card.createdByUserId === userId);
}

/**
 * Get all cards assigned to a specific user
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} Array of cards assigned to the user
 */
export async function getCardsByAssignee(userId) {
  const database = await initDb();
  await database.read();
  return database.data.cards.filter(card => card.assignedToUserId === userId);
}

/**
 * Assign a card to a user
 * @param {string} cardId - The card ID
 * @param {string} userId - The user ID to assign to (can be null to unassign)
 * @returns {Promise<Object|null>} The updated card or null if not found
 */
export async function assignCardToUser(cardId, userId) {
  const database = await initDb();
  await database.read();
  
  // Verify user exists (unless unassigning)
  if (userId !== null) {
    const userExists = database.data.users.find(user => user.id === userId);
    if (!userExists) {
      throw new Error(`User with ID ${userId} not found`);
    }
  }
  
  const cardIndex = database.data.cards.findIndex(card => card.id === cardId);
  
  if (cardIndex === -1) {
    return null;
  }
  
  database.data.cards[cardIndex].assignedToUserId = userId;
  database.data.cards[cardIndex].updatedAt = new Date().toISOString();
  
  await database.write();
  
  return database.data.cards[cardIndex];
}