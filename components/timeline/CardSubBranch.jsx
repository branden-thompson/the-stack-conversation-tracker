'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { getEventConfig } from '@/lib/utils/timelineConstants';
import { formatTime } from '@/lib/utils/timelineFormatters';
import { getEventSummary, getPayloadDetails } from '@/lib/utils/timelineEvents';
import { timelineCardStyles, microInteractions, getHoverRingStyles, cardDepth, getStaggeredDelay } from '@/lib/utils/timelineStyles';



export function CardSubBranch({ 
  events, 
  isVisible = true,
  branchLevel = 0,
  showTime = true 
}) {
  const [hoveredEventId, setHoveredEventId] = useState(null);

  if (!isVisible || !events || events.length === 0) {
    return null;
  }

  return (
    <div className="relative ml-8 mt-4">
      {/* Connecting line from parent */}
      <div className="absolute left-0 top-0 w-8 h-4 border-l-2 border-b-2 border-gray-400 dark:border-gray-500 rounded-bl-md" />
      
      {/* Vertical line for multiple events */}
      {events.length > 1 && (
        <div className="absolute left-0 top-4 bottom-0 w-px bg-gray-400 dark:bg-gray-500" />
      )}

      <div className="pl-8 space-y-4">
        {events.map((event, index) => {
          const eventConfig = getEventConfig(event.type);
          
          const Icon = eventConfig.icon;
          const summary = getEventSummary(event);
          const payloadDetails = getPayloadDetails(event);
          const isHovered = hoveredEventId === event.id;

          return (
            <div key={event.id} className="relative">
              {/* Branch connector for each sub-event */}
              {events.length > 1 && (
                <div className="absolute left-[-32px] top-4 w-8 h-px bg-gray-400 dark:bg-gray-500" />
              )}

              {/* Enhanced Sub-event card with staggered animation */}
              <Card 
                className={`${eventConfig.bgClass} ${timelineCardStyles.base} hover:shadow-lg hover:-translate-y-1 hover:scale-[1.03] animate-slide-in-right ${
                  isHovered ? getHoverRingStyles(eventConfig.color, true, 'normal') : ''
                } max-w-xs ${microInteractions.magnetic} ${cardDepth.base} hover:${cardDepth.hover}`}
                style={getStaggeredDelay(index, 150)}
                onMouseEnter={() => setHoveredEventId(event.id)}
                onMouseLeave={() => setHoveredEventId(null)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-full ${eventConfig.bgClass} border border-${eventConfig.color}-200 dark:border-${eventConfig.color}-700 transition-all duration-300 hover:scale-125 hover:shadow-md hover:rotate-6 group`}>
                      <Icon className={`w-3 h-3 ${eventConfig.iconClass} transition-all duration-300 group-hover:scale-110`} />
                      <div className={`absolute inset-0 rounded-full bg-${eventConfig.color}-400 dark:bg-${eventConfig.color}-300 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-xs text-gray-900 dark:text-gray-100">
                        {eventConfig.label}
                      </h5>
                      {showTime && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{formatTime(event.at)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    {summary}
                  </p>
                  
                  {/* Basic payload info */}
                  {event.payload?.id && (
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      ID: <span className="font-mono">{event.payload.id.slice(0, 6)}...</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Enhanced hover tooltip */}
              {isHovered && payloadDetails.length > 0 && (
                <div className="absolute z-20 left-full ml-4 top-0 w-64 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 animate-fade-in-scale">
                  <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Event Details
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Type:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">{event.type}</span>
                    </div>
                    
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 dark:text-gray-400">Time:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {new Date(event.at).toLocaleString()}
                      </span>
                    </div>
                    
                    {payloadDetails.slice(0, 3).map(({ key, value }) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-24" title={value}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Description */}
                  <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {eventConfig.description}
                    </p>
                  </div>
                  
                  {/* Arrow pointer */}
                  <div className="absolute top-3 left-0 -translate-x-full w-0 h-0 border-t-2 border-b-2 border-r-2 border-r-white dark:border-r-gray-800 border-t-transparent border-b-transparent" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}