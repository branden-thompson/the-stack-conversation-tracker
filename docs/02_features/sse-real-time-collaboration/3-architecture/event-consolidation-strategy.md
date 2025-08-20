# Event Consolidation Strategy - SSE Implementation

**CLASSIFICATION**: APPLICATION LEVEL | SEV-0 | PLAN-SOP Phase 2  
**STRATEGY DATE**: 2025-08-20  
**ELEVATED RIGOR**: Comprehensive event system unification  

## 🎯 EVENT SYSTEM CONSOLIDATION OVERVIEW

### **Current State: 5 Separate Event Systems**
```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ GlobalSession   │  │ SessionTracker  │  │ React Query     │
│ Provider        │  │ Service         │  │ Polling         │
│                 │  │                 │  │                 │
│ User Sessions   │  │ Activity Track  │  │ Data Fetching   │
│ Session Events  │  │ Event Batching  │  │ Cache Invalid.  │
└─────────────────┘  └─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│ Button Tracking │  │ Conversation    │
│ System          │  │ Event Bridge    │
│                 │  │                 │
│ UI Interactions │  │ Cross-System    │
│ Analytics       │  │ Coordination    │
└─────────────────┘  └─────────────────┘
```

### **Target State: Unified SSE Hub**
```
                    ┌─────────────────────────────────┐
                    │        CENTRAL SSE HUB         │
                    │      /api/sse/events           │
                    │                                 │
                    │ ┌─────────┐ ┌─────────┐ ┌──────┐│
                    │ │Session  │ │Card     │ │UI    ││
                    │ │Events   │ │Events   │ │Events││
                    │ └─────────┘ └─────────┘ └──────┘│
                    └─────────────────────────────────┘
                                    │
                        ┌───────────┼───────────┐
                        ▼           ▼           ▼
                ┌─────────────┐ ┌─────────┐ ┌─────────┐
                │All Clients  │ │Server   │ │Analytics│
                │(Real-time)  │ │Systems  │ │Systems  │
                └─────────────┘ └─────────┘ └─────────┘
```

## 📋 MIGRATION STRATEGY BY SYSTEM

### **1. GlobalSessionProvider Integration**

#### **Current Event Types**
```typescript
// Current GlobalSessionProvider events
SESSION_EVENT_TYPES = {
  SESSION_STARTED: 'session.started',
  SESSION_ENDED: 'session.ended', 
  USER_ACTIVITY: 'session.activity',
  PREFERENCE_CHANGED: 'preference.changed'
}
```

#### **SSE Hub Integration**
```typescript
// Modified GlobalSessionProvider with SSE
export function GlobalSessionProvider({ children }) {
  const { emitToSSE } = useSSEHub();
  
  const initializeSession = useCallback(async (user) => {
    const session = await createSession(user);
    
    // Emit to SSE Hub instead of local subscribers
    await emitToSSE({
      eventType: 'session.started',
      eventData: { sessionId: session.id, userId: user.id },
      persistence: true,
      broadcast: true
    });
    
    setCurrentSession(session);
  }, [emitToSSE]);
}
```

#### **Migration Steps**
1. **Phase 1**: Add SSE emission alongside existing events
2. **Phase 2**: Validate SSE events match existing behavior
3. **Phase 3**: Remove local event subscription system
4. **Phase 4**: Rely solely on SSE for session events

### **2. SessionTracker Service Consolidation**

#### **Current Architecture Analysis**
```typescript
// Current SessionTracker with local subscribers
class SessionTracker {
  private subscribers = new Set();
  private eventQueue = [];
  
  emit(eventType, data) {
    // Local event distribution
    this.subscribers.forEach(callback => callback(eventType, data));
  }
}
```

#### **SSE Hub Integration**
```typescript
// Modified SessionTracker with SSE Hub
class SessionTracker {
  private sseHub: SSEHubClient;
  
  async emit(eventType: string, data: object) {
    // Route all events through SSE Hub
    await this.sseHub.emit({
      eventType: `session.${eventType}`,
      eventData: data,
      sessionId: this.currentSession?.id,
      userId: this.currentUserId,
      persistence: EVENT_REGISTRY[eventType]?.persistence || false
    });
  }
  
  // Remove local subscriber system
  // All components will subscribe to SSE events instead
}
```

#### **Event Batching Strategy**
```typescript
class SSEEventBatcher {
  private batchWindow = 50; // 50ms batching window
  private pendingEvents: Map<string, BaseEvent> = new Map();
  private batchTimer: NodeJS.Timeout | null = null;
  
  batchEvent(event: BaseEvent) {
    // Deduplicate events by key (e.g., same card update)
    const eventKey = `${event.eventType}:${event.eventData.cardId || 'global'}`;
    this.pendingEvents.set(eventKey, event);
    
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => this.flushBatch(), this.batchWindow);
    }
  }
  
  private async flushBatch() {
    const events = Array.from(this.pendingEvents.values());
    this.pendingEvents.clear();
    this.batchTimer = null;
    
    await this.sseHub.emitBatch(events);
  }
}
```

### **3. React Query Polling Elimination**

#### **Current Polling Configuration**
```typescript
// Current React Query polling intervals
const QUERY_CONFIG = {
  staleTime: {
    cards: 30000,    // 30 second staleness
    users: 300000,   // 5 minute staleness
    sessions: 60000  // 1 minute staleness
  },
  refetchInterval: {
    cards: 30000,    // Poll every 30 seconds
    users: 300000,   // Poll every 5 minutes
    sessions: 60000  // Poll every 1 minute
  }
};
```

#### **SSE-Driven Cache Invalidation**
```typescript
// SSE-driven React Query updates
class SSEQueryManager {
  private queryClient: QueryClient;
  
  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
    this.setupSSEHandlers();
  }
  
  private setupSSEHandlers() {
    // Card events update React Query cache directly
    SSEHub.on('card.created', (event) => {
      this.queryClient.setQueryData(['cards'], (oldData) => {
        return [...(oldData || []), event.eventData];
      });
    });
    
    SSEHub.on('card.updated', (event) => {
      this.queryClient.setQueryData(['cards'], (oldData) => {
        return oldData?.map(card => 
          card.id === event.eventData.cardId 
            ? { ...card, ...event.eventData.updates }
            : card
        );
      });
    });
    
    SSEHub.on('card.deleted', (event) => {
      this.queryClient.setQueryData(['cards'], (oldData) => {
        return oldData?.filter(card => card.id !== event.eventData.cardId);
      });
    });
  }
}
```

#### **Polling Elimination Timeline**
```typescript
// Progressive polling elimination
const POLLING_ELIMINATION_PHASES = {
  Phase1: {
    // Keep polling as fallback, add SSE updates
    cards: { polling: true, sse: true },
    users: { polling: true, sse: true },
    sessions: { polling: true, sse: true }
  },
  Phase2: {
    // Reduce polling frequency, rely primarily on SSE
    cards: { polling: '2min', sse: true },
    users: { polling: '10min', sse: true },
    sessions: { polling: '5min', sse: true }
  },
  Phase3: {
    // Eliminate polling, SSE only with fallback capability
    cards: { polling: false, sse: true, fallback: true },
    users: { polling: false, sse: true, fallback: true },
    sessions: { polling: false, sse: true, fallback: true }
  }
};
```

### **4. UI Event System Integration**

#### **Button Tracking Consolidation**
```typescript
// Current button tracking system
const useButtonTracking = () => {
  const { emit } = useGlobalSession();
  
  const trackButtonClick = (buttonId, metadata) => {
    emit('ui.buttonClick', { buttonId, ...metadata });
  };
};

// SSE Hub integration
const useButtonTracking = () => {
  const { emitToSSE } = useSSEHub();
  
  const trackButtonClick = async (buttonId, metadata) => {
    await emitToSSE({
      eventType: 'ui.buttonClick',
      eventData: { buttonId, ...metadata },
      persistence: false, // Analytics only
      broadcast: false    // No need to broadcast UI events
    });
  };
};
```

#### **Theme Change Events**
```typescript
// Theme change propagation via SSE
const ThemeProvider = () => {
  const { emitToSSE } = useSSEHub();
  
  const setTheme = async (newTheme) => {
    setCurrentTheme(newTheme);
    
    // Broadcast theme change to all user's tabs
    await emitToSSE({
      eventType: 'ui.themeChanged',
      eventData: { theme: newTheme },
      persistence: true,  // Save for session restoration
      broadcast: true     // Update all tabs immediately
    });
  };
};
```

### **5. Conversation Event Bridge Replacement**

#### **Current Cross-System Coordination**
```typescript
// Current conversation-session bridge
class ConversationSessionBridge {
  private sessionTracker: SessionTracker;
  private conversationAPI: ConversationAPI;
  
  async logCardEvent(conversationId, eventType, data) {
    // Coordinate between two systems
    await this.conversationAPI.logEvent(conversationId, eventType, data);
    this.sessionTracker.emit('card.event', { eventType, data });
  }
}
```

#### **SSE Hub Unified Coordination**
```typescript
// SSE Hub handles all coordination
class UnifiedEventCoordinator {
  async logCardEvent(conversationId, eventType, cardData) {
    // Single event emission handles all coordination
    await SSEHub.emit({
      eventType: `card.${eventType}`,
      eventData: {
        conversationId,
        cardId: cardData.id,
        cardData
      },
      persistence: true,
      broadcast: true,
      routes: ['session-tracker', 'conversation-api', 'analytics']
    });
  }
}
```

## 🔄 EVENT FLOW TRANSFORMATION

### **Before: Multiple Event Paths**
```
User Action → Local Handler → Multiple Systems:
    ├── GlobalSessionProvider.emit()
    ├── SessionTracker.emit()
    ├── React Query invalidation
    ├── Button tracking
    └── Conversation API
```

### **After: Unified SSE Flow**
```
User Action → Local Optimistic Update → SSE Hub → Broadcast → All Systems
    ↓
Immediate UI Response (optimistic)
    ↓
SSE Event Confirmation → UI Validation/Rollback if needed
```

## 📊 PERFORMANCE OPTIMIZATION STRATEGIES

### **Event Deduplication**
```typescript
class EventDeduplicator {
  private recentEvents = new Map<string, number>();
  private dedupeWindow = 100; // 100ms deduplication window
  
  isDuplicate(event: BaseEvent): boolean {
    const eventKey = `${event.eventType}:${event.eventData.cardId}:${event.userId}`;
    const lastSeen = this.recentEvents.get(eventKey);
    
    if (lastSeen && (Date.now() - lastSeen) < this.dedupeWindow) {
      return true;
    }
    
    this.recentEvents.set(eventKey, Date.now());
    return false;
  }
}
```

### **Priority Event Queuing**
```typescript
enum EventPriority {
  CRITICAL = 0,   // Data integrity events
  HIGH = 1,       // User actions
  NORMAL = 2,     // UI updates
  LOW = 3         // Analytics
}

class PriorityEventQueue {
  private queues = new Array(4).fill(null).map(() => []);
  
  enqueue(event: BaseEvent, priority: EventPriority) {
    this.queues[priority].push(event);
  }
  
  dequeue(): BaseEvent | null {
    for (let i = 0; i < this.queues.length; i++) {
      if (this.queues[i].length > 0) {
        return this.queues[i].shift();
      }
    }
    return null;
  }
}
```

### **Bandwidth Optimization**
```typescript
// Event compression for large payloads
class EventCompressor {
  compress(event: BaseEvent): BaseEvent {
    if (JSON.stringify(event).length > 1024) { // 1KB threshold
      return {
        ...event,
        eventData: this.compressData(event.eventData),
        compressed: true
      };
    }
    return event;
  }
  
  private compressData(data: object): string {
    return LZString.compress(JSON.stringify(data));
  }
}
```

## 🚨 SAFETY CONTROLS FOR CONSOLIDATION

### **Migration Safety Switches**
```typescript
// Feature flags for gradual migration
const CONSOLIDATION_FLAGS = {
  SSE_SESSION_EVENTS: false,     // Session events via SSE
  SSE_CARD_EVENTS: false,        // Card events via SSE
  SSE_UI_EVENTS: false,          // UI events via SSE
  POLLING_DISABLED: false,       // React Query polling off
  LEGACY_EVENTS_DISABLED: false  // Old event systems off
};

// Progressive enablement with monitoring
class ConsolidationController {
  enablePhase(phase: number) {
    switch(phase) {
      case 1:
        CONSOLIDATION_FLAGS.SSE_SESSION_EVENTS = true;
        break;
      case 2:
        CONSOLIDATION_FLAGS.SSE_CARD_EVENTS = true;
        break;
      case 3:
        CONSOLIDATION_FLAGS.SSE_UI_EVENTS = true;
        break;
      case 4:
        CONSOLIDATION_FLAGS.POLLING_DISABLED = true;
        break;
      case 5:
        CONSOLIDATION_FLAGS.LEGACY_EVENTS_DISABLED = true;
        break;
    }
    this.monitorPhaseHealth(phase);
  }
}
```

### **Rollback Procedures**
```typescript
class ConsolidationRollback {
  async emergencyRollback(reason: string) {
    console.error(`Emergency rollback triggered: ${reason}`);
    
    // Immediately re-enable all legacy systems
    CONSOLIDATION_FLAGS.SSE_SESSION_EVENTS = false;
    CONSOLIDATION_FLAGS.SSE_CARD_EVENTS = false;
    CONSOLIDATION_FLAGS.SSE_UI_EVENTS = false;
    CONSOLIDATION_FLAGS.POLLING_DISABLED = false;
    CONSOLIDATION_FLAGS.LEGACY_EVENTS_DISABLED = false;
    
    // Re-enable React Query polling
    this.reactivatePolling();
    
    // Clear SSE connections
    this.disconnectAllSSE();
    
    this.reportRollback(reason);
  }
}
```

---

**🎯 PLAN-SOP PHASE 2 COMPLETE**: Event Consolidation Strategy Defined

**Next Phase**: Safety Controls and Implementation Planning

*Comprehensive Event System Unification Strategy Complete*