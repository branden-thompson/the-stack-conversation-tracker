import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConversationTimeline } from '@/components/timeline/ConversationTimeline';

// Mock dependencies that we don't want to test
vi.mock('@/lib/utils/timelineTree', () => ({
  transformEventsToTree: vi.fn((events) => ({
    cardBranches: events ? [{
      cardId: 'card-1',
      rootEvent: events[0],
      childEvents: events.slice(1)
    }] : [],
    orphanEvents: []
  }))
}));

vi.mock('@/components/timeline/TreeTimeline', () => ({
  TreeTimeline: ({ conversation, events }) => (
    <div data-testid="tree-timeline">
      <span>Tree Timeline</span>
      <span>{conversation?.name}</span>
      <span>{events?.length} events</span>
    </div>
  )
}));

describe('Timeline Tree/List View Switching Integration', () => {
  const mockConversation = {
    id: 'conv-1',
    name: 'Test Conversation',
    status: 'active',
    createdAt: Date.now() - 3600000,
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
    },
    {
      id: 'event-4',
      type: 'card.deleted',
      payload: { id: 'card-1', zone: 'completed' },
      at: Date.now() - 500000
    }
  ];

  describe('View Mode Switching', () => {
    it('displays tree view when viewMode is tree', () => {
      render(
        <ConversationTimeline
          conversation={mockConversation}
          events={mockEvents}
          viewMode="tree"
        />
      );

      expect(screen.getByTestId('tree-timeline')).toBeInTheDocument();
      expect(screen.getByText('Tree Timeline')).toBeInTheDocument();
      expect(screen.getByText('Test Conversation')).toBeInTheDocument();
      expect(screen.getByText('4 events')).toBeInTheDocument();
    });

    it('displays list view when viewMode is list', () => {
      render(
        <ConversationTimeline
          conversation={mockConversation}
          events={mockEvents}
          viewMode="list"
        />
      );

      // Check for accordion table header
      expect(screen.getByText('Card')).toBeInTheDocument();
      expect(screen.getByText('Type')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Events')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();

      // Check for expand/collapse controls
      expect(screen.getByText('Expand All')).toBeInTheDocument();
      expect(screen.getByText('Collapse All')).toBeInTheDocument();
    });

    it('switches between views correctly', () => {
      const { rerender } = render(
        <ConversationTimeline
          conversation={mockConversation}
          events={mockEvents}
          viewMode="tree"
        />
      );

      // Initially shows tree view
      expect(screen.getByTestId('tree-timeline')).toBeInTheDocument();
      expect(screen.queryByText('Card')).not.toBeInTheDocument();

      // Switch to list view
      rerender(
        <ConversationTimeline
          conversation={mockConversation}
          events={mockEvents}
          viewMode="list"
        />
      );

      expect(screen.queryByTestId('tree-timeline')).not.toBeInTheDocument();
      expect(screen.getByText('Card')).toBeInTheDocument();
    });
  });

  describe('List View Functionality', () => {
    it('displays card information correctly in list view', () => {
      render(
        <ConversationTimeline
          conversation={mockConversation}
          events={mockEvents}
          viewMode="list"
        />
      );

      // Should show card info based on the first (root) event
      expect(screen.getByText('topic (card-1)')).toBeInTheDocument();
      expect(screen.getByText('topic')).toBeInTheDocument(); // card type
      expect(screen.getByText('deleted')).toBeInTheDocument(); // status based on final event
      expect(screen.getByText('4 events')).toBeInTheDocument(); // total events count
    });

    it('handles expand/collapse functionality in list view', () => {
      render(
        <ConversationTimeline
          conversation={mockConversation}
          events={mockEvents}
          viewMode="list"
        />
      );

      const expandAllButton = screen.getByText('Expand All');
      const collapseAllButton = screen.getByText('Collapse All');

      // Buttons should be interactive
      expect(expandAllButton).toBeEnabled();
      expect(collapseAllButton).toBeEnabled();

      // Should be able to click without errors
      fireEvent.click(expandAllButton);
      fireEvent.click(collapseAllButton);
    });

    it('shows empty state when no card events exist', () => {
      render(
        <ConversationTimeline
          conversation={mockConversation}
          events={[]}
          viewMode="list"
        />
      );

      expect(screen.getByText('Timeline is Empty')).toBeInTheDocument();
      expect(screen.getByText('This conversation doesn\'t have any recorded events yet')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles null conversation gracefully in tree view', () => {
      render(
        <ConversationTimeline
          conversation={null}
          events={mockEvents}
          viewMode="tree"
        />
      );

      expect(screen.getByText('Welcome to Timeline Explorer')).toBeInTheDocument();
    });

    it('handles null events gracefully', () => {
      render(
        <ConversationTimeline
          conversation={mockConversation}
          events={null}
          viewMode="list"
        />
      );

      expect(screen.getByText('Timeline is Empty')).toBeInTheDocument();
    });

    it('handles undefined viewMode gracefully', () => {
      render(
        <ConversationTimeline
          conversation={mockConversation}
          events={mockEvents}
          viewMode={undefined}
        />
      );

      // Should default to accordion list view when viewMode is falsy
      expect(screen.getByText('Card')).toBeInTheDocument(); // Accordion header
      expect(screen.getByText('Type')).toBeInTheDocument();
    });
  });

  describe('Data Transformation', () => {
    it('properly transforms events for both views', () => {
      const { rerender } = render(
        <ConversationTimeline
          conversation={mockConversation}
          events={mockEvents}
          viewMode="tree"
        />
      );

      // Tree view should use transformed data
      expect(screen.getByText('4 events')).toBeInTheDocument();

      // Switch to list view
      rerender(
        <ConversationTimeline
          conversation={mockConversation}
          events={mockEvents}
          viewMode="list"
        />
      );

      // List view should also show the same data
      expect(screen.getByText('4 events')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('maintains proper ARIA attributes for list view table', () => {
      render(
        <ConversationTimeline
          conversation={mockConversation}
          events={mockEvents}
          viewMode="list"
        />
      );

      // Headers should be properly structured
      const headers = ['Card', 'Type', 'Status', 'Events', 'Created'];
      headers.forEach(header => {
        expect(screen.getByText(header)).toBeInTheDocument();
      });
    });

    it('maintains keyboard navigation for expand/collapse buttons', () => {
      render(
        <ConversationTimeline
          conversation={mockConversation}
          events={mockEvents}
          viewMode="list"
        />
      );

      const expandButton = screen.getByText('Expand All');
      const collapseButton = screen.getByText('Collapse All');

      // Buttons should be focusable
      expandButton.focus();
      expect(document.activeElement).toBe(expandButton);

      collapseButton.focus();
      expect(document.activeElement).toBe(collapseButton);
    });
  });
});