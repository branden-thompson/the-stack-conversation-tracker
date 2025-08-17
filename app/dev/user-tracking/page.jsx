/**
 * User Tracking Dev Page
 * Real-time monitoring of user sessions and activity
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUserTracking } from '@/lib/hooks/useUserTracking';
import { useGuestUsers } from '@/lib/hooks/useGuestUsers';
import { useButtonTracking } from '@/lib/hooks/useButtonTracking';
import { DevHeader } from '@/components/ui/dev-header';
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
import { THEME, DEV_LAYOUT } from '@/lib/utils/ui-constants';
import { SESSION_STATUS } from '@/lib/utils/session-constants';
import { cn } from '@/lib/utils';

export default function UserTrackingPage() {
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

  // Right controls for header
  const rightControls = (
    <>
      <div className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm",
        THEME.colors.background.tertiary,
        THEME.colors.border.primary,
        "border"
      )}>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>{stats.active} active</span>
        </div>
        <span className={THEME.colors.text.tertiary}>|</span>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span>{stats.inactive} inactive</span>
        </div>
        <span className={THEME.colors.text.tertiary}>|</span>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-gray-500" />
          <span>{stats.idle} idle</span>
        </div>
      </div>
      
      <Button
        variant="outline"
        onClick={refresh}
        className="h-[40px] leading-none"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Refresh
      </Button>
      
      <Button
        variant="outline"
        onClick={handleExport}
        className="h-[40px] leading-none"
      >
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>
    </>
  );

  if (loading && !sessions.total) {
    return (
      <div className={`flex items-center justify-center h-screen ${THEME.colors.background.primary}`}>
        <div className="text-center">
          <RefreshCw className={`w-8 h-8 animate-spin mx-auto mb-2 ${THEME.colors.text.tertiary}`} />
          <p className={THEME.colors.text.tertiary}>Loading user tracking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${THEME.colors.background.primary}`}>
      {/* Header */}
      <DevHeader
        onOpenTray={() => setTrayOpen(true)}
        rightControls={rightControls}
      />

      {/* Main Content */}
      <div className={`flex-1 ${DEV_LAYOUT.sectionPadding} ${THEME.colors.text.primary} overflow-hidden`}>
        <div className="h-full grid grid-cols-12 gap-4">
          {/* Left Column: Sessions (8 cols) */}
          <div className="col-span-8 flex flex-col h-full">
            {/* View Mode Tabs */}
            <div className={cn(
              "flex items-center gap-2 p-2 rounded-t-lg border-b",
              THEME.colors.background.secondary,
              THEME.colors.border.primary
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
                <span className={cn("text-xs", THEME.colors.text.tertiary)}>
                  Connection: {connectionMode}
                </span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  THEME.colors.background.tertiary,
                  THEME.colors.text.secondary
                )}>
                  {stats.total} total sessions
                </span>
              </div>
            </div>

            {/* Sessions Content */}
            <div className={cn(
              "flex-1 overflow-y-auto rounded-b-lg border-x border-b p-4",
              THEME.colors.background.secondary,
              THEME.colors.border.primary
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

              {/* Grouped View */}
              {viewMode === 'grouped' && (
                <div className="space-y-4">
                  {/* Debug info - remove after testing */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-gray-500 mb-2">
                      Registered sessions: {Object.keys(sessions.grouped).length} users, 
                      Guest sessions: {sessions.guests.length}
                    </div>
                  )}
                  
                  {/* Registered Users */}
                  {Object.entries(sessions.grouped).map(([userId, userSessions]) => {
                    const user = allUsers.find(u => u.id === userId);
                    return (
                      <SessionGroup
                        key={userId}
                        userId={userId}
                        user={user}
                        sessions={userSessions}
                        defaultExpanded={userSessions.some(s => s.status === SESSION_STATUS.ACTIVE)}
                        onRemoveSession={async (sessionId) => {
                          if (sessionId.startsWith('sim_')) {
                            await removeSimulatedSessions(sessionId);
                          }
                        }}
                      />
                    );
                  })}
                  
                  {/* Guest Sessions */}
                  {sessions.guests.length > 0 && (
                    <div className="space-y-2">
                      <h3 className={cn(
                        "text-sm font-semibold px-2",
                        THEME.colors.text.secondary
                      )}>
                        Guest Sessions ({sessions.guests.length})
                      </h3>
                      {sessions.guests.map(session => (
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
                    </div>
                  )}
                  
                  {/* No Sessions */}
                  {Object.keys(sessions.grouped).length === 0 && sessions.guests.length === 0 && (
                    <div className={cn(
                      "text-center py-12",
                      THEME.colors.text.tertiary
                    )}>
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg mb-1">No Active Sessions</p>
                      <p className="text-sm">User sessions will appear here when users connect</p>
                      <p className="text-xs mt-4">Use the simulation controls to create test sessions</p>
                    </div>
                  )}
                </div>
              )}

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
                "flex-1 rounded-lg border overflow-hidden",
                THEME.colors.background.secondary,
                THEME.colors.border.primary
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