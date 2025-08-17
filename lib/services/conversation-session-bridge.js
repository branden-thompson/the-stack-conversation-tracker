/**
 * Conversation-Session Event Bridge
 * 
 * Bridges conversation events to session tracking system
 * Allows conversation store to emit events to user sessions
 */

import sessionManager from './session-manager';

/**
 * Map conversation event types to session event types
 */
const CONVERSATION_TO_SESSION_EVENT_MAP = {
  // Conversation lifecycle
  'conversation.started': 'conversation_started',
  'conversation.paused': 'conversation_paused',
  'conversation.resumed': 'conversation_resumed', 
  'conversation.stopped': 'conversation_stopped',
  
  // Card operations (from conversation context)
  'card.created': 'card_created',
  'card.updated': 'card_updated',
  'card.deleted': 'card_deleted',
  'card.moved': 'card_moved',
  'card.flipped': 'card_flipped',
  
  // Zone interactions
  'zone.entered': 'zone_interaction',
  'zone.exited': 'zone_interaction',
};

/**
 * Emit a conversation event to the session tracking system
 * @param {string} conversationId - The conversation ID
 * @param {string} type - The conversation event type
 * @param {object} payload - Event payload
 * @param {string} userId - Optional user ID who triggered the event
 */
export function emitConversationToSession(conversationId, type, payload = {}, userId = null) {
  try {
    // Map conversation event type to session event type
    const sessionEventType = CONVERSATION_TO_SESSION_EVENT_MAP[type] || `conversation_${type.replace('.', '_')}`;
    
    // Build enriched event payload
    const enrichedPayload = {
      ...payload,
      conversationId,
      source: 'conversation',
      originalType: type,
    };
    
    // If we have a userId, try to find their active session
    if (userId) {
      const sessions = Array.from(sessionManager.sessionStore.values());
      const userSession = sessions.find(s => 
        s.userId === userId && 
        s.status === 'active'
      );
      
      if (userSession) {
        // Add event to the user's session
        const events = sessionManager.eventStore.get(userSession.id) || [];
        events.push({
          id: generateEventId(),
          type: sessionEventType,
          category: 'board',
          timestamp: Date.now(),
          metadata: enrichedPayload,
          userId: userId,
          sessionId: userSession.id,
        });
        
        // Update session activity
        userSession.lastActivityAt = Date.now();
        userSession.eventCount = events.length;
        
        // Store updated events
        sessionManager.eventStore.set(userSession.id, events);
        
        console.log(`[Bridge] Emitted ${type} to session ${userSession.id} for user ${userId}`);
        return true;
      }
    }
    
    // Fallback: emit to all active sessions if no specific user
    if (!userId) {
      const sessions = Array.from(sessionManager.sessionStore.values());
      const activeSessions = sessions.filter(s => s.status === 'active');
      
      activeSessions.forEach(session => {
        const events = sessionManager.eventStore.get(session.id) || [];
        events.push({
          id: generateEventId(),
          type: sessionEventType,
          category: 'board',
          timestamp: Date.now(),
          metadata: enrichedPayload,
          sessionId: session.id,
        });
        
        // Update session
        session.lastActivityAt = Date.now();
        session.eventCount = events.length;
        
        sessionManager.eventStore.set(session.id, events);
      });
      
      console.log(`[Bridge] Broadcast ${type} to ${activeSessions.length} active sessions`);
      return true;
    }
    
    console.log(`[Bridge] No active session found for user ${userId}`);
    return false;
    
  } catch (error) {
    console.error('[Bridge] Error emitting conversation event to session:', error);
    return false;
  }
}

/**
 * Generate a unique event ID
 */
function generateEventId() {
  return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Get conversation context for enriching events
 */
export function getConversationContext(conversationId) {
  // This could be expanded to include more context from the conversation store
  return {
    conversationId,
    timestamp: Date.now(),
  };
}

export default {
  emitConversationToSession,
  getConversationContext,
  CONVERSATION_TO_SESSION_EVENT_MAP,
};