import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimelineNode } from '@/components/timeline/TimelineNode';

const mockEvent = {
  id: 'event-123',
  type: 'card.created',
  payload: { 
    id: 'card-456',
    type: 'topic',
    zone: 'active'
  },
  at: Date.now()
};

describe('TimelineNode', () => {
  it('renders event with correct type and summary', () => {
    render(<TimelineNode event={mockEvent} />);
    
    expect(screen.getByText('Card Created')).toBeInTheDocument();
    expect(screen.getByText('Created topic in active')).toBeInTheDocument();
  });

  it('shows event time when showTime is true', () => {
    render(<TimelineNode event={mockEvent} showTime={true} />);
    
    // Should show a time element (clock icon + time text)
    expect(screen.getByText(/\d{2}:\d{2}:\d{2}/)).toBeInTheDocument();
  });

  it('hides event time when showTime is false', () => {
    render(<TimelineNode event={mockEvent} showTime={false} />);
    
    // Should not show time
    expect(screen.queryByText(/\d{2}:\d{2}:\d{2}/)).not.toBeInTheDocument();
  });

  it('displays card ID when available', () => {
    render(<TimelineNode event={mockEvent} />);
    
    expect(screen.getByText(/card-456/)).toBeInTheDocument();
  });

  it('applies correct styling for left positioning', () => {
    render(<TimelineNode event={mockEvent} isLeft={true} />);
    
    const cardElement = screen.getByText('Card Created').closest('[data-slot="card"]');
    expect(cardElement).toHaveClass('text-right');
  });

  it('applies correct styling for right positioning', () => {
    render(<TimelineNode event={mockEvent} isLeft={false} />);
    
    const cardElement = screen.getByText('Card Created').closest('[data-slot="card"]');
    expect(cardElement).toHaveClass('text-left');
  });

  it('shows hover tooltip with detailed information', () => {
    render(<TimelineNode event={mockEvent} />);
    
    const card = screen.getByText('Card Created').closest('[data-slot="card"]');
    
    // Initially tooltip should not be visible
    expect(screen.queryByText('Event Details')).not.toBeInTheDocument();
    
    // Hover over the card
    fireEvent.mouseEnter(card);
    
    // Tooltip should now be visible
    expect(screen.getByText('Event Details')).toBeInTheDocument();
    expect(screen.getByText('card.created')).toBeInTheDocument();
  });

  it('hides tooltip when mouse leaves', () => {
    render(<TimelineNode event={mockEvent} />);
    
    const card = screen.getByText('Card Created').closest('[data-slot="card"]');
    
    // Show tooltip
    fireEvent.mouseEnter(card);
    expect(screen.getByText('Event Details')).toBeInTheDocument();
    
    // Hide tooltip
    fireEvent.mouseLeave(card);
    expect(screen.queryByText('Event Details')).not.toBeInTheDocument();
  });

  it('handles card.moved events correctly', () => {
    const moveEvent = {
      id: 'event-move',
      type: 'card.moved',
      payload: { id: 'card-123', from: 'active', to: 'completed' },
      at: Date.now()
    };
    
    render(<TimelineNode event={moveEvent} />);
    
    expect(screen.getByText('Card Moved')).toBeInTheDocument();
    expect(screen.getByText('Moved from active to completed')).toBeInTheDocument();
  });

  it('handles card.updated events correctly', () => {
    const updateEvent = {
      id: 'event-update',
      type: 'card.updated',
      payload: { id: 'card-123', fields: ['content', 'position'] },
      at: Date.now()
    };
    
    render(<TimelineNode event={updateEvent} />);
    
    expect(screen.getByText('Card Updated')).toBeInTheDocument();
    expect(screen.getByText('Updated content, position')).toBeInTheDocument();
  });

  it('handles card.deleted events correctly', () => {
    const deleteEvent = {
      id: 'event-delete',
      type: 'card.deleted',
      payload: { id: 'card-123', zone: 'active' },
      at: Date.now()
    };
    
    render(<TimelineNode event={deleteEvent} />);
    
    expect(screen.getByText('Card Deleted')).toBeInTheDocument();
    expect(screen.getByText('Deleted from active')).toBeInTheDocument();
  });

  it('handles unknown event types gracefully', () => {
    const unknownEvent = {
      id: 'event-unknown',
      type: 'unknown.event',
      payload: { some: 'data' },
      at: Date.now()
    };
    
    render(<TimelineNode event={unknownEvent} />);
    
    // Check for the header text specifically
    const headerElement = screen.getByRole('heading', { level: 4 });
    expect(headerElement).toHaveTextContent('unknown.event');
  });

  it('displays event colors correctly for different types', () => {
    const createdEvent = { ...mockEvent, type: 'card.created' };
    const { rerender } = render(<TimelineNode event={createdEvent} />);
    
    // Check for emerald color classes (card.created)
    let card = screen.getByText('Card Created').closest('[data-slot="card"]');
    expect(card).toHaveClass('bg-emerald-50', 'dark:bg-emerald-900/20');
    
    // Test moved event (blue)
    const movedEvent = { ...mockEvent, type: 'card.moved' };
    rerender(<TimelineNode event={movedEvent} />);
    
    card = screen.getByText('Card Moved').closest('[data-slot="card"]');
    expect(card).toHaveClass('bg-blue-50', 'dark:bg-blue-900/20');
  });

  it('does not show tooltip when no payload details exist', () => {
    const eventNoPayload = {
      id: 'event-empty',
      type: 'card.created',
      payload: {},
      at: Date.now()
    };
    
    render(<TimelineNode event={eventNoPayload} />);
    
    const card = screen.getByText('Card Created').closest('[data-slot="card"]');
    fireEvent.mouseEnter(card);
    
    // Should not show tooltip since no meaningful payload details
    expect(screen.queryByText('Event Details')).not.toBeInTheDocument();
  });
});
