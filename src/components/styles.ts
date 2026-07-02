// ─── STYLES ───────────────────────────────────────────────────────────────────
// Static style objects hoisted out of JSX render (React perf best practice).
// Dynamic values (player color, hit state, active state) remain inline.
export const STYLES = {

  // ── Layout ──────────────────────────────────────────────────────────────────
  felt: {
    base: {
      minHeight:"100vh",
      backgroundColor:"var(--bg-base)",
      backgroundImage:"var(--felt-grad)",
      fontFamily:"system-ui,'Segoe UI',sans-serif",
    },
  },

  divider: {
    wrap:  { display:"flex", alignItems:"center", gap:10, margin:"18px 0" },
    lineL: { flex:1, height:1, background:`linear-gradient(to right,transparent,var(--border-mid))` },
    lineR: { flex:1, height:1, background:`linear-gradient(to left,transparent,var(--border-mid))` },
    dot:   { color:"var(--gold-3)", fontSize:13, lineHeight:1 },
  },

  // ── Core components ──────────────────────────────────────────────────────────
  panel: {
    base: { borderRadius:16, padding:"20px 22px", boxShadow:"var(--shadow-2)" },
  },

  lbl: {
    base: { color:"var(--gold-2)", fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase" as const, fontFamily:"system-ui,'Segoe UI',sans-serif" },
  },

  progress: {
    wrap:     { } as Record<string, never>,
    header:   { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 },
    label:    { color:"var(--text-3)", fontSize:12, fontFamily:"system-ui", letterSpacing:"0.05em", textTransform:"uppercase" as const },
    roundNum: { color:"var(--text-2)", fontSize:12, fontFamily:"system-ui", fontVariantNumeric:"tabular-nums" as const },
    track:    { display:"flex", gap:3, marginBottom:16 },
  },

  // ── Buttons ──────────────────────────────────────────────────────────────────
  btn: {
    base: {
      borderRadius:10, fontWeight:700, cursor:"pointer" as const,
      fontFamily:"system-ui,'Segoe UI',sans-serif", fontSize:15,
      border:"1.5px solid", minHeight:48,
      transition:`all var(--dur-fast) var(--ease-smooth)`,
      letterSpacing:"0.06em", textTransform:"uppercase" as const,
      touchAction:"manipulation" as const,
    },
    disabled: { cursor:"not-allowed" as const, opacity:0.38 },
    def:   { background:"var(--bg-raised)", borderColor:"var(--border-subtle)", color:"var(--text-1)" },
    ghost: { background:"transparent", borderColor:"var(--border-mid)", color:"var(--text-2)" },
    gold:  { borderColor:"var(--border-strong)", color:"var(--gold-1)" },
    red:   { background:"rgba(239,68,68,.1)", borderColor:"rgba(239,68,68,.35)", color:"var(--red-neg)" },
  },

  // ── Setup screen ─────────────────────────────────────────────────────────────
  setup: {
    wrap:        { width:"100%", maxWidth:460 },
    heading:     { textAlign:"center", marginBottom:36 },
    h1:          { fontSize:50, fontWeight:900, fontFamily:"'Playfair Display',serif", letterSpacing:-1 },
    sub:         { fontSize:15, marginTop:8, fontStyle:"italic", fontFamily:"system-ui" },
    playerNum:   { width:22, height:22, borderRadius:"50%", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, flexShrink:0 },
    removeBtn:   { width:44, height:44, background:"rgba(192,57,43,.12)", border:"1px solid rgba(192,57,43,.25)", borderRadius:8, color:"#e07060", cursor:"pointer", fontSize:19, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
    addBtn:      { width:"100%", padding:"10px", background:"transparent", border:"1px dashed var(--border-mid)", borderRadius:10, color:"var(--text-2)", cursor:"pointer", fontSize:13, marginTop:4 },
    stakeWrap:   { display:"flex", alignItems:"center", background:"rgba(255,255,255,.03)", borderRadius:12, border:"1px solid rgba(255,255,255,.1)", overflow:"hidden", marginBottom:6 },
    stakeBtn:    { width:54, height:50, background:"rgba(255,255,255,.03)", border:"none", fontSize:26 },
    stakeBtnL:   { borderRight:"1px solid rgba(255,255,255,.08)" },
    stakeBtnR:   { borderLeft:"1px solid rgba(255,255,255,.08)" },
    stakeVal:    { flex:1, textAlign:"center", color:"var(--gold-2)", fontSize:24, fontWeight:700, fontFamily:"'Playfair Display',serif", fontVariantNumeric:"tabular-nums" },
    stakeHint:   { color:"var(--text-3)", fontSize:11, textAlign:"center", marginBottom:22 },
  },

  // ── Spin screen ──────────────────────────────────────────────────────────────
  spin: {
    wrap:      { width:"100%", maxWidth:440, textAlign:"center" },
    heading:   { fontFamily:"'Playfair Display',serif", fontSize:34, fontWeight:900, marginBottom:6, textShadow:`0 2px 20px rgba(201,168,76,.35)` },
    sub:       { fontSize:16, marginBottom:32, fontStyle:"italic" },
    spotlight: { position:"relative", background:"var(--spotlight-bg)", borderRadius:24, padding:"0 0 32px" },
    result:    { textAlign:"center" },
    resultName:{ fontSize:40, fontWeight:900, fontFamily:"'Playfair Display',serif", marginBottom:24, letterSpacing:-.5 },
  },

  // ── Trump screen ─────────────────────────────────────────────────────────────
  trump: {
    wrap:          { width:"100%", maxWidth:480, textAlign:"center" },
    heading:       { fontFamily:"'Playfair Display',serif", fontSize:34, fontWeight:900, marginBottom:4 },
    sub:           { fontSize:15, marginBottom:10, fontStyle:"italic" },
    dealerPills:   { display:"flex", justifyContent:"center", flexWrap:"wrap", gap:6 },
    dealerPillDef: { padding:"3px 12px", borderRadius:20, fontSize:13, background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", fontWeight:400, fontFamily:"'Playfair Display',serif", boxShadow:"none" },
    separator:     { fontSize:12 },
    backBtn:       { marginTop:12, background:"none", border:"none", cursor:"pointer", fontSize:14, fontFamily:"system-ui", fontStyle:"italic", textDecoration:"underline", minHeight:44, padding:"0 8px", display:"inline-flex", alignItems:"center" },
  },

  // ── Nominate screen ───────────────────────────────────────────────────────────
  nominate: {
    orderPanel:    { marginBottom:14, padding:"12px 16px" },
    orderStrip:    { display:"flex", gap:6, flexWrap:"wrap" },
    ordinal:       { fontSize:9, fontWeight:700, letterSpacing:.5 },
    callerPanel:   { marginBottom:14 },
    callerTop:     { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 },
    callerRight:   { textAlign:"right" },
    callerCount:   { fontSize:12 },
    callerTricks:  { fontSize:19, fontWeight:700, fontFamily:"'Playfair Display',serif" },
    chipsWrap:     { display:"flex", flexWrap:"wrap", gap:8, justifyContent:"center" },
    bustWarning:   { fontSize:12, marginTop:14, background:"rgba(192,57,43,.1)", borderRadius:8, padding:"8px 14px", border:"1px solid rgba(192,57,43,.22)" },
    doneRow:       { display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(255,255,255,.03)", borderRadius:12, padding:"11px 16px", border:"1px solid rgba(255,255,255,.07)" },
    donePlayerName:{ fontSize:14, fontFamily:"'Playfair Display',serif" },
    doneCalledLbl: { fontSize:12 },
    editBtn:       { padding:"10px 14px", minHeight:44, background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.12)", borderRadius:8, cursor:"pointer", fontSize:12 },
  },

  // ── Play screen ───────────────────────────────────────────────────────────────
  play: {
    bustBanner:  { borderRadius:10, padding:"12px 16px", marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center", transition:`border-color var(--dur-mid), background var(--dur-mid)` },
    bustLeft:    { fontSize:13, fontFamily:"system-ui" },
    bustRight:   { fontSize:13, fontWeight:700, fontFamily:"system-ui" },
    cardsWrap:   { display:"flex", flexDirection:"column", gap:9, marginBottom:14 },
    cardInner:   { borderRadius:16, padding:"14px 16px 14px 14px", position:"relative", overflow:"hidden" },
    cardTop:     { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 },
    cardName:    { color:"var(--text-1)", fontSize:16, fontWeight:600, fontFamily:"'Playfair Display',serif" },
    cardScore:   { fontSize:18, fontWeight:700, fontFamily:"'Playfair Display',serif", fontVariantNumeric:"tabular-nums" },
    cardPts:     { fontSize:11, marginLeft:2 },
    cardRight:   { textAlign:"right" },
    cardLbl:     { color:"var(--text-3)", fontSize:9, letterSpacing:1.5, textTransform:"uppercase", fontFamily:"system-ui" },
    cardNom:     { color:"var(--text-1)", fontSize:32, fontWeight:900, fontFamily:"'Playfair Display',serif", lineHeight:1, fontVariantNumeric:"tabular-nums" },
    hitBtns:     { display:"flex", gap:8 },
    hitBtnBase:  { flex:1, padding:"14px 0", borderRadius:10, minHeight:48, fontWeight:400, cursor:"pointer", fontSize:14, transition:`all var(--dur-fast)`, fontFamily:"system-ui" },
    undoRow:     { display:"flex", gap:10, marginBottom:10 },
    endRoundBtn: { flex:1, padding:"16px", borderRadius:14, fontSize:17, fontWeight:800, cursor:"pointer", fontFamily:"'Playfair Display',serif", letterSpacing:.3 },
    confirmTitle:{ fontSize:16, fontWeight:700, marginBottom:6, fontFamily:"'Playfair Display',serif" },
    confirmSub:  { fontSize:13, marginBottom:16, fontStyle:"italic" },
    confirmBtns: { display:"flex", gap:10 },
  },

  // ── Round Summary ─────────────────────────────────────────────────────────────
  summary: {
    wrap:      { width:"100%", maxWidth:500 },
    heading:   { textAlign:"center", marginBottom:24 },
    h2:        { fontFamily:"'Playfair Display',serif", fontSize:30, fontWeight:900, marginBottom:4 },
    sub:       { fontSize:15, fontStyle:"italic" },
    row:       { display:"flex", alignItems:"center", gap:12, padding:"13px 12px", borderRadius:8, marginBottom:4 },
    iconWrap:  { width:28, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
    nameWrap:  { flex:1, minWidth:0 },
    name:      { fontWeight:600, fontSize:15, fontFamily:"'Playfair Display',serif", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
    called:    { fontSize:12, marginTop:1 },
    ptsWrap:   { textAlign:"right", flexShrink:0 },
    pts:       { fontWeight:700, fontSize:19, fontFamily:"'Playfair Display',serif", fontVariantNumeric:"tabular-nums" },
    prevScore: { fontSize:11 },
    rankBadge: { fontSize:11, fontWeight:700, minWidth:28, textAlign:"center", flexShrink:0, animation:"rankIn .35s ease both" },
    next:      { marginTop:18 },
  },

  // ── End screen ───────────────────────────────────────────────────────────────
  end: {
    outer:     { maxWidth:500, margin:"0 auto", padding:"28px 20px", textAlign:"center" },
    h1:        { fontSize:44, fontWeight:900, fontFamily:"'Playfair Display',serif", marginBottom:6 },
    sub:       { fontStyle:"italic", marginBottom:28, fontSize:15 },
    listRow:   { display:"flex", alignItems:"center", gap:12, padding:"12px 4px" },
    listBar:   { width:4, height:28, borderRadius:2, flexShrink:0 },
    listName:  { fontSize:17, fontFamily:"'Playfair Display',serif" },
    listScore: { fontWeight:700, fontSize:21, fontFamily:"'Playfair Display',serif", fontVariantNumeric:"tabular-nums" },
    listPts:   { fontSize:11, marginLeft:2 },
    ctaRow:    { display:"flex", gap:12 },
    confirmTitle:{ fontSize:16, fontWeight:700, marginBottom:6, fontFamily:"'Playfair Display',serif" },
    confirmSub:  { fontSize:13, marginBottom:16, fontStyle:"italic" },
    confirmBtns: { display:"flex", gap:10 },
  },

  // ── Leaderboard ───────────────────────────────────────────────────────────────
  leaderboard: {
    row:       { display:"flex", alignItems:"center", gap:12, padding:"11px 0" },
    colorBar:  { width:4, height:28, borderRadius:2, flexShrink:0, opacity:.85 },
    nameWrap:  { flex:1 },
    name:      { fontSize:15, fontFamily:"'Playfair Display',serif" },
    barTrack:  { height:6, borderRadius:2, background:"rgba(255,255,255,.06)", marginTop:5, overflow:"hidden" },
    score:     { fontSize:18, fontWeight:700, fontFamily:"'Playfair Display',serif", fontVariantNumeric:"tabular-nums" },
    scorePts:  { fontSize:11, marginLeft:2 },
  },

  // ── Round History ─────────────────────────────────────────────────────────────
  history: {
    emptyIcon: { marginBottom:10, opacity:.5, display:"flex", justifyContent:"center" },
    emptyText: { fontSize:15, fontStyle:"italic" },
    roundMeta: { display:"flex", alignItems:"center", gap:10, marginBottom:10 },
    roundLbl:  { fontSize:12, fontWeight:700, letterSpacing:1 },
    roundSub:  { fontSize:12 },
    hitRow:    { display:"flex", alignItems:"center", gap:8, marginBottom:4, padding:"6px 10px", borderRadius:8, background:"rgba(34,197,94,.08)", borderLeft:"3px solid var(--green-pos)" },
    missRow:   { display:"flex", alignItems:"center", gap:8, marginBottom:4, padding:"6px 10px", borderRadius:8, background:"rgba(239,68,68,.08)", borderLeft:"3px solid var(--red-neg)" },
    pName:     { flex:1, fontSize:13, fontFamily:"'Playfair Display',serif" },
    pCalled:   { fontSize:12 },
    pPts:      { fontWeight:700, fontSize:13, minWidth:48, textAlign:"right" },
    editHead:  { display:"flex", alignItems:"center", gap:8, marginLeft:"auto" },
    editRow:   { display:"flex", alignItems:"center", gap:8, marginBottom:6, padding:"8px 10px", borderRadius:8, background:"rgba(255,255,255,.03)", border:"1px solid var(--border-subtle)" },
    stepBtn:   { width:34, height:34, borderRadius:8, border:"1px solid var(--border-mid)", background:"var(--bg-raised)", color:"var(--text-1)", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
    stepVal:   { width:26, textAlign:"center", fontSize:15, fontWeight:700, fontVariantNumeric:"tabular-nums", color:"var(--text-1)" },
    hitToggle: { padding:"7px 12px", borderRadius:8, fontSize:12, cursor:"pointer", minHeight:34, fontFamily:"system-ui" },
    editErr:   { fontSize:12, margin:"8px 0", background:"rgba(239,68,68,.1)", borderRadius:8, padding:"8px 12px", border:"1px solid rgba(239,68,68,.3)", color:"var(--red-neg)" },
    editBtns:  { display:"flex", gap:8, marginTop:10 },
  },

  // ── Money ─────────────────────────────────────────────────────────────────────
  money: {
    headerRow: { display:"flex", alignItems:"center", gap:12, marginBottom:2 },
    avatar:    { width:44, height:44, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
    sub:       { fontSize:12, marginTop:2, fontStyle:"italic" },
    debtRow:   { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0" },
    debtName:  { fontSize:16, fontFamily:"'Playfair Display',serif" },
    debtRight: { textAlign:"right" },
    debtAmt:   { fontWeight:700, fontSize:22, fontFamily:"'Playfair Display',serif", fontVariantNumeric:"tabular-nums" },
    ptsBehind: { fontSize:11 },
    modeRow:   { display:"flex", gap:4, marginTop:14, padding:4, borderRadius:999, background:"var(--bg-raised)", border:"1px solid var(--border-subtle)" },
    modeBtn:   { flex:1, padding:"8px 10px", minHeight:36, borderRadius:999, fontSize:11, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase" as const, fontFamily:"system-ui", cursor:"pointer", transition:"all var(--dur-fast)" },
  },

  // ── Podium ────────────────────────────────────────────────────────────────────
  podium: {
    wrap:     { display:"flex", justifyContent:"center", alignItems:"flex-end", gap:6, marginBottom:28 },
    col:      { display:"flex", flexDirection:"column", alignItems:"center", gap:6, flex:1, maxWidth:120 },
    medal:    { width:36, height:36, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, marginBottom:2 },
    platform: { width:"100%", borderRadius:"10px 10px 0 0", border:"1px solid var(--border-mid)", display:"flex", alignItems:"flex-start", justifyContent:"center", paddingTop:10, background:"var(--bg-table)" },
  },

  // ── Shared header ─────────────────────────────────────────────────────────────
  hdr: {
    wrap:      { padding:"16px 18px 0", maxWidth:600, margin:"0 auto" },
    topRow:    { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 },
    title:     { fontFamily:"'Playfair Display',serif", fontSize:23, fontWeight:900, letterSpacing:-.5 },
    sub:       { fontSize:12 },
    tabRow:    { display:"flex", gap:4 },
  },

  // ── Hall of Fame ──────────────────────────────────────────────────────────────
  fame: {
    wrap:      { width:"100%", maxWidth:520, margin:"0 auto", padding:"28px 20px 48px" },
    heading:   { textAlign:"center", marginBottom:24 },
    h1:        { fontSize:38, fontWeight:900, fontFamily:"'Playfair Display',serif", letterSpacing:-1, marginBottom:4 },
    sub:       { fontSize:14, fontStyle:"italic" },
    row:       { padding:"14px 0" },
    rowTop:    { display:"flex", alignItems:"center", gap:10, marginBottom:8 },
    rank:      { width:26, textAlign:"center", flexShrink:0, fontSize:14, fontWeight:700 },
    name:      { flex:1, fontSize:17, fontWeight:600, fontFamily:"'Playfair Display',serif", color:"var(--text-1)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
    wins:      { fontSize:15, fontWeight:700, fontFamily:"'Playfair Display',serif", fontVariantNumeric:"tabular-nums" },
    statGrid:  { display:"flex", flexWrap:"wrap", gap:"6px 14px", paddingLeft:36 },
    stat:      { fontSize:12, color:"var(--text-2)", fontFamily:"system-ui", fontVariantNumeric:"tabular-nums", display:"flex", alignItems:"center", gap:4 },
    statVal:   { color:"var(--text-1)", fontWeight:700 },
    empty:     { textAlign:"center", padding:"36px 0" },
    footer:    { display:"flex", gap:10, marginTop:22 },
  },

} as const;
