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
        <div className="text-center text-gray-500 dark:text-gray-400 animate-fade-in">
          <div className="relative mb-6">
            <MessageCircle className="w-20 h-20 mx-auto opacity-30 animate-pulse" />
            <div className="absolute inset-0 w-20 h-20 mx-auto border-2 border-gray-300 dark:border-gray-600 rounded-full animate-ping opacity-20"></div>
          </div>
          <h3 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">Welcome to Timeline Explorer</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-2">Visualize your conversation journey</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">Select a conversation from the dropdown above to begin</p>
        </div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500 dark:text-gray-400 animate-fade-in">
          <div className="relative mb-6">
            <Clock className="w-20 h-20 mx-auto opacity-30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full animate-bounce"></div>
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">Timeline is Empty</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-2">This conversation doesn't have any recorded events yet</p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4 max-w-md mx-auto">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              💡 Events are automatically created when you add, move, or update cards in the conversation board
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Enhanced Conversation Header */}
      <div className="mb-12 text-center animate-fade-in">
        <div className="relative mb-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-3">
            {conversation.name}
          </h2>
          {/* Decorative underline */}
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full mx-auto opacity-60" />
        </div>
        
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-full">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-gray-700 dark:text-gray-300">Created {formatDate(conversation.createdAt)}</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-full">
            <MessageCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-gray-700 dark:text-gray-300">{events.length} events</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-full">
            <div className="relative">
              <span className={`w-3 h-3 rounded-full flex ${
                conversation.status === 'active' ? 'bg-green-500' :
                conversation.status === 'paused' ? 'bg-yellow-500' :
                'bg-gray-500'
              }`} />
              {conversation.status === 'active' && (
                <span className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-40" />
              )}
            </div>
            <span className="text-gray-700 dark:text-gray-300 capitalize font-medium">{conversation.status}</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Central timeline line with animated progress */}
        <div className="absolute left-1/2 transform -translate-x-0.5 w-1 bg-gradient-to-b from-blue-200 via-blue-300 to-blue-200 dark:from-blue-800 dark:via-blue-700 dark:to-blue-800 top-0 bottom-0 rounded-full">
          {/* Animated progress indicator */}
          <div className="absolute inset-0 w-full bg-gradient-to-b from-blue-400 to-blue-600 rounded-full opacity-60 animate-pulse" />
          {/* Flowing light effect */}
          <div className="absolute inset-0 w-full">
            <div className="w-full h-8 bg-gradient-to-b from-transparent via-blue-300 to-transparent rounded-full animate-bounce-subtle" />
          </div>
        </div>
        
        {/* Events grouped by date */}
        {Array.from(eventsByDate.entries()).map(([dateString, dayEvents], dateIndex) => (
          <div key={dateString} className="mb-12">
            {/* Date separator with enhanced styling */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative z-20 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-lg backdrop-blur-sm animate-fade-in">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full" />
                <span className="relative">{formatDate(dayEvents[0].at)}</span>
              </div>
            </div>
            
            {/* Events for this date */}
            {dayEvents.map((event, eventIndex) => {
              const globalIndex = events.indexOf(event);
              const previousEvent = globalIndex > 0 ? events[globalIndex - 1] : null;
              const isLeft = eventIndex % 2 === 1;
              
              return (
                <div key={event.id} className="relative mb-8">
                  {/* Enhanced time gap indicator */}
                  {previousEvent && (
                    <div className="flex items-center justify-center mb-4">
                      <div className="relative">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-300 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm">
                          <Clock className="inline w-3 h-3 mr-1 opacity-60" />
                          +{getTimeBetweenEvents(event, previousEvent)}
                        </div>
                        {/* Subtle connecting lines */}
                        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent -z-10" />
                      </div>
                    </div>
                  )}
                  
                  {/* Timeline node */}
                  <div className={`flex ${isLeft ? 'justify-end pr-16' : 'justify-start pl-16'}`}>
                    <div className="w-full max-w-md">
                      <TimelineNode
                        event={event}
                        isLeft={isLeft}
                        showTime={true}
                      />
                    </div>
                  </div>
                  
                  {/* Enhanced central dot with animation */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2">
                    <div className="relative">
                      {/* Pulsing ring effect */}
                      <div className="absolute inset-0 w-6 h-6 -translate-x-1 -translate-y-1 border-2 border-blue-400 dark:border-blue-300 rounded-full animate-ping opacity-40" />
                      {/* Main dot */}
                      <div className="w-4 h-4 bg-white dark:bg-gray-800 border-2 border-blue-500 dark:border-blue-400 rounded-full shadow-lg relative z-10 transition-all duration-300 hover:scale-125 hover:shadow-xl" />
                      {/* Inner glow */}
                      <div className="absolute inset-1 w-2 h-2 bg-blue-400 dark:bg-blue-300 rounded-full animate-pulse" />
                    </div>
                  </div>
                  
                </div>
              );
            })}
          </div>
        ))}
        
        {/* Enhanced timeline end indicator */}
        <div className="flex items-center justify-center">
          <div className="relative">
            {/* Outer glow ring */}
            <div className="absolute inset-0 w-8 h-8 -translate-x-1 -translate-y-1 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full animate-ping opacity-30" />
            {/* Main end indicator */}
            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full shadow-xl flex items-center justify-center relative z-10 animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
            </div>
            {/* Success indicator glow */}
            <div className="absolute inset-0.5 w-5 h-5 bg-gradient-to-br from-emerald-300 to-blue-400 rounded-full opacity-20 animate-bounce-subtle" />
          </div>
        </div>
      </div>
    </div>
  );
}
