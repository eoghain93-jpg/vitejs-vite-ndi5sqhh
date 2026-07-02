import { useState, useRef, useEffect, useCallback } from "react";
import { C, WHEEL_HUE } from "../lib/constants";
import { haptic } from "../lib/haptics";
import { Btn, Lbl } from "./primitives";
import { SpinIcon } from "./icons";

function lighten(hex, a) {
  const v=parseInt(hex.slice(1),16);
  const r=Math.min(255,(v>>16)+a), g=Math.min(255,((v>>8)&0xff)+a), b=Math.min(255,(v&0xff)+a);
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
}

function resolvedColors() {
  const s = getComputedStyle(document.documentElement);
  const get = (k: string, fb: string) => (s.getPropertyValue(k).trim() || fb);
  return {
    gold:  get("--gold-2", "#c9a84c"),
    goldL: get("--gold-1", "#f0d080"),
    goldD: get("--gold-3", "#8a6f2e"),
    hub:   "#060e08",
    wheelShadow: get("--wheel-shadow", "rgba(0,0,0,.9)"),
  };
}

// ─── SPIN WHEEL ───────────────────────────────────────────────────────────────
export function SpinWheel({ players, onDone }) {
  const canvasRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const aRef = useRef(0), vRef = useRef(0);
  const n = players.length, slice = (2*Math.PI)/n;

  const draw = useCallback((angle) => {
    const cv=canvasRef.current; if(!cv) return;
    const ctx=cv.getContext("2d");
    const W=cv.width, cx=W/2, cy=W/2, R=cx-14;
    const TC = resolvedColors();
    ctx.clearRect(0,0,W,W);

    // Outer glow ring
    ctx.save();
    ctx.shadowColor=`${TC.gold}66`; ctx.shadowBlur=18;
    ctx.beginPath(); ctx.arc(cx,cy,R+6,0,2*Math.PI);
    ctx.strokeStyle=`${TC.gold}44`; ctx.lineWidth=5; ctx.stroke();
    ctx.restore();

    // Dark base disc
    ctx.save(); ctx.shadowColor=TC.wheelShadow; ctx.shadowBlur=28;
    ctx.beginPath(); ctx.arc(cx,cy,R,0,2*Math.PI); ctx.fillStyle="#081508"; ctx.fill(); ctx.restore();

    // Slices
    players.forEach((name,i)=>{
      const s=angle+i*slice-Math.PI/2, e=s+slice;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,R,s,e); ctx.closePath();
      const g=ctx.createRadialGradient(cx,cy,R*.1,cx,cy,R);
      g.addColorStop(0,lighten(WHEEL_HUE[i%WHEEL_HUE.length],28));
      g.addColorStop(1,WHEEL_HUE[i%WHEEL_HUE.length]);
      ctx.fillStyle=g; ctx.fill();
      // separator line
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+R*Math.cos(s),cy+R*Math.sin(s));
      ctx.strokeStyle="rgba(0,0,0,.3)"; ctx.lineWidth=1.5; ctx.stroke();
      // name
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(s+slice/2); ctx.textAlign="right";
      ctx.fillStyle="#f5f0e8"; ctx.font=`600 ${Math.min(13,108/n)}px 'EB Garamond',serif`;
      ctx.shadowColor="rgba(0,0,0,.95)"; ctx.shadowBlur=5;
      ctx.fillText(name.length>9?name.slice(0,8)+"…":name, R-14, 5);
      ctx.restore();
    });

    // Tick marks on outer ring
    for(let t=0;t<n;t++){
      const ta=angle+t*slice-Math.PI/2;
      ctx.save();
      ctx.translate(cx,cy); ctx.rotate(ta);
      ctx.beginPath(); ctx.moveTo(R+1,0); ctx.lineTo(R+7,0);
      ctx.strokeStyle=TC.gold+"aa"; ctx.lineWidth=2; ctx.stroke();
      ctx.restore();
    }

    // Hub rings
    [22,16,8].forEach((r,i)=>{
      ctx.beginPath(); ctx.arc(cx,cy,r,0,2*Math.PI);
      if(i===0){
        const hg=ctx.createRadialGradient(cx-3,cy-3,0,cx,cy,22);
        hg.addColorStop(0,TC.goldL); hg.addColorStop(1,TC.goldD);
        ctx.fillStyle=hg;
      } else if(i===1){ ctx.fillStyle=TC.hub; }
      else { ctx.fillStyle=TC.gold+"cc"; }
      ctx.fill();
      if(i===0){ctx.strokeStyle="#00000033";ctx.lineWidth=1;ctx.stroke();}
    });

    // Pointer (right side)
    ctx.save(); ctx.shadowColor=TC.gold; ctx.shadowBlur=12;
    ctx.beginPath();
    ctx.moveTo(cx+R+2,cy); ctx.lineTo(cx+R+20,cy-12); ctx.lineTo(cx+R+20,cy+12);
    ctx.closePath(); ctx.fillStyle=TC.gold; ctx.fill();
    // pointer highlight
    ctx.beginPath(); ctx.moveTo(cx+R+6,cy); ctx.lineTo(cx+R+18,cy-7); ctx.lineTo(cx+R+18,cy-3);
    ctx.closePath(); ctx.fillStyle=TC.goldL+"66"; ctx.fill();
    ctx.restore();
  }, [players, n, slice]);

  useEffect(()=>{draw(aRef.current);},[draw]);

  function spin(){
    if(spinning)return;
    setSpinning(true); setResult(null);
    haptic.tap();
    vRef.current=0.25+Math.random()*.24;
    function go(){
      aRef.current+=vRef.current; vRef.current*=.987; draw(aRef.current);
      if(vRef.current>.002) requestAnimationFrame(go);
      else{
        setSpinning(false);
        const norm=((-aRef.current+Math.PI/2)%(2*Math.PI)+2*Math.PI)%(2*Math.PI);
        setResult(players[Math.floor(norm/slice)%n]);
        haptic.success();
      }
    }
    requestAnimationFrame(go);
  }

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:28}}>
      <div className={spinning?"spin-glow":""} style={{borderRadius:"50%"}}>
        <canvas ref={canvasRef} width={320} height={320} role="img" aria-label={`Spin wheel with players: ${players.join(", ")}`} style={{display:"block",width:"min(320px, calc(100vw - 80px))",height:"auto"}}/>
      </div>
      {result ? (
        <div className="pop-in" style={{textAlign:"center"}}>
          <Lbl style={{marginBottom:10,textAlign:"center"}}>First dealer is</Lbl>
          <div className="glow-txt" style={{color:C.gold,fontSize:40,fontWeight:900,fontFamily:"'Playfair Display',serif",marginBottom:24,letterSpacing:-.5}}>{result}</div>
          <Btn v="gold" onClick={()=>onDone(result)}>Start Game →</Btn>
        </div>
      ) : (
        <Btn v="gold" disabled={spinning} onClick={spin} ripple={!spinning}>
          {spinning ? "Spinning…" : <span style={{display:"flex",alignItems:"center",gap:8,justifyContent:"center"}}><SpinIcon size={16}/>Spin for Dealer</span>}
        </Btn>
      )}
    </div>
  );
}
