"use client"

import * as React from "react"

import { useFireflySettings } from "@/components/firefly/FireflySettings"
import { cn } from "@/lib/utils"

type FireflyTraceFieldProps = React.ComponentProps<"div"> & {
  active?: boolean
  delayMs?: number
}

export function FireflyTraceField({
  active = false,
  delayMs = 0,
  className,
  style,
  children,
  ...props
}: FireflyTraceFieldProps) {
  const { enabled } = useFireflySettings()

  return (
    <div
      className={cn(className, enabled && active && "firefly-submit-trace")}
      style={
        {
          ...style,
          "--firefly-trace-delay": `${delayMs}ms`,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  )
}

