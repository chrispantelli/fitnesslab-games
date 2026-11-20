import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"

export function Button({ className, ...props }: ComponentProps<"button">) {
  return <button data-slot="button" className={twMerge(
    "inline-flex h-9 cursor-pointer items-center justify-center gap-2 whitespace-nowrap border border-input bg-background px-3 text-sm font-medium shadow-xs transition hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:cursor-default disabled:opacity-50",
    className
  )} {...props} />
}
