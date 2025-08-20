/**
 * Emergency Controller Service
 * 
 * CLASSIFICATION: APPLICATION LEVEL | SEV-0 | CRITICAL SAFETY INFRASTRUCTURE
 * Emergency control system for SSE operations with instant failover
 * 
 * Features:
 * - Environment variable kill switches
 * - Automatic fallback activation
 * - System health monitoring
 * - Emergency state management
 * - Recovery procedures
 */

/**
 * Emergency Control Flags
 * Environment variables for instant system control
 */
const EMERGENCY_FLAGS = {
  SSE_SYSTEM_ENABLED: process.env.DISABLE_SSE_SYSTEM !== 'true',
  SSE_CONNECTIONS_ENABLED: process.env.DISABLE_SSE_CONNECTIONS !== 'true',
  SSE_BROADCASTING_ENABLED: process.env.DISABLE_SSE_BROADCASTING !== 'true',
  SSE_FALLBACK_ENABLED: process.env.DISABLE_SSE_FALLBACK !== 'true',
  EMERGENCY_MODE: process.env.SSE_EMERGENCY_MODE === 'true'
};

/**
 * Emergency States
 */
const EMERGENCY_STATES = {
  NORMAL: 'normal',
  DEGRADED: 'degraded',
  CRITICAL: 'critical',
  EMERGENCY: 'emergency',
  DISABLED: 'disabled'
};

/**
 * Emergency Controller Class
 * Manages system-wide emergency controls and failover procedures
 */
class EmergencyControllerService {
  constructor() {
    this.state = EMERGENCY_STATES.NORMAL;
    this.lastStateChange = Date.now();
    this.emergencyReasons = [];
    this.automaticRecoveryEnabled = true;
    this.recoveryAttempts = 0;
    this.maxRecoveryAttempts = 3;
    this.recoveryDelay = 60000; // 1 minute
    
    // Initialize emergency monitoring
    this.initializeEmergencyMonitoring();
  }

  /**
   * Check if SSE system is enabled
   */
  isSSEEnabled() {
    // Environment variable override
    if (!EMERGENCY_FLAGS.SSE_SYSTEM_ENABLED) {
      return false;
    }
    
    // Emergency mode override
    if (EMERGENCY_FLAGS.EMERGENCY_MODE) {
      return false;
    }
    
    // State-based control
    return this.state !== EMERGENCY_STATES.DISABLED && 
           this.state !== EMERGENCY_STATES.EMERGENCY;
  }

  /**
   * Check if SSE connections are allowed
   */
  areConnectionsEnabled() {
    return this.isSSEEnabled() && 
           EMERGENCY_FLAGS.SSE_CONNECTIONS_ENABLED &&
           this.state !== EMERGENCY_STATES.CRITICAL;
  }

  /**
   * Check if SSE broadcasting is enabled
   */
  isBroadcastingEnabled() {
    return this.isSSEEnabled() && 
           EMERGENCY_FLAGS.SSE_BROADCASTING_ENABLED;
  }

  /**
   * Check if fallback systems are enabled
   */
  isFallbackEnabled() {
    return EMERGENCY_FLAGS.SSE_FALLBACK_ENABLED;
  }

  /**
   * Trigger emergency shutdown
   */
  triggerEmergencyShutdown(reason, severity = 'high') {
    const previousState = this.state;
    
    console.error(`🚨 EMERGENCY SHUTDOWN TRIGGERED: ${reason}`);
    
    this.state = severity === 'critical' ? 
      EMERGENCY_STATES.EMERGENCY : 
      EMERGENCY_STATES.CRITICAL;
    
    this.lastStateChange = Date.now();
    this.emergencyReasons.push({
      reason,
      severity,
      timestamp: Date.now(),
      previousState
    });
    
    // Activate fallback systems
    this.activateFallbackSystems(reason);
    
    // Report emergency
    this.reportEmergency(reason, severity);
    
    // Start recovery timer if automatic recovery enabled
    if (this.automaticRecoveryEnabled && severity !== 'critical') {
      this.scheduleRecoveryAttempt();
    }
  }

  /**
   * Activate fallback systems
   */
  activateFallbackSystems(reason) {
    if (!this.isFallbackEnabled()) {
      console.error('⚠️ Fallback systems disabled - system may be unstable');
      return;
    }
    
    console.log(`🔄 Activating fallback systems due to: ${reason}`);
    
    try {
      // Notify React Query to resume polling
      if (typeof window !== 'undefined' && window.queryClient) {
        this.activateReactQueryFallback();
      }
      
      // Activate local storage fallback for UI state
      this.activateLocalStorageFallback();
      
      // Log fallback activation
      console.log('✅ Fallback systems activated successfully');
      
    } catch (error) {
      console.error('❌ Failed to activate fallback systems:', error);
      this.reportEmergency('fallback-activation-failed', 'critical');
    }
  }

  /**
   * Activate React Query polling fallback
   */
  activateReactQueryFallback() {
    const queryClient = window.queryClient;
    if (!queryClient) return;
    
    // Enable aggressive polling for critical data
    queryClient.setQueryDefaults(['cards'], {
      refetchInterval: 3000, // 3 second polling for cards
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true
    });
    
    queryClient.setQueryDefaults(['users'], {
      refetchInterval: 10000, // 10 second polling for users
      refetchOnWindowFocus: true,
      refetchOnMount: true
    });
    
    queryClient.setQueryDefaults(['sessions'], {
      refetchInterval: 15000, // 15 second polling for sessions
      refetchOnWindowFocus: true
    });
    
    console.log('React Query fallback polling activated');
  }

  /**
   * Activate local storage fallback for UI state
   */
  activateLocalStorageFallback() {
    if (typeof window === 'undefined') return;
    
    // Set fallback mode flag
    localStorage.setItem('sse-fallback-mode', 'true');
    localStorage.setItem('sse-fallback-timestamp', Date.now().toString());
    
    // Dispatch custom event to notify components
    window.dispatchEvent(new CustomEvent('sse-fallback-activated', {
      detail: { 
        reason: 'emergency-control',
        timestamp: Date.now()
      }
    }));
    
    console.log('Local storage fallback activated');
  }

  /**
   * Attempt system recovery
   */
  async attemptRecovery() {
    if (this.recoveryAttempts >= this.maxRecoveryAttempts) {
      console.error('🚫 Maximum recovery attempts exceeded');
      return false;
    }
    
    this.recoveryAttempts++;
    console.log(`🔄 Recovery attempt ${this.recoveryAttempts}/${this.maxRecoveryAttempts}`);
    
    try {
      // Test system health
      const healthCheck = await this.performHealthCheck();
      
      if (healthCheck.canRecover) {
        this.recoverFromEmergency();
        return true;
      } else {
        console.warn(`❌ Recovery attempt ${this.recoveryAttempts} failed:`, healthCheck.issues);
        
        if (this.recoveryAttempts < this.maxRecoveryAttempts) {
          this.scheduleRecoveryAttempt();
        }
        return false;
      }
      
    } catch (error) {
      console.error(`❌ Recovery attempt ${this.recoveryAttempts} error:`, error);
      return false;
    }
  }

  /**
   * Perform health check for recovery
   */
  async performHealthCheck() {
    const issues = [];
    
    // Check environment flags
    if (!EMERGENCY_FLAGS.SSE_SYSTEM_ENABLED) {
      issues.push('SSE system disabled via environment variable');
    }
    
    if (EMERGENCY_FLAGS.EMERGENCY_MODE) {
      issues.push('Emergency mode enabled via environment variable');
    }
    
    // Check system resources
    if (typeof window !== 'undefined') {
      try {
        // Test EventSource availability
        if (!window.EventSource) {
          issues.push('EventSource not available');
        }
        
        // Test network connectivity
        const networkTest = await fetch('/api/health', { 
          method: 'HEAD',
          timeout: 5000 
        }).catch(() => null);
        
        if (!networkTest || !networkTest.ok) {
          issues.push('Network connectivity issues');
        }
        
      } catch (error) {
        issues.push(`Browser compatibility issues: ${error.message}`);
      }
    }
    
    return {
      canRecover: issues.length === 0,
      issues,
      timestamp: Date.now()
    };
  }

  /**
   * Recover from emergency state
   */
  recoverFromEmergency() {
    const previousState = this.state;
    
    console.log(`🔄 Recovering from emergency state: ${previousState}`);
    
    this.state = EMERGENCY_STATES.NORMAL;
    this.lastStateChange = Date.now();
    this.recoveryAttempts = 0;
    
    // Clear fallback mode
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sse-fallback-mode');
      localStorage.removeItem('sse-fallback-timestamp');
      
      // Notify components of recovery
      window.dispatchEvent(new CustomEvent('sse-recovery-complete', {
        detail: { 
          previousState,
          timestamp: Date.now()
        }
      }));
    }
    
    console.log('✅ Emergency recovery complete');
    
    // Log recovery
    this.emergencyReasons.push({
      reason: 'automatic-recovery',
      severity: 'recovery',
      timestamp: Date.now(),
      previousState
    });
  }

  /**
   * Schedule automatic recovery attempt
   */
  scheduleRecoveryAttempt() {
    if (!this.automaticRecoveryEnabled) return;
    
    const delay = this.recoveryDelay * Math.pow(2, this.recoveryAttempts - 1); // Exponential backoff
    
    console.log(`⏱️ Scheduling recovery attempt in ${delay / 1000} seconds`);
    
    setTimeout(() => {
      this.attemptRecovery();
    }, delay);
  }

  /**
   * Manually disable SSE system
   */
  manualDisable(reason) {
    console.warn(`🔧 Manual SSE disable: ${reason}`);
    
    this.state = EMERGENCY_STATES.DISABLED;
    this.lastStateChange = Date.now();
    this.emergencyReasons.push({
      reason: `manual-disable: ${reason}`,
      severity: 'manual',
      timestamp: Date.now(),
      previousState: this.state
    });
    
    this.activateFallbackSystems(reason);
  }

  /**
   * Manually enable SSE system
   */
  manualEnable(reason) {
    console.log(`🔧 Manual SSE enable: ${reason}`);
    
    this.state = EMERGENCY_STATES.NORMAL;
    this.lastStateChange = Date.now();
    this.recoveryAttempts = 0;
    
    // Clear fallback mode
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sse-fallback-mode');
      localStorage.removeItem('sse-fallback-timestamp');
    }
    
    this.emergencyReasons.push({
      reason: `manual-enable: ${reason}`,
      severity: 'recovery',
      timestamp: Date.now(),
      previousState: this.state
    });
  }

  /**
   * Get current emergency status
   */
  getEmergencyStatus() {
    return {
      state: this.state,
      isSSEEnabled: this.isSSEEnabled(),
      areConnectionsEnabled: this.areConnectionsEnabled(),
      isBroadcastingEnabled: this.isBroadcastingEnabled(),
      isFallbackEnabled: this.isFallbackEnabled(),
      lastStateChange: this.lastStateChange,
      emergencyReasons: this.emergencyReasons.slice(-10), // Last 10 events
      recoveryAttempts: this.recoveryAttempts,
      automaticRecoveryEnabled: this.automaticRecoveryEnabled,
      environmentFlags: EMERGENCY_FLAGS
    };
  }

  /**
   * Report emergency to monitoring systems
   */
  reportEmergency(reason, severity) {
    const report = {
      type: 'sse-emergency',
      reason,
      severity,
      state: this.state,
      timestamp: Date.now(),
      userAgent: typeof window !== 'undefined' ? window.navigator?.userAgent : 'server',
      emergencyFlags: EMERGENCY_FLAGS
    };
    
    // Log to console
    console.error('🚨 Emergency Report:', report);
    
    // Send to monitoring endpoint if available
    if (typeof window !== 'undefined') {
      fetch('/api/monitoring/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      }).catch(error => {
        console.warn('Failed to send emergency report:', error);
      });
    }
  }

  /**
   * Initialize emergency monitoring
   */
  initializeEmergencyMonitoring() {
    // Monitor environment variable changes (if possible)
    setInterval(() => {
      this.checkEnvironmentChanges();
    }, 10000); // Check every 10 seconds
    
    // Monitor browser events
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.reportEmergency('page-unload', 'info');
      });
      
      window.addEventListener('error', (error) => {
        this.reportEmergency(`javascript-error: ${error.message}`, 'medium');
      });
    }
  }

  /**
   * Check for environment variable changes
   */
  checkEnvironmentChanges() {
    const currentFlags = {
      SSE_SYSTEM_ENABLED: process.env.DISABLE_SSE_SYSTEM !== 'true',
      SSE_CONNECTIONS_ENABLED: process.env.DISABLE_SSE_CONNECTIONS !== 'true',
      SSE_BROADCASTING_ENABLED: process.env.DISABLE_SSE_BROADCASTING !== 'true',
      SSE_FALLBACK_ENABLED: process.env.DISABLE_SSE_FALLBACK !== 'true',
      EMERGENCY_MODE: process.env.SSE_EMERGENCY_MODE === 'true'
    };
    
    // Check for changes
    let hasChanges = false;
    for (const [key, value] of Object.entries(currentFlags)) {
      if (EMERGENCY_FLAGS[key] !== value) {
        console.log(`Environment flag changed: ${key} = ${value}`);
        EMERGENCY_FLAGS[key] = value;
        hasChanges = true;
      }
    }
    
    // Handle emergency mode activation
    if (currentFlags.EMERGENCY_MODE && !EMERGENCY_FLAGS.EMERGENCY_MODE) {
      this.triggerEmergencyShutdown('emergency-mode-activated', 'critical');
    }
    
    // Handle system disable
    if (!currentFlags.SSE_SYSTEM_ENABLED && EMERGENCY_FLAGS.SSE_SYSTEM_ENABLED) {
      this.manualDisable('environment-variable-disable');
    }
    
    // Handle system enable
    if (currentFlags.SSE_SYSTEM_ENABLED && !EMERGENCY_FLAGS.SSE_SYSTEM_ENABLED) {
      this.manualEnable('environment-variable-enable');
    }
  }
}

// Export singleton instance
export const EmergencyController = new EmergencyControllerService();