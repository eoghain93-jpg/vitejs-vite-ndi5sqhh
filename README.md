# Nominations (Nommies)

A scoring companion for the trick-taking card game **Nominations** (contract whist). Built for a phone passed around the table: spin for the first dealer, record each round's trump suit and calls, mark hits and misses, and let the app handle scores, standings and the money.

## Features

- **Full game flow** — dealer spin wheel, trump picker, nomination order with the dealer's forbidden call enforced, hit/miss tracking with impossible-result validation
- **Round history with editing** — fix a mis-recorded past round from the History tab; all scores are recalculated from the corrected history
- **Money settlement** — winner-takes-all or pairwise ("all square up") at a configurable stake per point
- **Hall of Fame** — lifetime per-player records on the device: wins, call accuracy, average/best score, longest hit streak, money won or lost
- **Autosave & resume** — an interrupted game can be resumed after closing the tab
- **Works offline** — installable PWA with a precached app shell and self-hosted fonts
- **Table-friendly** — screen wake lock during play, haptic feedback on supported devices, light/dark themes

## Development

```bash
npm install
npm run dev       # local dev server
npm run build     # type-check + production build (includes service worker)
npm run preview   # serve the production build
npm run lint      # eslint
```

## Code layout

```
src/
  App.tsx              # game state machine and screens
  lib/                 # pure logic: scoring, validation, formatting, stats, haptics
  hooks/               # useWakeLock
  components/          # presentational components (wheel, cards, panels, history…)
  index.css            # theme tokens, global styles, self-hosted @font-face
public/fonts/          # Playfair Display + EB Garamond variable woff2
```

Scoring: a player who wins exactly the tricks they nominated scores **10 + nomination**; otherwise zero. Rounds count down in cards dealt (e.g. 10 → 1). The dealer calls last and may not make the calls sum to the tricks available.
