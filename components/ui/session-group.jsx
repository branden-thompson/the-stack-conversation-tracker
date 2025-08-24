/**
 * SessionGroup Component
 * Groups multiple sessions for the same user with expandable/collapsible view
 */

'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Users, User } from 'lucide-react';
import { SessionCard } from './session-card';
import { ProfilePicture } from '@/components/ui/profile-picture';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SESSION_STATUS_COLORS } from '@/lib/utils/session-constants';
import { THEME } from '@/lib/utils/ui-constants';
import { useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';

export function SessionGroup({
  userId,
  user,
  sessions = [],
  defaultExpanded = false,
  onRemoveSession,
  className,
  // New props for generic grouping
  groupTitle,
  groupCount,
  groupIcon,
  nested = false,
  children, // For nested content instead of sessions
}) {
  const dynamicTheme = useDynamicAppTheme();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Determine if this is a generic group or user session group
  const isGenericGroup = !!groupTitle;

  // Calculate group statistics
  const stats = useMemo(() => {
    if (isGenericGroup) {
      return {
        total: groupCount || 0,
        active: 0,
        inactive: 0,
        idle: 0,
      };
    }

    const result = {
      total: sessions.length,
      active: 0,
      inactive: 0,
      idle: 0,
    };

    sessions.forEach(session => {
      if (session.status === 'active') result.active++;
      else if (session.status === 'inactive') result.inactive++;
      else if (session.status === 'idle') result.idle++;
    });

    return result;
  }, [sessions, isGenericGroup, groupCount]);

  // Determine overall group status
  const groupStatus = useMemo(() => {
    if (stats.active > 0) return 'active';
    if (stats.inactive > 0) return 'inactive';
    return 'idle';
  }, [stats]);

  const statusColors = SESSION_STATUS_COLORS[groupStatus];

  // For user session groups, if no sessions, return null
  if (!isGenericGroup && sessions.length === 0) {
    return null;
  }

  // For user session groups, if only one session and not nested, show it directly without grouping
  if (!isGenericGroup && !nested && sessions.length === 1) {
    return (
      <SessionCard
        session={sessions[0]}
        user={user}
        onRemove={onRemoveSession}
        isSimulated={sessions[0].metadata?.simulated}
        className={className}
      />
    );
  }

  return (
    <div className={cn(
      "rounded-xl border shadow-sm",
      dynamicTheme.colors.background.card,
      dynamicTheme.colors.border.primary,
      className
    )}>
      {/* Group Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className={cn("p-0 h-auto", dynamicTheme.colors.background.hoverStrong)}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-3">
              {isExpanded ? (
                <ChevronDown className={cn("w-5 h-5", dynamicTheme.colors.text.secondary)} />
              ) : (
                <ChevronRight className={cn("w-5 h-5", dynamicTheme.colors.text.secondary)} />
              )}
              
              {isGenericGroup ? (
                /* Generic Group Header */
                <div className="flex items-center gap-3">
                  <div className="scale-125">{groupIcon}</div>
                  <span className={cn("text-lg font-semibold", dynamicTheme.colors.text.primary)}>
                    {groupTitle}
                  </span>
                </div>
              ) : (
                /* User Session Group Header */
                <div className="flex items-center gap-3">
                  {user && (
                    <ProfilePicture
                      src={user.profilePicture}
                      name={user.name}
                      size="md"
                    />
                  )}
                  <div>
                    <span className={cn("text-lg font-semibold", dynamicTheme.colors.text.primary)}>
                      {user?.name || 'Unknown User'}
                    </span>
                    {user?.email && (
                      <div className={cn("text-sm", dynamicTheme.colors.text.tertiary)}>
                        {user.email}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Button>

          {/* Count - Far Right with Proper Padding */}
          <div className="flex-1 flex justify-end pr-2">
            <div className={cn(
              "text-lg font-semibold px-3 py-1 rounded-lg",
              dynamicTheme.colors.background.tertiary,
              dynamicTheme.colors.text.secondary
            )}>
              {isGenericGroup ? stats.total : `${stats.total} sessions`}
            </div>
          </div>

          {/* Status Summary */}
          <div className="flex items-center gap-3">
            {stats.active > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className={cn("text-xs", dynamicTheme.colors.text.secondary)}>
                  {stats.active} active
                </span>
              </div>
            )}
            {stats.inactive > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className={cn("text-xs", dynamicTheme.colors.text.secondary)}>
                  {stats.inactive} inactive
                </span>
              </div>
            )}
            {stats.idle > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-500" />
                <span className={cn("text-xs", dynamicTheme.colors.text.secondary)}>
                  {stats.idle} idle
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Session Preview (when collapsed) - Only for user session groups */}
        {!isExpanded && !isGenericGroup && sessions.length > 0 && (
          <div className={cn("mt-2 pt-2 border-t", dynamicTheme.colors.border.primary)}>
            <div className="flex flex-wrap gap-2">
              {sessions.slice(0, 3).map(session => (
                <div
                  key={session.id}
                  className={cn(
                    "text-xs px-2 py-1 rounded-md",
                    dynamicTheme.colors.background.tertiary,
                    dynamicTheme.colors.text.secondary
                  )}
                >
                  <span className="flex items-center gap-1">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      SESSION_STATUS_COLORS[session.status].indicator
                    )} />
                    {session.browser.split(' ')[0]}
                    <span className={dynamicTheme.colors.text.tertiary}>
                      @ {session.currentRoute}
                    </span>
                  </span>
                </div>
              ))}
              {sessions.length > 3 && (
                <div className={cn(
                  "text-xs px-2 py-1",
                  dynamicTheme.colors.text.tertiary
                )}>
                  +{sessions.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Expanded Content - Within the group border */}
      {isExpanded && (
        <div className="px-6 pb-6">
          <div className={cn("border-t pt-4", dynamicTheme.colors.border.primary)}>
            <div className="space-y-3">
              {isGenericGroup ? (
                /* Generic Group Content - Render children */
                children
              ) : (
                /* User Session Group Content - Render sessions */
                sessions.map((session, index) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    user={user}
                    onRemove={onRemoveSession}
                    isSimulated={session.metadata?.simulated}
                    compact
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}