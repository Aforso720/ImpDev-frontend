"use client"

import Image from "next/image"
import { startTransition, useEffect, useEffectEvent, useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type BannerSliderProps = {
  images: string[]
  autoPlayMs?: number
  className?: string
}

export function BannerSlider({ images, autoPlayMs = 7000, className }: BannerSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const safeImages = images.filter(Boolean)
  const activeImage = safeImages[activeIndex]

  useEffect(() => {
    if (activeIndex >= safeImages.length) {
      setActiveIndex(0)
    }
  }, [activeIndex, safeImages.length])

  const nextSlide = useEffectEvent(() => {
    if (safeImages.length <= 1) return
    startTransition(() => {
      setActiveIndex((prev) => (prev + 1) % safeImages.length)
    })
  })

  useEffect(() => {
    if (safeImages.length <= 1 || isPaused) return
    const timer = setInterval(() => nextSlide(), autoPlayMs)
    return () => clearInterval(timer)
  }, [autoPlayMs, isPaused, nextSlide, safeImages.length])

  if (!activeImage) return null

  return (
    <Card
      className={cn("overflow-hidden rounded-3xl border border-brand-soft py-0", className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <CardContent className="relative h-[240px] p-0 sm:h-[320px] lg:h-[410px]">
        <Image
          src={`/${activeImage}`}
          alt={`Баннер ${activeIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1240px) 92vw, 1240px"
          className="object-cover"
          priority={activeIndex === 0}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-deep/45 via-transparent to-brand-deep/20" />

        {safeImages.length > 1 ? (
          <div className="absolute right-4 bottom-4 left-4 z-20 flex items-center justify-between gap-3 sm:left-auto sm:w-auto sm:min-w-[220px]">
            <div className="flex gap-1.5 rounded-full bg-brand-deep/30 px-2 py-1 backdrop-blur-sm">
              {safeImages.map((image, idx) => (
                <button
                  key={`${image}-${idx}`}
                  type="button"
                  aria-label={`Показать баннер ${idx + 1}`}
                  className={cn(
                    "size-2.5 rounded-full transition",
                    idx === activeIndex ? "bg-white" : "bg-white/45 hover:bg-white/70"
                  )}
                  onClick={() => startTransition(() => setActiveIndex(idx))}
                />
              ))}
            </div>

            <div className="flex gap-1.5 rounded-full bg-brand-deep/30 p-1 backdrop-blur-sm">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 text-white hover:rounded-full hover:bg-white/20 hover:text-white"
                onClick={() =>
                  startTransition(() =>
                    setActiveIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length)
                  )
                }
                aria-label="Предыдущий баннер"
              >
                <ArrowLeft className="size-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="size-8 text-white hover:rounded-full hover:bg-white/20 hover:text-white"
                onClick={nextSlide}
                aria-label="Следующий баннер"
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
