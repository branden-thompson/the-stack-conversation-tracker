import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getThemeModeKey,
  getDefaultThemeMode,
  getUserThemeMode,
  setUserThemeMode,
  removeUserThemeMode,
  getAllUserThemes,
  getThemeStorageUsage,
  cleanupOrphanedThemeData,
  isUserThemeIsolationEnabled,
  emergencyDisableUserThemeIsolation,
  enableUserThemeIsolation
} from '@/lib/utils/user-theme-storage';

// Mock localStorage
const mockLocalStorage = {
  data: {},
  getItem: vi.fn((key) => mockLocalStorage.data[key] || null),
  setItem: vi.fn((key, value) => { mockLocalStorage.data[key] = value; }),
  removeItem: vi.fn((key) => { delete mockLocalStorage.data[key]; }),
  clear: vi.fn(() => { mockLocalStorage.data = {}; }),
  key: vi.fn((index) => Object.keys(mockLocalStorage.data)[index] || null),
  get length() { return Object.keys(this.data).length; }
};

// Mock environment variable
const originalEnv = process.env.NEXT_PUBLIC_ENABLE_USER_THEME_ISOLATION;

describe('user-theme-storage utilities', () => {
  beforeEach(() => {
    // Reset localStorage mock
    mockLocalStorage.clear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });
    
    // Enable feature by default
    process.env.NEXT_PUBLIC_ENABLE_USER_THEME_ISOLATION = 'true';
  });

  afterEach(() => {
    // Restore environment
    process.env.NEXT_PUBLIC_ENABLE_USER_THEME_ISOLATION = originalEnv;
  });

  describe('getThemeModeKey', () => {
    it('should generate correct key for regular user', () => {
      expect(getThemeModeKey('user123')).toBe('user_user123_theme_mode');
    });

    it('should generate correct key for guest user', () => {
      expect(getThemeModeKey('guest_abc123')).toBe('user_guest_abc123_theme_mode');
    });

    it('should handle missing userId with fallback', () => {
      expect(getThemeModeKey(null)).toBe('user_fallback_theme_mode');
      expect(getThemeModeKey('')).toBe('user_fallback_theme_mode');
    });
  });

  describe('getDefaultThemeMode', () => {
    it('should return dark for guest users', () => {
      const guestUser = { id: 'guest_123', isGuest: true };
      expect(getDefaultThemeMode(guestUser)).toBe('dark');
    });

    it('should return dark for registered users without preferences', () => {
      const user = { id: 'user123', isGuest: false };
      expect(getDefaultThemeMode(user)).toBe('dark');
    });

    it('should return user preference if available', () => {
      const user = { id: 'user123', preferences: { themeMode: 'light' } };
      expect(getDefaultThemeMode(user)).toBe('light');
    });

    it('should handle null user', () => {
      expect(getDefaultThemeMode(null)).toBe('dark');
    });
  });

  describe('getUserThemeMode', () => {
    it('should return stored theme mode', () => {
      mockLocalStorage.setItem('user_user123_theme_mode', 'light');
      expect(getUserThemeMode('user123')).toBe('light');
    });

    it('should return default and store it when no stored value', () => {
      const user = { id: 'user123', isGuest: false };
      expect(getUserThemeMode('user123', user)).toBe('dark');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user_user123_theme_mode', 'dark');
    });

    it('should handle invalid stored values', () => {
      mockLocalStorage.setItem('user_user123_theme_mode', 'invalid');
      const user = { id: 'user123', isGuest: false };
      expect(getUserThemeMode('user123', user)).toBe('dark');
    });

    it('should handle localStorage errors', () => {
      mockLocalStorage.getItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });
      
      const user = { id: 'user123', isGuest: false };
      expect(getUserThemeMode('user123', user)).toBe('dark');
    });

    it('should handle missing userId', () => {
      expect(getUserThemeMode(null)).toBe('dark');
      expect(getUserThemeMode('')).toBe('dark');
    });
  });

  describe('setUserThemeMode', () => {
    it('should store valid theme mode', () => {
      expect(setUserThemeMode('user123', 'light')).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user_user123_theme_mode', 'light');
    });

    it('should reject invalid theme modes', () => {
      expect(setUserThemeMode('user123', 'invalid')).toBe(false);
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    it('should handle missing userId', () => {
      expect(setUserThemeMode(null, 'light')).toBe(false);
      expect(setUserThemeMode('', 'dark')).toBe(false);
    });

    it('should handle localStorage errors', () => {
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });
      
      expect(setUserThemeMode('user123', 'light')).toBe(false);
    });
  });

  describe('removeUserThemeMode', () => {
    it('should remove theme mode successfully', () => {
      mockLocalStorage.setItem('user_user123_theme_mode', 'light');
      expect(removeUserThemeMode('user123')).toBe(true);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user_user123_theme_mode');
    });

    it('should handle missing userId', () => {
      expect(removeUserThemeMode(null)).toBe(false);
    });

    it('should handle localStorage errors', () => {
      mockLocalStorage.removeItem.mockImplementationOnce(() => {
        throw new Error('localStorage error');
      });
      
      expect(removeUserThemeMode('user123')).toBe(false);
    });
  });

  describe('getAllUserThemes', () => {
    it('should return all user theme modes', () => {
      mockLocalStorage.data = {
        'user_user123_theme_mode': 'light',
        'user_guest_abc_theme_mode': 'dark',
        'other_key': 'value',
        'user_user456_theme_mode': 'system'
      };
      
      const result = getAllUserThemes();
      expect(result).toEqual({
        'user123': 'light',
        'guest_abc': 'dark',
        'user456': 'system'
      });
    });

    it('should handle empty localStorage', () => {
      expect(getAllUserThemes()).toEqual({});
    });

    it('should ignore invalid theme values', () => {
      mockLocalStorage.data = {
        'user_user123_theme_mode': 'invalid',
        'user_user456_theme_mode': 'light'
      };
      
      const result = getAllUserThemes();
      expect(result).toEqual({
        'user456': 'light'
      });
    });
  });

  describe('getThemeStorageUsage', () => {
    it('should calculate storage usage correctly', () => {
      mockLocalStorage.data = {
        'user_user123_theme_mode': 'light',
        'user_guest_abc_theme_mode': 'dark'
      };
      
      const result = getThemeStorageUsage();
      expect(result.userCount).toBe(2);
      expect(result.estimatedBytes).toBeGreaterThan(0);
      expect(result.themes).toEqual({
        'user123': 'light',
        'guest_abc': 'dark'
      });
    });
  });

  describe('cleanupOrphanedThemeData', () => {
    it('should remove orphaned theme data', () => {
      mockLocalStorage.data = {
        'user_user123_theme_mode': 'light',
        'user_user456_theme_mode': 'dark',
        'user_guest_abc_theme_mode': 'system'
      };
      
      const activeUsers = ['user123']; // user456 and guest_abc are orphaned
      const cleanedCount = cleanupOrphanedThemeData(activeUsers);
      
      expect(cleanedCount).toBe(2);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user_user456_theme_mode');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user_guest_abc_theme_mode');
    });

    it('should handle empty active users list', () => {
      mockLocalStorage.data = {
        'user_user123_theme_mode': 'light'
      };
      
      const cleanedCount = cleanupOrphanedThemeData([]);
      expect(cleanedCount).toBe(1);
    });
  });

  describe('feature flag controls', () => {
    it('should detect when feature is enabled', () => {
      process.env.NEXT_PUBLIC_ENABLE_USER_THEME_ISOLATION = 'true';
      expect(isUserThemeIsolationEnabled()).toBe(true);
    });

    it('should detect when feature is disabled via environment', () => {
      process.env.NEXT_PUBLIC_ENABLE_USER_THEME_ISOLATION = 'false';
      expect(isUserThemeIsolationEnabled()).toBe(false);
    });

    it('should detect emergency disable flag', () => {
      process.env.NEXT_PUBLIC_ENABLE_USER_THEME_ISOLATION = 'true';
      mockLocalStorage.setItem('user_theme_isolation_disabled', 'true');
      expect(isUserThemeIsolationEnabled()).toBe(false);
    });

    it('should emergency disable correctly', () => {
      emergencyDisableUserThemeIsolation();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user_theme_isolation_disabled', 'true');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme_emergency_disable_reason', 'manual_emergency_disable');
    });

    it('should re-enable correctly', () => {
      enableUserThemeIsolation();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user_theme_isolation_disabled');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('theme_emergency_disable_reason');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete user workflow', () => {
      const user1 = { id: 'user123', isGuest: false };
      const user2 = { id: 'guest_abc', isGuest: true };
      
      // Set themes for different users
      expect(setUserThemeMode('user123', 'light')).toBe(true);
      expect(setUserThemeMode('guest_abc', 'dark')).toBe(true);
      
      // Verify isolation
      expect(getUserThemeMode('user123', user1)).toBe('light');
      expect(getUserThemeMode('guest_abc', user2)).toBe('dark');
      
      // Verify storage
      const allThemes = getAllUserThemes();
      expect(allThemes).toEqual({
        'user123': 'light',
        'guest_abc': 'dark'
      });
    });

    it('should handle user switching scenario', () => {
      // Setup: User1 has light theme, User2 has dark theme
      setUserThemeMode('user1', 'light');
      setUserThemeMode('user2', 'dark');
      
      // Simulate user switching
      const user1Theme = getUserThemeMode('user1', { id: 'user1' });
      const user2Theme = getUserThemeMode('user2', { id: 'user2' });
      
      expect(user1Theme).toBe('light');
      expect(user2Theme).toBe('dark');
    });

    it('should handle guest user defaults correctly', () => {
      const guestUser = { id: 'guest_123', isGuest: true };
      
      // New guest should get dark mode default
      const theme = getUserThemeMode('guest_123', guestUser);
      expect(theme).toBe('dark');
      
      // Should store the default
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user_guest_123_theme_mode', 'dark');
    });
  });
});