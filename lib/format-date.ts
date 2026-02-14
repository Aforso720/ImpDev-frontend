// utils/format-date.ts

export type DateParts = "year" | "month" | "day" | "time"

export type FormatDateOptions = {
  /** Какие части показывать (по умолчанию: year-month-day) */
  parts?: DateParts[]
  /** Локаль (по умолчанию: ru-RU) */
  locale?: string
  /** Часовой пояс (по умолчанию: Europe/Amsterdam) */
  timeZone?: string
  /** Формат месяца (по умолчанию: long -> «января») */
  month?: "numeric" | "2-digit" | "short" | "long"
  /** Формат дня (по умолчанию: 2-digit) */
  day?: "numeric" | "2-digit"
  /** Формат года (по умолчанию: numeric) */
  year?: "2-digit" | "numeric"
  /** 12/24 часа (по умолчанию: false -> 24-часовой) */
  hour12?: boolean
  /** Секунды показывать? (по умолчанию: false) */
  withSeconds?: boolean
  /** Разделитель между датой и временем (по умолчанию: " ") */
  dateTimeSeparator?: string
}

/**
 * Пример входа: 2026-01-10T07:47:37.373Z
 * Пример выхода: «10 января 2026», «январь 2026», «10 января 2026 08:47»
 */
export function formatDate(
  input: string | number | Date,
  opts: FormatDateOptions = {}
): string {
  const {
    parts = ["year", "month", "day"],
    locale = "ru-RU",
    timeZone = "Europe/Amsterdam",
    month = "long",
    day = "2-digit",
    year = "numeric",
    hour12 = false,
    withSeconds = false,
    dateTimeSeparator = " ",
  } = opts

  const date = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(date.getTime())) return ""

  const includeDate = parts.some((p) => p === "year" || p === "month" || p === "day")
  const includeTime = parts.includes("time")

  const dateFormatter = includeDate
    ? new Intl.DateTimeFormat(locale, {
        timeZone,
        year: parts.includes("year") ? year : undefined,
        month: parts.includes("month") ? month : undefined,
        day: parts.includes("day") ? day : undefined,
      })
    : null

  const timeFormatter = includeTime
    ? new Intl.DateTimeFormat(locale, {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: withSeconds ? "2-digit" : undefined,
        hour12,
      })
    : null

  const dateStr = dateFormatter ? dateFormatter.format(date) : ""
  const timeStr = timeFormatter ? timeFormatter.format(date) : ""

  if (dateStr && timeStr) return `${dateStr}${dateTimeSeparator}${timeStr}`
  return dateStr || timeStr
}
