/**
 * Unit tests for session tracker service
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import sessionTracker from '@/lib/services/session-tracker';
import { SESSION_EVENT_TYPES, SESSION_STATUS } from '@/lib/utils/session-constants';

describe('SessionTracker Service', () => {
  beforeEach(() => {
    // Reset session tracker state
    sessionTracker.currentSession = null;
    sessionTracker.currentUserId = null;
    sessionTracker.eventQueue = [];
    sessionTracker.subscribers.clear();
    
    // Mock fetch
    global.fetch = vi.fn(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      })
    );
    
    // Mock timers
    vi.useFakeTimers();
    
    // Mock window/document
    vi.stubGlobal('location', { pathname: '/test' });
    vi.stubGlobal('document', {
      hidden: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal('window', {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      location: { pathname: '/test' },
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Session Management', () => {
    it('should start a new session', async () => {
      const session = await sessionTracker.startSession('user123', 'registered');
      
      expect(session).toBeDefined();
      expect(session.userId).toBe('user123');
      expect(session.userType).toBe('registered');
      expect(session.status).toBe(SESSION_STATUS.ACTIVE);
      expect(sessionTracker.currentSession).toBe(session);
      expect(sessionTracker.currentUserId).toBe('user123');
    });

    it('should emit session start event', async () => {
      await sessionTracker.startSession('user123', 'registered');
      
      expect(sessionTracker.eventQueue).toHaveLength(1);
      expect(sessionTracker.eventQueue[0].type).toBe(SESSION_EVENT_TYPES.SESSION_START);
      expect(sessionTracker.eventQueue[0].metadata.userId).toBe('user123');
    });

    it('should end previous session when starting new one', async () => {
      const session1 = await sessionTracker.startSession('user1', 'registered');
      const session2 = await sessionTracker.startSession('user2', 'registered');
      
      expect(session1.status).toBe(SESSION_STATUS.ENDED);
      expect(session2.status).toBe(SESSION_STATUS.ACTIVE);
      expect(sessionTracker.currentSession).toBe(session2);
    });

    it('should end session correctly', async () => {
      await sessionTracker.startSession('user123', 'registered');
      const endedSession = await sessionTracker.endSession();
      
      expect(endedSession.status).toBe(SESSION_STATUS.ENDED);
      expect(sessionTracker.currentSession).toBeNull();
      expect(sessionTracker.currentUserId).toBeNull();
    });

    it('should flush events when ending session', async () => {
      await sessionTracker.startSession('user123', 'registered');
      sessionTracker.emitEvent(SESSION_EVENT_TYPES.PAGE_VIEW, { route: '/test' });
      
      await sessionTracker.endSession();
      
      // Check that fetch was called to flush events
      expect(fetch).toHaveBeenCalledWith(
        '/api/sessions/events',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  describe('Event Emission', () => {
    beforeEach(async () => {
      await sessionTracker.startSession('user123', 'registered');
    });

    it('should emit events with correct structure', () => {
      const event = sessionTracker.emitEvent(SESSION_EVENT_TYPES.CARD_CREATED, {
        cardId: 'card123',
      });
      
      expect(event).toBeDefined();
      expect(event.type).toBe(SESSION_EVENT_TYPES.CARD_CREATED);
      expect(event.metadata.cardId).toBe('card123');
      expect(event.metadata.sessionId).toBe(sessionTracker.currentSession.id);
      expect(event.metadata.userId).toBe('user123');
    });

    it('should add events to queue', () => {
      sessionTracker.eventQueue = []; // Clear initial session start event
      
      sessionTracker.emitEvent(SESSION_EVENT_TYPES.PAGE_VIEW);
      sessionTracker.emitEvent(SESSION_EVENT_TYPES.CARD_CREATED);
      
      expect(sessionTracker.eventQueue).toHaveLength(2);
    });

    it('should update session event count', () => {
      const initialCount = sessionTracker.currentSession.eventCount;
      
      sessionTracker.emitEvent(SESSION_EVENT_TYPES.PAGE_VIEW);
      sessionTracker.emitEvent(SESSION_EVENT_TYPES.CARD_CREATED);
      
      expect(sessionTracker.currentSession.eventCount).toBe(initialCount + 2);
    });

    it('should track recent actions', () => {
      sessionTracker.currentSession.recentActions = [];
      
      sessionTracker.emitEvent(SESSION_EVENT_TYPES.PAGE_VIEW, { route: '/page1' });
      sessionTracker.emitEvent(SESSION_EVENT_TYPES.CARD_CREATED, { cardId: 'card1' });
      
      expect(sessionTracker.currentSession.recentActions).toHaveLength(2);
      expect(sessionTracker.currentSession.recentActions[0].type).toBe(SESSION_EVENT_TYPES.CARD_CREATED);
      expect(sessionTracker.currentSession.recentActions[1].type).toBe(SESSION_EVENT_TYPES.PAGE_VIEW);
    });

    it('should limit recent actions to 10', () => {
      sessionTracker.currentSession.recentActions = [];
      
      for (let i = 0; i < 15; i++) {
        sessionTracker.emitEvent(SESSION_EVENT_TYPES.PAGE_VIEW, { index: i });
      }
      
      expect(sessionTracker.currentSession.recentActions).toHaveLength(10);
      expect(sessionTracker.currentSession.recentActions[0].metadata.index).toBe(14); // Most recent
      expect(sessionTracker.currentSession.recentActions[9].metadata.index).toBe(5); // 10th most recent
    });
  });

  describe('Event Batching', () => {
    beforeEach(async () => {
      await sessionTracker.startSession('user123', 'registered');
      sessionTracker.eventQueue = []; // Clear initial event
    });

    it('should batch events before sending', () => {
      sessionTracker.emitEvent(SESSION_EVENT_TYPES.PAGE_VIEW);
      sessionTracker.emitEvent(SESSION_EVENT_TYPES.CARD_CREATED);
      
      expect(fetch).not.toHaveBeenCalled();
      
      // Fast-forward to batch timeout
      vi.advanceTimersByTime(sessionTracker.config.BATCH_TIMEOUT_MS);
      
      expect(fetch).toHaveBeenCalledWith(
        '/api/sessions/events',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('PAGE_VIEW'),
        })
      );
    });

    it('should send immediately when batch size reached', () => {
      // Fill up to batch size
      for (let i = 0; i < sessionTracker.config.BATCH_SIZE; i++) {
        sessionTracker.emitEvent(SESSION_EVENT_TYPES.PAGE_VIEW, { index: i });
      }
      
      // Should send immediately without waiting for timeout
      expect(fetch).toHaveBeenCalled();
    });

    it('should clear queue after successful send', async () => {
      sessionTracker.emitEvent(SESSION_EVENT_TYPES.PAGE_VIEW);
      sessionTracker.emitEvent(SESSION_EVENT_TYPES.CARD_CREATED);
      
      expect(sessionTracker.eventQueue).toHaveLength(2);
      
      await sessionTracker.flushEvents();
      
      expect(sessionTracker.eventQueue).toHaveLength(0);
    });

    it('should re-queue events on send failure', async () => {
      // Mock fetch failure
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));
      
      sessionTracker.emitEvent(SESSION_EVENT_TYPES.PAGE_VIEW);
      const initialQueue = [...sessionTracker.eventQueue];
      
      await sessionTracker.flushEvents();
      
      // Events should be re-queued
      expect(sessionTracker.eventQueue).toEqual(initialQueue);
    });
  });

  describe('Route Tracking', () => {
    beforeEach(async () => {
      await sessionTracker.startSession('user123', 'registered');
      sessionTracker.eventQueue = []; // Clear initial event
    });

    it('should update current route', () => {
      sessionTracker.updateRoute('/new/path');
      
      expect(sessionTracker.currentSession.currentRoute).toBe('/new/path');
    });

    it('should emit route change event', () => {
      sessionTracker.currentSession.currentRoute = '/old/path';
      sessionTracker.updateRoute('/new/path');
      
      expect(sessionTracker.eventQueue).toHaveLength(1);
      expect(sessionTracker.eventQueue[0].type).toBe(SESSION_EVENT_TYPES.ROUTE_CHANGE);
      expect(sessionTracker.eventQueue[0].metadata.from).toBe('/old/path');
      expect(sessionTracker.eventQueue[0].metadata.to).toBe('/new/path');
    });

    it('should not emit event if route unchanged', () => {
      sessionTracker.currentSession.currentRoute = '/same/path';
      sessionTracker.updateRoute('/same/path');
      
      expect(sessionTracker.eventQueue).toHaveLength(0);
    });
  });

  describe('Idle Detection', () => {
    beforeEach(async () => {
      await sessionTracker.startSession('user123', 'registered');
      sessionTracker.eventQueue = []; // Clear initial event
    });

    it('should detect idle state after threshold', () => {
      sessionTracker.startIdleDetection();
      
      // Simulate time passing beyond idle threshold
      sessionTracker.lastActivityTime = Date.now() - (sessionTracker.config.IDLE_THRESHOLD_MS + 1000);
      
      // Trigger idle check
      vi.advanceTimersByTime(5000);
      
      expect(sessionTracker.currentSession.status).toBe(SESSION_STATUS.IDLE);
      expect(sessionTracker.eventQueue.some(e => e.type === SESSION_EVENT_TYPES.USER_IDLE)).toBe(true);
    });

    it('should detect inactive state after threshold', () => {
      sessionTracker.startIdleDetection();
      
      // Simulate time passing beyond inactive threshold but not idle
      sessionTracker.lastActivityTime = Date.now() - (sessionTracker.config.INACTIVE_THRESHOLD_MS + 1000);
      
      // Trigger check
      vi.advanceTimersByTime(5000);
      
      expect(sessionTracker.currentSession.status).toBe(SESSION_STATUS.INACTIVE);
    });

    it('should reset idle state on activity', () => {
      sessionTracker.currentSession.status = SESSION_STATUS.IDLE;
      sessionTracker.handleActivity();
      
      expect(sessionTracker.currentSession.status).toBe(SESSION_STATUS.ACTIVE);
      expect(sessionTracker.eventQueue.some(e => e.type === SESSION_EVENT_TYPES.USER_ACTIVE)).toBe(true);
    });
  });

  describe('Subscribers', () => {
    it('should add subscribers', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      
      sessionTracker.subscribe(callback1);
      sessionTracker.subscribe(callback2);
      
      expect(sessionTracker.subscribers.size).toBe(2);
    });

    it('should notify subscribers of events', async () => {
      const callback = vi.fn();
      sessionTracker.subscribe(callback);
      
      await sessionTracker.startSession('user123', 'registered');
      
      expect(callback).toHaveBeenCalledWith('session_started', expect.any(Object));
    });

    it('should unsubscribe correctly', () => {
      const callback = vi.fn();
      const unsubscribe = sessionTracker.subscribe(callback);
      
      expect(sessionTracker.subscribers.size).toBe(1);
      
      unsubscribe();
      
      expect(sessionTracker.subscribers.size).toBe(0);
    });

    it('should handle subscriber errors gracefully', async () => {
      const errorCallback = vi.fn(() => {
        throw new Error('Subscriber error');
      });
      const normalCallback = vi.fn();
      
      sessionTracker.subscribe(errorCallback);
      sessionTracker.subscribe(normalCallback);
      
      // Should not throw
      await sessionTracker.startSession('user123', 'registered');
      
      expect(errorCallback).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalled();
    });
  });

  describe('Configuration', () => {
    it('should update configuration', () => {
      const newConfig = {
        BATCH_SIZE: 20,
        POLL_INTERVAL_MS: 5000,
      };
      
      sessionTracker.updateConfig(newConfig);
      
      expect(sessionTracker.config.BATCH_SIZE).toBe(20);
      expect(sessionTracker.config.POLL_INTERVAL_MS).toBe(5000);
      // Other config should remain unchanged
      expect(sessionTracker.config.IDLE_THRESHOLD_MS).toBe(5 * 60 * 1000);
    });
  });
});