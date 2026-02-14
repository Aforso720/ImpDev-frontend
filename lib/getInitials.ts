export function getInitials(nameOrEmail: string) {
  const s = (nameOrEmail ?? "").trim()
  if (!s) return "??"
  const base = s.includes("@") ? s.split("@")[0] : s
  const parts = base.split(/[.\s_-]+/)
  const a = parts[0]?.[0] ?? ""
  const b = parts[1]?.[0] ?? ""
  return (a + b).toUpperCase() || s.slice(0, 2).toUpperCase()
}