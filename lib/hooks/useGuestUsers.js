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
import { getBrowserSessionId, getBrowserMetadata } from '@/lib/utils/browser-session.js';

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
  const [userCache, setUserCache] = useState(() => new Map()); // Cache for user data persistence
  const lastActiveRef = useRef(Date.now());
  const sessionInitializedRef = useRef(false); // Track if session has been initialized

  /**
   * Update user cache with memory management and size limits
   */
  const updateUserCache = useCallback((users) => {
    setUserCache(prevCache => {
      // Optimize: modify existing Map instead of creating new one
      const cache = prevCache;
      let hasChanges = false;
      
      users.forEach(user => {
        if (user?.id) {
          const existingData = cache.get(user.id) || {};
          
          // Only update if data actually changed
          const userData = {
            profilePicture: user.profilePicture || existingData.profilePicture || null,
            name: user.name || existingData.name || 'Unknown User',
            email: user.email || existingData.email || null,
            isGuest: Boolean(user.isGuest || existingData.isGuest),
            preferences: user.preferences || existingData.preferences || {},
            lastSeen: Date.now(),
            originalId: user.id
          };
          
          // Check if data actually changed before setting
          const existing = cache.get(user.id);
          if (!existing || 
              existing.profilePicture !== userData.profilePicture ||
              existing.name !== userData.name ||
              existing.email !== userData.email) {
            cache.set(user.id, userData);
            hasChanges = true;
          } else {
            // Just update lastSeen for existing entries
            existing.lastSeen = Date.now();
          }
        }
      });
      
      // Memory management: Clean up old entries and limit cache size
      const now = Date.now();
      const dayAgo = now - (24 * 60 * 60 * 1000);
      const maxCacheSize = 100; // Limit to 100 users max
      
      // Remove very old non-guest entries
      for (const [userId, userData] of cache.entries()) {
        if (userData.lastSeen < dayAgo && !userData.isGuest) {
          cache.delete(userId);
          hasChanges = true;
        }
      }
      
      // If cache is still too large, remove oldest entries
      if (cache.size > maxCacheSize) {
        const sortedEntries = Array.from(cache.entries())
          .sort((a, b) => a[1].lastSeen - b[1].lastSeen);
          
        const toRemove = cache.size - maxCacheSize;
        for (let i = 0; i < toRemove; i++) {
          const [userId] = sortedEntries[i];
          cache.delete(userId);
          hasChanges = true;
        }
      }
      
      // Return new Map only if changes were made, otherwise return same reference
      return hasChanges ? new Map(cache) : prevCache;
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
   * Now integrated with server-side browser session tracking
   */
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    const initializeSessionGuest = async () => {
      // Wait a bit to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get or create browser session ID
      const browserSessionId = getBrowserSessionId();
      if (!browserSessionId) {
        console.warn('[useGuestUsers] Browser session ID not available, skipping session initialization');
        return; // Don't retry - this will cause infinite polling
      }
      
      // Browser session ID for this tab
      
      try {
        // Check if we have an existing browser session on the server
        const checkResponse = await fetch(`/api/browser-sessions?id=${browserSessionId}`);
        
        if (checkResponse.status === 404) {
          // New browser session - create it on the server
          // Creating new browser session on server
          const createResponse = await fetch('/api/browser-sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              browserSessionId,
              metadata: getBrowserMetadata()
            })
          });
          
          if (createResponse.ok) {
            const browserSession = await createResponse.json();
            // Browser session created with provisioned guest
            
            // Set the provisioned guest from server
            if (browserSession.provisionedGuest) {
              // Ensure isGuest property is set
              const guestWithFlag = {
                ...browserSession.provisionedGuest,
                isGuest: true
              };
              setProvisionedGuest(guestWithFlag);
              
              // Store in sessionStorage for client-side access
              sessionStorage.setItem('provisioned_session_guest', 
                JSON.stringify(guestWithFlag));
              
              // Default to provisioned guest for new sessions
              setCurrentGuestUser(guestWithFlag);
              setIsGuestMode(true);
              
              // Set up session coordination
              guestCoordination.storeSessionInfo(
                browserSession.provisionedGuest.preferences?.sessionId, 
                browserSession.provisionedGuest.preferences?.fingerprint
              );
              setSessionInfo({
                sessionId: browserSession.provisionedGuest.preferences?.sessionId,
                fingerprint: browserSession.provisionedGuest.preferences?.fingerprint,
                createdAt: Date.now(),
                lastActive: Date.now()
              });
            }
          }
        } else if (checkResponse.ok) {
          // Existing browser session - restore state
          const browserSession = await checkResponse.json();
          // Restoring browser session
          
          // Set the provisioned guest from server
          if (browserSession.provisionedGuest) {
            // Ensure isGuest property is set
            const guestWithFlag = {
              ...browserSession.provisionedGuest,
              isGuest: true
            };
            setProvisionedGuest(guestWithFlag);
            
            // Store in sessionStorage for client-side access
            sessionStorage.setItem('provisioned_session_guest', 
              JSON.stringify(guestWithFlag));
          }
          
          // Restore the active user selection
          if (browserSession.activeUserId) {
            if (browserSession.activeUserType === 'guest') {
              // Restore guest mode with isGuest flag
              const guestWithFlag = {
                ...browserSession.provisionedGuest,
                isGuest: true
              };
              setCurrentGuestUser(guestWithFlag);
              setIsGuestMode(true);
            } else {
              // Restore registered user
              const userToRestore = baseUsers.users.find(u => u.id === browserSession.activeUserId);
              if (userToRestore) {
                baseUsers.switchUser(browserSession.activeUserId);
                setIsGuestMode(false);
                setCurrentGuestUser(null);
              } else {
                // User not found, fall back to provisioned guest
                // Registered user not found, falling back to guest
                setCurrentGuestUser(browserSession.provisionedGuest);
                setIsGuestMode(true);
              }
            }
          }
        }
      } catch (error) {
        console.error('[useGuestUsers] Error initializing browser session:', error);
        
        // Fallback to client-side provisioning
        const allUsers = [...baseUsers.users, ...guestUsers];
        const sessionGuest = await sessionGuestProvisioning.getOrCreateProvisionedGuest(allUsers);
        
        if (sessionGuest) {
          setProvisionedGuest(sessionGuest);
          setCurrentGuestUser(sessionGuest);
          setIsGuestMode(true);
        }
      }
    };

    // Initialize provisioned guest when users are loaded (only once)
    if (!baseUsers.loading && baseUsers.users.length >= 0 && !sessionInitializedRef.current) {
      sessionInitializedRef.current = true;
      initializeSessionGuest();
    }
  }, [baseUsers, guestUsers]);

  /**
   * Synchronize currentGuestUser with provisionedGuest when in guest mode
   */
  useEffect(() => {
    if (isGuestMode && provisionedGuest && currentGuestUser?.id !== provisionedGuest.id) {
      // Synchronizing currentGuestUser with provisionedGuest
      setCurrentGuestUser(provisionedGuest);
    }
  }, [isGuestMode, provisionedGuest, currentGuestUser?.id]);

  /**
   * Listen for storage changes to reinitialize provisioned guest when data is cleared
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (event) => {
      // Check if guest-related storage was cleared
      if (event.key === 'provisioned_guest_data' && event.newValue === null) {
        // Guest data cleared, reinitializing provisioned guest
        
        // Force clear sessionStorage guest data (but preserve selectedUserId for restoration)
        sessionStorage.removeItem('provisioned_session_guest');
        
        // Reinitialize provisioned guest
        setTimeout(async () => {
          const allUsers = [...baseUsers.users, ...guestUsers];
          const newSessionGuest = await sessionGuestProvisioning.getOrCreateProvisionedGuest(allUsers);
          
          if (newSessionGuest) {
            setProvisionedGuest(newSessionGuest);
            // New provisioned guest created
          }
        }, 100);
      }
    };

    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [baseUsers.users, guestUsers]);

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
      
      
      // Persist the user selection to sessionStorage
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('selectedUserId', userId);
      }
      
      if (userId === 'guest') {
        // Switching to guest mode - create or restore guest session
        await handleGuestModeSwitch();
      } else if (userId && userId.startsWith('guest_')) {
        // Switching to a specific guest user
        await handleSpecificGuestSwitch(userId);
      } else if (userId && userId !== 'guest') {
        // Switching to a registered user (system, branden, etc.)
        await handleRegisteredUserSwitch(userId);
      } else {
        // Fallback to guest mode
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Individual switch handlers
  const handleGuestModeSwitch = useCallback(async () => {
    try {
      
      // Wait a tick to ensure any previous state changes are processed
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // First, try to get the provisioned guest from the browser session
      let guestToUse = provisionedGuest;
      
      if (!guestToUse) {
        // Try to get from browser session on server
        const browserSessionId = getBrowserSessionId();
        if (browserSessionId) {
          try {
            const response = await fetch(`/api/browser-sessions?id=${browserSessionId}`);
            if (response.ok) {
              const browserSession = await response.json();
              if (browserSession.provisionedGuest) {
                guestToUse = browserSession.provisionedGuest;
                setProvisionedGuest(guestToUse);
                // Restored provisioned guest from browser session
              }
            }
          } catch (error) {
            console.error('[useGuestUsers] Error fetching browser session:', error);
          }
        }
      }
      
      // Always use the provisioned guest for this session
      if (guestToUse) {
        // Ensure currentGuestUser is synchronized with provisionedGuest
        setCurrentGuestUser(guestToUse);
        setIsGuestMode(true);
        
        // Update browser session on server
        const browserSessionId = getBrowserSessionId();
        if (browserSessionId) {
          fetch('/api/browser-sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              browserSessionId,
              activeUserId: guestToUse.id,
              activeUserType: 'guest'
            })
          }).catch(err => console.error('[useGuestUsers] Error updating browser session:', err));
        }
        
        // Mark the guest session as active and mark registered user sessions as inactive immediately
        // Use setTimeout with small delay to avoid blocking the UI
        setTimeout(async () => {
          try {
            // Activate guest session
            const guestResponse = await fetch('/api/sessions/transition', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                userId: guestToUse.id,
                newStatus: 'active',
                reason: 'switched_to_guest_mode'
              })
            });
            
            // Mark current registered user session as inactive if exists
            if (baseUsers.currentUser && !baseUsers.currentUser.isGuest) {
              await fetch('/api/sessions/transition', {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  userId: baseUsers.currentUser.id,
                  newStatus: 'inactive',
                  reason: 'switched_to_guest_mode'
                })
              });
            }
          } catch (error) {
            console.error('[useGuestUsers] Error transitioning session states:', error);
          }
        }, 100); // Small delay to avoid blocking UI
        
        // Update session coordination
        const sessionInfo = {
          sessionId: guestToUse.preferences?.sessionId || guestCoordination.generateSessionId(),
          fingerprint: guestToUse.preferences?.fingerprint || guestCoordination.createFingerprint(),
          lastActive: Date.now()
        };
        guestCoordination.storeSessionInfo(sessionInfo.sessionId, sessionInfo.fingerprint);
        setSessionInfo(sessionInfo);
      } else {
        // Fallback: create new provisioned guest only if truly needed
        // No provisioned guest found, creating new one
        const allUsers = [...(baseUsers.users || []), ...guestUsers];
        const newProvisionedGuest = await sessionGuestProvisioning.getOrCreateProvisionedGuest(allUsers);
        
        if (newProvisionedGuest) {
          setProvisionedGuest(newProvisionedGuest);
          setCurrentGuestUser(newProvisionedGuest);
          setIsGuestMode(true);
          
          // Also update browser session with new guest
          const browserSessionId = getBrowserSessionId();
          if (browserSessionId) {
            fetch('/api/browser-sessions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                browserSessionId,
                provisionedGuest: newProvisionedGuest,
                activeUserId: newProvisionedGuest.id,
                activeUserType: 'guest'
              })
            }).catch(err => console.error('[useGuestUsers] Error creating browser session with new guest:', err));
          }
        }
      }
    } catch (error) {
      console.error('Error in handleGuestModeSwitch:', error);
      setIsGuestMode(true); // Fallback to guest mode
    }
  }, [provisionedGuest, baseUsers.users, baseUsers.currentUser, guestUsers]);
  
  const handleSpecificGuestSwitch = useCallback(async (guestId) => {
    // First check if it's the provisioned guest
    if (provisionedGuest && provisionedGuest.id === guestId) {
      // Use the provisioned guest
      setCurrentGuestUser(provisionedGuest);
      setIsGuestMode(true);
      
      // Update browser session on server
      const browserSessionId = getBrowserSessionId();
      if (browserSessionId) {
        fetch('/api/browser-sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            browserSessionId,
            activeUserId: provisionedGuest.id,
            activeUserType: 'guest'
          })
        }).catch(err => console.error('[useGuestUsers] Error updating browser session:', err));
      }
      
      // Update session coordination
      const sessionInfo = {
        sessionId: provisionedGuest.preferences?.sessionId || guestCoordination.generateSessionId(),
        fingerprint: provisionedGuest.preferences?.browserFingerprint || guestCoordination.createFingerprint(),
        lastActive: Date.now()
      };
      guestCoordination.storeSessionInfo(sessionInfo.sessionId, sessionInfo.fingerprint);
      setSessionInfo(sessionInfo);
    } else {
      // Check other guest users
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
        // Fallback to using guest mode switch
        await handleGuestModeSwitch();
      }
    }
  }, [guestUsers, provisionedGuest, handleGuestModeSwitch]);
  
  const handleRegisteredUserSwitch = useCallback(async (userId) => {
    // Exit guest mode first
    setIsGuestMode(false);
    setCurrentGuestUser(null);
    
    // Update browser session on server
    const browserSessionId = getBrowserSessionId();
    if (browserSessionId) {
      fetch('/api/browser-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          browserSessionId,
          activeUserId: userId,
          activeUserType: 'registered'
        })
      }).catch(err => console.error('[useGuestUsers] Error updating browser session:', err));
    }
    
    // Mark guest sessions as inactive immediately when switching to registered user
    if (provisionedGuest) {
      // Use setTimeout with small delay to avoid blocking UI
      setTimeout(async () => {
        try {
          const response = await fetch('/api/sessions/transition', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              userId: provisionedGuest.id,
              newStatus: 'inactive',
              reason: 'switched_to_registered_user'
            })
          });
          
        } catch (error) {
          console.error('[useGuestUsers] Error marking guest session inactive:', error);
        }
      }, 100); // Small delay to avoid blocking UI
    }
    
    // Call switchUser to handle the registered user switch
    baseUsers.switchUser(userId);
    
  }, [baseUsers, provisionedGuest]);
  
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
    if (isGuestMode) {
      // Always prioritize the provisioned guest for this session/tab
      if (provisionedGuest) {
        // Ensure isGuest property is set
        return {
          ...provisionedGuest,
          isGuest: true
        };
      }
      
      // Fallback to currentGuestUser if somehow provisioned guest is missing
      if (currentGuestUser) {
        return {
          ...currentGuestUser,
          isGuest: true
        };
      }
    }
    
    // Return the current registered user if we have one
    if (baseUsers.currentUser) {
      return baseUsers.currentUser;
    }
    
    // Only use emergency fallbacks if we truly have no current user AND no users loaded
    if (!baseUsers.users || baseUsers.users.length === 0) {
      // Last resort - create a temporary system user to prevent null state
      return {
        id: 'system',
        name: 'System',
        isSystemUser: true,
        profilePicture: null
      };
    }
    
    // If we have users loaded but no current user, return null to let the UI handle it
    // This prevents masking real switching issues with automatic fallbacks
    return null;
  }, [isGuestMode, provisionedGuest, currentGuestUser, baseUsers.currentUser, baseUsers.users]);

  /**
   * Get all users (registered + active guests) with enhanced error handling
   */
  const getAllUsers = useCallback(() => {
    try {
      const activeGuests = guestCleanup.removeExpired(guestUsers);
      const registeredUsers = baseUsers.users || [];
      const allUsers = [...registeredUsers, ...activeGuests];
      
      
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
      // End browser session on server
      const browserSessionId = getBrowserSessionId();
      if (browserSessionId) {
        // Use sendBeacon for reliable cleanup
        const url = `/api/browser-sessions?id=${browserSessionId}`;
        navigator.sendBeacon(url, JSON.stringify({ method: 'DELETE' }));
      }
      
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
      
      // Clean up timers and queues - capture ref value to avoid stale closure
      const currentSwitchTimeout = switchTimeoutRef.current;
      if (currentSwitchTimeout) {
        clearTimeout(currentSwitchTimeout);
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
    refreshProvisionedGuest: async () => {
      // Manually refreshing provisioned guest
      
      // Clear sessionStorage guest data (but preserve selectedUserId for restoration)
      sessionGuestProvisioning.clearProvisionedGuest();
      
      // Create new provisioned guest
      const allUsers = [...baseUsers.users, ...guestUsers];
      const newSessionGuest = await sessionGuestProvisioning.getOrCreateProvisionedGuest(allUsers);
      
      if (newSessionGuest) {
        setProvisionedGuest(newSessionGuest);
        return newSessionGuest;
      }
      return null;
    },
    
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