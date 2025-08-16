/**
 * API Route for card flip operations
 * Handles flipping cards between face up and face down states
 */

import { NextResponse } from 'next/server';
import { updateCard, getCard } from '@/lib/db/database';

/**
 * PATCH /api/cards/flip
 * Flip a card between face up and face down
 * Body: { 
 *   id: string, 
 *   flipTo?: 'faceUp' | 'faceDown',
 *   flippedBy?: 'user' | 'auto',
 *   conversationId?: string 
 * }
 * If flipTo is not provided, it toggles the current state
 */
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, flipTo, flippedBy = 'user', conversationId } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Card ID is required' },
        { status: 400 }
      );
    }
    
    // Get the current card
    const card = await getCard(id);
    if (!card) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      );
    }
    
    // Determine the new faceUp state
    let newFaceUp;
    if (flipTo === 'faceUp') {
      newFaceUp = true;
    } else if (flipTo === 'faceDown') {
      newFaceUp = false;
    } else {
      // Toggle current state
      newFaceUp = !card.faceUp;
    }
    
    // Update the card
    const updatedCard = await updateCard(id, { 
      faceUp: newFaceUp,
      updatedAt: new Date().toISOString()
    });
    
    if (!updatedCard) {
      return NextResponse.json(
        { error: 'Failed to flip card' },
        { status: 500 }
      );
    }
    
    // Log the flip event if conversation ID provided
    if (conversationId) {
      try {
        const eventPayload = {
          cardId: id,
          flippedBy: flippedBy,
          zone: updatedCard.zone,
          flippedTo: newFaceUp ? 'faceUp' : 'faceDown',
          from: card.faceUp ? 'faceUp' : 'faceDown'
        };
        
        // Log to conversation events
        const eventResponse = await fetch(
          `${request.url.split('/api/cards')[0]}/api/conversations/${conversationId}/events`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'card.flipped',
              payload: eventPayload
            })
          }
        );
        
        if (!eventResponse.ok) {
          console.warn('Failed to log flip event:', await eventResponse.text());
        }
      } catch (eventError) {
        console.warn('Error logging flip event:', eventError);
        // Don't fail the flip operation if event logging fails
      }
    }
    
    // Return the updated card with flip information
    return NextResponse.json({
      ...updatedCard,
      flipped: {
        from: card.faceUp ? 'faceUp' : 'faceDown',
        to: newFaceUp ? 'faceUp' : 'faceDown'
      }
    });
  } catch (error) {
    console.error('PATCH /api/cards/flip error:', error);
    return NextResponse.json(
      { error: 'Failed to flip card' },
      { status: 500 }
    );
  }
}