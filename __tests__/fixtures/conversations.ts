export const mockConversation = {
  id: 'test-conversation-1',
  title: 'Test Conversation',
  description: 'A test conversation for testing purposes',
  status: 'active' as const,
  startTime: Date.now() - 60000, // Started 1 minute ago
  endTime: null,
  duration: 60000, // 1 minute
  createdAt: Date.now() - 60000,
  updatedAt: Date.now(),
}

export const mockConversations = [
  mockConversation,
  {
    ...mockConversation,
    id: 'test-conversation-2',
    title: 'Completed Conversation',
    status: 'completed' as const,
    endTime: Date.now(),
    duration: 120000, // 2 minutes
  },
]

export const mockConversationEvent = {
  id: 'test-event-1',
  conversationId: 'test-conversation-1',
  type: 'card.created',
  data: {
    id: 'test-card-1',
    type: 'topic',
    zone: 'active',
  },
  timestamp: Date.now(),
}

export const createMockConversation = (overrides: Partial<typeof mockConversation> = {}) => ({
  ...mockConversation,
  ...overrides,
})