/**
 * Shared Session Manager
 * Singleton service for managing sessions across API routes
 */

import { SESSION_STATUS } from '@/lib/utils/session-constants';

class SessionManager {
  constructor() {
    // Use a global variable to ensure singleton across API routes
    if (!global.sessionStore) {
      console.log('[SessionManager] Initializing new global stores');
      global.sessionStore = new Map();
      global.eventStore = new Map();
      global.simulatedSessions = new Map();
      global.browserSessions = new Map(); // Track browser tab sessions
      
      // Start cleanup interval
      this.startCleanup();
    } else {
      console.log('[SessionManager] Using existing global stores, sessionStore size:', global.sessionStore.size);
    }
  }
  
  get sessionStore() {
    return global.sessionStore;
  }
  
  get eventStore() {
    return global.eventStore;
  }
  
  get simulatedSessions() {
    return global.simulatedSessions;
  }
  
  get browserSessions() {
    return global.browserSessions;
  }
  
  startCleanup() {
    // Only start if not already running
    if (global.cleanupInterval) return;
    
    global.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const INACTIVE_TIMEOUT = 30 * 60 * 1000; // 30 minutes for inactive
      const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours for ended
      
      for (const [id, session] of this.sessionStore.entries()) {
        // Use proper timestamp based on session status
        const referenceTime = session.status === SESSION_STATUS.ENDED 
          ? (session.endedAt || session.lastActivityAt)
          : session.lastActivityAt;
        
        const age = now - referenceTime;
        
        // Mark inactive sessions as ended after 30 minutes
        if (session.status === SESSION_STATUS.ACTIVE && age > INACTIVE_TIMEOUT) {
          console.log('[SessionManager] Ending inactive session:', id, 'age:', Math.round(age/1000/60), 'minutes');
          session.status = SESSION_STATUS.ENDED;
          session.endedAt = now;
        }
        
        // Delete ended sessions after 24 hours
        if (session.status === SESSION_STATUS.ENDED && age > SESSION_TIMEOUT) {
          console.log('[SessionManager] Deleting old ended session:', id);
          this.sessionStore.delete(id);
          this.eventStore.delete(id);
        }
      }
      
      // Clean up old simulated sessions
      for (const [id, sim] of this.simulatedSessions.entries()) {
        const age = now - sim.session.lastActivityAt;
        if (sim.session.status === SESSION_STATUS.ENDED && age > SESSION_TIMEOUT) {
          console.log('[SessionManager] Deleting old simulated session:', id);
          this.simulatedSessions.delete(id);
          this.eventStore.delete(sim.session.id);
        }
      }
      
      // Clean up old browser sessions
      for (const [id, browserSession] of this.browserSessions.entries()) {
        const age = now - browserSession.lastActivityAt;
        // Clean up browser sessions that haven't been active for 1 hour
        if (age > 60 * 60 * 1000) {
          console.log('[SessionManager] Deleting old browser session:', id);
          this.browserSessions.delete(id);
        }
      }
    }, 5 * 60 * 1000); // Cleanup every 5 minutes
  }
}

// Export singleton instance
const sessionManager = new SessionManager();
export default sessionManager;