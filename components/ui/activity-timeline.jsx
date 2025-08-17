/**
 * ActivityTimeline Component
 * Real-time event feed with filtering capabilities
 */

'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Activity,
  Filter,
  Clock,
  User,
  MapPin,
  Hash,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  SESSION_EVENT_LABELS,
  EVENT_CATEGORIES,
  EVENT_TYPE_CATEGORY_MAP,
} from '@/lib/utils/session-constants';
import { THEME } from '@/lib/utils/ui-constants';

// Category colors
const CATEGORY_COLORS = {
  navigation: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
  board: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30',
  ui: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
  tests: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30',
  session: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30',
  settings: 'text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30',
  custom: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30',
};

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  
  // If today, show time only
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
    });
  }
  
  // Otherwise show date and time
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function EventItem({ event, users = [] }) {
  const category = event.category || EVENT_TYPE_CATEGORY_MAP[event.type] || 'custom';
  const label = SESSION_EVENT_LABELS[event.type] || event.type;
  const user = users.find(u => u.id === event.userId || u.id === event.metadata?.userId);
  
  return (
    <div className={cn(
      "p-3 rounded-lg border",
      THEME.colors.background.secondary,
      THEME.colors.border.primary,
      "hover:shadow-sm transition-shadow"
    )}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-1">
          {/* Event Label & Category */}
          <div className="flex items-center gap-2">
            <span className={cn("font-medium text-sm", THEME.colors.text.primary)}>
              {label}
            </span>
            <span className={cn(
              "text-xs px-1.5 py-0.5 rounded",
              CATEGORY_COLORS[category]
            )}>
              {category}
            </span>
          </div>
          
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {user && (
              <span className={cn("flex items-center gap-1", THEME.colors.text.secondary)}>
                <User className="w-3 h-3" />
                {user.name}
              </span>
            )}
            {event.metadata?.route && (
              <span className={cn("flex items-center gap-1", THEME.colors.text.secondary)}>
                <MapPin className="w-3 h-3" />
                {event.metadata.route}
              </span>
            )}
            {event.sessionId && (
              <span className={cn("flex items-center gap-1 font-mono", THEME.colors.text.tertiary)}>
                <Hash className="w-3 h-3" />
                {event.sessionId.slice(0, 8)}
              </span>
            )}
          </div>
          
          {/* Additional metadata */}
          {event.metadata && Object.keys(event.metadata).length > 0 && (
            <div className={cn("text-xs", THEME.colors.text.tertiary, "mt-1")}>
              {Object.entries(event.metadata)
                .filter(([key]) => !['route', 'userId', 'sessionId', 'simulated'].includes(key))
                .slice(0, 3)
                .map(([key, value]) => (
                  <span key={key} className="mr-2">
                    {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                ))}
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <span className={cn("text-xs whitespace-nowrap", THEME.colors.text.tertiary)}>
          <Clock className="w-3 h-3 inline mr-1" />
          {formatTimestamp(event.timestamp)}
        </span>
      </div>
    </div>
  );
}

export function ActivityTimeline({
  events = [],
  users = [],
  maxItems = 50,
  autoScroll = true,
  onRefresh,
  className,
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const timelineRef = useRef(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);

  // Filter events by category and ensure unique IDs
  const filteredEvents = useMemo(() => {
    // First, deduplicate events by ID
    const uniqueEvents = [];
    const seenIds = new Set();
    
    for (const event of events) {
      // Ensure event has an ID, generate one if missing
      const eventId = event.id || `fallback-${event.timestamp}-${event.type}`;
      if (!seenIds.has(eventId)) {
        seenIds.add(eventId);
        uniqueEvents.push({ ...event, id: eventId });
      }
    }
    
    if (selectedCategory === 'all') {
      return uniqueEvents.slice(0, maxItems);
    }
    return uniqueEvents
      .filter(event => {
        const category = event.category || EVENT_TYPE_CATEGORY_MAP[event.type] || 'custom';
        return category === selectedCategory;
      })
      .slice(0, maxItems);
  }, [events, selectedCategory, maxItems]);

  // Count events by category
  const categoryCounts = useMemo(() => {
    const counts = { all: events.length };
    
    Object.values(EVENT_CATEGORIES).forEach(category => {
      counts[category] = 0;
    });
    
    events.forEach(event => {
      const category = event.category || EVENT_TYPE_CATEGORY_MAP[event.type] || 'custom';
      counts[category] = (counts[category] || 0) + 1;
    });
    
    return counts;
  }, [events]);

  // Auto-scroll to top when new events arrive (if not user scrolling)
  useEffect(() => {
    if (autoScroll && !isUserScrolling && timelineRef.current && filteredEvents.length > 0) {
      timelineRef.current.scrollTop = 0;
    }
  }, [filteredEvents, autoScroll, isUserScrolling]);

  // Handle user scroll
  const handleScroll = () => {
    setIsUserScrolling(true);
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Set new timeout to re-enable auto-scroll
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 3000); // Re-enable auto-scroll after 3 seconds of no scrolling
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className={cn(
        "p-3 border-b flex items-center justify-between",
        THEME.colors.border.primary,
        THEME.colors.background.secondary
      )}>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4" />
          <span className={cn("font-semibold", THEME.colors.text.primary)}>
            Activity Timeline
          </span>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full",
            THEME.colors.background.tertiary,
            THEME.colors.text.secondary
          )}>
            {filteredEvents.length} events
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Filter Button */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="h-7"
            >
              <Filter className="w-3 h-3 mr-1" />
              {selectedCategory === 'all' ? 'All' : selectedCategory}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
            
            {/* Filter Dropdown */}
            {isFilterOpen && (
              <div className={cn(
                "absolute right-0 top-8 z-50 min-w-[150px]",
                "rounded-md border shadow-lg",
                THEME.colors.background.secondary,
                THEME.colors.border.primary
              )}>
                <div className="p-1">
                  <button
                    className={cn(
                      "w-full text-left px-2 py-1.5 text-sm rounded",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      selectedCategory === 'all' && "bg-gray-100 dark:bg-gray-800"
                    )}
                    onClick={() => {
                      setSelectedCategory('all');
                      setIsFilterOpen(false);
                    }}
                  >
                    All ({categoryCounts.all})
                  </button>
                  {Object.entries(EVENT_CATEGORIES).map(([key, value]) => (
                    <button
                      key={key}
                      className={cn(
                        "w-full text-left px-2 py-1.5 text-sm rounded",
                        "hover:bg-gray-100 dark:hover:bg-gray-800",
                        selectedCategory === value && "bg-gray-100 dark:bg-gray-800"
                      )}
                      onClick={() => {
                        setSelectedCategory(value);
                        setIsFilterOpen(false);
                      }}
                    >
                      <span className="capitalize">{value}</span>
                      <span className="ml-1 opacity-60">
                        ({categoryCounts[value] || 0})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Refresh Button */}
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-7"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Timeline */}
      <div 
        ref={timelineRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 space-y-2"
      >
        {filteredEvents.length === 0 ? (
          <div className={cn(
            "text-center py-8",
            THEME.colors.text.tertiary
          )}>
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No events yet</p>
            <p className="text-xs mt-1">Events will appear here as users interact with the app</p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <EventItem 
              key={event.id} 
              event={event} 
              users={users}
            />
          ))
        )}
      </div>
    </div>
  );
}