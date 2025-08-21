# Data & Event Flow Architecture - Technical Reference

## System Architecture Map

### Core Data Structures
```typescript
// Primary entities
interface Card {
  id: string;
  type: 'topic'|'question'|'accusation'|'fact'|'guess'|'opinion';
  content: string;
  zone: 'active'|'completed'|'parked'|'archive';
  position: {x: number, y: number};
  stackOrder: number;
  faceUp: boolean;
  createdByUserId: string;
  assignedToUserId?: string;
  createdAt: number;
  updatedAt: number;
}

interface User {
  id: string;
  name: string;
  profilePicture?: string;
  isGuest: boolean;
  isSystemUser: boolean;
  preferences: {
    theme: string;
    animationsEnabled: boolean;
  };
}

interface Session {
  id: string;
  userId: string;
  startTime: number;
  lastActivity: number;
  events: SessionEvent[];
}
```

### API Route Mapping
```javascript
// /app/api routes with cache behavior
GET    /api/cards           → ReactQuery(cards, staleTime: 30000)
POST   /api/cards           → Invalidates(cards)
PATCH  /api/cards/[id]     → Invalidates(cards, card-${id})
DELETE /api/cards/[id]     → Invalidates(cards)

GET    /api/users           → ReactQuery(users, staleTime: 300000)
POST   /api/users           → Invalidates(users)
PATCH  /api/users/[id]     → Invalidates(users, user-${id})

POST   /api/sessions/events → NoCache, Direct write
GET    /api/sessions/[id]   → ReactQuery(session-${id}, staleTime: 60000)
```

### React Query Cache Keys
```javascript
// Cache key patterns for invalidation targeting
['cards']                          // All cards
['cards', { zone: 'active' }]      // Zone-filtered cards  
['card', cardId]                   // Individual card
['users']                          // All users
['user', userId]                   // Individual user
['session', sessionId]             // Session data
['conversation', conversationId]   // Conversation logs
```

### Event System Architecture
```javascript
// GlobalSessionProvider event emission patterns
const EventTypes = {
  CARD: ['created', 'updated', 'moved', 'deleted'],
  UI: ['dialogOpen', 'trayOpen', 'themeChanged'],
  PREFERENCE: ['animation', 'theme', 'layout'],
  SYSTEM: ['performance', 'error', 'warning']
};

// Event payload structures
{
  type: 'card.created',
  timestamp: number,
  sessionId: string,
  userId: string,
  data: {
    cardId: string,
    cardType: string,
    zone: string
  }
}
```

### Component Data Flow Hierarchy
```javascript
// Component tree with data dependencies
Board
├── BoardInner (cards, users, session state)
│   ├── AppHeader (user management, conversation controls)
│   ├── BoardCanvas (card layout, zone management)
│   │   └── Zone[] (card collections, drag/drop)
│   │       └── ConversationCard[] (individual card state)
│   ├── CardDialog (card creation)
│   ├── HelpDialog (static content)
│   └── LeftTray (navigation, utilities)
└── UserProfileDialog (user CRUD operations)
```

### Hook Dependency Graph
```javascript
// Data flow through custom hooks
useCards() → useQuery(['cards']) → Card CRUD operations
useUserManagement() → useQuery(['users']) → User state + CRUD
useConversationControls() → Conversation API integration
useGlobalSession() → Event emission + session tracking
useButtonTracking() → UI interaction logging
useKeyboardShortcuts() → Keyboard event → Action mapping
useDynamicAppTheme() → Theme context → CSS class generation
```

### Database Schema (Simulated via JSON)
```javascript
// /data/db.json structure
{
  "cards": [
    {
      "id": "uuid-v4",
      "type": "string",
      "content": "string", 
      "zone": "enum",
      "position": {"x": "number", "y": "number"},
      "stackOrder": "number",
      "faceUp": "boolean",
      "createdByUserId": "string",
      "assignedToUserId": "string|null",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ],
  "users": [...],
  "sessions": [...],
  "conversations": [...]
}
```

### React Query Configuration
```javascript
// QueryClient settings for optimal caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,           // 30s default staleness
      cacheTime: 1000 * 60 * 5,  // 5min cache retention
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: 2,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
    },
    mutations: {
      retry: 1,
      onError: (error) => {
        console.error('Mutation failed:', error);
        // Circuit breaker logic here
      }
    }
  }
});
```

### Theme System Implementation
```javascript
// Dynamic theme architecture
const ThemeProvider = () => {
  const [currentTheme, setCurrentTheme] = useState('dark');
  const dynamicTheme = useMemo(() => 
    generateThemeClasses(THEME_DEFINITIONS[currentTheme]), 
    [currentTheme]
  );
  
  return (
    <ThemeContext.Provider value={{dynamicTheme, setCurrentTheme}}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme object structure
{
  colors: {
    background: {
      primary: "bg-white dark:bg-gray-900",
      secondary: "bg-gray-50 dark:bg-gray-800", 
      card: "bg-white dark:bg-gray-800",
      zone: "bg-gray-100 dark:bg-gray-700"
    },
    text: {
      primary: "text-gray-900 dark:text-white",
      secondary: "text-gray-600 dark:text-gray-300"
    },
    border: {
      primary: "border-gray-200 dark:border-gray-600"
    }
  }
}
```

### Performance Monitoring Hooks
```javascript
// Runtime performance tracking
const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    apiResponseTime: [],
    renderTime: [],
    memoryUsage: []
  });
  
  useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.entryType === 'measure') {
          setMetrics(prev => ({
            ...prev,
            [entry.name]: [...prev[entry.name] || [], entry.duration]
          }));
        }
      });
    });
    observer.observe({entryTypes: ['measure']});
    return () => observer.disconnect();
  }, []);
  
  return metrics;
};
```

### Error Boundary Integration
```javascript
// Error handling strategy
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false, errorInfo: null};
  }
  
  static getDerivedStateFromError(error) {
    return {hasError: true};
  }
  
  componentDidCatch(error, errorInfo) {
    // Log to session tracking
    window.globalSession?.emit('system.error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }
}
```

### SSE Implementation ✅ ACTIVE
```javascript
// Active SSE implementation with multi-tab support
const useSSECardEvents = ({
  enabled = true,
  forDevPages = false,
  backgroundOperation = false,
  onCardFlip,
  onCardMove,
  onCardCreate,
  onCardUpdate,
  onCardDelete
}) => {
  const [cards, setCards] = useState([]);
  const [registrationStatus, setRegistrationStatus] = useState('idle');
  const hookId = useRef(`sse-hook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  
  useEffect(() => {
    if (!enabled) return;
    
    // Register with global hook registry for multi-tab coordination
    const registry = getGlobalHookRegistry();
    registry.register(hookId.current, {
      endpoint: '/api/cards/events',
      hook: 'useSSECardEvents',
      forDevPages,
      backgroundOperation
    });
    
    const pollCards = async () => {
      try {
        const response = await fetch('/api/cards/events', {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        const newCards = await response.json();
        
        // Hash-based change detection
        const newHash = JSON.stringify(newCards.map(c => ({ id: c.id, updatedAt: c.updatedAt, zone: c.zone })));
        if (previousHashRef.current !== newHash) {
          setCards(newCards);
          previousHashRef.current = newHash;
          
          // Emit card events to callbacks
          const diff = calculateCardDifferences(cardsRef.current, newCards);
          diff.forEach(change => {
            switch(change.type) {
              case 'created': onCardCreate?.(change); break;
              case 'updated': onCardUpdate?.(change); break;
              case 'moved': onCardMove?.(change); break;
              case 'flipped': onCardFlip?.(change); break;
              case 'deleted': onCardDelete?.(change); break;
            }
          });
        }
      } catch (error) {
        console.error('[SSE] Polling failed:', error);
      }
    };
    
    // Start polling at 800ms intervals for real-time feel
    const interval = setInterval(pollCards, 800);
    pollCards(); // Initial fetch
    
    return () => {
      clearInterval(interval);
      registry.unregister(hookId.current);
    };
  }, [enabled, forDevPages, backgroundOperation]);
  
  return {
    cards,
    registrationStatus,
    isConnected: registrationStatus === 'registered'
  };
};

// Multi-tab coordination registry
class GlobalHookRegistry {
  constructor() {
    this.activeHooks = new Map(); // hookId -> registration
  }
  
  register(hookId, registration) {
    this.activeHooks.set(hookId, {
      ...registration,
      registeredAt: Date.now(),
      lastActivity: Date.now()
    });
  }
  
  unregister(hookId) {
    this.activeHooks.delete(hookId);
  }
  
  getActiveHooks() {
    return Array.from(this.activeHooks.values());
  }
}
```

### SSE Data Flow Architecture
```javascript
// Real-time data propagation pattern
Component → useSSECardEvents → Fetch('/api/cards/events') → Hash Change Detection
    ↓              ↓                       ↓                        ↓
Hook Registry → 800ms Poll → JSON Response → setState(newCards) → UI Re-render
    ↓              ↓                       ↓                        ↓
Multi-tab → Background Tabs → Change Events → Card Callbacks → Event Emission
```

### BoardCanvas SSE Integration
```javascript
// Critical fix: Direct SSE data consumption
export function BoardCanvas({ cards = [], /* other props */ }) {
  return (
    <div>
      {/* FIXED: Use SSE cards directly, not getCardsByZone() */}
      <Zone
        zoneId="active"
        cards={cards.filter(card => card.zone === 'active') || []}
        /* other props */
      />
      <Zone
        zoneId="parking"
        cards={cards.filter(card => card.zone === 'parking') || []}
        /* other props */
      />
      {/* Repeat for all zones */}
    </div>
  );
}

// Board component SSE consumption
export function Board() {
  const cardEvents = useSSECardEvents({
    enabled: true,
    forDevPages: true, // Enable background rendering
    backgroundOperation: true,
    onCardFlip: (event) => console.log('🔄 Card flipped:', event),
    onCardMove: (event) => console.log('↔️ Card moved:', event),
    // ... other callbacks
  });
  
  return (
    <BoardCanvas
      cards={cardEvents.cards} // SSE cards, not REST cards
      /* other props */
    />
  );
}
```

### Memory Management Strategy
```javascript
// Component cleanup patterns
useEffect(() => {
  const cleanup = () => {
    // Clear intervals
    clearInterval(intervalRef.current);
    // Abort fetch requests
    abortControllerRef.current?.abort();
    // Remove event listeners
    document.removeEventListener('click', handleOutsideClick);
    // Clear timeouts
    clearTimeout(timeoutRef.current);
  };
  
  return cleanup;
}, []);
```

### Development vs Production Configurations
```javascript
// Environment-specific settings
const CONFIG = {
  development: {
    apiDelay: 100,        // Simulated network delay
    enablePerformanceMonitoring: true,
    logLevel: 'debug',
    enableHotReload: true
  },
  production: {
    apiDelay: 0,
    enablePerformanceMonitoring: false,
    logLevel: 'error',
    enableHotReload: false
  }
};
```

---

*Technical reference for AI agents working on SSE implementation, performance optimization, and system debugging.*