/**
 * Card Events SSE Test Component
 * 
 * CLASSIFICATION: TESTING COMPONENT | DEVELOPMENT ONLY
 * PURPOSE: Test and validate the Card Events SSE Hook functionality
 * 
 * FEATURES:
 * - Real-time card state monitoring
 * - Card flip event detection and logging
 * - Performance metrics display
 * - Background operation testing for dev/convos compatibility
 */

'use client';

import { useState } from 'react';
import { useSSECardEvents } from '@/lib/hooks/useSSECardEvents';

export function CardEventsSSETest({ forDevPages = false }) {
  const [testConfig, setTestConfig] = useState({
    enabled: true,
    includeMetadata: true,
    forDevPages: forDevPages,
    backgroundOperation: true
  });
  
  const [eventLog, setEventLog] = useState([]);
  
  // Initialize Card Events SSE Hook
  const cardEvents = useSSECardEvents({
    ...testConfig,
    onCardFlip: (flipEvent) => {
      const logEntry = {
        type: 'FLIP',
        timestamp: new Date().toLocaleTimeString(),
        event: flipEvent
      };
      setEventLog(prev => [logEntry, ...prev.slice(0, 9)]); // Keep last 10 events
      console.log('[CardEventsSSETest] Flip event detected:', flipEvent);
    },
    onCardMove: (moveEvent) => {
      const logEntry = {
        type: 'MOVE', 
        timestamp: new Date().toLocaleTimeString(),
        event: moveEvent
      };
      setEventLog(prev => [logEntry, ...prev.slice(0, 9)]);
      console.log('[CardEventsSSETest] Move event detected:', moveEvent);
    },
    onCardUpdate: (updateEvent) => {
      const logEntry = {
        type: 'UPDATE',
        timestamp: new Date().toLocaleTimeString(),
        event: updateEvent
      };
      setEventLog(prev => [logEntry, ...prev.slice(0, 9)]);
      console.log('[CardEventsSSETest] Update event detected:', updateEvent);
    }
  });
  
  const stats = cardEvents.getPerformanceStats();
  
  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Card Events SSE Test {forDevPages && '(Dev Pages Mode)'}
      </h3>
      
      {/* Configuration Controls */}
      <div className="mb-4 p-3 bg-gray-50 rounded">
        <h4 className="font-medium mb-2">Configuration</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={testConfig.enabled}
              onChange={(e) => setTestConfig(prev => ({ ...prev, enabled: e.target.checked }))}
              className="mr-2"
            />
            Enabled
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={testConfig.includeMetadata}
              onChange={(e) => setTestConfig(prev => ({ ...prev, includeMetadata: e.target.checked }))}
              className="mr-2"
            />
            Include Metadata
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={testConfig.backgroundOperation}
              onChange={(e) => setTestConfig(prev => ({ ...prev, backgroundOperation: e.target.checked }))}
              className="mr-2"
            />
            Background Operation
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={testConfig.forDevPages}
              onChange={(e) => setTestConfig(prev => ({ ...prev, forDevPages: e.target.checked }))}
              className="mr-2"
            />
            Dev Pages Mode
          </label>
        </div>
      </div>
      
      {/* Connection Status */}
      <div className="mb-4 p-3 bg-blue-50 rounded">
        <h4 className="font-medium mb-2">Connection Status</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Status: <span className={`font-medium ${
            cardEvents.connectionStatus === 'connected' ? 'text-green-600' :
            cardEvents.connectionStatus === 'error' ? 'text-red-600' : 'text-yellow-600'
          }`}>{cardEvents.connectionStatus}</span></div>
          <div>Registered: <span className={`font-medium ${cardEvents.isRegistered ? 'text-green-600' : 'text-red-600'}`}>
            {cardEvents.isRegistered ? 'Yes' : 'No'}
          </span></div>
          <div>Loading: {cardEvents.loading ? 'Yes' : 'No'}</div>
          <div>Cards: {cardEvents.totalCards}</div>
          <div>Interval: {cardEvents.interval}ms</div>
          <div>Real-time: {cardEvents.isRealTime ? 'Yes' : 'No'}</div>
        </div>
        {cardEvents.error && (
          <div className="mt-2 text-red-600 text-sm">Error: {cardEvents.error}</div>
        )}
        {cardEvents.lastUpdateTime && (
          <div className="mt-2 text-xs text-gray-500">
            Last update: {new Date(cardEvents.lastUpdateTime).toLocaleTimeString()}
          </div>
        )}
      </div>
      
      {/* Performance Stats */}
      <div className="mb-4 p-3 bg-green-50 rounded">
        <h4 className="font-medium mb-2">Performance Metrics</h4>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>Requests: {stats.totalRequests}</div>
          <div>Success Rate: {stats.successRate}%</div>
          <div>Avg Response: {stats.averageResponseTime.toFixed(1)}ms</div>
          <div>Req/Min: {stats.requestsPerMinute}</div>
          <div>Flip Events: {stats.cardFlipEvents}</div>
          <div>Move Events: {stats.cardMoveEvents}</div>
        </div>
      </div>
      
      {/* Current Cards */}
      <div className="mb-4 p-3 bg-purple-50 rounded">
        <h4 className="font-medium mb-2">Current Cards ({cardEvents.totalCards})</h4>
        <div className="max-h-40 overflow-y-auto">
          {cardEvents.cards.map(card => (
            <div key={card.id} className="text-xs mb-1 p-1 bg-white rounded">
              <span className="font-mono">{card.id.substring(0, 8)}</span> - 
              <span className={`ml-1 ${card.faceUp ? 'text-green-600' : 'text-red-600'}`}>
                {card.faceUp ? 'Face Up' : 'Face Down'}
              </span> - 
              <span className="ml-1 text-gray-600">{card.zone}</span>
              {card.content && <span className="ml-1 text-blue-600">"{card.content.substring(0, 20)}..."</span>}
            </div>
          ))}
        </div>
      </div>
      
      {/* Event Log */}
      <div className="mb-4 p-3 bg-yellow-50 rounded">
        <h4 className="font-medium mb-2">Recent Events ({eventLog.length})</h4>
        <div className="max-h-40 overflow-y-auto">
          {eventLog.map((log, index) => (
            <div key={index} className="text-xs mb-1 p-1 bg-white rounded">
              <span className="font-mono text-gray-500">{log.timestamp}</span> - 
              <span className={`ml-1 font-medium ${
                log.type === 'FLIP' ? 'text-purple-600' :
                log.type === 'MOVE' ? 'text-blue-600' : 'text-green-600'
              }`}>{log.type}</span> - 
              <span className="ml-1 text-gray-700">
                {log.type === 'FLIP' && `${log.event.cardId.substring(0, 8)} flipped ${log.event.from} → ${log.event.to}`}
                {log.type === 'MOVE' && `${log.event.cardId.substring(0, 8)} moved ${log.event.fromZone} → ${log.event.toZone}`}
                {log.type === 'UPDATE' && `${log.event.cardId.substring(0, 8)} updated`}
              </span>
            </div>
          ))}
          {eventLog.length === 0 && (
            <div className="text-xs text-gray-500 italic">No events detected yet</div>
          )}
        </div>
      </div>
      
      {/* Manual Controls */}
      <div className="p-3 bg-gray-50 rounded">
        <h4 className="font-medium mb-2">Manual Controls</h4>
        <div className="flex gap-2">
          <button
            onClick={cardEvents.refreshCardEvents}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            disabled={cardEvents.loading}
          >
            {cardEvents.loading ? 'Loading...' : 'Refresh Now'}
          </button>
          <button
            onClick={() => setEventLog([])}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            Clear Log
          </button>
        </div>
      </div>
    </div>
  );
}