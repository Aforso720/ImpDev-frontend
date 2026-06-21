"use client"

import Link from "next/link"
import { startTransition, useEffect, useEffectEvent, useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type SliderStat = {
  label: string
  value: string
}

export type HeroSlide = {
  id: string
  kicker?: string
  title: string
  description: string
  href?: string
  hrefLabel?: string
  secondaryHref?: string
  secondaryLabel?: string
  stats?: SliderStat[]
  tone?: "ocean" | "indigo" | "teal"
}

type HeroSliderProps = {
  slides: HeroSlide[]
  autoPlayMs?: number
  className?: string
}

function toneClass(tone: HeroSlide["tone"]) {
  switch (tone) {
    case "indigo":
      return "from-brand-deep via-brand-panel to-action"
    case "teal":
      return "from-brand-deep via-action to-nuri-accent"
    case "ocean":
    default:
      return "from-brand-deep via-brand-panel to-brand-deep"
  }
}

export function HeroSlider({ slides, autoPlayMs = 6500, className }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const safeSlides = slides.length > 0 ? slides : []
  const activeSlide = safeSlides[activeIndex]

  const nextSlide = useEffectEvent(() => {
    if (safeSlides.length <= 1) return
    startTransition(() => {
      setActiveIndex((prev) => (prev + 1) % safeSlides.length)
    })
  })

  useEffect(() => {
    if (safeSlides.length <= 1 || isPaused) return
    const timer = setInterval(() => nextSlide(), autoPlayMs)
    return () => clearInterval(timer)
  }, [autoPlayMs, isPaused, nextSlide, safeSlides.length])

  if (!activeSlide) return null

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border py-0 shadow-2xl shadow-brand-deep/20",
        className,
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <CardContent className="relative h-[460px] p-0 sm:h-[410px] lg:h-[360px]">
        <div className={cn("relative isolate h-full overflow-hidden", "bg-gradient-to-br", toneClass(activeSlide.tone))}>
          <div className="pointer-events-none absolute -top-36 -right-28 size-80 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-16 size-72 rounded-full bg-nuri-accent/15 blur-2xl" />

          <div className="relative z-10 grid h-full content-between gap-6 p-6 pb-16 text-white sm:pb-18 lg:grid-cols-[1.6fr_1fr] lg:gap-7 lg:p-8 lg:pb-20">
            <div className="space-y-4">
              {activeSlide.kicker ? (
                <Badge className="bg-white/12 text-white hover:bg-white/12">{activeSlide.kicker}</Badge>
              ) : null}

              <div className="space-y-3">
                <h2 className="max-w-3xl text-2xl font-semibold text-white line-clamp-3 sm:text-3xl lg:text-[2.05rem]">
                  {activeSlide.title}
                </h2>
                <p className="max-w-3xl text-sm text-slate-100/95 line-clamp-3 sm:text-base">{activeSlide.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {activeSlide.href && activeSlide.hrefLabel ? (
                  <Button asChild>
                    <Link href={activeSlide.href}>{activeSlide.hrefLabel}</Link>
                  </Button>
                ) : null}

                {activeSlide.secondaryHref && activeSlide.secondaryLabel ? (
                  <Button asChild variant='ghost' className="border-white/40 text-white">
                    <Link href={activeSlide.secondaryHref}>{activeSlide.secondaryLabel}</Link>
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 lg:grid-cols-1">
              {(activeSlide.stats ?? []).map((stat) => (
                <Card key={stat.label} className="border-white/20 bg-white/10 shadow-none">
                  <CardContent className="h-full p-3 sm:p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-100/70">{stat.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {safeSlides.length > 1 ? (
          <div className="absolute right-4 bottom-4 left-4 z-20 flex items-center justify-between gap-3 sm:left-auto sm:w-auto sm:min-w-[220px]">
            <div className="flex gap-1.5 rounded-full bg-black/20 px-2 py-1 backdrop-blur-sm">
              {safeSlides.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Go to slide ${idx + 1}`}
                  className={cn(
                    "size-2.5 rounded-full transition",
                    idx === activeIndex ? "bg-white" : "bg-white/35 hover:bg-white/70",
                  )}
                  onClick={() => startTransition(() => setActiveIndex(idx))}
                />
              ))}
            </div>

            <div className="flex gap-1.5 rounded-full bg-black/20 p-1 backdrop-blur-sm">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 text-white hover:bg-white/15 hover:text-white hover:rounded-4xl"
                onClick={() =>
                  startTransition(() =>
                    setActiveIndex((prev) => (prev - 1 + safeSlides.length) % safeSlides.length),
                  )
                }
                aria-label="Previous slide"
              >
                <ArrowLeft className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 text-white hover:bg-white/15 hover:text-white hover:rounded-4xl"
                onClick={nextSlide}
                aria-label="Next slide"
              >
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
