/**
 * User Tracking Dev Page
 * Real-time monitoring of user sessions and activity
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUserTracking } from '@/lib/hooks/useUserTracking';
import { useGuestUsers } from '@/lib/hooks/useGuestUsers';
import { useButtonTracking } from '@/lib/hooks/useButtonTracking';
import { UniversalDevHeader } from '@/components/ui/universal-dev-header';
import { LeftTray } from '@/components/ui/left-tray';
import { SessionCard } from '@/components/ui/session-card';
import { SessionGroup } from '@/components/ui/session-group';
import { ActivityTimeline } from '@/components/ui/activity-timeline';
import { SimulationControls } from '@/components/ui/simulation-controls';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  Download,
  Users,
  Activity,
  Zap,
  BarChart3,
} from 'lucide-react';
import { THEME, DEV_LAYOUT, UI_HEIGHTS } from '@/lib/utils/ui-constants';
import { SESSION_STATUS } from '@/lib/utils/session-constants';
import { cn } from '@/lib/utils';
import { useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';

export default function UserTrackingPage() {
  const dynamicTheme = useDynamicAppTheme();
  const [trayOpen, setTrayOpen] = useState(false);
  const [autoActivity, setAutoActivity] = useState(true);
  const [viewMode, setViewMode] = useState('grouped'); // 'grouped' | 'list' | 'timeline'
  
  // Enable global button tracking
  useButtonTracking();
  
  // Handle auto-activity toggle
  const handleToggleAutoActivity = async (enabled) => {
    setAutoActivity(enabled);
    
    // Control existing simulated sessions
    try {
      const response = await fetch('/api/sessions/simulate/activity', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: enabled ? 'start' : 'stop'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log(`[User Tracking] Auto-activity ${enabled ? 'started' : 'stopped'} for ${result.affected} sessions`);
      }
    } catch (error) {
      console.error('Failed to toggle auto-activity:', error);
    }
  };
  
  // Get user data
  const { allUsers } = useGuestUsers();
  
  // User tracking hook
  const {
    sessions,
    events,
    loading,
    error,
    connectionMode,
    changeMode,
    refresh,
    createSimulatedSession,
    removeSimulatedSessions,
    getSimulatedSessions,
    getStats,
  } = useUserTracking({
    mode: 'polling',
    pollInterval: 2000,
    maxEvents: 100,
  });

  // Get simulated sessions count
  const [simulatedCount, setSimulatedCount] = useState(0);
  
  useEffect(() => {
    const updateSimulatedCount = async () => {
      const simulated = await getSimulatedSessions();
      setSimulatedCount(simulated.length);
    };
    updateSimulatedCount();
    const interval = setInterval(updateSimulatedCount, 5000);
    return () => clearInterval(interval);
  }, [getSimulatedSessions]);

  // Session statistics
  const stats = useMemo(() => getStats(), [getStats]);
  
  // Export data
  const handleExport = () => {
    const exportData = {
      timestamp: Date.now(),
      stats,
      sessions,
      events: events.slice(0, 100),
    };
    
    const blob = new Blob(
      [JSON.stringify(exportData, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-tracking-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handlers for UniversalDevHeader
  const handleExportAllData = () => {
    handleExport();
  };

  // Right controls for header - split into two groups (UNUSED - kept for reference)
  const rightControls = (
    <>
      {/* Action Buttons Group */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={refresh}
          className={`h-[${UI_HEIGHTS.toolbar}px] leading-none`}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
        
        <Button
          variant="outline"
          onClick={handleExport}
          className={`h-[${UI_HEIGHTS.toolbar}px] leading-none`}
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>
      
      {/* Divider */}
      <span className="h-6 w-px bg-zinc-300 dark:bg-zinc-600 mx-3" />
      
      {/* User Tracking Stats Group */}
      <div className={cn(
        "flex items-center gap-2 px-3 rounded-md text-sm",
        dynamicTheme.colors.background.tertiary,
        dynamicTheme.colors.border.primary,
        "border",
        `h-[${UI_HEIGHTS.toolbar}px]`
      )}>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>{stats.active} active</span>
        </div>
        <span className={dynamicTheme.colors.text.tertiary}>|</span>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span>{stats.inactive} inactive</span>
        </div>
        <span className={dynamicTheme.colors.text.tertiary}>|</span>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-gray-500" />
          <span>{stats.idle} idle</span>
        </div>
      </div>
    </>
  );

  if (loading && !sessions.total) {
    return (
      <div className={`flex items-center justify-center h-screen ${dynamicTheme.colors.background.primary}`}>
        <div className="text-center">
          <RefreshCw className={`w-8 h-8 animate-spin mx-auto mb-2 ${dynamicTheme.colors.text.tertiary}`} />
          <p className={dynamicTheme.colors.text.tertiary}>Loading user tracking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${dynamicTheme.colors.background.primary}`}>
      {/* Header */}
      <UniversalDevHeader
        onOpenTray={() => setTrayOpen(true)}
        onExportAllData={handleExportAllData}
      />

      {/* Main Content */}
      <div className={`flex-1 ${DEV_LAYOUT.sectionPadding} ${dynamicTheme.colors.text.primary}`}>
        <div className="h-full grid grid-cols-12 gap-4">
          {/* Left Column: Sessions (8 cols) */}
          <div className="col-span-8 flex flex-col h-full">
            {/* View Mode Tabs */}
            <div className={cn(
              "flex items-center gap-2 p-2 rounded-t-lg border-b",
              dynamicTheme.colors.background.secondary,
              dynamicTheme.colors.border.primary
            )}>
              <Button
                variant={viewMode === 'grouped' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grouped')}
                className="h-7"
              >
                <Users className="w-3 h-3 mr-1" />
                Grouped
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-7"
              >
                <BarChart3 className="w-3 h-3 mr-1" />
                List
              </Button>
              <Button
                variant={viewMode === 'timeline' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('timeline')}
                className="h-7"
              >
                <Activity className="w-3 h-3 mr-1" />
                Timeline
              </Button>
              
              <div className="ml-auto flex items-center gap-2">
                <span className={cn("text-xs", dynamicTheme.colors.text.tertiary)}>
                  Connection: {connectionMode}
                </span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  dynamicTheme.colors.background.tertiary,
                  dynamicTheme.colors.text.secondary
                )}>
                  {stats.total} total sessions
                </span>
              </div>
            </div>

            {/* Sessions Content */}
            <div className={cn(
              "flex-1 overflow-y-auto rounded-b-lg border-x border-b p-4",
              dynamicTheme.colors.background.secondary,
              dynamicTheme.colors.border.primary
            )}>
              {error && (
                <div className={cn(
                  "p-3 rounded-md mb-4",
                  "bg-red-100 dark:bg-red-900/30",
                  "text-red-700 dark:text-red-300",
                  "text-sm"
                )}>
                  Error: {error}
                </div>
              )}

              {/* Timeline View */}
              {viewMode === 'timeline' && (
                <ActivityTimeline
                  events={events}
                  users={allUsers}
                  maxItems={100}
                  autoScroll={true}
                  onRefresh={refresh}
                  className="h-full"
                />
              )}

              {/* Grouped View - Enhanced with 3 collapsible groups */}
              {viewMode === 'grouped' && (() => {
                // Split guest sessions into active and inactive provisioned guests
                const activeProvisionedGuests = sessions.guests.filter(session => 
                  session.userType === 'guest' && 
                  session.status === SESSION_STATUS.ACTIVE &&
                  session.metadata?.provisioned === true
                );
                
                const inactiveProvisionedGuests = sessions.guests.filter(session => 
                  session.userType === 'guest' && 
                  session.status === SESSION_STATUS.INACTIVE &&
                  session.metadata?.provisioned === true
                );
                
                // Other guest sessions (non-provisioned)
                const otherGuestSessions = sessions.guests.filter(session => 
                  session.metadata?.provisioned !== true
                );
                
                return (
                  <div className="space-y-4">
                    {/* Debug info - remove after testing */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="text-xs text-gray-500 mb-2">
                        Registered: {Object.keys(sessions.grouped).length} users, 
                        Active Guests: {activeProvisionedGuests.length}, 
                        Inactive Guests: {inactiveProvisionedGuests.length},
                        Other Guests: {otherGuestSessions.length}
                      </div>
                    )}
                    
                    {/* Group 1: Registered Users */}
                    <SessionGroup
                      key="registered-users"
                      groupTitle="Registered Users"
                      groupCount={Object.keys(sessions.grouped).length}
                      defaultExpanded={true}
                      groupIcon={<Users className="w-4 h-4" />}
                      className="border-blue-200 dark:border-blue-800"
                    >
                      {Object.entries(sessions.grouped).map(([userId, userSessions]) => {
                        const user = allUsers.find(u => u.id === userId);
                        
                        // Render each user as a single card (like provisioned guests)
                        // If multiple sessions, show combined info
                        
                        // Collect all unique routes from all sessions' route history
                        const allRoutes = new Map();
                        userSessions.forEach(session => {
                          // Add routes from routeHistory if available
                          if (session.routeHistory && Array.isArray(session.routeHistory)) {
                            session.routeHistory.forEach(routeEntry => {
                              const existing = allRoutes.get(routeEntry.route);
                              if (existing) {
                                existing.eventCount += routeEntry.eventCount || 0;
                                existing.lastActivity = Math.max(existing.lastActivity, routeEntry.visitedAt || 0);
                              } else {
                                allRoutes.set(routeEntry.route, {
                                  route: routeEntry.route,
                                  lastActivity: routeEntry.visitedAt || session.lastActivityAt,
                                  eventCount: routeEntry.eventCount || 0,
                                  recentAction: null
                                });
                              }
                            });
                          } else {
                            // Fallback to currentRoute if no history
                            const route = session.currentRoute || '/';
                            const existing = allRoutes.get(route);
                            if (existing) {
                              existing.eventCount += session.eventCount || 0;
                              existing.lastActivity = Math.max(existing.lastActivity, session.lastActivityAt);
                            } else {
                              allRoutes.set(route, {
                                route: route,
                                lastActivity: session.lastActivityAt,
                                eventCount: session.eventCount || 0,
                                recentAction: session.recentActions?.[0] || null
                              });
                            }
                          }
                        });
                        
                        // Convert map to array and sort by last activity
                        const routeActivities = Array.from(allRoutes.values())
                          .sort((a, b) => b.lastActivity - a.lastActivity);
                        
                        const combinedSession = {
                          id: `combined-${userId}`,
                          userId: userId,
                          userName: user?.name || 'Unknown User',
                          userType: 'registered',
                          status: userSessions.some(s => s.status === SESSION_STATUS.ACTIVE) ? SESSION_STATUS.ACTIVE : 
                                 userSessions.some(s => s.status === SESSION_STATUS.INACTIVE) ? SESSION_STATUS.INACTIVE : 'idle',
                          startedAt: Math.min(...userSessions.map(s => s.startedAt)),
                          lastActivityAt: Math.max(...userSessions.map(s => s.lastActivityAt)),
                          browser: userSessions.length === 1 ? 
                            userSessions[0]?.browser || 'Unknown' : 
                            `${userSessions[0]?.browser?.split(' ')[0] || 'Unknown'} (${userSessions.length} sessions)`,
                          currentRoute: userSessions.length === 1 ? userSessions[0].currentRoute : `${routeActivities.length} routes`,
                          eventCount: userSessions.reduce((sum, s) => sum + (s.eventCount || 0), 0),
                          recentActions: userSessions.flatMap(s => s.recentActions || []).sort((a, b) => b.timestamp - a.timestamp).slice(0, 1),
                          metadata: {
                            sessionCount: userSessions.length,
                            routes: routeActivities.map(r => r.route),
                            sessions: userSessions, // Store original sessions for detailed display
                            routeActivities: routeActivities
                          }
                        };
                        
                        return (
                          <SessionCard
                            key={userId}
                            session={combinedSession}
                            user={user}
                            onRemove={async (sessionId) => {
                              // Remove all sessions for this user if they're simulated
                              const simSessions = userSessions.filter(s => s.id.startsWith('sim_'));
                              for (const session of simSessions) {
                                await removeSimulatedSessions(session.id);
                              }
                            }}
                            isSimulated={userSessions.some(s => s.metadata?.simulated || s.id.startsWith('sim_'))}
                            compact={false}
                          />
                        );
                      })}
                      {Object.keys(sessions.grouped).length === 0 && (
                        <div className="text-sm text-gray-500 italic px-4 py-2">
                          No registered user sessions
                        </div>
                      )}
                    </SessionGroup>
                    
                    {/* Group 2: Active Provisioned Guests */}
                    <SessionGroup
                      key="active-provisioned-guests"
                      groupTitle="Active Provisioned Guests"
                      groupCount={activeProvisionedGuests.length}
                      defaultExpanded={activeProvisionedGuests.length > 0}
                      groupIcon={<div className="w-3 h-3 bg-green-500 rounded-full" />}
                      className="border-green-200 dark:border-green-800"
                    >
                      {activeProvisionedGuests.map(session => (
                        <SessionCard
                          key={session.id}
                          session={session}
                          user={{ 
                            id: session.userId, 
                            name: session.userName || 'Guest',
                            profilePicture: session.metadata?.avatar,
                          }}
                          onRemove={session.id.startsWith('sim_') ? 
                            () => removeSimulatedSessions(session.id) : 
                            undefined
                          }
                          isSimulated={session.metadata?.simulated || session.id.startsWith('sim_')}
                        />
                      ))}
                      {activeProvisionedGuests.length === 0 && (
                        <div className="text-sm text-gray-500 italic px-4 py-2">
                          No active provisioned guests
                        </div>
                      )}
                    </SessionGroup>
                    
                    {/* Group 3: Inactive Provisioned Guests */}
                    <SessionGroup
                      key="inactive-provisioned-guests"
                      groupTitle="Inactive Provisioned Guests"
                      groupCount={inactiveProvisionedGuests.length}
                      defaultExpanded={false}
                      groupIcon={<div className="w-3 h-3 bg-yellow-500 rounded-full" />}
                      className="border-yellow-200 dark:border-yellow-800"
                    >
                      {inactiveProvisionedGuests.map(session => (
                        <SessionCard
                          key={session.id}
                          session={session}
                          user={{ 
                            id: session.userId, 
                            name: session.userName || 'Guest',
                            profilePicture: session.metadata?.avatar,
                          }}
                          onRemove={session.id.startsWith('sim_') ? 
                            () => removeSimulatedSessions(session.id) : 
                            undefined
                          }
                          isSimulated={session.metadata?.simulated || session.id.startsWith('sim_')}
                        />
                      ))}
                      {inactiveProvisionedGuests.length === 0 && (
                        <div className="text-sm text-gray-500 italic px-4 py-2">
                          No inactive provisioned guests
                        </div>
                      )}
                    </SessionGroup>
                    
                    {/* Other Guest Sessions (if any) - for backward compatibility */}
                    {otherGuestSessions.length > 0 && (
                      <SessionGroup
                        key="other-guest-sessions"
                        groupTitle="Other Guest Sessions"
                        groupCount={otherGuestSessions.length}
                        defaultExpanded={false}
                        groupIcon={<div className="w-3 h-3 bg-gray-500 rounded-full" />}
                        className="border-gray-200 dark:border-gray-800"
                      >
                        {otherGuestSessions.map(session => (
                          <SessionCard
                            key={session.id}
                            session={session}
                            user={{ 
                              id: session.userId, 
                              name: session.userName || 'Guest',
                              profilePicture: session.metadata?.avatar,
                            }}
                            onRemove={session.id.startsWith('sim_') ? 
                              () => removeSimulatedSessions(session.id) : 
                              undefined
                            }
                            isSimulated={session.metadata?.simulated || session.id.startsWith('sim_')}
                          />
                        ))}
                      </SessionGroup>
                    )}
                    
                    {/* No Sessions */}
                    {Object.keys(sessions.grouped).length === 0 && sessions.guests.length === 0 && (
                      <div className={cn(
                        "text-center py-12",
                        dynamicTheme.colors.text.tertiary
                      )}>
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p className="text-lg mb-1">No Active Sessions</p>
                        <p className="text-sm">User sessions will appear here when users connect</p>
                        <p className="text-xs mt-4">Use the simulation controls to create test sessions</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* List View */}
              {viewMode === 'list' && (
                <div className="space-y-2">
                  {/* All sessions in a flat list */}
                  {[
                    ...Object.values(sessions.grouped).flat(),
                    ...sessions.guests,
                  ]
                    .sort((a, b) => b.lastActivityAt - a.lastActivityAt)
                    .map(session => {
                      const user = allUsers.find(u => u.id === session.userId) || {
                        id: session.userId,
                        name: session.userName || 'Unknown',
                        profilePicture: session.metadata?.avatar,
                      };
                      
                      return (
                        <SessionCard
                          key={session.id}
                          session={session}
                          user={user}
                          onRemove={session.id.startsWith('sim_') ? 
                            () => removeSimulatedSessions(session.id) : 
                            undefined
                          }
                          isSimulated={session.metadata?.simulated || session.id.startsWith('sim_')}
                          compact
                        />
                      );
                    })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Controls & Timeline (4 cols) */}
          <div className="col-span-4 flex flex-col gap-4 h-full">
            {/* Simulation Controls */}
            <SimulationControls
              onCreateSessions={createSimulatedSession}
              onRemoveAllSessions={() => removeSimulatedSessions()}
              simulatedCount={simulatedCount}
              isAutoActivity={autoActivity}
              onToggleAutoActivity={handleToggleAutoActivity}
            />

            {/* Recent Activity (if not in timeline view) */}
            {viewMode !== 'timeline' && (
              <div className={cn(
                "flex-1 rounded-lg border",
                dynamicTheme.colors.background.secondary,
                dynamicTheme.colors.border.primary
              )}>
                <ActivityTimeline
                  events={events}
                  users={allUsers}
                  maxItems={20}
                  autoScroll={true}
                  onRefresh={refresh}
                  className="h-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Left Tray */}
      <LeftTray
        isOpen={trayOpen}
        onClose={() => setTrayOpen(false)}
        onNewCard={() => {}}
        onResetLayout={() => {}}
        onRefreshCards={() => window.location.reload()}
        title="User Tracking"
      />
    </div>
  );
}