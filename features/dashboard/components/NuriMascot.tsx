import { Sparkles } from "lucide-react"

export function NuriMascot() {
  return (
    <div aria-label="Светлячок Nuri" className="relative mx-auto aspect-square w-40 sm:w-48 lg:w-56" role="img">
      <div className="absolute inset-4 rounded-full bg-nuri-accent/20 blur-3xl" />
      <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-nuri-accent shadow-2xl shadow-nuri-accent/60 sm:h-28 sm:w-28">
        <div className="absolute left-5 top-8 h-3 w-3 rounded-full bg-brand-deep" />
        <div className="absolute right-5 top-8 h-3 w-3 rounded-full bg-brand-deep" />
        <div className="absolute left-1/2 top-14 h-2 w-8 -translate-x-1/2 rounded-full border-b-2 border-brand-deep/70" />
      </div>
      <div className="absolute left-7 top-10 h-16 w-24 -rotate-12 rounded-[55%] bg-white/60 blur-[1px] dark:bg-white/20" />
      <div className="absolute right-7 top-10 h-16 w-24 rotate-12 rounded-[55%] bg-white/60 blur-[1px] dark:bg-white/20" />
      <div className="absolute left-8 top-5 h-2 w-2 rounded-full bg-nuri-accent shadow-lg shadow-nuri-accent/70" />
      <div className="absolute right-10 top-8 h-1.5 w-1.5 rounded-full bg-nuri-accent shadow-lg shadow-nuri-accent/70" />
      <div className="absolute bottom-8 left-5 h-1.5 w-1.5 rounded-full bg-action shadow-lg shadow-action/60" />
      <div className="absolute bottom-7 right-8 inline-flex items-center gap-1 rounded-full border border-border/40 bg-card/85 px-3 py-1 text-xs font-medium text-brand-deep shadow-sm dark:bg-card/80 dark:text-foreground">
        <Sparkles className="h-3 w-3 text-nuri-accent" />
        Nuri
      </div>
    </div>
  )
}
