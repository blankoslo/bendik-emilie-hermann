import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

/**
 * Alert — Figma lag-12-ds.
 * 4 system variants matching Figma "Type":
 *   info     → bg info-light,    icon/heading info
 *   success  → bg success-light, icon/heading success
 *   warning  → bg warning-light, icon/heading warning
 *   error    → bg error-light,   icon/heading error
 * Layout: 16px padding, 16px gap, 4px radius. Body text is text-placeholder
 * (#666) to match the Figma sample; titles inherit the system colour.
 */
const alertVariants = cva(
  "group/alert relative grid w-full gap-1 rounded-sm border-0 px-4 py-4 text-left font-sans text-base leading-6 has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-14 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-4 *:[svg]:row-span-2 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-6",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        info: "bg-info-light text-info",
        success: "bg-success-light text-success",
        warning: "bg-warning-light text-warning",
        error: "bg-error-light text-error",
        destructive: "bg-error-light text-error",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      data-variant={variant}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-semibold text-current group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:opacity-80",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-base text-balance text-muted-foreground md:text-pretty group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-2",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn(
        "absolute top-4 right-4 inline-flex size-6 items-center justify-center text-current",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
