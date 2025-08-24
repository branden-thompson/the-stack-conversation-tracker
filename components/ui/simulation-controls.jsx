/**
 * SimulationControls Component
 * Controls for creating and managing simulated sessions for testing
 */

'use client';

import { useState } from 'react';
import { 
  PlayCircle, 
  PauseCircle, 
  UserPlus, 
  Trash2,
  Settings,
  Zap,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { THEME } from '@/lib/utils/ui-constants';
import { useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';

export function SimulationControls({
  onCreateSessions,
  onRemoveAllSessions,
  simulatedCount = 0,
  isAutoActivity = true,
  onToggleAutoActivity,
  className,
}) {
  const dynamicTheme = useDynamicAppTheme();
  const [isCreating, setIsCreating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sessionCount, setSessionCount] = useState(1);

  const handleCreate = async () => {
    setIsCreating(true);
    await onCreateSessions?.(sessionCount, isAutoActivity);
    setIsCreating(false);
  };

  const handleRemoveAll = async () => {
    await onRemoveAllSessions?.();
  };

  return (
    <div className={cn(
      "rounded-lg border p-4 space-y-3",
      dynamicTheme.colors.background.card,
      dynamicTheme.colors.border.primary,
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className={`w-4 h-4 ${dynamicTheme.colors.status.warning.icon}`} />
          <span className={cn("font-semibold", dynamicTheme.colors.text.primary)}>
            Simulation Controls
          </span>
        </div>
        {simulatedCount > 0 && (
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full",
            dynamicTheme.colors.status.warning.bg,
            dynamicTheme.colors.status.warning.text
          )}>
            {simulatedCount} simulated
          </span>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSessionCount(1);
            handleCreate();
          }}
          disabled={isCreating}
          className="justify-start"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Guest
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSessionCount(5);
            handleCreate();
          }}
          disabled={isCreating}
          className="justify-start"
        >
          <Users className="w-4 h-4 mr-2" />
          Add 5 Guests
        </Button>
      </div>

      {/* Auto Activity Toggle */}
      {onToggleAutoActivity && (
        <div className={cn(
          "flex items-center justify-between p-2 rounded",
          dynamicTheme.colors.background.tertiary
        )}>
          <span className={cn("text-sm", dynamicTheme.colors.text.secondary)}>
            Auto Activity
          </span>
          <Button
            variant={isAutoActivity ? "default" : "outline"}
            size="sm"
            onClick={() => onToggleAutoActivity(!isAutoActivity)}
            className="h-7"
          >
            {isAutoActivity ? (
              <>
                <PlayCircle className="w-3 h-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <PauseCircle className="w-3 h-3 mr-1" />
                Paused
              </>
            )}
          </Button>
        </div>
      )}

      {/* Advanced Options */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full justify-between h-8"
        >
          <span className="flex items-center gap-1">
            <Settings className="w-3 h-3" />
            Advanced Options
          </span>
          <span className={cn("text-xs", dynamicTheme.colors.text.tertiary)}>
            {showAdvanced ? '−' : '+'}
          </span>
        </Button>
        
        {showAdvanced && (
          <div className={cn(
            "mt-2 p-3 rounded border",
            dynamicTheme.colors.background.tertiary,
            dynamicTheme.colors.border.primary,
            "space-y-3"
          )}>
            {/* Custom Session Count */}
            <div>
              <label className={cn("text-xs font-medium", dynamicTheme.colors.text.secondary)}>
                Number of Sessions
              </label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={sessionCount}
                  onChange={(e) => setSessionCount(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
                  className={cn(
                    "w-20 px-2 py-1 text-sm rounded border",
                    dynamicTheme.colors.background.secondary,
                    dynamicTheme.colors.border.primary,
                    dynamicTheme.colors.text.primary
                  )}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="h-7"
                >
                  Create
                </Button>
              </div>
            </div>

            {/* Presets */}
            <div>
              <label className={cn("text-xs font-medium", dynamicTheme.colors.text.secondary)}>
                Simulation Presets
              </label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSessionCount(3);
                    handleCreate();
                  }}
                  disabled={isCreating}
                  className="h-7 text-xs"
                >
                  Small Team (3)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSessionCount(10);
                    handleCreate();
                  }}
                  disabled={isCreating}
                  className="h-7 text-xs"
                >
                  Medium Team (10)
                </Button>
              </div>
            </div>
            
            {/* Clear All */}
            {simulatedCount > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveAll}
                className="w-full h-7"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Remove All Simulated ({simulatedCount})
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Info Text */}
      <p className={cn("text-xs", dynamicTheme.colors.text.tertiary)}>
        Simulated sessions help test the tracking system with realistic user behavior patterns.
        {isAutoActivity && " Auto activity generates random events every 5-15 seconds."}
      </p>
    </div>
  );
}