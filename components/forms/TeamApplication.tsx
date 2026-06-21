"use client"

import { FireflyTraceField } from "@/components/firefly/FireflyTraceField"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type TeamApplicationProps = {
  name: string
  description: string
  onNameChange: (next: string) => void
  onDescriptionChange: (next: string) => void
  traceActive?: boolean
}

export function TeamApplication({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  traceActive = false,
}: TeamApplicationProps) {
  return (
    <div className="grid gap-3">
      <FireflyTraceField active={traceActive} delayMs={0} className="grid gap-2 rounded-md p-1">
        <label className="text-sm font-medium">Название</label>
        <Input value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Например: ImpDev" />
      </FireflyTraceField>

      <FireflyTraceField active={traceActive} delayMs={120} className="grid gap-2 rounded-md p-1">
        <label className="text-sm font-medium">Описание</label>
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Коротко: чем занимаетесь, кого ищете…"
          className="min-h-[110px]"
        />
      </FireflyTraceField>
    </div>
  )
}

