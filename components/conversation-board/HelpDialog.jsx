/**
 * HelpDialog Component
 * Updated shortcuts: ctrl+o → Opinion; ctrl+f → Fact; includes Guess.
 */

'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Keyboard, Mouse, Layers, Move } from 'lucide-react';

export function HelpDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>The Stack — Help</DialogTitle>
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
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="text-gray-600 dark:text-gray-300">New Topic</span>
                  <kbd className="px-2 py-1 text-xs bg-white dark:bg-gray-900 border rounded">ctrl + n</kbd>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="text-gray-600 dark:text-gray-300">New Question</span>
                  <kbd className="px-2 py-1 text-xs bg-white dark:bg-gray-900 border rounded">ctrl + q</kbd>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="text-gray-600 dark:text-gray-300">New Accusation</span>
                  <kbd className="px-2 py-1 text-xs bg-white dark:bg-gray-900 border rounded">ctrl + a</kbd>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="text-gray-600 dark:text-gray-300">New Fact</span>
                  <kbd className="px-2 py-1 text-xs bg-white dark:bg-gray-900 border rounded">ctrl + f</kbd>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="text-gray-600 dark:text-gray-300">New Opinion</span>
                  <kbd className="px-2 py-1 text-xs bg-white dark:bg-gray-900 border rounded">ctrl + o</kbd>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="text-gray-600 dark:text-gray-300">New Guess</span>
                  <kbd className="px-2 py-1 text-xs bg-white dark:bg-gray-900 border rounded">ctrl + g</kbd>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="text-gray-600 dark:text-gray-300">Delete Card</span>
                  <kbd className="px-2 py-1 text-xs bg-white dark:bg-gray-900 border rounded">Delete</kbd>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="text-gray-600 dark:text-gray-300">Reset Layout</span>
                  <kbd className="px-2 py-1 text-xs bg-white dark:bg-gray-900 border rounded">r</kbd>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                  <span className="text-gray-600 dark:text-gray-300">Deselect</span>
                  <kbd className="px-2 py-1 text-xs bg-white dark:bg-gray-900 border rounded">esc</kbd>
                </div>
              </div>
            </div>
          </div>

          {/* Mouse Actions */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
              <Mouse className="w-4 h-4" />
              Mouse Actions
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="font-medium">Drag cards:</span>
                Click and drag the card header (left side) to move cards
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
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="font-medium">Stack cards:</span>
                Drop one card onto another of the same type to stack them
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium">Unstack cards:</span>
                Use the stack controls on the card
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
              <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded">
                <div className="font-medium text-green-900 dark:text-green-100 mb-1">Active Conversation</div>
                <div className="text-green-700 dark:text-green-200 text-xs">Topics currently being discussed</div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded">
                <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">Parking Lot</div>
                <div className="text-gray-700 dark:text-gray-300 text-xs">Topics to revisit later</div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded">
                <div className="font-medium text-blue-900 dark:text-blue-100 mb-1">Resolved</div>
                <div className="text-blue-700 dark:text-blue-200 text-xs">Topics that have been addressed</div>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded">
                <div className="font-medium text-orange-900 dark:text-orange-100 mb-1">Unresolved</div>
                <div className="text-orange-700 dark:text-orange-200 text-xs">Topics requiring further discussion</div>
              </div>
            </div>
          </div>

          {/* Card Types legend (incl. Guess & Opinion) */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Card Types</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 p-2">
                <div className="w-4 h-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded"></div>
                <span>Topic</span>
              </div>
              <div className="flex items-center gap-2 p-2">
                <div className="w-4 h-4 bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-300 dark:border-blue-500/50 rounded"></div>
                <span>Question</span>
              </div>
              <div className="flex items-center gap-2 p-2">
                <div className="w-4 h-4 bg-red-50 dark:bg-red-950/35 border-2 border-red-300 dark:border-red-500/50 rounded"></div>
                <span>Accusation</span>
              </div>
              <div className="flex items-center gap-2 p-2">
                <div className="w-4 h-4 bg-yellow-50 dark:bg-yellow-950/30 border-2 border-yellow-300 dark:border-yellow-500/50 rounded"></div>
                <span>Fact</span>
              </div>
              <div className="flex items-center gap-2 p-2">
                <div className="w-4 h-4 bg-purple-50 dark:bg-purple-950/35 border-2 border-purple-300 dark:border-purple-500/50 rounded"></div>
                <span>Guess</span>
              </div>
              <div className="flex items-center gap-2 p-2">
                <div className="w-4 h-4 bg-pink-50 dark:bg-pink-950/35 border-2 border-pink-300 dark:border-pink-500/50 rounded"></div>
                <span>Opinion</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}