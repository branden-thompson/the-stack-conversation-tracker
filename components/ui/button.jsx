import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"
import { useAppTheme } from '@/lib/contexts/ThemeProvider'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"
  const { appTheme } = useAppTheme();
  
  // Create dynamic button variants based on theme
  const dynamicButtonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-blue-500/50",
    {
      variants: {
        variant: {
          default: cn(
            "text-white shadow-xs hover:opacity-90",
            "bg-blue-600 hover:bg-blue-700" // Use consistent primary color
          ),
          destructive: cn(
            "text-white shadow-xs hover:opacity-90",
            "bg-red-600 hover:bg-red-700"
          ),
          outline: cn(
            "border shadow-xs",
            appTheme.colors.background.secondary,
            appTheme.colors.border.primary,
            appTheme.colors.text.primary,
            appTheme.colors.background.hover
          ),
          secondary: cn(
            "shadow-xs",
            appTheme.colors.background.tertiary,
            appTheme.colors.text.primary,
            "hover:opacity-80"
          ),
          ghost: cn(
            appTheme.colors.text.primary,
            appTheme.colors.background.hover
          ),
          link: "text-blue-600 underline-offset-4 hover:underline",
        },
        size: {
          default: "h-9 px-4 py-2 has-[>svg]:px-3",
          sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
          lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
          icon: "size-9",
        },
      },
      defaultVariants: {
        variant: "default",
        size: "default",
      },
    }
  );

  return (
    <Comp
      data-slot="button"
      className={cn(dynamicButtonVariants({ variant, size }), className)}
      {...props} />
  );
}

export { Button, buttonVariants }
