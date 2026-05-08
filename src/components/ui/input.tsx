import * as React from "react"

import { cn } from "~/lib/utils"

/**
 * Input — Figma lag-12-ds (Input field, input-text).
 * States:
 *  - Default  → border-default (#d9d9d9), placeholder text-placeholder (#666)
 *  - Focused  → border-primary (#4f59fb)
 *  - Filled   → neutral-300 text (#808080) — handled by browser default
 *  - Disabled → bg-disabled (#d9d9d9), border-disabled (#a6a6a6), text-disabled (#4d4d4d)
 *
 * Pair with the `Field` + `FieldLabel` components for the labelled form-field
 * shape from Figma's "Input field" frame.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-14 w-full min-w-0 rounded-sm border border-input bg-background px-4 py-4 font-sans text-base leading-6 text-foreground transition-colors outline-none",
        "placeholder:text-muted-foreground",
        "file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:border-[--neutral-200,#a6a6a6] disabled:text-[--text-disabled,#4d4d4d]",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        className
      )}
      {...props}
    />
  )
}

export { Input }
