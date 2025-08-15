/**
 * Session Management
 * 
 * Handles user sessions, authentication tokens, and session storage.
 * Uses JWT tokens for stateless authentication with session validation.
 */

import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Session configuration
const SESSION_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
  EXPIRES_IN: '7d',
  COOKIE_NAME: 'conversation_tracker_session',
  REFRESH_THRESHOLD: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

/**
 * Create a JWT session token
 */
export function createSessionToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    isSystemUser: user.isSystemUser || false,
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, SESSION_CONFIG.SECRET, {
    expiresIn: SESSION_CONFIG.EXPIRES_IN,
    issuer: 'conversation-tracker',
    audience: 'conversation-tracker-users'
  });
}

/**
 * Verify and decode a session token
 */
export function verifySessionToken(token) {
  try {
    const decoded = jwt.verify(token, SESSION_CONFIG.SECRET, {
      issuer: 'conversation-tracker',
      audience: 'conversation-tracker-users'
    });
    
    return {
      valid: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        name: decoded.name,
        isSystemUser: decoded.isSystemUser
      },
      issuedAt: decoded.iat * 1000,
      expiresAt: decoded.exp * 1000
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

/**
 * Set session cookie (server-side)
 */
export function setSessionCookie(token) {
  const cookieStore = cookies();
  
  cookieStore.set(SESSION_CONFIG.COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    path: '/'
  });
}

/**
 * Clear session cookie (server-side)
 */
export function clearSessionCookie() {
  const cookieStore = cookies();
  
  cookieStore.delete(SESSION_CONFIG.COOKIE_NAME);
}

/**
 * Get current session from cookie (server-side)
 */
export function getSessionFromCookie() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_CONFIG.COOKIE_NAME)?.value;
    
    if (!token) {
      return { valid: false, error: 'No session token found' };
    }
    
    return verifySessionToken(token);
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/**
 * Check if session needs refresh
 */
export function shouldRefreshSession(session) {
  if (!session.valid) return false;
  
  const now = Date.now();
  const timeSinceIssued = now - session.issuedAt;
  
  return timeSinceIssued > SESSION_CONFIG.REFRESH_THRESHOLD;
}

/**
 * Client-side session management
 */
export const clientSession = {
  /**
   * Set session token in client storage
   */
  setToken(token) {
    if (typeof window === 'undefined') return;
    
    // Store in memory for immediate use
    window.__session_token = token;
    
    // Optional: Store in sessionStorage for tab persistence
    sessionStorage.setItem('session_token', token);
  },

  /**
   * Get session token from client storage
   */
  getToken() {
    if (typeof window === 'undefined') return null;
    
    // Try memory first, then sessionStorage
    return window.__session_token || sessionStorage.getItem('session_token');
  },

  /**
   * Clear client session
   */
  clear() {
    if (typeof window === 'undefined') return;
    
    delete window.__session_token;
    sessionStorage.removeItem('session_token');
  },

  /**
   * Get current user from token
   */
  getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;
    
    const session = verifySessionToken(token);
    return session.valid ? session.user : null;
  }
};

/**
 * Session validation middleware helper
 */
export function createSessionValidator(requiredRole = null, requiredPermissions = []) {
  return async (request) => {
    const session = getSessionFromCookie();
    
    if (!session.valid) {
      return {
        valid: false,
        error: 'Invalid or expired session',
        redirectTo: '/auth/login'
      };
    }

    // Check role requirement
    if (requiredRole && session.user.role !== requiredRole) {
      return {
        valid: false,
        error: 'Insufficient role permissions',
        redirectTo: '/unauthorized'
      };
    }

    // Check specific permissions
    if (requiredPermissions.length > 0) {
      // This would integrate with the permissions system
      // For now, just allow all authenticated users
    }

    return {
      valid: true,
      user: session.user
    };
  };
}