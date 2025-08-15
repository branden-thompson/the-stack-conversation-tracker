import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConversationTimeline } from '@/components/timeline/ConversationTimeline';

// Mock the child components
vi.mock('@/components/timeline/TimelineNode', () => ({
  TimelineNode: ({ event, isLeft, showTime }) => (
    <div data-testid={`timeline-node-${event.id}`} data-is-left={isLeft} data-show-time={showTime}>
      <span>{event.type}</span>
      <span>{event.payload?.id || 'no-id'}</span>
    </div>
  )
}));

vi.mock('@/components/timeline/TreeTimeline', () => ({
  TreeTimeline: ({ conversation, events }) => (
    <div data-testid="tree-timeline">
      <span>Tree view for {conversation?.name}</span>
      <span>{events?.length} events</span>
    </div>
  )
}));

// Mock the shared utilities
vi.mock('@/lib/hooks/useExpansionState', () => ({
  useExpansionState: () => ({
    isExpanded: vi.fn(() => false),
    toggleItem: vi.fn(),
    expandAll: vi.fn(),
    collapseAll: vi.fn()
  })
}));

vi.mock('@/lib/utils/timelineFormatters', () => ({
  formatTime: vi.fn(() => '12:00:00'),
  formatDate: vi.fn(() => 'Jan 1, 2024')
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
  it('renders tree timeline by default', () => {
    render(<ConversationTimeline conversation={mockConversation} events={mockEvents} viewMode="tree" />);
    
    expect(screen.getByTestId('tree-timeline')).toBeInTheDocument();
    expect(screen.getByText('Tree view for Test Conversation')).toBeInTheDocument();
    expect(screen.getByText('3 events')).toBeInTheDocument();
  });

  it('renders accordion list view when viewMode is list', () => {
    render(<ConversationTimeline conversation={mockConversation} events={mockEvents} viewMode="list" />);
    
    // Should render accordion header
    expect(screen.getByText('Card')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
  });

  it('shows expand/collapse controls in list view', () => {
    render(<ConversationTimeline conversation={mockConversation} events={mockEvents} viewMode="list" />);
    
    expect(screen.getByText('Expand All')).toBeInTheDocument();
    expect(screen.getByText('Collapse All')).toBeInTheDocument();
  });

  it('shows welcome message when conversation is null', () => {
    render(<ConversationTimeline conversation={null} events={mockEvents} viewMode="tree" />);
    
    expect(screen.getByText('Welcome to Timeline Explorer')).toBeInTheDocument();
    expect(screen.getByText('Select a conversation from the dropdown above to begin')).toBeInTheDocument();
  });

  it('shows empty timeline message when no events', () => {
    render(<ConversationTimeline conversation={mockConversation} events={[]} viewMode="list" />);
    
    expect(screen.getByText('Timeline is Empty')).toBeInTheDocument();
    expect(screen.getByText('This conversation doesn\'t have any recorded events yet')).toBeInTheDocument();
  });

  it('handles null events gracefully', () => {
    render(<ConversationTimeline conversation={mockConversation} events={null} viewMode="list" />);
    
    expect(screen.getByText('Timeline is Empty')).toBeInTheDocument();
  });

  it('displays card information in list view', () => {
    render(<ConversationTimeline conversation={mockConversation} events={mockEvents} viewMode="list" />);
    
    // Should show accordion headers
    expect(screen.getByText('Card')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
    expect(screen.getByText('Created')).toBeInTheDocument();
    
    // Should show card row with card info
    expect(screen.getByText('topic (card-1)')).toBeInTheDocument();
  });

  it('can switch between tree and list views', () => {
    const { rerender } = render(<ConversationTimeline conversation={mockConversation} events={mockEvents} viewMode="tree" />);
    
    expect(screen.getByTestId('tree-timeline')).toBeInTheDocument();
    
    rerender(<ConversationTimeline conversation={mockConversation} events={mockEvents} viewMode="list" />);
    
    expect(screen.queryByTestId('tree-timeline')).not.toBeInTheDocument();
    expect(screen.getByText('Card')).toBeInTheDocument(); // Accordion header
  });

  it('renders expand/collapse buttons in list view', () => {
    render(<ConversationTimeline conversation={mockConversation} events={mockEvents} viewMode="list" />);
    
    const expandButton = screen.getByText('Expand All');
    const collapseButton = screen.getByText('Collapse All');
    
    expect(expandButton).toBeInTheDocument();
    expect(collapseButton).toBeInTheDocument();
    
    // Should be clickable
    fireEvent.click(expandButton);
    fireEvent.click(collapseButton);
  });
});
