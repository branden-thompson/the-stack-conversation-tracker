'use client';

import { useMemo } from 'react';
import { TimelineNode } from './TimelineNode';
import { Clock, Calendar, MessageCircle } from 'lucide-react';

// Format time helper
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
}

// Format date helper  
function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Calculate time between events
function getTimeBetweenEvents(currentEvent, previousEvent) {
  if (!previousEvent) return null;
  
  const diff = currentEvent.at - previousEvent.at;
  if (diff < 60000) { // < 1 minute
    return `${Math.floor(diff / 1000)}s`;
  } else if (diff < 3600000) { // < 1 hour
    return `${Math.floor(diff / 60000)}m`;
  } else {
    return `${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m`;
  }
}

export function ConversationTimeline({ conversation, events }) {
  // Group events by date for better organization
  const eventsByDate = useMemo(() => {
    if (!events || events.length === 0) return new Map();
    
    const grouped = new Map();
    
    events.forEach(event => {
      const date = new Date(event.at).toDateString();
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date).push(event);
    });
    
    return grouped;
  }, [events]);

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-semibold mb-2">No Conversation Selected</p>
          <p>Select a conversation to view its timeline</p>
        </div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-semibold mb-2">No Timeline Events</p>
          <p>This conversation doesn't have any recorded events yet</p>
          <p className="text-sm mt-2">Events are created when cards are added, moved, or updated</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Conversation Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {conversation.name}
        </h2>
        <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>Created {formatDate(conversation.createdAt)}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{events.length} events</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${
              conversation.status === 'active' ? 'bg-green-500' :
              conversation.status === 'paused' ? 'bg-yellow-500' :
              'bg-gray-500'
            }`} />
            <span className="capitalize">{conversation.status}</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Central timeline line */}
        <div className="absolute left-1/2 transform -translate-x-0.5 w-1 bg-gradient-to-b from-blue-200 via-blue-300 to-blue-200 dark:from-blue-800 dark:via-blue-700 dark:to-blue-800 top-0 bottom-0 rounded-full" />
        
        {/* Events grouped by date */}
        {Array.from(eventsByDate.entries()).map(([dateString, dayEvents], dateIndex) => (
          <div key={dateString} className="mb-12">
            {/* Date separator */}
            <div className="flex items-center justify-center mb-8">
              <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm">
                {formatDate(dayEvents[0].at)}
              </div>
            </div>
            
            {/* Events for this date */}
            {dayEvents.map((event, eventIndex) => {
              const globalIndex = events.indexOf(event);
              const previousEvent = globalIndex > 0 ? events[globalIndex - 1] : null;
              const isLeft = eventIndex % 2 === 0;
              
              return (
                <div key={event.id} className="relative mb-8">
                  {/* Time gap indicator */}
                  {previousEvent && (
                    <div className="flex items-center justify-center mb-4">
                      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        +{getTimeBetweenEvents(event, previousEvent)}
                      </div>
                    </div>
                  )}
                  
                  {/* Timeline node */}
                  <div className={`flex ${isLeft ? 'justify-end pr-8' : 'justify-start pl-8'}`}>
                    <div className={`w-full max-w-md ${isLeft ? 'mr-4' : 'ml-4'}`}>
                      <TimelineNode
                        event={event}
                        isLeft={isLeft}
                        showTime={true}
                      />
                    </div>
                  </div>
                  
                  {/* Central dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2">
                    <div className="w-4 h-4 bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 rounded-full shadow-sm" />
                  </div>
                  
                  {/* Connection line */}
                  <div className={`absolute top-1/2 transform -translate-y-0.5 h-0.5 bg-blue-300 dark:bg-blue-600 ${
                    isLeft 
                      ? 'right-1/2 w-8 mr-2' 
                      : 'left-1/2 w-8 ml-2'
                  }`} />
                </div>
              );
            })}
          </div>
        ))}
        
        {/* Timeline end indicator */}
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-lg flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
