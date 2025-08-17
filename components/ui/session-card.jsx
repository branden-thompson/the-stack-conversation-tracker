/**
 * SessionCard Component
 * Display individual user session information with real-time status
 */

'use client';

import { useMemo } from 'react';
import { 
  User, 
  Chrome, 
  Compass, 
  Globe, 
  Clock, 
  Activity,
  MapPin,
  Hash,
  MousePointer,
  X,
} from 'lucide-react';
import { ProfilePicture } from '@/components/ui/profile-picture';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  SESSION_STATUS_COLORS,
  SESSION_EVENT_LABELS,
} from '@/lib/utils/session-constants';
import { THEME } from '@/lib/utils/ui-constants';

// Browser icon mapping
const BROWSER_ICONS = {
  chrome: Chrome,
  safari: Compass,
  firefox: Globe,
  edge: Globe,
  default: Globe,
};

function getBrowserIcon(browserString) {
  const lower = browserString?.toLowerCase() || '';
  if (lower.includes('chrome')) return BROWSER_ICONS.chrome;
  if (lower.includes('safari')) return BROWSER_ICONS.safari;
  if (lower.includes('firefox')) return BROWSER_ICONS.firefox;
  if (lower.includes('edge')) return BROWSER_ICONS.edge;
  return BROWSER_ICONS.default;
}

function formatDuration(startTime) {
  const duration = Date.now() - startTime;
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

function formatLastActivity(timestamp) {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  
  if (minutes > 60) {
    return `${Math.floor(minutes / 60)}h ago`;
  }
  if (minutes > 0) {
    return `${minutes}m ago`;
  }
  if (seconds > 10) {
    return `${seconds}s ago`;
  }
  return 'Just now';
}

export function SessionCard({
  session,
  user,
  onRemove,
  isSimulated = false,
  compact = false,
  className,
}) {
  const statusColors = SESSION_STATUS_COLORS[session.status] || SESSION_STATUS_COLORS.inactive;
  const BrowserIcon = getBrowserIcon(session.browser);
  
  // Get most recent action
  const recentAction = useMemo(() => {
    if (!session.recentActions || session.recentActions.length === 0) {
      return null;
    }
    const action = session.recentActions[0];
    return {
      ...action,
      label: SESSION_EVENT_LABELS[action.type] || action.type,
    };
  }, [session.recentActions]);

  if (compact) {
    return (
      <div 
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border",
          statusColors.bg,
          statusColors.border,
          THEME.colors.background.secondary,
          className
        )}
      >
        {/* Status Indicator */}
        <div className="relative">
          <div className={cn(
            "w-2 h-2 rounded-full",
            statusColors.indicator,
            session.status === 'active' && "animate-pulse"
          )} />
        </div>

        {/* User Avatar */}
        {user && (
          <ProfilePicture
            src={isSimulated && session.metadata?.avatar ? session.metadata.avatar : user.profilePicture}
            name={user.name || session.userName}
            size="sm"
          />
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("font-medium text-sm", THEME.colors.text.primary)}>
              {user?.name || session.userName || 'Unknown User'}
            </span>
            {isSimulated && (
              <span className="text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                Simulated
              </span>
            )}
          </div>
          <div className={cn("flex items-center gap-3 text-xs", THEME.colors.text.tertiary)}>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {session.currentRoute}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatLastActivity(session.lastActivityAt)}
            </span>
          </div>
        </div>

        {/* Browser */}
        <BrowserIcon className={cn("w-4 h-4", THEME.colors.text.tertiary)} />

        {/* Remove button for simulated sessions */}
        {isSimulated && onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onRemove(session.id)}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "rounded-lg border p-4 space-y-3",
        statusColors.bg,
        statusColors.border,
        THEME.colors.background.secondary,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className="relative">
            <div className={cn(
              "w-3 h-3 rounded-full",
              statusColors.indicator,
              session.status === 'active' && "animate-pulse"
            )} />
          </div>

          {/* User Info */}
          <div className="flex items-center gap-2">
            {user && (
              <ProfilePicture
                src={isSimulated && session.metadata?.avatar ? session.metadata.avatar : user.profilePicture}
                name={user.name || session.userName}
                size="md"
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className={cn("font-semibold", THEME.colors.text.primary)}>
                  {user?.name || session.userName || 'Unknown User'}
                </span>
                {isSimulated && (
                  <span className="text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                    Simulated
                  </span>
                )}
              </div>
              <div className={cn("text-xs", statusColors.text)}>
                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Remove button for simulated sessions */}
        {isSimulated && onRemove && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onRemove(session.id)}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Session Details */}
      <div className={cn("grid grid-cols-2 gap-2 text-sm", THEME.colors.text.secondary)}>
        <div className="flex items-center gap-2">
          <BrowserIcon className="w-4 h-4" />
          <span className="truncate">{session.browser}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{formatDuration(session.startedAt)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span className="truncate">{session.currentRoute}</span>
        </div>
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4" />
          <span>{session.eventCount} events</span>
        </div>
      </div>

      {/* Recent Activity */}
      {recentAction && (
        <div className={cn(
          "pt-2 border-t",
          THEME.colors.border.primary
        )}>
          <div className={cn("text-xs font-medium mb-1", THEME.colors.text.tertiary)}>
            Last Activity
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3" />
              <span className={cn("text-sm", THEME.colors.text.secondary)}>
                {recentAction.label}
              </span>
            </div>
            <span className={cn("text-xs", THEME.colors.text.tertiary)}>
              {formatLastActivity(recentAction.timestamp)}
            </span>
          </div>
        </div>
      )}

      {/* Session ID (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className={cn("text-xs font-mono", THEME.colors.text.light, "truncate")}>
          ID: {session.id}
        </div>
      )}
    </div>
  );
}