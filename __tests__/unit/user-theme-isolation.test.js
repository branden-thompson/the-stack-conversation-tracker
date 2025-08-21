/**
 * Unit Tests for User Theme Mode Isolation
 * 
 * Tests the core user theme storage utilities and feature flag functionality.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  getThemeModeKey,
  getDefaultThemeMode,
  getUserThemeMode,
  setUserThemeMode,
  isUserThemeIsolationEnabled
} from '@/lib/utils/user-theme-storage';

// Mock localStorage
const mockLocalStorage = {
  data: {},
  getItem: vi.fn((key) => mockLocalStorage.data[key] || null),
  setItem: vi.fn((key, value) => { mockLocalStorage.data[key] = value; }),
  removeItem: vi.fn((key) => { delete mockLocalStorage.data[key]; }),
  clear: vi.fn(() => { mockLocalStorage.data = {}; })
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// Mock environment variable
const originalEnv = process.env.NEXT_PUBLIC_ENABLE_USER_THEME_ISOLATION;

describe('User Theme Mode Isolation - Core Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.clear();
    process.env.NEXT_PUBLIC_ENABLE_USER_THEME_ISOLATION = 'true';
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_ENABLE_USER_THEME_ISOLATION = originalEnv;
  });

  describe('getThemeModeKey', () => {
    it('should generate correct key for user ID', () => {
      expect(getThemeModeKey('user123')).toBe('user_user123_theme_mode');
    });

    it('should generate correct key for guest user ID', () => {
      expect(getThemeModeKey('guest_abc123')).toBe('user_guest_abc123_theme_mode');
    });

    it('should use fallback key for null/undefined userId', () => {
      expect(getThemeModeKey(null)).toBe('user_fallback_theme_mode');
      expect(getThemeModeKey(undefined)).toBe('user_fallback_theme_mode');
    });
  });

  describe('getDefaultThemeMode', () => {
    it('should return dark for guest users', () => {
      const guestUser = { id: 'guest_123', isGuest: true };
      expect(getDefaultThemeMode(guestUser)).toBe('dark');
    });

    it('should return user preference for registered users', () => {
      const user = { 
        id: 'user123', 
        isGuest: false, 
        preferences: { themeMode: 'light' } 
      };
      expect(getDefaultThemeMode(user)).toBe('light');
    });

    it('should return dark as fallback for users without preferences', () => {
      const user = { id: 'user123', isGuest: false };
      expect(getDefaultThemeMode(user)).toBe('dark');
    });
  });

  describe('getUserThemeMode', () => {
    it('should retrieve stored theme mode for user', () => {
      const userId = 'user123';
      const expectedKey = 'user_user123_theme_mode';
      mockLocalStorage.data[expectedKey] = 'light';

      const result = getUserThemeMode(userId);
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(expectedKey);
      expect(result).toBe('light');
    });

    it('should return default when no stored theme mode', () => {
      const guestUser = { id: 'guest_123', isGuest: true };
      
      const result = getUserThemeMode('guest_123', guestUser);
      
      expect(result).toBe('dark'); // Guest default
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const user = { id: 'user123', isGuest: false };
      const result = getUserThemeMode('user123', user);
      
      expect(result).toBe('dark'); // Fallback default
    });
  });

  describe('setUserThemeMode', () => {
    it('should store theme mode for user', () => {
      const userId = 'user123';
      const mode = 'light';
      const expectedKey = 'user_user123_theme_mode';

      const result = setUserThemeMode(userId, mode);
      
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(expectedKey, mode);
      expect(result).toBe(true);
    });

    it('should reject invalid theme modes', () => {
      const result = setUserThemeMode('user123', 'invalid');
      
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should reject calls without userId', () => {
      const result = setUserThemeMode(null, 'dark');
      
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const result = setUserThemeMode('user123', 'dark');
      
      expect(result).toBe(false);
    });
  });

  describe('isUserThemeIsolationEnabled', () => {
    it('should return true when environment variable is true', () => {
      process.env.NEXT_PUBLIC_ENABLE_USER_THEME_ISOLATION = 'true';
      
      expect(isUserThemeIsolationEnabled()).toBe(true);
    });

    it('should return false when environment variable is false', () => {
      process.env.NEXT_PUBLIC_ENABLE_USER_THEME_ISOLATION = 'false';
      
      expect(isUserThemeIsolationEnabled()).toBe(false);
    });

    it('should return false when environment variable is undefined', () => {
      delete process.env.NEXT_PUBLIC_ENABLE_USER_THEME_ISOLATION;
      
      expect(isUserThemeIsolationEnabled()).toBe(false);
    });

    it('should return false when emergency disabled in localStorage', () => {
      process.env.NEXT_PUBLIC_ENABLE_USER_THEME_ISOLATION = 'true';
      mockLocalStorage.data['user_theme_isolation_disabled'] = 'true';
      
      expect(isUserThemeIsolationEnabled()).toBe(false);
    });
  });

  describe('User Isolation Integration', () => {
    it('should maintain separate theme modes for different users', () => {
      // Set different themes for different users
      setUserThemeMode('user1', 'light');
      setUserThemeMode('user2', 'dark');
      setUserThemeMode('guest_123', 'system');

      // Verify isolation
      expect(getUserThemeMode('user1')).toBe('light');
      expect(getUserThemeMode('user2')).toBe('dark');
      expect(getUserThemeMode('guest_123')).toBe('system');
    });

    it('should not interfere with other localStorage keys', () => {
      mockLocalStorage.data['other_key'] = 'other_value';
      
      setUserThemeMode('user123', 'dark');
      
      expect(mockLocalStorage.data['other_key']).toBe('other_value');
      expect(mockLocalStorage.data['user_user123_theme_mode']).toBe('dark');
    });
  });
});