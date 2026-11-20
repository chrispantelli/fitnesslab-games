import type { ComponentProps } from "react"
import { twMerge } from "tailwind-merge"

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input data-slot="input" className={twMerge(
    "h-9 w-full min-w-0 border border-input bg-background px-3 text-base shadow-xs outline-none transition focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25 placeholder:text-muted-foreground disabled:opacity-50 md:text-sm",
    className
  )} {...props} />
}
