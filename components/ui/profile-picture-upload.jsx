/**
 * ProfilePictureUpload Component
 * 
 * Reusable component for uploading and managing user profile pictures
 */

'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Upload, X, User, Camera } from 'lucide-react';

export function ProfilePictureUpload({
  userId,
  currentProfilePicture = null,
  onUploadSuccess,
  onUploadError,
  onRemoveSuccess,
  size = 'lg', // 'sm', 'md', 'lg'
  showRemoveButton = true,
  className,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16', 
    lg: 'w-24 h-24'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const handleFileSelect = (file) => {
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      onUploadError?.('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      onUploadError?.('File too large. Maximum size is 5MB.');
      return;
    }

    uploadFile(file);
  };

  const uploadFile = async (file) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await fetch(`/api/users/${userId}/profile-picture`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      onUploadSuccess?.(result.profilePicture, result.user);
      
    } catch (error) {
      console.error('Profile picture upload error:', error);
      onUploadError?.(error.message || 'Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentProfilePicture) return;
    
    setIsRemoving(true);
    
    try {
      const response = await fetch(`/api/users/${userId}/profile-picture`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Removal failed');
      }

      onRemoveSuccess?.(result.user);
      
    } catch (error) {
      console.error('Profile picture removal error:', error);
      onUploadError?.(error.message || 'Failed to remove profile picture');
    } finally {
      setIsRemoving(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {/* Profile Picture Display/Upload Area */}
      <div
        className={cn(
          'relative rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600',
          'flex items-center justify-center cursor-pointer transition-colors',
          'hover:border-blue-400 dark:hover:border-blue-500',
          sizeClasses[size],
          dragOver && 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20',
          (isUploading || isRemoving) && 'opacity-50 cursor-not-allowed'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!isUploading && !isRemoving ? openFileDialog : undefined}
      >
        {currentProfilePicture ? (
          <>
            {/* Current Profile Picture */}
            <img
              src={currentProfilePicture}
              alt="Profile"
              className={cn(
                'rounded-full object-cover',
                sizeClasses[size]
              )}
            />
            
            {/* Upload Overlay */}
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className={cn('text-white', iconSizes[size])} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-500 dark:text-gray-400">
            {isUploading ? (
              <div className={cn('animate-spin rounded-full border-2 border-blue-500 border-t-transparent', iconSizes[size])} />
            ) : (
              <User className={iconSizes[size]} />
            )}
            {size === 'lg' && (
              <span className="text-xs">Upload</span>
            )}
          </div>
        )}

        {/* Remove Button */}
        {currentProfilePicture && showRemoveButton && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            disabled={isRemoving}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
            title="Remove profile picture"
          >
            {isRemoving ? (
              <div className="w-3 h-3 animate-spin rounded-full border border-white border-t-transparent" />
            ) : (
              <X className="w-3 h-3" />
            )}
          </button>
        )}
      </div>

      {/* Upload Button (when no picture) */}
      {!currentProfilePicture && (
        <Button
          variant="outline"
          size="sm"
          onClick={openFileDialog}
          disabled={isUploading || isRemoving}
          className="flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          {isUploading ? 'Uploading...' : 'Upload Photo'}
        </Button>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Helper Text */}
      {size === 'lg' && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Drag & drop or click to upload<br />
          JPEG, PNG, WebP (max 5MB)
        </p>
      )}
    </div>
  );
}