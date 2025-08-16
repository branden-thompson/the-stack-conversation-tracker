/**
 * Board Component (LK.G + Left Tray + Conversation Controls + Conversations API wiring)
 */

'use client';

import { useState, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BoardCanvas } from './BoardCanvas';
import { CardDialog } from './CardDialog';
import { HelpDialog } from './HelpDialog';
import { UserProfileDialog } from '@/components/ui/user-profile-dialog';
import { useCards } from '@/lib/hooks/useCards';
import { useGuestUsers } from '@/lib/hooks/useGuestUsers';
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts';
import { useConversationControls } from '@/lib/hooks/useConversationControls';
import { CARD_TYPES } from '@/lib/utils/constants';
import { LeftTray } from '@/components/ui/left-tray';
import { AppHeader } from '@/components/ui/app-header';



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

  // Conversation controls and state
  const conversationControls = useConversationControls();
  const { activeConversation, runtime, onPause, onResumeOrStart, onStop, conversationApi: conv } = conversationControls;

  // Left tray
  const [trayOpen, setTrayOpen] = useState(false);

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
    try {
      if (conv.activeId) {
        await conv.logEvent(conv.activeId, 'card.created', {
          id: newCard?.id,
          type: newCard?.type,
          zone: newCard?.zone,
        });
      }
    } catch {}
  }

  async function handleDelete(id) {
    const card = cards.find(c => c.id === id);
    await deleteCard(id);
    try {
      if (conv.activeId) {
        await conv.logEvent(conv.activeId, 'card.deleted', { id, zone: card?.zone });
      }
    } catch {}
  }

  const wrappedUpdateCard = async (id, updates) => {
    const before = cards.find(c => c.id === id);
    const updated = await updateCard(id, updates);
    try {
      if (!conv.activeId) return updated;

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
    } catch {}
    return updated;
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-600 dark:text-gray-300" />
          <p className="text-gray-600 dark:text-gray-300">Loading conversation board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-red-600">
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
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <AppHeader
          onOpenTray={() => setTrayOpen(true)}
          onOpenHelp={() => setHelpOpen(true)}
          onOpenNewCard={() => setDialogOpen(true)}
          onResetLayout={resetLayout}
          onRefreshCards={refreshCards}
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
          // Guest mode props
          isGuestMode={isGuestMode}
          sessionTimeRemaining={sessionTimeRemaining}
          guestCount={guestCount}
          updateGuestPreferences={updateGuestPreferences}
          provisionedGuest={provisionedGuest}
        />

        {/* Board Canvas */}
        <BoardCanvas
          layoutKey={layoutKey}
          cards={cards}
          getCardsByZone={getCardsByZone}
          onUpdateCard={wrappedUpdateCard}
          onDeleteCard={handleDelete}
          users={users}
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
              }
            } catch {}
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
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [userProfileMode, setUserProfileMode] = useState('create');
  const [editingUser, setEditingUser] = useState(null);

  const {
    cards,
    loading,
    error,
    createCard,
    updateCard,
    deleteCard,
    getCardsByZone,
    refreshCards,
  } = useCards();

  const {
    allUsers: users,
    currentUser,
    switchUser,
    createUser,
    updateUser,
    deleteUser,
    isGuestMode,
    updateGuestUserName,
    updateGuestPreferences,
    createNewGuestUser,
    guestUsers,
    sessionTimeRemaining,
    isCurrentUserGuest,
    provisionedGuest,
  } = useGuestUsers();

  const handleUserSelect = (selectedUser) => {
    console.log('=== BOARD HANDLEUSERSELECT ===');
    console.log('selectedUser received:', selectedUser);
    console.log('Calling switchUser with ID:', selectedUser.id);
    switchUser(selectedUser.id);
  };

  const handleCreateUser = (userData) => {
    // Guests can't create registered users - offer to create another guest or upgrade
    if (isCurrentUserGuest) {
      // For now, just create a new guest user
      createNewGuestUser();
      return;
    }
    
    // Open dialog in create mode for registered users
    setEditingUser(null);
    setUserProfileMode('create');
    setUserProfileOpen(true);
  };

  const handleEditUser = (user) => {
    // Handle guest user name editing differently
    if (user?.isGuest && isCurrentUserGuest && user.id === currentUser?.id) {
      const newName = prompt('Enter new name:', user.name);
      if (newName && newName.trim()) {
        updateGuestUserName(newName.trim());
      }
      return;
    }
    
    // Open dialog in edit mode for registered users
    setEditingUser(user);
    setUserProfileMode('edit');
    setUserProfileOpen(true);
  };

  const handleManageUsers = () => {
    if (isCurrentUserGuest) {
      // Show guest-specific options
      alert('Guest users have limited management capabilities. You can create additional guests or edit your own name.');
      return;
    }
    
    // For registered users, open create dialog - later this could be a dedicated management page
    handleCreateUser();
  };

  const handleUserSave = async (userData, userId) => {
    if (userId) {
      // Update existing user
      await updateUser(userId, userData);
    } else {
      // Create new user
      await createUser(userData);
    }
  };

  const handleUserDelete = async (userId) => {
    await deleteUser(userId);
    // If we deleted the current user, switch to system
    if (userId === currentUser?.id) {
      switchUser('system');
    }
  };

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