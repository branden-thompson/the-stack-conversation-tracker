/**
 * useUsers Hook Tests
 * 
 * Tests for the user management React hook
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '../../utils/test-utils';
import { useUsers } from '@/lib/hooks/useUsers.js';

// Mock fetch globally
global.fetch = vi.fn();

describe('useUsers Hook', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      const { result } = renderHook(() => useUsers());

      // Initially loading should be true since useEffect runs on mount
      expect(result.current.loading).toBe(true);
      expect(result.current.users).toEqual([]);
      expect(result.current.error).toBe(null);
      expect(result.current.currentUserId).toBe('system');
      expect(result.current.currentUser).toBe(null);
      expect(result.current.systemUser).toBe(null);
      expect(result.current.regularUsers).toEqual([]);

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should provide all expected functions', () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      const { result } = renderHook(() => useUsers());

      expect(typeof result.current.fetchUsers).toBe('function');
      expect(typeof result.current.createUser).toBe('function');
      expect(typeof result.current.updateUser).toBe('function');
      expect(typeof result.current.deleteUser).toBe('function');
      expect(typeof result.current.updateUserPreferences).toBe('function');
      expect(typeof result.current.switchUser).toBe('function');
      expect(typeof result.current.refreshUsers).toBe('function');
    });
  });

  describe('Fetching Users', () => {
    it('should fetch users on mount', async () => {
      const mockUsers = [
        {
          id: 'system',
          name: 'System',
          isSystemUser: true,
          preferences: { theme: 'system' }
        },
        {
          id: 'user-1',
          name: 'Alice',
          isSystemUser: false,
          preferences: { theme: 'dark' }
        }
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers
      });

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.users).toEqual(mockUsers);
      expect(result.current.systemUser).toEqual(mockUsers[0]);
      expect(result.current.regularUsers).toEqual([mockUsers[1]]);
      expect(fetch).toHaveBeenCalledWith('/api/users');
    });

    it('should handle fetch errors gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.users).toEqual([]);
      expect(result.current.error).toBe('Network error');
      expect(consoleError).toHaveBeenCalledWith('Error fetching users:', expect.any(Error));
      
      consoleError.mockRestore();
    });

    it('should handle non-ok response status', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.users).toEqual([]);
      expect(result.current.error).toBe('Failed to fetch users: 500 Internal Server Error');
      
      consoleError.mockRestore();
    });
  });

  describe('Creating Users', () => {
    it('should create user successfully', async () => {
      const initialUsers = [
        { id: 'system', name: 'System', isSystemUser: true }
      ];
      
      const newUser = {
        id: 'user-1',
        name: 'Alice',
        isSystemUser: false,
        preferences: { theme: 'dark' }
      };

      // Initial fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => initialUsers
      });

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Create user
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => newUser
      });

      let createdUser;
      await act(async () => {
        createdUser = await result.current.createUser({ name: 'Alice' });
      });

      expect(createdUser).toEqual(newUser);
      expect(result.current.users).toHaveLength(2);
      expect(result.current.users[1]).toEqual(newUser);
      expect(fetch).toHaveBeenLastCalledWith('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: 'Alice' })
      });
    });

    it('should handle create errors', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Initial fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Create user - fail
      fetch.mockRejectedValueOnce(new Error('Create failed'));

      let createdUser;
      await act(async () => {
        createdUser = await result.current.createUser({ name: 'Alice' });
      });

      expect(createdUser).toBe(null);
      expect(result.current.error).toBe('Create failed');
      expect(consoleError).toHaveBeenCalledWith('Error creating user:', expect.any(Error));
      
      consoleError.mockRestore();
    });
  });

  describe('Updating Users', () => {
    it('should update user successfully', async () => {
      const initialUsers = [
        {
          id: 'user-1',
          name: 'Alice',
          isSystemUser: false,
          preferences: { theme: 'dark' }
        }
      ];

      const updatedUser = {
        ...initialUsers[0],
        name: 'Alice Smith',
        preferences: { theme: 'light' }
      };

      // Initial fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => initialUsers
      });

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Update user
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedUser
      });

      let returnedUser;
      await act(async () => {
        returnedUser = await result.current.updateUser('user-1', {
          name: 'Alice Smith',
          preferences: { theme: 'light' }
        });
      });

      expect(returnedUser).toEqual(updatedUser);
      expect(result.current.users[0]).toEqual(updatedUser);
      expect(fetch).toHaveBeenLastCalledWith('/api/users/user-1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Alice Smith',
          preferences: { theme: 'light' }
        })
      });
    });

    it('should handle update errors', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Initial fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 'user-1', name: 'Alice' }]
      });

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Update user - fail
      fetch.mockRejectedValueOnce(new Error('Update failed'));

      let returnedUser;
      await act(async () => {
        returnedUser = await result.current.updateUser('user-1', { name: 'Updated' });
      });

      expect(returnedUser).toBe(null);
      expect(result.current.error).toBe('Update failed');
      expect(consoleError).toHaveBeenCalledWith('Error updating user:', expect.any(Error));
      
      consoleError.mockRestore();
    });
  });

  describe('Deleting Users', () => {
    it('should delete user successfully', async () => {
      const initialUsers = [
        { id: 'system', name: 'System', isSystemUser: true },
        { id: 'user-1', name: 'Alice', isSystemUser: false }
      ];

      // Initial fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => initialUsers
      });

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Delete user
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      let success;
      await act(async () => {
        success = await result.current.deleteUser('user-1');
      });

      expect(success).toBe(true);
      expect(result.current.users).toHaveLength(1);
      expect(result.current.users[0].id).toBe('system');
      expect(fetch).toHaveBeenLastCalledWith('/api/users/user-1', {
        method: 'DELETE'
      });
    });

    it('should switch to system user if current user is deleted', async () => {
      const initialUsers = [
        { id: 'system', name: 'System', isSystemUser: true },
        { id: 'user-1', name: 'Alice', isSystemUser: false }
      ];

      // Initial fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => initialUsers
      });

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Switch to user-1
      act(() => {
        result.current.switchUser('user-1');
      });

      expect(result.current.currentUserId).toBe('user-1');

      // Delete current user
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await act(async () => {
        await result.current.deleteUser('user-1');
      });

      expect(result.current.currentUserId).toBe('system');
    });
  });

  describe('User Preferences', () => {
    it('should update user preferences successfully', async () => {
      const initialUser = {
        id: 'user-1',
        name: 'Alice',
        isSystemUser: false,
        preferences: { theme: 'dark' }
      };

      const updatedUser = {
        ...initialUser,
        preferences: { theme: 'light', fontSize: 'large' }
      };

      // Initial fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [initialUser]
      });

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Update preferences
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedUser
      });

      let returnedUser;
      await act(async () => {
        returnedUser = await result.current.updateUserPreferences('user-1', {
          theme: 'light',
          fontSize: 'large'
        });
      });

      expect(returnedUser).toEqual(updatedUser);
      expect(result.current.users[0]).toEqual(updatedUser);
      expect(fetch).toHaveBeenLastCalledWith('/api/users/user-1/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          theme: 'light',
          fontSize: 'large'
        })
      });
    });
  });

  describe('User Switching', () => {
    it('should switch to valid user', async () => {
      const users = [
        { id: 'system', name: 'System', isSystemUser: true },
        { id: 'user-1', name: 'Alice', isSystemUser: false }
      ];

      // Initial fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => users
      });

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.currentUserId).toBe('system');
      expect(result.current.currentUser?.name).toBe('System');

      act(() => {
        result.current.switchUser('user-1');
      });

      expect(result.current.currentUserId).toBe('user-1');
      expect(result.current.currentUser?.name).toBe('Alice');
    });

    it('should not switch to invalid user', async () => {
      const users = [
        { id: 'system', name: 'System', isSystemUser: true }
      ];

      // Initial fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => users
      });

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.currentUserId).toBe('system');

      act(() => {
        result.current.switchUser('non-existent-user');
      });

      expect(result.current.currentUserId).toBe('system'); // Should remain unchanged
    });
  });

  describe('Derived State', () => {
    it('should correctly calculate derived state values', async () => {
      const users = [
        {
          id: 'system',
          name: 'System',
          isSystemUser: true,
          preferences: { theme: 'system' }
        },
        {
          id: 'user-1',
          name: 'Alice',
          isSystemUser: false,
          preferences: { theme: 'dark' }
        },
        {
          id: 'user-2',
          name: 'Bob',
          isSystemUser: false,
          preferences: { theme: 'light' }
        }
      ];

      // Initial fetch
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => users
      });

      const { result } = renderHook(() => useUsers());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.users).toHaveLength(3);
      expect(result.current.systemUser).toEqual(users[0]);
      expect(result.current.regularUsers).toHaveLength(2);
      expect(result.current.regularUsers).toEqual([users[1], users[2]]);
      expect(result.current.currentUser).toEqual(users[0]); // Default to system

      // Switch user and verify current user changes
      act(() => {
        result.current.switchUser('user-1');
      });

      expect(result.current.currentUser).toEqual(users[1]);
    });
  });
});