/**
 * Guest Session Management
 * 
 * Handles temporary guest user sessions for collaborative features without authentication.
 * Provides browser-based session persistence and automatic guest user creation.
 */

import { nanoid } from 'nanoid';
import { getGuestAvatarDataURL } from '../guest-avatars.js';

// Guest session configuration
const GUEST_CONFIG = {
  SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  COOKIE_NAME: 'conversation_tracker_guest',
  STORAGE_KEY: 'guest_session_data',
  USER_PREFIX: 'guest_',
  MAX_GUEST_SESSIONS: 50, // Limit concurrent guest sessions
};

/**
 * Generate a unique guest user ID
 */
function generateGuestId() {
  return `${GUEST_CONFIG.USER_PREFIX}${nanoid(8)}`;
}

/**
 * Generate a friendly guest name
 */
function generateGuestName(existingUsers = []) {
  const adjectives = [
    // Original 12
    'Anonymous', 'Curious', 'Helpful', 'Creative', 'Thoughtful', 'Friendly',
    'Collaborative', 'Insightful', 'Quick', 'Smart', 'Active', 'Engaged',
    // New additions (28 more = 40 total)
    'Brave', 'Clever', 'Wise', 'Bold', 'Calm', 'Cheerful',
    'Daring', 'Eager', 'Gentle', 'Happy', 'Jolly', 'Kind',
    'Lively', 'Merry', 'Noble', 'Peaceful', 'Quiet', 'Radiant',
    'Serene', 'Vibrant', 'Witty', 'Zealous', 'Brilliant', 'Dynamic',
    'Energetic', 'Graceful', 'Inventive', 'Mindful', 'Playful', 'Spirited',
    'Unique', 'Vivid', 'Wonderful', 'Adventurous', 'Fearless', 'Inspired',
    'Joyful', 'Luminous', 'Mystical', 'Optimistic'
  ];
  
  const animals = [
    // Original 16
    'Fox', 'Bear', 'Wolf', 'Eagle', 'Lion', 'Tiger', 'Panda', 'Dolphin',
    'Owl', 'Hawk', 'Rabbit', 'Deer', 'Otter', 'Penguin', 'Koala', 'Falcon',
    // New additions (34 more = 50 total)
    'Dragon', 'Phoenix', 'Unicorn', 'Griffin', 'Lynx', 'Cheetah',
    'Jaguar', 'Panther', 'Raven', 'Crow', 'Sparrow', 'Robin',
    'Turtle', 'Tortoise', 'Hedgehog', 'Badger', 'Raccoon', 'Squirrel',
    'Beaver', 'Moose', 'Elk', 'Bison', 'Gazelle', 'Antelope',
    'Lemur', 'Monkey', 'Gorilla', 'Seal', 'Walrus', 'Whale',
    'Shark', 'Octopus', 'Jellyfish', 'Starfish', 'Crab', 'Lobster',
    'Butterfly', 'Dragonfly', 'Firefly', 'Bee', 'Hummingbird', 'Peacock',
    'Flamingo', 'Parrot', 'Toucan', 'Platypus', 'Kangaroo', 'Wombat',
    'Sloth', 'Armadillo'
  ];
  
  // Try to generate a unique name
  let attempts = 0;
  let name;
  
  do {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    name = `${adjective} ${animal}`;
    attempts++;
  } while (
    attempts < 10 && 
    existingUsers.some(user => user.name === name)
  );
  
  // If we couldn't find a unique name, add a number
  if (existingUsers.some(user => user.name === name)) {
    const number = Math.floor(Math.random() * 9999) + 1;
    name = `${name} ${number}`;
  }
  
  return name;
}

/**
 * Create a guest user object with enhanced preferences support
 */
export function createGuestUser(existingUsers = [], customName = null, initialPreferences = {}) {
  const guestId = generateGuestId();
  const guestName = customName || generateGuestName(existingUsers);
  const browserFingerprint = typeof window !== 'undefined' ? 
    guestCoordination.createFingerprint() : `server_${Date.now()}`;
  
  // Generate avatar for the guest
  let avatarDataUrl = null;
  try {
    avatarDataUrl = getGuestAvatarDataURL(guestId);
    // Generated avatar for guest
  } catch (error) {
    console.error('Error generating avatar for guest:', guestId, error);
  }
  
  return {
    id: guestId,
    name: guestName,
    email: null, // Guests don't have emails
    isSystemUser: false,
    isGuest: true,
    profilePicture: avatarDataUrl,
    preferences: {
      theme: 'system', // Default theme
      browserFingerprint,
      sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      language: 'en',
      notifications: true,
      ...initialPreferences
    },
    role: 'guest',
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    sessionExpires: Date.now() + GUEST_CONFIG.SESSION_DURATION,
    lastThemeChange: Date.now()
  };
}

/**
 * Guest session storage for client-side persistence
 */
export const guestSession = {
  /**
   * Store guest session data in browser
   */
  store(guestUser) {
    if (typeof window === 'undefined') return;
    
    const sessionData = {
      user: guestUser,
      createdAt: Date.now(),
      expiresAt: guestUser.sessionExpires
    };
    
    try {
      localStorage.setItem(GUEST_CONFIG.STORAGE_KEY, JSON.stringify(sessionData));
      
      // Also store minimal data in sessionStorage for tab-specific access
      sessionStorage.setItem('guest_user_id', guestUser.id);
      sessionStorage.setItem('guest_user_name', guestUser.name);
    } catch (error) {
      console.warn('Failed to store guest session:', error);
    }
  },

  /**
   * Retrieve guest session data from browser
   */
  retrieve() {
    if (typeof window === 'undefined') return null;
    
    try {
      const sessionData = localStorage.getItem(GUEST_CONFIG.STORAGE_KEY);
      if (!sessionData) return null;
      
      const parsed = JSON.parse(sessionData);
      
      // Check if session has expired
      if (Date.now() > parsed.expiresAt) {
        this.clear();
        return null;
      }
      
      return parsed;
    } catch (error) {
      console.warn('Failed to retrieve guest session:', error);
      this.clear(); // Clear corrupted data
      return null;
    }
  },

  /**
   * Clear guest session data
   */
  clear() {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(GUEST_CONFIG.STORAGE_KEY);
    sessionStorage.removeItem('guest_user_id');
    sessionStorage.removeItem('guest_user_name');
  },

  /**
   * Update guest user data
   */
  update(updates) {
    const current = this.retrieve();
    if (!current) return null;
    
    const updatedUser = {
      ...current.user,
      ...updates,
      updatedAt: Date.now()
    };
    
    this.store(updatedUser);
    return updatedUser;
  },

  /**
   * Check if current session is valid
   */
  isValid() {
    const session = this.retrieve();
    return session && Date.now() < session.expiresAt;
  },

  /**
   * Get current guest user
   */
  getCurrentUser() {
    const session = this.retrieve();
    return session?.user || null;
  },

  /**
   * Extend session expiration
   */
  extend() {
    const current = this.retrieve();
    if (!current) return false;
    
    const updatedUser = {
      ...current.user,
      sessionExpires: Date.now() + GUEST_CONFIG.SESSION_DURATION,
      updatedAt: Date.now()
    };
    
    this.store(updatedUser);
    return true;
  },

  /**
   * Update guest preferences
   */
  updatePreferences(preferences) {
    const current = this.retrieve();
    if (!current) return null;
    
    const updatedUser = {
      ...current.user,
      preferences: {
        ...current.user.preferences,
        ...preferences
      },
      updatedAt: Date.now(),
      lastThemeChange: preferences.theme ? Date.now() : current.user.lastThemeChange
    };
    
    this.store(updatedUser);
    return updatedUser;
  },

  /**
   * Get guest preferences
   */
  getPreferences() {
    const current = this.retrieve();
    return current?.user?.preferences || {};
  }
};

// Server-side functions will be imported only on the server
// This placeholder prevents client-side imports from breaking
export const serverGuestSession = {
  createToken: null,
  isGuestToken: null,
  getGuestFromToken: null
};

/**
 * Guest user cleanup utilities
 */
export const guestCleanup = {
  /**
   * Check if a user should be considered expired
   */
  isExpired(user) {
    if (!user.isGuest || !user.sessionExpires) return false;
    return Date.now() > user.sessionExpires;
  },

  /**
   * Clean expired guest users from a user list
   */
  removeExpired(users) {
    return users.filter(user => !this.isExpired(user));
  },

  /**
   * Get active guest users
   */
  getActiveGuests(users) {
    return users.filter(user => 
      user.isGuest && 
      user.isActive && 
      !this.isExpired(user)
    );
  }
};

/**
 * Multi-user guest session coordination
 */
export const guestCoordination = {
  /**
   * Generate a session identifier for tracking multiple guest sessions
   */
  generateSessionId() {
    return `session_${nanoid(12)}_${Date.now()}`;
  },

  /**
   * Create session fingerprint for identifying unique browsers/tabs
   */
  createFingerprint() {
    if (typeof window === 'undefined') return nanoid(16);
    
    // Create a simple fingerprint based on available browser info
    const fingerprint = [
      navigator.userAgent.slice(0, 50),
      navigator.language,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
      nanoid(8) // Random component for uniqueness
    ].join('|');
    
    return btoa(fingerprint).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
  },

  /**
   * Store session coordination data
   */
  storeSessionInfo(sessionId, fingerprint) {
    if (typeof window === 'undefined') return;
    
    const sessionInfo = {
      sessionId,
      fingerprint,
      createdAt: Date.now(),
      lastActive: Date.now()
    };
    
    sessionStorage.setItem('guest_session_info', JSON.stringify(sessionInfo));
  },

  /**
   * Get session coordination data
   */
  getSessionInfo() {
    if (typeof window === 'undefined') return null;
    
    try {
      const info = sessionStorage.getItem('guest_session_info');
      return info ? JSON.parse(info) : null;
    } catch {
      return null;
    }
  },

  /**
   * Update last active timestamp
   */
  updateLastActive() {
    const info = this.getSessionInfo();
    if (info) {
      info.lastActive = Date.now();
      sessionStorage.setItem('guest_session_info', JSON.stringify(info));
    }
  }
};

/**
 * Session-specific guest provisioning system
 * Ensures each browser session gets exactly one guest user that persists across user switches
 */
export const sessionGuestProvisioning = {
  PROVISIONED_GUEST_KEY: 'provisioned_session_guest',

  /**
   * Check if current provisioned guest has an active session
   */
  async checkProvisionedGuestSession() {
    const guest = this.getProvisionedGuest();
    if (!guest) return false;

    try {
      // Check if the guest has an active session in the API
      const response = await fetch('/api/sessions');
      const data = await response.json();
      
      const hasActiveSession = data.guests?.some(session => 
        session.userId === guest.id && session.status === 'active'
      );
      
      if (!hasActiveSession) {
        // Guest has no active session, clearing
        this.clearProvisionedGuest();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('[SessionGuestProvisioning] Error checking guest session:', error);
      return true; // Assume valid if check fails
    }
  },

  /**
   * Get or create a provisioned guest for this browser session
   */
  async getOrCreateProvisionedGuest(existingUsers = []) {
    if (typeof window === 'undefined') return null;

    try {
      // Check if we already have a provisioned guest for this session
      const existingGuest = sessionStorage.getItem(this.PROVISIONED_GUEST_KEY);
      if (existingGuest) {
        const guest = JSON.parse(existingGuest);
        
        // Retrieved guest from storage
        
        // First check if guest is expired
        if (guest.sessionExpires <= Date.now()) {
          // Guest expired, clearing
          this.clearProvisionedGuest();
        } else {
          // Check if guest has an active session
          const hasActiveSession = await this.checkProvisionedGuestSession();
          if (!hasActiveSession) {
            // Guest was cleared by checkProvisionedGuestSession, fall through to create new one
          } else {
            // Guest is valid and has active session
            // If the guest doesn't have an avatar (from old session), generate one
            if (!guest.profilePicture) {
              try {
                guest.profilePicture = getGuestAvatarDataURL(guest.id);
                // Generated missing avatar for existing guest
                // Update storage with the avatar
                sessionStorage.setItem(this.PROVISIONED_GUEST_KEY, JSON.stringify(guest));
              } catch (error) {
                console.error('Error generating avatar for existing guest:', error);
              }
            }
            return guest;
          }
        }
      }

      // Create a new provisioned guest for this session
      console.log('[SessionGuestProvisioning] Creating new provisioned guest...');
      
      const sessionId = guestCoordination.generateSessionId();
      const fingerprint = guestCoordination.createFingerprint();
      
      const provisionedGuest = createGuestUser(existingUsers, null, {
        isSessionProvisioned: true,
        sessionId,
        fingerprint,
        provisionedAt: Date.now()
      });

      console.log('[SessionGuestProvisioning] Created new guest:', {
        name: provisionedGuest.name,
        id: provisionedGuest.id,
        expires: new Date(provisionedGuest.sessionExpires).toLocaleTimeString()
      });
      if (provisionedGuest.profilePicture) {
        console.log('Avatar data URL preview:', provisionedGuest.profilePicture.substring(0, 100));
      }

      // Store in sessionStorage (cleared when browser/tab closes)
      sessionStorage.setItem(this.PROVISIONED_GUEST_KEY, JSON.stringify(provisionedGuest));
      
      // Also store coordination info
      guestCoordination.storeSessionInfo(sessionId, fingerprint);

      return provisionedGuest;
    } catch (error) {
      console.error('Error provisioning session guest:', error);
      return null;
    }
  },

  /**
   * Get the current provisioned guest (if any)
   */
  getProvisionedGuest() {
    if (typeof window === 'undefined') return null;

    try {
      const existingGuest = sessionStorage.getItem(this.PROVISIONED_GUEST_KEY);
      if (existingGuest) {
        const guest = JSON.parse(existingGuest);
        
        // Check if still valid
        if (guest.sessionExpires > Date.now()) {
          return guest;
        } else {
          this.clearProvisionedGuest();
        }
      }
    } catch (error) {
      console.error('Error getting provisioned guest:', error);
    }

    return null;
  },

  /**
   * Update the provisioned guest data
   */
  updateProvisionedGuest(updates) {
    if (typeof window === 'undefined') return null;

    try {
      const current = this.getProvisionedGuest();
      if (!current) return null;

      const updated = {
        ...current,
        ...updates,
        updatedAt: Date.now()
      };

      sessionStorage.setItem(this.PROVISIONED_GUEST_KEY, JSON.stringify(updated));
      return updated;
    } catch (error) {
      console.error('Error updating provisioned guest:', error);
      return null;
    }
  },

  /**
   * Clear the provisioned guest (typically on session end)
   */
  clearProvisionedGuest() {
    if (typeof window === 'undefined') return;
    
    sessionStorage.removeItem(this.PROVISIONED_GUEST_KEY);
  },

  /**
   * Check if we have a provisioned guest for this session
   */
  hasProvisionedGuest() {
    return this.getProvisionedGuest() !== null;
  },

  /**
   * Extend the provisioned guest session
   */
  extendProvisionedGuestSession() {
    const guest = this.getProvisionedGuest();
    if (guest) {
      return this.updateProvisionedGuest({
        sessionExpires: Date.now() + GUEST_CONFIG.SESSION_DURATION
      });
    }
    return null;
  }
};

export default {
  createGuestUser,
  guestSession,
  serverGuestSession,
  guestCleanup,
  guestCoordination,
  sessionGuestProvisioning,
  GUEST_CONFIG
};