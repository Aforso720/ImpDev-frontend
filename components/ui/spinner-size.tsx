  import { Spinner } from "@/components/ui/spinner"

  export function SpinnerSize({ size }: { size: number }) {
    return (
      <div className="flex items-center gap-6">
        <Spinner className={`size-${size}`} />
      </div>
    )
  }
