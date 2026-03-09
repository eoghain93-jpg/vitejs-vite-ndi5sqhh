# Premium Casino Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Overhaul App.tsx with a full CSS custom property token system to achieve a PokerStars-tier premium casino aesthetic: near-black chrome, felt green as a surface (not background), sharp gold metallics, tight typography, and polished animation timing.

**Architecture:** All styles live in two places in App.tsx — the `CSS` template literal (injected as a `<style>` tag) and inline `style={{}}` props on JSX elements. The plan adds CSS custom properties to `:root` in the template literal, updates the `C` color constant to use the new values, and rewrites each component's styles systematically. No new files are created — all changes are to `src/App.tsx`.

**Tech Stack:** React, TypeScript, inline styles + CSS template literal, Google Fonts (Playfair Display, System UI body)

---

## Task 1: CSS Token Foundation — `:root` variables + body background

**Files:**
- Modify: `src/App.tsx:24-64` (the `CSS` template literal)
- Modify: `src/App.tsx:4-11` (the `C` color constant)

**Step 1: Replace the `C` constant (lines 4–11) with updated values**

Find:
```ts
const C = {
  gold:"#c9a84c", goldL:"#e8c96a", goldD:"#7a6020", goldXD:"#3a2c0a",
  felt:"#0b3d1e", feltM:"#0f4d26", feltD:"#071a0e",
  cream:"#f5f0e8", dark:"#060e08",
  red:"#c0392b", redL:"#e05545",
  green:"#1a6b3c", greenD:"#0d4d28",
  muted:"#6a8a6a", mutedD:"#374f37",
};
```

Replace with:
```ts
const C = {
  // Gold scale
  gold:"#c9a84c", goldL:"#f0d080", goldD:"#8a6f2e", goldXD:"#3a2c0a",
  // Felt surfaces (table only, not chrome)
  felt:"#0b3d1e", feltM:"#0f4d26", feltD:"#071a0e",
  // App chrome (near-black)
  bg:"#070709", bgSurface:"#0f1012", bgRaised:"#161719",
  // Text
  cream:"#f5f0e8", dark:"#060e08",
  // Status
  red:"#ef4444", redL:"#ef4444",
  green:"#22c55e", greenD:"#16a34a",
  muted:"#a89f8c", mutedD:"#5a5248",
};
```

**Step 2: Add `:root` CSS custom properties at the top of the `CSS` template literal**

After the `@import` line and before `*{...}`, add:

```css
  :root {
    --bg-base:       #070709;
    --bg-surface:    #0f1012;
    --bg-raised:     #161719;
    --bg-table:      #0b3d1e;
    --bg-table-mid:  #0f4d26;
    --gold-1:        #f0d080;
    --gold-2:        #c9a84c;
    --gold-3:        #8a6f2e;
    --gold-4:        #3a2c0a;
    --green-pos:     #22c55e;
    --red-neg:       #ef4444;
    --text-1:        #f5f0e8;
    --text-2:        #a89f8c;
    --text-3:        #5a5248;
    --border-subtle: rgba(255,255,255,.06);
    --border-mid:    rgba(201,168,76,.18);
    --border-strong: rgba(201,168,76,.45);
    --shadow-1:      0 1px 3px rgba(0,0,0,.4);
    --shadow-2:      0 4px 12px rgba(0,0,0,.5);
    --shadow-3:      0 12px 32px rgba(0,0,0,.6);
    --shadow-gold:   0 0 20px rgba(201,168,76,.25);
    --ease-out:      cubic-bezier(0.22,1,0.36,1);
    --ease-spring:   cubic-bezier(0.34,1.56,0.64,1);
    --ease-smooth:   cubic-bezier(0.4,0,0.2,1);
    --dur-fast:      150ms;
    --dur-mid:       280ms;
    --dur-slow:      500ms;
  }
```

**Step 3: Update `body` background in CSS template**

Find: `body{background:#050e08;}`
Replace with: `body{background:var(--bg-base);}`

**Step 4: Verify**

Run: `npm run dev`
Check: App background is now near-black `#070709` (not felt green). The game should still function.

**Step 5: Commit**
```bash
git add src/App.tsx
git commit -m "feat: add CSS custom property token system to App.tsx"
```

---

## Task 2: App Chrome Background — `Felt` component

The `Felt` component wraps every screen. Currently it applies a green felt gradient to the whole app. We need the chrome to be near-black, with felt green appearing only inside table surface panels.

**Files:**
- Modify: `src/App.tsx:70-82` (the `Felt` component)

**Step 1: Update `Felt` component**

Find the `Felt` component and replace its `backgroundColor` and `backgroundImage`:

```tsx
function Felt({ children, center, style={} }) {
  return (
    <div style={{
      minHeight:"100vh",
      backgroundColor: "var(--bg-base)",
      backgroundImage:`radial-gradient(ellipse at 50% 0%, #0d1a0f 0%, var(--bg-base) 60%)`,
      display:center?"flex":undefined, alignItems:center?"center":undefined,
      justifyContent:center?"center":undefined, padding:center?20:undefined,
      fontFamily:"system-ui,'Segoe UI',sans-serif",
      ...style
    }}>{children}</div>
  );
}
```

Note: `fontFamily` changes from EB Garamond to System UI as the default body font.

**Step 2: Verify**

Run: `npm run dev`
Check: Background is near-black with a very subtle dark-green vignette at the top. Text throughout should still be readable.

**Step 3: Commit**
```bash
git add src/App.tsx
git commit -m "feat: shift app chrome to near-black, felt green becomes surface-only"
```

---

## Task 3: Panel Components — Table Panel + App Panel

The `Panel` component currently uses a glass-morphism style on every surface. We need two variants: `table` (felt green surface, used for game play areas) and default (dark surface, used for chrome).

**Files:**
- Modify: `src/App.tsx:146-157` (the `Panel` component)

**Step 1: Update `Panel` component to support `table` variant**

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
    <div style={{
      background: bg,
      borderRadius: 16,
      padding: "20px 22px",
      border,
      boxShadow: "var(--shadow-2)",
      ...style
    }}>{children}</div>
  );
}
```

**Step 2: Update `Lbl` component**

Find `Lbl` component and update font:
```tsx
function Lbl({ children, style={} }) {
  return <div style={{color:"var(--gold-2)",fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",fontFamily:"system-ui,'Segoe UI',sans-serif",...style}}>{children}</div>;
}
```

**Step 3: Update `Divider` component**

Find `Divider` and update gold references:
```tsx
function Divider({ style={} }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,margin:"18px 0",...style}}>
      <div style={{flex:1,height:1,background:`linear-gradient(to right,transparent,var(--border-mid))`}}/>
      <span style={{color:"var(--gold-3)",fontSize:13,lineHeight:1}}>✦</span>
      <div style={{flex:1,height:1,background:`linear-gradient(to left,transparent,var(--border-mid))`}}/>
    </div>
  );
}
```

**Step 4: Verify**

Run: `npm run dev`
Check: Panels throughout the app now use dark `--bg-surface` backgrounds. Dividers use gold-tinted lines.

**Step 5: Commit**
```bash
git add src/App.tsx
git commit -m "feat: two-variant Panel system (table felt vs app surface)"
```

---

## Task 4: Button Component

**Files:**
- Modify: `src/App.tsx:179-195` (the `Btn` component)
- Modify: `src/App.tsx:57-64` (`.btn-primary` class in CSS template)

**Step 1: Update `.btn-primary` in CSS template**

Find:
```css
  .btn-primary{
    background:linear-gradient(135deg,#1a6b3c,#0d4d28,#1a6b3c);
    background-size:200% auto;
    animation:shimmer 3s linear infinite;
  }
  .btn-primary:hover{background-size:150% auto;box-shadow:0 6px 28px #c9a84c33!important;}
```

Replace with:
```css
  .btn-primary{
    background:linear-gradient(180deg,var(--gold-4) 0%,var(--gold-3) 50%,var(--gold-2) 100%);
  }
  .btn-primary:hover{box-shadow:var(--shadow-gold)!important;filter:brightness(1.12);}
  .btn-primary:active{filter:brightness(0.95);}
```

**Step 2: Update `Btn` component**

```tsx
function Btn({ children, onClick, disabled=false, v="def", full=false, sm=false, ripple=false }) {
  const base = {
    padding: sm ? "10px 18px" : "14px 28px",
    borderRadius: 10,
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "system-ui,'Segoe UI',sans-serif",
    fontSize: sm ? 13 : 15,
    border: "1.5px solid",
    width: full ? "100%" : undefined,
    minHeight: sm ? 40 : 48,
    opacity: disabled ? 0.38 : 1,
    transition: `all var(--dur-fast) var(--ease-smooth)`,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
  };
  const vs = {
    def:   { background: "var(--bg-raised)", borderColor: "var(--border-subtle)", color: "var(--text-1)" },
    ghost: { background: "transparent", borderColor: "var(--border-mid)", color: "var(--text-2)" },
    gold:  { borderColor: "var(--border-strong)", color: "var(--gold-1)" },
    red:   { background: "rgba(239,68,68,.1)", borderColor: "rgba(239,68,68,.35)", color: "var(--red-neg)" },
  };
  const cls = ["press", v === "gold" ? "btn-primary" : "", ripple && !disabled ? "ripple-btn" : ""].join(" ");
  return <button className={cls} onClick={!disabled ? onClick : undefined} style={{...base,...vs[v]}}>{children}</button>;
}
```

**Step 3: Update hover states in CSS template**

Find: `.tab-pill:hover{border-color:#c9a84c88!important;color:#c9a84c!important;}`
Replace: `.tab-pill:hover{border-color:var(--border-strong)!important;color:var(--gold-2)!important;}`

Find: `.input-field:focus{border-color:#c9a84c88!important;box-shadow:0 0 0 3px #c9a84c11!important;}`
Replace: `.input-field:focus{border-color:var(--border-strong)!important;box-shadow:0 0 0 3px rgba(201,168,76,.08)!important;}`

**Step 4: Verify**

Run: `npm run dev`
Check: Gold buttons now have a dark-to-gold metallic gradient. Ghost buttons use gold-tinted borders. All buttons are at least 48px tall.

**Step 5: Commit**
```bash
git add src/App.tsx
git commit -m "feat: button system with gold metallic gradient and token-based variants"
```

---

## Task 5: Progress Bar + Round Label

**Files:**
- Modify: `src/App.tsx:164-177` (the `Progress` component)

**Step 1: Update `Progress` component**

Find the `Progress` component and replace:

```tsx
function Progress({ round, total }) {
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <span style={{color:"var(--text-3)",fontSize:12,fontFamily:"system-ui",letterSpacing:"0.05em",textTransform:"uppercase"}}>Round</span>
        <span style={{color:"var(--text-2)",fontSize:12,fontFamily:"system-ui",fontVariantNumeric:"tabular-nums"}}>{round+1} of {total}</span>
      </div>
      <div style={{display:"flex",gap:3,marginBottom:16}}>
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

**Step 2: Verify**

Run: `npm run dev` and navigate to the play phase.
Check: Progress bar is now 8px tall with a "Round X of Y" label above. Active segment glows gold.

**Step 3: Commit**
```bash
git add src/App.tsx
git commit -m "feat: progress bar 8px with round label and gold active glow"
```

---

## Task 6: Nomination Chips Grid

**Files:**
- Modify: `src/App.tsx` — the nominate phase chip grid (search for `gridTemplateColumns:"repeat(auto-fill`)

**Step 1: Find and update the chips grid**

Find: `<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(62px,1fr))",gap:10}}>`

Replace with: `<div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center"}}>`

**Step 2: Update individual chip styles**

Find the chip `<button>` style inside the grid. Replace the `height:62` and width logic:

```tsx
<button key={i} className={bad?"":"nom-chip"} disabled={bad}
  onClick={()=>!bad&&submitNom(nomIdx,i)} style={{
  width:60, height:60, borderRadius:12,
  border:`2px solid ${bad?"var(--border-subtle)":"var(--border-mid)"}`,
  background:bad?"rgba(255,255,255,.02)":"var(--bg-raised)",
  color:bad?"var(--text-3)":"var(--text-1)", fontSize:22, fontWeight:700,
  cursor:bad?"not-allowed":"pointer",
  textDecoration:bad?"line-through":"none",
  transition:`all var(--dur-fast)`,
  display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,
  boxShadow:bad?"none":"var(--shadow-1)",
  fontFamily:"system-ui"
}}>
```

**Step 3: Update nom-chip hover in CSS template**

Find: `.nom-chip:hover:not(:disabled){transform:scale(1.12)!important;background:rgba(26,107,60,0.55)!important;}`
Replace: `.nom-chip:hover:not(:disabled){transform:scale(1.1)!important;background:var(--bg-raised)!important;border-color:var(--border-strong)!important;box-shadow:var(--shadow-gold)!important;}`

**Step 4: Verify**

Run: `npm run dev` and navigate to nominate phase.
Check: Chips are 60×60px fixed size, flex-wrap centered layout, never awkward column counts.

**Step 5: Commit**
```bash
git add src/App.tsx
git commit -m "feat: nomination chips fixed 60px grid, always centered flex layout"
```

---

## Task 7: Player Cards — Dealer Badge, Pending State, Hit/Miss Buttons

**Files:**
- Modify: `src/App.tsx` — play phase player card section (search for `/* Player hit/miss cards */`)

**Step 1: Update player card background to include color tint**

Find the outer card `<div>` style that contains `background:"linear-gradient(155deg,rgba(24,38,26,.96)`:

Replace the `background` value with:
```
background:`linear-gradient(155deg,${pc}0d,var(--bg-surface) 40%)`,
```
And replace the `border` line to add a subtle color ring:
```
border:`1px solid ${pc}33`,
borderLeft:`4px solid ${accentColor}`,
```

**Step 2: Replace the DEALER badge**

Find:
```tsx
{isDealer&&(
  <div style={{position:"absolute",top:0,right:0,
    background:`linear-gradient(135deg,${C.gold},${C.goldD})`,
    color:C.dark,fontSize:9,fontWeight:800,padding:"3px 12px 3px 18px",
    borderBottomLeftRadius:10,letterSpacing:1.5}}>DEALER</div>
)}
```

Replace with:
```tsx
{isDealer&&(
  <div style={{
    position:"absolute",top:10,right:12,
    background:`linear-gradient(135deg,var(--gold-2),var(--gold-3))`,
    color:"var(--bg-base)",fontSize:10,fontWeight:800,
    padding:"3px 10px",borderRadius:20,letterSpacing:"0.1em",
    boxShadow:"var(--shadow-gold)",fontFamily:"system-ui",
    textTransform:"uppercase"
  }}>Dealer</div>
)}
```

**Step 3: Replace the Pending state indicator**

Find: `{hit===null&&<div style={{position:"absolute",top:8,right:isDealer?60:12,fontSize:9,fontWeight:800,letterSpacing:1.5,color:pc,textTransform:"uppercase",animation:"pending-pulse 1.8s ease-in-out infinite"}}>● Pending</div>}`

Replace with (a pulsing full-height overlay on the left border):
```tsx
{hit===null&&<div style={{
  position:"absolute",top:0,left:0,bottom:0,width:4,
  borderRadius:"16px 0 0 16px",
  background:pc,
  animation:"pending-pulse 1.8s ease-in-out infinite"
}}/>}
```

**Step 4: Update Hit/Miss buttons for larger tap targets**

Find the Hit/Miss button row (search for `Hit` and `Miss` button text near `toggleHit`). The buttons should be at least 48px tall:

Update each hit/miss button `padding` to `"14px 0"` and ensure `minHeight:48` is set.

**Step 5: Verify**

Run: `npm run dev` and navigate to play phase.
Check: Each player card has a subtle color tint background. Dealer has a gold pill badge. Unresolved players show a pulsing left-border instead of tiny text. Hit/Miss buttons are generously sized.

**Step 6: Commit**
```bash
git add src/App.tsx
git commit -m "feat: player cards with color tint, gold dealer pill, pulsing pending border"
```

---

## Task 8: Bust Warning Banner

**Files:**
- Modify: `src/App.tsx` — play phase bust banner (search for `/* Bust banner */`)

**Step 1: Find the bust banner div and replace its styles**

Find the outer `<div>` with `background:nomDiff===0?"rgba(192,57,43,.12)"`:

```tsx
<div style={{
  background: nomDiff===0 ? "rgba(239,68,68,.1)" : "var(--bg-raised)",
  border: `1px solid ${nomDiff===0 ? "var(--red-neg)" : "var(--border-subtle)"}`,
  borderRadius:10, padding:"12px 16px", marginBottom:12,
  display:"flex",justifyContent:"space-between",alignItems:"center",
  transition:`border-color var(--dur-mid), background var(--dur-mid)`,
  animation: nomDiff===0 ? "none" : undefined,
}}>
  <div style={{color:"var(--text-1)",fontSize:13,fontFamily:"system-ui"}}>
    Nominated: <strong style={{color:"var(--gold-2)",fontVariantNumeric:"tabular-nums"}}>{tNom}</strong> / {roundCards}
  </div>
  <div style={{color:nomDiff===0?"var(--red-neg)":nomDiff>0?"var(--gold-2)":"var(--green-pos)",fontSize:13,fontWeight:700,fontFamily:"system-ui"}}>
    {nomDiff===0?"⚠ Bust round!":nomDiff>0?`+${nomDiff} over`:`${Math.abs(nomDiff)} under`}
  </div>
</div>
```

**Step 2: Verify**

Run: `npm run dev`, play a round where nominations bust.
Check: Banner turns red with high-contrast `--red-neg` text and solid red border when bust. Clear and unmissable.

**Step 3: Commit**
```bash
git add src/App.tsx
git commit -m "feat: bust banner high-contrast red with solid border and token colors"
```

---

## Task 9: Leaderboard Component

**Files:**
- Modify: `src/App.tsx` — `Leaderboard` component (search for `function Leaderboard`)

**Step 1: Find the `Leaderboard` component**

Locate the leaderboard player rows. Update the rank number, color bar, and score display:

For rank badges (top 3 vs rest):
```tsx
<div style={{
  fontSize: rank <= 3 ? 22 : 15,
  fontWeight: 700,
  fontFamily: rank <= 3 ? "'Playfair Display',serif" : "system-ui",
  color: rank <= 3 ? "var(--gold-2)" : "var(--text-3)",
  width: 32, textAlign:"center", flexShrink:0
}}>{rank}</div>
```

For the player color bar — increase height from 3-4px to 6px:
Find any `height:3` or `height:4` in the leaderboard row and change to `height:6`.

For scores — use `--t-heading` sizing:
```tsx
<div style={{color:"var(--text-1)",fontSize:18,fontWeight:700,fontFamily:"'Playfair Display',serif",fontVariantNumeric:"tabular-nums"}}>{score}</div>
```

**Step 2: Verify**

Run: `npm run dev` and go to the Table tab.
Check: Top 3 ranks are larger gold Playfair numbers. Color bars are 6px. Scores are clearly readable.

**Step 3: Commit**
```bash
git add src/App.tsx
git commit -m "feat: leaderboard with gold top-3 ranks and 6px color bars"
```

---

## Task 10: Playing Cards — Suit Picker Sibling Dimming

**Files:**
- Modify: `src/App.tsx:358-395` (the `TrumpPicker` suit grid)

**Step 1: Add `selected` state to the suit card grid**

The `TrumpPicker` already has a `pending` state. Use it to dim unselected cards.

In the `SUITS.map` inside `TrumpPicker`, update the card `<button>` style to include:
```tsx
opacity: pending && pending !== suit ? 0.4 : 1,
transform: pending === suit ? "scale(1.06)" : pending ? "scale(0.96)" : undefined,
transition: `all var(--dur-mid) var(--ease-spring)`,
boxShadow: pending === suit ? "var(--shadow-gold)" : undefined,
```

Also update the `lg` Card size in `src/App.tsx` (the `S` object in `Card` component):
Find: `lg:{w:72,h:98,fs:40,pip:13,rank:17}`
Replace with: `lg:{w:96,h:128,fs:52,pip:15,rank:20}`

**Step 2: Update suit picker grid layout to support iPad 1×4 row**

Find the suit picker flex container: `<div style={{display:"flex",gap:18,justifyContent:"center",flexWrap:"wrap"}}>`

Add `flexWrap:"nowrap"` inside a media query isn't possible in inline styles, so add a CSS class instead.

Add to the CSS template:
```css
  .suit-grid{display:flex;gap:18px;justify-content:center;flex-wrap:wrap;}
  @media(min-width:768px){.suit-grid{flex-wrap:nowrap;gap:24px;}}
```

And change the div to: `<div className="suit-grid">`

**Step 3: Verify**

Run: `npm run dev` and go to the trump picker.
Check: Selecting a suit dims siblings to 40% opacity. Selected card scales up with gold glow. On iPad viewport, all 4 cards show in a single row.

**Step 4: Commit**
```bash
git add src/App.tsx
git commit -m "feat: trump suit picker with sibling dimming and iPad row layout"
```

---

## Task 11: Setup Screen

**Files:**
- Modify: `src/App.tsx:507-570` (the `Setup` component)

**Step 1: Update input field styles**

Find the player name `<input>` style:
```tsx
style={{flex:1,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,padding:"11px 14px",color:C.cream,fontSize:15,outline:"none",transition:"border-color .2s,box-shadow .2s"}}
```

Replace values:
```tsx
style={{flex:1,background:"var(--bg-raised)",border:"1px solid var(--border-subtle)",borderRadius:10,padding:"12px 16px",color:"var(--text-1)",fontSize:15,outline:"none",transition:`border-color var(--dur-fast),box-shadow var(--dur-fast)`,minHeight:48,fontFamily:"system-ui"}}
```

**Step 2: Update round selector pill buttons**

Find the round selector `{[5,7,10,13].map(r=>...)}` buttons and update:
```tsx
border:`1.5px solid ${rounds===r?"var(--border-strong)":"var(--border-subtle)"}`,
background:rounds===r?"rgba(201,168,76,.1)":"var(--bg-raised)",
color:rounds===r?"var(--gold-1)":"var(--text-2)",
boxShadow:rounds===r?"var(--shadow-gold)":"none",
fontFamily:"system-ui",
```

**Step 3: Update the Add Player button**

Find: `<button onClick={()=>setNames(n=>[...n,""])} style={{...background:"rgba(26,107,60,.1)",border:"1px dashed rgba(26,107,60,.4)"...}}`

Replace border/background:
```tsx
background:"transparent", border:"1px dashed var(--border-mid)", color:"var(--text-2)",
```

**Step 4: Update the Start/Begin game button**

Find the large `<button className="press btn-primary"` near line 565.
Update inline styles to use tokens:
```tsx
border:`1.5px solid ${valid?"var(--border-strong)":"var(--border-subtle)"}`,
color:valid?"var(--gold-1)":"var(--text-3)",
boxShadow:valid?"var(--shadow-gold)":"none",
minHeight:52,
fontFamily:"'Playfair Display',serif",
```

**Step 5: Verify**

Run: `npm run dev`, load the setup screen.
Check: Inputs are dark surface (`--bg-raised`), rounded pill round selectors with gold active state, dashed add-player button, glowing start button.

**Step 6: Commit**
```bash
git add src/App.tsx
git commit -m "feat: setup screen inputs, pill selectors, and CTA with token styles"
```

---

## Task 12: Spin Wheel Screen + Trump Screen

**Files:**
- Modify: `src/App.tsx:778-818` (spin + trump phase rendering in `App`)

**Step 1: Update spin wheel screen background**

Find the spin phase render block (`if(phase==="spin")`). The `Felt` wrapper already uses `--bg-base` now. Update the inner container to add a spotlight effect:

After `<Felt center><style>{CSS}</style>`, add a wrapper div:
```tsx
<div style={{width:"100%",maxWidth:440,textAlign:"center"}} className="fade-up">
  {/* Radial spotlight behind the wheel */}
  <div style={{
    position:"relative",
    background:"radial-gradient(ellipse 80% 60% at 50% 60%, rgba(11,61,30,.7) 0%, transparent 70%)",
    borderRadius:24, padding:"0 0 32px",
  }}>
```
Close the extra div after the `SpinWheel` component.

**Step 2: Update spin wheel size**

In `SpinWheel` component, find: `<canvas ref={canvasRef} width={310} height={310}`
Replace with: `<canvas ref={canvasRef} width={320} height={320}`

And update: `style={{display:"block",maxWidth:"calc(100vw - 80px)",height:"auto"}}`
To: `style={{display:"block",width:"min(320px, calc(100vw - 80px))",height:"auto"}}`

**Step 3: Update heading colors in spin + trump screens to use tokens**

In spin screen: `color:C.gold` → `color:"var(--gold-2)"`
In trump screen: `color:C.cream` → `color:"var(--text-1)"`, `color:C.muted` → `color:"var(--text-2)"`

**Step 4: Add `table` prop to the Trump Picker panel**

In the trump screen, find `<Panel style={{marginBottom:28,padding:"14px 18px"}}>` (the dealer rotation panel).
Change to: `<Panel table style={{marginBottom:28,padding:"14px 18px"}}>`

**Step 5: Verify**

Run: `npm run dev`, spin to dealer, then pick trump.
Check: Wheel has a green radial spotlight behind it on dark background. Trump screen dealer rotation panel has felt surface. Headings use token colors.

**Step 6: Commit**
```bash
git add src/App.tsx
git commit -m "feat: spin wheel spotlight effect and trump screen felt panel"
```

---

## Task 13: Round Summary + End Screen

**Files:**
- Modify: `src/App.tsx` — roundSummary phase render and end phase render (search for `phase==="roundSummary"` and `phase==="end"`)

**Step 1: Update Round Summary screen**

Find the roundSummary phase render. Update the player result rows to use token colors:
- Hit rows: `background:"rgba(34,197,94,.08)"`, `borderLeft:"3px solid var(--green-pos)"`
- Miss rows: `background:"rgba(239,68,68,.08)"`, `borderLeft:"3px solid var(--red-neg)"`
- Rank change badges: green pill `background:"rgba(34,197,94,.15)",color:"var(--green-pos)"` / red pill `background:"rgba(239,68,68,.15)",color:"var(--red-neg)"`
- Score delta: `color:"var(--green-pos)"` for positive, `color:"var(--red-neg)"` for negative

**Step 2: Update End Screen podium**

Find the podium render. Update podium platform backgrounds to use `--bg-table` (felt surface):
Find inline `background` values on podium bars that use green-ish colors and replace with `var(--bg-table)`.

Add border: `border:"1px solid var(--border-mid)"` to each podium platform.

**Step 3: Update Money Settlement panel**

Find `<Panel accent style={{marginTop:18}}>` in the `Money` component.
Update debt amounts: `color:C.redL` → `color:"var(--red-neg)"`
Update player name: `color:C.cream` → `color:"var(--text-1)"`, `fontFamily:"'Playfair Display',serif"`

**Step 4: Update CTAs on end screen**

Find "Play Again" and "New Game" buttons in the end screen render. Ensure they are stacked full-width with `full` prop.

**Step 5: Verify**

Run: `npm run dev`, complete a round and a full game.
Check: Round summary hit/miss rows use `--green-pos`/`--red-neg`. Podium platforms use felt surface. Money settlement text is clearly readable. End screen CTAs are full-width stacked.

**Step 6: Commit**
```bash
git add src/App.tsx
git commit -m "feat: round summary and end screen with token colors and felt podium"
```

---

## Task 14: iPad Media Queries + Animation Tightening

**Files:**
- Modify: `src/App.tsx:24-64` (CSS template literal)

**Step 1: Add iPad media query block to CSS template**

Add at the end of the CSS template (before the closing backtick):
```css
  /* ── iPad layout ── */
  @media(min-width:768px){
    :root{
      --t-display-size: 36px;
    }
    .spin-canvas{width:480px!important;height:480px!important;}
    .max-game-width{max-width:600px!important;}
  }
```

Find the game play container that has `maxWidth:600,margin:"0 auto"` and add `className="max-game-width"` to it.

**Step 2: Tighten animation timing to use tokens**

In the CSS template, update animation classes:

Find: `.fade-up    {animation:fadeUp .32s ease both;}`
Replace: `.fade-up    {animation:fadeUp var(--dur-mid) var(--ease-out) both;}`

Find: `.pop-in     {animation:popIn  .22s cubic-bezier(.34,1.56,.64,1) both;}`
Replace: `.pop-in     {animation:popIn  var(--dur-mid) var(--ease-spring) both;}`

Find: `.glow-txt   {animation:glow 3s ease-in-out infinite;}`
Replace: `.glow-txt   {animation:glow 2s var(--ease-smooth) infinite;}`

Find: `.ripple-btn {animation:ripple 1.8s ease-out infinite;}`
Replace: `.ripple-btn {animation:ripple 1.5s var(--ease-out) infinite;}`

Find: `.slide-in   {animation:slideIn .28s ease both;}`
Replace: `.slide-in   {animation:slideIn var(--dur-mid) var(--ease-out) both;}`

**Step 3: Verify on iPad viewport**

Run: `npm run dev`. Open browser devtools, set viewport to iPad (768×1024).
Check: Font sizes feel slightly larger. Spin wheel canvas is larger. Game panel has more breathing room (600px).

**Step 4: Commit**
```bash
git add src/App.tsx
git commit -m "feat: iPad media queries and consolidated animation timing tokens"
```

---

## Task 15: Final Polish Pass

**Files:**
- Modify: `src/App.tsx` (various small remaining hardcoded color values)

**Step 1: Search for remaining hardcoded color values**

Search for remaining instances of `#c9a84c`, `#0b3d1e`, `#f5f0e8`, `#6a8a6a`, `#c0392b` that were missed in previous tasks.

Run in terminal:
```bash
grep -n "#c9a84c\|#0b3d1e\|#f5f0e8\|#6a8a6a\|#c0392b" src/App.tsx
```

For each remaining instance, replace with the appropriate CSS variable or `C.*` reference (which now maps to the updated value).

**Step 2: Check `::selection` pseudo-element in CSS template**

Find: `::selection{background:#c9a84c33;}`
Replace: `::selection{background:rgba(201,168,76,.2);}`

**Step 3: Update the Nominate screen heading and history tab**

Find nominate screen `<h2>` and remaining `color:C.cream` / `color:C.muted` references in RoundHistory.
Replace with `color:"var(--text-1)"` and `color:"var(--text-2)"` respectively.

**Step 4: Final visual check — run through entire game flow**

Start the app: `npm run dev`
Walk through: Setup → Spin → Trump → Nominate → Play → Round Summary → End.
Verify at each step: dark near-black chrome, felt green only on table surfaces, gold metallics sharp and consistent, no jarring color mismatches.

**Step 5: Commit**
```bash
git add src/App.tsx
git commit -m "feat: polish pass - replace remaining hardcoded colors with design tokens"
```

---

## Execution Checklist

- [ ] Task 1: CSS token foundation (`:root` variables + `C` update)
- [ ] Task 2: App chrome background (`Felt` component)
- [ ] Task 3: Panel components (Table Panel + App Panel)
- [ ] Task 4: Button component (gold metallic gradient)
- [ ] Task 5: Progress bar (8px + round label)
- [ ] Task 6: Nomination chips (fixed 60px flex grid)
- [ ] Task 7: Player cards (color tint, dealer pill, pending border)
- [ ] Task 8: Bust warning banner (high-contrast red)
- [ ] Task 9: Leaderboard (gold ranks, 6px bars)
- [ ] Task 10: Suit picker (sibling dimming, iPad row)
- [ ] Task 11: Setup screen (inputs, pill selectors)
- [ ] Task 12: Spin wheel + trump screen
- [ ] Task 13: Round summary + end screen
- [ ] Task 14: iPad media queries + animation tokens
- [ ] Task 15: Final polish pass
