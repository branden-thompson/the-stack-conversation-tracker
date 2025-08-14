'use client';

import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


export function ConversationSelector({ conversations, selectedId }) {
  const router = useRouter();

  const handleChange = (value) => {
    if (value === 'none' || !value) {
      router.push('/timeline/none');
    } else {
      router.push(`/timeline/${value}`);
    }
  };

  return (
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
              {conversation.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
