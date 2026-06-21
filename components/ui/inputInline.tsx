import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import React from "react"

type InputInlineProps = {
  value: string
  onChange: (value: string) => void
  onSubmit?: () => void
  placeholder?: string
  disabled?: boolean
}

export function InputInline({
  value,
  onChange,
  onSubmit,
  placeholder = "Поиск…",
  disabled,
}: InputInlineProps) {
  return (
    <Field orientation="horizontal" className="flex-1">
      <Input
        type="search"
        placeholder={placeholder}
        className="border-brand-soft"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit?.()
        }}
      />
      <Button type="button" disabled={disabled} onClick={onSubmit} firefly>
        Поиск
      </Button>
    </Field>
  )
}
