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

import { useRef } from 'react';
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

export function BoardCanvas({
  layoutKey = 0,
  cards = [],
  getCardsByZone,
  onUpdateCard,
  onDeleteCard,
  customLayout = DEFAULT_LAYOUT,
  users = [],
}) {
  const boardRef = useRef(null);

  // Initialize DnD logic
  const dnd = useBoardDnD({ cards, onUpdateCard, getCardsByZone });
  const { activeCard, isDraggingCard, contextProps } = dnd;

  return (
    <DndContext {...contextProps}>
      {/* Board Canvas */}
      <main ref={boardRef} className="flex-1 relative overflow-hidden">
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
                    isDraggingCard={isDraggingCard}
                    autoOrganize={true}
                    showOrganizeButton={false}
                    titleOverride="Active Conversation"
                    users={users}
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
                    isDraggingCard={isDraggingCard}
                    autoOrganize={false}
                    showOrganizeButton={true}
                    titleOverride="Parking Lot"
                    users={users}
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
                    isDraggingCard={isDraggingCard}
                    autoOrganize={false}
                    showOrganizeButton={true}
                    titleOverride="Resolved"
                    users={users}
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
                    isDraggingCard={isDraggingCard}
                    autoOrganize={false}
                    showOrganizeButton={true}
                    titleOverride="Unresolved"
                    users={users}
                  />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
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