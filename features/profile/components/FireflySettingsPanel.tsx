"use client"

import { MoonStar, Sparkles } from "lucide-react"

import { useFireflySettings } from "@/components/firefly/FireflySettings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function FireflySettingsPanel() {
  const { enabled, ready, setEnabled } = useFireflySettings()

  return (
    <section className="mx-auto w-full max-w-[780px] space-y-4 pb-6">
      <Card className="overflow-hidden border-border py-0">
        <CardHeader className="bg-brand-deep py-5">
          <Badge variant="secondary" className="w-fit bg-nuri-accent/15 text-white hover:bg-nuri-accent/15">
            Интерфейс
          </Badge>
          <CardTitle className="text-2xl text-white">Настройки Firefly</CardTitle>
          <CardDescription className="text-white/85">
            Управляйте визуальными эффектами: фоновые частицы, свечения и переходы маршрутов.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-4 w-4" />
            Firefly Interface
          </CardTitle>
          <CardDescription>
            Рекомендуется оставить включенным. Если важнее максимальная простота, эффекты можно отключить.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm text-foreground">Состояние: {ready ? (enabled ? "включено" : "отключено") : "загрузка..."}</p>
            <p className="text-xs text-muted-foreground">Сохраняется локально для текущего браузера.</p>
          </div>

          <Button
            type="button"
            firefly
            variant={enabled ? "default" : "secondary"}
            onClick={() => setEnabled(!enabled)}
            disabled={!ready}
          >
            {enabled ? (
              <>
                <MoonStar className="h-4 w-4" />
                Выключить эффекты
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Включить эффекты
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </section>
  )
}

