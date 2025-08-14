'use client';

import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Format duration helper
function fmtDuration(ms) {
  if (!ms || ms < 0) return '00:00:00';
  const s = Math.floor(ms / 1000);
  const h = String(Math.floor(s / 3600)).padStart(2, '0');
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${h}:${m}:${ss}`;
}

// Calculate runtime for a conversation
function getConversationRuntime(conversation) {
  if (!conversation) return '00:00:00';
  
  if (conversation.status === 'active') {
    const base = conversation.startedAt || Date.now();
    const paused = conversation.pausedAt ? conversation.pausedAt - base : 0;
    return fmtDuration(Date.now() - base - (paused > 0 ? paused : 0));
  }
  
  if (conversation.status === 'paused' && conversation.startedAt) {
    return fmtDuration((conversation.pausedAt || Date.now()) - conversation.startedAt);
  }
  
  if (conversation.status === 'stopped' && conversation.startedAt) {
    return fmtDuration((conversation.stoppedAt || conversation.updatedAt) - conversation.startedAt);
  }
  
  return '00:00:00';
}

// Status badge component
function StatusBadge({ status }) {
  const statusStyles = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', 
    stopped: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[status] || statusStyles.stopped}`}>
      {status || 'unknown'}
    </span>
  );
}

export function ConversationSelector({ conversations, selectedId }) {
  const router = useRouter();

  const handleChange = (value) => {
    if (value === 'none' || !value) {
      router.push('/timeline/none');
    } else {
      router.push(`/timeline/${value}`);
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedId);

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Select Conversation
        </label>
        <Select 
          value={selectedId || 'none'} 
          onValueChange={handleChange}
        >
          <SelectTrigger className="w-80">
            <SelectValue placeholder="Choose a conversation to explore" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none" disabled>
              Choose a conversation to explore
            </SelectItem>
            {conversations.map((conversation) => (
              <SelectItem key={conversation.id} value={conversation.id}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{conversation.name}</span>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <StatusBadge status={conversation.status} />
                      <span>•</span>
                      <span>{getConversationRuntime(conversation)}</span>
                      <span>•</span>
                      <span>
                        {new Date(conversation.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Selected conversation info */}
      {selectedConversation && (
        <div className="hidden sm:flex flex-col text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {selectedConversation.name}
            </span>
            <StatusBadge status={selectedConversation.status} />
          </div>
          <div className="text-gray-600 dark:text-gray-400">
            Runtime: {getConversationRuntime(selectedConversation)} • 
            Created: {new Date(selectedConversation.createdAt).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
}
