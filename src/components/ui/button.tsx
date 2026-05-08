import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "~/lib/utils"

/**
 * Variants and sizes are sourced from the Figma design system (lag-12-ds).
 * - default → Figma primary-button (bg primary, white text, primary-hover on press)
 * - outline → Figma secondary-button (border + primary text, brand-100 fill on press)
 * - link    → Figma text-button (primary text, underline on hover)
 * Pressed/Disabled Figma states map to active:/disabled: utilities.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-sm border border-transparent bg-clip-padding font-sans text-base font-semibold leading-6 whitespace-nowrap transition-colors outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/40 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-hover disabled:bg-muted disabled:text-muted-foreground",
        outline:
          "border-primary bg-background text-primary hover:bg-secondary active:bg-secondary disabled:border-input disabled:text-muted-foreground disabled:bg-background",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:text-muted-foreground disabled:bg-muted",
        ghost:
          "text-primary hover:bg-secondary aria-expanded:bg-secondary disabled:text-muted-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/30 disabled:bg-muted disabled:text-muted-foreground",
        link:
          "h-auto rounded-none px-0 py-0 text-primary underline-offset-4 hover:text-primary-hover hover:underline active:text-primary-hover disabled:text-muted-foreground",
      },
      size: {
        default: "h-14 px-8 py-4",
        sm: "h-10 px-5 py-2 text-sm leading-5",
        xs: "h-8 px-3 py-1.5 text-sm leading-5",
        lg: "h-16 px-10 py-5 text-lg leading-7",
        icon: "size-14",
        "icon-sm": "size-10",
        "icon-xs": "size-8",
      },
    },
    compoundVariants: [
      { variant: "link", size: "default", className: "h-auto p-0" },
      { variant: "link", size: "sm", className: "h-auto p-0" },
      { variant: "link", size: "lg", className: "h-auto p-0" },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
