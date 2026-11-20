"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ClipboardList, Medal, Pencil } from "lucide-react"
import { Button } from "../components/ui/button"
import { LeaderboardCard } from "../components/ui/leaderboard-card"
import { Input } from "../components/ui/input"
import { Table } from "../components/ui/table"

const categories = [
  ["lift", "Lift Rank Pts"],
  ["engine", "Engine Rank Pts"],
  ["capacity", "Capacity Rank Pts"],
] as const

type Category = typeof categories[number][0]
type Pair = { id: number; name: string } & Record<Category, string>

const storageKey = "pairs-leaderboard:v1"
const blankRows: Pair[] = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1, name: "", lift: "", engine: "", capacity: "",
}))

function getTotal(row: Pair) {
  const values = categories.map(([field]) => row[field])
  if (values.some(value => !/^\d{1,9}$/.test(value))) return null
  return values.reduce((total, value) => total + Number(value), 0)
}

export default function Leaderboard() {
  const [rows, setRows] = useState(blankRows)
  const [editing, setEditing] = useState(true)
  const [ready, setReady] = useState(false)
  const [storageAvailable, setStorageAvailable] = useState(true)
  const [higherWins, setHigherWins] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const saved = JSON.parse(raw)
        if (Array.isArray(saved.rows)) {
          setRows(blankRows.map((blank, index) => {
            const row = saved.rows[index]
            return {
              ...blank,
              name: typeof row?.name === "string" ? row.name : "",
              lift: typeof row?.lift === "string" ? row.lift : "",
              engine: typeof row?.engine === "string" ? row.engine : "",
              capacity: typeof row?.capacity === "string" ? row.capacity : "",
            }
          }))
          setHigherWins(saved.higherWins === true)
          setEditing(saved.editing !== false)
        }
      }
    } catch {
      setStorageAvailable(false)
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(storageKey, JSON.stringify({ rows, editing, higherWins }))
      setStorageAvailable(true)
    } catch {
      setStorageAvailable(false)
    }
  }, [ready, rows, editing, higherWins])

  const scored = rows.map(row => ({ ...row, total: getTotal(row) }))
  const ranked = scored.filter(row => row.total !== null).sort((a, b) =>
    (higherWins ? b.total! - a.total! : a.total! - b.total!) || a.id - b.id
  )
  const places = new Map<number, number>()
  ranked.forEach((row, index) => {
    places.set(row.id, index > 0 && row.total === ranked[index - 1].total
      ? places.get(ranked[index - 1].id)! : index + 1)
  })
  const rankings = ranked.map(row => ({
    userId: String(row.id),
    userName: row.name.trim() || `Pair ${row.id}`,
    rank: places.get(row.id)!,
    value: row.total!,
    byline: `#${row.id} · Lift ${row.lift} · Engine ${row.engine} · Capacity ${row.capacity}`,
  }))

  const podiumRankings = [1, 2, 3].flatMap(rank => {
    const tied = rankings.filter(row => row.rank === rank)
    if (!tied.length) return []
    return [{ ...tied[0], userName: tied.map(row => row.userName).join(" / ") }]
  })

  function update(id: number, field: Category | "name", value: string) {
    if (field !== "name" && !/^\d{0,9}$/.test(value)) return
    setRows(previous => previous.map(row => row.id === id ? { ...row, [field]: value } : row))
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12">
      <nav aria-label="Event pages" className="mb-4">
        <Link href="/timer" className="inline-flex min-h-10 items-center border border-border px-3 text-sm font-bold text-accent hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring">
          Timers
        </Link>
      </nav>
      <header className="event-banner relative isolate overflow-hidden border border-accent/45 px-5 py-7 sm:px-10 sm:py-10">
        <div className="relative max-w-2xl">
          <p className="mb-4 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-white">
            <span>FitnessLab</span><span className="bg-accent px-2 py-0.5 text-ink">Games</span>
          </p>
          <h1 className="sport-heading text-[clamp(2.4rem,7.5vw,5rem)] leading-[0.94] text-white">
            Pairs <span className="text-accent">Leaderboard</span>
          </h1>
          <ul aria-label="Scoring categories" className="mt-6 inline-flex flex-wrap gap-x-4 gap-y-1 bg-accent px-3 py-1 text-ink sm:gap-x-7">
            {categories.map(([event]) => <li key={event} className="sport-heading text-xl">{event}</li>)}
          </ul>
        </div>
      </header>

      <section aria-labelledby="standings" className="mt-5 overflow-hidden border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <h2 id="standings" className="sport-heading text-2xl leading-none">{editing ? "Enter scores" : "Standings"}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground" aria-live="polite">{ranked.length} of 12 pairs scored</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select aria-label="Scoring order" value={higherWins ? "higher" : "lower"} disabled={!ready}
              onChange={event => setHigherWins(event.target.value === "higher")}
              className="h-10 border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="lower">Lowest total wins</option>
              <option value="higher">Highest total wins</option>
            </select>
            <Button disabled={!ready} onClick={() => setEditing(!editing)}
              className={"h-10 border-accent bg-accent font-bold text-ink hover:bg-[#ffe681]"}>
              {editing ? <ClipboardList aria-hidden="true" className="size-4" /> : <Pencil aria-hidden="true" className="size-4" />}
              {editing ? "View leaderboard" : "Edit scores"}
            </Button>
          </div>
        </div>

        {editing ? <Table aria-labelledby="standings" className="w-full min-w-[780px] border-separate border-spacing-0 text-sm">
          <thead className="border-y border-accent bg-accent text-ink uppercase">
            <tr>
              <th scope="col" className="sticky left-0 z-10 w-12 bg-accent px-3 py-3 text-left">#</th>
              <th scope="col" className="sticky left-12 z-10 min-w-36 bg-accent px-3 py-3 text-left sm:min-w-44">Pair</th>
              {categories.map(([field, label]) => <th key={field} scope="col" className="w-32 px-2 py-3 text-center">{label}</th>)}
              <th scope="col" className="w-40 px-2 py-3 text-center">Overall Ranking Pts</th>
              <th scope="col" className="w-28 px-2 py-3 text-center">Final Place</th>
            </tr>
          </thead>
          <tbody>
            {scored.map(row => {
              const place = places.get(row.id)
              return <tr key={row.id} className="even:bg-background/35 hover:bg-muted">
                <td className="sticky left-0 z-10 w-12 min-w-12 border-b border-border/70 bg-card px-3 py-2 text-muted-foreground tabular-nums">{row.id}</td>
                <th scope="row" className="sticky left-12 z-10 border-b border-r border-border/70 bg-card px-3 py-2 text-left font-medium">
                  <Input aria-label={`Pair ${row.id} name`} value={row.name} maxLength={100}
                    placeholder={`Pair ${row.id}`} disabled={!ready}
                    onChange={event => update(row.id, "name", event.target.value)} />
                </th>
                {categories.map(([field, label]) => <td key={field} className="border-b border-border/70 px-2 py-2 text-center tabular-nums">
                  <Input type="text" inputMode="numeric" aria-label={`Pair ${row.id} ${label}`}
                    placeholder="—" value={row[field]} disabled={!ready} className="mx-auto max-w-20 text-center"
                    onChange={event => update(row.id, field, event.target.value)} />
                </td>)}
                <td className="border-b border-border/70 px-2 py-2 text-center font-semibold tabular-nums">{row.total ?? "—"}</td>
                <td className="border-b border-border/70 px-2 py-2 text-center">
                  {place ? <span className={`inline-flex min-w-8 items-center justify-center gap-1 px-2 py-1 font-semibold tabular-nums ${place === 1 ? "bg-accent text-ink" : "bg-muted text-foreground"}`}>
                    {place === 1 && <Medal aria-hidden="true" className="size-3.5" />}{place}
                  </span> : "—"}
                </td>
              </tr>
            })}
          </tbody>
        </Table> : <div className="border-t border-border bg-background p-3 sm:p-5">
          <LeaderboardCard
            title="Final places"
            podiumRankings={podiumRankings}
            rankings={rankings}
            className="rounded-none border-border p-3 sm:p-6"
          />
        </div>}
      </section>
      <p className="mt-4 text-sm text-muted-foreground">
        {storageAvailable ? "Scores save automatically in this browser." : "Browser storage is unavailable. Keep this page open to retain your scores."}
        {" "}Pairs are ranked once all three scores are entered. Equal totals share a place.
      </p>
    </main>
  )
}
