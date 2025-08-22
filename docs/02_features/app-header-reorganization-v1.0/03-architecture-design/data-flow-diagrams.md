# Data Flow & Event Diagrams - App-Header Reorganization v1.0

**🎖️ BRTOPS v1.1.003 DOCUMENTATION**  
**Type**: MAJOR FEATURE LVL-1 SEV-1  
**Project**: App-Header Reorganization for v1.0 Release

## 🔄 DATA FLOW ARCHITECTURE

### Overall Data Flow (Human-Readable)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Board.jsx     │    │   AppHeader     │    │   API Layer     │
│   (Parent)      │    │   Component     │    │   (Backend)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │──── Props ────────────►│                       │
         │    • onClearBoard      │                       │
         │    • onRefreshCards    │                       │
         │    • currentUser       │                       │
         │    • activeConv        │                       │
         │                        │                       │
         │                        │──── API Calls ──────►│
         │                        │    • DELETE /cards   │
         │                        │    • POST /events    │
         │                        │                       │
         │◄──── Callbacks ────────│                       │
         │    • clearBoard()      │◄──── Responses ──────│
         │    • refreshCards()    │    • Success/Error    │
         │    • userSelect()      │    • Updated data     │
         │                        │                       │
         ▼                        ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Updates    │    │   State Changes │    │   Data Storage  │
│   • Card display│    │   • Loading     │    │   • Cards DB    │
│   • User feedback│    │   • Error states│    │   • Events log  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Clear Board Data Flow (Detailed)

```
User Click Clear Board Button
          │
          ▼
┌─────────────────────────────────────┐
│       ClearBoardDialog              │
│   ┌─────────────────────────────┐   │
│   │   Confirmation Dialog       │   │
│   │   • Warning message         │   │
│   │   • [Cancel] [Clear Board]  │   │
│   └─────────────────────────────┘   │
└─────────────────────────────────────┘
          │
          ▼
     User Confirms
          │
          ▼
┌─────────────────────────────────────┐
│       Board.clearBoard()            │
│                                     │
│   1. Get all card IDs               │
│   2. Loop through each card         │
│   3. Call deleteCard(id)            │
│   4. Handle errors per card         │
│   5. Emit bulk_deleted event        │
│   6. Log conversation event         │
└─────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│       API Layer                     │
│                                     │
│   For each card:                    │
│   DELETE /api/cards?id={cardId}     │
│                                     │
│   Event logging:                    │
│   POST /api/conversations/{id}/     │
│        events                       │
└─────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│       Database Updates              │
│                                     │
│   • Remove cards from db.json       │
│   • Add event log entries           │
│   • Update conversation state       │
└─────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────┐
│       UI State Updates              │
│                                     │
│   • Cards array becomes empty       │
│   • Board re-renders                │
│   • Success feedback to user        │
│   • Clear Board button may hide     │
└─────────────────────────────────────┘
```

## 📊 EVENT FLOW ARCHITECTURE

### User Interaction Events (AI-Optimized Format)

```json
{
  "eventFlow": {
    "cardControls": {
      "newCard": {
        "trigger": "Button click",
        "flow": "UI -> Board.handleCreate() -> API -> DB -> UI refresh",
        "events": ["dialogOpen", "card.created"],
        "apiCalls": ["POST /api/cards"],
        "stateChanges": ["dialogOpen: true", "cards: [...cards, newCard]"]
      },
      "refreshCards": {
        "trigger": "Button click", 
        "flow": "UI -> Board.refreshCards() -> API -> State update",
        "events": ["refresh.initiated", "cards.refreshed"],
        "apiCalls": ["GET /api/cards"],
        "stateChanges": ["loading: true", "cards: freshData"]
      },
      "resetLayout": {
        "trigger": "Button click",
        "flow": "UI -> Board.resetLayout() -> Local state",
        "events": ["layout.reset"],
        "apiCalls": [],
        "stateChanges": ["layoutKey: layoutKey + 1"]
      },
      "clearBoard": {
        "trigger": "Dialog confirmation",
        "flow": "Dialog -> Board.clearBoard() -> API (bulk) -> DB -> UI",
        "events": ["bulk_deleted", "board.cleared"],
        "apiCalls": ["DELETE /api/cards (multiple)", "POST /api/conversations/{id}/events"],
        "stateChanges": ["cards: []", "isClearing: false"]
      }
    },
    "conversationControls": {
      "resumeStart": {
        "trigger": "Button click",
        "flow": "UI -> Board.onResumeOrStart() -> Conversation API",
        "events": ["conversation.started", "conversation.resumed"],
        "apiCalls": ["POST /api/conversations/start", "PATCH /api/conversations/{id}/resume"],
        "stateChanges": ["activeConversation: updated"]
      },
      "pause": {
        "trigger": "Button click",
        "flow": "UI -> Board.onPause() -> Conversation API", 
        "events": ["conversation.paused"],
        "apiCalls": ["PATCH /api/conversations/{id}/pause"],
        "stateChanges": ["activeConversation.status: 'paused'"]
      },
      "stop": {
        "trigger": "Button click",
        "flow": "UI -> Board.onStop() -> Conversation API",
        "events": ["conversation.stopped"],
        "apiCalls": ["PATCH /api/conversations/{id}/stop"],
        "stateChanges": ["activeConversation: null"]
      }
    },
    "infoHelp": {
      "infoDialog": {
        "trigger": "Button click",
        "flow": "UI -> Dialog state -> Local component",
        "events": ["dialogOpen"],
        "apiCalls": [],
        "stateChanges": ["infoDialogOpen: true"]
      },
      "helpDialog": {
        "trigger": "Button click", 
        "flow": "UI -> Dialog state -> Local component",
        "events": ["dialogOpen"],
        "apiCalls": [],
        "stateChanges": ["helpOpen: true"]
      }
    },
    "userProfile": {
      "userSelect": {
        "trigger": "Dropdown selection",
        "flow": "UI -> Board.onUserSelect() -> Context update",
        "events": ["user.selected"],
        "apiCalls": [],
        "stateChanges": ["currentUser: selectedUser"]
      },
      "themeChange": {
        "trigger": "Theme selector",
        "flow": "UI -> Theme context -> Local storage",
        "events": ["theme.changed"],
        "apiCalls": ["PATCH /api/users/{id}/preferences"],
        "stateChanges": ["theme: newTheme", "userPreferences: updated"]
      }
    }
  }
}
```

### SSE (Server-Sent Events) Integration Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Side   │    │   SSE Stream    │    │   Server Side   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │──── Connect ─────────►│                       │
         │    SSE endpoint       │◄──── Initialize ─────│
         │                       │     event stream      │
         │                       │                       │
         │                       │                       │
    Card Action                  │                       │
         │                       │                       │
         │──── API Call ────────────────────────────────►│
         │    (Delete cards)     │                       │
         │                       │                       │
         │                       │◄──── Broadcast ──────│
         │                       │     card.deleted      │
         │◄──── Receive ─────────│     events            │
         │    Real-time updates  │                       │
         │                       │                       │
         │                       │◄──── Broadcast ──────│
         │                       │     board.cleared     │
         │◄──── Receive ─────────│     event             │
         │    Bulk update        │                       │
         │                       │                       │
         ▼                       ▼                       ▼
    UI Updates              Event Stream            Database
    • Remove cards          • Live events           • Updated state
    • Update counts         • Real-time sync        • Event logs
```

## 🔀 STATE SYNCHRONIZATION FLOW

### Multi-User State Sync (AI-Optimized)

```json
{
  "stateSyncFlow": {
    "participants": ["User A", "User B", "User C"],
    "syncMechanisms": {
      "sse": {
        "endpoint": "/api/sse/events",
        "events": ["card.created", "card.updated", "card.deleted", "board.cleared"],
        "frequency": "real-time"
      },
      "polling": {
        "endpoint": "/api/cards/events", 
        "fallback": true,
        "frequency": "5000ms"
      }
    },
    "syncScenarios": {
      "clearBoard": {
        "initiator": "User A",
        "action": "Clear Board",
        "propagation": [
          "User A: immediate UI update",
          "SSE broadcast: board.cleared event",
          "User B & C: receive SSE event",
          "User B & C: update local state",
          "User B & C: re-render empty board"
        ],
        "consistency": "eventual"
      },
      "createCard": {
        "initiator": "User B",
        "action": "New Card",
        "propagation": [
          "User B: optimistic UI update",
          "API call: POST /api/cards",
          "SSE broadcast: card.created event", 
          "User A & C: receive SSE event",
          "All users: synchronized state"
        ],
        "consistency": "strong"
      }
    }
  }
}
```

### Error Handling Flow

```
┌─────────────────┐
│   User Action   │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Validation    │
│   • Auth check  │
│   • Input valid │
│   • State ready │
└─────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌─────────┐
│ Success │ │ Failure │
│ Path    │ │ Path    │
└─────────┘ └─────────┘
    │         │
    │         ▼
    │    ┌─────────────────┐
    │    │  Error Handling │
    │    │  • Log error    │
    │    │  • Show message │
    │    │  • Revert state │
    │    │  • Retry option │
    │    └─────────────────┘
    │         │
    ▼         ▼
┌─────────────────┐
│   Final State   │
│   • UI updated  │
│   • Data synced │
│   • User informed│
└─────────────────┘
```

## 📈 PERFORMANCE OPTIMIZATION FLOW

### Render Optimization Strategy

```json
{
  "optimizationFlow": {
    "memoization": {
      "components": ["ClearBoardDialog", "InfoDialog", "ActiveUsersDisplay"],
      "props": "React.memo for stable props",
      "callbacks": "useCallback for event handlers"
    },
    "lazyLoading": {
      "dialogs": "Load on demand",
      "icons": "Tree-shake unused icons",
      "animations": "CSS-based, GPU accelerated"
    },
    "stateManagement": {
      "local": "Component-specific state",
      "context": "Theme and user data",
      "external": "Card data via props"
    },
    "apiOptimization": {
      "batching": "Bulk operations where possible",
      "caching": "Response caching for static data",
      "debouncing": "User input debouncing"
    }
  }
}
```

---

**Document Status**: ✅ Complete  
**Last Updated**: 2025-08-22  
**BRTOPS Compliance**: Enhanced 6-folder structure