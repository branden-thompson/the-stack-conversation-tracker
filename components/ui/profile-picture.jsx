/**
 * ProfilePicture Component
 * 
 * Simple component for displaying user profile pictures with fallback
 */

'use client';

import { useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProfilePicture({
  src,
  name,
  size = 'md', // 'xs', 'sm', 'md', 'lg', 'xl'
  className,
  showFallback = true,
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '50': 'w-[50px] h-[50px]',
    '46': 'w-[46px] h-[46px]'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4', 
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '50': 'w-6 h-6',
    '46': 'w-6 h-6'
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Generate initials from name as fallback
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const initials = getInitials(name);

  // Show profile picture if available and not errored
  if (src && !imageError) {
    return (
      <div className={cn(
        'relative rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800',
        sizeClasses[size],
        className
      )}>
        <img
          src={src}
          alt={name ? `${name}'s profile` : 'Profile picture'}
          className={cn(
            'w-full h-full object-cover transition-opacity',
            imageLoading ? 'opacity-0' : 'opacity-100'
          )}
          onError={handleImageError}
          onLoad={handleImageLoad}
        />
        
        {/* Loading state */}
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className={cn('animate-pulse rounded-full bg-gray-200 dark:bg-gray-700', sizeClasses[size])} />
          </div>
        )}
      </div>
    );
  }

  // Show fallback
  if (!showFallback) {
    return null;
  }

  return (
    <div className={cn(
      'rounded-full flex items-center justify-center',
      'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
      sizeClasses[size],
      className
    )}>
      {initials ? (
        <span className={cn(
          'font-medium',
          size === 'xs' ? 'text-xs' : 
          size === 'sm' ? 'text-xs' : 
          size === 'md' ? 'text-sm' : 
          size === '50' ? 'text-lg' : 
          size === '46' ? 'text-lg' : 
          'text-base'
        )}>
          {initials}
        </span>
      ) : (
        <User className={iconSizes[size]} />
      )}
    </div>
  );
}