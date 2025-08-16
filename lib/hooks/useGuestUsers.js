/**
 * useGuestUsers Hook
 * 
 * Enhanced user management hook that supports both registered and guest users.
 * Provides automatic guest user creation, session management, and multi-user coordination.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useUsers } from './useUsers.js';
import { 
  createGuestUser, 
  guestSession, 
  guestCoordination,
  guestCleanup,
  sessionGuestProvisioning 
} from '@/lib/auth/guest-session.js';

/**
 * Enhanced hook for user management with guest support
 * @returns {Object} User state and operations including guest functionality
 */
export function useGuestUsers() {
  const baseUsers = useUsers(); // Use existing useUsers hook as foundation
  const [guestUsers, setGuestUsers] = useState([]);
  const [currentGuestUser, setCurrentGuestUser] = useState(null);
  const [provisionedGuest, setProvisionedGuest] = useState(null); // Session-specific guest
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [userCache, setUserCache] = useState(new Map()); // Cache for user data persistence
  const lastActiveRef = useRef(Date.now());

  /**
   * Update user cache to preserve profile pictures and data with ultra-robust handling
   */
  const updateUserCache = useCallback((users) => {
    setUserCache(prevCache => {
      const newCache = new Map(prevCache);
      users.forEach(user => {
        if (user?.id) {
          const existingData = newCache.get(user.id) || {};
          
          // Preserve existing data, only update if new data is available
          newCache.set(user.id, {
            profilePicture: user.profilePicture || existingData.profilePicture || null,
            name: user.name || existingData.name || 'Unknown User',
            email: user.email || existingData.email || null,
            isGuest: Boolean(user.isGuest || existingData.isGuest),
            preferences: user.preferences || existingData.preferences || {},
            lastSeen: Date.now(),
            originalId: user.id // Preserve original ID for debugging
          });
        }
      });
      
      // Clean up very old cache entries (older than 24 hours)
      const dayAgo = Date.now() - (24 * 60 * 60 * 1000);
      for (const [userId, userData] of newCache.entries()) {
        if (userData.lastSeen < dayAgo && !userData.isGuest) {
          newCache.delete(userId);
        }
      }
      
      return newCache;
    });
  }, []);

  // Update cache when users change
  useEffect(() => {
    if (baseUsers.users && baseUsers.users.length > 0) {
      updateUserCache(baseUsers.users);
    }
  }, [baseUsers.users, updateUserCache]);

  /**
   * Initialize session-specific guest provisioning on mount
   */
  useEffect(() => {
    const initializeSessionGuest = () => {
      // Always provision a guest for this session (even if user switches to registered users)
      const allUsers = [...baseUsers.users, ...guestUsers];
      const sessionGuest = sessionGuestProvisioning.getOrCreateProvisionedGuest(allUsers);
      
      if (sessionGuest) {
        setProvisionedGuest(sessionGuest);
        
        // If no current user or system user, default to the provisioned guest
        if (!baseUsers.currentUser || baseUsers.currentUser?.isSystemUser) {
          setCurrentGuestUser(sessionGuest);
          setIsGuestMode(true);
          
          // Set up session coordination
          const sessionInfo = guestCoordination.getSessionInfo();
          if (!sessionInfo) {
            guestCoordination.storeSessionInfo(
              sessionGuest.preferences?.sessionId, 
              sessionGuest.preferences?.fingerprint
            );
          }
          setSessionInfo(sessionInfo || {
            sessionId: sessionGuest.preferences?.sessionId,
            fingerprint: sessionGuest.preferences?.fingerprint,
            createdAt: Date.now(),
            lastActive: Date.now()
          });
        }
      }
    };

    // Initialize provisioned guest when users are loaded
    if (!baseUsers.loading && baseUsers.users.length >= 0) {
      initializeSessionGuest();
    }
  }, [baseUsers.loading, baseUsers.users.length, baseUsers.users]);

  /**
   * Create a new guest user automatically
   */
  const createNewGuestUser = useCallback(() => {
    const allUsers = [...baseUsers.users, ...guestUsers];
    const newGuest = createGuestUser(allUsers);
    
    // Store guest session
    guestSession.store(newGuest);
    setCurrentGuestUser(newGuest);
    setIsGuestMode(true);
    
    // Create session coordination info
    const fingerprint = guestCoordination.createFingerprint();
    const sessionId = guestCoordination.generateSessionId();
    guestCoordination.storeSessionInfo(sessionId, fingerprint);
    setSessionInfo({ sessionId, fingerprint, createdAt: Date.now(), lastActive: Date.now() });
    
    // Add to guest users list
    setGuestUsers(prev => [...prev, newGuest]);
    
    return newGuest;
  }, [baseUsers.users, guestUsers]);

  /**
   * Update guest user name
   */
  const updateGuestUserName = useCallback((newName) => {
    if (!currentGuestUser || !isGuestMode) return null;
    
    const updatedGuest = guestSession.update({ name: newName });
    if (updatedGuest) {
      setCurrentGuestUser(updatedGuest);
      setGuestUsers(prev => 
        prev.map(user => user.id === updatedGuest.id ? updatedGuest : user)
      );
    }
    
    return updatedGuest;
  }, [currentGuestUser, isGuestMode]);

  /**
   * Update guest user preferences (theme, etc.) for the provisioned guest
   */
  const updateGuestPreferences = useCallback((preferences) => {
    if (!isGuestMode || !provisionedGuest) return null;
    
    // Update the provisioned guest preferences
    const updatedGuest = sessionGuestProvisioning.updateProvisionedGuest({
      preferences: {
        ...provisionedGuest.preferences,
        ...preferences
      }
    });
    
    if (updatedGuest) {
      setProvisionedGuest(updatedGuest);
      
      // If this is the current guest, update that too
      if (currentGuestUser?.id === updatedGuest.id) {
        setCurrentGuestUser(updatedGuest);
      }
      
      // Update in guest users list if present
      setGuestUsers(prev => 
        prev.map(user => user.id === updatedGuest.id ? updatedGuest : user)
      );
      
      // If theme changed, trigger a re-render
      if (preferences.theme) {
        console.log('Provisioned guest theme updated:', preferences.theme);
      }
    }
    
    return updatedGuest;
  }, [isGuestMode, provisionedGuest, currentGuestUser]);

  /**
   * Enhanced user switching with ultra-rapid switching support and guest isolation
   */
  const [switchingUser, setSwitchingUser] = useState(false);
  const switchTimeoutRef = useRef(null);
  const lastSwitchTime = useRef(0);
  const switchQueueRef = useRef([]);
  const processingQueue = useRef(false);
  
  // Process switch queue with aggressive debouncing
  const processSwitchQueue = useCallback(async () => {
    if (processingQueue.current || switchQueueRef.current.length === 0) {
      return;
    }
    
    processingQueue.current = true;
    
    // Get the most recent switch request (discard intermediate ones)
    const latestSwitch = switchQueueRef.current[switchQueueRef.current.length - 1];
    switchQueueRef.current = [];
    
    try {
      const { userId, timestamp } = latestSwitch;
      
      // Ultra-fast debouncing - only process if enough time has passed
      const now = Date.now();
      const timeSinceLastSwitch = now - lastSwitchTime.current;
      
      if (timeSinceLastSwitch < 25) { // 25ms minimum between actual switches (faster response)
        // Queue this for later processing
        setTimeout(() => {
          switchQueueRef.current.push(latestSwitch);
          processSwitchQueue();
        }, 25 - timeSinceLastSwitch);
        processingQueue.current = false;
        return;
      }
      
      lastSwitchTime.current = now;
      setSwitchingUser(true);
      
      console.log('Processing user switch to:', userId);
      
      if (userId === 'guest') {
        // Switching to guest mode - create or restore guest session
        console.log('Switching to guest mode');
        await handleGuestModeSwitch();
      } else if (userId && userId.startsWith('guest_')) {
        // Switching to a specific guest user
        console.log('Switching to specific guest:', userId);
        await handleSpecificGuestSwitch(userId);
      } else if (userId && userId !== 'guest') {
        // Switching to a registered user (system, branden, etc.)
        console.log('Switching to registered user:', userId);
        await handleRegisteredUserSwitch(userId);
      } else {
        // Fallback to guest mode
        console.log('Fallback to guest mode for userId:', userId);
        await handleGuestModeSwitch();
      }
      
    } catch (error) {
      console.error('Error processing user switch:', error);
      // Fallback behavior
      setIsGuestMode(true);
    } finally {
      setSwitchingUser(false);
      processingQueue.current = false;
      
      // Process any remaining queued switches
      if (switchQueueRef.current.length > 0) {
        setTimeout(processSwitchQueue, 10);
      }
    }
  }, []);
  
  // Individual switch handlers
  const handleGuestModeSwitch = useCallback(async () => {
    try {
      console.log('Switching to guest mode, provisioned guest:', provisionedGuest?.name);
      
      // Wait a tick to ensure any previous state changes are processed
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Always use the provisioned guest for this session
      if (provisionedGuest) {
        setCurrentGuestUser(provisionedGuest);
        setIsGuestMode(true);
        
        // Update session coordination
        const sessionInfo = {
          sessionId: provisionedGuest.preferences?.sessionId || guestCoordination.generateSessionId(),
          fingerprint: provisionedGuest.preferences?.fingerprint || guestCoordination.createFingerprint(),
          lastActive: Date.now()
        };
        guestCoordination.storeSessionInfo(sessionInfo.sessionId, sessionInfo.fingerprint);
        setSessionInfo(sessionInfo);
      } else {
        // Fallback: create new provisioned guest if somehow missing
        console.log('No provisioned guest found, creating new one');
        const allUsers = [...(baseUsers.users || []), ...guestUsers];
        const newProvisionedGuest = sessionGuestProvisioning.getOrCreateProvisionedGuest(allUsers);
        
        if (newProvisionedGuest) {
          setProvisionedGuest(newProvisionedGuest);
          setCurrentGuestUser(newProvisionedGuest);
          setIsGuestMode(true);
        }
      }
    } catch (error) {
      console.error('Error in handleGuestModeSwitch:', error);
      setIsGuestMode(true); // Fallback to guest mode
    }
  }, [provisionedGuest, baseUsers.users, guestUsers]);
  
  const handleSpecificGuestSwitch = useCallback(async (guestId) => {
    const targetGuest = guestUsers.find(g => g.id === guestId);
    if (targetGuest) {
      // Switch to specific guest and restore their session
      guestSession.store(targetGuest);
      setCurrentGuestUser(targetGuest);
      setIsGuestMode(true);
      
      // Update session coordination
      const sessionInfo = {
        sessionId: targetGuest.preferences?.sessionId || guestCoordination.generateSessionId(),
        fingerprint: targetGuest.preferences?.browserFingerprint || guestCoordination.createFingerprint(),
        lastActive: Date.now()
      };
      guestCoordination.storeSessionInfo(sessionInfo.sessionId, sessionInfo.fingerprint);
      setSessionInfo(sessionInfo);
    } else {
      // Fallback to creating new guest
      await handleGuestModeSwitch();
    }
  }, [guestUsers, handleGuestModeSwitch]);
  
  const handleRegisteredUserSwitch = useCallback(async (userId) => {
    console.log('=== SIMPLIFIED REGISTERED USER SWITCH ===');
    console.log('Target userId:', userId);
    
    // Just exit guest mode and call baseUsers.switchUser directly
    setIsGuestMode(false);
    setCurrentGuestUser(null);
    
    // Call switchUser directly - let it handle everything
    console.log('Calling baseUsers.switchUser directly with:', userId);
    baseUsers.switchUser(userId);
    
    console.log('=== REGISTERED USER SWITCH END ===');
  }, [baseUsers]);
  
  const switchToUser = useCallback((userId) => {
    // Add to queue for processing
    switchQueueRef.current.push({
      userId,
      timestamp: Date.now()
    });
    
    // Start processing if not already running
    if (!processingQueue.current) {
      processSwitchQueue();
    }
  }, [processSwitchQueue]);

  /**
   * Add another guest user (for multi-user simulation)
   */
  const addGuestUser = useCallback((customName = null) => {
    const allUsers = [...baseUsers.users, ...guestUsers];
    const newGuest = createGuestUser(allUsers, customName);
    
    setGuestUsers(prev => [...prev, newGuest]);
    return newGuest;
  }, [baseUsers.users, guestUsers]);

  /**
   * Remove a guest user
   */
  const removeGuestUser = useCallback((guestId) => {
    setGuestUsers(prev => prev.filter(user => user.id !== guestId));
    
    // If removing current guest, create a new one or switch to system
    if (currentGuestUser?.id === guestId) {
      guestSession.clear();
      setCurrentGuestUser(null);
      setIsGuestMode(false);
      setSessionInfo(null);
    }
  }, [currentGuestUser]);

  /**
   * Extend current guest session
   */
  const extendGuestSession = useCallback(() => {
    if (guestSession.extend()) {
      const updated = guestSession.getCurrentUser();
      setCurrentGuestUser(updated);
      return true;
    }
    return false;
  }, []);

  /**
   * Clean up expired guest users
   */
  const cleanupExpiredGuests = useCallback(() => {
    setGuestUsers(prev => guestCleanup.removeExpired(prev));
    
    // Check if current guest is expired
    if (currentGuestUser && guestCleanup.isExpired(currentGuestUser)) {
      guestSession.clear();
      setCurrentGuestUser(null);
      setIsGuestMode(false);
      setSessionInfo(null);
    }
  }, [currentGuestUser]);

  /**
   * Update activity timestamp
   */
  const updateActivity = useCallback(() => {
    lastActiveRef.current = Date.now();
    guestCoordination.updateLastActive();
  }, []);

  /**
   * Get current effective user (guest or registered)
   */
  const getCurrentUser = useCallback(() => {
    if (isGuestMode && currentGuestUser) {
      return { ...currentGuestUser, id: 'guest' }; // Normalize guest ID for UI
    }
    
    // Ensure we have a valid registered user
    const registeredUser = baseUsers.currentUser;
    if (registeredUser && baseUsers.users?.find(u => u.id === registeredUser.id)) {
      return registeredUser;
    }
    
    // Fallback to system user if something is wrong
    const systemUser = baseUsers.users?.find(u => u.isSystemUser);
    return systemUser || baseUsers.currentUser;
  }, [isGuestMode, currentGuestUser, baseUsers.currentUser, baseUsers.users]);

  /**
   * Get all users (registered + active guests) with enhanced error handling
   */
  const getAllUsers = useCallback(() => {
    try {
      const activeGuests = guestCleanup.removeExpired(guestUsers);
      const registeredUsers = baseUsers.users || [];
      const allUsers = [...registeredUsers, ...activeGuests];
      
      console.log('=== GET ALL USERS ===');
      console.log('baseUsers.users:', registeredUsers.map(u => ({id: u.id, name: u.name, isSystemUser: u.isSystemUser})));
      console.log('baseUsers.loading:', baseUsers.loading);
      console.log('baseUsers.error:', baseUsers.error);
      console.log('activeGuests:', activeGuests.map(u => ({id: u.id, name: u.name, isGuest: u.isGuest})));
      
      // Ensure all users have required fields and fallback values
      const processedUsers = allUsers.map(user => {
        const cachedData = userCache.get(user.id);
        return {
          id: user.id,
          name: user.name || cachedData?.name || 'Unknown User',
          email: user.email || cachedData?.email || null,
          profilePicture: user.profilePicture || cachedData?.profilePicture || null,
          isSystemUser: Boolean(user.isSystemUser),
          isGuest: Boolean(user.isGuest),
          isActive: user.isActive !== false, // Default to true
          ...user // Keep other fields
        };
      });
      
      console.log('Processed users:', processedUsers.map(u => ({id: u.id, name: u.name, isSystemUser: u.isSystemUser, isGuest: u.isGuest})));
      return processedUsers;
    } catch (error) {
      console.error('Error getting all users:', error);
      return baseUsers.users || [];
    }
  }, [baseUsers.users, guestUsers, userCache]);

  // Periodic cleanup of expired guests
  useEffect(() => {
    const interval = setInterval(cleanupExpiredGuests, 60000); // Every minute
    return () => clearInterval(interval);
  }, [cleanupExpiredGuests]);

  // Activity tracking
  useEffect(() => {
    const handleActivity = () => updateActivity();
    
    // Track various user activities
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });
    
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [updateActivity]);

  // Cleanup all refs and timers on unmount, and handle browser session cleanup
  useEffect(() => {
    // Handle browser/tab close cleanup
    const handleBeforeUnload = () => {
      // Keep provisioned guest in sessionStorage, but clean up other temporary data
      guestCoordination.updateLastActive();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        guestCoordination.updateLastActive();
      }
    };

    // Add event listeners for session cleanup
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      // Clean up event listeners
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Clean up timers and queues
      if (switchTimeoutRef.current) {
        clearTimeout(switchTimeoutRef.current);
      }
      
      // Clear any queued switches
      switchQueueRef.current = [];
      processingQueue.current = false;
    };
  }, []);

  // Enhanced derived state
  const currentUser = getCurrentUser();
  const allUsers = getAllUsers();
  const activeGuestUsers = guestCleanup.getActiveGuests(guestUsers);
  const guestCount = activeGuestUsers.length;

  return {
    // Extended state from base useUsers
    ...baseUsers,
    
    // Guest-specific state
    isGuestMode,
    currentGuestUser,
    provisionedGuest,
    guestUsers: activeGuestUsers,
    guestCount,
    sessionInfo,
    
    // Override current user to include guest logic
    currentUser,
    allUsers,
    
    // Enhanced operations
    switchUser: switchToUser,
    
    // Guest-specific operations
    createNewGuestUser,
    updateGuestUserName,
    updateGuestPreferences,
    addGuestUser,
    removeGuestUser,
    extendGuestSession,
    cleanupExpiredGuests,
    updateActivity,
    
    // Session-specific guest operations
    hasProvisionedGuest: !!provisionedGuest,
    getProvisionedGuest: () => provisionedGuest,
    
    // Utilities
    isCurrentUserGuest: isGuestMode && !!currentGuestUser,
    canCreateUsers: !isGuestMode, // Guests can't create registered users
    sessionTimeRemaining: currentGuestUser ? 
      Math.max(0, (currentGuestUser.sessionExpires || 0) - Date.now()) : 0,
  };
}

/**
 * Context provider for guest user functionality
 */
export function useGuestUserContext() {
  const guestUsers = useGuestUsers();
  
  return {
    ...guestUsers,
    
    // Additional context-specific utilities
    getGuestDisplayName: (guestId) => {
      const guest = guestUsers.guestUsers.find(g => g.id === guestId);
      return guest?.name || 'Unknown Guest';
    },
    
    isUserGuest: (userId) => {
      return userId && userId.startsWith('guest_');
    },
    
    getGuestColor: (guestId) => {
      // Simple color assignment based on guest ID
      const colors = [
        'bg-blue-100 text-blue-800',
        'bg-green-100 text-green-800', 
        'bg-purple-100 text-purple-800',
        'bg-orange-100 text-orange-800',
        'bg-pink-100 text-pink-800',
        'bg-indigo-100 text-indigo-800'
      ];
      
      // Simple hash of guest ID to color index
      let hash = 0;
      for (let i = 0; i < guestId.length; i++) {
        hash = ((hash << 5) - hash + guestId.charCodeAt(i)) & 0xffffffff;
      }
      
      return colors[Math.abs(hash) % colors.length];
    }
  };
}