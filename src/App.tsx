import { useState, useRef, useEffect } from "react";

// ─── TOKENS ───────────────────────────────────────────────────────────────────
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
const SUITS = ["♠","♥","♦","♣"];
const SUIT_NAME  = {"♠":"Spades","♥":"Hearts","♦":"Diamonds","♣":"Clubs"};
const SUIT_COLOR = {"♠":"#1a1a2e","♥":C.red,"♦":C.red,"♣":"#1a1a2e"};
const SUIT_BG    = {"♠":"#eaecf4","♥":"#fce8e8","♦":"#fce8e8","♣":"#eaecf4"};
const WHEEL_HUE  = ["#1a6b3c","#b8943c","#2c5f8a","#7a3060","#4a7a30","#7a4a20","#325078","#5a3a10"];
const PLAYER_COLORS = ["#c9a84c","#5ba3e8","#e85b8a","#5bca8a","#e87a4a","#9b6be8","#4bcece","#d4c04a"];

const fmtMoney = p => { if(!p)return"0p"; const l=Math.floor(p/100),r=p%100; return l>0?`£${l}.${r.toString().padStart(2,"0")}`:`${p}p`; };
const fmtStake = p => p>=100?`£${(p/100).toFixed(p%100===0?0:2)}`:`${p}p`;
const getRoundCards = (ri,tot) => tot-ri;

// ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
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
  *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;margin:0;padding:0;}
  body{background:var(--bg-base);}
  button,input{font-family:inherit;}
  ::selection{background:#c9a84c33;}

  @keyframes fadeUp   {from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes popIn    {from{opacity:0;transform:scale(0.88)}to{opacity:1;transform:scale(1)}}
  @keyframes shimmer  {0%,100%{background-position:200% center}50%{background-position:0% center}}
  @keyframes ripple   {0%{box-shadow:0 0 0 0 #c9a84c55}100%{box-shadow:0 0 0 14px #c9a84c00}}
  @keyframes glow     {0%,100%{text-shadow:0 0 8px #c9a84c33}50%{text-shadow:0 0 28px #c9a84caa}}
  @keyframes spin-glow{0%,100%{box-shadow:0 0 0 3px #c9a84c33,0 12px 40px #00000088}50%{box-shadow:0 0 0 3px #c9a84c99,0 12px 40px #00000088}}
  @keyframes slideIn  {from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
  @keyframes confetti {0%{transform:translateY(-16px) rotate(0deg);opacity:1}100%{transform:translateY(108vh) rotate(580deg);opacity:0}}
  @keyframes podiumRise{from{transform:scaleY(0);transform-origin:bottom}to{transform:scaleY(1);transform-origin:bottom}}
  @keyframes rankIn   {from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:translateX(0)}}
  @keyframes pending-pulse{0%,100%{opacity:.55}50%{opacity:1}}

  .fade-up    {animation:fadeUp .32s ease both;}
  .pop-in     {animation:popIn  .22s cubic-bezier(.34,1.56,.64,1) both;}
  .glow-txt   {animation:glow 3s ease-in-out infinite;}
  .ripple-btn {animation:ripple 1.8s ease-out infinite;}
  .slide-in   {animation:slideIn .28s ease both;}

  .nom-chip:hover:not(:disabled){transform:scale(1.1)!important;background:var(--bg-raised)!important;border-color:var(--border-strong)!important;box-shadow:var(--shadow-gold)!important;}
  .nom-chip:active:not(:disabled){transform:scale(0.94)!important;}
  .suit-card:hover{transform:translateY(-8px) scale(1.06)!important;box-shadow:0 16px 40px rgba(0,0,0,.75)!important;}
  .suit-card:active{transform:translateY(-3px) scale(1.02)!important;}
  .press:active{transform:scale(0.97)!important;}
  .tab-pill:hover{border-color:var(--border-strong)!important;color:var(--gold-2)!important;}
  .input-field:focus{border-color:var(--border-strong)!important;box-shadow:0 0 0 3px rgba(201,168,76,.08)!important;}

  /* Gold metallic gradient on primary CTA */
  .btn-primary{
    background:linear-gradient(180deg,var(--gold-4) 0%,var(--gold-3) 50%,var(--gold-2) 100%);
  }
  .btn-primary:hover{box-shadow:var(--shadow-gold)!important;filter:brightness(1.12);}
  .btn-primary:active{filter:brightness(0.95);}
`;

// ─── FELT BG ──────────────────────────────────────────────────────────────────
// SVG cross-hatch felt texture
const feltTex = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Cpath d='M0 0L4 4M4 0L0 4' stroke='%23ffffff' stroke-width='0.3' opacity='0.04'/%3E%3C/svg%3E")`;

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

// ─── PLAYING CARD ─────────────────────────────────────────────────────────────
function Card({ suit, size="md", glow, rotate=0, style={} }) {
  if (!suit) return null;
  const S = {sm:{w:36,h:50,fs:20,pip:9,rank:11},md:{w:54,h:74,fs:30,pip:11,rank:14},lg:{w:72,h:98,fs:40,pip:13,rank:17}};
  const s = S[size];
  const col = SUIT_COLOR[suit], bg = SUIT_BG[suit];
  return (
    <div style={{
      width:s.w, height:s.h, borderRadius:7, flexShrink:0,
      background:`linear-gradient(150deg,#ffffff,${bg})`,
      border:`1.5px solid ${glow?C.gold:"rgba(0,0,0,0.18)"}`,
      boxShadow:glow
        ?`0 0 0 2.5px ${C.gold}88, 0 8px 28px rgba(0,0,0,.65), inset 0 1px 0 rgba(255,255,255,.9)`
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
function CardFan() {
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

// ─── DIVIDER ──────────────────────────────────────────────────────────────────
function Divider({ style={} }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:10,margin:"18px 0",...style}}>
      <div style={{flex:1,height:1,background:`linear-gradient(to right,transparent,var(--border-mid))`}}/>
      <span style={{color:"var(--gold-3)",fontSize:13,lineHeight:1}}>✦</span>
      <div style={{flex:1,height:1,background:`linear-gradient(to left,transparent,var(--border-mid))`}}/>
    </div>
  );
}

// ─── PANEL ────────────────────────────────────────────────────────────────────
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

// ─── LABEL ────────────────────────────────────────────────────────────────────
function Lbl({ children, style={} }) {
  return <div style={{color:"var(--gold-2)",fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",fontFamily:"system-ui,'Segoe UI',sans-serif",...style}}>{children}</div>;
}

// ─── PROGRESS ─────────────────────────────────────────────────────────────────
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

// ─── BTN ──────────────────────────────────────────────────────────────────────
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

// ─── SPIN WHEEL ───────────────────────────────────────────────────────────────
function SpinWheel({ players, onDone }) {
  const canvasRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const aRef = useRef(0), vRef = useRef(0);
  const n = players.length, slice = (2*Math.PI)/n;

  function lighten(hex, a) {
    const v=parseInt(hex.slice(1),16);
    const r=Math.min(255,(v>>16)+a), g=Math.min(255,((v>>8)&0xff)+a), b=Math.min(255,(v&0xff)+a);
    return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${b.toString(16).padStart(2,"0")}`;
  }

  function draw(angle) {
    const cv=canvasRef.current; if(!cv) return;
    const ctx=cv.getContext("2d");
    const W=cv.width, cx=W/2, cy=W/2, R=cx-14;
    ctx.clearRect(0,0,W,W);

    // Outer glow ring
    ctx.save();
    ctx.shadowColor="#c9a84c66"; ctx.shadowBlur=18;
    ctx.beginPath(); ctx.arc(cx,cy,R+6,0,2*Math.PI);
    ctx.strokeStyle=`${C.gold}44`; ctx.lineWidth=5; ctx.stroke();
    ctx.restore();

    // Dark base disc
    ctx.save(); ctx.shadowColor="rgba(0,0,0,.9)"; ctx.shadowBlur=28;
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
      ctx.strokeStyle=C.gold+"aa"; ctx.lineWidth=2; ctx.stroke();
      ctx.restore();
    }

    // Hub rings
    [22,16,8].forEach((r,i)=>{
      ctx.beginPath(); ctx.arc(cx,cy,r,0,2*Math.PI);
      if(i===0){
        const hg=ctx.createRadialGradient(cx-3,cy-3,0,cx,cy,22);
        hg.addColorStop(0,C.goldL); hg.addColorStop(1,C.goldD);
        ctx.fillStyle=hg;
      } else if(i===1){ ctx.fillStyle=C.dark; }
      else { ctx.fillStyle=C.gold+"cc"; }
      ctx.fill();
      if(i===0){ctx.strokeStyle="#00000033";ctx.lineWidth=1;ctx.stroke();}
    });

    // Pointer (right side)
    ctx.save(); ctx.shadowColor=C.gold; ctx.shadowBlur=12;
    ctx.beginPath();
    ctx.moveTo(cx+R+2,cy); ctx.lineTo(cx+R+20,cy-12); ctx.lineTo(cx+R+20,cy+12);
    ctx.closePath(); ctx.fillStyle=C.gold; ctx.fill();
    // pointer highlight
    ctx.beginPath(); ctx.moveTo(cx+R+6,cy); ctx.lineTo(cx+R+18,cy-7); ctx.lineTo(cx+R+18,cy-3);
    ctx.closePath(); ctx.fillStyle=C.goldL+"66"; ctx.fill();
    ctx.restore();
  }

  useEffect(()=>{draw(aRef.current);},[players]);

  function spin(){
    if(spinning)return;
    setSpinning(true); setResult(null);
    vRef.current=0.25+Math.random()*.24;
    function go(){
      aRef.current+=vRef.current; vRef.current*=.987; draw(aRef.current);
      if(vRef.current>.002) requestAnimationFrame(go);
      else{
        setSpinning(false);
        const norm=((-aRef.current+Math.PI/2)%(2*Math.PI)+2*Math.PI)%(2*Math.PI);
        setResult(players[Math.floor(norm/slice)%n]);
      }
    }
    requestAnimationFrame(go);
  }

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:28}}>
      <div className={spinning?"spin-glow":""} style={{borderRadius:"50%"}}>
        <canvas ref={canvasRef} width={310} height={310} style={{display:"block",maxWidth:"calc(100vw - 80px)",height:"auto"}}/>
      </div>
      {result ? (
        <div className="pop-in" style={{textAlign:"center"}}>
          <Lbl style={{marginBottom:10,textAlign:"center"}}>First dealer is</Lbl>
          <div className="glow-txt" style={{color:C.gold,fontSize:40,fontWeight:900,fontFamily:"'Playfair Display',serif",marginBottom:24,letterSpacing:-.5}}>{result}</div>
          <Btn v="gold" onClick={()=>onDone(result)}>Start Game →</Btn>
        </div>
      ) : (
        <Btn v="gold" disabled={spinning} onClick={spin} ripple={!spinning}>
          {spinning?"Spinning…":"🎰  Spin for Dealer"}
        </Btn>
      )}
    </div>
  );
}

// ─── TRUMP PICKER ─────────────────────────────────────────────────────────────
function TrumpPicker({ onPick, onBack=null }) {
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
            boxShadow:`0 0 0 4px ${C.gold}33, 0 12px 36px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.95)`,
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
      <div style={{display:"flex",gap:18,justifyContent:"center",flexWrap:"wrap"}}>
        {SUITS.map(suit=>(
          <button key={suit} className="suit-card press" onClick={()=>setPending(suit)} style={{
            width:78,height:104,borderRadius:12,
            background:`linear-gradient(148deg,#ffffff,${SUIT_BG[suit]})`,
            border:"1.5px solid rgba(0,0,0,.12)", cursor:"pointer",
            display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,
            boxShadow:"0 8px 24px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.95)",
            transition:"transform .18s,box-shadow .18s", position:"relative",overflow:"hidden"
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
        <button onClick={onBack} style={{marginTop:24,background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:14,fontFamily:"'EB Garamond',serif",fontStyle:"italic",textDecoration:"underline"}}>← Re-spin for dealer</button>
      )}
    </div>
  );
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────
function Leaderboard({ players, scores }) {
  const sorted=[...players].map((p,i)=>({name:p,score:scores[i],idx:i})).sort((a,b)=>b.score-a.score);
  const maxScore=sorted[0]?.score||1;
  return (
    <Panel>
      <Lbl style={{marginBottom:16}}>🏆 Standings</Lbl>
      {sorted.map((p,i)=>{
        const pc=PLAYER_COLORS[p.idx%PLAYER_COLORS.length];
        return(
          <div key={p.name} className="slide-in" style={{
            display:"flex",alignItems:"center",gap:12,padding:"11px 0",
            borderBottom:i<sorted.length-1?"1px solid rgba(255,255,255,.055)":"none",
            animationDelay:`${i*60}ms`
          }}>
            <div style={{
              width:30,height:30,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,
              background:i===0?`linear-gradient(135deg,${C.gold},${C.goldD})`:i===1?"linear-gradient(135deg,#8a9a9a,#5a6a6a)":i===2?"linear-gradient(135deg,#a0724a,#6a4a2a)":"rgba(255,255,255,.07)",
              color:i<3?C.dark:C.muted, fontSize:11, fontWeight:800,
              boxShadow:i===0?`0 2px 10px ${C.gold}55`:undefined
            }}>{i+1}</div>
            <div style={{width:4,height:28,borderRadius:2,background:pc,flexShrink:0,opacity:.85}}/>
            <div style={{flex:1}}>
              <div style={{color:C.cream,fontSize:15,fontFamily:"'Playfair Display',serif"}}>{p.name}</div>
              <div style={{height:3,borderRadius:2,background:"rgba(255,255,255,.06)",marginTop:5,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${(p.score/maxScore)*100}%`,background:`linear-gradient(to right,${pc}99,${pc})`,transition:"width .6s ease"}}/>
              </div>
            </div>
            <div style={{color:i===0?C.gold:C.cream,fontWeight:700,fontSize:20,fontFamily:"'Playfair Display',serif",fontVariantNumeric:"tabular-nums"}}>
              {p.score}<span style={{fontSize:11,color:C.muted,marginLeft:2}}>pts</span>
            </div>
          </div>
        );
      })}
    </Panel>
  );
}

// ─── ROUND HISTORY ────────────────────────────────────────────────────────────
function RoundHistory({ history, players }) {
  if(!history.length) return (
    <Panel style={{textAlign:"center",padding:40}}>
      <div style={{fontSize:36,marginBottom:10,opacity:.5}}>🃏</div>
      <div style={{color:C.muted,fontSize:15,fontStyle:"italic"}}>No rounds completed yet</div>
    </Panel>
  );
  return (
    <Panel>
      <Lbl style={{marginBottom:16}}>📋 Round History</Lbl>
      {history.map((r,ri)=>(
        <div key={ri} style={{marginBottom:16,paddingBottom:16,borderBottom:ri<history.length-1?"1px solid rgba(255,255,255,.055)":"none"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
            <Card suit={r.trump} size="sm"/>
            <div>
              <div style={{color:C.gold,fontSize:12,fontWeight:700,letterSpacing:1}}>Round {r.round+1}</div>
              <div style={{color:C.muted,fontSize:12}}>{r.roundCards} cards · {SUIT_NAME[r.trump]} trump</div>
            </div>
          </div>
          {players.map((p,pi)=>{
            const nom=r.nominations[pi],hit=r.hits[pi],pts=hit?10+nom:0;
            return(
              <div key={p} style={{
                display:"flex",alignItems:"center",gap:8,marginBottom:4,
                padding:"6px 10px",borderRadius:8,
                background:hit?"rgba(26,107,60,.12)":"rgba(192,57,43,.08)",
                borderLeft:`3px solid ${hit?C.green:C.red}`
              }}>
                <span style={{fontSize:14}}>{hit?"✅":"❌"}</span>
                <div style={{flex:1,color:C.cream,fontSize:13,fontFamily:"'Playfair Display',serif"}}>{p}</div>
                <div style={{color:C.muted,fontSize:12}}>called {nom}</div>
                <div style={{color:hit?C.gold:C.redL,fontWeight:700,fontSize:13,minWidth:48,textAlign:"right"}}>+{pts}pts</div>
              </div>
            );
          })}
        </div>
      ))}
    </Panel>
  );
}

// ─── MONEY SETTLEMENT ─────────────────────────────────────────────────────────
function Money({ players, scores, stake }) {
  const sorted=[...players].map((p,i)=>({name:p,score:scores[i]})).sort((a,b)=>b.score-a.score);
  const w=sorted[0];
  return (
    <Panel accent style={{marginTop:18}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:2}}>
        <div style={{width:44,height:44,borderRadius:"50%",background:`linear-gradient(135deg,${C.gold},${C.goldD})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,boxShadow:`0 4px 16px ${C.gold}44`}}>💰</div>
        <div>
          <Lbl>Owed to {w.name}</Lbl>
          <div style={{color:C.muted,fontSize:12,marginTop:2,fontStyle:"italic"}}>{fmtStake(stake)} per point · winner on {w.score}pts</div>
        </div>
      </div>
      <Divider style={{margin:"14px 0"}}/>
      {sorted.slice(1).map((p,i)=>{
        const diff=w.score-p.score;
        return (
          <div key={p.name} style={{
            display:"flex",justifyContent:"space-between",alignItems:"center",
            padding:"12px 0",borderBottom:i<sorted.length-2?"1px solid rgba(255,255,255,.055)":"none"
          }}>
            <div style={{color:C.cream,fontSize:16,fontFamily:"'Playfair Display',serif"}}>{p.name}</div>
            <div style={{textAlign:"right"}}>
              <div style={{color:C.redL,fontWeight:700,fontSize:22,fontFamily:"'Playfair Display',serif",fontVariantNumeric:"tabular-nums"}}>{fmtMoney(diff*stake)}</div>
              <div style={{color:C.mutedD,fontSize:11}}>{diff} pts behind</div>
            </div>
          </div>
        );
      })}
    </Panel>
  );
}

// ─── SETUP ────────────────────────────────────────────────────────────────────
function Setup({ onStart, initNames, initRounds, initStake }) {
  const [names,setNames]=useState(initNames||["","","","",""]);
  const [rounds,setRounds]=useState(initRounds||10);
  const [stake,setStake]=useState(initStake||5);
  const setN=(i,v)=>setNames(n=>n.map((x,j)=>j===i?v.slice(0,20):x));
  const filled=names.map((n:string)=>n.trim()).filter(Boolean);
  const hasDupes=filled.length!==new Set(filled).size;
  const valid=filled.length>=2&&!hasDupes;

  return (
    <div style={{width:"100%",maxWidth:460}} className="fade-up">
      <div style={{textAlign:"center",marginBottom:36}}>
        <CardFan/>
        <h1 style={{color:C.gold,fontSize:50,fontWeight:900,fontFamily:"'Playfair Display',serif",letterSpacing:-1,textShadow:`0 2px 24px ${C.gold}55,0 0 60px ${C.gold}22`}}>Nominations</h1>
        <p style={{color:C.muted,fontSize:15,marginTop:8,fontStyle:"italic",fontFamily:"'EB Garamond',serif"}}>The trick-taking scoring companion</p>
      </div>
      <Panel>
        <Lbl style={{marginBottom:12}}>
          Players <span style={{color:C.mutedD,textTransform:"none",letterSpacing:0,fontSize:11,fontStyle:"italic"}}>(order = clockwise seating)</span>
        </Lbl>
        {names.map((name,i)=>(
          <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",display:"flex",alignItems:"center",justifyContent:"center",color:C.mutedD,fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</div>
            <input className="input-field" value={name} onChange={e=>setN(i,e.target.value)} placeholder={`Player ${i+1}`}
              style={{flex:1,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,padding:"11px 14px",color:C.cream,fontSize:15,outline:"none",transition:"border-color .2s,box-shadow .2s"}}/>
            {names.length>2&&(
              <button onClick={()=>setNames(n=>n.filter((_,j)=>j!==i))} style={{width:34,height:34,background:"rgba(192,57,43,.12)",border:"1px solid rgba(192,57,43,.25)",borderRadius:8,color:"#e07060",cursor:"pointer",fontSize:19,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>×</button>
            )}
          </div>
        ))}
        {names.length<8&&(
          <button onClick={()=>setNames(n=>[...n,""])} style={{width:"100%",padding:"10px",background:"rgba(26,107,60,.1)",border:"1px dashed rgba(26,107,60,.4)",borderRadius:10,color:C.muted,cursor:"pointer",fontSize:13,marginTop:4}}>＋ Add Player</button>
        )}
        {hasDupes&&(
          <div style={{color:C.redL,fontSize:12,marginTop:8,padding:"7px 12px",background:"rgba(192,57,43,.1)",borderRadius:8,border:"1px solid rgba(192,57,43,.22)"}}>⚠ Player names must be unique</div>
        )}
        <Divider/>
        <Lbl style={{marginBottom:10}}>Rounds</Lbl>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          {[5,7,10,13].map(r=>(
            <button key={r} onClick={()=>setRounds(r)} className="press" style={{
              flex:1,padding:"12px 0",borderRadius:10,
              border:`1.5px solid ${rounds===r?C.gold:"rgba(255,255,255,.1)"}`,
              background:rounds===r?"rgba(201,168,76,.12)":"rgba(255,255,255,.03)",
              color:rounds===r?C.gold:C.cream,fontWeight:rounds===r?700:400,
              cursor:"pointer",fontSize:17,fontFamily:"'Playfair Display',serif",
              transition:"all .15s",boxShadow:rounds===r?`0 0 14px ${C.gold}22`:"none"
            }}>{r}</button>
          ))}
        </div>
        <Lbl style={{marginBottom:10}}>Stake per point</Lbl>
        <div style={{display:"flex",alignItems:"center",background:"rgba(255,255,255,.03)",borderRadius:12,border:"1px solid rgba(255,255,255,.1)",overflow:"hidden",marginBottom:6}}>
          <button onClick={()=>setStake(s=>Math.max(5,s-5))} disabled={stake<=5} className="press" style={{width:54,height:50,background:"rgba(255,255,255,.03)",border:"none",borderRight:"1px solid rgba(255,255,255,.08)",color:stake<=5?C.mutedD:C.cream,fontSize:26,cursor:stake<=5?"not-allowed":"pointer"}}>−</button>
          <div style={{flex:1,textAlign:"center",color:C.gold,fontSize:24,fontWeight:700,fontFamily:"'Playfair Display',serif",fontVariantNumeric:"tabular-nums"}}>{fmtStake(stake)}</div>
          <button onClick={()=>setStake(s=>s+5)} className="press" style={{width:54,height:50,background:"rgba(255,255,255,.03)",border:"none",borderLeft:"1px solid rgba(255,255,255,.08)",color:C.cream,fontSize:26,cursor:"pointer"}}>+</button>
        </div>
        <div style={{color:C.mutedD,fontSize:11,textAlign:"center",marginBottom:22}}>multiples of 5p</div>
        <button className="press btn-primary" onClick={()=>valid&&onStart(names.filter(n=>n.trim()),rounds,stake)} style={{
          width:"100%",padding:"16px",borderRadius:14,border:`1.5px solid ${valid?C.gold:"rgba(255,255,255,.06)"}`,
          color:valid?C.gold:C.mutedD,fontSize:18,fontWeight:800,cursor:valid?"pointer":"not-allowed",
          fontFamily:"'Playfair Display',serif",letterSpacing:.5,
          boxShadow:valid?`0 6px 28px ${C.gold}28`:"none",transition:"box-shadow .2s"
        }}>Continue →</button>
      </Panel>
    </div>
  );
}

// ─── ROUND SUMMARY ────────────────────────────────────────────────────────────
function RoundSummary({ players, nominations, hits, scores, prevScores, round, trump, onNext, isLast }) {
  const rankBefore=[...players].map((p,i)=>({name:p,score:prevScores[i]})).sort((a,b)=>b.score-a.score).map(p=>p.name);
  const rankAfter=[...players].map((p,i)=>({name:p,score:scores[i]})).sort((a,b)=>b.score-a.score).map(p=>p.name);
  return (
    <Felt center>
      <div style={{width:"100%",maxWidth:500}} className="fade-up">
        <div style={{textAlign:"center",marginBottom:24}}>
          <Card suit={trump} size="lg" glow style={{margin:"0 auto"}}/>
          <Lbl style={{textAlign:"center",marginTop:16,marginBottom:8}}>Round {round+1} Complete</Lbl>
          <h2 style={{color:C.cream,fontFamily:"'Playfair Display',serif",fontSize:30,fontWeight:900,marginBottom:4}}>Round Summary</h2>
          <div style={{color:C.muted,fontSize:15,fontStyle:"italic"}}>{SUIT_NAME[trump]} was trump</div>
        </div>
        <Panel>
          {players.map((name,i)=>{
            const nom=nominations[i],hit=hits[i],gained=hit?10+nom:0;
            const pc=PLAYER_COLORS[i%PLAYER_COLORS.length];
            const posB=rankBefore.indexOf(name),posA=rankAfter.indexOf(name),delta=posB-posA;
            return (
              <div key={name} className="slide-in" style={{
                display:"flex",alignItems:"center",gap:12,padding:"13px 0",
                borderBottom:i<players.length-1?"1px solid rgba(255,255,255,.055)":"none",
                animationDelay:`${i*70}ms`
              }}>
                <div style={{width:4,alignSelf:"stretch",borderRadius:2,background:pc,flexShrink:0}}/>
                <div style={{fontSize:22,width:28,textAlign:"center",flexShrink:0}}>{hit?"✅":"❌"}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:C.cream,fontWeight:600,fontSize:15,fontFamily:"'Playfair Display',serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{name}</div>
                  <div style={{color:C.muted,fontSize:12,marginTop:1}}>Called <strong style={{color:pc}}>{nom}</strong> · {hit?"Hit!":"Missed"}</div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{color:hit?C.gold:C.redL,fontWeight:700,fontSize:19,fontFamily:"'Playfair Display',serif",fontVariantNumeric:"tabular-nums"}}>+{gained}pts</div>
                  <div style={{color:C.mutedD,fontSize:11}}>{prevScores[i]} → <span style={{color:C.cream}}>{scores[i]}</span></div>
                </div>
                {players.length>1&&(
                  <div className="rank-in" style={{
                    fontSize:11,fontWeight:700,minWidth:28,textAlign:"center",flexShrink:0,
                    color:delta>0?"#5bca8a":delta<0?C.redL:C.mutedD,
                    animation:"rankIn .35s ease both",animationDelay:`${i*70+200}ms`
                  }}>
                    {delta>0?`↑${delta}`:delta<0?`↓${Math.abs(delta)}`:"–"}
                  </div>
                )}
              </div>
            );
          })}
        </Panel>
        <div style={{marginTop:18}}><Btn v="gold" full onClick={onNext}>{isLast?"See Final Results →":"Next Round →"}</Btn></div>
      </div>
    </Felt>
  );
}

// ─── CONFETTI ─────────────────────────────────────────────────────────────────
function Confetti() {
  const pieces=Array.from({length:60},(_,i)=>({
    x:`${Math.random()*100}%`,
    delay:`${(Math.random()*2.4).toFixed(2)}s`,
    dur:`${(1.9+Math.random()*1.8).toFixed(2)}s`,
    bg:["#c9a84c","#e8c96a","#5ba3e8","#e85b8a","#5bca8a","#e87a4a","#9b6be8"][i%7],
    size:`${5+Math.floor(Math.random()*9)}px`,
    br:i%3<2?"3px":"50%",
  }));
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

// ─── PODIUM ───────────────────────────────────────────────────────────────────
function Podium({ sorted }) {
  if(sorted.length<1)return null;
  const order=sorted.length>=3?[sorted[1],sorted[0],sorted[2]]:sorted.length===2?[sorted[1],sorted[0]]:sorted;
  const heights=["88px","64px","48px"];
  const medalColors=[`linear-gradient(160deg,${C.gold},${C.goldD})`,`linear-gradient(160deg,#9aacac,#5a6a6a)`,`linear-gradient(160deg,#b0824a,#6a4a2a)`];
  const positions=sorted.length>=3?[1,0,2]:[1,0];
  return (
    <div style={{display:"flex",justifyContent:"center",alignItems:"flex-end",gap:6,marginBottom:28}}>
      {order.map((p,vi)=>{
        const rank=positions[vi];
        const h=parseInt(heights[rank]);
        const pc=PLAYER_COLORS[(p.idx??rank)%PLAYER_COLORS.length];
        return (
          <div key={p.name} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,flex:1,maxWidth:120}}>
            <div style={{
              width:36,height:36,borderRadius:"50%",
              background:`linear-gradient(135deg,${pc}33,${pc}11)`,
              border:`2px solid ${pc}66`,
              display:"flex",alignItems:"center",justifyContent:"center",
              fontSize:18,marginBottom:2
            }}>{["🥇","🥈","🥉"][rank]}</div>
            <div style={{color:rank===0?C.gold:C.cream,fontSize:rank===0?15:13,fontFamily:"'Playfair Display',serif",fontWeight:rank===0?700:500,textAlign:"center",width:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",padding:"0 4px"}}>{p.name}</div>
            <div style={{color:rank===0?C.gold:C.cream,fontSize:rank===0?20:16,fontWeight:700,fontFamily:"'Playfair Display',serif",fontVariantNumeric:"tabular-nums"}}>{p.score}<span style={{fontSize:10,color:C.muted,marginLeft:2}}>pts</span></div>
            <div style={{
              width:"100%", height:`${h}px`,
              background:medalColors[rank],
              borderRadius:"10px 10px 0 0",
              display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:10,
              fontSize:rank===0?24:18,
              boxShadow:rank===0?`0 -6px 24px ${C.gold}55`:`0 -2px 10px rgba(0,0,0,.3)`,
              animation:`podiumRise .5s ${rank===0?.05:rank===1?.15:.25}s cubic-bezier(.34,1.3,.64,1) both`
            }}/>
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [phase,setPhase]=useState("setup");
  const [players,setPlayers]=useState([]);
  const [totalRounds,setTotalRounds]=useState(10);
  const [stakePerPoint,setStakePerPoint]=useState(5);
  const [round,setRound]=useState(0);
  const [dealerIdx,setDealerIdx]=useState(0);
  const [scores,setScores]=useState([]);
  const [trump,setTrump]=useState(null);
  const [history,setHistory]=useState([]);
  const [noms,setNoms]=useState([]);
  const [nomIdx,setNomIdx]=useState(0);
  const [hits,setHits]=useState([]);
  const [prevScores,setPrevScores]=useState([]);
  const [tab,setTab]=useState("game");
  const [confirmEnd,setConfirmEnd]=useState(false);
  const [confirmPlayAgain,setConfirmPlayAgain]=useState(false);

  const roundCards=getRoundCards(round,totalRounds);

  const nomOrder=(dealer,cnt)=>Array.from({length:cnt},(_,i)=>(dealer+1+i)%cnt);
  const allNominated=()=>noms.every(n=>n!==null);
  const allResolved=()=>allNominated()&&hits.every(h=>h!==null);
  const totalNom=()=>noms.reduce((s,n)=>s+(n??0),0);

  function getBusted(pi){
    if(pi!==dealerIdx)return[];
    const others=noms.reduce((s,n,i)=>i!==dealerIdx?s+(n??0):s,0);
    const f=roundCards-others;
    return f>=0&&f<=roundCards?[f]:[];
  }

  function startGame(pl,rnds,stk){setPlayers(pl);setTotalRounds(rnds);setStakePerPoint(stk);setScores(Array(pl.length).fill(0));setHistory([]);setPhase("spin");}

  function afterSpin(name){
    const idx=players.indexOf(name); setDealerIdx(idx);
    beginRound(0,idx,Array(players.length).fill(0));
  }

  function beginRound(r,dealer,curScores){
    setRound(r);setDealerIdx(dealer);
    setNoms(Array(players.length).fill(null));setHits(Array(players.length).fill(null));
    setTrump(null);setTab("game");setConfirmEnd(false);setPrevScores(curScores);
    setNomIdx(nomOrder(dealer,players.length)[0]);setPhase("trump");
  }

  function pickTrump(s){setTrump(s);setPhase("nominate");}

  function submitNom(pi,val){
    setNoms(prev=>prev.map((x,j)=>j===pi?val:x));
    const order=nomOrder(dealerIdx,players.length);
    const pos=order.indexOf(pi);
    if(pos<order.length-1)setNomIdx(order[pos+1]);
    else setPhase("play");
  }

  function changeNom(pi){
    const order=nomOrder(dealerIdx,players.length);
    const pos=order.indexOf(pi);
    setNoms(prev=>prev.map((x,j)=>order.indexOf(j)>=pos?null:x));
    setNomIdx(pi);setPhase("nominate");
  }

  function toggleHit(i,val){setHits(prev=>prev.map((x,j)=>j===i?(x===val?null:val):x));}
  function undoHit(){for(let i=hits.length-1;i>=0;i--){if(hits[i]!==null){setHits(prev=>prev.map((x,j)=>j===i?null:x));return;}}}

  function endRound(){
    const ns=scores.map((s,i)=>s+(hits[i]?10+noms[i]:0));
    setHistory(h=>[...h,{round,roundCards,trump,nominations:[...noms],hits:[...hits]}]);
    setScores(ns);setPrevScores(scores);setConfirmEnd(false);setPhase("roundSummary");
  }

  function afterSummary(){
    if(round+1>=totalRounds){setPhase("end");return;}
    const nd=(dealerIdx+1)%players.length;
    beginRound(round+1,nd,scores);
  }

  // ── SETUP ──
  if(phase==="setup")return(
    <Felt center><style>{CSS}</style>
      <Setup onStart={startGame} initNames={players.length?players:null} initRounds={totalRounds} initStake={stakePerPoint}/>
    </Felt>
  );

  // ── SPIN ──
  if(phase==="spin")return(
    <Felt center><style>{CSS}</style>
      <div style={{width:"100%",maxWidth:440,textAlign:"center"}} className="fade-up">
        <h2 style={{color:C.gold,fontFamily:"'Playfair Display',serif",fontSize:34,fontWeight:900,marginBottom:6,textShadow:`0 2px 20px ${C.gold}55`}}>Who deals first?</h2>
        <p style={{color:C.muted,fontSize:16,marginBottom:32,fontStyle:"italic"}}>Spin the wheel to decide</p>
        <SpinWheel players={players} onDone={afterSpin}/>
      </div>
    </Felt>
  );

  // ── TRUMP ──
  if(phase==="trump")return(
    <Felt center><style>{CSS}</style>
      <div style={{width:"100%",maxWidth:480,textAlign:"center"}} className="fade-up">
        <Lbl style={{textAlign:"center",marginBottom:8}}>Round {round+1} of {totalRounds}</Lbl>
        <h2 style={{color:C.cream,fontFamily:"'Playfair Display',serif",fontSize:34,fontWeight:900,marginBottom:4}}>{roundCards} cards dealt</h2>
        <p style={{color:C.muted,fontSize:15,marginBottom:10,fontStyle:"italic"}}>{players[dealerIdx]} is dealing</p>
        <Panel style={{marginBottom:28,padding:"14px 18px"}}>
          <Lbl style={{marginBottom:10,textAlign:"center"}}>Dealer rotation this game</Lbl>
          <div style={{display:"flex",justifyContent:"center",flexWrap:"wrap",gap:6}}>
            {players.map((p,i)=>(
              <div key={p} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{
                  padding:"3px 12px",borderRadius:20,fontSize:13,
                  background:i===dealerIdx?"rgba(201,168,76,.16)":"rgba(255,255,255,.04)",
                  border:`1px solid ${i===dealerIdx?C.gold+"55":"rgba(255,255,255,.08)"}`,
                  color:i===dealerIdx?C.gold:C.cream,
                  fontWeight:i===dealerIdx?700:400,
                  fontFamily:"'Playfair Display',serif",
                  boxShadow:i===dealerIdx?`0 0 10px ${C.gold}22`:"none"
                }}>{p}{i===dealerIdx?" 🂡":""}</div>
                {i<players.length-1&&<span style={{color:C.mutedD,fontSize:12}}>›</span>}
              </div>
            ))}
          </div>
        </Panel>
        <TrumpPicker onPick={pickTrump} onBack={round===0?()=>setPhase("spin"):null}/>
      </div>
    </Felt>
  );

  // ── ROUND SUMMARY ──
  if(phase==="roundSummary")return(
    <><style>{CSS}</style>
      <RoundSummary players={players} nominations={noms} hits={hits} scores={scores}
        prevScores={prevScores} round={round} trump={trump} onNext={afterSummary} isLast={round+1>=totalRounds}/>
    </>
  );

  // ── END ──
  if(phase==="end"){
    const sorted=[...players].map((p,i)=>({name:p,score:scores[i],idx:i})).sort((a,b)=>b.score-a.score);
    return(
      <Felt style={{paddingBottom:48}}><style>{CSS}</style>
        <Confetti/>
        <div style={{maxWidth:500,margin:"0 auto",padding:"28px 20px",textAlign:"center"}} className="fade-up">
          <Lbl style={{textAlign:"center",marginBottom:10}}>Game Over</Lbl>
          <h1 style={{color:C.gold,fontSize:44,fontWeight:900,fontFamily:"'Playfair Display',serif",textShadow:`0 2px 28px ${C.gold}66`,marginBottom:6}}>Final Standings</h1>
          <p style={{color:C.muted,fontStyle:"italic",marginBottom:28,fontSize:15}}>{totalRounds} rounds played</p>
          <Podium sorted={sorted}/>
          {/* Full list */}
          <Panel style={{marginBottom:0,textAlign:"left"}}>
            {sorted.map((p,i)=>{
              const pc=PLAYER_COLORS[p.idx%PLAYER_COLORS.length];
              return(
                <div key={p.name} className="slide-in" style={{display:"flex",alignItems:"center",gap:12,padding:"12px 4px",borderBottom:i<sorted.length-1?"1px solid rgba(255,255,255,.055)":"none",animationDelay:`${i*60}ms`}}>
                  <div style={{fontSize:i<3?22:14,width:30,textAlign:"center",color:i<3?"inherit":C.muted,flexShrink:0}}>
                    {i<3?["🥇","🥈","🥉"][i]:i+1}
                  </div>
                  <div style={{width:4,height:28,borderRadius:2,background:pc,flexShrink:0}}/>
                  <div style={{flex:1,color:C.cream,fontSize:17,fontFamily:"'Playfair Display',serif"}}>{p.name}</div>
                  <div style={{color:i===0?C.gold:C.cream,fontWeight:700,fontSize:21,fontFamily:"'Playfair Display',serif",fontVariantNumeric:"tabular-nums"}}>
                    {p.score}<span style={{fontSize:11,color:C.muted,marginLeft:2}}>pts</span>
                  </div>
                </div>
              );
            })}
          </Panel>
          <Money players={players} scores={scores} stake={stakePerPoint}/>
          <Divider/>
          {confirmPlayAgain?(
            <Panel accent>
              <div style={{color:C.cream,fontSize:16,fontWeight:700,marginBottom:6,fontFamily:"'Playfair Display',serif"}}>Play again with same players?</div>
              <div style={{color:C.muted,fontSize:13,marginBottom:16,fontStyle:"italic"}}>Scores will reset to zero.</div>
              <div style={{display:"flex",gap:10}}>
                <Btn v="ghost" full onClick={()=>setConfirmPlayAgain(false)}>Cancel</Btn>
                <Btn v="gold" full onClick={()=>{setConfirmPlayAgain(false);setScores(Array(players.length).fill(0));setHistory([]);setPhase("spin");}}>Confirm →</Btn>
              </div>
            </Panel>
          ):(
            <div style={{display:"flex",gap:12}}>
              <Btn v="ghost" full onClick={()=>setConfirmPlayAgain(true)}>Play Again</Btn>
              <Btn v="gold" full onClick={()=>setPhase("setup")}>New Game</Btn>
            </div>
          )}
        </div>
      </Felt>
    );
  }

  // ── SHARED HEADER ──
  const Hdr=()=>(
    <div style={{padding:"16px 18px 0",maxWidth:600,margin:"0 auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div>
          <div style={{color:C.gold,fontFamily:"'Playfair Display',serif",fontSize:23,fontWeight:900,letterSpacing:-.5,textShadow:`0 1px 14px ${C.gold}33`}}>Nominations</div>
          <div style={{color:C.muted,fontSize:12}}>
            Round {round+1} of {totalRounds} · {roundCards} cards
            {trump&&<> · Trump: <span style={{color:SUIT_COLOR[trump],fontWeight:700}}>{trump}</span></>}
          </div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {trump&&<Card suit={trump} size="sm" glow/>}
          {phase==="play"&&(
            <div style={{display:"flex",gap:4}}>
              {[["game","🃏"],["table","🏆"],["history","📋"]].map(([t,ic])=>(
                <button key={t} className="tab-pill press" onClick={()=>setTab(t)} style={{
                  padding:"6px 11px",fontSize:12,borderRadius:9,cursor:"pointer",
                  background:tab===t?"rgba(201,168,76,.14)":"rgba(0,0,0,.3)",
                  border:`1px solid ${tab===t?C.gold:"rgba(255,255,255,.1)"}`,
                  color:tab===t?C.gold:C.muted,transition:"all .15s"
                }}>{ic}</button>
              ))}
            </div>
          )}
        </div>
      </div>
      <Progress round={round} total={totalRounds}/>
    </div>
  );

  // ── NOMINATE ──
  if(phase==="nominate"){
    const order=nomOrder(dealerIdx,players.length);
    const isDealer=nomIdx===dealerIdx;
    const busted=getBusted(nomIdx);
    const doneCount=noms.filter(n=>n!==null).length;

    return(
      <Felt style={{paddingBottom:48}}><style>{CSS}</style>
        <Hdr/>
        <div style={{maxWidth:600,margin:"0 auto",padding:"0 18px"}}>
          {/* Order strip */}
          <Panel style={{marginBottom:14,padding:"12px 16px"}}>
            <Lbl style={{marginBottom:10}}>Nomination order</Lbl>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {order.map((pi,pos)=>{
                const done=noms[pi]!==null, active=pi===nomIdx;
                const ordinal=["1st","2nd","3rd"][pos]||(pos+1)+"th";
                return(
                  <div key={pi} style={{display:"flex",alignItems:"center",gap:4}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
                      <span style={{color:active?C.gold:done?C.green:C.mutedD,fontSize:9,fontWeight:700,letterSpacing:.5}}>{ordinal}</span>
                      <div style={{
                        padding:"4px 13px",borderRadius:20,fontSize:12,transition:"all .2s",
                        background:active?"rgba(201,168,76,.2)":done?"rgba(26,107,60,.22)":"rgba(255,255,255,.04)",
                        border:`1px solid ${active?C.gold:done?C.green+"88":"rgba(255,255,255,.08)"}`,
                        color:active?C.gold:done?"#7ac47a":C.mutedD,fontWeight:active?700:400,
                        boxShadow:active?`0 0 12px ${C.gold}22`:"none"
                      }}>{players[pi]}{done?` — ${noms[pi]}`:""}{pi===dealerIdx?" 🂡":""}</div>
                    </div>
                    {pos<order.length-1&&<span style={{color:"#2a3a2a",fontSize:12,marginTop:12}}>›</span>}
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* Active caller */}
          <Panel accent style={{marginBottom:14}} className="pop-in">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}>
              <div>
                <Lbl style={{marginBottom:6}}>
                  {isDealer?"Dealer's call":"Your call"}
                  {isDealer&&<span style={{color:C.redL,marginLeft:8,fontSize:10}}>· total can't equal {roundCards}</span>}
                </Lbl>
                <div style={{color:C.cream,fontSize:28,fontWeight:700,fontFamily:"'Playfair Display',serif",lineHeight:1.1}}>{players[nomIdx]}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{color:C.muted,fontSize:12}}>{doneCount} of {players.length} called</div>
                <div style={{color:C.cream,fontSize:19,fontWeight:700,fontFamily:"'Playfair Display',serif"}}>{roundCards} tricks</div>
              </div>
            </div>
            <Lbl style={{marginBottom:12}}>How many tricks will you win?</Lbl>
            <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center"}}>
              {Array.from({length:roundCards+1},(_,i)=>{
                const bad=busted.includes(i);
                return(
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
                    <span>{i}</span>
                    {!bad&&<span style={{fontSize:9,color:"var(--text-3)",fontWeight:400}}>+{10+i}pts</span>}
                  </button>
                );
              })}
            </div>
            {isDealer&&busted.length>0&&(
              <div style={{color:C.redL,fontSize:12,marginTop:14,background:"rgba(192,57,43,.1)",borderRadius:8,padding:"8px 14px",border:"1px solid rgba(192,57,43,.22)"}}>
                ⚠ You can't call {busted[0]} — that would make the total equal the tricks available
              </div>
            )}
          </Panel>

          {/* Done list */}
          {noms.some(n=>n!==null)&&(
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {order.filter(pi=>noms[pi]!==null).map(pi=>(
                <div key={pi} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(255,255,255,.03)",borderRadius:12,padding:"11px 16px",border:"1px solid rgba(255,255,255,.07)"}}>
                  <div>
                    <div style={{color:C.cream,fontSize:14,fontFamily:"'Playfair Display',serif"}}>{players[pi]}</div>
                    <div style={{color:C.muted,fontSize:12}}>Called <strong style={{color:C.gold}}>{noms[pi]}</strong></div>
                  </div>
                  <button onClick={()=>changeNom(pi)} style={{padding:"5px 14px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.12)",borderRadius:8,color:C.muted,cursor:"pointer",fontSize:12}}>Edit</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Felt>
    );
  }

  // ── PLAY ──
  const tNom=totalNom(), nomDiff=tNom-roundCards, anyHit=hits.some(h=>h!==null);

  return(
    <Felt style={{paddingBottom:60}}><style>{CSS}</style>
      <Hdr/>
      <div style={{maxWidth:600,margin:"0 auto",padding:"0 18px"}}>
        {tab==="table"  &&<Leaderboard players={players} scores={scores}/>}
        {tab==="history"&&<RoundHistory history={history} players={players}/>}
        {tab==="game"&&(
          <>
            {/* Bust banner */}
            <div style={{
              background: nomDiff===0 ? "rgba(239,68,68,.1)" : "var(--bg-raised)",
              border: `1px solid ${nomDiff===0 ? "var(--red-neg)" : "var(--border-subtle)"}`,
              borderRadius:10, padding:"12px 16px", marginBottom:12,
              display:"flex",justifyContent:"space-between",alignItems:"center",
              transition:`border-color var(--dur-mid), background var(--dur-mid)`,
            }}>
              <div style={{color:"var(--text-1)",fontSize:13,fontFamily:"system-ui"}}>
                Nominated: <strong style={{color:"var(--gold-2)",fontVariantNumeric:"tabular-nums"}}>{tNom}</strong> / {roundCards}
              </div>
              <div style={{color:nomDiff===0?"var(--red-neg)":nomDiff>0?"var(--gold-2)":"var(--green-pos)",fontSize:13,fontWeight:700,fontFamily:"system-ui"}}>
                {nomDiff===0?"⚠ Bust round!":nomDiff>0?`+${nomDiff} over`:`${Math.abs(nomDiff)} under`}
              </div>
            </div>

            {/* Player hit/miss cards */}
            <div style={{display:"flex",flexDirection:"column",gap:9,marginBottom:14}}>
              {players.map((name,i)=>{
                const nom=noms[i],hit=hits[i],isDealer=i===dealerIdx;
                const pc=PLAYER_COLORS[i%PLAYER_COLORS.length];
                const accentColor=hit===true?C.green:hit===false?C.red:pc+"99";
                return(
                  <div key={name} className="fade-up" style={{
                    background:`linear-gradient(155deg,${pc}0d,var(--bg-surface) 40%)`,
                    border:`1px solid ${pc}33`,
                    borderLeft:`4px solid ${accentColor}`,
                    borderRadius:16,padding:"14px 16px 14px 14px",position:"relative",overflow:"hidden",
                    boxShadow:isDealer?`0 0 0 1.5px ${C.gold}66, 0 4px 24px rgba(0,0,0,.5)`:"0 2px 12px rgba(0,0,0,.4)",
                    transition:"border-color .25s,box-shadow .25s"
                  }}>
                    {/* top glow tint */}
                    {hit===true&&<div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 0%,${C.green}0a,transparent 65%)`,pointerEvents:"none"}}/>}
                    {hit===false&&<div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at 50% 0%,rgba(192,57,43,.08),transparent 65%)",pointerEvents:"none"}}/>}
                    {hit===null&&<div style={{
                      position:"absolute",top:0,left:0,bottom:0,width:4,
                      borderRadius:"16px 0 0 16px",
                      background:pc,
                      animation:"pending-pulse 1.8s ease-in-out infinite"
                    }}/>}

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
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                      <div>
                        <div style={{color:C.cream,fontSize:16,fontWeight:600,fontFamily:"'Playfair Display',serif"}}>{name}</div>
                        <div style={{color:C.gold,fontSize:18,fontWeight:700,fontFamily:"'Playfair Display',serif",fontVariantNumeric:"tabular-nums"}}>
                          {scores[i]}<span style={{fontSize:11,color:C.muted,marginLeft:2}}>pts</span>
                        </div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{color:C.mutedD,fontSize:9,letterSpacing:1.5,textTransform:"uppercase",fontFamily:"'EB Garamond'"}}>Called</div>
                        <div style={{color:C.cream,fontSize:32,fontWeight:900,fontFamily:"'Playfair Display',serif",lineHeight:1,fontVariantNumeric:"tabular-nums"}}>{nom}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      {[
                        {val:true, label:"✓  Hit", pts:`+${10+nom}`, activeC:C.gold,  activeBg:"rgba(26,107,60,.2)",    activeBd:C.green},
                        {val:false,label:"✗  Miss",pts:"+0",          activeC:"#e07060",activeBg:"rgba(192,57,43,.18)", activeBd:C.red},
                      ].map(({val,label,pts,activeC,activeBg,activeBd})=>(
                        <button key={String(val)} className="press" onClick={()=>toggleHit(i,val)} style={{
                          flex:1,padding:"14px 0",borderRadius:10,minHeight:48,
                          border:`1.5px solid ${hit===val?activeBd:"rgba(255,255,255,.08)"}`,
                          background:hit===val?activeBg:"rgba(255,255,255,.03)",
                          color:hit===val?activeC:"var(--text-3)",
                          fontWeight:hit===val?700:400,cursor:"pointer",fontSize:14,
                          transition:`all var(--dur-fast)`,fontFamily:"system-ui"
                        }}>
                          {label} <span style={{fontSize:12,opacity:.75,fontVariantNumeric:"tabular-nums"}}>{pts}pts</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Undo + End */}
            <div style={{display:"flex",gap:10,marginBottom:10}}>
              {anyHit&&<Btn v="ghost" sm onClick={undoHit}>↩ Undo</Btn>}
              {allResolved()&&!confirmEnd&&(
                <button className="press btn-primary" onClick={()=>setConfirmEnd(true)} style={{
                  flex:1,padding:"16px",borderRadius:14,
                  border:`1.5px solid ${C.gold}`,color:C.gold,fontSize:17,fontWeight:800,
                  cursor:"pointer",fontFamily:"'Playfair Display',serif",letterSpacing:.3,
                  boxShadow:`0 6px 28px ${C.gold}28`
                }}>{round+1>=totalRounds?"See Final Results →":`End Round ${round+1} →`}</button>
              )}
            </div>

            {/* Confirm */}
            {confirmEnd&&(
              <Panel accent style={{marginTop:8}} className="pop-in">
                <div style={{color:C.cream,fontSize:16,fontWeight:700,marginBottom:6,fontFamily:"'Playfair Display',serif"}}>End round {round+1}?</div>
                <div style={{color:C.muted,fontSize:13,marginBottom:16,fontStyle:"italic",fontFamily:"'EB Garamond',serif"}}>Make sure everyone's result is correct before confirming.</div>
                <div style={{display:"flex",gap:10}}>
                  <Btn v="ghost" full onClick={()=>setConfirmEnd(false)}>Cancel</Btn>
                  <Btn v="gold" full onClick={endRound}>{round+1>=totalRounds?"Final Results →":"Confirm →"}</Btn>
                </div>
              </Panel>
            )}
          </>
        )}
      </div>
    </Felt>
  );
}
