'use client';

import { ThemeProvider } from 'next-themes';
import { GlobalSessionProvider } from '@/lib/contexts/GlobalSessionProvider';
import { DynamicThemeProvider } from '@/lib/contexts/ThemeProvider';
import { SafeUserThemeProvider } from '@/lib/contexts/UserThemeProvider';
import { QueryProvider } from '@/lib/providers/query-client';
import { useUserManagement } from '@/lib/hooks/useUserManagement';
import { isUserThemeIsolationEnabled } from '@/lib/utils/user-theme-storage';

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

  // Enhanced theme wrapper with user theme mode isolation
  const themeContent = (
    <DynamicThemeProvider 
      currentUser={currentUser}
      initialColorTheme="gray"
      onColorThemeChange={handleColorThemeChange}
    >
      {children}
    </DynamicThemeProvider>
  );

  // Conditional UserThemeProvider based on feature flag
  const isolationEnabled = isUserThemeIsolationEnabled();
  
  if (isolationEnabled) {
    return (
      <SafeUserThemeProvider 
        currentUser={currentUser}
        enableCrossTabSync={true}
      >
        {themeContent}
      </SafeUserThemeProvider>
    );
  }

  return themeContent;
}

export default function Providers({ children }) {
  return (
    <QueryProvider>
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
    </QueryProvider>
  );
}