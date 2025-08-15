/**
 * User Management Page Tests
 * 
 * Tests for the comprehensive user management dev page
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import UserManagementPage from '@/app/dev/users/page';

// Mock the hooks
vi.mock('@/lib/hooks/useUsers', () => ({
  useUsers: vi.fn()
}));

vi.mock('@/lib/hooks/useCards', () => ({
  useCards: vi.fn()
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn(),
}));

describe('UserManagementPage', () => {
  const mockUsers = [
    {
      id: 'user1',
      name: 'Alice Johnson',
      preferences: { theme: 'light' },
      isSystemUser: false
    },
    {
      id: 'user2',
      name: 'Bob Smith',
      preferences: { theme: 'dark' },
      isSystemUser: false
    },
    {
      id: 'system',
      name: 'System',
      preferences: { theme: 'system' },
      isSystemUser: true
    }
  ];

  const mockCards = [
    {
      id: 'card1',
      createdByUserId: 'user1',
      assignedToUserId: 'user1',
      type: 'topic'
    },
    {
      id: 'card2',
      createdByUserId: 'user1',
      assignedToUserId: 'user2',
      type: 'question'
    },
    {
      id: 'card3',
      createdByUserId: 'user2',
      assignedToUserId: null,
      type: 'fact'
    }
  ];

  const mockUseUsers = {
    users: mockUsers,
    loading: false,
    error: null,
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    currentUserId: 'user1',
    switchUser: vi.fn()
  };

  const mockUseCards = {
    cards: mockCards
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const { useUsers } = require('@/lib/hooks/useUsers');
    const { useCards } = require('@/lib/hooks/useCards');
    useUsers.mockReturnValue(mockUseUsers);
    useCards.mockReturnValue(mockUseCards);
  });

  describe('Loading State', () => {
    it('shows loading state when users are loading', () => {
      const { useUsers } = require('@/lib/hooks/useUsers');
      useUsers.mockReturnValue({
        ...mockUseUsers,
        loading: true
      });

      render(<UserManagementPage />);
      
      expect(screen.getByText('Loading users...')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('shows error message when there is an error', () => {
      const { useUsers } = require('@/lib/hooks/useUsers');
      useUsers.mockReturnValue({
        ...mockUseUsers,
        error: 'Failed to load users'
      });

      render(<UserManagementPage />);
      
      expect(screen.getByText('Error loading users: Failed to load users')).toBeInTheDocument();
    });
  });

  describe('Page Header', () => {
    it('displays page title and description', () => {
      render(<UserManagementPage />);
      
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('Manage user accounts, preferences, and view activity statistics')).toBeInTheDocument();
    });

    it('shows create new user button', () => {
      render(<UserManagementPage />);
      
      expect(screen.getByText('Create New User')).toBeInTheDocument();
    });

    it('opens create dialog when create button is clicked', async () => {
      render(<UserManagementPage />);
      
      fireEvent.click(screen.getByText('Create New User'));
      
      // Should open UserProfileDialog in create mode
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter user name')).toBeInTheDocument();
      });
    });
  });

  describe('Statistics Overview', () => {
    it('displays correct user statistics', () => {
      render(<UserManagementPage />);
      
      expect(screen.getByText('3')).toBeInTheDocument(); // Total users
      expect(screen.getByText('2')).toBeInTheDocument(); // Regular users (non-system)
    });

    it('displays correct card statistics', () => {
      render(<UserManagementPage />);
      
      expect(screen.getByText('3')).toBeInTheDocument(); // Total cards
      expect(screen.getByText('2')).toBeInTheDocument(); // Assigned cards
    });

    it('shows statistic labels correctly', () => {
      render(<UserManagementPage />);
      
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('Regular Users')).toBeInTheDocument();
      expect(screen.getByText('Total Cards')).toBeInTheDocument();
      expect(screen.getByText('Assignments')).toBeInTheDocument();
    });
  });

  describe('User List', () => {
    it('displays all users in the list', () => {
      render(<UserManagementPage />);
      
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
    });

    it('shows current user indicator', () => {
      render(<UserManagementPage />);
      
      expect(screen.getByText('Current')).toBeInTheDocument();
    });

    it('shows system user indicator', () => {
      render(<UserManagementPage />);
      
      expect(screen.getByText('System')).toBeInTheDocument();
    });

    it('displays user statistics correctly', () => {
      render(<UserManagementPage />);
      
      // Alice created 2 cards, assigned 1
      expect(screen.getByText('Created: 2 cards')).toBeInTheDocument();
      expect(screen.getByText('Assigned: 1 cards')).toBeInTheDocument();
      
      // Bob created 1 card, assigned 1
      expect(screen.getByText('Created: 1 cards')).toBeInTheDocument();
    });

    it('shows user themes', () => {
      render(<UserManagementPage />);
      
      expect(screen.getByText('Theme: light')).toBeInTheDocument();
      expect(screen.getByText('Theme: dark')).toBeInTheDocument();
      expect(screen.getByText('Theme: system')).toBeInTheDocument();
    });
  });

  describe('User Actions', () => {
    it('shows view, edit, and delete buttons for each user', () => {
      render(<UserManagementPage />);
      
      // Should have multiple view/edit/delete buttons (one for each user)
      const viewButtons = screen.getAllByTitle(/view/i);
      const editButtons = screen.getAllByTitle(/edit/i);
      const deleteButtons = screen.getAllByTitle(/delete/i);
      
      expect(viewButtons.length).toBeGreaterThan(0);
      expect(editButtons.length).toBeGreaterThan(0);
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it('disables edit button for system user', () => {
      render(<UserManagementPage />);
      
      // Find the edit button for system user (should be disabled)
      const editButtons = screen.getAllByTitle(/edit/i);
      // System user should have a disabled edit button
      const systemUserRow = screen.getByText('System').closest('.px-6');
      const systemEditButton = systemUserRow.querySelector('button[disabled]');
      expect(systemEditButton).toBeInTheDocument();
    });

    it('disables delete button for current user and system user', () => {
      render(<UserManagementPage />);
      
      // Find delete buttons
      const deleteButtons = screen.getAllByTitle(/delete/i);
      
      // Current user (Alice) and system user should have disabled delete buttons
      const aliceRow = screen.getByText('Alice Johnson').closest('.px-6');
      const systemRow = screen.getByText('System').closest('.px-6');
      
      const aliceDeleteButton = aliceRow.querySelector('button[disabled]');
      const systemDeleteButton = systemRow.querySelector('button[disabled]');
      
      expect(aliceDeleteButton).toBeInTheDocument();
      expect(systemDeleteButton).toBeInTheDocument();
    });

    it('opens view dialog when view button is clicked', async () => {
      render(<UserManagementPage />);
      
      const viewButtons = screen.getAllByTitle(/view/i);
      fireEvent.click(viewButtons[0]);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Alice Johnson')).toBeInTheDocument();
      });
    });

    it('opens edit dialog when edit button is clicked', async () => {
      render(<UserManagementPage />);
      
      // Find an enabled edit button (not system user)
      const bobRow = screen.getByText('Bob Smith').closest('.px-6');
      const editButton = bobRow.querySelector('button[title*="edit"]:not([disabled])');
      
      fireEvent.click(editButton);
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Bob Smith')).toBeInTheDocument();
        expect(screen.getByText('Save Changes')).toBeInTheDocument();
      });
    });
  });

  describe('User Management Operations', () => {
    it('calls createUser when new user is saved', async () => {
      const createUser = vi.fn();
      const { useUsers } = require('@/lib/hooks/useUsers');
      useUsers.mockReturnValue({
        ...mockUseUsers,
        createUser
      });

      render(<UserManagementPage />);
      
      // Open create dialog
      fireEvent.click(screen.getByText('Create New User'));
      
      // Fill in user name
      await waitFor(() => {
        const nameInput = screen.getByPlaceholderText('Enter user name');
        fireEvent.change(nameInput, { target: { value: 'New User' } });
      });
      
      // Save
      fireEvent.click(screen.getByText('Create User'));
      
      await waitFor(() => {
        expect(createUser).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'New User'
          })
        );
      });
    });

    it('calls updateUser when existing user is saved', async () => {
      const updateUser = vi.fn();
      const { useUsers } = require('@/lib/hooks/useUsers');
      useUsers.mockReturnValue({
        ...mockUseUsers,
        updateUser
      });

      render(<UserManagementPage />);
      
      // Open edit dialog for Bob
      const bobRow = screen.getByText('Bob Smith').closest('.px-6');
      const editButton = bobRow.querySelector('button[title*="edit"]:not([disabled])');
      fireEvent.click(editButton);
      
      // Modify name
      await waitFor(() => {
        const nameInput = screen.getByDisplayValue('Bob Smith');
        fireEvent.change(nameInput, { target: { value: 'Bob Johnson' } });
      });
      
      // Save
      fireEvent.click(screen.getByText('Save Changes'));
      
      await waitFor(() => {
        expect(updateUser).toHaveBeenCalledWith(
          'user2',
          expect.objectContaining({
            name: 'Bob Johnson'
          })
        );
      });
    });

    it('calls deleteUser when user deletion is confirmed', async () => {
      const deleteUser = vi.fn();
      const { useUsers } = require('@/lib/hooks/useUsers');
      useUsers.mockReturnValue({
        ...mockUseUsers,
        deleteUser
      });

      render(<UserManagementPage />);
      
      // Find an enabled delete button (not current user or system user)
      const bobRow = screen.getByText('Bob Smith').closest('.px-6');
      const deleteButton = bobRow.querySelector('button[title*="delete"]:not([disabled])');
      
      fireEvent.click(deleteButton);
      
      // Wait for delete confirmation dialog and confirm
      await waitFor(() => {
        const confirmButton = screen.getByText('Delete');
        fireEvent.click(confirmButton);
      });
      
      await waitFor(() => {
        expect(deleteUser).toHaveBeenCalledWith('user2');
      });
    });

    it('switches to system user when current user is deleted', async () => {
      const deleteUser = vi.fn();
      const switchUser = vi.fn();
      const { useUsers } = require('@/lib/hooks/useUsers');
      useUsers.mockReturnValue({
        ...mockUseUsers,
        deleteUser,
        switchUser,
        currentUserId: 'user2' // Set Bob as current user so we can delete him
      });

      render(<UserManagementPage />);
      
      // Find delete button for current user (should now be enabled since Bob is current)
      const bobRow = screen.getByText('Bob Smith').closest('.px-6');
      const deleteButton = bobRow.querySelector('button[title*="delete"]');
      
      fireEvent.click(deleteButton);
      
      // Confirm deletion
      await waitFor(() => {
        const confirmButton = screen.getByText('Delete');
        fireEvent.click(confirmButton);
      });
      
      await waitFor(() => {
        expect(deleteUser).toHaveBeenCalledWith('user2');
        expect(switchUser).toHaveBeenCalledWith('system');
      });
    });
  });

  describe('User Statistics Calculation', () => {
    it('calculates user statistics correctly', () => {
      render(<UserManagementPage />);
      
      // Alice: created 2 cards (card1, card2), assigned 1 card (card1)
      expect(screen.getByText('Created: 2 cards')).toBeInTheDocument();
      expect(screen.getByText('Assigned: 1 cards')).toBeInTheDocument();
    });

    it('handles users with no activity', () => {
      const { useUsers } = require('@/lib/hooks/useUsers');
      const usersWithInactive = [
        ...mockUsers,
        {
          id: 'user3',
          name: 'Inactive User',
          preferences: { theme: 'system' },
          isSystemUser: false
        }
      ];
      
      useUsers.mockReturnValue({
        ...mockUseUsers,
        users: usersWithInactive
      });

      render(<UserManagementPage />);
      
      // Should show 0 for inactive user
      expect(screen.getByText('Inactive User')).toBeInTheDocument();
    });
  });
});