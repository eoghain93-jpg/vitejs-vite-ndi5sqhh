# UI/UX Polish — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix three ui-ux-pro-max audit findings: replace emoji UI icons with inline SVGs, raise all touch targets to ≥44px, and hoist every static inline style object out of JSX render into a single `STYLES` namespace constant.

**Architecture:** All changes are confined to `src/App.tsx` (1223 lines). The `STYLES` object is inserted between the `C` constant (line 4) and the `CSS` template literal (line 30). SVG icon components are inserted between `STYLES` and `CSS`. No new files are created.

**Tech Stack:** React, TypeScript, inline styles, Vite. No test suite — verification is visual via `npm run dev`.

**Design doc:** `docs/plans/2026-03-09-ui-ux-polish-design.md`

---

## ui-ux-pro-max Integration

Before starting each task, consult the relevant ui-ux-pro-max rule:
- Tasks 1–2: `no-emoji-icons` rule — use SVG icons, not emojis
- Task 3: `touch-target-size` rule — minimum 44×44px
- Tasks 4–7: React stack `avoid-inline-object-creation` rule
- Task 8: Full pre-delivery checklist from the skill

---

## Task 1: SVG Icon Components

**Files:**
- Modify: `src/App.tsx` — insert after line 27 (after `getRoundCards`)

**Step 1: Insert SVG icon components**

Add the following block directly after the `getRoundCards` line and before `// ─── GLOBAL CSS ───`:

```tsx
// ─── SVG ICONS ────────────────────────────────────────────────────────────────
// Lucide-style inline SVGs — no emoji, no external dependency
type IconProps = { size?: number; color?: string; style?: React.CSSProperties };

function TrophyIcon({ size=18, color="currentColor", style={} }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
      <path d="M4 22h16"/>
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
    </svg>
  );
}

function CardIcon({ size=18, color="currentColor", style={} }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <rect x="2" y="3" width="20" height="18" rx="2"/>
      <path d="M16 8h.01"/>
      <path d="M8 16h.01"/>
      <path d="m8 8 8 8"/>
    </svg>
  );
}

function ClipboardIcon({ size=18, color="currentColor", style={} }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <rect x="8" y="2" width="8" height="4" rx="1"/>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <path d="M12 11h4"/><path d="M12 16h4"/>
      <path d="M8 11h.01"/><path d="M8 16h.01"/>
    </svg>
  );
}

function CoinsIcon({ size=18, color="currentColor", style={} }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <circle cx="8" cy="8" r="6"/>
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18"/>
      <path d="M7 6h1v4"/>
    </svg>
  );
}

function CheckCircleIcon({ size=22, color="currentColor", style={} }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <circle cx="12" cy="12" r="10"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}

function XCircleIcon({ size=22, color="currentColor", style={} }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <circle cx="12" cy="12" r="10"/>
      <path d="m15 9-6 6"/><path d="m9 9 6 6"/>
    </svg>
  );
}

function SpinIcon({ size=18, color="currentColor", style={} }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/>
      <path d="M21 3v5h-5"/>
    </svg>
  );
}

function MedalIcon({ rank, size=22, style={} }: { rank: number; size?: number; style?: React.CSSProperties }) {
  const colors = ["#f0d080","#c0c8d0","#c8966a"];
  const c = colors[rank - 1] ?? "var(--text-3)";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <circle cx="12" cy="14" r="6"/>
      <path d="m8 2 1.88 5.65"/>
      <path d="m16 2-1.88 5.65"/>
      <path d="M6 2h12"/>
      <text x="12" y="18" textAnchor="middle" fontSize="7" fontWeight="700" stroke="none" fill={c}>{rank}</text>
    </svg>
  );
}
```

**Step 2: Verify file compiles**

Open `src/App.tsx` in the editor and confirm no TypeScript errors appear in the SVG block.

**Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add inline SVG icon components (TrophyIcon, CardIcon, etc.)"
```

---

## Task 2: Replace Emoji Usage With SVG Icons

**Files:**
- Modify: `src/App.tsx` — 8 locations

**Step 1: Leaderboard label — replace 🏆**

Find:
```tsx
<Lbl style={{marginBottom:16}}>🏆 Standings</Lbl>
```
Replace with:
```tsx
<Lbl style={{marginBottom:16,display:"flex",alignItems:"center",gap:6}}><TrophyIcon color="var(--gold-2)"/> Standings</Lbl>
```

**Step 2: RoundHistory empty state — replace 🃏**

Find:
```tsx
<div style={{fontSize:36,marginBottom:10,opacity:.5}}>🃏</div>
```
Replace with:
```tsx
<div style={{marginBottom:10,opacity:.5,display:"flex",justifyContent:"center"}}><CardIcon size={36} color="var(--text-2)"/></div>
```

**Step 3: RoundHistory label — replace 📋**

Find:
```tsx
<Lbl style={{marginBottom:16}}>📋 Round History</Lbl>
```
Replace with:
```tsx
<Lbl style={{marginBottom:16,display:"flex",alignItems:"center",gap:6}}><ClipboardIcon color="var(--gold-2)"/> Round History</Lbl>
```

**Step 4: Money component avatar — replace 💰**

Find:
```tsx
<div style={{width:44,height:44,borderRadius:"50%",background:`linear-gradient(135deg,${C.gold},${C.goldD})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,boxShadow:`0 4px 16px ${C.gold}44`}}>💰</div>
```
Replace with:
```tsx
<div style={{width:44,height:44,borderRadius:"50%",background:`linear-gradient(135deg,${C.gold},${C.goldD})`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 4px 16px ${C.gold}44`}}><CoinsIcon size={22} color={C.dark}/></div>
```

**Step 5: Hit/Miss indicators — replace ✅ ❌ (play screen + round summary)**

There are two locations. Both use the same pattern:

Find (play screen, round summary):
```tsx
<div style={{fontSize:22,width:28,textAlign:"center",flexShrink:0}}>{hit?"✅":"❌"}</div>
```
Replace with:
```tsx
<div style={{width:28,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
  {hit
    ? <CheckCircleIcon size={22} color="var(--green-pos)"/>
    : <XCircleIcon size={22} color="var(--red-neg)"/>}
</div>
```

Also find (RoundHistory rows):
```tsx
<span style={{fontSize:14}}>{hit?"✅":"❌"}</span>
```
Replace with:
```tsx
{hit ? <CheckCircleIcon size={16} color="var(--green-pos)"/> : <XCircleIcon size={16} color="var(--red-neg)"/>}
```

**Step 6: Spin button — replace 🎰**

Find:
```tsx
{spinning?"Spinning…":"🎰  Spin for Dealer"}
```
Replace with:
```tsx
{spinning ? "Spinning…" : <span style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center"}}><SpinIcon size={16}/>Spin for Dealer</span>}
```

**Step 7: Tab pills — replace 🃏 🏆 📋**

Find:
```tsx
{[["game","🃏"],["table","🏆"],["history","📋"]].map(([t,ic])=>(
```
Replace with:
```tsx
{([
  ["game",    <CardIcon size={14}/>],
  ["table",   <TrophyIcon size={14}/>],
  ["history", <ClipboardIcon size={14}/>],
] as [string, React.ReactNode][]).map(([t,ic])=>(
```

**Step 8: Podium + end screen — replace 🥇🥈🥉**

Find (Podium component):
```tsx
}}>{["🥇","🥈","🥉"][rank]}</div>
```
Replace with:
```tsx
}}><MedalIcon rank={rank+1} size={rank===0?26:20}/></div>
```

Find (end screen full list):
```tsx
<div style={{fontSize:i<3?22:14,width:30,textAlign:"center",color:i<3?"inherit":"var(--text-3)",flexShrink:0}}>
  {i<3?["🥇","🥈","🥉"][i]:i+1}
</div>
```
Replace with:
```tsx
<div style={{width:30,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
  {i<3 ? <MedalIcon rank={i+1} size={20}/> : <span style={{color:"var(--text-3)",fontSize:14}}>{i+1}</span>}
</div>
```

**Step 9: Verify visually**

Run `npm run dev` and check:
- Leaderboard label shows trophy SVG
- Tab pills show card/trophy/clipboard SVGs
- Hit/Miss show green check / red X circles
- Spin button shows rotate arrow icon
- Podium and end screen show gold/silver/bronze medal SVGs
- Money avatar shows coins icon

**Step 10: Commit**

```bash
git add src/App.tsx
git commit -m "feat: replace all emoji UI icons with inline SVG components"
```

---

## Task 3: Touch Target Fixes

**Files:**
- Modify: `src/App.tsx` — 5 locations

**ui-ux-pro-max rule:** `touch-target-size` — minimum 44×44px on all interactive elements.

**Step 1: Tab pills — raise to 44px**

Find:
```tsx
<button key={t} className="tab-pill press" onClick={()=>setTab(t)} style={{
  padding:"6px 11px",fontSize:12,borderRadius:9,cursor:"pointer",
  background:tab===t?"rgba(201,168,76,.14)":"rgba(0,0,0,.3)",
  border:`1px solid ${tab===t?"var(--gold-2)":"rgba(255,255,255,.1)"}`,
  color:tab===t?"var(--gold-2)":"var(--text-2)",transition:"all .15s"
}}>{ic}</button>
```
Replace with:
```tsx
<button key={t} className="tab-pill press" onClick={()=>setTab(t)} style={{
  padding:"10px 14px",fontSize:12,borderRadius:9,cursor:"pointer",
  minHeight:44,display:"flex",alignItems:"center",gap:5,
  background:tab===t?"rgba(201,168,76,.14)":"rgba(0,0,0,.3)",
  border:`1px solid ${tab===t?"var(--gold-2)":"rgba(255,255,255,.1)"}`,
  color:tab===t?"var(--gold-2)":"var(--text-2)",transition:"all .15s"
}}>{ic}</button>
```

**Step 2: Nomination order strip pills — raise to 44px**

Find the inner pill div in the nomination order strip:
```tsx
<div style={{
  padding:"4px 13px",borderRadius:20,fontSize:12,transition:"all .2s",
  background:active?"rgba(201,168,76,.2)":done?"rgba(26,107,60,.22)":"rgba(255,255,255,.04)",
  border:`1px solid ${active?C.gold:done?C.green+"88":"rgba(255,255,255,.08)"}`,
  color:active?C.gold:done?"#7ac47a":C.mutedD,fontWeight:active?700:400,
  boxShadow:active?`0 0 12px ${C.gold}22`:"none"
```
Replace `padding:"4px 13px"` with `padding:"10px 13px",minHeight:44,display:"flex",alignItems:"center"`:
```tsx
<div style={{
  padding:"10px 13px",borderRadius:20,fontSize:12,transition:"all .2s",
  minHeight:44,display:"flex",alignItems:"center",
  background:active?"rgba(201,168,76,.2)":done?"rgba(26,107,60,.22)":"rgba(255,255,255,.04)",
  border:`1px solid ${active?C.gold:done?C.green+"88":"rgba(255,255,255,.08)"}`,
  color:active?C.gold:done?"#7ac47a":C.mutedD,fontWeight:active?700:400,
  boxShadow:active?`0 0 12px ${C.gold}22`:"none"
```

**Step 3: Remove player button — raise from 34×34 to 44×44**

Find:
```tsx
<button onClick={()=>setNames(n=>n.filter((_,j)=>j!==i))} style={{width:34,height:34,background:"rgba(192,57,43,.12)",border:"1px solid rgba(192,57,43,.25)",borderRadius:8,color:"#e07060",cursor:"pointer",fontSize:19,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
```
Replace:
```tsx
<button onClick={()=>setNames(n=>n.filter((_,j)=>j!==i))} style={{width:44,height:44,background:"rgba(192,57,43,.12)",border:"1px solid rgba(192,57,43,.25)",borderRadius:8,color:"#e07060",cursor:"pointer",fontSize:19,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
```

**Step 4: Edit nomination button — raise to 44px**

Find:
```tsx
<button onClick={()=>changeNom(pi)} style={{padding:"5px 14px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.12)",borderRadius:8,color:"var(--text-2)",cursor:"pointer",fontSize:12}}>Edit</button>
```
Replace:
```tsx
<button onClick={()=>changeNom(pi)} style={{padding:"10px 14px",minHeight:44,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.12)",borderRadius:8,color:"var(--text-2)",cursor:"pointer",fontSize:12}}>Edit</button>
```

**Step 5: Re-spin dealer text link — give proper touch target**

Find:
```tsx
<button onClick={onBack} style={{marginTop:24,background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:14,fontFamily:"'EB Garamond',serif",fontStyle:"italic",textDecoration:"underline"}}>← Re-spin for dealer</button>
```
Replace:
```tsx
<button onClick={onBack} style={{marginTop:12,background:"none",border:"none",color:"var(--text-2)",cursor:"pointer",fontSize:14,fontFamily:"system-ui",fontStyle:"italic",textDecoration:"underline",minHeight:44,padding:"0 8px",display:"inline-flex",alignItems:"center"}}>← Re-spin for dealer</button>
```

**Step 6: Verify visually**

Run `npm run dev`. On mobile viewport (375px in devtools):
- Tab pills are comfortably tappable (~44px height)
- Nomination order pills have enough height
- Remove player × is 44×44
- Edit button has adequate height
- Re-spin link has a proper tap area

**Step 7: Commit**

```bash
git add src/App.tsx
git commit -m "feat: raise all touch targets to 44px minimum (ui-ux-pro-max)"
```

---

## Task 4: STYLES Object — Foundation + Core Components

**Files:**
- Modify: `src/App.tsx` — insert after line 27, before SVG icons block

**Goal:** Create the `STYLES` object with layout and core component styles, then swap out the corresponding inline style objects.

**Step 1: Insert STYLES object**

After `getRoundCards` and before `// ─── SVG ICONS ───`, insert:

```tsx
// ─── STYLES ───────────────────────────────────────────────────────────────────
// Static style objects hoisted out of JSX render (React perf best practice).
// Dynamic values (player color, hit state, active state) remain inline.
const STYLES = {

  // ── Layout ──────────────────────────────────────────────────────────────────
  felt: {
    base: {
      minHeight:"100vh" as const,
      backgroundColor:"var(--bg-base)",
      backgroundImage:`radial-gradient(ellipse at 50% 0%, #0d1a0f 0%, var(--bg-base) 60%)`,
      fontFamily:"system-ui,'Segoe UI',sans-serif",
    },
  },

  divider: {
    wrap:  { display:"flex", alignItems:"center", gap:10, margin:"18px 0" } as const,
    lineL: { flex:1, height:1, background:`linear-gradient(to right,transparent,var(--border-mid))` } as const,
    lineR: { flex:1, height:1, background:`linear-gradient(to left,transparent,var(--border-mid))` } as const,
    dot:   { color:"var(--gold-3)", fontSize:13, lineHeight:1 } as const,
  },

  // ── Core components ──────────────────────────────────────────────────────────
  panel: {
    base: { borderRadius:16, padding:"20px 22px", boxShadow:"var(--shadow-2)" } as const,
  },

  lbl: {
    base: { color:"var(--gold-2)", fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase" as const, fontFamily:"system-ui,'Segoe UI',sans-serif" } as const,
  },

  progress: {
    wrap:     { } as const,
    header:   { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 } as const,
    label:    { color:"var(--text-3)", fontSize:12, fontFamily:"system-ui", letterSpacing:"0.05em", textTransform:"uppercase" as const } as const,
    roundNum: { color:"var(--text-2)", fontSize:12, fontFamily:"system-ui", fontVariantNumeric:"tabular-nums" as const } as const,
    track:    { display:"flex", gap:3, marginBottom:16 } as const,
  },

  // ── Buttons ──────────────────────────────────────────────────────────────────
  btn: {
    base: {
      borderRadius:10, fontWeight:700, cursor:"pointer" as const,
      fontFamily:"system-ui,'Segoe UI',sans-serif", fontSize:15,
      border:"1.5px solid", minHeight:48,
      transition:`all var(--dur-fast) var(--ease-smooth)`,
      letterSpacing:"0.06em", textTransform:"uppercase" as const,
    } as const,
    disabled: { cursor:"not-allowed" as const, opacity:0.38 } as const,
    def:   { background:"var(--bg-raised)", borderColor:"var(--border-subtle)", color:"var(--text-1)" } as const,
    ghost: { background:"transparent", borderColor:"var(--border-mid)", color:"var(--text-2)" } as const,
    gold:  { borderColor:"var(--border-strong)", color:"var(--gold-1)" } as const,
    red:   { background:"rgba(239,68,68,.1)", borderColor:"rgba(239,68,68,.35)", color:"var(--red-neg)" } as const,
  },

} as const;
```

**Step 2: Wire up `Felt` to use `STYLES.felt.base`**

Find the `Felt` component's style object:
```tsx
backgroundColor: "var(--bg-base)",
backgroundImage:`radial-gradient(ellipse at 50% 0%, #0d1a0f 0%, var(--bg-base) 60%)`,
```

Replace the whole `style={{...}}` with spread:
```tsx
function Felt({ children, center, style={} }) {
  return (
    <div style={{
      ...STYLES.felt.base,
      display:center?"flex":undefined, alignItems:center?"center":undefined,
      justifyContent:center?"center":undefined, padding:center?20:undefined,
      ...style
    }}>{children}</div>
  );
}
```

**Step 3: Wire up `Divider`**

```tsx
function Divider({ style={} }) {
  return (
    <div style={{...STYLES.divider.wrap,...style}}>
      <div style={STYLES.divider.lineL}/>
      <span style={STYLES.divider.dot}>✦</span>
      <div style={STYLES.divider.lineR}/>
    </div>
  );
}
```

**Step 4: Wire up `Panel`**

The `Panel` component has dynamic `bg` and `border` — keep those inline, spread the static base:
```tsx
function Panel({ children, accent, table=false, style={} }) {
  const bg = table
    ? `linear-gradient(158deg, #0f4d26 0%, #0b3d1e 100%), ${feltTex}`
    : "var(--bg-surface)";
  const border = accent
    ? "1px solid var(--border-strong)"
    : table
    ? "1px solid var(--border-mid)"
    : "1px solid var(--border-subtle)";
  return (
    <div style={{...STYLES.panel.base, background:bg, border, ...style}}>{children}</div>
  );
}
```

**Step 5: Wire up `Lbl`**

```tsx
function Lbl({ children, style={} }) {
  return <div style={{...STYLES.lbl.base,...style}}>{children}</div>;
}
```

**Step 6: Wire up `Progress`**

```tsx
function Progress({ round, total }) {
  return (
    <div style={STYLES.progress.wrap}>
      <div style={STYLES.progress.header}>
        <span style={STYLES.progress.label}>Round</span>
        <span style={STYLES.progress.roundNum}>{round+1} of {total}</span>
      </div>
      <div style={STYLES.progress.track}>
        {Array.from({length:total},(_,i)=>(
          <div key={i} style={{
            flex:1, height:8, borderRadius:4,
            background:i<round
              ?`linear-gradient(to right,var(--gold-3),var(--gold-2))`
              :i===round
              ?`linear-gradient(to right,var(--gold-2),var(--gold-1))`
              :"var(--bg-raised)",
            boxShadow:i===round?"var(--shadow-gold)":"none",
            transition:"background var(--dur-mid)"
          }}/>
        ))}
      </div>
    </div>
  );
}
```

**Step 7: Wire up `Btn`**

```tsx
function Btn({ children, onClick, disabled=false, v="def", full=false, sm=false, ripple=false }) {
  const sizeOverride = sm ? { padding:"10px 18px", fontSize:13, minHeight:40 } : { padding:"14px 28px" };
  const cls = ["press", v==="gold"?"btn-primary":"", ripple&&!disabled?"ripple-btn":""].join(" ");
  return (
    <button className={cls} onClick={!disabled?onClick:undefined} style={{
      ...STYLES.btn.base,
      ...STYLES.btn[v],
      ...sizeOverride,
      ...(disabled ? STYLES.btn.disabled : {}),
      width:full?"100%":undefined,
    }}>
      {children}
    </button>
  );
}
```

**Step 8: Verify**

Run `npm run dev` — app should look and behave identically to before.

**Step 9: Commit**

```bash
git add src/App.tsx
git commit -m "refactor: hoist Felt/Divider/Panel/Lbl/Progress/Btn styles to STYLES object"
```

---

## Task 5: STYLES Object — Setup + Spin + Trump Screens

**Files:**
- Modify: `src/App.tsx` — extend `STYLES` object and update Setup/Spin/Trump render blocks

**Step 1: Add screen styles to STYLES**

Inside the `STYLES` object, add after `btn`:

```tsx
  // ── Setup screen ─────────────────────────────────────────────────────────────
  setup: {
    wrap:        { width:"100%", maxWidth:460 } as const,
    heading:     { textAlign:"center" as const, marginBottom:36 } as const,
    h1:          { fontSize:50, fontWeight:900, fontFamily:"'Playfair Display',serif", letterSpacing:-1 } as const,
    sub:         { fontSize:15, marginTop:8, fontStyle:"italic" as const, fontFamily:"system-ui" } as const,
    playerNum:   { width:22, height:22, borderRadius:"50%", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0 } as const,
    removeBtn:   { width:44, height:44, background:"rgba(192,57,43,.12)", border:"1px solid rgba(192,57,43,.25)", borderRadius:8, color:"#e07060", cursor:"pointer" as const, fontSize:19, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 } as const,
    addBtn:      { width:"100%", padding:"10px", background:"transparent", border:"1px dashed var(--border-mid)", borderRadius:10, color:"var(--text-2)", cursor:"pointer" as const, fontSize:13, marginTop:4 } as const,
    stakeWrap:   { display:"flex", alignItems:"center", background:"rgba(255,255,255,.03)", borderRadius:12, border:"1px solid rgba(255,255,255,.1)", overflow:"hidden" as const, marginBottom:6 } as const,
    stakeBtn:    { width:54, height:50, background:"rgba(255,255,255,.03)", border:"none", fontSize:26 } as const,
    stakeBtnL:   { borderRight:"1px solid rgba(255,255,255,.08)" } as const,
    stakeBtnR:   { borderLeft:"1px solid rgba(255,255,255,.08)" } as const,
    stakeVal:    { flex:1, textAlign:"center" as const, color:"var(--gold-2)", fontSize:24, fontWeight:700, fontFamily:"'Playfair Display',serif", fontVariantNumeric:"tabular-nums" as const } as const,
    stakeHint:   { color:"var(--text-3)", fontSize:11, textAlign:"center" as const, marginBottom:22 } as const,
  },

  // ── Spin screen ──────────────────────────────────────────────────────────────
  spin: {
    wrap:      { width:"100%", maxWidth:440, textAlign:"center" as const } as const,
    heading:   { fontFamily:"'Playfair Display',serif", fontSize:34, fontWeight:900, marginBottom:6, textShadow:`0 2px 20px rgba(201,168,76,.35)` } as const,
    sub:       { fontSize:16, marginBottom:32, fontStyle:"italic" as const } as const,
    spotlight: { position:"relative" as const, background:"radial-gradient(ellipse 80% 60% at 50% 60%, rgba(11,61,30,.7) 0%, transparent 70%)", borderRadius:24, padding:"0 0 32px" } as const,
    result:    { textAlign:"center" as const } as const,
    resultName:{ fontSize:40, fontWeight:900, fontFamily:"'Playfair Display',serif", marginBottom:24, letterSpacing:-.5 } as const,
  },

  // ── Trump screen ─────────────────────────────────────────────────────────────
  trump: {
    wrap:          { width:"100%", maxWidth:480, textAlign:"center" as const } as const,
    heading:       { fontFamily:"'Playfair Display',serif", fontSize:34, fontWeight:900, marginBottom:4 } as const,
    sub:           { fontSize:15, marginBottom:10, fontStyle:"italic" as const } as const,
    dealerPills:   { display:"flex", justifyContent:"center", flexWrap:"wrap" as const, gap:6 } as const,
    dealerPillDef: { padding:"3px 12px", borderRadius:20, fontSize:13, background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", fontWeight:400, fontFamily:"'Playfair Display',serif", boxShadow:"none" } as const,
    separator:     { fontSize:12 } as const,
    backBtn:       { marginTop:12, background:"none", border:"none", cursor:"pointer" as const, fontSize:14, fontFamily:"system-ui", fontStyle:"italic" as const, textDecoration:"underline" as const, minHeight:44, padding:"0 8px", display:"inline-flex" as const, alignItems:"center" } as const,
  },
```

**Step 2: Update Setup screen to use STYLES**

Replace inline style objects in the `Setup` component using the new `STYLES.setup.*` keys. Key changes:

- Outer `<div style={{width:"100%",maxWidth:460}}...>` → `style={{...STYLES.setup.wrap}}`
- heading div → `style={STYLES.setup.heading}`
- `<h1 style={{color:...}}>` → keep `color` inline (it's `var(--gold-2)`), spread `STYLES.setup.h1`
- `<p style={{color:...}}>` → keep `color`, spread `STYLES.setup.sub`
- Player number circle → `style={STYLES.setup.playerNum}` (override `color` inline)
- Remove button → `style={STYLES.setup.removeBtn}`
- Add Player button → `style={STYLES.setup.addBtn}`
- Stake wrap → `style={STYLES.setup.stakeWrap}`
- Stake `−` button → `style={{...STYLES.setup.stakeBtn,...STYLES.setup.stakeBtnL,...}}` (color inline)
- Stake value → `style={STYLES.setup.stakeVal}`
- Stake `+` button → `style={{...STYLES.setup.stakeBtn,...STYLES.setup.stakeBtnR,...}}`
- Stake hint → `style={STYLES.setup.stakeHint}`

**Step 3: Update Spin screen render block**

```tsx
if(phase==="spin")return(
  <Felt center><style>{CSS}</style>
    <div style={STYLES.spin.wrap} className="fade-up">
      <h2 style={{...STYLES.spin.heading, color:"var(--gold-2)"}}>Who deals first?</h2>
      <p style={{...STYLES.spin.sub, color:"var(--text-2)"}}>Spin the wheel to decide</p>
      <div style={STYLES.spin.spotlight}>
        <SpinWheel players={players} onDone={afterSpin}/>
      </div>
    </div>
  </Felt>
);
```

**Step 4: Update Trump screen render block**

```tsx
if(phase==="trump")return(
  <Felt center><style>{CSS}</style>
    <div style={STYLES.trump.wrap} className="fade-up">
      <Lbl style={{textAlign:"center",marginBottom:8}}>Round {round+1} of {totalRounds}</Lbl>
      <h2 style={{...STYLES.trump.heading, color:"var(--text-1)"}}>{roundCards} cards dealt</h2>
      <p style={{...STYLES.trump.sub, color:"var(--text-2)"}}>{players[dealerIdx]} is dealing</p>
      <Panel table style={{marginBottom:28,padding:"14px 18px"}}>
        <Lbl style={{marginBottom:10,textAlign:"center"}}>Dealer rotation this game</Lbl>
        <div style={STYLES.trump.dealerPills}>
          {players.map((p,i)=>(
            <div key={p} style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{
                ...STYLES.trump.dealerPillDef,
                background:i===dealerIdx?"rgba(201,168,76,.16)":undefined,
                border:i===dealerIdx?`1px solid ${C.gold}55`:undefined,
                color:i===dealerIdx?"var(--gold-2)":"var(--text-1)",
                fontWeight:i===dealerIdx?700:400,
                boxShadow:i===dealerIdx?`0 0 10px ${C.gold}22`:undefined,
              }}>{p}{i===dealerIdx?" 🂡":""}</div>
              {i<players.length-1&&<span style={{...STYLES.trump.separator, color:"var(--text-3)"}}>›</span>}
            </div>
          ))}
        </div>
      </Panel>
      <TrumpPicker onPick={pickTrump} onBack={round===0?()=>setPhase("spin"):null}/>
    </div>
  </Felt>
);
```

Also update the `onBack` button in `TrumpPicker`:
```tsx
<button onClick={onBack} style={{...STYLES.trump.backBtn, color:"var(--text-2)"}}>← Re-spin for dealer</button>
```

**Step 5: Verify**

Run `npm run dev`, walk through Setup → Spin → Trump. All screens should look identical to before.

**Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "refactor: hoist Setup/Spin/Trump screen styles to STYLES object"
```

---

## Task 6: STYLES Object — Nominate + Play Screens

**Files:**
- Modify: `src/App.tsx` — extend STYLES, update nominate and play render blocks

**Step 1: Add nominate + play styles to STYLES**

Inside the `STYLES` object, add:

```tsx
  // ── Nominate screen ───────────────────────────────────────────────────────────
  nominate: {
    orderPanel:    { marginBottom:14, padding:"12px 16px" } as const,
    orderStrip:    { display:"flex", gap:6, flexWrap:"wrap" as const } as const,
    ordinal:       { fontSize:9, fontWeight:700, letterSpacing:.5 } as const,
    callerPanel:   { marginBottom:14 } as const,
    callerTop:     { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 } as const,
    callerRight:   { textAlign:"right" as const } as const,
    callerCount:   { fontSize:12 } as const,
    callerTricks:  { fontSize:19, fontWeight:700, fontFamily:"'Playfair Display',serif" } as const,
    chipsWrap:     { display:"flex", flexWrap:"wrap" as const, gap:8, justifyContent:"center" } as const,
    bustWarning:   { fontSize:12, marginTop:14, background:"rgba(192,57,43,.1)", borderRadius:8, padding:"8px 14px", border:"1px solid rgba(192,57,43,.22)" } as const,
    doneRow:       { display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(255,255,255,.03)", borderRadius:12, padding:"11px 16px", border:"1px solid rgba(255,255,255,.07)" } as const,
    donePlayerName:{ fontSize:14, fontFamily:"'Playfair Display',serif" } as const,
    doneCalledLbl: { fontSize:12 } as const,
    editBtn:       { padding:"10px 14px", minHeight:44, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.12)", borderRadius:8, cursor:"pointer" as const, fontSize:12 } as const,
  },

  // ── Play screen ───────────────────────────────────────────────────────────────
  play: {
    bustBanner:  { borderRadius:10, padding:"12px 16px", marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center", transition:`border-color var(--dur-mid), background var(--dur-mid)` } as const,
    bustLeft:    { fontSize:13, fontFamily:"system-ui" } as const,
    bustRight:   { fontSize:13, fontWeight:700, fontFamily:"system-ui" } as const,
    cardsWrap:   { display:"flex", flexDirection:"column" as const, gap:9, marginBottom:14 } as const,
    cardInner:   { borderRadius:16, padding:"14px 16px 14px 14px", position:"relative" as const, overflow:"hidden" as const } as const,
    cardTop:     { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 } as const,
    cardName:    { color:"var(--text-1)", fontSize:16, fontWeight:600, fontFamily:"'Playfair Display',serif" } as const,
    cardScore:   { fontSize:18, fontWeight:700, fontFamily:"'Playfair Display',serif", fontVariantNumeric:"tabular-nums" as const } as const,
    cardPts:     { fontSize:11, marginLeft:2 } as const,
    cardRight:   { textAlign:"right" as const } as const,
    cardLbl:     { color:"var(--text-3)", fontSize:9, letterSpacing:1.5, textTransform:"uppercase" as const, fontFamily:"system-ui" } as const,
    cardNom:     { color:"var(--text-1)", fontSize:32, fontWeight:900, fontFamily:"'Playfair Display',serif", lineHeight:1, fontVariantNumeric:"tabular-nums" as const } as const,
    hitBtns:     { display:"flex", gap:8 } as const,
    hitBtnBase:  { flex:1, padding:"14px 0", borderRadius:10, minHeight:48, fontWeight:400, cursor:"pointer" as const, fontSize:14, transition:`all var(--dur-fast)`, fontFamily:"system-ui" } as const,
    undoRow:     { display:"flex", gap:10, marginBottom:10 } as const,
    endRoundBtn: { flex:1, padding:"16px", borderRadius:14, fontSize:17, fontWeight:800, cursor:"pointer" as const, fontFamily:"'Playfair Display',serif", letterSpacing:.3 } as const,
    confirmTitle:{ fontSize:16, fontWeight:700, marginBottom:6, fontFamily:"'Playfair Display',serif" } as const,
    confirmSub:  { fontSize:13, marginBottom:16, fontStyle:"italic" as const } as const,
    confirmBtns: { display:"flex", gap:10 } as const,
  },
```

**Step 2: Update nominate screen to use STYLES**

Apply the `STYLES.nominate.*` keys throughout the nominate render block. Keep all dynamic values (active/done state colors) inline.

Key substitutions:
- Order strip panel `style=` → `style={STYLES.nominate.orderPanel}`
- Order strip flex div → `style={STYLES.nominate.orderStrip}`
- Ordinal span → spread `STYLES.nominate.ordinal`, color inline
- Caller panel `style=` → `style={STYLES.nominate.callerPanel}`
- Chips wrap → `style={STYLES.nominate.chipsWrap}`
- Done row → `style={STYLES.nominate.doneRow}`
- Done player name → `style={{...STYLES.nominate.donePlayerName, color:"var(--text-1)"}}`
- Edit button → `style={{...STYLES.nominate.editBtn, color:"var(--text-2)"}}`

**Step 3: Update play screen to use STYLES**

Apply `STYLES.play.*` keys throughout the play render block. Keep dynamic values inline.

Key substitutions:
- Bust banner → `style={{...STYLES.play.bustBanner, background:..., border:...}}`
- Cards wrap → `style={STYLES.play.cardsWrap}`
- Card inner div → `style={{...STYLES.play.cardInner, background:..., border:..., borderLeft:..., boxShadow:...}}`
- Card top → `style={STYLES.play.cardTop}`
- Card name → `style={STYLES.play.cardName}`
- Card score → `style={{...STYLES.play.cardScore, color:"var(--gold-2)"}}`
- Hit buttons wrap → `style={STYLES.play.hitBtns}`
- Hit button → `style={{...STYLES.play.hitBtnBase, border:..., background:..., color:...}}`
- End round button → `style={{...STYLES.play.endRoundBtn, border:..., color:..., boxShadow:...}}`

**Step 4: Verify**

Run `npm run dev`, walk through Nominate → Play screens. Confirm layout and colors are unchanged.

**Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "refactor: hoist Nominate/Play screen styles to STYLES object"
```

---

## Task 7: STYLES Object — Summary + End + Sub-components

**Files:**
- Modify: `src/App.tsx` — extend STYLES, update remaining components

**Step 1: Add remaining styles to STYLES**

```tsx
  // ── Round Summary ─────────────────────────────────────────────────────────────
  summary: {
    wrap:      { width:"100%", maxWidth:500 } as const,
    heading:   { textAlign:"center" as const, marginBottom:24 } as const,
    h2:        { fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:900, marginBottom:4 } as const,
    sub:       { fontSize:15, fontStyle:"italic" as const } as const,
    row:       { display:"flex", alignItems:"center", gap:12, padding:"13px 12px", borderRadius:8, marginBottom:4 } as const,
    iconWrap:  { width:28, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 } as const,
    nameWrap:  { flex:1, minWidth:0 } as const,
    name:      { fontWeight:600, fontSize:15, fontFamily:"'Playfair Display',serif", whiteSpace:"nowrap" as const, overflow:"hidden" as const, textOverflow:"ellipsis" as const } as const,
    called:    { fontSize:12, marginTop:1 } as const,
    ptsWrap:   { textAlign:"right" as const, flexShrink:0 } as const,
    pts:       { fontWeight:700, fontSize:19, fontFamily:"'Playfair Display',serif", fontVariantNumeric:"tabular-nums" as const } as const,
    prevScore: { fontSize:11 } as const,
    rankBadge: { fontSize:11, fontWeight:700, minWidth:28, textAlign:"center" as const, flexShrink:0, animation:"rankIn .35s ease both" } as const,
    next:      { marginTop:18 } as const,
  },

  // ── End screen ───────────────────────────────────────────────────────────────
  end: {
    outer:     { maxWidth:500, margin:"0 auto", padding:"28px 20px", textAlign:"center" as const } as const,
    h1:        { fontSize:44, fontWeight:900, fontFamily:"'Playfair Display',serif", marginBottom:6 } as const,
    sub:       { fontStyle:"italic" as const, marginBottom:28, fontSize:15 } as const,
    listRow:   { display:"flex", alignItems:"center", gap:12, padding:"12px 4px" } as const,
    listBar:   { width:4, height:28, borderRadius:2, flexShrink:0 } as const,
    listName:  { fontSize:17, fontFamily:"'Playfair Display',serif" } as const,
    listScore: { fontWeight:700, fontSize:21, fontFamily:"'Playfair Display',serif", fontVariantNumeric:"tabular-nums" as const } as const,
    listPts:   { fontSize:11, marginLeft:2 } as const,
    ctaRow:    { display:"flex", gap:12 } as const,
    confirmTitle:{ fontSize:16, fontWeight:700, marginBottom:6, fontFamily:"'Playfair Display',serif" } as const,
    confirmSub:  { fontSize:13, marginBottom:16, fontStyle:"italic" as const } as const,
    confirmBtns: { display:"flex", gap:10 } as const,
  },

  // ── Leaderboard ───────────────────────────────────────────────────────────────
  leaderboard: {
    row:       { display:"flex", alignItems:"center", gap:12, padding:"11px 0" } as const,
    colorBar:  { width:4, height:28, borderRadius:2, flexShrink:0, opacity:.85 } as const,
    nameWrap:  { flex:1 } as const,
    name:      { fontSize:15, fontFamily:"'Playfair Display',serif" } as const,
    barTrack:  { height:6, borderRadius:2, background:"rgba(255,255,255,.06)", marginTop:5, overflow:"hidden" as const } as const,
    score:     { fontSize:18, fontWeight:700, fontFamily:"'Playfair Display',serif", fontVariantNumeric:"tabular-nums" as const } as const,
    scorePts:  { fontSize:11, marginLeft:2 } as const,
  },

  // ── Round History ─────────────────────────────────────────────────────────────
  history: {
    emptyIcon: { marginBottom:10, opacity:.5, display:"flex", justifyContent:"center" } as const,
    emptyText: { fontSize:15, fontStyle:"italic" as const } as const,
    roundMeta: { display:"flex", alignItems:"center", gap:10, marginBottom:10 } as const,
    roundLbl:  { fontSize:12, fontWeight:700, letterSpacing:1 } as const,
    roundSub:  { fontSize:12 } as const,
    hitRow:    { display:"flex", alignItems:"center", gap:8, marginBottom:4, padding:"6px 10px", borderRadius:8, background:"rgba(34,197,94,.08)", borderLeft:"3px solid var(--green-pos)" } as const,
    missRow:   { display:"flex", alignItems:"center", gap:8, marginBottom:4, padding:"6px 10px", borderRadius:8, background:"rgba(239,68,68,.08)", borderLeft:"3px solid var(--red-neg)" } as const,
    pName:     { flex:1, fontSize:13, fontFamily:"'Playfair Display',serif" } as const,
    pCalled:   { fontSize:12 } as const,
    pPts:      { fontWeight:700, fontSize:13, minWidth:48, textAlign:"right" as const } as const,
  },

  // ── Money ─────────────────────────────────────────────────────────────────────
  money: {
    headerRow: { display:"flex", alignItems:"center", gap:12, marginBottom:2 } as const,
    avatar:    { width:44, height:44, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 } as const,
    sub:       { fontSize:12, marginTop:2, fontStyle:"italic" as const } as const,
    debtRow:   { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0" } as const,
    debtName:  { fontSize:16, fontFamily:"'Playfair Display',serif" } as const,
    debtRight: { textAlign:"right" as const } as const,
    debtAmt:   { fontWeight:700, fontSize:22, fontFamily:"'Playfair Display',serif", fontVariantNumeric:"tabular-nums" as const } as const,
    ptsBehind: { fontSize:11 } as const,
  },

  // ── Podium ────────────────────────────────────────────────────────────────────
  podium: {
    wrap:     { display:"flex", justifyContent:"center", alignItems:"flex-end", gap:6, marginBottom:28 } as const,
    col:      { display:"flex", flexDirection:"column" as const, alignItems:"center", gap:6, flex:1, maxWidth:120 } as const,
    medal:    { width:36, height:36, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, marginBottom:2 } as const,
    platform: { width:"100%", borderRadius:"10px 10px 0 0", border:"1px solid var(--border-mid)", display:"flex", alignItems:"flex-start", justifyContent:"center", paddingTop:10, background:"var(--bg-table)" } as const,
  },

  // ── Shared header ─────────────────────────────────────────────────────────────
  hdr: {
    wrap:      { padding:"16px 18px 0", maxWidth:600, margin:"0 auto" } as const,
    topRow:    { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 } as const,
    title:     { fontFamily:"'Playfair Display',serif", fontSize:23, fontWeight:900, letterSpacing:-.5 } as const,
    sub:       { fontSize:12 } as const,
    tabRow:    { display:"flex", gap:4 } as const,
  },
```

**Step 2: Update sub-components to use STYLES**

Apply `STYLES.leaderboard.*`, `STYLES.history.*`, `STYLES.money.*`, `STYLES.podium.*` throughout the respective components. Keep dynamic background/color/border values inline.

**Step 3: Update RoundSummary render**

Apply `STYLES.summary.*` keys. Key: the row `background` and `borderLeft` remain inline (hit/miss dependent).

**Step 4: Update End screen render**

Apply `STYLES.end.*` keys.

**Step 5: Update shared Hdr component**

Apply `STYLES.hdr.*` keys.

**Step 6: Verify**

Run `npm run dev` and walk the full game flow: Setup → Spin → Trump → Nominate → Play → Round Summary → End.
All screens should look identical to before.

**Step 7: Commit**

```bash
git add src/App.tsx
git commit -m "refactor: hoist Summary/End/sub-component styles to STYLES object"
```

---

## Task 8: ui-ux-pro-max Pre-Delivery Check

**Files:**
- Modify: `src/App.tsx` — fix any remaining issues found during audit

**Step 1: Run the ui-ux-pro-max checklist**

Open `docs/plans/2026-03-09-ui-ux-polish-design.md` and work through the Pre-Delivery Checklist section. For each item:

- [ ] **No emojis as icons** — grep: `grep -n "🥇\|🥈\|🥉\|🃏\|🏆\|📋\|💰\|🎰\|✅\|❌" src/App.tsx` — should return 0 results
- [ ] **All SVG icons consistent** — confirm all icons use `strokeWidth="1.8"` and `viewBox="0 0 24 24"`
- [ ] **cursor:pointer on all clickable elements** — grep: `grep -n "onClick" src/App.tsx | grep -v "cursor"` — check each result has cursor in its style
- [ ] **Touch targets ≥44px** — grep: `grep -n "minHeight" src/App.tsx` — confirm all interactive elements have it
- [ ] **No static style={{...}} in JSX** — grep: `grep -n "style={{" src/App.tsx` — remaining results should only have dynamic values

**Step 2: Fix any remaining cursor:pointer gaps**

Any `<button>` or `<div onClick=` without `cursor:"pointer"` in its style should have it added. Common missed spots:
- Suit card buttons in TrumpPicker (already have `cursor:"pointer"`)
- Stake `−`/`+` buttons
- Confirm/Cancel buttons in play screen

**Step 3: Check `prefers-reduced-motion`**

Verify the CSS template contains or references `--dur-*` tokens (it does via the `:root` block). Add if missing:

```css
@media(prefers-reduced-motion:reduce){
  *{animation-duration:.01ms!important;transition-duration:.01ms!important;}
}
```

Add this to the end of the CSS template literal in `App.tsx`.

**Step 4: Final visual walkthrough**

Run `npm run dev`. Walk through every screen:
- Setup — inputs, round selector, stake picker, start button
- Spin — wheel, result, "Start Game" button
- Trump — dealer rotation, suit picker, confirm card
- Nominate — order strip, chip grid, done list
- Play — bust banner, player cards, hit/miss buttons, end round
- Round Summary — hit/miss rows, rank changes
- End — podium, full list, money settlement, CTA buttons

Verify:
- No emoji icons visible anywhere
- All tap targets feel comfortable at mobile size
- No layout shifts from the STYLES refactor

**Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: ui-ux-pro-max pre-delivery check — reduced motion + cursor audit"
```

---

## Execution Checklist

- [ ] Task 1: SVG icon components
- [ ] Task 2: Replace emoji usage
- [ ] Task 3: Touch target fixes
- [ ] Task 4: STYLES foundation + core components
- [ ] Task 5: STYLES setup/spin/trump screens
- [ ] Task 6: STYLES nominate/play screens
- [ ] Task 7: STYLES summary/end/sub-components
- [ ] Task 8: ui-ux-pro-max pre-delivery check
