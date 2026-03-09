# Nominations — Premium Casino Redesign
**Date:** 2026-03-09
**Status:** Approved

## Overview

Full design system overhaul of the Nominations card game companion app. Goal: elevate from "nice pub app" to PokerStars/WSOP-tier premium casino aesthetic. Mobile-first (phones at the table), iPad-compatible. Keep all existing animations — polish timing and easing only.

## Approach

Option C — Full Design System Overhaul. Rebuild the CSS architecture using CSS custom properties for every token. Same visual direction as a PokerStars dark shift (near-black base, felt green as surface not background, sharp gold metallics) but the output is a maintainable token system rather than refined inline styles.

---

## Section 1: Design Tokens

### Colors

```css
--bg-base:       #070709;   /* App background */
--bg-surface:    #0f1012;   /* Cards, panels */
--bg-raised:     #161719;   /* Elevated elements, modals */
--bg-table:      #0b3d1e;   /* Felt surfaces only */
--bg-table-mid:  #0f4d26;   /* Felt highlights */

--gold-1:        #f0d080;   /* Brightest highlight */
--gold-2:        #c9a84c;   /* Primary gold */
--gold-3:        #8a6f2e;   /* Gold shadow */
--gold-4:        #3a2c0a;   /* Gold deepest */

--green-pos:     #22c55e;   /* Win / hit */
--red-neg:       #ef4444;   /* Loss / miss */

--text-1:        #f5f0e8;   /* Primary (cream) */
--text-2:        #a89f8c;   /* Secondary */
--text-3:        #5a5248;   /* Muted/disabled */

--border-subtle: rgba(255,255,255,.06);
--border-mid:    rgba(201,168,76,.18);
--border-strong: rgba(201,168,76,.45);
```

### Typography (5-level scale)

| Token | Size | Weight | Font | Usage |
|---|---|---|---|---|
| `--t-display` | `32px / 1.1` | 700 | Playfair Display | Round headers, podium |
| `--t-heading` | `20px / 1.2` | 600 | Playfair Display | Section titles |
| `--t-subhead` | `14px / 1.3` | 600 | System UI | Labels, badges, buttons |
| `--t-body` | `15px / 1.5` | 400 | System UI | Body text |
| `--t-caption` | `12px / 1.4` | 400 | System UI | Fine print, metadata |

Body and label text uses System UI for legibility on small screens. EB Garamond retained only for decorative display elements.

### Elevation / Shadow System

```css
--shadow-1:    0 1px 3px rgba(0,0,0,.4);     /* Chips, small elements */
--shadow-2:    0 4px 12px rgba(0,0,0,.5);    /* Cards, panels */
--shadow-3:    0 12px 32px rgba(0,0,0,.6);   /* Modals, drawers */
--shadow-gold: 0 0 20px rgba(201,168,76,.25); /* Active gold elements */
```

### Animation Tokens

```css
--ease-out:    cubic-bezier(0.22,1,0.36,1);    /* Reveals, entrances */
--ease-spring: cubic-bezier(0.34,1.56,0.64,1); /* Pops, selections, taps */
--ease-smooth: cubic-bezier(0.4,0,0.2,1);      /* State transitions */

--dur-fast:    150ms;  /* Micro-interactions */
--dur-mid:     280ms;  /* Panel transitions */
--dur-slow:    500ms;  /* Screen transitions, reveals */
```

### Spacing Scale

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 48 · 64px` — all elements snap to this grid.

---

## Section 2: Components

### Buttons

**Primary (Gold)**
- Background: `linear-gradient(180deg, --gold-4, --gold-3, --gold-2)`
- Text: `--gold-1`, `--t-subhead`, `letter-spacing: 0.08em`, uppercase
- Border: `1px --border-strong`
- Hover/active: `--shadow-gold`
- Press: `scale(0.97)`, `--dur-fast`, `--ease-spring`
- Min height: `48px`

**Ghost**
- Background: transparent
- Border: `1px --border-mid` → `--border-strong` on hover
- Text: `--text-2` → `--text-1` on hover

**Danger**
- Same structure as Gold using `--red-neg` tints
- Destructive actions only

### Panels

**Table Panel** — game-play surfaces (nominations, trump, play area)
- Background: `--bg-table` + felt texture overlay (existing cross-hatch SVG)
- Border: `1px --border-mid`
- Shadow: `--shadow-2`
- Radius: `16px`

**App Panel** — chrome, leaderboard, summaries
- Background: `--bg-surface`
- Border: `1px --border-subtle`
- Shadow: `--shadow-2`
- Radius: `16px`
- Gold accent border via `accent` prop: `--border-strong`

### Playing Cards (Suit Picker)

- Selected: `scale(1.06)` + `--shadow-gold`, `--ease-spring`
- Unselected siblings: `opacity: 0.45`, `scale(0.95)` — creates clear focus
- `lg` size: `96px × 128px` (iPad-optimised)

### Nomination Chips

- Fixed `60px × 60px`, `gap: 8px`
- Grid: `repeat(5, 60px)` centered — always 5 per row
- Selected: gold gradient + `--shadow-gold`
- Busted/disabled: `opacity: 0.2`, strikethrough on number
- Number font: `--t-heading`, bold

### Player Cards (Play Phase)

- Left border `4px` + background tint `rgba(playerColor, 0.08)` — color identity
- Hit/Miss buttons: bottom `40%` of card, `64px` min height
- Miss: `--red-neg` tint background
- Hit: `--green-pos` tint background
- Dealer badge: gold pill top-right, `DEALER` in `--t-subhead`, `--shadow-gold` glow
- Pending state: pulsing gold left border (full height)

### Bust Warning Banner

- Full-width bar
- Background: `--red-neg` at `15%` opacity
- Border: `1px solid --red-neg`
- Text: `--red-neg` colour directly (high contrast on dark)
- Entrance: slides down, `--ease-out`, `--dur-mid`

### Leaderboard Rows

- Rank number: `--t-display`, `--gold-2` for top 3, `--text-3` otherwise
- Player color bar: `6px` height, full width
- Score: right-aligned, `--t-heading`, `--text-1`
- Rank change badge: `--green-pos` / `--red-neg` pill, `--t-caption`

### Progress Bar

- Height: `8px`
- Filled: gold gradient
- Current: gold + pulse glow
- Empty: `--bg-raised`
- Label: `Round X of Y` above in `--t-caption`, `--text-2`

### Podium

- Platforms: `--bg-table` felt texture
- Rank numbers: `--t-display`
- Name + score: floating `App Panel` above each platform
- Confetti: burst at `--dur-slow`, particles use `--ease-out`

---

## Section 3: Screen Layouts

### Setup
- `--bg-base`, centered column, max-width `480px`
- Title: `--t-display`, gold gradient text
- Inputs: `--bg-raised`, `--border-subtle`, `48px` height
- Round/stake: horizontal pill selectors, not dropdowns
- Add player: ghost button, full-width, dashed `--border-mid`
- Start: gold primary, full-width, bottom

### Spin Wheel
- Canvas: max `320px` mobile, `480px` iPad
- Background: radial gradient `--bg-table` → `--bg-base` (table spotlight)
- Spin button: gold primary, centered below
- Result: `--t-display`, `--ease-spring`, gold glow

### Trump Suit Picker
- Mobile: `2×2` grid
- iPad: `1×4` row
- Confirm button: `fadeUp` after selection, `--ease-out`
- Surface: Table Panel

### Nominate
- Order strip: horizontal scroll, gold border pill on current, green check on completed
- Active caller: Table Panel, name `--t-heading`, label `--t-caption --text-2`
- Chips: centered `repeat(5, 60px)`, `32px` padding
- Dealer constraint: `--t-caption`, `--text-3`, inline below grid

### Play
- Header: round info left, trump right, `--bg-surface`, `48px`
- Tabs: pill tab bar, gold underline on active
- Player cards: 2-column grid mobile, single column on very small
- Undo: ghost button, top-left, `48px` tap target

### Round Summary
- Full-screen `--bg-base` overlay, slides up
- Player rows: App Panel, name left, `+N pts` right
- Rank change: pill badge right of name
- Continue: gold primary, full-width bottom

### End Screen
- Confetti on enter
- Podium: felt platforms, floating App Panel name cards
- Leaderboard: App Panel, scrollable
- Money settlement: separate App Panel, clear owes layout
- CTAs: "Play Again" gold primary + "New Game" ghost, stacked full-width

### iPad Adaptations
- Max-width `600px` (from `480px`)
- Trump picker: `1×4` row
- Spin wheel: `480px`
- Playing cards lg: `96×128px`
- All font sizes: `+2px` via single `@media (min-width: 768px)` on `:root`
