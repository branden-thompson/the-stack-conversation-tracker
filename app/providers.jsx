'use client';

import { ThemeProvider } from 'next-themes';
import { GlobalSessionProvider } from '@/lib/contexts/GlobalSessionProvider';

export default function Providers({ children }) {
  return (
    <ThemeProvider
      attribute="class"       // adds 'class="dark"' to <html> for dark mode
      defaultTheme="system"   // Light / Dark follow OS by default
      enableSystem            // allow system auto
      disableTransitionOnChange // avoids flashy transitions on toggle
    >
      <GlobalSessionProvider>
        {children}
      </GlobalSessionProvider>
    </ThemeProvider>
  );
}