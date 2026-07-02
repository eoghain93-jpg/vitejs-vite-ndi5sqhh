import { STYLES } from "./styles";
import { feltTex } from "../lib/constants";

// ─── FELT BG ──────────────────────────────────────────────────────────────────
export function Felt({ children, center=false, style={} }) {
  return (
    <div style={{
      ...STYLES.felt.base,
      display:center?"flex":undefined, alignItems:center?"center":undefined,
      justifyContent:center?"center":undefined, padding:center?20:undefined,
      ...style
    }}>{children}</div>
  );
}

// ─── DIVIDER ──────────────────────────────────────────────────────────────────
export function Divider({ style={} }) {
  return (
    <div style={{...STYLES.divider.wrap,...style}}>
      <div style={STYLES.divider.lineL}/>
      <span style={STYLES.divider.dot}>✦</span>
      <div style={STYLES.divider.lineR}/>
    </div>
  );
}

// ─── PANEL ────────────────────────────────────────────────────────────────────
export function Panel({ children, accent=false, table=false, style={}, className="" }) {
  const bg = table
    ? `linear-gradient(158deg, #0f4d26 0%, #0b3d1e 100%), ${feltTex}`
    : "var(--bg-surface)";
  const border = accent
    ? "1px solid var(--border-strong)"
    : table
    ? "1px solid var(--border-mid)"
    : "1px solid var(--border-subtle)";
  return (
    <div className={className||undefined} style={{...STYLES.panel.base, background:bg, border, ...style}}>{children}</div>
  );
}

// ─── LABEL ────────────────────────────────────────────────────────────────────
export function Lbl({ children, style={} }) {
  return <div style={{...STYLES.lbl.base,...style}}>{children}</div>;
}

// ─── PROGRESS ─────────────────────────────────────────────────────────────────
export function Progress({ round, total }) {
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

// ─── BTN ──────────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, disabled=false, v="def", full=false, sm=false, ripple=false }) {
  const sizeOverride = sm ? { padding:"10px 18px", fontSize:13, minHeight:40 } : { padding:"14px 28px" };
  const cls = ["press", v==="gold"?"btn-primary":"", ripple&&!disabled?"ripple-btn":""].join(" ");
  return (
    <button disabled={disabled} className={cls} onClick={!disabled?onClick:undefined} style={{
      ...STYLES.btn.base,
      ...STYLES.btn[v as keyof typeof STYLES.btn],
      ...sizeOverride,
      ...(disabled ? STYLES.btn.disabled : {}),
      width:full?"100%":undefined,
    }}>
      {children}
    </button>
  );
}
