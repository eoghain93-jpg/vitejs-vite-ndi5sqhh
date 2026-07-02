import { C, PLAYER_COLORS } from "../lib/constants";
import { STYLES } from "./styles";
import { MedalIcon } from "./icons";

// ─── PODIUM ───────────────────────────────────────────────────────────────────
export function Podium({ sorted }) {
  if(sorted.length<1)return null;
  const order=sorted.length>=3?[sorted[1],sorted[0],sorted[2]]:sorted.length===2?[sorted[1],sorted[0]]:sorted;
  const heights=["88px","64px","48px"];
  const positions=sorted.length>=3?[1,0,2]:[1,0];
  return (
    <div style={STYLES.podium.wrap}>
      {order.map((p,vi)=>{
        const rank=positions[vi];
        const h=parseInt(heights[rank]);
        const pc=PLAYER_COLORS[(p.idx??rank)%PLAYER_COLORS.length];
        return (
          <div key={p.name} style={STYLES.podium.col}>
            <div style={{
              ...STYLES.podium.medal,
              background:`linear-gradient(135deg,${pc}33,${pc}11)`,
              border:`2px solid ${pc}66`,
            }}><MedalIcon rank={rank+1} size={rank===0?26:20}/></div>
            <div style={{color:rank===0?C.gold:C.cream,fontSize:rank===0?15:13,fontFamily:"'Playfair Display',serif",fontWeight:rank===0?700:500,textAlign:"center",width:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",padding:"0 4px"}}>{p.name}</div>
            <div style={{color:rank===0?C.gold:C.cream,fontSize:rank===0?20:16,fontWeight:700,fontFamily:"'Playfair Display',serif",fontVariantNumeric:"tabular-nums"}}>{p.score}<span style={{fontSize:10,color:C.muted,marginLeft:2}}>pts</span></div>
            <div style={{
              ...STYLES.podium.platform,
              height:`${h}px`,
              fontSize:rank===0?24:18,
              boxShadow:rank===0?`0 -6px 24px color-mix(in srgb, var(--gold-2) 33%, transparent)`:`0 -2px 10px rgba(0,0,0,.3)`,
              animation:`podiumRise .5s ${rank===0?.05:rank===1?.15:.25}s cubic-bezier(.34,1.3,.64,1) both`
            }}/>
          </div>
        );
      })}
    </div>
  );
}
