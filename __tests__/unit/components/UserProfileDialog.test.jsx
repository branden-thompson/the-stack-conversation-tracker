/**
 * UserProfileDialog Component Tests
 * 
 * Tests for the comprehensive user profile management dialog
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { UserProfileDialog } from '@/components/ui/user-profile-dialog';

describe('UserProfileDialog', () => {
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

  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    user: mockUsers[0],
    users: mockUsers,
    currentUserId: 'user1',
    cards: mockCards,
    mode: 'view',
    onUserSave: vi.fn(),
    onUserDelete: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('View Mode', () => {
    it('displays user information correctly', () => {
      render(<UserProfileDialog {...defaultProps} />);
      
      expect(screen.getByDisplayValue('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('light')).toBeInTheDocument();
      expect(screen.getByText('Created: 2')).toBeInTheDocument();
      expect(screen.getByText('Assigned: 1')).toBeInTheDocument();
    });

    it('shows all three tabs', () => {
      render(<UserProfileDialog {...defaultProps} />);
      
      expect(screen.getByText('Profile')).toBeInTheDocument();
      expect(screen.getByText('Preferences')).toBeInTheDocument();
      expect(screen.getByText('Statistics')).toBeInTheDocument();
    });

    it('does not show edit buttons in view mode', () => {
      render(<UserProfileDialog {...defaultProps} />);
      
      expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
    });

    it('can switch between tabs', async () => {
      render(<UserProfileDialog {...defaultProps} />);
      
      // Click on Preferences tab
      fireEvent.click(screen.getByText('Preferences'));
      await waitFor(() => {
        expect(screen.getByText('Theme Preference')).toBeInTheDocument();
      });

      // Click on Statistics tab
      fireEvent.click(screen.getByText('Statistics'));
      await waitFor(() => {
        expect(screen.getByText('Activity Overview')).toBeInTheDocument();
      });
    });
  });

  describe('Edit Mode', () => {
    const editProps = {
      ...defaultProps,
      mode: 'edit'
    };

    it('shows editable fields and save button', () => {
      render(<UserProfileDialog {...editProps} />);
      
      expect(screen.getByDisplayValue('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    it('allows editing user name', async () => {
      render(<UserProfileDialog {...editProps} />);
      
      const nameInput = screen.getByDisplayValue('Alice Johnson');
      fireEvent.change(nameInput, { target: { value: 'Alice Williams' } });
      
      expect(nameInput.value).toBe('Alice Williams');
    });

    it('calls onUserSave when save button is clicked', async () => {
      const onUserSave = vi.fn();
      render(<UserProfileDialog {...editProps} onUserSave={onUserSave} />);
      
      // Modify the name
      const nameInput = screen.getByDisplayValue('Alice Johnson');
      fireEvent.change(nameInput, { target: { value: 'Alice Williams' } });
      
      // Click save
      fireEvent.click(screen.getByText('Save Changes'));
      
      await waitFor(() => {
        expect(onUserSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Alice Williams'
          }),
          'user1'
        );
      });
    });

    it('shows delete button for non-system users', () => {
      render(<UserProfileDialog {...editProps} />);
      
      expect(screen.getByText('Delete User')).toBeInTheDocument();
    });

    it('hides delete button for system users', () => {
      const systemUserProps = {
        ...editProps,
        user: mockUsers[2] // system user
      };
      
      render(<UserProfileDialog {...systemUserProps} />);
      
      expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
    });

    it('shows confirmation dialog when delete is clicked', async () => {
      render(<UserProfileDialog {...editProps} />);
      
      fireEvent.click(screen.getByText('Delete User'));
      
      await waitFor(() => {
        expect(screen.getByText('Are you sure you want to delete this user?')).toBeInTheDocument();
        expect(screen.getByText('This action cannot be undone.')).toBeInTheDocument();
      });
    });

    it('calls onUserDelete when deletion is confirmed', async () => {
      const onUserDelete = vi.fn();
      render(<UserProfileDialog {...editProps} onUserDelete={onUserDelete} />);
      
      // Click delete button
      fireEvent.click(screen.getByText('Delete User'));
      
      // Confirm deletion
      await waitFor(() => {
        const confirmButton = screen.getByText('Delete');
        fireEvent.click(confirmButton);
      });
      
      await waitFor(() => {
        expect(onUserDelete).toHaveBeenCalledWith('user1');
      });
    });
  });

  describe('Create Mode', () => {
    const createProps = {
      ...defaultProps,
      user: null,
      mode: 'create'
    };

    it('shows empty form for new user', () => {
      render(<UserProfileDialog {...createProps} />);
      
      const nameInput = screen.getByPlaceholderText('Enter user name');
      expect(nameInput.value).toBe('');
      expect(screen.getByText('Create User')).toBeInTheDocument();
    });

    it('calls onUserSave with null userId for new user', async () => {
      const onUserSave = vi.fn();
      render(<UserProfileDialog {...createProps} onUserSave={onUserSave} />);
      
      // Fill in name
      const nameInput = screen.getByPlaceholderText('Enter user name');
      fireEvent.change(nameInput, { target: { value: 'New User' } });
      
      // Click create
      fireEvent.click(screen.getByText('Create User'));
      
      await waitFor(() => {
        expect(onUserSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'New User'
          }),
          null
        );
      });
    });

    it('does not show delete button in create mode', () => {
      render(<UserProfileDialog {...createProps} />);
      
      expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
    });
  });

  describe('Statistics Tab', () => {
    it('calculates and displays user statistics correctly', () => {
      render(<UserProfileDialog {...defaultProps} />);
      
      // Switch to statistics tab
      fireEvent.click(screen.getByText('Statistics'));
      
      // Check statistics for user1 (created 2 cards, assigned 1)
      expect(screen.getByText('Created: 2')).toBeInTheDocument();
      expect(screen.getByText('Assigned: 1')).toBeInTheDocument();
    });

    it('shows zero statistics for users with no activity', () => {
      const userWithNoActivityProps = {
        ...defaultProps,
        user: {
          id: 'user3',
          name: 'Inactive User',
          preferences: { theme: 'system' },
          isSystemUser: false
        }
      };
      
      render(<UserProfileDialog {...userWithNoActivityProps} />);
      
      fireEvent.click(screen.getByText('Statistics'));
      
      expect(screen.getByText('Created: 0')).toBeInTheDocument();
      expect(screen.getByText('Assigned: 0')).toBeInTheDocument();
    });
  });

  describe('Preferences Tab', () => {
    it('displays current theme preference', () => {
      render(<UserProfileDialog {...defaultProps} />);
      
      fireEvent.click(screen.getByText('Preferences'));
      
      expect(screen.getByText('light')).toBeInTheDocument();
    });

    it('allows changing theme preference in edit mode', async () => {
      const editProps = { ...defaultProps, mode: 'edit' };
      render(<UserProfileDialog {...editProps} />);
      
      fireEvent.click(screen.getByText('Preferences'));
      
      // Find the theme select and change it
      const themeSelect = screen.getByDisplayValue('light');
      fireEvent.change(themeSelect, { target: { value: 'dark' } });
      
      expect(themeSelect.value).toBe('dark');
    });
  });

  describe('Dialog Controls', () => {
    it('calls onOpenChange when dialog is closed', () => {
      const onOpenChange = vi.fn();
      render(<UserProfileDialog {...defaultProps} onOpenChange={onOpenChange} />);
      
      // Close dialog by clicking the X button (assuming it exists)
      const closeButton = screen.getByRole('button', { name: /close/i });
      if (closeButton) {
        fireEvent.click(closeButton);
        expect(onOpenChange).toHaveBeenCalledWith(false);
      }
    });

    it('does not render when open is false', () => {
      render(<UserProfileDialog {...defaultProps} open={false} />);
      
      expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('prevents saving with empty name', async () => {
      const onUserSave = vi.fn();
      const editProps = { ...defaultProps, mode: 'edit', onUserSave };
      render(<UserProfileDialog {...editProps} />);
      
      // Clear the name
      const nameInput = screen.getByDisplayValue('Alice Johnson');
      fireEvent.change(nameInput, { target: { value: '' } });
      
      // Try to save
      fireEvent.click(screen.getByText('Save Changes'));
      
      // Should not call onUserSave
      expect(onUserSave).not.toHaveBeenCalled();
    });

    it('shows validation message for empty name', async () => {
      const editProps = { ...defaultProps, mode: 'edit' };
      render(<UserProfileDialog {...editProps} />);
      
      // Clear the name
      const nameInput = screen.getByDisplayValue('Alice Johnson');
      fireEvent.change(nameInput, { target: { value: '' } });
      
      // Try to save
      fireEvent.click(screen.getByText('Save Changes'));
      
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });
  });
});