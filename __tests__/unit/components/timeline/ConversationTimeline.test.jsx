import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConversationTimeline } from '@/components/timeline/ConversationTimeline';

// Mock the TimelineNode component
vi.mock('@/components/timeline/TimelineNode', () => ({
  TimelineNode: ({ event, isLeft, showTime }) => (
    <div data-testid={`timeline-node-${event.id}`} data-is-left={isLeft} data-show-time={showTime}>
      <span>{event.type}</span>
      <span>{event.payload?.id || 'no-id'}</span>
    </div>
  )
}));

const mockConversation = {
  id: 'conv-123',
  name: 'Test Conversation',
  status: 'active',
  createdAt: Date.now() - 3600000, // 1 hour ago
  startedAt: Date.now() - 3600000,
  updatedAt: Date.now()
};

const mockEvents = [
  {
    id: 'event-1',
    type: 'card.created',
    payload: { id: 'card-1', type: 'topic', zone: 'active' },
    at: Date.now() - 3000000
  },
  {
    id: 'event-2', 
    type: 'card.moved',
    payload: { id: 'card-1', from: 'active', to: 'completed' },
    at: Date.now() - 2000000
  },
  {
    id: 'event-3',
    type: 'card.updated',
    payload: { id: 'card-1', fields: ['content'] },
    at: Date.now() - 1000000
  }
];

describe('ConversationTimeline', () => {
  it('renders conversation header with correct information', () => {
    render(<ConversationTimeline conversation={mockConversation} events={mockEvents} />);
    
    expect(screen.getByText('Test Conversation')).toBeInTheDocument();
    expect(screen.getByText('3 events')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('renders all timeline events', () => {
    render(<ConversationTimeline conversation={mockConversation} events={mockEvents} />);
    
    expect(screen.getByTestId('timeline-node-event-1')).toBeInTheDocument();
    expect(screen.getByTestId('timeline-node-event-2')).toBeInTheDocument();
    expect(screen.getByTestId('timeline-node-event-3')).toBeInTheDocument();
  });

  it('alternates left/right positioning for events', () => {
    render(<ConversationTimeline conversation={mockConversation} events={mockEvents} />);
    
    // First event should be on the left (isLeft=true for even index)
    expect(screen.getByTestId('timeline-node-event-1')).toHaveAttribute('data-is-left', 'true');
    // Second event should be on the right (isLeft=false for odd index)  
    expect(screen.getByTestId('timeline-node-event-2')).toHaveAttribute('data-is-left', 'false');
    // Third event should be on the left again
    expect(screen.getByTestId('timeline-node-event-3')).toHaveAttribute('data-is-left', 'true');
  });

  it('shows "No Conversation Selected" when conversation is null', () => {
    render(<ConversationTimeline conversation={null} events={mockEvents} />);
    
    expect(screen.getByText('No Conversation Selected')).toBeInTheDocument();
    expect(screen.getByText('Select a conversation to view its timeline')).toBeInTheDocument();
  });

  it('shows "No Timeline Events" when events array is empty', () => {
    render(<ConversationTimeline conversation={mockConversation} events={[]} />);
    
    expect(screen.getByText('No Timeline Events')).toBeInTheDocument();
    expect(screen.getByText('This conversation doesn\'t have any recorded events yet')).toBeInTheDocument();
  });

  it('shows "No Timeline Events" when events is null', () => {
    render(<ConversationTimeline conversation={mockConversation} events={null} />);
    
    expect(screen.getByText('No Timeline Events')).toBeInTheDocument();
  });

  it('groups events by date correctly', () => {
    const eventsOnDifferentDays = [
      {
        id: 'event-today',
        type: 'card.created',
        payload: { id: 'card-1', type: 'topic' },
        at: Date.now()
      },
      {
        id: 'event-yesterday',
        type: 'card.moved', 
        payload: { id: 'card-1', from: 'active', to: 'completed' },
        at: Date.now() - 86400000 // 1 day ago
      }
    ];

    render(<ConversationTimeline conversation={mockConversation} events={eventsOnDifferentDays} />);
    
    // Should show both events
    expect(screen.getByTestId('timeline-node-event-today')).toBeInTheDocument();
    expect(screen.getByTestId('timeline-node-event-yesterday')).toBeInTheDocument();
  });

  it('displays conversation status correctly', () => {
    const pausedConversation = { ...mockConversation, status: 'paused' };
    render(<ConversationTimeline conversation={pausedConversation} events={mockEvents} />);
    
    expect(screen.getByText('paused')).toBeInTheDocument();
  });

  it('passes showTime prop to TimelineNode components', () => {
    render(<ConversationTimeline conversation={mockConversation} events={mockEvents} />);
    
    // All timeline nodes should have showTime=true
    expect(screen.getByTestId('timeline-node-event-1')).toHaveAttribute('data-show-time', 'true');
    expect(screen.getByTestId('timeline-node-event-2')).toHaveAttribute('data-show-time', 'true');
    expect(screen.getByTestId('timeline-node-event-3')).toHaveAttribute('data-show-time', 'true');
  });
});
