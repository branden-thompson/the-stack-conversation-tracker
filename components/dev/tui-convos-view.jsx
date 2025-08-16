/**
 * TUI Conversations View
 * Full terminal UI implementation for /dev/convos page
 */

'use client';

import React, { useState, useMemo } from 'react';
import { TUIButtonProper, TUIPanel, TUIInput, TUIGrid, TUIScrollbar } from '@/components/ui/tui-components-enhanced';
import { BOX_CHARS, TUI_COLORS, CHAR_DIMENSIONS } from '@/lib/styles/tui-theme';

/**
 * TUI List Item - for conversation list
 */
function TUIListItem({ 
  selected = false, 
  title, 
  subtitle, 
  status,
  onClick,
  children 
}) {
  const [hover, setHover] = useState(false);
  const chars = selected ? BOX_CHARS.double : BOX_CHARS.single;
  
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '0.5em 1em',
        marginBottom: '2px',
        background: selected ? TUI_COLORS.surface : (hover ? TUI_COLORS.backgroundAlt : 'transparent'),
        border: `1px solid ${selected ? TUI_COLORS.primary : (hover ? TUI_COLORS.border : 'transparent')}`,
        color: selected ? TUI_COLORS.secondary : TUI_COLORS.text,
        cursor: 'pointer',
        position: 'relative',
        fontFamily: 'inherit',
        boxShadow: selected ? `0 0 10px ${TUI_COLORS.primaryGlow}` : 'none',
      }}
    >
      {/* Status indicator */}
      {status && (
        <span style={{
          position: 'absolute',
          right: '1em',
          top: '0.5em',
          padding: '0 0.5em',
          background: status === 'active' ? TUI_COLORS.success : 
                     status === 'paused' ? TUI_COLORS.warning : 
                     TUI_COLORS.textDim,
          color: TUI_COLORS.background,
          fontSize: '0.8em',
          borderRadius: '2px',
        }}>
          [{status.toUpperCase()}]
        </span>
      )}
      
      <div style={{ fontWeight: 'bold', marginBottom: '0.25em' }}>{title}</div>
      {subtitle && (
        <div style={{ fontSize: '0.85em', opacity: 0.7 }}>{subtitle}</div>
      )}
      {children && (
        <div style={{ marginTop: '0.5em' }}>{children}</div>
      )}
    </div>
  );
}

/**
 * TUI Event Entry - for timeline/events
 */
function TUIEventEntry({ type, timestamp, payload, isTimeline = false }) {
  const getTypeColor = () => {
    switch (type) {
      case 'card.created': return TUI_COLORS.success;
      case 'card.moved': return TUI_COLORS.info;
      case 'card.updated': return TUI_COLORS.warning;
      case 'card.deleted': return TUI_COLORS.error;
      default: return TUI_COLORS.text;
    }
  };
  
  const getTypeSymbol = () => {
    switch (type) {
      case 'card.created': return '+';
      case 'card.moved': return '→';
      case 'card.updated': return '~';
      case 'card.deleted': return '×';
      default: return '•';
    }
  };
  
  if (isTimeline) {
    return (
      <div style={{ 
        display: 'flex',
        alignItems: 'flex-start',
        marginBottom: '0.5em',
        fontFamily: 'inherit',
        width: '100%',
        boxSizing: 'border-box',
      }}>
        <span style={{ 
          color: getTypeColor(),
          marginRight: '1em',
          fontSize: '1.2em',
          flexShrink: 0,
        }}>
          {getTypeSymbol()}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: getTypeColor(), marginBottom: '0.25em' }}>
            {type}
          </div>
          <div style={{ fontSize: '0.85em', opacity: 0.7 }}>
            {timestamp}
          </div>
          {payload && (
            <div style={{ 
              fontSize: '0.85em', 
              opacity: 0.8,
              marginTop: '0.25em',
              paddingLeft: '1em',
              borderLeft: `1px solid ${TUI_COLORS.borderDim}`,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {Object.entries(payload).map(([key, value]) => (
                <div key={key} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {key}: {JSON.stringify(value)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Events view (more detailed)
  return (
    <div style={{
      padding: '0.75em',
      marginBottom: '0.5em',
      border: `1px solid ${TUI_COLORS.borderDim}`,
      background: TUI_COLORS.backgroundAlt,
      fontFamily: 'inherit',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      <div style={{ 
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '0.5em',
        flexWrap: 'wrap',
        gap: '0.5em',
      }}>
        <span style={{ color: getTypeColor(), fontWeight: 'bold' }}>
          [{getTypeSymbol()}] {type}
        </span>
        <span style={{ fontSize: '0.85em', opacity: 0.7 }}>
          {timestamp}
        </span>
      </div>
      <pre style={{
        fontSize: '0.85em',
        opacity: 0.9,
        overflow: 'auto',
        maxHeight: '100px',
        padding: '0.5em',
        background: TUI_COLORS.background,
        border: `1px solid ${TUI_COLORS.border}`,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
        margin: 0,
      }}>
        {JSON.stringify(payload, null, 2)}
      </pre>
    </div>
  );
}

/**
 * Main TUI Conversations View
 */
export function TUIConvosView({
  // Data
  conversations = [],
  selectedConversation = null,
  events = [],
  timeline = [],
  
  // Actions
  onCreateConversation,
  onSelectConversation,
  onStartConversation,
  onPauseConversation,
  onStopConversation,
  onDeleteConversation,
  onExportConversation,
  onClearEvents,
  onEmitEvent,
  
  // State
  loading = false,
  error = null,
  runtime = '00:00:00',
  pollingEnabled = true,
  onTogglePolling,
}) {
  const [newConvoName, setNewConvoName] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <div style={{
      display: 'flex',
      gap: '1em',
      padding: '1em',
      height: 'calc(100vh - 80px)', // Account for header
      fontFamily: 'Roboto Mono, monospace',
      overflow: 'hidden',
    }}>
      {/* LEFT PANEL - Conversations List */}
      <div style={{ width: '350px', display: 'flex', flexDirection: 'column' }}>
        <TUIPanel 
          title="CONVERSATIONS" 
          scrollable={true}
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          {/* New conversation input */}
          <div style={{ marginBottom: '1em', padding: '0 0.5em' }}>
            <TUIInput
              value={newConvoName}
              onChange={setNewConvoName}
              placeholder="New conversation name..."
              style={{ width: '100%', marginBottom: '0.5em' }}
            />
            <TUIButtonProper
              onClick={() => {
                if (newConvoName.trim()) {
                  onCreateConversation(newConvoName.trim());
                  setNewConvoName('');
                }
              }}
              variant="primary"
              style={{ width: '100%' }}
            >
              CREATE
            </TUIButtonProper>
          </div>
        
          {/* Conversations list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5em' }}>
            {loading && <div style={{ color: TUI_COLORS.textMuted, padding: '0.5em' }}>Loading...</div>}
            {error && <div style={{ color: TUI_COLORS.error, padding: '0.5em' }}>Error: {error}</div>}
            {conversations.map((conv) => (
            <TUIListItem
              key={conv.id}
              selected={selectedConversation?.id === conv.id}
              title={conv.name}
              subtitle={new Date(conv.createdAt).toLocaleString()}
              status={conv.status}
              onClick={() => onSelectConversation(conv.id)}
            >
              {/* Control buttons */}
              <div style={{ 
                display: 'flex', 
                gap: '0.5em',
                marginTop: '0.5em',
                flexWrap: 'wrap',
              }}>
                <TUIButtonProper
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartConversation(conv.id);
                  }}
                  variant={conv.status === 'active' ? 'success' : 'default'}
                  disabled={conv.status === 'active'}
                  style={{ padding: '0.25em 0.5em', fontSize: '0.85em' }}
                >
                  START
                </TUIButtonProper>
                <TUIButtonProper
                  onClick={(e) => {
                    e.stopPropagation();
                    onPauseConversation(conv.id);
                  }}
                  variant="warning"
                  disabled={conv.status !== 'active'}
                  style={{ padding: '0.25em 0.5em', fontSize: '0.85em' }}
                >
                  PAUSE
                </TUIButtonProper>
                <TUIButtonProper
                  onClick={(e) => {
                    e.stopPropagation();
                    onStopConversation(conv.id);
                  }}
                  variant="default"
                  style={{ padding: '0.25em 0.5em', fontSize: '0.85em' }}
                >
                  STOP
                </TUIButtonProper>
                <TUIButtonProper
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conv.id);
                  }}
                  variant="error"
                  style={{ padding: '0.25em 0.5em', fontSize: '0.85em' }}
                >
                  DELETE
                </TUIButtonProper>
              </div>
            </TUIListItem>
            ))}
          </div>
        </TUIPanel>
      </div>
      
      {/* RIGHT PANEL - Split view */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '1em',
        minHeight: 0,
        overflow: 'hidden',
      }}>
        {/* Details bar */}
        {selectedConversation && (
          <TUIPanel title="DETAILS" style={{ padding: '0.5em' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div>
                <span style={{ color: TUI_COLORS.accent, fontWeight: 'bold' }}>
                  {selectedConversation.name}
                </span>
                <span style={{ marginLeft: '2em', color: TUI_COLORS.textMuted }}>
                  ID: {selectedConversation.id}
                </span>
                <span style={{ 
                  marginLeft: '2em',
                  padding: '0 0.5em',
                  background: selectedConversation.status === 'active' ? TUI_COLORS.success :
                            selectedConversation.status === 'paused' ? TUI_COLORS.warning :
                            TUI_COLORS.textDim,
                  color: TUI_COLORS.background,
                }}>
                  [{selectedConversation.status.toUpperCase()}]
                </span>
                <span style={{ marginLeft: '2em', color: TUI_COLORS.secondary }}>
                  {runtime}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5em' }}>
                <TUIButtonProper
                  onClick={onTogglePolling}
                  variant={pollingEnabled ? 'success' : 'default'}
                  style={{ padding: '0.25em 0.5em' }}
                >
                  LIVE: {pollingEnabled ? 'ON' : 'OFF'}
                </TUIButtonProper>
                <TUIButtonProper
                  onClick={() => onExportConversation(selectedConversation)}
                  variant="secondary"
                  style={{ padding: '0.25em 0.5em' }}
                >
                  EXPORT
                </TUIButtonProper>
                <TUIButtonProper
                  onClick={() => onClearEvents(selectedConversation.id)}
                  variant="error"
                  style={{ padding: '0.25em 0.5em' }}
                  disabled={!events.length}
                >
                  CLEAR
                </TUIButtonProper>
              </div>
            </div>
          </TUIPanel>
        )}
        
        {/* Timeline and Events panels */}
        <div style={{
          flex: 1,
          display: 'flex',
          gap: '1em',
          minHeight: 0,
          overflow: 'hidden',
        }}>
          {/* Timeline */}
          <div style={{ flex: 1, display: 'flex' }}>
            <TUIPanel 
              title="TIMELINE" 
              scrollable={true}
              style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0.5em' }}>
                {selectedConversation ? (
                  timeline.length ? (
                    <div style={{ paddingRight: '0.5em' }}>
                      {timeline.map((event, idx) => (
                        <TUIEventEntry
                          key={event.id || idx}
                          type={event.type}
                          timestamp={new Date(event.at).toLocaleString()}
                          payload={event.payload}
                          isTimeline={true}
                        />
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: TUI_COLORS.textMuted, padding: '1em' }}>No timeline entries.</div>
                  )
                ) : (
                  <div style={{ color: TUI_COLORS.textMuted, padding: '1em' }}>Select a conversation to view timeline.</div>
                )}
              </div>
            </TUIPanel>
          </div>
          
          {/* Events */}
          <div style={{ flex: 1, display: 'flex' }}>
            <TUIPanel 
              title="EVENTS" 
              scrollable={true}
              style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '0.5em' }}>
                {selectedConversation ? (
                  events.length ? (
                    <div style={{ paddingRight: '0.5em' }}>
                      {events.map((event, idx) => (
                        <TUIEventEntry
                          key={event.id || idx}
                          type={event.type}
                          timestamp={new Date(event.at).toLocaleString()}
                          payload={event.payload}
                          isTimeline={false}
                        />
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: TUI_COLORS.textMuted, padding: '1em' }}>No events.</div>
                  )
                ) : (
                  <div style={{ color: TUI_COLORS.textMuted, padding: '1em' }}>Select a conversation to view events.</div>
                )}
              </div>
            </TUIPanel>
          </div>
        </div>
        
        {/* Emit controls */}
        {selectedConversation && (
          <TUIPanel title="EMIT EVENTS" style={{ padding: '0.5em' }}>
            <div style={{ display: 'flex', gap: '0.5em', flexWrap: 'wrap' }}>
              <TUIButtonProper
                onClick={() => onEmitEvent(selectedConversation.id, 'card.created', 
                  { id: crypto.randomUUID(), type: 'topic' })}
                variant="primary"
                style={{ padding: '0.25em 0.5em' }}
              >
                card.created
              </TUIButtonProper>
              <TUIButtonProper
                onClick={() => onEmitEvent(selectedConversation.id, 'card.moved',
                  { id: 'demo', from: 'active', to: 'resolved' })}
                variant="secondary"
                style={{ padding: '0.25em 0.5em' }}
              >
                card.moved
              </TUIButtonProper>
              <TUIButtonProper
                onClick={() => onEmitEvent(selectedConversation.id, 'card.updated',
                  { id: 'demo', content: 'edited' })}
                variant="warning"
                style={{ padding: '0.25em 0.5em' }}
              >
                card.updated
              </TUIButtonProper>
              <TUIButtonProper
                onClick={() => onEmitEvent(selectedConversation.id, 'card.deleted',
                  { id: 'demo' })}
                variant="error"
                style={{ padding: '0.25em 0.5em' }}
              >
                card.deleted
              </TUIButtonProper>
            </div>
          </TUIPanel>
        )}
      </div>
    </div>
  );
}