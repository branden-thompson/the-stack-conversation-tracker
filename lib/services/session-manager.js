/**
 * Shared Session Manager
 * Singleton service for managing sessions across API routes
 */

import { SESSION_STATUS } from '@/lib/utils/session-constants';

class SessionManager {
  constructor() {
    // Use a global variable to ensure singleton across API routes
    if (!global.sessionStore) {
      global.sessionStore = new Map();
      global.eventStore = new Map();
      global.simulatedSessions = new Map();
      
      // Start cleanup interval
      this.startCleanup();
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
  
  startCleanup() {
    // Only start if not already running
    if (global.cleanupInterval) return;
    
    global.cleanupInterval = setInterval(() => {
      const now = Date.now();
      const INACTIVE_TIMEOUT = 30 * 60 * 1000; // 30 minutes for inactive
      const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours for ended
      
      for (const [id, session] of this.sessionStore.entries()) {
        const age = now - session.lastActivityAt;
        
        // Mark inactive sessions as ended after 30 minutes
        if (session.status === SESSION_STATUS.ACTIVE && age > INACTIVE_TIMEOUT) {
          console.log('[SessionManager] Ending inactive session:', id);
          session.status = SESSION_STATUS.ENDED;
          session.endedAt = now;
        }
        
        // Delete ended sessions after 24 hours
        if (session.status === SESSION_STATUS.ENDED && age > SESSION_TIMEOUT) {
          console.log('[SessionManager] Deleting old session:', id);
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
    }, 5 * 60 * 1000); // Cleanup every 5 minutes
  }
}

// Export singleton instance
const sessionManager = new SessionManager();
export default sessionManager;