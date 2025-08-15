/**
 * ConversationCard Assignment Controls Tests
 * 
 * Tests the user assignment functionality in cards
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

describe('ConversationCard Assignment Controls', () => {
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
    updatedAt: Date.now(),
    createdByUserId: 'user-1'
  };

  it('should show unassigned assignment button when no user assigned', () => {
    render(
      <ConversationCard
        card={mockCard}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        zoneId="active"
        users={mockUsers}
      />
    );

    const assignButton = screen.getByLabelText('Assign User');
    expect(assignButton).toBeInTheDocument();
    expect(assignButton).toHaveAttribute('title', 'Assign to user');
  });

  it('should show assigned button when user is assigned', () => {
    const cardWithAssignee = {
      ...mockCard,
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

    const assignButton = screen.getByLabelText('Assign User');
    expect(assignButton).toHaveAttribute('title', 'Assigned to: Bob Smith');
  });

  it('should open assignment dropdown when assignment button clicked', () => {
    render(
      <ConversationCard
        card={mockCard}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        zoneId="active"
        users={mockUsers}
      />
    );

    const assignButton = screen.getByLabelText('Assign User');
    fireEvent.click(assignButton);

    // Should show dropdown with users
    expect(screen.getByText('No assignment')).toBeInTheDocument();
    // Alice Johnson appears in both footer and dropdown, so we'll find multiple
    expect(screen.getAllByText('Alice Johnson').length).toBeGreaterThan(1);
    expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    expect(screen.getAllByText('System').length).toBeGreaterThan(0);
  });

  it('should call onUpdate when user is assigned', () => {
    const onUpdate = vi.fn();
    
    render(
      <ConversationCard
        card={mockCard}
        onUpdate={onUpdate}
        onDelete={vi.fn()}
        zoneId="active"
        users={mockUsers}
      />
    );

    // Open dropdown
    const assignButton = screen.getByLabelText('Assign User');
    fireEvent.click(assignButton);

    // Click on Bob Smith
    const bobOption = screen.getByText('Bob Smith');
    fireEvent.click(bobOption);

    expect(onUpdate).toHaveBeenCalledWith('card-1', {
      assignedToUserId: 'user-2',
      updatedAt: expect.any(Number)
    });
  });

  it('should call onUpdate to unassign when "No assignment" clicked', () => {
    const onUpdate = vi.fn();
    const cardWithAssignee = {
      ...mockCard,
      assignedToUserId: 'user-2'
    };
    
    render(
      <ConversationCard
        card={cardWithAssignee}
        onUpdate={onUpdate}
        onDelete={vi.fn()}
        zoneId="active"
        users={mockUsers}
      />
    );

    // Open dropdown
    const assignButton = screen.getByLabelText('Assign User');
    fireEvent.click(assignButton);

    // Click on "No assignment"
    const noAssignmentOption = screen.getByText('No assignment');
    fireEvent.click(noAssignmentOption);

    expect(onUpdate).toHaveBeenCalledWith('card-1', {
      assignedToUserId: null,
      updatedAt: expect.any(Number)
    });
  });

  it('should close dropdown after assignment', () => {
    render(
      <ConversationCard
        card={mockCard}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        zoneId="active"
        users={mockUsers}
      />
    );

    // Open dropdown
    const assignButton = screen.getByLabelText('Assign User');
    fireEvent.click(assignButton);

    expect(screen.getAllByText('Alice Johnson').length).toBeGreaterThan(1);

    // Select a user - click on one of the Alice Johnson elements
    const aliceOptions = screen.getAllByText('Alice Johnson');
    fireEvent.click(aliceOptions[0]);

    // Dropdown should be closed (still shows in footer though)
    expect(screen.getAllByText('Alice Johnson').length).toBe(1);
  });

  it('should handle empty users array gracefully', () => {
    render(
      <ConversationCard
        card={mockCard}
        onUpdate={vi.fn()}
        onDelete={vi.fn()}
        zoneId="active"
        users={[]}
      />
    );

    const assignButton = screen.getByLabelText('Assign User');
    fireEvent.click(assignButton);

    // Should only show "No assignment" option
    expect(screen.getByText('No assignment')).toBeInTheDocument();
    expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
  });
});