import { PLAYER_COLORS } from "../lib/constants";
import { STYLES } from "./styles";
import { Panel, Lbl } from "./primitives";
import { TrophyIcon } from "./icons";

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────
export function Leaderboard({ players, scores }) {
  const sorted=[...players].map((p,i)=>({name:p,score:scores[i],idx:i})).sort((a,b)=>b.score-a.score);
  const maxScore=sorted[0]?.score||1;
  return (
    <Panel>
      <Lbl style={{marginBottom:16,display:"flex",alignItems:"center",gap:6}}><TrophyIcon color="var(--gold-2)"/> Standings</Lbl>
      {sorted.map((p,i)=>{
        const pc=PLAYER_COLORS[p.idx%PLAYER_COLORS.length];
        return(
          <div key={p.name} className="slide-in" style={{
            ...STYLES.leaderboard.row,
            borderBottom:i<sorted.length-1?"1px solid rgba(255,255,255,.055)":"none",
            animationDelay:`${i*60}ms`
          }}>
            <div style={{
              fontSize: i <= 2 ? 22 : 15,
              fontWeight: 700,
              fontFamily: i <= 2 ? "'Playfair Display',serif" : "system-ui",
              color: i <= 2 ? "var(--gold-2)" : "var(--text-3)",
              width: 32, textAlign:"center", flexShrink:0
            }}>{i+1}</div>
            <div style={{...STYLES.leaderboard.colorBar, background:pc}}/>
            <div style={STYLES.leaderboard.nameWrap}>
              <div style={{...STYLES.leaderboard.name, color:"var(--text-1)"}}>{p.name}</div>
              <div style={STYLES.leaderboard.barTrack}>
                <div style={{height:"100%",width:`${(p.score/maxScore)*100}%`,background:`linear-gradient(to right,${pc}99,${pc})`,transition:"width .6s ease"}}/>
              </div>
            </div>
            <div style={{...STYLES.leaderboard.score, color:"var(--gold-2)"}}>
              {p.score}<span style={{...STYLES.leaderboard.scorePts, color:"var(--text-3)"}}>pts</span>
            </div>
          </div>
        );
      })}
    </Panel>
  );
}
