/**
 * User Management Dev Page
 * 
 * Comprehensive user management interface for development and admin purposes
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserProfileDialog } from '@/components/ui/user-profile-dialog';
import { ProfilePicture } from '@/components/ui/profile-picture';
import { UniversalDevHeader } from '@/components/ui/universal-dev-header';
import { LeftTray } from '@/components/ui/left-tray';
import { useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';
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
  const dynamicTheme = useDynamicAppTheme();
  const [userProfileOpen, setUserProfileOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [profileMode, setProfileMode] = useState('view');
  const [trayOpen, setTrayOpen] = useState(false);

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

  const handleExportAllData = () => {
    const exportData = {
      users,
      cards,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob(
      [JSON.stringify(exportData, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-management-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getUserStats = (user) => {
    const cardsCreated = cards.filter(card => card.createdByUserId === user.id).length;
    const cardsAssigned = cards.filter(card => card.assignedToUserId === user.id).length;
    return { cardsCreated, cardsAssigned };
  };

  if (loading) {
    return (
      <div className={`h-screen flex flex-col ${dynamicTheme.colors.background.primary}`}>
        <UniversalDevHeader 
          onOpenTray={() => setTrayOpen(true)}
          onExportAllData={handleExportAllData}
        />
        <div className={`container mx-auto p-6 ${dynamicTheme.colors.text.primary}`}>
          <h1 className="text-2xl font-bold mb-6">User Management</h1>
          <div className="text-center py-8">Loading users...</div>
        </div>
        <LeftTray
          isOpen={trayOpen}
          onClose={() => setTrayOpen(false)}
          onNewCard={() => {}} // Disabled for dev pages
          onResetLayout={() => {}} // Disabled for dev pages  
          onRefreshCards={() => window.location.reload()}
          title="User Management"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`h-screen flex flex-col ${dynamicTheme.colors.background.primary}`}>
        <UniversalDevHeader onOpenTray={() => setTrayOpen(true)} />
        <div className={`container mx-auto p-6 ${dynamicTheme.colors.text.primary}`}>
          <h1 className="text-2xl font-bold mb-6">User Management</h1>
          <div className={`text-center py-8 ${dynamicTheme.colors.status.error.text}`}>Error loading users: {error}</div>
        </div>
        <LeftTray isOpen={trayOpen} onClose={() => setTrayOpen(false)} title="User Management" />
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${dynamicTheme.colors.background.primary}`}>
      {/* Header */}
      <UniversalDevHeader
        onOpenTray={() => setTrayOpen(true)}
        onExportAllData={handleExportAllData}
      />

      {/* Main Content */}
      <div className={`flex-1 overflow-auto p-6 ${dynamicTheme.colors.text.primary}`}>
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Users className="w-8 h-8" />
                User Management
              </h1>
              <p className={`${dynamicTheme.colors.text.secondary} mt-1`}>
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
            <div className={`${dynamicTheme.colors.background.tertiary} p-4 rounded-lg`}>
              <div className="flex items-center gap-2 mb-2">
                <Users className={`w-5 h-5 ${dynamicTheme.colors.status.info.icon}`} />
                <span className={`font-medium ${dynamicTheme.colors.text.primary}`}>Total Users</span>
              </div>
              <p className={`text-2xl font-bold ${dynamicTheme.colors.text.primary}`}>{users.length}</p>
            </div>
            
            <div className={`${dynamicTheme.colors.background.tertiary} p-4 rounded-lg`}>
              <div className="flex items-center gap-2 mb-2">
                <User className={`w-5 h-5 ${dynamicTheme.colors.status.success.icon}`} />
                <span className={`font-medium ${dynamicTheme.colors.text.primary}`}>Regular Users</span>
              </div>
              <p className={`text-2xl font-bold ${dynamicTheme.colors.text.primary}`}>
                {users.filter(u => !u.isSystemUser).length}
              </p>
            </div>

            <div className={`${dynamicTheme.colors.background.tertiary} p-4 rounded-lg`}>
              <div className="flex items-center gap-2 mb-2">
                <FileText className={`w-5 h-5 ${dynamicTheme.colors.text.secondary}`} />
                <span className={`font-medium ${dynamicTheme.colors.text.primary}`}>Total Cards</span>
              </div>
              <p className={`text-2xl font-bold ${dynamicTheme.colors.text.primary}`}>{cards.length}</p>
            </div>

            <div className={`${dynamicTheme.colors.background.tertiary} p-4 rounded-lg`}>
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className={`w-5 h-5 ${dynamicTheme.colors.status.warning.icon}`} />
                <span className={`font-medium ${dynamicTheme.colors.text.primary}`}>Assignments</span>
              </div>
              <p className={`text-2xl font-bold ${dynamicTheme.colors.text.primary}`}>
                {cards.filter(c => c.assignedToUserId).length}
              </p>
            </div>
          </div>

          {/* Users List */}
          <div className={`${dynamicTheme.colors.background.card} rounded-lg shadow ${dynamicTheme.colors.border.primary} border`}>
            <div className={`px-6 py-4 border-b ${dynamicTheme.colors.border.primary}`}>
              <h2 className="text-lg font-semibold">All Users</h2>
            </div>
            <div className={`divide-y ${dynamicTheme.colors.border.primary}`}>
              {users.map((user) => {
                const stats = getUserStats(user);
                const isCurrentUser = user.id === currentUserId;
                
                return (
                  <div key={user.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 relative">
                      <ProfilePicture
                        src={user.profilePicture}
                        name={user.name}
                        size="md"
                      />
                      {user.isSystemUser && (
                        <div className={`absolute -top-1 -right-1 w-4 h-4 ${dynamicTheme.colors.status.warning.bg} rounded-full flex items-center justify-center border-0`}>
                          <Crown className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${dynamicTheme.colors.text.primary}`}>
                          {user.name}
                        </p>
                        {isCurrentUser && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${dynamicTheme.colors.status.info.bg} ${dynamicTheme.colors.status.info.text}`}>
                            Current
                          </span>
                        )}
                        {user.isSystemUser && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${dynamicTheme.colors.status.warning.bg} ${dynamicTheme.colors.status.warning.text}`}>
                            System
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <p className={`text-xs ${dynamicTheme.colors.text.tertiary}`}>
                          ID: {user.id}
                        </p>
                        <p className={`text-xs ${dynamicTheme.colors.text.tertiary}`}>
                          Theme: {user.preferences?.theme || 'system'}
                        </p>
                        <p className={`text-xs ${dynamicTheme.colors.text.tertiary}`}>
                          Created: {stats.cardsCreated} cards
                        </p>
                        <p className={`text-xs ${dynamicTheme.colors.text.tertiary}`}>
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
                      className={`${dynamicTheme.colors.status.error.text} hover:opacity-80`}
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
        </div>
      </div>

      {/* Left Tray */}
      <LeftTray
        isOpen={trayOpen}
        onClose={() => setTrayOpen(false)}
        onNewCard={() => {}} // Disabled for dev pages
        onResetLayout={() => {}} // Disabled for dev pages  
        onRefreshCards={() => window.location.reload()}
        title="User Management"
      />

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