import { useState } from "react";
import { pairwiseNet } from "../lib/game";
import { fmtMoney, fmtStake } from "../lib/format";
import { STYLES } from "./styles";
import { Panel, Lbl, Divider } from "./primitives";
import { CoinsIcon } from "./icons";

// ─── MONEY SETTLEMENT ─────────────────────────────────────────────────────────
// Two settlement styles:
//  • Winner takes all — everyone pays the leader their points-behind × stake.
//  • All square up   — every pair settles the difference; shown as net result.
export function Money({ players, scores, stake }) {
  const [mode,setMode]=useState<"winner"|"pairwise">("winner");
  const sorted=[...players].map((p,i)=>({name:p,score:scores[i],idx:i})).sort((a,b)=>b.score-a.score);
  const w=sorted[0];
  const nets=pairwiseNet(scores,stake);

  return (
    <Panel accent style={{marginTop:18}}>
      <div style={STYLES.money.headerRow}>
        <div style={{...STYLES.money.avatar, background:`linear-gradient(135deg,var(--gold-2),var(--gold-3))`, boxShadow:`0 4px 16px color-mix(in srgb, var(--gold-2) 27%, transparent)`}}><CoinsIcon size={22} color="var(--on-gold)"/></div>
        <div>
          <Lbl>{mode==="winner"?`Owed to ${w.name}`:"Everyone settles up"}</Lbl>
          <div style={{...STYLES.money.sub, color:"var(--text-3)"}}>
            {mode==="winner"
              ?`${fmtStake(stake)} per point · winner on ${w.score}pts`
              :`${fmtStake(stake)} per point · each pair settles the difference`}
          </div>
        </div>
      </div>
      <Divider style={{margin:"14px 0"}}/>

      {mode==="winner" ? (
        <>
          {sorted.slice(1).map((p,i)=>{
            const diff=w.score-p.score;
            return (
              <div key={p.name} style={{
                ...STYLES.money.debtRow,
                borderBottom:i<sorted.length-2?"1px solid rgba(255,255,255,.055)":"none"
              }}>
                <div style={{...STYLES.money.debtName, color:"var(--text-1)"}}>{p.name}</div>
                <div style={STYLES.money.debtRight}>
                  <div style={{...STYLES.money.debtAmt, color:"var(--red-neg)"}}>{fmtMoney(diff*stake)}</div>
                  <div style={{...STYLES.money.ptsBehind, color:"var(--text-3)"}}>{diff} pts behind</div>
                </div>
              </div>
            );
          })}
          <Divider style={{margin:"14px 0"}}/>
          <div style={{...STYLES.money.debtRow}}>
            <div style={{...STYLES.money.debtName, color:"var(--text-2)", fontWeight:700}}>Total owed to {w.name}</div>
            <div style={STYLES.money.debtRight}>
              <div style={{...STYLES.money.debtAmt, color:"var(--gold-2)"}}>{fmtMoney(sorted.slice(1).reduce((sum,p)=>sum+(w.score-p.score)*stake,0))}</div>
            </div>
          </div>
        </>
      ) : (
        sorted.map((p,i)=>{
          const net=nets[p.idx];
          return (
            <div key={p.name} style={{
              ...STYLES.money.debtRow,
              borderBottom:i<sorted.length-1?"1px solid rgba(255,255,255,.055)":"none"
            }}>
              <div style={{...STYLES.money.debtName, color:"var(--text-1)"}}>{p.name}</div>
              <div style={STYLES.money.debtRight}>
                <div style={{...STYLES.money.debtAmt, color:net>0?"var(--green-pos)":net<0?"var(--red-neg)":"var(--text-2)"}}>
                  {net>0?"+":net<0?"−":""}{fmtMoney(Math.abs(net))}
                </div>
                <div style={{...STYLES.money.ptsBehind, color:"var(--text-3)"}}>{net>0?"collects":net<0?"pays out":"breaks even"}</div>
              </div>
            </div>
          );
        })
      )}

      <div style={STYLES.money.modeRow} role="group" aria-label="Settlement style">
        {([["winner","Winner takes all"],["pairwise","All square up"]] as const).map(([m,label])=>(
          <button key={m} onClick={()=>setMode(m)} aria-pressed={mode===m} className="press" style={{
            ...STYLES.money.modeBtn,
            border:mode===m?"1px solid var(--border-strong)":"1px solid transparent",
            background:mode===m?"color-mix(in srgb, var(--gold-2) 12%, transparent)":"transparent",
            color:mode===m?"var(--gold-1)":"var(--text-3)",
          }}>{label}</button>
        ))}
      </div>
    </Panel>
  );
}
