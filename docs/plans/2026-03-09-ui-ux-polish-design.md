# UI/UX Polish — Design Document

> Driven by ui-ux-pro-max skill recommendations for the Nominations app.

**Date:** 2026-03-09
**Scope:** `src/App.tsx` only — no new files

---

## Context

The ui-ux-pro-max design system audit identified three issues against the Nominations card game app (premium dark casino aesthetic, React/TypeScript/Vite, inline styles):

| Issue | Skill Rule | Severity |
|---|---|---|
| Emoji used as UI icons | `no-emoji-icons` — use SVG (Heroicons/Lucide) | Medium |
| Sub-44px touch targets on 5 elements | `touch-target-size` — min 44×44px | High (CRITICAL) |
| Inline style objects created in JSX render | React stack: define objects outside component | Medium |

---

## A — SVG Icons

Replace all emoji UI icons with inline SVG functional components defined at the top of `App.tsx`.

### Icon Map

| Emoji | SVG Component | Locations |
|---|---|---|
| 🏆 | `<TrophyIcon>` | Leaderboard label, game tab pill |
| 🃏 | `<CardIcon>` | RoundHistory empty state, game tab pill |
| 📋 | `<ClipboardIcon>` | RoundHistory label, history tab pill |
| 💰 | `<CoinsIcon>` | Money component avatar |
| ✅ | `<CheckIcon>` | Hit indicator — play screen + round summary |
| ❌ | `<XIcon>` | Miss indicator — play screen + round summary |
| 🎰 | `<SpinIcon>` | Spin for Dealer button label |
| 🥇🥈🥉 | `<MedalIcon rank={n}>` | Podium + end screen full list (rank 1/2/3) |

### Icons That Stay

- `✦` in Divider — typographic ornament, not a UI icon
- `🂡` dealer indicator — playing card character, acceptable in context
- `← → › ↑ ↓` — text arrows/separators, not icons
- `＋` add player — fullwidth plus, acceptable

### Implementation

Each SVG icon is a zero-dependency functional component returning a raw `<svg>` element with:
- `width` / `height` props (default 20)
- `color` prop defaulting to `"currentColor"`
- `strokeWidth={1.8}` for consistency with Lucide style
- Sourced from Lucide icon paths (MIT licensed, no import needed when inlined)

---

## B — Touch Targets

Fix five elements that fall below the 44×44px minimum.

| Element | Location | Fix |
|---|---|---|
| Tab pills (game/table/history) | Shared header | `minHeight:44`, `padding:"10px 14px"` |
| Nomination order strip pills | Nominate screen | `minHeight:44`, `padding:"10px 13px"` |
| Remove player `×` button | Setup screen | `44×44px` (up from 34×34) |
| Edit nomination button | Nominate done-list | `minHeight:44`, `padding:"10px 14px"` |
| "← Re-spin for dealer" text link | Trump picker | Wrap in `<button>` with `padding:"12px 16px"`, `minHeight:44` |

Dealer rotation pills (trump screen) are display-only — no touch target change needed.

---

## C — STYLES Namespace

Move all static style objects out of JSX render into a single `const STYLES` object, placed between the `C` colour constant and the `CSS` template literal.

### Structure

```ts
const STYLES = {
  // Layout
  felt:        { base: CSSProperties },
  divider:     { wrap, line, dot },

  // Core components
  card:        { wrap, grain, pip, pipBottom, center },
  panel:       { base },
  lbl:         { base },
  progress:    { wrap, header, label, roundNum, track, segment },

  // Buttons
  btn:         { base },
  tabPill:     { base },
  nomChip:     { base },

  // Screens
  setup:       { wrap, heading, sub, playerNum, removeBtn, addBtn,
                 roundBtn, stakeWrap, stakeBtn, stakeVal, stakeHint, startBtn },
  spin:        { wrap, heading, sub, spotlight },
  trump:       { wrap, heading, sub, dealerPanel, dealerPillBase, backBtn },
  nominate:    { wrap, orderWrap, ordinal, pillBase,
                 callerPanel, callerTop, callerName, callerRight,
                 callerCount, callerTricks, doneRow, donePlayerName,
                 doneCalledLabel, editBtn, bustWarning },
  play:        { bustBanner, bustLeft, bustRight,
                 cardWrap, cardTop, cardName, cardScore, cardRight,
                 cardCalledLabel, cardCalledNum, hitBtnBase,
                 endRoundBtn, confirmPanel, confirmTitle, confirmSub },
  summary:     { wrap, heading, sub, row, icon, name, sub2,
                 pts, prevScore, rankBadge },
  end:         { wrap, heading, sub, listRow, listRank, listBar,
                 listName, listScore, confirmPanel, confirmTitle, confirmSub },

  // Sub-components
  leaderboard: { row, rankNum, colorBar, nameWrap, name, scoreBar,
                 scoreBarFill, score },
  history:     { emptyIcon, emptyText, roundWrap, roundMeta, roundLabel,
                 roundSub, hitRowBase, missRowBase, pName, pCalled, pPts },
  money:       { avatar, nameWrap, sub, debtRow, debtName, debtAmount, ptsBehind },
  podium:      { wrap, colWrap, medal, name, score, platformBase },
  cardFan:     { wrap },
  spinWheel:   { wrap, canvasWrap, resultWrap },
  confetti:    { wrap },
}
```

### Dynamic Values That Stay Inline

These **cannot** be hoisted because they depend on runtime values:

- Player card `background` (colour tint from `pc`)
- Player card `border` / `borderLeft` (accent colour from hit state)
- Player card `boxShadow` (dealer vs non-dealer)
- Hit/Miss button `border`, `background`, `color` (active state)
- Nomination chip `border`, `background`, `color` (busted state)
- Leaderboard score bar `width` (% of max score)
- Nomination order pill `background`, `border`, `color` (active/done state)
- Dealer rotation pill `background`, `border`, `color` (current dealer)
- Progress bar segment `background`, `boxShadow` (round position)
- Podium platform `height`, `boxShadow`, `animation` (rank order)

---

## ui-ux-pro-max Pre-Delivery Checklist

After implementation, verify against the skill's checklist:

- [ ] No emojis used as icons
- [ ] All SVG icons consistent stroke width (1.8) and viewBox (0 0 24 24)
- [ ] All clickable elements have `cursor:"pointer"`
- [ ] Touch targets ≥ 44×44px on all interactive elements
- [ ] Hover states smooth (150–300ms transitions)
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected (already in CSS via `--dur-*` tokens)
- [ ] Style objects defined outside JSX render (no `style={{...}}` with static objects)

---

## Architecture Decision

All changes remain in `src/App.tsx`. No new files. The `STYLES` object, SVG icon components, and touch target fixes are all self-contained within the existing single-file architecture.
