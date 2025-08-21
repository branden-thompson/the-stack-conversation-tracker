/**
 * Card Events SSE Test Page
 * 
 * PURPOSE: Test and validate real-time card events SSE functionality
 * URL: /test/card-events-sse
 * 
 * TESTS:
 * - Real-time card state synchronization 
 * - Card flip event detection with debugging
 * - Performance monitoring at 1-second intervals
 * - Background operation for dev/convos compatibility
 */

'use client';

import { CardEventsSSETest } from '@/components/test/CardEventsSSETest';

export default function CardEventsSSETestPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Card Events SSE Testing
        </h1>
        <p className="text-gray-600">
          Test real-time card events with 1-second intervals for multi-user collaboration.
          This validates card flip, move, and update synchronization across browser tabs.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regular Card Events Test */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Regular Card Events</h2>
          <CardEventsSSETest forDevPages={false} />
        </div>
        
        {/* Dev Pages Optimized Test */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Dev Pages Mode (800ms)</h2>
          <CardEventsSSETest forDevPages={true} />
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Testing Instructions</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p><strong>1. Card Flip Testing:</strong> Open another browser tab to the main app and flip a card. Watch for flip events in the log above.</p>
          <p><strong>2. Multi-Tab Testing:</strong> Open this page in multiple tabs to test coordination and prevent duplicate hooks.</p>
          <p><strong>3. Background Testing:</strong> Switch to another tab and back - updates should continue in background for dev/convos compatibility.</p>
          <p><strong>4. Performance Testing:</strong> Monitor request rates, response times, and success rates in the metrics panel.</p>
          <p><strong>5. Dev Pages Mode:</strong> The right panel tests faster 800ms intervals optimized for dev pages like /dev/convos.</p>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold mb-2">Expected Behavior</h3>
        <div className="text-sm text-gray-700 space-y-1">
          <p>✅ Connection status should be "connected" when working</p>
          <p>✅ Registration should show "Yes" (only one hook per endpoint)</p>
          <p>✅ Regular mode: 1000ms intervals, Dev Pages mode: 800ms intervals</p>
          <p>✅ Real-time should show "Yes" for both modes</p>
          <p>✅ Cards should update immediately when changed in other tabs</p>
          <p>✅ Events should appear in the log when cards are flipped/moved/updated</p>
          <p>✅ Background operation should continue when tab is not active</p>
        </div>
      </div>
    </div>
  );
}