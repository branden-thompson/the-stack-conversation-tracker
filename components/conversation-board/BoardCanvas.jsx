/**
 * BoardCanvas Component
 * Reusable 4-zone drag-and-drop conversation board that can be used across different views
 * 
 * Features:
 * - 4 resizable zones: Active, Parking, Resolved, Unresolved
 * - Drag and drop with custom collision detection
 * - Auto-stacking and manual positioning
 * - Event emissions for Dev Page integration
 * - Layout reset functionality
 */

'use client';

import { useRef, useState, useEffect } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import { Zone } from './Zone';
import { ConversationCard } from './ConversationCard';
import { useBoardDnD } from '@/lib/hooks/useBoardDnD';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

const DEFAULT_LAYOUT = {
  rows: { top: 70, bottom: 30 },
  topRowCols: { active: 70, parking: 30 },
  bottomRowCols: { resolved: 50, unresolved: 50 },
};

// Custom hook to detect mobile layout
function useResponsiveLayout() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIsMobile = () => {
      // Use a more aggressive mobile breakpoint - based on the screenshot, it looks like it's not triggering
      const width = window.innerWidth;
      setIsMobile(width < 640); // sm breakpoint instead of md
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);
  
  return isMobile;
}

export function BoardCanvas({
  layoutKey = 0,
  cards = [],
  getCardsByZone,
  onUpdateCard,
  onDeleteCard,
  customLayout = DEFAULT_LAYOUT,
  users = [],
  animationsEnabled = true,
}) {
  const boardRef = useRef(null);
  const isMobile = useResponsiveLayout();

  // Initialize DnD logic
  const dnd = useBoardDnD({ cards, onUpdateCard, getCardsByZone });
  const { activeCard, isDraggingCard, contextProps } = dnd;

  // Debug logging for drag state (can be removed in production)

  return (
    <DndContext {...contextProps}>
      {/* Board Canvas */}
      <main ref={boardRef} className="flex-1 relative overflow-hidden">
        {isMobile ? (
          // Mobile Layout: Single column, scrollable
          <div className="h-full overflow-y-auto">
            <div className="flex flex-col h-full">
              {/* Active Conversation - Primary focus on mobile */}
              <div className="flex-1 p-2 min-h-[200px]">
                <Zone
                  zoneId="active"
                  cards={getCardsByZone().active || []}
                  onUpdateCard={onUpdateCard}
                  onDeleteCard={onDeleteCard}
                  isDraggingCard={!!activeCard}
                  autoOrganize={true}
                  showOrganizeButton={false}
                  titleOverride="Active Conversation"
                  users={users}
                  animationsEnabled={animationsEnabled}
                />
              </div>
              
              {/* Parking Lot - Adequate drop space */}
              <div className="flex-1 p-2 min-h-[180px]">
                <Zone
                  zoneId="parking"
                  cards={getCardsByZone().parking || []}
                  onUpdateCard={onUpdateCard}
                  onDeleteCard={onDeleteCard}
                  isDraggingCard={!!activeCard}
                  autoOrganize={true}
                  showOrganizeButton={false}
                  titleOverride="Parking Lot"
                  users={users}
                  animationsEnabled={animationsEnabled}
                />
              </div>
              
              {/* Resolved - Adequate drop space */}
              <div className="flex-1 p-2 min-h-[180px]">
                <Zone
                  zoneId="resolved"
                  cards={getCardsByZone().resolved || []}
                  onUpdateCard={onUpdateCard}
                  onDeleteCard={onDeleteCard}
                  isDraggingCard={!!activeCard}
                  autoOrganize={true}
                  showOrganizeButton={false}
                  titleOverride="Resolved"
                  users={users}
                  animationsEnabled={animationsEnabled}
                />
              </div>
              
              {/* Unresolved - Adequate drop space */}
              <div className="flex-1 p-2 min-h-[180px]">
                <Zone
                  zoneId="unresolved"
                  cards={getCardsByZone().unresolved || []}
                  onUpdateCard={onUpdateCard}
                  onDeleteCard={onDeleteCard}
                  isDraggingCard={!!activeCard}
                  autoOrganize={true}
                  showOrganizeButton={false}
                  titleOverride="Unresolved"
                  users={users}
                  animationsEnabled={animationsEnabled}
                />
              </div>
            </div>
          </div>
        ) : (
          // Desktop Layout: Resizable grid
          <ResizablePanelGroup key={layoutKey} direction="vertical" className="h-full">
            {/* Top Row */}
            <ResizablePanel defaultSize={customLayout.rows.top} minSize={20}>
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={customLayout.topRowCols.active} minSize={20}>
                  <div className="h-full p-2">
                    <Zone
                      zoneId="active"
                      cards={getCardsByZone().active || []}
                      onUpdateCard={onUpdateCard}
                      onDeleteCard={onDeleteCard}
                      isDraggingCard={!!activeCard}
                      autoOrganize={true}
                      showOrganizeButton={false}
                      titleOverride="Active Conversation"
                      users={users}
                      animationsEnabled={animationsEnabled}
                    />
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel defaultSize={customLayout.topRowCols.parking} minSize={15}>
                  <div className="h-full p-2">
                    <Zone
                      zoneId="parking"
                      cards={getCardsByZone().parking || []}
                      onUpdateCard={onUpdateCard}
                      onDeleteCard={onDeleteCard}
                      isDraggingCard={!!activeCard}
                      autoOrganize={false}
                      showOrganizeButton={true}
                      titleOverride="Parking Lot"
                      users={users}
                      animationsEnabled={animationsEnabled}
                    />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Bottom Row */}
            <ResizablePanel defaultSize={customLayout.rows.bottom} minSize={15}>
              <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={customLayout.bottomRowCols.resolved} minSize={15}>
                  <div className="h-full p-2">
                    <Zone
                      zoneId="resolved"
                      cards={getCardsByZone().resolved || []}
                      onUpdateCard={onUpdateCard}
                      onDeleteCard={onDeleteCard}
                      isDraggingCard={!!activeCard}
                      autoOrganize={false}
                      showOrganizeButton={true}
                      titleOverride="Resolved"
                      users={users}
                      animationsEnabled={animationsEnabled}
                    />
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel defaultSize={customLayout.bottomRowCols.unresolved} minSize={15}>
                  <div className="h-full p-2">
                    <Zone
                      zoneId="unresolved"
                      cards={getCardsByZone().unresolved || []}
                      onUpdateCard={onUpdateCard}
                      onDeleteCard={onDeleteCard}
                      isDraggingCard={!!activeCard}
                      autoOrganize={false}
                      showOrganizeButton={true}
                      titleOverride="Unresolved"
                      users={users}
                      animationsEnabled={animationsEnabled}
                    />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
      </main>

      {/* Drag Overlay (no snap-back) */}
      <DragOverlay dropAnimation={null}>
        {activeCard ? (
          <div style={{ cursor: 'grabbing' }}>
            <ConversationCard card={activeCard} onUpdate={() => {}} onDelete={() => {}} users={users} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}