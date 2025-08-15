'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { ConversationTimeline } from '@/components/timeline/ConversationTimeline';
import { ConversationSelector } from '@/components/timeline/ConversationSelector';
import { AppHeader } from '@/components/ui/app-header';
import { LeftTray } from '@/components/ui/left-tray';
import { useConversations } from '@/lib/hooks/useConversations';
import { RefreshCw, Calendar, MessageCircle, List, TreePine } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Format date helper  
function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export default function TimelinePage() {
  const params = useParams();
  const conversationId = params?.conversationId;
  
  const {
    loading,
    error, 
    items: conversations,
    refresh,
    listEvents
  } = useConversations();

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(null);
  const [trayOpen, setTrayOpen] = useState(false);
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'list'

  // Find the selected conversation
  const selectedConversation = useMemo(() => 
    conversations?.find(c => c.id === conversationId) || null,
    [conversations, conversationId]
  );

  // Load events for the selected conversation
  useEffect(() => {
    if (!conversationId || !listEvents) return;
    
    async function loadEvents() {
      setEventsLoading(true);
      setEventsError(null);
      
      try {
        const eventData = await listEvents(conversationId);
        setEvents(eventData || []);
      } catch (err) {
        console.error('Failed to load events:', err);
        setEventsError('Failed to load timeline events');
      } finally {
        setEventsLoading(false);
      }
    }
    
    loadEvents();
  }, [conversationId, listEvents]);

  // Refresh handler
  const handleRefresh = async () => {
    if (!conversationId || !listEvents) return;
    
    try {
      await refresh();
      const eventData = await listEvents(conversationId);
      setEvents(eventData || []);
    } catch (err) {
      console.error('Failed to refresh:', err);
    }
  };

  const rightControls = (
    <Button 
      variant="outline"
      onClick={handleRefresh}
      className="h-[40px] leading-none"
      disabled={loading || eventsLoading}
    >
      <RefreshCw className={`w-4 h-4 mr-2 ${loading || eventsLoading ? 'animate-spin' : ''}`} />
      Refresh
    </Button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-600 dark:text-gray-300" />
          <p className="text-gray-600 dark:text-gray-300">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center text-red-600">
          <p className="mb-4">Error loading conversations: {error}</p>
          <Button onClick={refresh} variant="outline" className="h-10 leading-none">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <AppHeader
        title="Timeline Explorer"
        subtitle="Visual conversation flow and card activity"
        onOpenTray={() => setTrayOpen(true)}
        showConversationControls={false}
        showAppActions={false}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Enhanced Header with All Controls */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          {/* Top Row: Conversation Selector and Refresh */}
          <div className="flex items-center justify-between mb-4">
            <ConversationSelector 
              conversations={conversations || []}
              selectedId={conversationId}
            />
            <div className="flex items-center gap-3">
              {rightControls}
            </div>
          </div>

          {/* Bottom Row: Conversation Info and View Toggle */}
          {selectedConversation && (
            <div className="flex items-center justify-between">
              {/* Left: Conversation Title and Details */}
              <div className="flex items-center gap-6">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {selectedConversation.name}
                  </h1>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {formatDate(selectedConversation.createdAt)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {events.length} events
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="relative">
                      <span className={`w-2.5 h-2.5 rounded-full flex ${
                        selectedConversation.status === 'active' ? 'bg-green-500' :
                        selectedConversation.status === 'paused' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`} />
                      {selectedConversation.status === 'active' && (
                        <span className="absolute inset-0 w-2.5 h-2.5 bg-green-400 rounded-full animate-ping opacity-40" />
                      )}
                    </div>
                    <span className="text-gray-600 dark:text-gray-300 capitalize font-medium">
                      {selectedConversation.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: View Mode Toggle */}
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex gap-1">
                <button
                  onClick={() => setViewMode('tree')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200 text-sm ${
                    viewMode === 'tree'
                      ? 'bg-white dark:bg-gray-600 shadow-sm text-emerald-600 dark:text-emerald-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <TreePine className="w-4 h-4" />
                  <span className="font-medium">Tree</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200 text-sm ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 shadow-sm text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span className="font-medium">List</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-auto">
          {!conversationId ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p className="text-lg font-semibold mb-2">Select a Conversation</p>
                <p>Choose a conversation from the dropdown above to view its timeline</p>
              </div>
            </div>
          ) : eventsLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-600 dark:text-gray-300" />
                <p className="text-gray-600 dark:text-gray-300">Loading timeline...</p>
              </div>
            </div>
          ) : eventsError ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-red-600">
                <p className="mb-4">{eventsError}</p>
                <Button onClick={handleRefresh} variant="outline" className="h-10 leading-none">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          ) : (
            <ConversationTimeline
              conversation={selectedConversation}
              events={events}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          )}
        </div>
      </div>

      {/* Left Tray */}
      <LeftTray
        isOpen={trayOpen}
        onClose={() => setTrayOpen(false)}
      />
    </div>
  );
}
