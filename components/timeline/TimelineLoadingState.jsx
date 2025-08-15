// Timeline Loading State Component
// Provides skeleton loading animations for timeline components

'use client';

import { TreePine, Clock } from 'lucide-react';
import { getEmptyStateStyles, microInteractions, timelineAnimations } from '@/lib/utils/timelineStyles';

/**
 * Skeleton loading component for individual timeline cards
 */
export function TimelineCardSkeleton({ isLeft = false, delay = 0 }) {
  return (
    <div 
      className={`${isLeft ? 'animate-slide-in-right' : 'animate-slide-in-left'} max-w-sm`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
        {/* Header skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/5" />
        </div>
        
        {/* Shimmer effect overlay */}
        <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent opacity-60 animate-[shimmer_1.5s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}

/**
 * Skeleton loading component for tree trunk
 */
export function TreeTrunkSkeleton() {
  return (
    <div className="absolute left-1/2 transform -translate-x-0.5 w-3 top-0 bottom-0">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-300 via-gray-400 to-gray-300 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-b from-gray-400 to-gray-500 dark:from-gray-600 dark:to-gray-500 rounded-full opacity-60 animate-pulse" style={{animationDelay: '0.5s'}} />
    </div>
  );
}

/**
 * Skeleton loading component for date separators
 */
export function DateSeparatorSkeleton({ delay = 0 }) {
  return (
    <div 
      className="flex items-center justify-center mb-8"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative z-20">
        <div className="bg-gray-200 dark:bg-gray-700 rounded-full px-8 py-4 animate-pulse">
          <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/**
 * Full timeline loading state
 */
export function TimelineLoadingState({ cardCount = 3, showTrunk = true }) {
  const emptyStyles = getEmptyStateStyles();
  
  return (
    <div className="relative min-h-96">
      {/* Loading trunk */}
      {showTrunk && <TreeTrunkSkeleton />}
      
      {/* Loading message */}
      <div className={emptyStyles.container}>
        <div className={`${emptyStyles.content} animate-fade-in`}>
          <div className={emptyStyles.iconWrapper}>
            <TreePine className={`${emptyStyles.iconWithPulse} text-gray-400 dark:text-gray-600`} />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300 animate-pulse">
            Growing Timeline Tree...
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Loading conversation events and building your timeline
          </p>
          
          {/* Loading progress indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}} />
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}} />
          </div>
        </div>
      </div>
      
      {/* Skeleton cards positioned around the timeline */}
      {showTrunk && Array.from({ length: cardCount }, (_, i) => (
        <div key={i} className={`absolute ${i % 2 === 0 ? 'left-8' : 'right-8'} z-10`} style={{ top: `${120 + i * 160}px` }}>
          <TimelineCardSkeleton isLeft={i % 2 === 1} delay={i * 200} />
        </div>
      ))}
    </div>
  );
}

/**
 * Accordion/List view loading state
 */
export function AccordionLoadingState({ rowCount = 5 }) {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header skeleton */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 grid grid-cols-5 gap-4">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        ))}
      </div>
      
      {/* Row skeletons */}
      {Array.from({ length: rowCount }, (_, i) => (
        <div 
          key={i} 
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 grid grid-cols-5 gap-4"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 flex-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          {Array.from({ length: 4 }, (_, j) => (
            <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          ))}
          
          {/* Shimmer overlay */}
          <div className="col-span-5 absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent opacity-60 animate-[shimmer_2s_ease-in-out_infinite] pointer-events-none" />
        </div>
      ))}
    </div>
  );
}