// Timeline Loading State Component
// Provides skeleton loading animations for timeline components

'use client';

import { TreePine, Clock } from 'lucide-react';
import { getEmptyStateStyles, microInteractions, timelineAnimations } from '@/lib/utils/timelineStyles';
import { useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';

/**
 * Skeleton loading component for individual timeline cards
 */
export function TimelineCardSkeleton({ isLeft = false, delay = 0 }) {
  const dynamicTheme = useDynamicAppTheme();
  return (
    <div 
      className={`${isLeft ? 'animate-slide-in-right' : 'animate-slide-in-left'} max-w-sm`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`${dynamicTheme.colors.background.card} border ${dynamicTheme.colors.border.primary} rounded-lg p-4 ${dynamicTheme.shadows.sm}`}>
        {/* Header skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-8 h-8 ${dynamicTheme.colors.background.tertiary} rounded-full animate-pulse`} />
          <div className="flex-1">
            <div className={`h-4 ${dynamicTheme.colors.background.tertiary} rounded animate-pulse mb-1`} />
            <div className={`h-3 ${dynamicTheme.colors.background.tertiary} rounded animate-pulse w-2/3`} />
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="space-y-2">
          <div className={`h-3 ${dynamicTheme.colors.background.tertiary} rounded animate-pulse`} />
          <div className={`h-3 ${dynamicTheme.colors.background.tertiary} rounded animate-pulse w-4/5`} />
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
  const dynamicTheme = useDynamicAppTheme();
  return (
    <div className="absolute left-1/2 transform -translate-x-0.5 w-3 top-0 bottom-0">
      <div className={`absolute inset-0 ${dynamicTheme.colors.background.tertiary} rounded-full animate-pulse`} />
      <div className={`absolute inset-0 ${dynamicTheme.colors.background.secondary} rounded-full opacity-60 animate-pulse`} style={{animationDelay: '0.5s'}} />
    </div>
  );
}

/**
 * Skeleton loading component for date separators
 */
export function DateSeparatorSkeleton({ delay = 0 }) {
  const dynamicTheme = useDynamicAppTheme();
  return (
    <div 
      className="flex items-center justify-center mb-8"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative z-20">
        <div className={`${dynamicTheme.colors.background.tertiary} rounded-full px-8 py-4 animate-pulse`}>
          <div className={`h-4 w-24 ${dynamicTheme.colors.background.secondary} rounded animate-pulse`} />
        </div>
      </div>
    </div>
  );
}

/**
 * Full timeline loading state
 */
export function TimelineLoadingState({ cardCount = 3, showTrunk = true }) {
  const dynamicTheme = useDynamicAppTheme();
  const emptyStyles = getEmptyStateStyles('w-20', dynamicTheme);
  
  return (
    <div className="relative min-h-96">
      {/* Loading trunk */}
      {showTrunk && <TreeTrunkSkeleton />}
      
      {/* Loading message */}
      <div className={emptyStyles.container}>
        <div className={`${emptyStyles.content} animate-fade-in`}>
          <div className={emptyStyles.iconWrapper}>
            <TreePine className={`${emptyStyles.iconWithPulse}`} />
          </div>
          <h3 className={`text-lg font-semibold mb-2 ${emptyStyles.title} animate-pulse`}>
            Growing Timeline Tree...
          </h3>
          <p className={`${emptyStyles.subtitle} mb-4`}>
            Loading conversation events and building your timeline
          </p>
          
          {/* Loading progress indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`w-2 h-2 ${dynamicTheme.colors.status.success.bg} rounded-full animate-bounce`} />
            <div className={`w-2 h-2 ${dynamicTheme.colors.status.success.bg} rounded-full animate-bounce`} style={{animationDelay: '0.1s'}} />
            <div className={`w-2 h-2 ${dynamicTheme.colors.status.success.bg} rounded-full animate-bounce`} style={{animationDelay: '0.2s'}} />
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
  const dynamicTheme = useDynamicAppTheme();
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header skeleton */}
      <div className={`${dynamicTheme.colors.background.tertiary} rounded-lg p-4 grid grid-cols-5 gap-4`}>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className={`h-4 ${dynamicTheme.colors.background.secondary} rounded animate-pulse`} />
        ))}
      </div>
      
      {/* Row skeletons */}
      {Array.from({ length: rowCount }, (_, i) => (
        <div 
          key={i} 
          className={`${dynamicTheme.colors.background.card} border ${dynamicTheme.colors.border.primary} rounded-lg p-4 grid grid-cols-5 gap-4`}
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 ${dynamicTheme.colors.background.tertiary} rounded animate-pulse`} />
            <div className={`h-4 flex-1 ${dynamicTheme.colors.background.tertiary} rounded animate-pulse`} />
          </div>
          {Array.from({ length: 4 }, (_, j) => (
            <div key={j} className={`h-4 ${dynamicTheme.colors.background.tertiary} rounded animate-pulse`} />
          ))}
          
          {/* Shimmer overlay */}
          <div className="col-span-5 absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent opacity-60 animate-[shimmer_2s_ease-in-out_infinite] pointer-events-none" />
        </div>
      ))}
    </div>
  );
}