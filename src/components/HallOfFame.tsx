import { useState } from "react";
import type { PlayerStats } from "../lib/stats";
import { statsKey } from "../lib/stats";
import { fmtMoney, fmtAgo } from "../lib/format";
import { haptic } from "../lib/haptics";
import { STYLES } from "./styles";
import { Felt, Panel, Lbl, Btn, Divider } from "./primitives";
import { CrownIcon, FlameIcon, TrashIcon, TrophyIcon } from "./icons";

// ─── HALL OF FAME ─────────────────────────────────────────────────────────────
// Lifetime records across every finished game on this device.
export function HallOfFame({ stats, onBack, onClear, onMerge }: {
  stats: PlayerStats[];
  onBack: () => void;
  onClear: () => void;
  onMerge: (keyA: string, keyB: string, keepKey: string) => void;
}) {
  const [confirmClear,setConfirmClear]=useState(false);
  // Merge mode: pick two entries that are really the same person, then choose
  // which spelling survives.
  const [mergeMode,setMergeMode]=useState(false);
  const [selected,setSelected]=useState<string[]>([]);
  const [now]=useState(()=>Date.now());
  const sorted=[...stats].sort((a,b)=>
    b.wins-a.wins || (b.wins/b.games)-(a.wins/a.games) || b.games-a.games || b.totalPoints-a.totalPoints);

  const toggleSelect=(key: string)=>{
    setSelected(prev=>prev.includes(key)?prev.filter(k=>k!==key):prev.length<2?[...prev,key]:prev);
  };
  const exitMerge=()=>{setMergeMode(false);setSelected([]);};
  const doMerge=(keepKey: string)=>{
    onMerge(selected[0],selected[1],keepKey);
    haptic.success();
    exitMerge();
  };
  const selectedStats=selected.map(k=>sorted.find(p=>statsKey(p.name)===k)).filter(Boolean) as PlayerStats[];

  return (
    <Felt style={{paddingBottom:48}}>
      <div style={STYLES.fame.wrap} className="fade-up">
        <div style={STYLES.fame.heading}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:10}}>
            <CrownIcon size={40} color="var(--gold-2)"/>
          </div>
          <h1 style={{...STYLES.fame.h1, color:"var(--gold-2)", textShadow:`0 2px 24px rgba(201,168,76,.35)`}}>Hall of Fame</h1>
          <p style={{...STYLES.fame.sub, color:mergeMode?"var(--gold-1)":"var(--text-2)"}}>
            {mergeMode?"Tap the two entries that are the same person":"Lifetime records on this device"}
          </p>
        </div>

        {sorted.length===0 ? (
          <Panel style={STYLES.fame.empty}>
            <div style={{display:"flex",justifyContent:"center",marginBottom:10,opacity:.5}}><TrophyIcon size={36} color="var(--text-2)"/></div>
            <div style={{color:"var(--text-3)",fontSize:15,fontStyle:"italic"}}>No games finished yet — legends are made at the table</div>
          </Panel>
        ) : (
          <Panel>
            {sorted.map((p,i)=>{
              const winRate=Math.round((p.wins/p.games)*100);
              const acc=p.callsMade>0?Math.round((p.callsHit/p.callsMade)*100):0;
              const avg=Math.round(p.totalPoints/p.games);
              const key=statsKey(p.name);
              const isSelected=selected.includes(key);
              return (
                <div key={p.name} className="slide-in"
                  onClick={mergeMode?()=>toggleSelect(key):undefined}
                  role={mergeMode?"button":undefined}
                  aria-pressed={mergeMode?isSelected:undefined}
                  style={{
                  ...STYLES.fame.row,
                  borderBottom:i<sorted.length-1?"1px solid rgba(255,255,255,.055)":"none",
                  animationDelay:`${i*60}ms`,
                  cursor:mergeMode?"pointer":undefined,
                  borderRadius:mergeMode?10:undefined,
                  padding:mergeMode?"14px 10px":STYLES.fame.row.padding,
                  background:isSelected?"color-mix(in srgb, var(--gold-2) 10%, transparent)":undefined,
                  boxShadow:isSelected?"inset 0 0 0 1.5px var(--border-strong)":undefined,
                }}>
                  <div style={STYLES.fame.rowTop}>
                    <div style={{
                      ...STYLES.fame.rank,
                      color:i===0?"var(--gold-2)":"var(--text-3)",
                      fontFamily:i===0?"'Playfair Display',serif":"system-ui",
                      fontSize:i===0?20:14,
                    }}>{i+1}</div>
                    <div style={STYLES.fame.name}>{p.name}</div>
                    <div style={{...STYLES.fame.wins, color:"var(--gold-2)"}}>
                      {p.wins} {p.wins===1?"win":"wins"}
                      <span style={{color:"var(--text-3)",fontSize:11,fontWeight:400,marginLeft:5}}>of {p.games}</span>
                    </div>
                  </div>
                  <div style={STYLES.fame.statGrid}>
                    <span style={STYLES.fame.stat}>Win rate <span style={STYLES.fame.statVal}>{winRate}%</span></span>
                    <span style={STYLES.fame.stat}>Calls hit <span style={STYLES.fame.statVal}>{acc}%</span></span>
                    <span style={STYLES.fame.stat}>Avg <span style={STYLES.fame.statVal}>{avg}pts</span></span>
                    <span style={STYLES.fame.stat}>Best <span style={STYLES.fame.statVal}>{p.bestScore}pts</span></span>
                    <span style={STYLES.fame.stat}><FlameIcon size={12} color="var(--gold-2)"/> Streak <span style={STYLES.fame.statVal}>{p.bestStreak}</span></span>
                    <span style={STYLES.fame.stat}>
                      Money <span style={{...STYLES.fame.statVal, color:p.moneyNet>0?"var(--green-pos)":p.moneyNet<0?"var(--red-neg)":"var(--text-1)"}}>
                        {p.moneyNet>0?"+":p.moneyNet<0?"−":""}{fmtMoney(Math.abs(p.moneyNet))}
                      </span>
                    </span>
                    <span style={{...STYLES.fame.stat, color:"var(--text-3)"}}>played {fmtAgo(now-p.lastPlayedAt)}</span>
                  </div>
                </div>
              );
            })}
          </Panel>
        )}

        {confirmClear ? (
          <Panel accent style={{marginTop:22}} className="pop-in">
            <div style={{fontSize:16,fontWeight:700,marginBottom:6,fontFamily:"'Playfair Display',serif",color:"var(--text-1)"}}>Erase all records?</div>
            <div style={{fontSize:13,marginBottom:16,fontStyle:"italic",color:"var(--text-2)"}}>Every player's lifetime stats will be permanently deleted.</div>
            <div style={{display:"flex",gap:10}}>
              <Btn v="ghost" full onClick={()=>setConfirmClear(false)}>Keep them</Btn>
              <Btn v="red" full onClick={()=>{onClear();setConfirmClear(false);}}>Erase →</Btn>
            </div>
          </Panel>
        ) : mergeMode ? (
          selectedStats.length===2 ? (
            <Panel accent style={{marginTop:22}} className="pop-in">
              <div style={{fontSize:16,fontWeight:700,marginBottom:6,fontFamily:"'Playfair Display',serif",color:"var(--text-1)"}}>Combine their records — keep which name?</div>
              <div style={{fontSize:13,marginBottom:16,fontStyle:"italic",color:"var(--text-2)"}}>Games, wins and money are added together. This can't be undone.</div>
              <div style={{display:"flex",gap:10,marginBottom:10}}>
                {selectedStats.map(p=>(
                  <Btn key={p.name} v="gold" full onClick={()=>doMerge(statsKey(p.name))}>{p.name}</Btn>
                ))}
              </div>
              <Btn v="ghost" full sm onClick={exitMerge}>Cancel</Btn>
            </Panel>
          ) : (
            <div style={STYLES.fame.footer}>
              <div style={{flex:1,alignSelf:"center",color:"var(--text-3)",fontSize:12,fontStyle:"italic"}}>
                {selected.length===0?"Select the first entry…":"Now select its duplicate…"}
              </div>
              <Btn v="ghost" sm onClick={exitMerge}>Cancel</Btn>
            </div>
          )
        ) : (
          <div style={STYLES.fame.footer}>
            {sorted.length>0&&(
              <Btn v="ghost" sm onClick={()=>setConfirmClear(true)}>
                <span style={{display:"flex",alignItems:"center",gap:6}}><TrashIcon size={13}/> Clear</span>
              </Btn>
            )}
            {sorted.length>=2&&(
              <Btn v="ghost" sm onClick={()=>setMergeMode(true)}>Merge players</Btn>
            )}
            <div style={{flex:1}}/>
            <Btn v="gold" onClick={onBack}>← Back</Btn>
          </div>
        )}
        <Divider/>
        <Lbl style={{textAlign:"center",opacity:.6}}>Nominations</Lbl>
      </div>
    </Felt>
  );
}
