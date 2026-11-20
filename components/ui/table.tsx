import type { ComponentProps } from "react"

export function Table(props: ComponentProps<"table">) {
  return <div data-slot="table-container" className="relative w-full overflow-x-auto">
    <table data-slot="table" {...props} />
  </div>
}
