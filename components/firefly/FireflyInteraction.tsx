"use client"

import * as React from "react"

import { useFireflySettings } from "@/components/firefly/FireflySettings"
import { cn } from "@/lib/utils"

type SparkShape = "circle" | "diamond" | "square"

type Spark = {
  id: number
  x: number
  y: number
  size: number
  shape: SparkShape
  dx: number
  dy: number
}

type FireflyInteractionProps = {
  children: React.ReactNode
  className?: string
}

const SHAPES: SparkShape[] = ["circle", "diamond", "square"]

export function FireflyInteraction({ children, className }: FireflyInteractionProps) {
  const { enabled } = useFireflySettings()
  const rootRef = React.useRef<HTMLSpanElement | null>(null)
  const sparkIdRef = React.useRef(0)
  const lastSpawnRef = React.useRef(0)
  const [sparks, setSparks] = React.useState<Spark[]>([])
  const [hovered, setHovered] = React.useState(false)

  const spawnSpark = React.useCallback((clientX: number, clientY: number) => {
    const host = rootRef.current
    if (!host) return
    const bounds = host.getBoundingClientRect()
    if (bounds.width <= 0 || bounds.height <= 0) return

    const x = clientX - bounds.left
    const y = clientY - bounds.top
    const spark: Spark = {
      id: sparkIdRef.current++,
      x,
      y,
      size: Math.random() * 2 + 2,
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      dx: (Math.random() - 0.5) * 16,
      dy: Math.random() * -20 - 8,
    }

    setSparks((prev) => {
      const next = [...prev, spark]
      return next.slice(-18)
    })

    window.setTimeout(() => {
      setSparks((prev) => prev.filter((item) => item.id !== spark.id))
    }, 540)
  }, [])

  const handleMove = (event: React.MouseEvent<HTMLSpanElement>) => {
    if (!enabled) return

    const now = performance.now()
    if (now - lastSpawnRef.current < 32) return
    lastSpawnRef.current = now
    spawnSpark(event.clientX, event.clientY)
  }

  return (
    <span
      ref={rootRef}
      data-firefly-active={enabled && hovered ? "true" : "false"}
      className={cn("firefly-interaction relative inline-flex", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false)
        setSparks([])
      }}
      onMouseMove={handleMove}
    >
      {children}

      {enabled && (
        <span aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
          {sparks.map((spark) => (
            <span
              key={spark.id}
              className={cn("firefly-micro-particle", `firefly-shape-${spark.shape}`)}
              style={
                {
                  left: spark.x,
                  top: spark.y,
                  width: spark.size,
                  height: spark.size,
                  "--fx": `${spark.dx}px`,
                  "--fy": `${spark.dy}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </span>
      )}
    </span>
  )
}

