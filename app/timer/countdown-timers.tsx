"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { Maximize, Minimize, Pause, Play, Plus, RotateCcw, Trash2 } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"

type Timer = {
  id: string
  name: string
  duration: number
  remaining: number
  endsAt: number | null
}

const storageKey = "fitnesslab-countdown-timers:v1"
const primaryButton = "border-accent bg-accent font-bold text-ink hover:bg-[#ffe681]"

function remainingAt(timer: Timer, now: number) {
  return timer.endsAt === null ? timer.remaining : Math.max(0, timer.endsAt - now)
}

function displayTime(milliseconds: number) {
  const seconds = Math.ceil(milliseconds / 1000)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor(seconds / 60) % 60
  const parts = hours ? [hours, minutes, seconds % 60] : [minutes, seconds % 60]
  return parts.map(part => String(part).padStart(2, "0")).join(":")
}

export function CountdownTimers() {
  const [timers, setTimers] = useState<Timer[]>([])
  const [ready, setReady] = useState(false)
  const [now, setNow] = useState(0)
  const [name, setName] = useState("")
  const [minutes, setMinutes] = useState("")
  const [seconds, setSeconds] = useState("")
  const [error, setError] = useState("")
  const [displayMode, setDisplayMode] = useState(false)
  const displayRef = useRef<HTMLElement>(null)
  const openDisplayRef = useRef<HTMLButtonElement>(null)
  const closeDisplayRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!displayMode) return

    function leaveOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") closeDisplay()
    }

    function leaveOnFullscreenExit() {
      if (!document.fullscreenElement) {
        setDisplayMode(false)
        requestAnimationFrame(() => openDisplayRef.current?.focus())
      }
    }

    closeDisplayRef.current?.focus()
    document.addEventListener("keydown", leaveOnEscape)
    document.addEventListener("fullscreenchange", leaveOnFullscreenExit)
    return () => {
      document.removeEventListener("keydown", leaveOnEscape)
      document.removeEventListener("fullscreenchange", leaveOnFullscreenExit)
    }
  }, [displayMode])

  function openDisplay() {
    setDisplayMode(true)
    void displayRef.current?.requestFullscreen?.().catch(() => {})
  }

  function closeDisplay() {
    setDisplayMode(false)
    if (document.fullscreenElement === displayRef.current) {
      void document.exitFullscreen().catch(() => {})
    }
    requestAnimationFrame(() => openDisplayRef.current?.focus())
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      const saved = raw ? JSON.parse(raw) : []
      if (Array.isArray(saved)) {
        setTimers(saved.filter((timer): timer is Timer =>
          typeof timer?.id === "string" && typeof timer.name === "string" &&
          Number.isSafeInteger(timer.duration) && timer.duration > 0 && timer.duration <= 359999000 &&
          Number.isFinite(timer.remaining) && timer.remaining >= 0 && timer.remaining <= timer.duration &&
          (timer.endsAt === null || Number.isFinite(timer.endsAt))
        ))
      }
    } catch {
      // Timers can still run when browser storage is unavailable.
    }
    setNow(Date.now())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(storageKey, JSON.stringify(timers))
    } catch {
      // Timers remain available for this page session.
    }
  }, [ready, timers])

  const isRunning = timers.some(timer => timer.endsAt !== null && timer.endsAt > now)

  useEffect(() => {
    if (!isRunning) return
    const tick = () => setNow(Date.now())
    const interval = window.setInterval(tick, 150)
    document.addEventListener("visibilitychange", tick)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener("visibilitychange", tick)
    }
  }, [isRunning])

  function addTimer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const duration = (Number(minutes) * 60 + Number(seconds)) * 1000
    if (!Number.isSafeInteger(duration) || duration <= 0 || duration > 359999000) {
      setError("Enter a duration between 1 second and 99 hours, 59 minutes, 59 seconds.")
      return
    }

    const id = crypto.randomUUID()
    setTimers(previous => {
      let number = 1
      while (previous.some(timer => timer.name === `Timer ${number}`)) number++
      return [...previous, {
        id, name: name.trim() || `Timer ${number}`, duration, remaining: duration, endsAt: null,
      }]
    })
    setName("")
    setMinutes("")
    setSeconds("")
    setError("")
  }

  function toggleTimer(id: string) {
    const time = Date.now()
    setNow(time)
    setTimers(previous => previous.map(timer => {
      if (timer.id !== id) return timer
      const remaining = remainingAt(timer, time)
      if (timer.endsAt !== null && remaining > 0) {
        return { ...timer, remaining, endsAt: null }
      }
      return { ...timer, endsAt: time + (remaining || timer.duration) }
    }))
  }

  function resetTimer(id: string) {
    setTimers(previous => previous.map(timer =>
      timer.id === id ? { ...timer, remaining: timer.duration, endsAt: null } : timer
    ))
  }

  return (
    <>
      <section hidden={displayMode} aria-labelledby="add-timer" className="mt-5 border border-border bg-card p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="add-timer" className="sport-heading text-2xl">Add a timer</h2>
          <Button ref={openDisplayRef} type="button" disabled={!timers.length} onClick={openDisplay}>
            <Maximize aria-hidden="true" className="size-4" /> Big screen
          </Button>
        </div>
        <form onSubmit={addTimer} className="grid grid-cols-2 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_7rem_7rem_auto]">
          <label className="col-span-2 grid gap-1.5 text-sm font-medium sm:col-span-1">
            Name <Input value={name} maxLength={80} placeholder="Optional" onChange={event => setName(event.target.value)} />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Minutes <Input type="number" min={0} max={5999} step={1} inputMode="numeric" placeholder="0" value={minutes} onChange={event => setMinutes(event.target.value)} />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Seconds <Input type="number" min={0} max={59} step={1} inputMode="numeric" placeholder="00" value={seconds} onChange={event => setSeconds(event.target.value)} />
          </label>
          <Button type="submit" disabled={!ready} className={`col-span-2 sm:col-span-1 ${primaryButton}`}>
            <Plus aria-hidden="true" className="size-4" /> Add timer
          </Button>
        </form>
        {error && <p role="alert" className="mt-3 text-sm text-accent">{error}</p>}
      </section>

      {timers.length > 0 && (
        <section ref={displayRef} data-multiple-rows={timers.length > 2 || undefined} aria-label="Countdowns" className={displayMode ? "timer-display fixed inset-0 z-50 flex flex-col overflow-auto bg-background p-3 sm:p-5" : "mt-5"}>
          {displayMode && (
            <div className="mb-3 flex shrink-0 justify-end">
              <Button ref={closeDisplayRef} type="button" onClick={closeDisplay}>
                <Minimize aria-hidden="true" className="size-4" /> Exit big screen
              </Button>
            </div>
          )}
          <div className={`grid flex-1 gap-4 ${timers.length > 1 ? "md:grid-cols-2" : ""} ${displayMode && timers.length > 4 ? "xl:grid-cols-3" : ""}`}>
            {timers.map(timer => {
              const remaining = remainingAt(timer, now)
              const timeLabel = displayTime(remaining)
              const finished = remaining === 0
              const running = timer.endsAt !== null && !finished
              const status = finished ? "Time’s up" : running ? "Running" : remaining === timer.duration ? "Ready" : "Paused"

              return (
                <article key={timer.id} aria-labelledby={`title-${timer.id}`} className={`timer-card min-w-0 border bg-card p-4 sm:p-6 ${displayMode ? "flex flex-col justify-center text-center" : ""} ${finished ? "border-accent" : "border-border"}`}>
                  <div className={displayMode ? "flex justify-center" : "flex items-start justify-between gap-3"}>
                    <h2 id={`title-${timer.id}`} className="timer-title sport-heading min-w-0 break-words text-2xl">{timer.name}</h2>
                    {!displayMode && <Button type="button" aria-label={`Remove ${timer.name}`} className="size-9 shrink-0 px-0" onClick={() => setTimers(previous => previous.filter(item => item.id !== timer.id))}>
                      <Trash2 aria-hidden="true" className="size-4" />
                    </Button>}
                  </div>
                  <p role="timer" aria-label={`${timer.name} time remaining`} className={`timer-digits sport-heading my-3 leading-none tabular-nums text-accent ${timeLabel.length > 5 ? "timer-digits-long" : ""}`}>
                    {timeLabel}
                  </p>
                  <p role="status" className={`mb-4 text-sm font-medium ${finished ? "text-accent" : "text-muted-foreground"}`}>{status}</p>
                  {!displayMode && <div className="flex flex-wrap gap-2">
                    <Button type="button" className={primaryButton} aria-label={`${running ? "Pause" : finished ? "Restart" : remaining === timer.duration ? "Start" : "Resume"} ${timer.name}`} onClick={() => toggleTimer(timer.id)}>
                      {running ? <Pause aria-hidden="true" className="size-4" /> : <Play aria-hidden="true" className="size-4" />}
                      {running ? "Pause" : finished ? "Restart" : remaining === timer.duration ? "Start" : "Resume"}
                    </Button>
                    <Button type="button" aria-label={`Reset ${timer.name}`} onClick={() => resetTimer(timer.id)}>
                      <RotateCcw aria-hidden="true" className="size-4" /> Reset
                    </Button>
                  </div>}
                </article>
              )
            })}
          </div>
        </section>
      )}
    </>
  )
}
