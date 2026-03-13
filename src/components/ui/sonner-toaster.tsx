import { Toaster as SonnerToaster } from "sonner"

/**
 * App-wide toast viewport based on the `sonner` library.
 *
 * Place this once near the root layout (e.g. in App.tsx)
 * to enable shadcn-style toast notifications across pages.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            "rounded-xl border border-slate-800 bg-slate-900/95 text-slate-50 shadow-lg shadow-slate-900/40",
          title: "text-sm font-semibold",
          description: "text-xs text-slate-200/80",
        },
      }}
    />
  )
}

