# Pairs Leaderboard

A Next.js app with shadcn-style Input, Button and Table components built with Tailwind CSS.

Run `npm ci` and `npm run dev`, then open http://localhost:3000.
Run `npm run build` to export the static site to `out/`.

Enter the names and three whole-number scores for each of the 12 pairs. Choose whether the lowest or highest total wins. Equal totals share a place and the next place skips accordingly. Select **View leaderboard** to sort by final place. Scores and preferences persist in the current browser using localStorage.

The standings use the Trophy UI Leaderboard Card, Podium and Rankings from https://github.com/trophyso/ui.

Open `/timer` to create and run independent countdowns. Each timer can be paused, reset or removed. The browser stores timer state and keeps running countdowns on schedule across refreshes.

Select **Big screen** on the timer page to enlarge the countdowns and hide editing controls. Select **Exit big screen** or press Escape to return to the controls.
