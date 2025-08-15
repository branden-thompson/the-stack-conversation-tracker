/**
 * UserProfileDialog Component
 * 
 * Modal for creating, editing, and viewing user profiles
 * 
 * Features:
 * - Create new users
 * - Edit existing user information
 * - Update user preferences (theme, notifications, etc.)
 * - View user statistics (cards created, assignments)
 * - Delete users (with confirmation)
 * - Responsive design with proper validation
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Crown, 
  Save, 
  Trash2, 
  AlertTriangle,
  Calendar,
  FileText,
  UserCheck,
  Settings,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfilePictureUpload } from '@/components/ui/profile-picture-upload';
import { ProfilePicture } from '@/components/ui/profile-picture';

const THEME_OPTIONS = [
  { value: 'system', label: 'System Default' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function UserProfileDialog({ 
  open, 
  onOpenChange, 
  user = null, // null for creating new user
  users = [],
  currentUserId,
  onUserSave,
  onUserDelete,
  cards = [], // for statistics
  mode = 'edit' // 'create', 'edit', 'view'
}) {
  const [formData, setFormData] = useState({
    name: '',
    preferences: {
      theme: 'system',
      notifications: true,
      defaultCardType: 'topic',
    }
  });
  const [activeTab, setActiveTab] = useState('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadMessage, setUploadMessage] = useState('');

  const isCreateMode = mode === 'create' || !user;
  const isViewMode = mode === 'view';
  const isCurrentUser = user?.id === currentUserId;
  const isSystemUser = user?.isSystemUser;

  // Initialize form data when user changes
  useEffect(() => {
    if (user && !isCreateMode) {
      setFormData({
        name: user.name || '',
        preferences: {
          theme: user.preferences?.theme || 'system',
          notifications: user.preferences?.notifications ?? true,
          defaultCardType: user.preferences?.defaultCardType || 'topic',
          ...user.preferences
        }
      });
    } else {
      setFormData({
        name: '',
        preferences: {
          theme: 'system',
          notifications: true,
          defaultCardType: 'topic',
        }
      });
    }
    setErrors({});
    setShowDeleteConfirm(false);
  }, [user, isCreateMode, open]);

  // Calculate user statistics
  const userStats = user ? {
    cardsCreated: cards.filter(card => card.createdByUserId === user.id).length,
    cardsAssigned: cards.filter(card => card.assignedToUserId === user.id).length,
    joinedDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'
  } : null;

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    // Check for duplicate names (except current user)
    const duplicateUser = users.find(u => 
      u.id !== user?.id && 
      u.name.toLowerCase() === formData.name.trim().toLowerCase()
    );
    if (duplicateUser) {
      newErrors.name = 'A user with this name already exists';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const userData = {
        ...formData,
        name: formData.name.trim(),
      };

      await onUserSave?.(userData, user?.id);
      onOpenChange?.(false);
    } catch (error) {
      console.error('Error saving user:', error);
      setErrors({ submit: 'Failed to save user. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!user || isSystemUser) return;

    setIsSubmitting(true);
    try {
      await onUserDelete?.(user.id);
      onOpenChange?.(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      setErrors({ submit: 'Failed to delete user. Please try again.' });
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  const updateFormData = (field, value) => {
    if (field.startsWith('preferences.')) {
      const prefKey = field.replace('preferences.', '');
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Profile picture handlers
  const handleProfilePictureUploadSuccess = (profilePicturePath, updatedUser) => {
    setUploadMessage('Profile picture uploaded successfully!');
    setTimeout(() => setUploadMessage(''), 3000);
    
    // Update the user data if callback provided
    if (onUserSave && updatedUser) {
      onUserSave(updatedUser, updatedUser.id);
    }
  };

  const handleProfilePictureUploadError = (error) => {
    setErrors({ profilePicture: error });
    setTimeout(() => setErrors(prev => ({ ...prev, profilePicture: undefined })), 5000);
  };

  const handleProfilePictureRemoveSuccess = (updatedUser) => {
    setUploadMessage('Profile picture removed successfully!');
    setTimeout(() => setUploadMessage(''), 3000);
    
    // Update the user data if callback provided
    if (onUserSave && updatedUser) {
      onUserSave(updatedUser, updatedUser.id);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCreateMode ? (
              <>
                <Plus className="w-5 h-5" />
                Create New User
              </>
            ) : (
              <>
                <User className="w-5 h-5" />
                {user?.name}
                {isSystemUser && <Crown className="w-4 h-4 opacity-60" />}
                {isCurrentUser && <span className="text-sm opacity-60">(You)</span>}
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isCreateMode 
              ? "Create a new user profile with custom preferences and settings."
              : isViewMode
              ? "View user profile information and statistics."
              : "Edit user profile information and preferences."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Preferences
              </TabsTrigger>
              {!isCreateMode && (
                <TabsTrigger value="statistics" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Statistics
                </TabsTrigger>
              )}
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                    placeholder="Enter user name"
                    disabled={isViewMode || isSystemUser}
                    className={cn(errors.name && "border-red-500")}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Profile Picture Upload */}
                {!isCreateMode && user && (
                  <div className="space-y-3">
                    <Label>Profile Picture</Label>
                    <div className="flex flex-col items-center gap-4">
                      {isViewMode ? (
                        <ProfilePicture
                          src={user.profilePicture}
                          name={user.name}
                          size="xl"
                        />
                      ) : (
                        <ProfilePictureUpload
                          userId={user.id}
                          currentProfilePicture={user.profilePicture}
                          onUploadSuccess={handleProfilePictureUploadSuccess}
                          onUploadError={handleProfilePictureUploadError}
                          onRemoveSuccess={handleProfilePictureRemoveSuccess}
                          size="lg"
                        />
                      )}
                      
                      {/* Upload success/error messages */}
                      {uploadMessage && (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          {uploadMessage}
                        </p>
                      )}
                      {errors.profilePicture && (
                        <p className="text-sm text-red-500">
                          {errors.profilePicture}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {!isCreateMode && user && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        User ID
                      </Label>
                      <p className="text-sm font-mono">{user.id}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Type
                      </Label>
                      <p className="text-sm flex items-center gap-1">
                        {isSystemUser ? (
                          <>
                            <Crown className="w-3 h-3" />
                            System User
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3" />
                            Regular User
                          </>
                        )}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Created
                      </Label>
                      <p className="text-sm">{userStats?.joinedDate}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Last Updated
                      </Label>
                      <p className="text-sm">
                        {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme Preference</Label>
                  <Select
                    value={formData.preferences.theme}
                    onValueChange={(value) => updateFormData('preferences.theme', value)}
                    disabled={isViewMode}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {THEME_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Default Card Type</Label>
                  <Select
                    value={formData.preferences.defaultCardType}
                    onValueChange={(value) => updateFormData('preferences.defaultCardType', value)}
                    disabled={isViewMode}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="topic">Topic</SelectItem>
                      <SelectItem value="question">Question</SelectItem>
                      <SelectItem value="fact">Fact</SelectItem>
                      <SelectItem value="opinion">Opinion</SelectItem>
                      <SelectItem value="action">Action</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="notifications"
                    checked={formData.preferences.notifications}
                    onChange={(e) => updateFormData('preferences.notifications', e.target.checked)}
                    disabled={isViewMode}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="notifications">Enable notifications</Label>
                </div>
              </div>
            </TabsContent>

            {/* Statistics Tab */}
            {!isCreateMode && userStats && (
              <TabsContent value="statistics" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Cards Created
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {userStats.cardsCreated}
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm font-medium text-green-800 dark:text-green-200">
                        Cards Assigned
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {userStats.cardsAssigned}
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                        Member Since
                      </span>
                    </div>
                    <p className="text-sm font-bold text-purple-900 dark:text-purple-100">
                      {userStats.joinedDate}
                    </p>
                  </div>
                </div>

                {userStats.cardsCreated > 0 && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium mb-2">Activity Summary</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      This user has been active in creating content and collaborating 
                      with {userStats.cardsCreated} cards created and {userStats.cardsAssigned} assignments.
                    </p>
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-700 dark:text-red-300">{errors.submit}</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4">
          <div>
            {!isCreateMode && !isSystemUser && !isViewMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={isSubmitting}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete User
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange?.(false)}
              disabled={isSubmitting}
            >
              {isViewMode ? 'Close' : 'Cancel'}
            </Button>
            {!isViewMode && (
              <Button
                onClick={handleSave}
                disabled={isSubmitting || Object.keys(errors).length > 0}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Saving...' : isCreateMode ? 'Create User' : 'Save Changes'}
              </Button>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-semibold">Delete User</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete <strong>{user?.name}</strong>? 
                This action cannot be undone. The user's created cards will remain 
                but show as "Unknown" creator.
              </p>
              <div className="flex items-center gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Deleting...' : 'Delete User'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}