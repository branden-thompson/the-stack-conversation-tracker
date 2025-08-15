/**
 * User Management Dev Page
 * 
 * Comprehensive user management interface for development and admin purposes
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserProfileDialog } from '@/components/ui/user-profile-dialog';
import { useUsers } from '@/lib/hooks/useUsers';
import { useCards } from '@/lib/hooks/useCards';
import { 
  User, 
  Crown, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye,
  Users,
  Calendar,
  FileText,
  UserCheck
} from 'lucide-react';

export default function UserManagementPage() {
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [profileMode, setProfileMode] = useState('view');

  const {
    users,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    currentUserId,
    switchUser
  } = useUsers();

  const { cards } = useCards();

  const handleCreateUser = () => {
    setSelectedUser(null);
    setProfileMode('create');
    setUserProfileOpen(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setProfileMode('view');
    setUserProfileOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setProfileMode('edit');
    setUserProfileOpen(true);
  };

  const handleUserSave = async (userData, userId) => {
    if (userId) {
      await updateUser(userId, userData);
    } else {
      await createUser(userData);
    }
  };

  const handleUserDelete = async (userId) => {
    await deleteUser(userId);
    if (userId === currentUserId) {
      switchUser('system');
    }
  };

  const getUserStats = (user) => {
    const cardsCreated = cards.filter(card => card.createdByUserId === user.id).length;
    const cardsAssigned = cards.filter(card => card.assignedToUserId === user.id).length;
    return { cardsCreated, cardsAssigned };
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        <div className="text-center py-8">Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        <div className="text-center py-8 text-red-600">Error loading users: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="w-8 h-8" />
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage user accounts, preferences, and view activity statistics
          </p>
        </div>
        <Button onClick={handleCreateUser} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create New User
        </Button>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-blue-800 dark:text-blue-200">Total Users</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{users.length}</p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="font-medium text-green-800 dark:text-green-200">Regular Users</span>
          </div>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">
            {users.filter(u => !u.isSystemUser).length}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="font-medium text-purple-800 dark:text-purple-200">Total Cards</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{cards.length}</p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="font-medium text-orange-800 dark:text-orange-200">Assignments</span>
          </div>
          <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
            {cards.filter(c => c.assignedToUserId).length}
          </p>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">All Users</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {users.map((user) => {
            const stats = getUserStats(user);
            const isCurrentUser = user.id === currentUserId;
            
            return (
              <div key={user.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        {user.isSystemUser ? (
                          <Crown className="w-5 h-5 text-yellow-600" />
                        ) : (
                          <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user.name}
                        </p>
                        {isCurrentUser && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Current
                          </span>
                        )}
                        {user.isSystemUser && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                            System
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {user.id}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Theme: {user.preferences?.theme || 'system'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Created: {stats.cardsCreated} cards
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Assigned: {stats.cardsAssigned} cards
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewUser(user)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditUser(user)}
                      disabled={user.isSystemUser}
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUserDelete(user.id)}
                      disabled={user.isSystemUser || isCurrentUser}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Profile Dialog */}
      <UserProfileDialog
        open={userProfileOpen}
        onOpenChange={setUserProfileOpen}
        user={selectedUser}
        users={users}
        currentUserId={currentUserId}
        cards={cards}
        mode={profileMode}
        onUserSave={handleUserSave}
        onUserDelete={handleUserDelete}
      />
    </div>
  );
}