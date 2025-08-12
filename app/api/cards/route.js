/**
 * API Route for card operations
 * Handles all CRUD operations for conversation cards
 */

import { NextResponse } from 'next/server';
import {
  getAllCards,
  getCard,
  createCard,
  updateCard,
  deleteCard,
  updateMultipleCards
} from '@/lib/db/database';

/**
 * GET /api/cards
 * Retrieve all cards or a specific card by ID
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      // Get single card
      const card = await getCard(id);
      if (!card) {
        return NextResponse.json(
          { error: 'Card not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(card);
    }
    
    // Get all cards
    const cards = await getAllCards();
    return NextResponse.json(cards);
  } catch (error) {
    console.error('GET /api/cards error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cards
 * Create a new card
 */
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.type || !body.zone) {
      return NextResponse.json(
        { error: 'Missing required fields: type and zone' },
        { status: 400 }
      );
    }
    
    const newCard = await createCard(body);
    return NextResponse.json(newCard, { status: 201 });
  } catch (error) {
    console.error('POST /api/cards error:', error);
    return NextResponse.json(
      { error: 'Failed to create card' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cards
 * Update a card or multiple cards
 */
export async function PUT(request) {
  try {
    const body = await request.json();
    
    // Check if it's a batch update
    if (Array.isArray(body)) {
      // Batch update multiple cards
      const updatedCards = await updateMultipleCards(body);
      return NextResponse.json(updatedCards);
    }
    
    // Single card update
    const { id, ...updates } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Card ID is required' },
        { status: 400 }
      );
    }
    
    const updatedCard = await updateCard(id, updates);
    
    if (!updatedCard) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error('PUT /api/cards error:', error);
    return NextResponse.json(
      { error: 'Failed to update card' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cards
 * Delete a card by ID
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Card ID is required' },
        { status: 400 }
      );
    }
    
    const deleted = await deleteCard(id);
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: 'Card deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/cards error:', error);
    return NextResponse.json(
      { error: 'Failed to delete card' },
      { status: 500 }
    );
  }
}