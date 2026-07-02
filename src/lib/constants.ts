// ─── TOKENS ───────────────────────────────────────────────────────────────────
// CSS-var refs so JSX inline styles auto-theme via [data-theme].
// Canvas sites (SpinWheel.draw) read resolved hex via getComputedStyle separately.
export const C = {
  gold:"var(--gold-2)", goldL:"var(--gold-1)", goldD:"var(--gold-3)", goldXD:"var(--gold-4)",
  felt:"var(--bg-table)", feltM:"var(--bg-table-mid)",
  bg:"var(--bg-base)", bgSurface:"var(--bg-surface)", bgRaised:"var(--bg-raised)",
  cream:"var(--text-1)", dark:"var(--on-gold)",
  red:"var(--red-neg)", redL:"var(--red-neg)",
  green:"var(--green-pos)", greenD:"var(--green-deep)",
  muted:"var(--text-2)", mutedD:"var(--text-3)",
};

export type Suit = "♠" | "♥" | "♦" | "♣";
export const SUITS: Suit[] = ["♠","♥","♦","♣"];
export const SUIT_NAME:  Record<Suit,string> = {"♠":"Spades","♥":"Hearts","♦":"Diamonds","♣":"Clubs"};
export const SUIT_COLOR: Record<Suit,string> = {"♠":"var(--suit-dark)","♥":"var(--suit-red)","♦":"var(--suit-red)","♣":"var(--suit-dark)"};
export const SUIT_BG:    Record<Suit,string> = {"♠":"#eaecf4","♥":"#fce8e8","♦":"#fce8e8","♣":"#eaecf4"};
export const WHEEL_HUE  = ["#1a6b3c","#b8943c","#2c5f8a","#7a3060","#4a7a30","#7a4a20","#325078","#5a3a10"];
export const PLAYER_COLORS = ["#c9a84c","#5ba3e8","#e85b8a","#5bca8a","#e87a4a","#9b6be8","#4bcece","#d4c04a"];

export const SAVE_KEY  = "nominations-game-v1";
export const THEME_KEY = "nominations-theme";

// SVG cross-hatch felt texture
export const feltTex = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Cpath d='M0 0L4 4M4 0L0 4' stroke='%23ffffff' stroke-width='0.3' opacity='0.04'/%3E%3C/svg%3E")`;
