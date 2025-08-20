# SSE Hub-and-Spoke Architecture Design

**CLASSIFICATION**: APPLICATION LEVEL | SEV-0 | PLAN-SOP Phase 1  
**DESIGN DATE**: 2025-08-20  
**ELEVATED RIGOR**: Enhanced architectural validation required  

## 🏛️ CORE ARCHITECTURE OVERVIEW

### **Central SSE Event Hub**
```
┌─────────────────────────────────────────────────────────────┐
│                    CENTRAL SSE HUB                         │
│                 /api/sse/events                            │
├─────────────────────────────────────────────────────────────┤
│  Event Registry │ Connection Pool │ Circuit Breakers       │
│  Event Router   │ Health Monitor  │ Fallback Controller    │
│  Event Store    │ Performance     │ Emergency Controls     │
└─────────────────────────────────────────────────────────────┘
                               │
                    ┌─────────┴─────────┐
                    ▼                   ▼
          ┌─────────────────┐   ┌─────────────────┐
          │   SPOKE CLIENTS │   │ SPOKE CLIENTS   │
          │   Browser Tab 1 │   │ Browser Tab 2-N │
          │                 │   │                 │
          │ SSE Listener    │   │ SSE Listener    │
          │ Event Processor │   │ Event Processor │
          │ State Updater   │   │ State Updater   │
          │ Fallback Handler│   │ Fallback Handler│
          └─────────────────┘   └─────────────────┘
```

### **Event Flow Architecture**
```
User Action → Local State → Event Emission → SSE Hub → Broadcast → All Clients → State Sync
     ↓              ↑                                                    ↓
Optimistic UI ──────┘                                          UI Update ←──┘
     ↓
Rollback on Error ←─── Hub Validation Failure
```

## 🎯 CORE COMPONENTS SPECIFICATION

### **1. Central SSE Event Hub (`/api/sse/events`)**

#### **Hub Responsibilities**
- **Event Reception**: Accept events from all system components
- **Event Validation**: Schema validation and authorization checks
- **Event Broadcasting**: Distribute events to all connected clients
- **Connection Management**: Handle client connections and disconnections
- **Health Monitoring**: Track system performance and connection health

#### **Hub API Interface**
```typescript
// Hub Event Reception
POST /api/sse/events
{
  eventType: string,
  eventData: object,
  sessionId: string,
  userId: string,
  timestamp: number
}

// Client SSE Connection
GET /api/sse/events?sessionId={id}&userId={id}
Content-Type: text/event-stream
```

#### **Event Processing Pipeline**
1. **Reception**: Event received from client or server component
2. **Validation**: Schema and authorization validation
3. **Enrichment**: Add timestamps, routing metadata
4. **Persistence**: Store critical events for replay
5. **Broadcasting**: Send to all subscribed clients
6. **Monitoring**: Track performance and error metrics

### **2. Event Type Registry**

#### **Strongly-Typed Event Schema**
```typescript
interface BaseEvent {
  eventType: string;
  eventId: string;
  sessionId: string;
  userId: string;
  timestamp: number;
  version: string;
}

interface CardEvent extends BaseEvent {
  eventType: 'card.created' | 'card.updated' | 'card.moved' | 'card.deleted';
  eventData: {
    cardId: string;
    cardData?: Partial<Card>;
    zone?: string;
    position?: {x: number, y: number};
  };
}

interface SessionEvent extends BaseEvent {
  eventType: 'session.started' | 'session.ended' | 'session.activity';
  eventData: {
    activityType?: string;
    metadata?: object;
  };
}

interface UIEvent extends BaseEvent {
  eventType: 'ui.dialogOpen' | 'ui.trayOpen' | 'ui.themeChanged';
  eventData: {
    dialogType?: string;
    trayType?: string;
    theme?: string;
  };
}
```

#### **Event Registration System**
```typescript
const EVENT_REGISTRY = {
  'card.created': {
    schema: CardEventSchema,
    persistence: true,
    broadcast: true,
    fallback: 'react-query-invalidate'
  },
  'session.activity': {
    schema: SessionEventSchema,
    persistence: false,
    broadcast: false,
    fallback: 'local-storage'
  },
  'ui.themeChanged': {
    schema: UIEventSchema,
    persistence: true,
    broadcast: true,
    fallback: 'local-storage'
  }
};
```

### **3. Client-Side SSE Consumers**

#### **SSE Connection Manager**
```typescript
class SSEConnectionManager {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  
  async connect(sessionId: string, userId: string) {
    const url = `/api/sse/events?sessionId=${sessionId}&userId=${userId}`;
    this.eventSource = new EventSource(url);
    
    this.eventSource.addEventListener('message', this.handleEvent);
    this.eventSource.addEventListener('error', this.handleError);
    this.eventSource.addEventListener('open', this.handleOpen);
  }
  
  private handleEvent = (event: MessageEvent) => {
    const eventData = JSON.parse(event.data);
    this.processEvent(eventData);
  };
  
  private handleError = () => {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => this.reconnect(), this.reconnectDelay);
    } else {
      this.fallbackToPolling();
    }
  };
}
```

#### **Event Processing System**
```typescript
class EventProcessor {
  private eventHandlers = new Map<string, EventHandler[]>();
  
  registerHandler(eventType: string, handler: EventHandler) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);
  }
  
  async processEvent(event: BaseEvent) {
    const handlers = this.eventHandlers.get(event.eventType) || [];
    
    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`Event handler error for ${event.eventType}:`, error);
        this.reportHandlerError(event, error);
      }
    }
  }
}
```

## 🔒 SAFETY CONTROLS AND CIRCUIT BREAKERS

### **1. Connection Health Monitoring**

#### **Health Check System**
```typescript
class SSEHealthMonitor {
  private lastHeartbeat: number = Date.now();
  private healthCheckInterval: number = 30000; // 30 seconds
  private maxSilentPeriod: number = 60000; // 1 minute
  
  startHealthChecking() {
    setInterval(() => {
      const timeSinceLastHeartbeat = Date.now() - this.lastHeartbeat;
      
      if (timeSinceLastHeartbeat > this.maxSilentPeriod) {
        this.triggerHealthFailure();
      }
    }, this.healthCheckInterval);
  }
  
  private triggerHealthFailure() {
    console.warn('SSE health check failed - activating fallback');
    this.activateFallback();
  }
}
```

#### **Automatic Reconnection Strategy**
- **Progressive Backoff**: 1s, 2s, 4s, 8s, 16s maximum delays
- **Maximum Attempts**: 5 reconnection attempts before fallback
- **Connection Validation**: Heartbeat events every 30 seconds
- **Fallback Activation**: Automatic React Query polling on failure

### **2. Event Queue Protection**

#### **Queue Size Management**
```typescript
class EventQueue {
  private queue: BaseEvent[] = [];
  private maxQueueSize: number = 1000;
  private warningThreshold: number = 800;
  
  enqueue(event: BaseEvent): boolean {
    if (this.queue.length >= this.maxQueueSize) {
      this.handleQueueOverflow();
      return false;
    }
    
    if (this.queue.length >= this.warningThreshold) {
      this.reportQueueWarning();
    }
    
    this.queue.push(event);
    return true;
  }
  
  private handleQueueOverflow() {
    // Remove oldest non-critical events
    this.queue = this.queue.filter(event => event.persistence === true);
    this.reportQueueOverflow();
  }
}
```

### **3. Performance Circuit Breakers**

#### **Latency Monitoring**
```typescript
class PerformanceMonitor {
  private latencyWindow: number[] = [];
  private maxLatency: number = 100; // 100ms requirement
  private windowSize: number = 100;
  
  recordLatency(startTime: number, endTime: number) {
    const latency = endTime - startTime;
    this.latencyWindow.push(latency);
    
    if (this.latencyWindow.length > this.windowSize) {
      this.latencyWindow.shift();
    }
    
    const averageLatency = this.calculateAverage();
    if (averageLatency > this.maxLatency) {
      this.triggerPerformanceFailure();
    }
  }
  
  private triggerPerformanceFailure() {
    console.warn('Performance degradation detected - activating optimizations');
    this.optimizePerformance();
  }
}
```

## 🔄 FALLBACK SYSTEM ARCHITECTURE

### **React Query Polling Fallback**

#### **Automatic Degradation**
```typescript
class FallbackController {
  private fallbackActive: boolean = false;
  private queryClient: QueryClient;
  
  activateFallback(reason: string) {
    if (this.fallbackActive) return;
    
    console.warn(`Activating React Query fallback: ${reason}`);
    this.fallbackActive = true;
    
    // Enable polling for critical queries
    this.queryClient.setQueryDefaults(['cards'], {
      refetchInterval: 5000, // 5 second polling
      refetchOnWindowFocus: true
    });
    
    this.queryClient.setQueryDefaults(['users'], {
      refetchInterval: 30000, // 30 second polling
      refetchOnWindowFocus: true
    });
    
    this.reportFallbackActivation(reason);
  }
  
  async attemptSSEReactivation() {
    if (!this.fallbackActive) return;
    
    try {
      await this.testSSEConnection();
      this.deactivateFallback();
    } catch (error) {
      console.log('SSE still unavailable, maintaining fallback');
    }
  }
}
```

### **Event Persistence and Replay**

#### **Critical Event Storage**
```typescript
interface PersistedEvent {
  eventId: string;
  eventType: string;
  eventData: object;
  timestamp: number;
  processed: boolean;
}

class EventPersistence {
  async storeEvent(event: BaseEvent): Promise<void> {
    if (!EVENT_REGISTRY[event.eventType]?.persistence) return;
    
    await this.database.events.create({
      eventId: event.eventId,
      eventType: event.eventType,
      eventData: event.eventData,
      timestamp: event.timestamp,
      processed: false
    });
  }
  
  async replayEvents(sessionId: string, since: number): Promise<BaseEvent[]> {
    const unprocessedEvents = await this.database.events.findMany({
      where: {
        sessionId,
        timestamp: { gt: since },
        processed: false
      },
      orderBy: { timestamp: 'asc' }
    });
    
    return unprocessedEvents.map(this.deserializeEvent);
  }
}
```

## 📊 PERFORMANCE OPTIMIZATION STRATEGY

### **Connection Pooling**
- **Max Connections**: 30 concurrent SSE connections supported
- **Connection Reuse**: WebSocket pooling for efficiency
- **Resource Monitoring**: Memory and CPU usage tracking
- **Automatic Scaling**: Connection limit adjustment based on performance

### **Event Batching and Debouncing**
- **Batch Window**: 50ms event batching for high-frequency updates
- **Debouncing**: Prevent duplicate events within 100ms window
- **Priority Queuing**: Critical events bypass batching
- **Compression**: Event payload compression for large data

### **Memory Management**
- **Event TTL**: Non-critical events expire after 1 hour
- **Queue Limits**: Maximum 1000 events per client queue
- **Garbage Collection**: Automatic cleanup of processed events
- **Memory Monitoring**: Automatic cleanup on memory pressure

---

**🎯 PLAN-SOP PHASE 1 COMPLETE**: SSE Hub-and-Spoke Architecture Designed

**Next Phase**: Event Consolidation Strategy and Implementation Planning

*Elevated Rigor Architectural Design Complete*