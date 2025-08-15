'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { getEventConfig } from '@/lib/utils/timelineConstants';
import { formatTime } from '@/lib/utils/timelineFormatters';
import { getEventSummary, getPayloadDetails } from '@/lib/utils/timelineEvents';



export function TimelineNode({ event, isLeft = false, showTime = true }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const eventConfig = getEventConfig(event.type);
  
  const Icon = eventConfig.icon;
  const summary = getEventSummary(event);
  const payloadDetails = getPayloadDetails(event);

  return (
    <div className="relative group">
      {/* Animated entrance and hover effects */}
      <Card 
        className={`${eventConfig.bgClass} transition-all duration-300 ease-out cursor-pointer transform hover:scale-105 hover:shadow-lg hover:-translate-y-1 ${
          isLeft ? 'text-right animate-slide-in-right' : 'text-left animate-slide-in-left'
        } ${isHovered ? 'ring-2 ring-opacity-50 ring-' + eventConfig.color + '-300 dark:ring-' + eventConfig.color + '-600' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <CardHeader className="pb-2">
          <div className={`flex items-center gap-2 ${isLeft ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`p-1.5 rounded-full ${eventConfig.bgClass} transition-all duration-200 group-hover:scale-110 group-hover:shadow-md`}>
              <Icon className={`w-4 h-4 ${eventConfig.iconClass} transition-transform duration-200 group-hover:scale-110`} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                {eventConfig.label}
              </h4>
              {showTime && (
                <div className={`flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5 ${
                  isLeft ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(event.at)}</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {summary}
          </p>
          
          {/* Basic payload info */}
          {event.payload?.id && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              ID: <span className="font-mono">{event.payload.id.slice(0, 8)}...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced hover tooltip with animations */}
      {isHovered && payloadDetails.length > 0 && (
        <div className={`absolute z-20 ${
          isLeft ? 'right-full mr-4' : 'left-full ml-4'
        } top-0 w-72 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-xl p-4 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 animate-fade-in-scale`}>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Event Details
          </div>
          
          <div className="space-y-1.5">
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
            
            {payloadDetails.map(({ key, value }) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-32" title={value}>
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
          <div className={`absolute top-4 ${
            isLeft ? 'right-0 translate-x-full' : 'left-0 -translate-x-full'
          } w-0 h-0 border-t-4 border-b-4 ${
            isLeft 
              ? 'border-l-4 border-l-white dark:border-l-gray-800' 
              : 'border-r-4 border-r-white dark:border-r-gray-800'
          } border-t-transparent border-b-transparent`} />
        </div>
      )}
    </div>
  );
}
