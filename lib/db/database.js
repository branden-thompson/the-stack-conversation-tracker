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
  cards: []
};

// Database instance (singleton)
let db = null;

/**
 * Initialize the database connection
 * Creates a new db.json file if it doesn't exist
 */
async function initDb() {
  if (db) return db;

  try {
    // Set up the database file path
    const file = path.join(process.cwd(), 'db.json');
    const adapter = new JSONFile(file);
    db = new Low(adapter, defaultData);
    
    // Read data from JSON file
    await db.read();
    
    // Initialize with default data if file is empty
    db.data ||= defaultData;
    
    // Write default data to file
    await db.write();
    
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
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
 * @returns {Promise<Object>} The created card with generated ID
 */
export async function createCard(cardData) {
  const database = await initDb();
  await database.read();
  
  const newCard = {
    id: nanoid(),
    type: cardData.type || 'topic',
    content: cardData.content || '',
    zone: cardData.zone || 'active',
    position: cardData.position || { x: 0, y: 0 },
    stackOrder: cardData.stackOrder || 0,
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