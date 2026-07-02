import { SUIT_NAME, PLAYER_COLORS } from "../lib/constants";
import { pointsFor } from "../lib/game";
import { fmtDuration } from "../lib/format";
import { STYLES } from "./styles";
import { Felt, Panel, Lbl, Btn } from "./primitives";
import { Card } from "./PlayingCard";
import { CheckCircleIcon, XCircleIcon } from "./icons";

// ─── ROUND SUMMARY ────────────────────────────────────────────────────────────
export function RoundSummary({ players, nominations, hits, scores, prevScores, round, trump, onNext, isLast, durationMs }) {
  const rankBefore=[...players].map((p,i)=>({name:p,score:prevScores[i]})).sort((a,b)=>b.score-a.score).map(p=>p.name);
  const rankAfter=[...players].map((p,i)=>({name:p,score:scores[i]})).sort((a,b)=>b.score-a.score).map(p=>p.name);
  return (
    <Felt center>
      <div style={STYLES.summary.wrap} className="fade-up">
        <div style={STYLES.summary.heading}>
          <Card suit={trump} size="lg" glow style={{margin:"0 auto"}}/>
          <Lbl style={{textAlign:"center",marginTop:16,marginBottom:8}}>Round {round+1} Complete</Lbl>
          <h2 style={{...STYLES.summary.h2, color:"var(--text-1)"}}>Round Summary</h2>
          <div style={{...STYLES.summary.sub, color:"var(--text-2)"}}>
            {SUIT_NAME[trump]} was trump
            {durationMs!=null&&durationMs>0&&<> · <span style={{fontVariantNumeric:"tabular-nums"}}>⏱ {fmtDuration(durationMs)}</span></>}
          </div>
        </div>
        <Panel>
          {players.map((name,i)=>{
            const nom=nominations[i],hit=hits[i],gained=pointsFor(nom,hit);
            const pc=PLAYER_COLORS[i%PLAYER_COLORS.length];
            const posB=rankBefore.indexOf(name),posA=rankAfter.indexOf(name),delta=posB-posA;
            return (
              <div key={name} className="slide-in" style={{
                ...STYLES.summary.row,
                background:hit?"rgba(34,197,94,.08)":"rgba(239,68,68,.08)",
                borderLeft:hit?"3px solid var(--green-pos)":"3px solid var(--red-neg)",
                animationDelay:`${i*70}ms`
              }}>
                <div style={STYLES.summary.iconWrap}>
                  {hit
                    ? <CheckCircleIcon size={22} color="var(--green-pos)"/>
                    : <XCircleIcon size={22} color="var(--red-neg)"/>}
                </div>
                <div style={STYLES.summary.nameWrap}>
                  <div style={{...STYLES.summary.name, color:"var(--text-1)"}}>{name}</div>
                  <div style={{...STYLES.summary.called, color:"var(--text-2)"}}>Called <strong style={{color:pc}}>{nom}</strong> · {hit?"Hit!":"Missed"}</div>
                </div>
                <div style={STYLES.summary.ptsWrap}>
                  <div style={{...STYLES.summary.pts, color:hit?"var(--green-pos)":"var(--red-neg)"}}>+{gained}pts</div>
                  <div style={{...STYLES.summary.prevScore, color:"var(--text-3)"}}>{prevScores[i]} → <span style={{color:"var(--text-1)"}}>{scores[i]}</span></div>
                </div>
                {players.length>1&&(
                  <div className="rank-in" style={{
                    ...STYLES.summary.rankBadge,
                    color:delta>0?"var(--green-pos)":delta<0?"var(--red-neg)":"var(--text-3)",
                    animationDelay:`${i*70+200}ms`
                  }}>
                    {delta>0?`↑${delta}`:delta<0?`↓${Math.abs(delta)}`:"–"}
                  </div>
                )}
              </div>
            );
          })}
        </Panel>
        <div style={STYLES.summary.next}><Btn v="gold" full onClick={onNext}>{isLast?"See Final Results →":"Next Round →"}</Btn></div>
      </div>
    </Felt>
  );
}
