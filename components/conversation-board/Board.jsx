/**
 * Board Component (LK.G + Left Tray + Conversation Controls + Conversations API wiring)
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BoardCanvas } from './BoardCanvas';
import { CardDialog } from './CardDialog';
import { HelpDialog } from './HelpDialog';
import { UserProfileDialog } from '@/components/ui/user-profile-dialog';
import { useCards } from '@/lib/hooks/useCards';
import { useSSECardEvents } from '@/lib/hooks/useSSECardEvents';
import { useUserManagement } from '@/lib/hooks/useUserManagement';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { useConversationControls } from '@/lib/hooks/useConversationControls';
import { useGlobalSession } from '@/lib/contexts/GlobalSessionProvider';
import { useButtonTracking } from '@/lib/hooks/useButtonTracking';
import { CARD_TYPES } from '@/lib/utils/card-type-constants';
import { LeftTray } from '@/components/ui/left-tray';
import { AppHeader } from '@/components/ui/app-header';
import { APP_THEME } from '@/lib/utils/ui-constants';
import { useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';



function resolveCardType(aliases, fallback) {
  if (CARD_TYPES && typeof CARD_TYPES === 'object') {
    for (const key of aliases) {
      if (Object.prototype.hasOwnProperty.call(CARD_TYPES, key)) return key;
    }
  }
  return fallback;
}

const TYPE_KEYS = {
  topic: resolveCardType(['topic', 'conversation', 'conversation_topic'], 'topic'),
  question: resolveCardType(['question', 'open_question', 'open-question'], 'question'),
  accusation: resolveCardType(['accusation', 'claim', 'allegation'], 'accusation'),
  fact: resolveCardType(['fact', 'factual', 'factual_statement', 'objective_fact'], 'fact'),
  guess: resolveCardType(['guess'], 'guess'),
  opinion: resolveCardType(['opinion'], 'opinion'),
};

function buildNewCardPayload(type, currentUser = null) {
  const now = Date.now();
  const creatorId = currentUser?.id || 'system';
  return {
    type,
    content: '',
    zone: 'active',
    position: { x: 10, y: 60 },
    stackOrder: 0,
    createdAt: now,
    updatedAt: now,
    createdByUserId: creatorId,
    // Keep legacy field for backward compatibility
    createdBy: currentUser?.name || 'system',
    person: currentUser?.name || 'system',
  };
}


function BoardInner({
  cards,
  loading,
  error,
  createCard,
  updateCard,
  deleteCard,
  getCardsByZone,
  refreshCards,
  // User context
  users,
  currentUser,
  onUserSelect,
  onCreateUser,
  onEditUser,
  onManageUsers,
  // Render key for forcing re-renders
  boardRenderKey,
  // Guest mode props
  isGuestMode,
  sessionTimeRemaining,
  guestCount,
  updateGuestPreferences,
  provisionedGuest,
}) {
  const [selectedCard, setSelectedCard] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [layoutKey, setLayoutKey] = useState(0);
  
  // Get dynamic theme
  const dynamicTheme = useDynamicAppTheme();
  
  // Enable global button tracking
  useButtonTracking();
  
  // Animation preferences - default to true, sync with current user preferences
  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    return currentUser?.preferences?.animationsEnabled !== false;
  });
  
  // Sync animations state when user changes
  useEffect(() => {
    setAnimationsEnabled(currentUser?.preferences?.animationsEnabled !== false);
  }, [currentUser]);

  // Conversation controls and state
  const conversationControls = useConversationControls();
  const { activeConversation, runtime, onPause, onResumeOrStart, onStop, conversationApi: conv } = conversationControls;

  // Session tracking
  const { 
    emitCardEvent, 
    emitUIEvent,
    emitPreferenceEvent,
    emit,
    initializeSession
  } = useGlobalSession();
  
  // Session initialization is now handled by GlobalSessionProvider automatically
  // This ensures all pages get sessions, not just the Board
  useEffect(() => {
    if (currentUser && currentUser.id) {
      // If user switches, update the session
      if (!currentUser.isGuest && !currentUser.isSystemUser) {
        // For registered users, update the session
        initializeSession(currentUser);
      }
    }
  }, [currentUser, initializeSession]);

  // Left tray
  const [trayOpen, setTrayOpen] = useState(false);
  
  // Handle animations toggle
  const handleAnimationsToggle = useCallback(async (enabled) => {
    setAnimationsEnabled(enabled);
    
    // Emit preference change event
    emitPreferenceEvent('animation', {
      animationsEnabled: enabled
    });
    
    // Update user preferences if logged in
    if (currentUser && !isGuestMode) {
      try {
        await fetch(`/api/users/${currentUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preferences: {
              ...currentUser.preferences,
              animationsEnabled: enabled
            }
          })
        });
      } catch (error) {
        console.error('Failed to update animation preference:', error);
      }
    }
    
    // Update guest preferences if in guest mode
    if (isGuestMode && updateGuestPreferences) {
      updateGuestPreferences({ animationsEnabled: enabled });
    }
  }, [currentUser, isGuestMode, updateGuestPreferences, emitPreferenceEvent]);

  const resetLayout = useCallback(() => {
    setLayoutKey((k) => k + 1);
  }, []);

  useKeyboardShortcuts({
    onNewTopic: () => handleCreate(TYPE_KEYS.topic),        // ctrl+n
    onNewQuestion: () => handleCreate(TYPE_KEYS.question),  // ctrl+q
    onNewAccusation: () => handleCreate(TYPE_KEYS.accusation), // ctrl+a
    onNewFact: () => handleCreate(TYPE_KEYS.fact),          // ctrl+f
    onNewOpinion: () => handleCreate(TYPE_KEYS.opinion),    // ctrl+o
    onNewGuess: () => handleCreate(TYPE_KEYS.guess),        // ctrl+g
    onDeleteSelected: selectedCard ? () => handleDelete(selectedCard) : null,
    onResetLayout: resetLayout,
    onDeselect: () => setSelectedCard(null),
    selectedCard,
  });



  // ---- Card helpers that also emit conversation events ----
  async function handleCreate(type) {
    const payload = buildNewCardPayload(type, currentUser);
    const newCard = await createCard(payload);
    
    // Emit user tracking event
    emitCardEvent('created', {
      cardId: newCard?.id,
      cardType: newCard?.type,
      zone: newCard?.zone,
    });
    
    try {
      if (conv.activeId) {
        await conv.logEvent(conv.activeId, 'card.created', {
          id: newCard?.id,
          type: newCard?.type,
          zone: newCard?.zone,
        });
      } else {
      }
    } catch (err) {
      console.error('[Conv Events] Error logging event:', err);
    }
  }

  async function handleDelete(id) {
    const card = cards.find(c => c.id === id);
    await deleteCard(id);
    
    // Emit user tracking event
    emitCardEvent('deleted', {
      cardId: id,
      zone: card?.zone,
    });
    
    try {
      if (conv.activeId) {
        await conv.logEvent(conv.activeId, 'card.deleted', { id, zone: card?.zone });
      } else {
      }
    } catch (err) {
      console.error('[Conv Events] Error logging event:', err);
    }
  }

  // Clear all cards from the board
  async function clearBoard() {
    const cardIds = cards.map(card => card.id);
    
    // Delete all cards one by one
    for (const cardId of cardIds) {
      try {
        await deleteCard(cardId);
      } catch (error) {
        console.error(`Failed to delete card ${cardId}:`, error);
      }
    }
    
    // Emit bulk delete event
    emitCardEvent('bulk_deleted', {
      count: cardIds.length,
      cardIds
    });
    
    // Log conversation event if active
    try {
      if (conv.activeId) {
        await conv.logEvent(conv.activeId, 'board.cleared', { 
          cardCount: cardIds.length,
          cardIds 
        });
      }
    } catch (err) {
      console.error('[Conv Events] Error logging clear board event:', err);
    }
  }

  const wrappedUpdateCard = async (id, updates) => {
    const before = cards.find(c => c.id === id);
    const updated = await updateCard(id, updates);
    
    // Emit user tracking events
    if (updates && Object.prototype.hasOwnProperty.call(updates, 'content')) {
      emitCardEvent('updated', { 
        cardId: id, 
        fields: ['content'] 
      });
    }
    if (before && updates && updates.zone && updates.zone !== before.zone) {
      emitCardEvent('moved', {
        cardId: id,
        from: before.zone,
        to: updates.zone,
      });
    }
    
    try {
      if (!conv.activeId) {
        return updated;
      }

      // If content changed
      if (updates && Object.prototype.hasOwnProperty.call(updates, 'content')) {
        await conv.logEvent(conv.activeId, 'card.updated', { id, fields: ['content'] });
      }
      // If zone changed (move)
      if (before && updates && updates.zone && updates.zone !== before.zone) {
        await conv.logEvent(conv.activeId, 'card.moved', {
          id,
          from: before.zone,
          to: updates.zone,
        });
      }
    } catch (err) {
      console.error('[Conv Events] Error logging event:', err);
    }
    return updated;
  };


  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${dynamicTheme.colors.background.primary}`}>
        <div className="text-center">
          <RefreshCw className={`w-8 h-8 animate-spin mx-auto mb-2 ${dynamicTheme.colors.text.tertiary}`} />
          <p className={dynamicTheme.colors.text.tertiary}>Loading conversation board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-screen ${dynamicTheme.colors.background.primary}`}>
        <div className={`text-center ${dynamicTheme.colors.status.error.text}`}>
          <p className="mb-4">Error loading board: {error}</p>
          <Button onClick={refreshCards} variant="outline" className="h-10 leading-none">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div className={`h-screen flex flex-col ${dynamicTheme.colors.background.page}`}>
        {/* Header */}
        <AppHeader
          onOpenTray={() => {
            setTrayOpen(true);
            emitUIEvent('trayOpen', { trayType: 'navigation' });
          }}
          onOpenHelp={() => {
            setHelpOpen(true);
            emitUIEvent('dialogOpen', { dialogType: 'help' });
          }}
          onOpenNewCard={() => {
            setDialogOpen(true);
            emitUIEvent('dialogOpen', { dialogType: 'newCard' });
          }}
          onResetLayout={resetLayout}
          onRefreshCards={refreshCards}
          onClearBoard={clearBoard}
          activeConversation={activeConversation}
          runtime={runtime}
          onConversationResumeOrStart={onResumeOrStart}
          onConversationPause={onPause}
          onConversationStop={onStop}
          users={users}
          currentUser={currentUser}
          onUserSelect={onUserSelect}
          onCreateUser={onCreateUser}
          onEditUser={onEditUser}
          onManageUsers={onManageUsers}
          // Animation preferences
          animationsEnabled={animationsEnabled}
          onAnimationsToggle={handleAnimationsToggle}
          // Guest mode props
          isGuestMode={isGuestMode}
          sessionTimeRemaining={sessionTimeRemaining}
          guestCount={guestCount}
          updateGuestPreferences={updateGuestPreferences}
          provisionedGuest={provisionedGuest}
        />

        {/* Board Canvas */}
        <BoardCanvas
          key={`board-${boardRenderKey}-${cards?.length || 0}-${JSON.stringify(cards?.map(c => c.id) || [])}`}
          layoutKey={layoutKey + boardRenderKey} // Combine layout key with board render key
          cards={cards}
          getCardsByZone={getCardsByZone}
          onUpdateCard={wrappedUpdateCard}
          onDeleteCard={handleDelete}
          users={users}
          animationsEnabled={animationsEnabled}
        />

        {/* Dialogs */}
        <CardDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          users={users}
          currentUser={currentUser}
          onCreateCard={async (data) => {
            const type = data?.type || TYPE_KEYS.topic;
            const payload = buildNewCardPayload(type, currentUser);
            
            // Override with dialog data if provided
            if (data?.content) {
              payload.content = data.content;
            }
            if (data?.assignedUserId) {
              payload.assignedToUserId = data.assignedUserId;
            }
            
            const newCard = await createCard(payload);
            try {
              if (conv.activeId) {
                await conv.logEvent(conv.activeId, 'card.created', {
                  id: newCard?.id,
                  type: newCard?.type,
                  zone: newCard?.zone,
                });
              } else {
                      }
            } catch (err) {
              console.error('[Conv Events] Error logging event:', err);
            }
          }}
        />

        <HelpDialog open={helpOpen} onOpenChange={setHelpOpen} />

        {/* LEFT TRAY */}
        <LeftTray
          isOpen={trayOpen}
          onClose={() => setTrayOpen(false)}
          onNewCard={() => setDialogOpen(true)}
          onResetLayout={resetLayout}
          onRefreshCards={refreshCards}
        />
      </div>
  );
}

export default function Board() {
  // Traditional card operations (create, update, delete)
  const {
    cards: fallbackCards,
    loading: fallbackLoading,
    error: fallbackError,
    createCard,
    updateCard,
    deleteCard,
    getCardsByZone,
    refreshCards,
  } = useCards();
  
  // Real-time card events SSE (for live collaboration)
  const cardEvents = useSSECardEvents({
    enabled: true,
    forDevPages: true, // Enable dev-page optimizations for testing
    backgroundOperation: true,
    onCardFlip: (flipEvent) => {
      console.log('[Board] Card flip detected:', flipEvent);
      // Future: Add real-time flip animations or notifications
    },
    onCardMove: (moveEvent) => {
      console.log('[Board] Card move detected:', moveEvent);
      // Future: Add real-time move animations or position updates
    },
    onCardUpdate: (updateEvent) => {
      console.log('[Board] Card update detected:', updateEvent);
      // Future: Add real-time content update animations
    }
  });
  
  // Use real-time cards if SSE is properly registered, fallback to traditional cards
  console.log(`[Board] 🔍 Card source decision: isRegistered=${cardEvents.isRegistered}, sseCards=${cardEvents.cards?.length || 0}, fallbackCards=${fallbackCards?.length || 0}`);
  
  const cards = cardEvents.isRegistered 
    ? cardEvents.cards 
    : fallbackCards;
  const loading = cardEvents.isRegistered ? cardEvents.loading : fallbackLoading;
  const error = cardEvents.error || fallbackError;
  
  // Debug current cards being used
  console.log(`[Board] 💳 Final cards being rendered: count=${cards?.length || 0}, data=`, cards?.map(c => ({ id: c.id?.substring(0, 8), zone: c.zone })) || []);
  
  // CRITICAL: Add useEffect to track when cards prop actually changes
  useEffect(() => {
    console.log(`[Board] 🚨 CARDS PROP CHANGED! New count: ${cards?.length || 0}, Tab: ${document.hidden ? 'BACKGROUND' : 'FOREGROUND'}`);
    console.log(`[Board] 🚨 Card details:`, cards?.map(c => ({ id: c.id?.substring(0, 8), zone: c.zone, type: c.type })) || []);
  }, [cards]);
  
  // Force re-render when real-time updates occur (even in background tabs)
  const [boardRenderKey, setBoardRenderKey] = useState(0);
  
  useEffect(() => {
    if (cardEvents.forceRenderCount > 0) {
      // Force a full component re-render by changing the key
      setBoardRenderKey(prev => prev + 1);
    }
  }, [cardEvents.forceRenderCount]);
  
  // Debug logging for card data source (dev only)
  if (process.env.NODE_ENV === 'development' && cardEvents.registrationStatus === 'rejected') {
    console.log('[Board] SSE Registration Issue:', {
      registrationStatus: cardEvents.registrationStatus,
      hookId: cardEvents.hookId,
      error: cardEvents.error
    });
  }

  const {
    // User data
    allUsers: users,
    currentUser,
    isGuestMode,
    guestUsers,
    sessionTimeRemaining,
    provisionedGuest,
    
    // User management handlers
    handleUserSelect,
    handleCreateUser,
    handleEditUser,
    handleManageUsers,
    handleUserSave,
    handleUserDelete,
    
    // Guest-specific
    updateGuestPreferences,
    
    // Dialog state
    userProfileOpen,
    setUserProfileOpen,
    userProfileMode,
    editingUser,
  } = useUserManagement();

  return (
    <>
      <BoardInner
        cards={cards}
        loading={loading}
        error={error}
        createCard={createCard}
        updateCard={updateCard}
        deleteCard={deleteCard}
        getCardsByZone={getCardsByZone}
        refreshCards={refreshCards}
        users={users}
        currentUser={currentUser}
        onUserSelect={handleUserSelect}
        onCreateUser={handleCreateUser}
        onEditUser={handleEditUser}
        onManageUsers={handleManageUsers}
        boardRenderKey={boardRenderKey}
        // Guest mode props
        isGuestMode={isGuestMode}
        sessionTimeRemaining={sessionTimeRemaining}
        guestCount={guestUsers?.length || 0}
        updateGuestPreferences={updateGuestPreferences}
        provisionedGuest={provisionedGuest}
      />

      {/* User Profile Dialog */}
      <UserProfileDialog
        open={userProfileOpen}
        onOpenChange={setUserProfileOpen}
        user={editingUser}
        users={users}
        currentUserId={currentUser?.id}
        cards={cards}
        mode={userProfileMode}
        onUserSave={handleUserSave}
        onUserDelete={handleUserDelete}
      />
    </>
  );
}

export { Board };