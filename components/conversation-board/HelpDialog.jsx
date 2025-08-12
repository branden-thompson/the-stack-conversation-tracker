/**
 * HelpDialog Component
 * Shows keyboard shortcuts and usage instructions (driven by hook-provided data)
 */

'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Keyboard, Mouse, Layers, Move, Info } from 'lucide-react';

export function HelpDialog({ open, onOpenChange, shortcuts = [] }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Conversation Tracker Help</DialogTitle>
          <DialogDescription>
            Learn how to use the conversation tracking board
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Keyboard Shortcuts */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
              <Keyboard className="w-4 h-4" />
              Keyboard Shortcuts
            </h3>

            {/* Legend */}
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <Info className="w-3 h-3" />
              <span>
                <span className="font-medium">⌘/Ctrl</span> = Command (macOS) or Ctrl (Windows/Linux)
              </span>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {shortcuts.map((s, i) => (
                  <div key={i} className="flex justify-between p-2 bg-gray-50 rounded">
                    <span className="text-gray-600">{s.description}</span>
                    <div className="flex gap-1">
                      {Array.isArray(s.keys) ? (
                        s.keys.map((k, idx) => (
                          <kbd key={idx} className="px-2 py-1 text-xs bg-white border rounded">
                            {k}
                          </kbd>
                        ))
                      ) : (
                        <kbd className="px-2 py-1 text-xs bg-white border rounded">{s.keys}</kbd>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mouse Actions */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
              <Mouse className="w-4 h-4" />
              Mouse Actions
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="font-medium">Drag cards:</span>
                Click and drag the grip handle to move cards
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">Edit content:</span>
                Double-click a card to edit its text
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">Move zones:</span>
                Drag the zone header to reposition zones
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">Resize zones:</span>
                Drag the bottom-right corner of a zone
              </li>
            </ul>
          </div>

          {/* Card Stacking */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
              <Layers className="w-4 h-4" />
              Card Stacking
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="font-medium">Stack cards:</span>
                Drop one card onto another to stack them
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">Unstack cards:</span>
                Click the layers icon on a stacked card
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">Reorder stack:</span>
                Use the stack controls to change card order
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">Auto-stack:</span>
                Cards placed within 20px automatically stack
              </li>
            </ul>
          </div>

          {/* Zone Organization */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
              <Move className="w-4 h-4" />
              Zone Organization
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="font-medium text-green-900 mb-1">Active Conversation</div>
                <div className="text-green-700 text-xs">Topics currently being discussed</div>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded">
                <div className="font-medium text-gray-900 mb-1">Parking Lot</div>
                <div className="text-gray-700 text-xs">Topics to revisit later</div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="font-medium text-blue-900 mb-1">Resolved</div>
                <div className="text-blue-700 text-xs">Topics that have been addressed</div>
              </div>
              <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                <div className="font-medium text-orange-900 mb-1">Unresolved</div>
                <div className="text-orange-700 text-xs">Topics requiring further discussion</div>
              </div>
            </div>
          </div>

          {/* Card Types */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Card Types</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 p-2">
                <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
                <span>Conversation Topic</span>
              </div>
              <div className="flex items-center gap-2 p-2">
                <div className="w-4 h-4 bg-blue-50 border-2 border-blue-300 rounded"></div>
                <span>Open Question</span>
              </div>
              <div className="flex items-center gap-2 p-2">
                <div className="w-4 h-4 bg-red-50 border-2 border-red-300 rounded"></div>
                <span>Accusation</span>
              </div>
              <div className="flex items-center gap-2 p-2">
                <div className="w-4 h-4 bg-yellow-50 border-2 border-yellow-300 rounded"></div>
                <span>Factual Statement</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}