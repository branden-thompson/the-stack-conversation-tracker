'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Plus, 
  Clock,
  Info,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { getCardDisplayName, getCardCurrentStatus, getCardLifecycleDuration } from '@/lib/utils/timelineTree';
import { formatTime, formatDuration } from '@/lib/utils/timelineFormatters';
import { timelineTextColors, getStatusBadgeStyles, expansionButtonStyles } from '@/lib/utils/timelineStyles';


// Get status styling - Card creation events should always be green
function getStatusStyling(status) {
  // For card creation events, always use emerald/green styling regardless of current status
  return { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' };
}

export function TreeTimelineNode({ 
  cardBranch, 
  isExpanded = true, 
  onToggleExpand,
  showTime = true,
  isLeft = false
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  const { rootEvent, childEvents } = cardBranch;
  const cardName = getCardDisplayName(rootEvent);
  const status = getCardCurrentStatus(cardBranch);
  const duration = getCardLifecycleDuration(cardBranch);
  const statusStyling = getStatusStyling(status);
  
  const hasChildEvents = childEvents && childEvents.length > 0;

  return (
    <div className="relative">
      {/* Main Card Creation Node */}
      <Card 
        className={`${statusStyling.bg} ${statusStyling.border} transition-all duration-300 ease-out cursor-pointer transform hover:scale-105 hover:shadow-lg hover:-translate-y-1 animate-slide-in-left max-w-sm ${
          isHovered ? 'ring-2 ring-opacity-50 ring-emerald-300 dark:ring-emerald-600' : ''
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => hasChildEvents && onToggleExpand && onToggleExpand()}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            {/* Expand/Collapse indicator */}
            {hasChildEvents && (
              <button 
                className={expansionButtonStyles.base}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand && onToggleExpand();
                }}
              >
                {isExpanded ? (
                  <ChevronDown className={`w-4 h-4 ${timelineTextColors.muted}`} />
                ) : (
                  <ChevronRight className={`w-4 h-4 ${timelineTextColors.muted}`} />
                )}
              </button>
            )}
            
            {/* Card creation icon */}
            <div className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 transition-all duration-200 group-hover:scale-110 group-hover:shadow-md">
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400 transition-transform duration-200 group-hover:scale-110" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold text-sm ${timelineTextColors.primary} truncate`}>
                {cardName}
              </h4>
              
              {showTime && (
                <div className={`flex items-center gap-1 text-xs ${timelineTextColors.subtle} mt-0.5`}>
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(rootEvent.at)}</span>
                </div>
              )}
            </div>
            
            {/* Status badge */}
            <div className={getStatusBadgeStyles(status)}>
              {status}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm">
            <span className={timelineTextColors.secondary}>
              {rootEvent.payload?.type || 'card'} created
            </span>
            
            {hasChildEvents && (
              <span className={`text-xs ${timelineTextColors.subtle}`}>
                {childEvents.length} event{childEvents.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {/* Duration info */}
          {duration && (
            <div className={`mt-2 text-xs ${timelineTextColors.subtle}`}>
              Lifecycle: {formatDuration(duration)}
            </div>
          )}
          
          {/* Basic payload info */}
          {rootEvent.payload?.id && (
            <div className={`mt-2 text-xs ${timelineTextColors.subtle}`}>
              ID: <span className="font-mono">{rootEvent.payload.id.slice(0, 8)}...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced hover tooltip */}
      {isHovered && (
        <div className={`absolute z-20 ${isLeft ? 'right-full mr-8' : 'left-full ml-8'} top-0 w-72 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-xl p-4 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 animate-fade-in-scale`}>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Card Details
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Type:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{rootEvent.type}</span>
            </div>
            
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Created:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {new Date(rootEvent.at).toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Status:</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{status}</span>
            </div>
            
            {rootEvent.payload?.zone && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500 dark:text-gray-400">Initial Zone:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{rootEvent.payload.zone}</span>
              </div>
            )}
          </div>
          
          {/* Description */}
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Card creation event - the beginning of this card's lifecycle in the conversation
            </p>
          </div>
          
          {/* Arrow pointer */}
          <div className={`absolute top-4 ${isLeft ? 'right-0 translate-x-full' : 'left-0 -translate-x-full'} w-0 h-0 border-t-4 border-b-4 ${isLeft ? 'border-l-4 border-l-white dark:border-l-gray-800' : 'border-r-4 border-r-white dark:border-r-gray-800'} border-t-transparent border-b-transparent`} />
        </div>
      )}
    </div>
  );
}