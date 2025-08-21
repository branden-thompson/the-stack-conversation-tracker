/**
 * useSSECardEvents - Real-Time Card Events SSE Hook
 * 
 * CLASSIFICATION: APPLICATION LEVEL | REAL-TIME COLLABORATION | CRITICAL
 * PURPOSE: Provide 1-second interval SSE for real-time card state synchronization
 * 
 * BASED ON: Proven useSSEActiveUsers pattern (stable, no API runaway)
 * SPECIAL FOCUS: Card flip operations with extensive debugging capabilities
 * 
 * PERFORMANCE TARGET: 1-second intervals for near real-time card collaboration
 * DEBUGGING: Enhanced logging for card flip state changes and synchronization
 */

'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { coordinatedFetch } from '@/lib/sse-infrastructure/utils/request-coordinator.js';
import { getPollingInterval, getEnvironmentConfig } from '@/lib/sse-infrastructure/config/environment-config.js';
import { useSSEHookRegistration } from '@/lib/sse-infrastructure/registry/hook-registry.js';

/**
 * Transform and validate card events data
 */
function processCardEventsData(rawData, previousCards = []) {
  if (!rawData?.events) {
    console.warn('[Card Events] No events in response:', rawData);
    return { isValid: false, cards: previousCards };
  }
  
  const cards = rawData.events;
  const timestamp = rawData.meta?.timestamp || Date.now();
  
  // Validate card structure
  const validCards = cards.filter(card => {
    const isValid = card.id && typeof card.faceUp === 'boolean' && card.zone;
    if (!isValid) {
      console.warn('[Card Events] Invalid card data:', card);
    }
    return isValid;
  });
  
  if (validCards.length !== cards.length) {
    console.warn(`[Card Events] Filtered ${cards.length - validCards.length} invalid cards`);
  }
  
  return {
    isValid: true,
    cards: validCards,
    metadata: {
      timestamp,
      originalCount: cards.length,
      validCount: validCards.length,
      responseTime: rawData.meta?.responseTime || 0
    }
  };
}

/**
 * Create hash for change detection (focused on card state changes)
 */
function createCardEventsHash(cards) {
  if (!Array.isArray(cards)) return '';
  
  // Create hash focused on card state that affects rendering and collaboration
  const cardStates = cards.map(card => ({
    id: card.id,
    faceUp: card.faceUp,
    zone: card.zone,
    position: card.position,
    stackOrder: card.stackOrder || 0,
    content: card.content,
    assignedTo: card.assignedTo,
    updatedAt: card.updatedAt
  }));
  
  return JSON.stringify(cardStates);
}

/**
 * Dedicated Card Events SSE Hook
 * 
 * @param {Object} config Configuration options
 * @param {boolean} config.enabled Whether card events are enabled
 * @param {boolean} config.includeMetadata Include debugging metadata in API calls
 * @param {number} config.interval Override default interval (1000ms)
 * @param {boolean} config.forDevPages Enable optimizations for dev pages (/dev/convos)
 * @param {boolean} config.backgroundOperation Continue operation in background tabs (default: true)
 * @param {Function} config.onCardFlip Callback for card flip events
 * @param {Function} config.onCardMove Callback for card move events
 * @param {Function} config.onCardUpdate Callback for card update events
 * @returns {Object} Card events state and utilities
 */
export function useSSECardEvents(config = {}) {
  const {
    enabled = true,
    includeMetadata = process.env.NODE_ENV === 'development',
    interval: customInterval,
    forDevPages = false,
    backgroundOperation = true,
    onCardFlip,
    onCardMove,
    onCardUpdate
  } = config;
  
  // Hook registry for coordination (prevent multiple card event hooks)
  const registrationUtils = useSSEHookRegistration(
    '/api/cards/events',
    'useSSECardEvents',
    { realTime: true, interval: customInterval || 1000 }
  );
  
  // Registry state
  const hookIdRef = useRef(null);
  const [registrationStatus, setRegistrationStatus] = useState('unregistered');
  
  // Card events state
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  // Change detection
  const previousHashRef = useRef('');
  const previousCardsRef = useRef([]);
  
  // Performance monitoring
  const statsRef = useRef({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    cardFlipEvents: 0,
    cardMoveEvents: 0,
    cardUpdateEvents: 0,
    lastRequestTime: 0,
    averageResponseTime: 0,
    startTime: Date.now()
  });
  
  // Get environment-safe interval (1 second for real-time card events)
  // Dev pages may need faster intervals for real-time collaboration
  const defaultInterval = forDevPages ? 800 : 1000; // Faster for dev pages
  const cardEventsInterval = customInterval || defaultInterval;
  
  console.log(`[useSSECardEvents] Initializing with ${cardEventsInterval}ms interval (forDevPages: ${forDevPages}, backgroundOperation: ${backgroundOperation})`);
  
  /**
   * Fetch card events data
   */
  const fetchCardEvents = useCallback(async () => {
    if (!enabled || registrationStatus !== 'registered') {
      return null;
    }
    
    statsRef.current.totalRequests++;
    const requestStart = Date.now();
    
    try {
      console.log('[useSSECardEvents] Fetching card events...');
      
      // Build API URL with metadata flag
      const apiUrl = `/api/cards/events${includeMetadata ? '?includeMetadata=true' : ''}`;
      
      const rawData = await coordinatedFetch(apiUrl, {}, { 
        timestamp: requestStart,
        hookId: hookIdRef.current 
      });
      
      const responseTime = Date.now() - requestStart;
      
      // Process and validate data
      const { isValid, cards: newCards, metadata } = processCardEventsData(rawData, previousCardsRef.current);
      
      if (!isValid) {
        console.warn('[useSSECardEvents] Invalid data received, keeping previous cards');
        return;
      }
      
      // Check for changes
      const newHash = createCardEventsHash(newCards);
      const hasChanges = previousHashRef.current !== newHash;
      
      if (hasChanges) {
        console.log(`[useSSECardEvents] Card state changed, updating ${newCards.length} cards`);
        
        // Detect specific change types for callbacks
        if (previousCardsRef.current.length > 0) {
          detectAndHandleCardChanges(previousCardsRef.current, newCards, {
            onCardFlip,
            onCardMove,
            onCardUpdate
          });
        }
        
        // Update state
        setCards(newCards);
        setLoading(false);
        setError(null);
        setLastUpdateTime(Date.now());
        setConnectionStatus('connected');
        
        // Update refs
        previousHashRef.current = newHash;
        previousCardsRef.current = newCards;
      } else {
        console.log('[useSSECardEvents] No card changes detected');
        setLoading(false);
        setConnectionStatus('connected');
      }
      
      // Update performance stats
      statsRef.current.successfulRequests++;
      statsRef.current.lastRequestTime = responseTime;
      statsRef.current.averageResponseTime = 
        (statsRef.current.averageResponseTime + responseTime) / 2;
      
    } catch (err) {
      console.error('[useSSECardEvents] Fetch failed:', err);
      
      statsRef.current.failedRequests++;
      setError(err.message);
      setConnectionStatus('error');
      setLoading(false);
    }
  }, [enabled, registrationStatus, includeMetadata, onCardFlip, onCardMove, onCardUpdate]);
  
  /**
   * Detect and handle specific types of card changes
   */
  const detectAndHandleCardChanges = useCallback((oldCards, newCards, callbacks) => {
    const { onCardFlip, onCardMove, onCardUpdate } = callbacks;
    
    // Create lookup maps for efficient comparison
    const oldCardMap = new Map(oldCards.map(card => [card.id, card]));
    const newCardMap = new Map(newCards.map(card => [card.id, card]));
    
    // Check each card for changes
    newCards.forEach(newCard => {
      const oldCard = oldCardMap.get(newCard.id);
      
      if (!oldCard) {
        // New card created
        console.log(`[Card Events] New card created: ${newCard.id}`);
        return;
      }
      
      // Check for flip changes
      if (oldCard.faceUp !== newCard.faceUp) {
        const flipEvent = {
          cardId: newCard.id,
          from: oldCard.faceUp ? 'faceUp' : 'faceDown',
          to: newCard.faceUp ? 'faceUp' : 'faceDown',
          zone: newCard.zone,
          timestamp: Date.now()
        };
        
        statsRef.current.cardFlipEvents++;
        console.log(`[Card Flip Event] Card ${newCard.id} flipped from ${flipEvent.from} to ${flipEvent.to}`);
        
        if (onCardFlip) {
          onCardFlip(flipEvent);
        }
      }
      
      // Check for position/zone changes  
      if (oldCard.zone !== newCard.zone || 
          JSON.stringify(oldCard.position) !== JSON.stringify(newCard.position)) {
        const moveEvent = {
          cardId: newCard.id,
          fromZone: oldCard.zone,
          toZone: newCard.zone,
          fromPosition: oldCard.position,
          toPosition: newCard.position,
          timestamp: Date.now()
        };
        
        statsRef.current.cardMoveEvents++;
        console.log(`[Card Move Event] Card ${newCard.id} moved from ${moveEvent.fromZone} to ${moveEvent.toZone}`);
        
        if (onCardMove) {
          onCardMove(moveEvent);
        }
      }
      
      // Check for content/assignment changes
      if (oldCard.content !== newCard.content || 
          oldCard.assignedTo !== newCard.assignedTo ||
          oldCard.updatedAt !== newCard.updatedAt) {
        const updateEvent = {
          cardId: newCard.id,
          changes: {
            content: oldCard.content !== newCard.content,
            assignedTo: oldCard.assignedTo !== newCard.assignedTo,
            updated: oldCard.updatedAt !== newCard.updatedAt
          },
          timestamp: Date.now()
        };
        
        statsRef.current.cardUpdateEvents++;
        console.log(`[Card Update Event] Card ${newCard.id} updated:`, updateEvent.changes);
        
        if (onCardUpdate) {
          onCardUpdate(updateEvent);
        }
      }
    });
    
    // Check for deleted cards
    oldCards.forEach(oldCard => {
      if (!newCardMap.has(oldCard.id)) {
        console.log(`[Card Events] Card deleted: ${oldCard.id}`);
      }
    });
  }, []);
  
  /**
   * Hook Registration and Coordination
   */
  useEffect(() => {
    if (!enabled) {
      if (hookIdRef.current) {
        registrationUtils.unregisterHook(hookIdRef.current);
        hookIdRef.current = null;
        setRegistrationStatus('unregistered');
      }
      return;
    }
    
    console.log('[useSSECardEvents] Attempting hook registration for /api/cards/events');
    const hookId = registrationUtils.registerHook();
    if (hookId) {
      hookIdRef.current = hookId;
      setRegistrationStatus('registered');
      console.log('[useSSECardEvents] ✅ Hook registered successfully:', hookId);
    } else {
      setRegistrationStatus('rejected');
      console.warn('[useSSECardEvents] ❌ Hook registration rejected - another hook is active');
      return;
    }
    
    return () => {
      if (hookIdRef.current) {
        registrationUtils.unregisterHook(hookIdRef.current);
        hookIdRef.current = null;
        setRegistrationStatus('unregistered');
      }
    };
  }, [enabled, registrationUtils]);
  
  /**
   * SSE Polling Loop - CRITICAL: Must continue in background tabs for /dev/convos
   */
  useEffect(() => {
    if (!enabled || registrationStatus !== 'registered') {
      return;
    }
    
    console.log(`[useSSECardEvents] Starting polling loop with ${cardEventsInterval}ms interval (background enabled)`);
    
    // Initial fetch
    fetchCardEvents();
    
    // Set up polling interval - IMPORTANT: Does NOT pause in background tabs
    // This ensures /dev/convos continues to work even when tab is not active
    const intervalId = setInterval(fetchCardEvents, cardEventsInterval);
    
    // CRITICAL: Add visibility change handler to maintain real-time operation
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[useSSECardEvents] Tab became visible - triggering immediate refresh');
        fetchCardEvents(); // Immediate sync when tab becomes active
      } else if (backgroundOperation) {
        console.log('[useSSECardEvents] Tab backgrounded - continuing polling for dev/convos compatibility');
        // IMPORTANT: Do NOT pause polling - dev/convos needs real-time updates
      } else {
        console.log('[useSSECardEvents] Tab backgrounded - background operation disabled');
      }
    };
    
    // Only add listener if background operation is enabled
    if (backgroundOperation) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    
    return () => {
      console.log('[useSSECardEvents] Cleaning up polling loop');
      clearInterval(intervalId);
      if (backgroundOperation) {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [enabled, registrationStatus, cardEventsInterval, fetchCardEvents]);
  
  /**
   * Get performance statistics
   */
  const getPerformanceStats = useCallback(() => {
    const stats = statsRef.current;
    const uptime = Date.now() - stats.startTime;
    
    return {
      ...stats,
      uptime,
      successRate: stats.totalRequests > 0 ? 
        (stats.successfulRequests / stats.totalRequests * 100).toFixed(1) : 0,
      errorRate: stats.totalRequests > 0 ?
        (stats.failedRequests / stats.totalRequests * 100).toFixed(1) : 0,
      requestsPerMinute: uptime > 0 ? 
        ((stats.totalRequests / uptime) * 60000).toFixed(1) : 0,
      currentInterval: cardEventsInterval,
      registrationStatus
    };
  }, [cardEventsInterval, registrationStatus]);
  
  /**
   * Organize cards by zone for easy consumption
   */
  const cardsByZone = useMemo(() => {
    return cards.reduce((acc, card) => {
      if (!acc[card.zone]) {
        acc[card.zone] = [];
      }
      acc[card.zone].push(card);
      return acc;
    }, {});
  }, [cards]);
  
  /**
   * Manual refresh function
   */
  const refreshCardEvents = useCallback(async () => {
    console.log('[useSSECardEvents] Manual refresh triggered');
    setLoading(true);
    await fetchCardEvents();
  }, [fetchCardEvents]);
  
  return {
    // Core card state
    cards,
    loading,
    error,
    lastUpdateTime,
    connectionStatus,
    
    // Organized data
    cardsByZone,
    
    // Utilities
    refreshCardEvents,
    getPerformanceStats,
    
    // Registry information
    isRegistered: registrationStatus === 'registered',
    registrationStatus,
    hookId: hookIdRef.current,
    
    // Real-time configuration
    interval: cardEventsInterval,
    includeMetadata,
    
    // Performance metrics
    totalCards: cards.length,
    isRealTime: cardEventsInterval <= 2000,
    
    // Debug information (development only)
    _debug: process.env.NODE_ENV === 'development' ? {
      previousHash: previousHashRef.current.substring(0, 50) + '...',
      stats: statsRef.current,
      hookRegistry: registrationUtils.getStats()
    } : undefined
  };
}