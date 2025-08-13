'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Laptop } from 'lucide-react';

const TOOLBAR_H = 40; // px — keep in sync with Board header buttons

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const current = theme === 'system' ? systemTheme : theme;

  const iconBtnClass =
    `h-[${TOOLBAR_H}px] w-[${TOOLBAR_H}px] p-0 leading-none`;

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Theme toggle">
      <Button
        variant={current === 'light' ? 'default' : 'outline'}
        size="icon"
        className={iconBtnClass}
        aria-pressed={current === 'light'}
        aria-label="Light theme"
        title="Light"
        onClick={() => setTheme('light')}
      >
        <Sun className="h-[1.1rem] w-[1.1rem]" />
      </Button>

      <Button
        variant={current === 'dark' ? 'default' : 'outline'}
        size="icon"
        className={iconBtnClass}
        aria-pressed={current === 'dark'}
        aria-label="Dark theme"
        title="Dark"
        onClick={() => setTheme('dark')}
      >
        <Moon className="h-[1.1rem] w-[1.1rem]" />
      </Button>

      <Button
        variant={theme === 'system' ? 'default' : 'outline'}
        size="icon"
        className={iconBtnClass}
        aria-pressed={theme === 'system'}
        aria-label="System theme"
        title="System"
        onClick={() => setTheme('system')}
      >
        <Laptop className="h-[1.1rem] w-[1.1rem]" />
      </Button>
    </div>
  );
}