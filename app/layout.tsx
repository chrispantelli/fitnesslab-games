import type { Metadata } from "next"
import "@fontsource/barlow-condensed/latin-700-italic.css"
import "@fontsource/barlow-condensed/latin-800-italic.css"
import "./globals.css"

export const metadata: Metadata = {
  title: "FitnessLab Games | Pairs Leaderboard",
  description: "Score and rank 12 pairs across Lift, Engine and Capacity.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
