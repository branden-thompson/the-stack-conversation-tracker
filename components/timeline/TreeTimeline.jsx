'use client';

import { useMemo } from 'react';
import { TreeTimelineNode } from './TreeTimelineNode';
import { CardSubBranch } from './CardSubBranch';
import { Clock, Calendar, MessageCircle, TreePine } from 'lucide-react';
import { transformEventsToTree } from '@/lib/utils/timelineTree';
import { formatDate } from '@/lib/utils/timelineFormatters';
import { useExpansionState } from '@/lib/hooks/useExpansionState';
import { getEmptyStateStyles, timelineTextColors } from '@/lib/utils/timelineStyles';


export function TreeTimeline({ conversation, events }) {
  const { isExpanded, toggleItem } = useExpansionState();

  // Transform events into tree structure
  const treeData = useMemo(() => {
    return transformEventsToTree(events);
  }, [events]);

  const { cardBranches, orphanEvents } = treeData;

  // Group card branches by date for better organization
  const branchesByDate = useMemo(() => {
    if (cardBranches.length === 0) return new Map();
    
    const grouped = new Map();
    
    cardBranches.forEach(branch => {
      const date = new Date(branch.rootEvent.at).toDateString();
      if (!grouped.has(date)) {
        grouped.set(date, []);
      }
      grouped.get(date).push(branch);
    });
    
    return grouped;
  }, [cardBranches]);

  const emptyStyles = getEmptyStateStyles();

  if (!conversation) {
    return (
      <div className={emptyStyles.container}>
        <div className={emptyStyles.content}>
          <div className={emptyStyles.iconWrapper}>
            <TreePine className={emptyStyles.iconWithPulse} />
            <div className={emptyStyles.iconRing}></div>
          </div>
          <h3 className={emptyStyles.title}>Welcome to Tree Timeline</h3>
          <p className={emptyStyles.subtitle}>Visualize your conversation as a branching tree</p>
          <p className={emptyStyles.description}>Select a conversation from the dropdown above to begin</p>
        </div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className={emptyStyles.container}>
        <div className={emptyStyles.content}>
          <div className={emptyStyles.iconWrapper}>
            <TreePine className={emptyStyles.icon} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-8 bg-gradient-to-b from-green-400 to-green-600 rounded-full animate-bounce"></div>
            </div>
          </div>
          <h3 className={emptyStyles.title}>Tree is Empty</h3>
          <p className={emptyStyles.subtitle}>This conversation doesn't have any card events yet</p>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4 max-w-md mx-auto">
            <p className="text-sm text-green-700 dark:text-green-300">
              🌳 Cards and their lifecycle events will appear as branches when you start working with the conversation
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (cardBranches.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500 dark:text-gray-400 animate-fade-in">
          <div className="relative mb-6">
            <MessageCircle className="w-20 h-20 mx-auto opacity-30" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">No Card Events Found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-2">This conversation has events but no card-related activities</p>
          {orphanEvents.length > 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Found {orphanEvents.length} orphan event{orphanEvents.length !== 1 ? 's' : ''} without card IDs
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Tree Visualization */}
      <div className="relative">
        {/* Main trunk line */}
        <div className="absolute left-1/2 transform -translate-x-0.5 w-2 bg-gradient-to-b from-green-300 via-emerald-400 to-green-300 dark:from-green-700 dark:via-emerald-600 dark:to-green-700 top-0 bottom-0 rounded-full">
          {/* Animated growth indicator */}
          <div className="absolute inset-0 w-full bg-gradient-to-b from-green-400 to-emerald-600 rounded-full opacity-60 animate-pulse" />
          {/* Flowing sap effect */}
          <div className="absolute inset-0 w-full">
            <div className="w-full h-12 bg-gradient-to-b from-transparent via-green-400 to-transparent rounded-full animate-bounce-subtle opacity-40" />
          </div>
        </div>
        
        {/* Card branches grouped by date */}
        {Array.from(branchesByDate.entries()).map(([dateString, dayBranches], dateIndex) => (
          <div key={dateString} className="mb-16">
            {/* Date separator */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative z-20 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-lg backdrop-blur-sm animate-fade-in">
                <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-full" />
                <span className="relative">{formatDate(dayBranches[0].rootEvent.at)}</span>
              </div>
            </div>
            
            {/* Card branches for this date */}
            {dayBranches.map((cardBranch, branchIndex) => {
              const isLeft = branchIndex % 2 === 1;
              const cardIsExpanded = isExpanded(cardBranch.cardId);
              
              return (
                <div key={cardBranch.cardId} className="relative mb-12">
                  {/* Card node */}
                  <div className={`flex ${isLeft ? 'justify-end pr-52' : 'justify-start pl-52'} relative z-20`}>
                    <div className="w-full max-w-sm">
                      <TreeTimelineNode
                        cardBranch={cardBranch}
                        isExpanded={cardIsExpanded}
                        onToggleExpand={() => toggleItem(cardBranch.cardId)}
                        showTime={true}
                        isLeft={isLeft}
                      />
                      
                      {/* Sub-branches for card events */}
                      {cardIsExpanded && cardBranch.childEvents.length > 0 && (
                        <div className="mt-4">
                          <CardSubBranch
                            events={cardBranch.childEvents}
                            isVisible={cardIsExpanded}
                            showTime={true}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Trunk node at intersection */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-12 z-30">
                    <div className="relative">
                      {/* Pulsing ring effect */}
                      <div className="absolute inset-0 w-8 h-8 -translate-x-1 -translate-y-1 border-2 border-green-400 dark:border-green-300 rounded-full animate-ping opacity-40" />
                      {/* Main trunk node */}
                      <div className="w-6 h-6 bg-white dark:bg-gray-800 border-2 border-green-500 dark:border-green-400 rounded-full shadow-lg relative z-10 transition-all duration-300 hover:scale-125 hover:shadow-xl" />
                      {/* Inner glow */}
                      <div className="absolute inset-1.5 w-3 h-3 bg-green-400 dark:bg-green-300 rounded-full animate-pulse" />
                    </div>
                  </div>
                  
                </div>
              );
            })}
          </div>
        ))}
        
        {/* Tree crown/end indicator */}
        <div className="flex items-center justify-center">
          <div className="relative">
            {/* Outer glow ring */}
            <div className="absolute inset-0 w-10 h-10 -translate-x-1 -translate-y-1 bg-gradient-to-br from-green-300 to-emerald-500 rounded-full animate-ping opacity-30" />
            {/* Main crown */}
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full shadow-xl flex items-center justify-center relative z-10 animate-pulse">
              <TreePine className="w-4 h-4 text-white" />
            </div>
            {/* Growth indicator glow */}
            <div className="absolute inset-1 w-6 h-6 bg-gradient-to-br from-emerald-300 to-green-400 rounded-full opacity-20 animate-bounce-subtle" />
          </div>
        </div>
      </div>
      
      {/* Expand/Collapse All Controls */}
      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={() => setExpandedCards(new Set(cardBranches.map(b => b.cardId)))}
          className="px-4 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition-colors text-sm"
        >
          Expand All
        </button>
        <button
          onClick={() => setExpandedCards(new Set())}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
        >
          Collapse All
        </button>
      </div>
    </div>
  );
}