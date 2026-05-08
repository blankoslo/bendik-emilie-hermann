import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "~/lib/utils"

/**
 * Badge / tag — Figma lag-12-ds.
 * Default Figma badge: bg-primary, text-white (#d9d9d9), 14px DM Sans regular,
 * 16px line-height, padding 4×8, radius-full.
 *  - Actionable=True  → includes a trailing 16px icon, gap 8px (default).
 *  - Actionable=False → label only, gap 4px (use `actionable={false}` shorthand).
 *
 * Variant aliases (`info`, `success`, `warning`, `error`) use the Figma system
 * color pair (light bg + dark text).
 */
const badgeVariants = cva(
  "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full border border-transparent px-2 py-1 font-sans text-sm font-normal leading-4 whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 aria-invalid:border-destructive [&>svg]:pointer-events-none [&>svg]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary-hover",
        secondary:
          "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        outline:
          "border-input text-foreground [a]:hover:bg-secondary [a]:hover:text-secondary-foreground",
        info: "bg-info-light text-info",
        success: "bg-success-light text-success",
        warning: "bg-warning-light text-warning",
        error: "bg-error-light text-error",
        destructive:
          "bg-error-light text-error focus-visible:ring-destructive/30",
        ghost:
          "text-primary hover:bg-secondary",
        link: "text-primary underline-offset-4 hover:underline",
      },
      actionable: {
        true: "gap-2",
        false: "gap-1",
      },
    },
    defaultVariants: {
      variant: "default",
      actionable: true,
    },
  }
)

function Badge({
  className,
  variant = "default",
  actionable,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-actionable={actionable ?? true}
      className={cn(badgeVariants({ variant, actionable }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
