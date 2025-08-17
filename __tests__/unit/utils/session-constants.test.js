/**
 * Unit tests for session constants and utilities
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  SESSION_EVENT_TYPES,
  EVENT_CATEGORIES,
  EVENT_TYPE_CATEGORY_MAP,
  SESSION_STATUS,
  SESSION_USER_TYPES,
  SESSION_CONFIG,
  detectBrowser,
  detectOS,
  getBrowserInfo,
  createSessionEvent,
  createSession,
  isSessionIdle,
  isSessionInactive,
} from '@/lib/utils/session-constants';

describe('Session Constants', () => {
  describe('Event Type to Category Mapping', () => {
    it('should map all event types to categories', () => {
      Object.values(SESSION_EVENT_TYPES).forEach(eventType => {
        const category = EVENT_TYPE_CATEGORY_MAP[eventType];
        expect(category).toBeDefined();
        expect(Object.values(EVENT_CATEGORIES)).toContain(category);
      });
    });

    it('should map navigation events correctly', () => {
      expect(EVENT_TYPE_CATEGORY_MAP[SESSION_EVENT_TYPES.PAGE_VIEW]).toBe(EVENT_CATEGORIES.NAVIGATION);
      expect(EVENT_TYPE_CATEGORY_MAP[SESSION_EVENT_TYPES.ROUTE_CHANGE]).toBe(EVENT_CATEGORIES.NAVIGATION);
    });

    it('should map board events correctly', () => {
      expect(EVENT_TYPE_CATEGORY_MAP[SESSION_EVENT_TYPES.CARD_CREATED]).toBe(EVENT_CATEGORIES.BOARD);
      expect(EVENT_TYPE_CATEGORY_MAP[SESSION_EVENT_TYPES.CARD_MOVED]).toBe(EVENT_CATEGORIES.BOARD);
      expect(EVENT_TYPE_CATEGORY_MAP[SESSION_EVENT_TYPES.CARD_FLIPPED]).toBe(EVENT_CATEGORIES.BOARD);
    });
  });

  describe('Browser Detection', () => {
    it('should detect Chrome browser', () => {
      const chromeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      expect(detectBrowser(chromeUA)).toBe('Chrome 120');
    });

    it('should detect Safari browser', () => {
      const safariUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';
      expect(detectBrowser(safariUA)).toBe('Safari 17');
    });

    it('should detect Firefox browser', () => {
      const firefoxUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0';
      expect(detectBrowser(firefoxUA)).toBe('Firefox 121');
    });

    it('should detect Edge browser', () => {
      const edgeUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
      expect(detectBrowser(edgeUA)).toBe('Edge 120');
    });

    it('should return Unknown Browser for unrecognized UA', () => {
      expect(detectBrowser('SomeRandomBrowser/1.0')).toBe('Unknown Browser');
    });
  });

  describe('OS Detection', () => {
    it('should detect macOS', () => {
      const macUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';
      expect(detectOS(macUA)).toBe('macOS');
    });

    it('should detect Windows', () => {
      const winUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)';
      expect(detectOS(winUA)).toBe('Windows');
    });

    it('should detect Linux', () => {
      const linuxUA = 'Mozilla/5.0 (X11; Linux x86_64)';
      expect(detectOS(linuxUA)).toBe('Linux');
    });

    it('should detect Android', () => {
      const androidUA = 'Mozilla/5.0 (Linux; Android 13)';
      expect(detectOS(androidUA)).toBe('Android');
    });

    it('should detect iOS', () => {
      const iosUA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)';
      expect(detectOS(iosUA)).toBe('iOS');
    });
  });

  describe('getBrowserInfo', () => {
    it('should combine browser and OS information', () => {
      const chromeOnMac = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      expect(getBrowserInfo(chromeOnMac)).toBe('Chrome 120 on macOS');
    });

    it('should handle unknown combinations', () => {
      expect(getBrowserInfo('Unknown/1.0')).toBe('Unknown Browser on Unknown OS');
    });
  });

  describe('createSessionEvent', () => {
    it('should create event with correct structure', () => {
      const event = createSessionEvent(SESSION_EVENT_TYPES.CARD_CREATED, {
        cardId: '123',
        cardType: 'topic',
      });

      expect(event).toHaveProperty('id');
      expect(event.type).toBe(SESSION_EVENT_TYPES.CARD_CREATED);
      expect(event.category).toBe(EVENT_CATEGORIES.BOARD);
      expect(event).toHaveProperty('timestamp');
      expect(event.metadata).toEqual({
        cardId: '123',
        cardType: 'topic',
      });
    });

    it('should generate unique IDs', () => {
      const event1 = createSessionEvent(SESSION_EVENT_TYPES.PAGE_VIEW);
      const event2 = createSessionEvent(SESSION_EVENT_TYPES.PAGE_VIEW);
      expect(event1.id).not.toBe(event2.id);
    });

    it('should handle custom event types', () => {
      const event = createSessionEvent('custom_event');
      expect(event.category).toBe(EVENT_CATEGORIES.CUSTOM);
    });
  });

  describe('createSession', () => {
    beforeEach(() => {
      vi.stubGlobal('location', { pathname: '/test/path' });
      vi.stubGlobal('navigator', { 
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
      });
    });

    it('should create session with correct structure', () => {
      const session = createSession('user123', SESSION_USER_TYPES.REGISTERED);

      expect(session).toHaveProperty('id');
      expect(session.userId).toBe('user123');
      expect(session.userType).toBe(SESSION_USER_TYPES.REGISTERED);
      expect(session.status).toBe(SESSION_STATUS.ACTIVE);
      expect(session).toHaveProperty('startedAt');
      expect(session).toHaveProperty('lastActivityAt');
      expect(session.browser).toBe('Chrome 120 on macOS');
      expect(session.currentRoute).toBe('/test/path');
      expect(session.eventCount).toBe(0);
      expect(session.recentActions).toEqual([]);
      expect(session.metadata).toEqual({});
    });

    it('should default to registered user type', () => {
      const session = createSession('user123');
      expect(session.userType).toBe(SESSION_USER_TYPES.REGISTERED);
    });

    it('should handle guest user type', () => {
      const session = createSession('guest_abc', SESSION_USER_TYPES.GUEST);
      expect(session.userType).toBe(SESSION_USER_TYPES.GUEST);
    });
  });

  describe('Idle Detection', () => {
    it('should detect idle sessions correctly', () => {
      const now = Date.now();
      
      // Not idle - just active
      expect(isSessionIdle(now)).toBe(false);
      
      // Not idle - 4 minutes ago
      expect(isSessionIdle(now - 4 * 60 * 1000)).toBe(false);
      
      // Idle - 6 minutes ago
      expect(isSessionIdle(now - 6 * 60 * 1000)).toBe(true);
      
      // Idle - 1 hour ago
      expect(isSessionIdle(now - 60 * 60 * 1000)).toBe(true);
    });
  });

  describe('Inactive Detection', () => {
    it('should detect inactive sessions correctly', () => {
      const now = Date.now();
      
      // Active - just now
      expect(isSessionInactive(now)).toBe(false);
      
      // Active - 20 seconds ago
      expect(isSessionInactive(now - 20 * 1000)).toBe(false);
      
      // Inactive - 31 seconds ago
      expect(isSessionInactive(now - 31 * 1000)).toBe(true);
      
      // Inactive - 5 minutes ago
      expect(isSessionInactive(now - 5 * 60 * 1000)).toBe(true);
    });
  });

  describe('Configuration Defaults', () => {
    it('should have correct idle threshold', () => {
      expect(SESSION_CONFIG.IDLE_THRESHOLD_MS).toBe(5 * 60 * 1000); // 5 minutes
    });

    it('should have correct inactive threshold', () => {
      expect(SESSION_CONFIG.INACTIVE_THRESHOLD_MS).toBe(30 * 1000); // 30 seconds
    });

    it('should have correct batch settings', () => {
      expect(SESSION_CONFIG.BATCH_SIZE).toBe(10);
      expect(SESSION_CONFIG.BATCH_TIMEOUT_MS).toBe(500);
    });

    it('should have correct TTL settings', () => {
      expect(SESSION_CONFIG.EVENT_TTL_MS).toBe(60 * 60 * 1000); // 1 hour
      expect(SESSION_CONFIG.SESSION_TTL_MS).toBe(24 * 60 * 60 * 1000); // 24 hours
    });
  });
});