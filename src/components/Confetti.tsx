import { useState } from "react";

// ─── CONFETTI ─────────────────────────────────────────────────────────────────
export function Confetti() {
  // Lazy state init: randomised once per mount, stable across re-renders.
  const [pieces]=useState(()=>Array.from({length:60},(_,i)=>({
    x:`${Math.random()*100}%`,
    delay:`${(Math.random()*2.4).toFixed(2)}s`,
    dur:`${(1.9+Math.random()*1.8).toFixed(2)}s`,
    bg:["#c9a84c","#e8c96a","#5ba3e8","#e85b8a","#5bca8a","#e87a4a","#9b6be8"][i%7],
    size:`${5+Math.floor(Math.random()*9)}px`,
    br:i%3<2?"3px":"50%",
  })));
  return(
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:300,overflow:"hidden"}}>
      {pieces.map((p,i)=>(
        <div key={i} style={{
          position:"absolute",top:-16,left:p.x,
          width:p.size,height:p.size,background:p.bg,borderRadius:p.br,
          animation:`confetti ${p.dur} ${p.delay} ease-in both`
        }}/>
      ))}
    </div>
  );
}
