"use client"

import * as React from "react"

const FIREFLY_STORAGE_KEY = "impdev.firefly-enabled"

type FireflySettingsContextValue = {
  enabled: boolean
  setEnabled: (next: boolean) => void
  ready: boolean
}

const FireflySettingsContext = React.createContext<FireflySettingsContextValue | null>(null)

function writeRootAttribute(enabled: boolean) {
  if (typeof document === "undefined") return
  document.documentElement.setAttribute("data-firefly-enabled", enabled ? "on" : "off")
}

function readStoredValue() {
  if (typeof window === "undefined") return null
  const stored = window.localStorage.getItem(FIREFLY_STORAGE_KEY)
  if (stored === "1" || stored === "true") return true
  if (stored === "0" || stored === "false") return false
  return null
}

export function FireflySettingsProvider({ children }: React.PropsWithChildren) {
  const [enabled, setEnabled] = React.useState(true)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    const stored = readStoredValue()
    if (stored !== null) setEnabled(stored)
    setReady(true)
  }, [])

  React.useEffect(() => {
    writeRootAttribute(enabled)
  }, [enabled])

  React.useEffect(() => {
    if (!ready || typeof window === "undefined") return
    window.localStorage.setItem(FIREFLY_STORAGE_KEY, enabled ? "1" : "0")
  }, [enabled, ready])

  const value = React.useMemo<FireflySettingsContextValue>(
    () => ({
      enabled,
      setEnabled,
      ready,
    }),
    [enabled, ready]
  )

  return <FireflySettingsContext.Provider value={value}>{children}</FireflySettingsContext.Provider>
}

export function useFireflySettings() {
  const context = React.useContext(FireflySettingsContext)
  if (!context) {
    throw new Error("useFireflySettings must be used inside FireflySettingsProvider")
  }
  return context
}

