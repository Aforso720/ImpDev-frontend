"use client"

import * as React from "react"

import { useFireflySettings } from "@/components/firefly/FireflySettings"

type ParticleShape = "circle" | "square" | "diamond"

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  drift: number
  shape: ParticleShape
  color: string
}

const SHAPES: ParticleShape[] = ["circle", "square", "diamond"]
const PARTICLE_COLOR_TOKENS = [
  { name: "--nuri-accent", alpha: 0.48 },
  { name: "--action", alpha: 0.34 },
  { name: "--brand-deep", alpha: 0.18 },
]

function withAlpha(value: string, alpha: number) {
  const color = value.trim()
  const hex = color.match(/^#([0-9a-f]{6})$/i)?.[1]

  if (!hex) return color

  const red = Number.parseInt(hex.slice(0, 2), 16)
  const green = Number.parseInt(hex.slice(2, 4), 16)
  const blue = Number.parseInt(hex.slice(4, 6), 16)

  return `rgb(${red} ${green} ${blue} / ${alpha})`
}

function getThemeColor(name: string, alpha: number) {
  const value = window.getComputedStyle(document.documentElement).getPropertyValue(name)

  return withAlpha(value, alpha)
}

function getParticleColors() {
  return PARTICLE_COLOR_TOKENS.map((color) => getThemeColor(color.name, color.alpha))
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function createParticles(count: number, width: number, height: number, colors: string[]): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: randomBetween(-0.08, 0.08),
    vy: randomBetween(-0.08, 0.08),
    size: randomBetween(1.2, 2.8),
    drift: randomBetween(-0.5, 0.5),
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
  }))
}

export function FireflyBackground() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const { enabled } = useFireflySettings()

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !enabled) return
    if (typeof window === "undefined") return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduceMotion) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = 1
    let raf = 0
    let particles: Particle[] = []

    const pointer = {
      x: 0,
      y: 0,
      active: false,
    }

    const syncCanvas = () => {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 1.5)

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.min(64, Math.max(24, Math.round((width * height) / 70000)))
      particles = createParticles(count, width, height, getParticleColors())
    }

    const onMove = (event: MouseEvent) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
      pointer.active = true
    }

    const onLeave = () => {
      pointer.active = false
    }

    const drawParticle = (particle: Particle, time: number) => {
      ctx.save()
      ctx.translate(particle.x, particle.y)
      ctx.rotate(time * 0.0002 + particle.drift)
      ctx.fillStyle = particle.color

      if (particle.shape === "circle") {
        ctx.beginPath()
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
        ctx.fill()
      } else if (particle.shape === "square") {
        ctx.fillRect(-particle.size, -particle.size, particle.size * 2, particle.size * 2)
      } else {
        ctx.beginPath()
        ctx.moveTo(0, -particle.size)
        ctx.lineTo(particle.size, 0)
        ctx.lineTo(0, particle.size)
        ctx.lineTo(-particle.size, 0)
        ctx.closePath()
        ctx.fill()
      }

      ctx.restore()
    }

    const render = (time: number) => {
      ctx.clearRect(0, 0, width, height)

      if (pointer.active) {
        const glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 180)
        glow.addColorStop(0, getThemeColor("--nuri-accent", 0.14))
        glow.addColorStop(1, getThemeColor("--nuri-accent", 0))
        ctx.fillStyle = glow
        ctx.fillRect(0, 0, width, height)
      }

      for (const particle of particles) {
        const driftX = Math.sin(time * 0.001 + particle.y * 0.012 + particle.drift) * 0.01
        const driftY = Math.cos(time * 0.001 + particle.x * 0.01 - particle.drift) * 0.01
        particle.vx += driftX
        particle.vy += driftY

        if (pointer.active) {
          const dx = pointer.x - particle.x
          const dy = pointer.y - particle.y
          const dist = Math.hypot(dx, dy)

          if (dist > 0 && dist < 240) {
            const force = ((240 - dist) / 240) * 0.018
            particle.vx += (dx / dist) * force
            particle.vy += (dy / dist) * force
          }
        }

        particle.vx *= 0.985
        particle.vy *= 0.985
        particle.x += particle.vx + particle.drift * 0.09
        particle.y += particle.vy + particle.drift * 0.07

        if (particle.x < -16) particle.x = width + 16
        if (particle.x > width + 16) particle.x = -16
        if (particle.y < -16) particle.y = height + 16
        if (particle.y > height + 16) particle.y = -16

        drawParticle(particle, time)
      }

      raf = window.requestAnimationFrame(render)
    }

    syncCanvas()
    window.addEventListener("resize", syncCanvas)
    window.addEventListener("mousemove", onMove, { passive: true })
    window.addEventListener("mouseleave", onLeave)
    raf = window.requestAnimationFrame(render)

    return () => {
      window.cancelAnimationFrame(raf)
      window.removeEventListener("resize", syncCanvas)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseleave", onLeave)
    }
  }, [enabled])

  if (!enabled) return null

  return <canvas ref={canvasRef} className="firefly-background pointer-events-none fixed inset-0 z-0" aria-hidden />
}
