'use client';

import { ThemeProvider } from 'next-themes';
import { GlobalSessionProvider } from '@/lib/contexts/GlobalSessionProvider';
import { DynamicThemeProvider } from '@/lib/contexts/ThemeProvider';
import { useUserManagement } from '@/lib/hooks/useUserManagement';

function AppThemeWrapper({ children }) {
  const { currentUser, updateUser, updateGuestPreferences, isCurrentUserGuest } = useUserManagement();
  
  // Color theme persistence handler
  const handleColorThemeChange = async (userId, colorTheme, isGuest) => {
    try {
      if (isGuest) {
        // Update guest preferences
        await updateGuestPreferences({ colorTheme });
      } else {
        // Update registered user preferences
        await updateUser(userId, { 
          preferences: { 
            ...currentUser?.preferences, 
            colorTheme 
          } 
        });
      }
    } catch (error) {
      console.error('[AppThemeWrapper] Failed to persist color theme:', error);
      throw error; // Let ThemeProvider handle the error
    }
  };

  return (
    <DynamicThemeProvider 
      currentUser={currentUser}
      initialColorTheme="gray"
      onColorThemeChange={handleColorThemeChange}
    >
      {children}
    </DynamicThemeProvider>
  );
}

export default function Providers({ children }) {
  return (
    <ThemeProvider
      attribute="class"       // adds 'class="dark"' to <html> for dark mode
      defaultTheme="dark"     // Default to dark mode as per requirements
      enableSystem            // allow system auto
      disableTransitionOnChange // avoids flashy transitions on toggle
    >
      <GlobalSessionProvider>
        <AppThemeWrapper>
          {children}
        </AppThemeWrapper>
      </GlobalSessionProvider>
    </ThemeProvider>
  );
}