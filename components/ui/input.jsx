import * as React from "react"

import { cn } from "@/lib/utils"
import { useDynamicAppTheme } from '@/lib/contexts/ThemeProvider'

function Input({
  className,
  type,
  ...props
}) {
  const dynamicTheme = useDynamicAppTheme();
  
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        dynamicTheme.colors.background.secondary,
        dynamicTheme.colors.border.primary,
        dynamicTheme.colors.text.primary,
        dynamicTheme.shadows.sm,
        "placeholder:" + dynamicTheme.colors.text.tertiary,
        "file:" + dynamicTheme.colors.text.primary,
        `selection:${dynamicTheme.colors.status.info.bg} selection:${dynamicTheme.colors.status.info.text}`,
        "focus-visible:ring-[3px]",
        "aria-invalid:ring-red-500/20 aria-invalid:border-red-500",
        className
      )}
      {...props} />
  );
}

export { Input }
