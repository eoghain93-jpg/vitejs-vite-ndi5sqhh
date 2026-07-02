import { useState } from "react";
import { C } from "../lib/constants";
import { fmtStake } from "../lib/format";
import { STYLES } from "./styles";
import { Panel, Lbl, Divider } from "./primitives";
import { CardFan } from "./PlayingCard";
import { XCircleIcon, TrophyIcon } from "./icons";

// ─── SETUP ────────────────────────────────────────────────────────────────────
export function Setup({ onStart, initNames, initRounds, initStake, theme, onThemeChange, onShowFame=null, hasFame=false }) {
  const [names,setNames]=useState(initNames||["","","","",""]);
  const [rounds,setRounds]=useState(initRounds||10);
  const [stake,setStake]=useState(initStake||5);
  const setN=(i,v)=>setNames(n=>n.map((x,j)=>j===i?v.slice(0,20):x));
  const filled=names.map((n:string)=>n.trim()).filter(Boolean);
  const hasDupes=filled.length!==new Set(filled).size;
  const valid=filled.length>=2&&!hasDupes;
  const maxRounds=filled.length>=2?Math.min(10,Math.floor(52/filled.length)):10;
  const roundOpts=[...new Set([...[5,7,10,13].filter(r=>r<maxRounds),maxRounds])];
  if(rounds>maxRounds)setRounds(maxRounds);

  return (
    <div style={STYLES.setup.wrap} className="fade-up">
      <div style={STYLES.setup.heading}>
        <CardFan/>
        <h1 style={{...STYLES.setup.h1, color:"var(--gold-2)", textShadow:`0 2px 24px rgba(201,168,76,.35),0 0 60px rgba(201,168,76,.15)`}}>Nominations</h1>
        <p style={{...STYLES.setup.sub, color:"var(--text-2)"}}>The trick-taking scoring companion</p>
      </div>
      <Panel>
        <Lbl style={{marginBottom:12}}>
          Players <span style={{color:C.mutedD,textTransform:"none",letterSpacing:0,fontSize:11,fontStyle:"italic"}}>(order = clockwise seating)</span>
        </Lbl>
        {names.map((name,i)=>(
          <div key={i} style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
            <div style={{...STYLES.setup.playerNum, color:"var(--text-2)"}}>{i+1}</div>
            <input className="input-field" value={name} onChange={e=>setN(i,e.target.value)} placeholder={`Player ${i+1}`}
              style={{flex:1,background:"var(--bg-raised)",border:"1px solid var(--border-subtle)",borderRadius:10,padding:"12px 16px",color:"var(--text-1)",fontSize:15,outline:"none",transition:`border-color var(--dur-fast),box-shadow var(--dur-fast)`,minHeight:48,fontFamily:"system-ui"}}/>
            {names.length>2&&(
              <button onClick={()=>setNames(n=>n.filter((_,j)=>j!==i))} aria-label={`Remove player ${i+1}`} style={STYLES.setup.removeBtn}>×</button>
            )}
          </div>
        ))}
        {names.length<8&&(
          <button onClick={()=>setNames(n=>[...n,""])} style={STYLES.setup.addBtn}>＋ Add Player</button>
        )}
        {hasDupes&&(
          <div style={{display:"flex",alignItems:"center",gap:6,color:C.redL,fontSize:12,marginTop:8,padding:"7px 12px",background:"rgba(192,57,43,.1)",borderRadius:8,border:"1px solid rgba(192,57,43,.22)"}}><XCircleIcon size={14} color={C.redL}/> Player names must be unique</div>
        )}
        <Divider/>
        <Lbl style={{marginBottom:10}}>Rounds</Lbl>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          {roundOpts.map(r=>(
            <button key={r} onClick={()=>setRounds(r)} className="press" style={{
              flex:1,padding:"12px 0",borderRadius:10,
              border:`1.5px solid ${rounds===r?"var(--border-strong)":"var(--border-subtle)"}`,
              background:rounds===r?"rgba(201,168,76,.1)":"var(--bg-raised)",
              color:rounds===r?"var(--gold-1)":"var(--text-2)",fontWeight:rounds===r?700:400,
              cursor:"pointer",fontSize:17,fontFamily:"'Playfair Display',serif",
              transition:"all .15s",boxShadow:rounds===r?"var(--shadow-gold)":"none"
            }}>{r}</button>
          ))}
        </div>
        <Lbl style={{marginBottom:10}}>Stake per point</Lbl>
        <div style={STYLES.setup.stakeWrap}>
          <button onClick={()=>setStake(s=>Math.max(5,s-5))} disabled={stake<=5} className="press" style={{...STYLES.setup.stakeBtn, ...STYLES.setup.stakeBtnL, color:"var(--text-1)", cursor:stake<=5?"not-allowed":"pointer"}}>−</button>
          <div style={STYLES.setup.stakeVal}>{fmtStake(stake)}</div>
          <button onClick={()=>setStake(s=>s+5)} className="press" style={{...STYLES.setup.stakeBtn, ...STYLES.setup.stakeBtnR, color:"var(--text-1)", cursor:"pointer"}}>+</button>
        </div>
        <div style={STYLES.setup.stakeHint}>multiples of 5p</div>
        <button className="press btn-primary" onClick={()=>valid&&onStart(names.filter(n=>n.trim()),rounds,stake)} style={{
          width:"100%",padding:"16px",borderRadius:14,
          border:`1.5px solid ${valid?"var(--border-strong)":"var(--border-subtle)"}`,
          color:valid?"var(--gold-1)":"var(--text-3)",fontSize:18,fontWeight:800,cursor:valid?"pointer":"not-allowed",
          fontFamily:"'Playfair Display',serif",letterSpacing:.5,
          boxShadow:valid?"var(--shadow-gold)":"none",transition:"box-shadow .2s",minHeight:52
        }}>Continue →</button>
      </Panel>
      {onShowFame&&hasFame&&(
        <button onClick={onShowFame} className="press" style={{
          display:"flex",alignItems:"center",justifyContent:"center",gap:8,
          width:"100%",marginTop:14,padding:"12px",minHeight:48,
          background:"transparent",border:"1px dashed var(--border-mid)",borderRadius:12,
          color:"var(--gold-2)",cursor:"pointer",fontSize:13,fontWeight:700,
          letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"system-ui"
        }}>
          <TrophyIcon size={15} color="var(--gold-2)"/> Hall of Fame
        </button>
      )}
      {onThemeChange&&(
        <div role="group" aria-label="Theme" style={{display:"flex",justifyContent:"center",gap:6,marginTop:18,padding:"4px",borderRadius:999,background:"var(--bg-surface)",border:"1px solid var(--border-subtle)",width:"fit-content",margin:"18px auto 0"}}>
          {(["dark","light"] as const).map(t=>{
            const active=theme===t;
            return(
              <button key={t} onClick={()=>onThemeChange(t)} aria-pressed={active} className="press" style={{
                padding:"8px 18px",minHeight:36,borderRadius:999,
                border:active?"1px solid var(--border-strong)":"1px solid transparent",
                background:active?"color-mix(in srgb, var(--gold-2) 12%, transparent)":"transparent",
                color:active?"var(--gold-1)":"var(--text-2)",
                fontSize:12,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",
                fontFamily:"system-ui",cursor:"pointer",
                transition:`all var(--dur-fast) var(--ease-smooth)`
              }}>
                {t==="dark"?"◗ Dark":"◐ Light"}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
