/**
 * Server-side Guest Session Management
 * 
 * Server-only functions for guest session management that require Next.js server APIs
 */

import { createSessionToken, verifySessionToken } from './session.js';

/**
 * Server-side guest session management
 */
export const serverGuestSession = {
  /**
   * Create a guest session token for server communication
   */
  createToken(guestUser) {
    // Create a special guest token that doesn't require email
    const guestTokenUser = {
      ...guestUser,
      email: `${guestUser.id}@guest.local` // Fake email for JWT compatibility
    };
    
    return createSessionToken(guestTokenUser);
  },

  /**
   * Verify if a token is for a guest user
   */
  isGuestToken(token) {
    try {
      const session = verifySessionToken(token);
      if (!session.valid) return false;
      
      return session.user.email && session.user.email.endsWith('@guest.local');
    } catch {
      return false;
    }
  },

  /**
   * Extract guest user from token
   */
  getGuestFromToken(token) {
    try {
      const session = verifySessionToken(token);
      if (!session.valid || !this.isGuestToken(token)) return null;
      
      return {
        ...session.user,
        email: null, // Remove fake email
        isGuest: true
      };
    } catch {
      return null;
    }
  }
};