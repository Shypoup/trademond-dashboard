import * as React from "react"
import {
  Toast as ToastPrimitive,
  ToastTitle as ToastPrimitiveTitle,
  ToastDescription as ToastPrimitiveDescription,
} from "@base-ui/react-toast"

import { cn } from "@/lib/utils"

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed inset-x-4 bottom-4 z-50 m-0 flex max-h-[100dvh] list-none flex-col gap-2 outline-none sm:bottom-6 sm:right-6 sm:left-auto sm:max-w-sm",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitive.Viewport.displayName

const ToastRoot = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & {
    variant?: "default" | "destructive"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <ToastPrimitive.Root
    ref={ref}
    data-variant={variant}
    className={cn(
      "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl border bg-slate-900/95 px-4 py-3 text-sm text-slate-50 shadow-lg ring-1 ring-black/10 backdrop-blur",
      "data-[variant=destructive]:border-rose-400/60 data-[variant=destructive]:bg-rose-700/95 data-[variant=destructive]:text-rose-50",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4",
      className
    )}
    {...props}
  />
))
ToastRoot.displayName = ToastPrimitive.Root.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitiveTitle>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitiveTitle>
>(({ className, ...props }, ref) => (
  <ToastPrimitiveTitle
    ref={ref}
    className={cn("font-semibold text-sm", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitiveTitle.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitiveDescription>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitiveDescription>
>(({ className, ...props }, ref) => (
  <ToastPrimitiveDescription
    ref={ref}
    className={cn("mt-1 text-xs text-slate-100/80", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitiveDescription.displayName

export { ToastRoot as Toast, ToastTitle, ToastDescription, ToastViewport }

