import { useState } from "react";
import { C, SUITS, SUIT_NAME, SUIT_COLOR, SUIT_BG } from "../lib/constants";
import { STYLES } from "./styles";
import { Btn } from "./primitives";

// ─── TRUMP PICKER ─────────────────────────────────────────────────────────────
export function TrumpPicker({ onPick, onBack=null }) {
  const [pending, setPending] = useState(null);

  if (pending) {
    return (
      <div style={{textAlign:"center"}} className="pop-in">
        <p style={{color:C.muted,fontSize:16,fontStyle:"italic",marginBottom:20,fontFamily:"'EB Garamond',serif"}}>
          Confirm trump suit?
        </p>
        <div style={{display:"flex",justifyContent:"center",marginBottom:28}}>
          <div style={{
            width:100,height:136,borderRadius:14,
            background:`linear-gradient(148deg,#ffffff,${SUIT_BG[pending]})`,
            border:`2.5px solid ${C.gold}`,
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,
            boxShadow:`0 0 0 4px color-mix(in srgb, var(--gold-2) 20%, transparent), 0 12px 36px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.95)`,
            position:"relative",overflow:"hidden"
          }}>
            <div style={{position:"absolute",top:6,left:7,textAlign:"center",lineHeight:1}}>
              <div style={{color:SUIT_COLOR[pending],fontSize:17,fontWeight:800,fontFamily:"'Playfair Display',serif"}}>A</div>
              <div style={{color:SUIT_COLOR[pending],fontSize:12}}>{pending}</div>
            </div>
            <div style={{position:"absolute",bottom:6,right:7,textAlign:"center",lineHeight:1,transform:"rotate(180deg)"}}>
              <div style={{color:SUIT_COLOR[pending],fontSize:17,fontWeight:800,fontFamily:"'Playfair Display',serif"}}>A</div>
              <div style={{color:SUIT_COLOR[pending],fontSize:12}}>{pending}</div>
            </div>
            <span style={{fontSize:48,color:SUIT_COLOR[pending],lineHeight:1}}>{pending}</span>
            <span style={{fontSize:11,color:SUIT_COLOR[pending],fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>{SUIT_NAME[pending]}</span>
          </div>
        </div>
        <div style={{display:"flex",gap:12,justifyContent:"center"}}>
          <Btn v="ghost" onClick={()=>setPending(null)}>← Change</Btn>
          <Btn v="gold" onClick={()=>onPick(pending)}>Confirm {SUIT_NAME[pending]} →</Btn>
        </div>
      </div>
    );
  }

  return (
    <div style={{textAlign:"center"}}>
      <p style={{color:C.muted,fontSize:16,fontStyle:"italic",marginBottom:32,fontFamily:"'EB Garamond',serif"}}>
        Flip the top card — what's the trump suit?
      </p>
      <div className="suit-grid">
        {SUITS.map(suit=>(
          <button key={suit} className="suit-card press" onClick={()=>setPending(suit)} style={{
            width:78,height:104,borderRadius:12,
            background:`linear-gradient(148deg,#ffffff,${SUIT_BG[suit]})`,
            border:"1.5px solid rgba(0,0,0,.12)", cursor:"pointer",
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,
            boxShadow:"0 8px 24px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.95)",
            transition:`all var(--dur-mid) var(--ease-spring)`, position:"relative",overflow:"hidden",
            opacity: pending && pending !== suit ? 0.4 : 1,
            transform: pending === suit ? "scale(1.06)" : pending ? "scale(0.96)" : undefined,
          }}>
            <div style={{position:"absolute",inset:0,background:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='60' height='60' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E")`,pointerEvents:"none"}}/>
            <div style={{position:"absolute",top:5,left:6,textAlign:"center",lineHeight:1}}>
              <div style={{color:SUIT_COLOR[suit],fontSize:15,fontWeight:800,fontFamily:"'Playfair Display',serif"}}>A</div>
              <div style={{color:SUIT_COLOR[suit],fontSize:11}}>{suit}</div>
            </div>
            <div style={{position:"absolute",bottom:5,right:6,textAlign:"center",lineHeight:1,transform:"rotate(180deg)"}}>
              <div style={{color:SUIT_COLOR[suit],fontSize:15,fontWeight:800,fontFamily:"'Playfair Display',serif"}}>A</div>
              <div style={{color:SUIT_COLOR[suit],fontSize:11}}>{suit}</div>
            </div>
            <span style={{fontSize:36,color:SUIT_COLOR[suit],lineHeight:1}}>{suit}</span>
            <span style={{fontSize:9,color:SUIT_COLOR[suit],fontWeight:700,letterSpacing:1,textTransform:"uppercase"}}>{SUIT_NAME[suit]}</span>
          </button>
        ))}
      </div>
      {onBack&&(
        <button onClick={onBack} style={{...STYLES.trump.backBtn, color:"var(--text-2)"}}>← Re-spin for dealer</button>
      )}
    </div>
  );
}
