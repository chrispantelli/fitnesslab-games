import type { Metadata } from "next"
import Link from "next/link"
import { CountdownTimers } from "./countdown-timers"

export const metadata: Metadata = {
  title: "FitnessLab Games | Timer",
  description: "Run independent countdown timers for the FitnessLab Games.",
}

export default function TimerPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
      <nav aria-label="Event pages" className="mb-4">
        <Link href="/" className="inline-flex min-h-10 items-center border border-border px-3 text-sm font-bold text-accent hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">
          Leaderboard
        </Link>
      </nav>
      <header className="event-banner relative isolate overflow-hidden border border-accent/45 px-5 py-7 sm:px-10 sm:py-10">
        <p className="mb-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-white">
          <span>FitnessLab</span><span className="bg-accent px-2 py-0.5 text-ink">Games</span>
        </p>
        <h1 className="sport-heading text-[clamp(2.4rem,7.5vw,5rem)] leading-[0.94] text-accent">Countdown timers</h1>
      </header>
      <CountdownTimers />
    </main>
  )
}
