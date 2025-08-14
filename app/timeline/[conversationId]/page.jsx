'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { ConversationTimeline } from '@/components/timeline/ConversationTimeline';
import { ConversationSelector } from '@/components/timeline/ConversationSelector';
import { AppHeader } from '@/components/ui/app-header';
import { LeftTray } from '@/components/ui/left-tray';
import { useConversations } from '@/lib/hooks/useConversations';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        {/* Conversation Selector */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <ConversationSelector 
              conversations={conversations || []}
              selectedId={conversationId}
            />
            <div className="flex items-center gap-3">
              {rightControls}
            </div>
          </div>
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
            />
          )}
        </div>
      </div>

      {/* Left Tray */}
      <LeftTray
        open={trayOpen}
        onClose={() => setTrayOpen(false)}
        items={[
          { label: 'Main Board', href: '/' },
          { label: 'Dev: Conversations', href: '/dev/convos' },
          { label: 'Dev: Tests', href: '/dev/tests' },
          { label: 'Dev: Coverage', href: '/dev/coverage' }
        ]}
      />
    </div>
  );
}
