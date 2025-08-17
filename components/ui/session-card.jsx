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

function getShortUserAgent(browserString) {
  if (!browserString) return 'Unknown';
  
  const lower = browserString.toLowerCase();
  
  // Determine browser
  let browser = 'Unknown';
  if (lower.includes('chrome') && !lower.includes('edge')) browser = 'Chrome';
  else if (lower.includes('safari') && !lower.includes('chrome')) browser = 'Safari';
  else if (lower.includes('firefox')) browser = 'Firefox';
  else if (lower.includes('edge')) browser = 'Edge';
  
  // Determine OS
  let os = 'Unknown';
  if (lower.includes('macintosh') || lower.includes('mac os')) os = 'macOS';
  else if (lower.includes('windows')) os = 'Windows';
  else if (lower.includes('linux')) os = 'Linux';
  else if (lower.includes('android')) os = 'Android';
  else if (lower.includes('iphone') || lower.includes('ipad')) os = 'iOS';
  
  return `${browser} on ${os}`;
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
          THEME.colors.background.secondary,
          THEME.colors.border.primary,
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
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded",
                THEME.colors.background.tertiary,
                THEME.colors.text.secondary
              )}>
                Simulated
              </span>
            )}
            {session.metadata?.sessionCount > 1 && (
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded",
                THEME.colors.background.tertiary,
                THEME.colors.text.secondary
              )}>
                {session.metadata.sessionCount} sessions
              </span>
            )}
          </div>
          <div className={cn("flex items-center gap-3 text-xs", THEME.colors.text.tertiary)}>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {session.metadata?.sessionCount > 1 ? (
                <span>
                  {session.metadata.routes.join(', ')}
                </span>
              ) : (
                session.currentRoute
              )}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatLastActivity(session.lastActivityAt)}
            </span>
            {session.eventCount > 0 && (
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3" />
                {session.eventCount} events
              </span>
            )}
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
        THEME.colors.background.secondary,
        THEME.colors.border.primary,
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
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded",
                    THEME.colors.background.tertiary,
                    THEME.colors.text.secondary
                  )}>
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

        {/* Upper Right: Session Time & Event Count */}
        <div className="flex flex-col items-end gap-1">
          <div className={cn("text-sm font-medium flex items-center gap-1", THEME.colors.text.secondary)}>
            <Clock className="w-4 h-4" />
            {formatDuration(session.startedAt)}
          </div>
          <div className={cn(
            "text-xs px-2 py-0.5 rounded flex items-center gap-1",
            THEME.colors.background.tertiary,
            THEME.colors.text.secondary
          )}>
            <Hash className="w-3 h-3" />
            {session.eventCount} events
          </div>
          {/* Remove button for simulated sessions */}
          {isSimulated && onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 mt-1"
              onClick={() => onRemove(session.id)}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Session Details - Enhanced Layout */}
      <div className="space-y-2">
        {/* Browser Info Row */}
        <div className="flex items-center gap-2 text-sm">
          <BrowserIcon className={cn("w-4 h-4", THEME.colors.text.tertiary)} />
          <span className={cn("truncate", THEME.colors.text.secondary)}>
            {getShortUserAgent(session.browser)}
          </span>
        </div>

        {/* Routes and Activities Table */}
        {session.metadata?.sessionCount > 1 && session.metadata?.routeActivities ? (
          <div className="space-y-0">
            {/* Header Row */}
            <div className="grid grid-cols-2">
              <div className={cn(
                "pr-3 py-1.5 text-xs font-medium flex items-center gap-2",
                THEME.colors.text.tertiary
              )}>
                <MapPin className="w-4 h-4" />
                <span>Route</span>
              </div>
              <div className={cn(
                "pl-3 py-1.5 text-xs font-medium flex items-center gap-2 border-l",
                "border-gray-300 dark:border-gray-600",
                THEME.colors.text.tertiary
              )}>
                <Activity className="w-4 h-4" />
                <span>Last Activity</span>
              </div>
            </div>
            
            {/* Data Rows */}
            {session.metadata.routeActivities.map((routeActivity, index) => (
              <div key={index} className="grid grid-cols-2">
                {/* Route Column */}
                <div className={cn(
                  "pr-3 py-2 text-sm flex items-start gap-2"
                )}>
                  <MapPin className={cn("w-4 h-4 mt-0.5 flex-shrink-0", THEME.colors.text.tertiary)} />
                  <div className="flex-1 min-w-0">
                    <div className={cn("font-mono truncate", THEME.colors.text.primary)}>
                      {routeActivity.route}
                    </div>
                  </div>
                </div>
                
                {/* Activity Column */}
                <div className={cn(
                  "pl-3 py-2 text-sm flex items-center gap-2 border-l",
                  "border-gray-300 dark:border-gray-600"
                )}>
                  <Activity className={cn("w-4 h-4 flex-shrink-0", THEME.colors.text.tertiary)} />
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    {routeActivity.recentAction ? (
                      <>
                        <span className={cn("truncate", THEME.colors.text.secondary)}>
                          {SESSION_EVENT_LABELS[routeActivity.recentAction.type] || routeActivity.recentAction.type}
                        </span>
                        <span className={cn("text-xs ml-2 whitespace-nowrap", THEME.colors.text.tertiary)}>
                          {routeActivity.eventCount} events
                        </span>
                      </>
                    ) : (
                      <>
                        <span className={cn("", THEME.colors.text.secondary)}>
                          Session Started
                        </span>
                        <span className={cn("text-xs ml-2 whitespace-nowrap", THEME.colors.text.tertiary)}>
                          {routeActivity.eventCount || 0} events
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Single Route Display */
          <div className="grid grid-cols-2">
            {/* Route Column */}
            <div className={cn(
              "pr-3 py-2 text-sm flex items-center gap-2"
            )}>
              <MapPin className={cn("w-4 h-4 flex-shrink-0", THEME.colors.text.tertiary)} />
              <span className={cn("font-mono truncate", THEME.colors.text.primary)}>
                {session.currentRoute}
              </span>
            </div>
            
            {/* Activity Column */}
            <div className={cn(
              "pl-3 py-2 text-sm flex items-center gap-2 border-l",
              "border-gray-300 dark:border-gray-600"
            )}>
              <Activity className={cn("w-4 h-4 flex-shrink-0", THEME.colors.text.tertiary)} />
              <div className="flex-1 flex items-center justify-between min-w-0">
                {recentAction ? (
                  <>
                    <span className={cn("truncate", THEME.colors.text.secondary)}>
                      {recentAction.label}
                    </span>
                    <span className={cn("text-xs ml-2 whitespace-nowrap", THEME.colors.text.tertiary)}>
                      {session.eventCount} events
                    </span>
                  </>
                ) : (
                  <>
                    <span className={cn("", THEME.colors.text.secondary)}>
                      Session Started
                    </span>
                    <span className={cn("text-xs ml-2 whitespace-nowrap", THEME.colors.text.tertiary)}>
                      {session.eventCount || 0} events
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Session ID (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className={cn("text-xs font-mono", THEME.colors.text.light, "truncate")}>
          ID: {session.id}
        </div>
      )}
    </div>
  );
}