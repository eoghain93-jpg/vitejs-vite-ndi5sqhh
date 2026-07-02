import { useState } from "react";
import { SUIT_NAME } from "../lib/constants";
import { pointsFor, roundResultIssue } from "../lib/game";
import type { RoundRecord } from "../lib/game";
import { fmtDuration } from "../lib/format";
import { haptic } from "../lib/haptics";
import { STYLES } from "./styles";
import { Panel, Lbl, Btn } from "./primitives";
import { Card } from "./PlayingCard";
import { CardIcon, ClipboardIcon, CheckCircleIcon, XCircleIcon, PencilIcon } from "./icons";

// ─── ROUND HISTORY ────────────────────────────────────────────────────────────
// Read-only log of completed rounds. When `onSaveRound` is provided (during
// play), each round can be edited in place — nominations and hit/miss — and
// all scores are recomputed from history by the parent.
export function RoundHistory({ players, history, onSaveRound=null }: {
  players: string[];
  history: RoundRecord[];
  onSaveRound?: ((roundIdx: number, nominations: number[], hits: boolean[]) => void) | null;
}) {
  const [editing,setEditing]=useState<number|null>(null);
  const [draftNoms,setDraftNoms]=useState<number[]>([]);
  const [draftHits,setDraftHits]=useState<boolean[]>([]);

  if(!history.length) return (
    <Panel style={{textAlign:"center",padding:40}}>
      <div style={STYLES.history.emptyIcon}><CardIcon size={36} color="var(--text-2)"/></div>
      <div style={{...STYLES.history.emptyText, color:"var(--text-3)"}}>No rounds completed yet</div>
    </Panel>
  );

  const startEdit=(ri: number)=>{
    setEditing(ri);
    setDraftNoms([...history[ri].nominations]);
    setDraftHits([...history[ri].hits]);
  };
  const stepNom=(pi: number, d: number, max: number)=>
    setDraftNoms(prev=>prev.map((n,j)=>j===pi?Math.max(0,Math.min(max,n+d)):n));
  const setHit=(pi: number, v: boolean)=>
    setDraftHits(prev=>prev.map((h,j)=>j===pi?v:h));
  const save=(ri: number)=>{
    onSaveRound?.(ri,draftNoms,draftHits);
    setEditing(null);
    haptic.success();
  };

  return (
    <Panel>
      <Lbl style={{marginBottom:16,display:"flex",alignItems:"center",gap:6}}><ClipboardIcon color="var(--gold-2)"/> Round History</Lbl>
      {history.map((r,ri)=>{
        const isEditing=editing===ri;
        const issue=isEditing?roundResultIssue(draftNoms,draftHits,r.roundCards):null;
        return (
        <div key={ri} style={{marginBottom:16,paddingBottom:16,borderBottom:ri<history.length-1?"1px solid rgba(255,255,255,.055)":"none"}}>
          <div style={STYLES.history.roundMeta}>
            <Card suit={r.trump} size="sm"/>
            <div>
              <div style={{...STYLES.history.roundLbl, color:"var(--text-3)"}}>Round {r.round+1}</div>
              <div style={{...STYLES.history.roundSub, color:"var(--text-3)"}}>
                {r.roundCards} cards · {SUIT_NAME[r.trump]} trump
                {r.durationMs!=null&&r.durationMs>0&&<> · <span style={{fontVariantNumeric:"tabular-nums"}}>⏱ {fmtDuration(r.durationMs)}</span></>}
              </div>
            </div>
            {onSaveRound&&!isEditing&&editing===null&&(
              <div style={STYLES.history.editHead}>
                <button onClick={()=>startEdit(ri)} aria-label={`Edit round ${r.round+1}`}
                  style={{...STYLES.nominate.editBtn,color:"var(--text-2)",display:"flex",alignItems:"center",gap:5}}>
                  <PencilIcon size={12}/> Edit
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="fade-up">
              {players.map((p,pi)=>(
                <div key={p} style={STYLES.history.editRow}>
                  <div style={{...STYLES.history.pName, color:"var(--text-1)"}}>{p}</div>
                  <button className="press" style={STYLES.history.stepBtn} aria-label={`Decrease ${p}'s call`}
                    onClick={()=>stepNom(pi,-1,r.roundCards)}>−</button>
                  <div style={STYLES.history.stepVal}>{draftNoms[pi]}</div>
                  <button className="press" style={STYLES.history.stepBtn} aria-label={`Increase ${p}'s call`}
                    onClick={()=>stepNom(pi,1,r.roundCards)}>+</button>
                  {[{v:true,label:"Hit"},{v:false,label:"Miss"}].map(({v,label})=>(
                    <button key={label} className="press" onClick={()=>setHit(pi,v)} style={{
                      ...STYLES.history.hitToggle,
                      border:`1.5px solid ${draftHits[pi]===v?(v?"var(--green-pos)":"var(--red-neg)"):"var(--border-subtle)"}`,
                      background:draftHits[pi]===v?(v?"rgba(34,197,94,.14)":"rgba(239,68,68,.14)"):"var(--bg-raised)",
                      color:draftHits[pi]===v?(v?"var(--green-pos)":"var(--red-neg)"):"var(--text-2)",
                      fontWeight:draftHits[pi]===v?700:400,
                    }}>{label}</button>
                  ))}
                </div>
              ))}
              {issue&&<div style={STYLES.history.editErr}>⚠ {issue}</div>}
              <div style={STYLES.history.editBtns}>
                <Btn v="ghost" sm full onClick={()=>setEditing(null)}>Cancel</Btn>
                <Btn v="gold" sm full disabled={!!issue} onClick={()=>save(ri)}>Save & Recalculate</Btn>
              </div>
            </div>
          ) : (
            players.map((p,pi)=>{
              const nom=r.nominations[pi],hit=r.hits[pi],pts=pointsFor(nom,hit);
              return(
                <div key={p} style={hit ? STYLES.history.hitRow : STYLES.history.missRow}>
                  {hit ? <CheckCircleIcon size={16} color="var(--green-pos)"/> : <XCircleIcon size={16} color="var(--red-neg)"/>}
                  <div style={{...STYLES.history.pName, color:"var(--text-1)"}}>{p}</div>
                  <div style={{...STYLES.history.pCalled, color:"var(--text-3)"}}>called {nom}</div>
                  <div style={{...STYLES.history.pPts, color:hit?"var(--green-pos)":"var(--red-neg)"}}>+{pts}pts</div>
                </div>
              );
            })
          )}
        </div>
      );})}
    </Panel>
  );
}
