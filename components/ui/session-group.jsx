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

export function SessionGroup({
  userId,
  user,
  sessions = [],
  defaultExpanded = false,
  onRemoveSession,
  className,
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Calculate group statistics
  const stats = useMemo(() => {
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
  }, [sessions]);

  // Determine overall group status
  const groupStatus = useMemo(() => {
    if (stats.active > 0) return 'active';
    if (stats.inactive > 0) return 'inactive';
    return 'idle';
  }, [stats]);

  const statusColors = SESSION_STATUS_COLORS[groupStatus];

  if (sessions.length === 0) {
    return null;
  }

  // If only one session, show it directly without grouping
  if (sessions.length === 1) {
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
    <div className={cn("space-y-2", className)}>
      {/* Group Header */}
      <div 
        className={cn(
          "rounded-lg border p-3",
          statusColors.bg,
          statusColors.border,
          THEME.colors.background.secondary
        )}
      >
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto hover:bg-transparent"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-2">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              
              {/* User Info */}
              <div className="flex items-center gap-2">
                {user && (
                  <ProfilePicture
                    src={user.profilePicture}
                    name={user.name}
                    size="md"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn("font-semibold", THEME.colors.text.primary)}>
                      {user?.name || 'Unknown User'}
                    </span>
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded",
                      "bg-blue-100 dark:bg-blue-900/30",
                      "text-blue-700 dark:text-blue-300"
                    )}>
                      {stats.total} sessions
                    </span>
                  </div>
                  <div className={cn("text-xs", THEME.colors.text.tertiary)}>
                    {user?.email || `User ID: ${userId}`}
                  </div>
                </div>
              </div>
            </div>
          </Button>

          {/* Status Summary */}
          <div className="flex items-center gap-3">
            {stats.active > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className={cn("text-xs", THEME.colors.text.secondary)}>
                  {stats.active} active
                </span>
              </div>
            )}
            {stats.inactive > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className={cn("text-xs", THEME.colors.text.secondary)}>
                  {stats.inactive} inactive
                </span>
              </div>
            )}
            {stats.idle > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-500" />
                <span className={cn("text-xs", THEME.colors.text.secondary)}>
                  {stats.idle} idle
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Session Preview (when collapsed) */}
        {!isExpanded && sessions.length > 0 && (
          <div className={cn("mt-2 pt-2 border-t", THEME.colors.border.primary)}>
            <div className="flex flex-wrap gap-2">
              {sessions.slice(0, 3).map(session => (
                <div
                  key={session.id}
                  className={cn(
                    "text-xs px-2 py-1 rounded-md",
                    THEME.colors.background.tertiary,
                    THEME.colors.text.secondary
                  )}
                >
                  <span className="flex items-center gap-1">
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      SESSION_STATUS_COLORS[session.status].indicator
                    )} />
                    {session.browser.split(' ')[0]}
                    <span className={THEME.colors.text.tertiary}>
                      @ {session.currentRoute}
                    </span>
                  </span>
                </div>
              ))}
              {sessions.length > 3 && (
                <div className={cn(
                  "text-xs px-2 py-1",
                  THEME.colors.text.tertiary
                )}>
                  +{sessions.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Expanded Sessions */}
      {isExpanded && (
        <div className="pl-6 space-y-2">
          {sessions.map((session, index) => (
            <div key={session.id} className="relative">
              {/* Connection line */}
              {index < sessions.length - 1 && (
                <div 
                  className={cn(
                    "absolute left-[-14px] top-8 bottom-[-8px] w-0.5",
                    "bg-gray-300 dark:bg-gray-600"
                  )}
                />
              )}
              
              {/* Connection dot */}
              <div 
                className={cn(
                  "absolute left-[-16px] top-8 w-1 h-1 rounded-full",
                  "bg-gray-400 dark:bg-gray-500"
                )}
              />
              
              <SessionCard
                session={session}
                user={user}
                onRemove={onRemoveSession}
                isSimulated={session.metadata?.simulated}
                compact
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}