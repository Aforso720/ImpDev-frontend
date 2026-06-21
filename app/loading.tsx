"use client"

import * as React from "react"

import { useFireflySettings } from "@/components/firefly/FireflySettings"

const NODES = 16

export default function Loading() {
  const { enabled } = useFireflySettings()

  if (!enabled) {
    return (
      <div className="grid h-[40vh] place-items-center text-sm text-muted-foreground">
        Загрузка...
      </div>
    )
  }

  return (
    <div className="firefly-loading-mask" role="status" aria-live="polite" aria-label="Загрузка">
      <div className="firefly-loading-cluster" aria-hidden>
        {Array.from({ length: NODES }).map((_, index) => (
          <span
            key={index}
            data-core={index % 5 === 0 ? "true" : "false"}
            className="firefly-loading-node"
            style={
              {
                "--angle": `${(360 / NODES) * index}deg`,
                "--delay": `${index * 45}ms`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </div>
  )
}

