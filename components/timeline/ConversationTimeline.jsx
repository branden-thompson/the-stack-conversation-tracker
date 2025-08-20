'use client';

import { useMemo } from 'react';
import { TimelineNode } from './TimelineNode';
import { TreeTimeline } from './TreeTimeline';
import { Clock, Calendar, MessageCircle, List, TreePine, ChevronDown, ChevronRight } from 'lucide-react';
import { transformEventsToTree } from '@/lib/utils/timelineTree';
import { formatTime, formatDate, getTimeBetweenEvents } from '@/lib/utils/timelineFormatters';
import { useExpansionState } from '@/lib/hooks/useExpansionState';
import { getStatusBadgeStyles, getAccordionStyles, getExpansionButtonStyles, getEmptyStateStyles, getTimelineTextColors } from '@/lib/utils/timelineStyles';
import { useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';


// Accordion List View Component
function AccordionListView({ conversation, events }) {
  // Transform events into tree structure
  const treeData = useMemo(() => {
    return transformEventsToTree(events);
  }, [events]);

  const { cardBranches } = treeData;
  const { isExpanded, toggleItem, expandAll, collapseAll } = useExpansionState();
  
  // Get dynamic theme
  const dynamicTheme = useDynamicAppTheme();
  
  // Get theme-aware styles
  const emptyStyles = getEmptyStateStyles('w-16', dynamicTheme);
  const accordionStyles = getAccordionStyles(dynamicTheme);
  const expansionButtonStyles = getExpansionButtonStyles(dynamicTheme);

  if (cardBranches.length === 0) {
    return (
      <div className={emptyStyles.container}>
        <div className={emptyStyles.content}>
          <div className={emptyStyles.iconWrapper}>
            <List className={emptyStyles.icon} />
          </div>
          <h3 className={emptyStyles.title}>No Cards Found</h3>
          <p className={emptyStyles.subtitle}>This conversation doesn't have any card events to display in list format.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className={accordionStyles.header}>
        <div>Card</div>
        <div>Type</div>
        <div>Status</div>
        <div>Events</div>
        <div>Created</div>
      </div>

      {/* Card Rows */}
      {cardBranches.map((cardBranch) => {
        const cardIsExpanded = isExpanded(cardBranch.cardId);
        // Handle synthetic root events (when no card.created event exists)
        const isSynthetic = cardBranch.rootEvent?.synthetic;
        const cardName = cardBranch.rootEvent.payload?.content?.substring(0, 30) || 
                        `${cardBranch.rootEvent.payload?.type || 'card'} (${cardBranch.cardId.slice(0, 8)})`;
        
        return (
          <div key={cardBranch.cardId} className={accordionStyles.container}>
            {/* Main Row */}
            <div 
              className={accordionStyles.row}
              onClick={() => toggleItem(cardBranch.cardId)}
            >
              <div className="flex items-center gap-2">
                {cardBranch.childEvents.length > 0 && (
                  cardIsExpanded ? 
                    <ChevronDown className="w-4 h-4 text-gray-400" /> : 
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
                <span className={`font-medium ${timelineTextColors.primary} truncate`}>
                  {cardName}
                </span>
              </div>
              <div className={timelineTextColors.muted}>
                {cardBranch.rootEvent.payload?.type || 'unknown'}
              </div>
              <div>
                <span className={getStatusBadgeStyles(
                  cardBranch.childEvents.some(e => e.type === 'card.deleted') ? 'failed' : 'active'
                )}>
                  {cardBranch.childEvents.some(e => e.type === 'card.deleted') ? 'deleted' : 'active'}
                </span>
              </div>
              <div className={timelineTextColors.muted}>
                {cardBranch.childEvents.length + 1} events
              </div>
              <div className={timelineTextColors.muted}>
                {formatTime(cardBranch.rootEvent.at)}
              </div>
            </div>

            {/* Expanded Events */}
            {cardIsExpanded && cardBranch.childEvents.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <div className="p-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Event History</h4>
                  <div className="space-y-2">
                    {cardBranch.childEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            event.type === 'card.moved' ? 'bg-blue-500' :
                            event.type === 'card.updated' ? 'bg-amber-500' :
                            event.type === 'card.deleted' ? 'bg-rose-500' :
                            'bg-gray-500'
                          }`} />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {event.type.replace('card.', '').charAt(0).toUpperCase() + event.type.replace('card.', '').slice(1)}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {event.type === 'card.moved' && event.payload?.from && event.payload?.to && 
                              `${event.payload.from} → ${event.payload.to}`}
                            {event.type === 'card.updated' && event.payload?.fields && 
                              `Updated: ${event.payload.fields.join(', ')}`}
                            {event.type === 'card.deleted' && 'Removed from conversation'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(event.at)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Expand/Collapse All Controls */}
      <div className="flex justify-center gap-4 pt-4">
        <button
          onClick={() => expandAll(cardBranches.map(b => b.cardId))}
          className={expansionButtonStyles.expandAll}
        >
          Expand All
        </button>
        <button
          onClick={collapseAll}
          className={expansionButtonStyles.collapseAll}
        >
          Collapse All
        </button>
      </div>
    </div>
  );
}

export function ConversationTimeline({ conversation, events, viewMode, onViewModeChange }) {

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
    <div className={`${viewMode === 'tree' ? 'max-w-7xl mx-auto' : 'max-w-4xl mx-auto'} p-6`}>
      {/* Conditional Timeline Rendering */}
      {viewMode === 'tree' ? (
        <TreeTimeline conversation={conversation} events={events} />
      ) : (
        <AccordionListView conversation={conversation} events={events} />
      )}
    </div>
  );
}