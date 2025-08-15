/**
 * ConversationCard User Display Tests
 * 
 * Tests that ConversationCard properly displays user relationships
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ConversationCard } from '@/components/conversation-board/ConversationCard';

// Mock the drag and drop functionality
vi.mock('@dnd-kit/core', () => ({
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    isDragging: false,
  }),
}));

describe('ConversationCard User Display', () => {
  const mockUsers = [
    {
      id: 'system',
      name: 'System',
      isSystemUser: true,
      preferences: { theme: 'system' }
    },
    {
      id: 'user-1',
      name: 'Alice Johnson',
      isSystemUser: false,
      preferences: { theme: 'dark' }
    },
    {
      id: 'user-2',
      name: 'Bob Smith',
      isSystemUser: false,
      preferences: { theme: 'light' }
    }
  ];

  const mockCard = {
    id: 'card-1',
    content: 'Test card content',
    type: 'topic',
    zone: 'active',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  it('should display creator information when createdByUserId is set', () => {
    const cardWithCreator = {
      ...mockCard,
      createdByUserId: 'user-1'
    };

    render(
      <ConversationCard
        card={cardWithCreator}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        zoneId="active"
        users={mockUsers}
      />
    );

    // Should display the creator
    expect(screen.getByText('Created by:')).toBeInTheDocument();
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
  });

  it('should display system user as creator', () => {
    const cardWithSystemCreator = {
      ...mockCard,
      createdByUserId: 'system'
    };

    render(
      <ConversationCard
        card={cardWithSystemCreator}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        zoneId="active"
        users={mockUsers}
      />
    );

    // Should display system user with indicator
    expect(screen.getByText('Created by:')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
    expect(screen.getByText('(System)')).toBeInTheDocument();
  });

  it('should display assignee information when assignedToUserId is set', () => {
    const cardWithAssignee = {
      ...mockCard,
      createdByUserId: 'user-1',
      assignedToUserId: 'user-2'
    };

    render(
      <ConversationCard
        card={cardWithAssignee}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        zoneId="active"
        users={mockUsers}
      />
    );

    // Should display both creator and assignee
    expect(screen.getByText('Created by:')).toBeInTheDocument();
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    
    expect(screen.getByText('Assigned to:')).toBeInTheDocument();
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
  });

  it('should not display assignee section when no one is assigned', () => {
    const cardWithoutAssignee = {
      ...mockCard,
      createdByUserId: 'user-1',
      assignedToUserId: null
    };

    render(
      <ConversationCard
        card={cardWithoutAssignee}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        zoneId="active"
        users={mockUsers}
      />
    );

    expect(screen.getByText('Created by:')).toBeInTheDocument();
    expect(screen.queryByText('Assigned to:')).not.toBeInTheDocument();
  });

  it('should fall back to legacy person field when no user system data', () => {
    const legacyCard = {
      ...mockCard,
      person: 'legacy-user',
      createdByUserId: null
    };

    render(
      <ConversationCard
        card={legacyCard}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        zoneId="active"
        users={mockUsers}
      />
    );

    expect(screen.getByText('Created by:')).toBeInTheDocument();
    expect(screen.getByText('legacy-user')).toBeInTheDocument();
  });

  it('should handle unknown user IDs gracefully', () => {
    const cardWithUnknownUser = {
      ...mockCard,
      createdByUserId: 'unknown-user-id'
    };

    render(
      <ConversationCard
        card={cardWithUnknownUser}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        zoneId="active"
        users={mockUsers}
      />
    );

    expect(screen.getByText('Created by:')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('should handle empty users array gracefully', () => {
    const cardWithCreator = {
      ...mockCard,
      createdByUserId: 'user-1'
    };

    render(
      <ConversationCard
        card={cardWithCreator}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        zoneId="active"
        users={[]}
      />
    );

    expect(screen.getByText('Created by:')).toBeInTheDocument();
    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });
});