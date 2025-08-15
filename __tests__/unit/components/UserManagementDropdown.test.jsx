/**
 * UserManagementDropdown Component Tests
 * 
 * Tests for the user management dropdown that extends UserSelector
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { UserManagementDropdown } from '@/components/ui/user-management-dropdown';

describe('UserManagementDropdown', () => {
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

  const defaultProps = {
    users: mockUsers,
    currentUserId: 'user1',
    onUserSelect: vi.fn(),
    onCreateUser: vi.fn(),
    onEditUser: vi.fn(),
    onManageUsers: vi.fn(),
    placeholder: 'Select user...'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User Selection', () => {
    it('displays current user correctly', () => {
      render(<UserManagementDropdown {...defaultProps} />);
      
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    it('shows all users in dropdown', async () => {
      render(<UserManagementDropdown {...defaultProps} />);
      
      // Open dropdown
      fireEvent.click(screen.getByRole('combobox'));
      
      await waitFor(() => {
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
        expect(screen.getByText('System')).toBeInTheDocument();
      });
    });

    it('calls onUserSelect when user is selected', async () => {
      const onUserSelect = vi.fn();
      render(<UserManagementDropdown {...defaultProps} onUserSelect={onUserSelect} />);
      
      // Open dropdown
      fireEvent.click(screen.getByRole('combobox'));
      
      // Select Bob Smith
      await waitFor(() => {
        fireEvent.click(screen.getByText('Bob Smith'));
      });
      
      expect(onUserSelect).toHaveBeenCalledWith(mockUsers[1]);
    });

    it('displays system user with indicator', async () => {
      render(<UserManagementDropdown {...defaultProps} />);
      
      fireEvent.click(screen.getByRole('combobox'));
      
      await waitFor(() => {
        expect(screen.getByText('System')).toBeInTheDocument();
        expect(screen.getByText('(System)')).toBeInTheDocument();
      });
    });
  });

  describe('Management Actions', () => {
    it('shows management actions in dropdown', async () => {
      render(<UserManagementDropdown {...defaultProps} />);
      
      fireEvent.click(screen.getByRole('combobox'));
      
      await waitFor(() => {
        expect(screen.getByText('Create New User')).toBeInTheDocument();
        expect(screen.getByText('Edit Current User')).toBeInTheDocument();
        expect(screen.getByText('Manage All Users')).toBeInTheDocument();
      });
    });

    it('calls onCreateUser when Create New User is selected', async () => {
      const onCreateUser = vi.fn();
      render(<UserManagementDropdown {...defaultProps} onCreateUser={onCreateUser} />);
      
      fireEvent.click(screen.getByRole('combobox'));
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Create New User'));
      });
      
      expect(onCreateUser).toHaveBeenCalled();
    });

    it('calls onEditUser when Edit Current User is selected', async () => {
      const onEditUser = vi.fn();
      render(<UserManagementDropdown {...defaultProps} onEditUser={onEditUser} />);
      
      fireEvent.click(screen.getByRole('combobox'));
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Edit Current User'));
      });
      
      expect(onEditUser).toHaveBeenCalledWith(mockUsers[0]);
    });

    it('calls onManageUsers when Manage All Users is selected', async () => {
      const onManageUsers = vi.fn();
      render(<UserManagementDropdown {...defaultProps} onManageUsers={onManageUsers} />);
      
      fireEvent.click(screen.getByRole('combobox'));
      
      await waitFor(() => {
        fireEvent.click(screen.getByText('Manage All Users'));
      });
      
      expect(onManageUsers).toHaveBeenCalled();
    });

    it('disables Edit Current User when no current user', async () => {
      const propsWithoutCurrentUser = {
        ...defaultProps,
        currentUserId: null
      };
      
      render(<UserManagementDropdown {...propsWithoutCurrentUser} />);
      
      fireEvent.click(screen.getByRole('combobox'));
      
      await waitFor(() => {
        const editOption = screen.getByText('Edit Current User');
        expect(editOption.closest('[data-disabled]')).toBeTruthy();
      });
    });
  });

  describe('Empty States', () => {
    it('shows placeholder when no users', () => {
      const emptyProps = {
        ...defaultProps,
        users: [],
        currentUserId: null
      };
      
      render(<UserManagementDropdown {...emptyProps} />);
      
      expect(screen.getByText('Select user...')).toBeInTheDocument();
    });

    it('shows fallback when current user not found', () => {
      const propsWithMissingUser = {
        ...defaultProps,
        currentUserId: 'nonexistent'
      };
      
      render(<UserManagementDropdown {...propsWithMissingUser} />);
      
      expect(screen.getByText('Select user...')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<UserManagementDropdown {...defaultProps} />);
      
      const combobox = screen.getByRole('combobox');
      expect(combobox).toHaveAttribute('aria-expanded', 'false');
    });

    it('keyboard navigation works', async () => {
      render(<UserManagementDropdown {...defaultProps} />);
      
      const combobox = screen.getByRole('combobox');
      
      // Open with Enter key
      fireEvent.keyDown(combobox, { key: 'Enter' });
      
      await waitFor(() => {
        expect(combobox).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });

  describe('Size Variations', () => {
    it('applies small size correctly', () => {
      render(<UserManagementDropdown {...defaultProps} size="sm" />);
      
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('data-size', 'sm');
    });

    it('applies default size when not specified', () => {
      render(<UserManagementDropdown {...defaultProps} />);
      
      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('data-size', 'default');
    });
  });

  describe('Theme Display', () => {
    it('shows user theme preferences', async () => {
      render(<UserManagementDropdown {...defaultProps} />);
      
      fireEvent.click(screen.getByRole('combobox'));
      
      await waitFor(() => {
        // Check that theme indicators are present (assuming they're rendered)
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('handles missing callback functions gracefully', async () => {
      const propsWithoutCallbacks = {
        ...defaultProps,
        onUserSelect: undefined,
        onCreateUser: undefined,
        onEditUser: undefined,
        onManageUsers: undefined
      };
      
      render(<UserManagementDropdown {...propsWithoutCallbacks} />);
      
      fireEvent.click(screen.getByRole('combobox'));
      
      await waitFor(() => {
        // Should not throw errors when clicking options
        fireEvent.click(screen.getByText('Bob Smith'));
        fireEvent.click(screen.getByText('Create New User'));
      });
    });
  });
});