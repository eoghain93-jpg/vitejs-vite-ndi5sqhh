import { C, SUITS, SUIT_COLOR, SUIT_BG } from "../lib/constants";

// ─── PLAYING CARD ─────────────────────────────────────────────────────────────
export function Card({ suit, size="md", glow=false, rotate=0, style={} }) {
  if (!suit) return null;
  const S = {sm:{w:36,h:50,fs:20,pip:9,rank:11},md:{w:54,h:74,fs:30,pip:11,rank:14},lg:{w:96,h:128,fs:52,pip:15,rank:20}};
  const s = S[size];
  const col = SUIT_COLOR[suit], bg = SUIT_BG[suit];
  return (
    <div style={{
      width:s.w, height:s.h, borderRadius:7, flexShrink:0,
      background:`linear-gradient(150deg,#ffffff,${bg})`,
      border:`1.5px solid ${glow?C.gold:"rgba(0,0,0,0.18)"}`,
      boxShadow:glow
        ?`0 0 0 2.5px color-mix(in srgb, var(--gold-2) 53%, transparent), 0 8px 28px rgba(0,0,0,.65), inset 0 1px 0 rgba(255,255,255,.9)`
        :`0 4px 18px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.9)`,
      position:"relative", overflow:"hidden", transform:`rotate(${rotate}deg)`,
      transition:"box-shadow .2s", ...style
    }}>
      {/* Paper grain */}
      <div style={{position:"absolute",inset:0,background:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='80' height='80' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,pointerEvents:"none"}} />
      {/* Top-left pip */}
      <div style={{position:"absolute",top:3,left:4,lineHeight:1,textAlign:"center"}}>
        <div style={{color:col,fontSize:s.rank,fontWeight:800,fontFamily:"'Playfair Display',serif",lineHeight:1}}>A</div>
        <div style={{color:col,fontSize:s.pip,lineHeight:1}}>{suit}</div>
      </div>
      {/* Bottom-right pip (rotated) */}
      <div style={{position:"absolute",bottom:3,right:4,lineHeight:1,textAlign:"center",transform:"rotate(180deg)"}}>
        <div style={{color:col,fontSize:s.rank,fontWeight:800,fontFamily:"'Playfair Display',serif",lineHeight:1}}>A</div>
        <div style={{color:col,fontSize:s.pip,lineHeight:1}}>{suit}</div>
      </div>
      {/* Centre suit */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}>
        <span style={{fontSize:s.fs,color:col,lineHeight:1}}>{suit}</span>
      </div>
    </div>
  );
}

// ─── CARD FAN (setup header) ──────────────────────────────────────────────────
export function CardFan() {
  const angles = [-18,-7,3,13];
  const offsets = [6,2,-2,6];
  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"flex-end",height:80,marginBottom:20,position:"relative"}}>
      {SUITS.map((s,i)=>(
        <Card key={s} suit={s} size="md" rotate={angles[i]}
          style={{marginLeft:i>0?-18:0, marginBottom:offsets[i], zIndex:i, boxShadow:"0 6px 24px rgba(0,0,0,.7)"}} />
      ))}
    </div>
  );
}
