import * as React from "react"

import { cn } from "@/lib/utils"
import { useAppTheme } from '@/lib/contexts/ThemeProvider'

function Input({
  className,
  type,
  ...props
}) {
  const { appTheme } = useAppTheme();
  
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        appTheme.colors.background.secondary,
        appTheme.colors.border.primary,
        appTheme.colors.text.primary,
        appTheme.shadows.sm,
        "placeholder:" + appTheme.colors.text.tertiary,
        "file:" + appTheme.colors.text.primary,
        "selection:bg-blue-500 selection:text-white",
        "focus-visible:ring-[3px] focus-visible:ring-blue-500/50",
        "aria-invalid:ring-red-500/20 aria-invalid:border-red-500",
        className
      )}
      {...props} />
  );
}

export { Input }
