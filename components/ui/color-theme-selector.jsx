/**
 * ColorThemeSelector Component
 * A dropdown-based selector for color themes
 * Options change based on light/dark mode
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { APP_THEME } from '@/lib/utils/ui-constants';
import { getAvailableColorThemes, getDefaultColorTheme } from '@/lib/themes/theme-loader';
import { useDynamicAppTheme } from '@/lib/contexts/ThemeProvider';
import { Palette, ChevronDown } from 'lucide-react';

export function ColorThemeSelector({ 
  currentColorTheme = 'gray',
  currentTheme = 'light', // light/dark/system
  systemTheme = 'light',
  onColorThemeChange,
  className 
}) {
  // Get dynamic theme
  const dynamicTheme = useDynamicAppTheme();
  
  const [availableThemes, setAvailableThemes] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  
  // Determine effective theme for preview
  const effectiveTheme = currentTheme === 'system' ? systemTheme : currentTheme;
  const isDark = effectiveTheme === 'dark';
  
  // Load available themes on mount and filter by light/dark mode
  useEffect(() => {
    try {
      const allThemes = getAvailableColorThemes();
      
      // Filter themes based on current mode
      // Dark-only themes should only appear in dark mode
      const filteredThemes = allThemes.filter(theme => {
        if (theme.darkOnly && effectiveTheme !== 'dark') {
          return false; // Hide dark-only themes in light mode
        }
        return true;
      });
      
      setAvailableThemes(filteredThemes);
    } catch (error) {
      console.warn('Failed to load color themes:', error);
      setAvailableThemes([getDefaultColorTheme()]);
    }
  }, [effectiveTheme]); // Re-filter when theme mode changes

  const handleThemeSelect = (themeId) => {
    if (onColorThemeChange) {
      onColorThemeChange(themeId);
    }
    setIsOpen(false);
  };

  // Get preview colors for a theme
  const getPreviewColors = (theme) => {
    return {
      primary: theme.id,
      secondary: theme.id,
    };
  };

  if (availableThemes.length === 0) {
    return null; // Loading or no themes available
  }

  const currentThemeObj = availableThemes.find(t => t.id === currentColorTheme) || availableThemes[0];

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header */}
      <div className={cn(
        "text-xs font-medium uppercase tracking-wide flex items-center gap-2",
        dynamicTheme.colors.text.tertiary
      )}>
        <Palette className="h-3 w-3" />
        Color Theme
      </div>

      {/* Dropdown */}
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "w-full justify-between h-8 px-2 text-xs",
            "transition-colors"
          )}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2">
            {/* Color Preview */}
            <div className="flex gap-1">
              <div className={cn(
                "w-3 h-3 rounded-full border border-gray-300",
                currentThemeObj.id === 'gray' && (isDark ? 'bg-gray-800' : 'bg-gray-100'),
                currentThemeObj.id === 'blue' && (isDark ? 'bg-sky-900' : 'bg-sky-100'),
                currentThemeObj.id === 'green' && (isDark ? 'bg-emerald-900' : 'bg-emerald-100'),
                currentThemeObj.id === 'purple' && (isDark ? 'bg-violet-900' : 'bg-violet-100'),
                currentThemeObj.id === 'synthwave' && (isDark ? 'bg-[#201a2a]' : 'bg-gray-100'),
              )} />
              <div className={cn(
                "w-3 h-3 rounded-full border border-gray-300",
                currentThemeObj.id === 'gray' && (isDark ? 'bg-gray-700' : 'bg-gray-50'),
                currentThemeObj.id === 'blue' && (isDark ? 'bg-sky-950' : 'bg-sky-50'),
                currentThemeObj.id === 'green' && (isDark ? 'bg-emerald-950' : 'bg-emerald-50'),
                currentThemeObj.id === 'purple' && (isDark ? 'bg-violet-950' : 'bg-violet-50'),
                currentThemeObj.id === 'synthwave' && (isDark ? 'bg-[#f52baf]' : 'bg-gray-50'),
              )} />
            </div>
            
            {/* Theme Name */}
            <span className="font-medium">{currentThemeObj.name}</span>
          </div>
          
          <ChevronDown className={cn(
            "h-3 w-3 transition-transform",
            isOpen && "rotate-180"
          )} />
        </Button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className={cn(
            "absolute top-full left-0 right-0 mt-1 z-50",
            dynamicTheme.colors.background.dropdown,
            dynamicTheme.colors.border.primary,
            "border rounded-md shadow-lg",
            "py-1"
          )}>
            {availableThemes.map((theme) => {
              const isSelected = currentColorTheme === theme.id;
              
              return (
                <button
                  key={theme.id}
                  className={cn(
                    "w-full px-3 py-2 text-left text-xs",
                    "flex items-center gap-2",
                    "transition-colors",
                    dynamicTheme.colors.background.hover,
                    isSelected && dynamicTheme.colors.background.accent
                  )}
                  onClick={() => handleThemeSelect(theme.id)}
                >
                  {/* Color Preview */}
                  <div className="flex gap-1 flex-shrink-0">
                    <div className={cn(
                      "w-3 h-3 rounded-full border border-gray-300",
                      theme.id === 'gray' && (isDark ? 'bg-gray-800' : 'bg-gray-100'),
                      theme.id === 'blue' && (isDark ? 'bg-sky-900' : 'bg-sky-100'),
                      theme.id === 'green' && (isDark ? 'bg-emerald-900' : 'bg-emerald-100'),
                      theme.id === 'purple' && (isDark ? 'bg-violet-900' : 'bg-violet-100'),
                      theme.id === 'synthwave' && (isDark ? 'bg-[#201a2a]' : 'bg-gray-100'),
                    )} />
                    <div className={cn(
                      "w-3 h-3 rounded-full border border-gray-300",
                      theme.id === 'gray' && (isDark ? 'bg-gray-700' : 'bg-gray-50'),
                      theme.id === 'blue' && (isDark ? 'bg-sky-950' : 'bg-sky-50'),
                      theme.id === 'green' && (isDark ? 'bg-emerald-950' : 'bg-emerald-50'),
                      theme.id === 'purple' && (isDark ? 'bg-violet-950' : 'bg-violet-50'),
                      theme.id === 'synthwave' && (isDark ? 'bg-[#f52baf]' : 'bg-gray-50'),
                    )} />
                  </div>
                  
                  {/* Theme Name */}
                  <span className="font-medium flex-1">{theme.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Current Theme Description */}
      <div className={cn(
        "text-xs p-2 rounded border",
        dynamicTheme.colors.background.tertiary,
        dynamicTheme.colors.border.primary,
        dynamicTheme.colors.text.muted
      )}>
        {currentThemeObj.description}
      </div>
    </div>
  );
}