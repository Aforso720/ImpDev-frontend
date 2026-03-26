import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type ComingSoonSectionProps = {
  title: string
  description: string
  points: string[]
}

export function ComingSoonSection({ title, description, points }: ComingSoonSectionProps) {
  return (
    <section className="mx-auto w-full max-w-[980px] space-y-4 pb-6">
      <Card className="overflow-hidden border-brand-soft">
        <CardHeader className="bg-brand-panel">
          <Badge variant="secondary" className="w-fit bg-white/14 text-ink-inverse hover:bg-white/14">
            Скоро
          </Badge>
          <CardTitle className="text-2xl text-ink-inverse">{title}</CardTitle>
          <CardDescription className="max-w-2xl text-ink-inverse/85">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 p-5">
          <div className="grid gap-3 md:grid-cols-3">
            {points.map((point) => (
              <Card key={point} className="border-brand-soft bg-soft-panel">
                <CardContent className="p-4 text-sm text-ink-soft">{point}</CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/">
                Вернуться на главную
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/courses">Перейти к курсам</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
