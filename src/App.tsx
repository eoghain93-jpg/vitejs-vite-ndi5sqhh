import { useState, useEffect } from "react";

import { C, SUIT_COLOR, SAVE_KEY, THEME_KEY, PLAYER_COLORS } from "./lib/constants";
import { getRoundCards, nomOrder, pointsFor, scoresFromHistory, bustedCalls, roundResultIssue } from "./lib/game";
import type { RoundRecord } from "./lib/game";
import { fmtDuration, fmtAgo } from "./lib/format";
import { loadStats, clearStats, recordGame } from "./lib/stats";
import { haptic } from "./lib/haptics";
import { useWakeLock } from "./hooks/useWakeLock";

import { STYLES } from "./components/styles";
import { Felt, Panel, Lbl, Btn, Progress, Divider } from "./components/primitives";
import { Card } from "./components/PlayingCard";
import { CardIcon, TrophyIcon, ClipboardIcon, XCircleIcon, MedalIcon } from "./components/icons";
import { SpinWheel } from "./components/SpinWheel";
import { TrumpPicker } from "./components/TrumpPicker";
import { Leaderboard } from "./components/Leaderboard";
import { RoundHistory } from "./components/RoundHistory";
import { Money } from "./components/Money";
import { Setup } from "./components/Setup";
import { RoundSummary } from "./components/RoundSummary";
import { Confetti } from "./components/Confetti";
import { Podium } from "./components/Podium";
import { HallOfFame } from "./components/HallOfFame";

// Shape of the autosaved game snapshot in localStorage.
type SavedGame = {
  v: 1; savedAt: number; phase: string;
  players: string[]; totalRounds: number; stakePerPoint: number;
  round: number; dealerIdx: number; initialDealerIdx: number;
  scores: number[]; trump: string|null; history: RoundRecord[];
  noms: (number|null)[]; nomIdx: number; hits: (boolean|null)[]; prevScores: number[];
  roundStartedAt: number|null; lastRoundMs: number|null;
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [phase,setPhase]=useState("setup");
  const [players,setPlayers]=useState([]);
  const [totalRounds,setTotalRounds]=useState(10);
  const [stakePerPoint,setStakePerPoint]=useState(5);
  const [round,setRound]=useState(0);
  const [dealerIdx,setDealerIdx]=useState(0);
  const [initialDealerIdx,setInitialDealerIdx]=useState(0);
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
  const [roundStartedAt,setRoundStartedAt]=useState<number|null>(null);
  const [lastRoundMs,setLastRoundMs]=useState<number|null>(null);
  const [nowMs,setNowMs]=useState(()=>Date.now());
  const [theme,setTheme]=useState<"light"|"dark">(()=>{
    if(typeof window==="undefined")return"dark";
    try{
      const stored=localStorage.getItem(THEME_KEY);
      if(stored==="light"||stored==="dark")return stored;
    }catch{/* ignore */}
    return window.matchMedia?.("(prefers-color-scheme: light)").matches?"light":"dark";
  });
  // Bumped after clearing stats so the Hall of Fame re-reads localStorage.
  const [,setStatsVersion]=useState(0);
  const [pendingResume,setPendingResume]=useState<SavedGame|null>(()=>{
    if(typeof window==="undefined")return null;
    try{
      const raw=localStorage.getItem(SAVE_KEY);
      if(!raw)return null;
      const snap=JSON.parse(raw);
      if(snap?.v!==1)return null;
      if(snap.phase==="setup"||snap.phase==="end")return null;
      if(!Array.isArray(snap.players)||snap.players.length<2)return null;
      return snap;
    }catch{return null;}
  });

  useEffect(()=>{
    document.documentElement.dataset.theme=theme;
    try{localStorage.setItem(THEME_KEY,theme);}catch{/* ignore */}
  },[theme]);

  useEffect(()=>{
    if(phase==="end"){
      try{localStorage.removeItem(SAVE_KEY);}catch{/* ignore */}
      return;
    }
    if(phase==="setup"||phase==="stats")return;
    try{
      localStorage.setItem(SAVE_KEY,JSON.stringify({
        v:1, savedAt:Date.now(),
        phase, players, totalRounds, stakePerPoint,
        round, dealerIdx, initialDealerIdx,
        scores, trump, history, noms, nomIdx, hits, prevScores,
        roundStartedAt, lastRoundMs,
      }));
    }catch{/* ignore */}
  },[phase,players,totalRounds,stakePerPoint,round,dealerIdx,initialDealerIdx,
     scores,trump,history,noms,nomIdx,hits,prevScores,roundStartedAt,lastRoundMs]);

  useEffect(()=>{
    if(roundStartedAt===null)return;
    if(phase!=="trump"&&phase!=="nominate"&&phase!=="play")return;
    setNowMs(Date.now());
    const id=window.setInterval(()=>setNowMs(Date.now()),1000);
    return()=>window.clearInterval(id);
  },[roundStartedAt,phase]);

  // Keep the table phone awake for the whole game.
  useWakeLock(phase!=="setup"&&phase!=="end"&&phase!=="stats");

  const roundCards=getRoundCards(round,totalRounds);

  const allNominated=()=>noms.every(n=>n!==null);
  const allResolved=()=>allNominated()&&hits.every(h=>h!==null);
  const totalNom=()=>noms.reduce((s,n)=>s+(n??0),0);

  function startGame(pl,rnds,stk){setPlayers(pl);setTotalRounds(rnds);setStakePerPoint(stk);setScores(Array(pl.length).fill(0));setHistory([]);setRoundStartedAt(null);setLastRoundMs(null);setPendingResume(null);setPhase("spin");}

  function resumeGame(){
    if(!pendingResume)return;
    setPlayers(pendingResume.players);
    setTotalRounds(pendingResume.totalRounds);
    setStakePerPoint(pendingResume.stakePerPoint);
    setRound(pendingResume.round);
    setDealerIdx(pendingResume.dealerIdx);
    setInitialDealerIdx(pendingResume.initialDealerIdx);
    setScores(pendingResume.scores);
    setTrump(pendingResume.trump);
    setHistory(pendingResume.history);
    setNoms(pendingResume.noms);
    setNomIdx(pendingResume.nomIdx);
    setHits(pendingResume.hits);
    setPrevScores(pendingResume.prevScores);
    setRoundStartedAt(pendingResume.roundStartedAt);
    setLastRoundMs(pendingResume.lastRoundMs);
    setPhase(pendingResume.phase);
    setPendingResume(null);
  }

  function discardResume(){
    try{localStorage.removeItem(SAVE_KEY);}catch{/* ignore */}
    setPendingResume(null);
  }

  function afterSpin(name){
    const idx=players.indexOf(name);
    setDealerIdx(idx);
    setInitialDealerIdx(idx);
    beginRound(0,idx,Array(players.length).fill(0));
  }

  function beginRound(r,dealer,curScores){
    setRound(r);setDealerIdx(dealer);
    setNoms(Array(players.length).fill(null));setHits(Array(players.length).fill(null));
    setTrump(null);setTab("game");setConfirmEnd(false);setPrevScores(curScores);
    setNomIdx(nomOrder(dealer,players.length)[0]);
    const now=Date.now();setRoundStartedAt(now);setNowMs(now);
    setPhase("trump");
  }

  function pickTrump(s){setTrump(s);setPhase("nominate");}

  function submitNom(pi,val){
    haptic.tap();
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

  function toggleHit(i,val){haptic.tap();setHits(prev=>prev.map((x,j)=>j===i?(x===val?null:val):x));}
  function undoHit(){for(let i=hits.length-1;i>=0;i--){if(hits[i]!==null){setHits(prev=>prev.map((x,j)=>j===i?null:x));return;}}}

  function endRound(){
    haptic.success();
    const durationMs=roundStartedAt!=null?Date.now()-roundStartedAt:0;
    const ns=scores.map((s,i)=>s+pointsFor(noms[i],hits[i]));
    setHistory(h=>[...h,{round,roundCards,trump,nominations:[...noms],hits:[...hits],durationMs}]);
    setScores(ns);setPrevScores(scores);setConfirmEnd(false);
    setLastRoundMs(durationMs);setRoundStartedAt(null);
    setPhase("roundSummary");
  }

  function afterSummary(){
    if(round+1>=totalRounds){
      // Game over — fold this game into the lifetime Hall of Fame records.
      recordGame(players,scores,stakePerPoint,history);
      setPhase("end");
      return;
    }
    const nd=(dealerIdx+1)%players.length;
    beginRound(round+1,nd,scores);
  }

  // A past round was corrected in the History tab: history becomes the source
  // of truth and every score is rebuilt from it.
  function saveRoundEdit(ri,nominations,hits2){
    const newHistory=history.map((r,i)=>i===ri?{...r,nominations,hits:hits2}:r);
    const newScores=scoresFromHistory(newHistory,players.length);
    setHistory(newHistory);
    setScores(newScores);
    setPrevScores(newScores);
  }

  // ── SETUP ──
  if(phase==="setup")return(
    <>
      <Felt center>
        <Setup onStart={startGame} initNames={players.length?players:null} initRounds={totalRounds} initStake={stakePerPoint}
          theme={theme} onThemeChange={setTheme}
          onShowFame={()=>setPhase("stats")} hasFame={Object.keys(loadStats().players).length>0}/>
      </Felt>
      {pendingResume&&(
        <div role="dialog" aria-modal="true" aria-labelledby="resume-title" style={{
          position:"fixed",inset:0,zIndex:50,
          background:"rgba(0,0,0,.6)",backdropFilter:"blur(6px)",WebkitBackdropFilter:"blur(6px)",
          display:"flex",alignItems:"center",justifyContent:"center",padding:20
        }}>
          <Panel accent style={{maxWidth:360,width:"100%",textAlign:"center"}} className="pop-in">
            <Lbl style={{marginBottom:10}}>Game in progress</Lbl>
            <div id="resume-title" style={{color:"var(--text-1)",fontSize:22,fontWeight:700,fontFamily:"'Playfair Display',serif",marginBottom:8,lineHeight:1.2}}>
              Resume where you left off?
            </div>
            <div style={{color:"var(--text-2)",fontSize:13,marginBottom:4}}>
              Round {pendingResume.round+1} of {pendingResume.totalRounds} · {pendingResume.players.length} players
            </div>
            <div style={{color:"var(--text-3)",fontSize:12,marginBottom:18}}>
              saved {fmtAgo(Date.now()-pendingResume.savedAt)}
            </div>
            <div style={{display:"flex",gap:10}}>
              <Btn v="ghost" full onClick={discardResume}>Start New</Btn>
              <Btn v="gold" full onClick={resumeGame}>Resume →</Btn>
            </div>
          </Panel>
        </div>
      )}
    </>
  );

  // ── HALL OF FAME ──
  if(phase==="stats")return(
    <HallOfFame
      stats={Object.values(loadStats().players)}
      onBack={()=>setPhase("setup")}
      onClear={()=>{clearStats();setStatsVersion(v=>v+1);}}
    />
  );

  // ── SPIN ──
  if(phase==="spin")return(
    <Felt center>
      <div style={STYLES.spin.wrap} className="fade-up">
        <h2 style={{...STYLES.spin.heading, color:"var(--gold-2)"}}>Who deals first?</h2>
        <p style={{...STYLES.spin.sub, color:"var(--text-2)"}}>Spin the wheel to decide</p>
        <div style={STYLES.spin.spotlight}>
          <SpinWheel players={players} onDone={afterSpin}/>
        </div>
      </div>
    </Felt>
  );

  // ── TRUMP ──
  if(phase==="trump")return(
    <Felt center>
      <div style={STYLES.trump.wrap} className="fade-up">
        <Lbl style={{textAlign:"center",marginBottom:8}}>Round {round+1} of {totalRounds}</Lbl>
        <h2 style={{...STYLES.trump.heading, color:"var(--text-1)"}}>{roundCards} cards dealt</h2>
        <p style={{...STYLES.trump.sub, color:"var(--text-2)"}}>{players[dealerIdx]} is dealing</p>
        <Panel table style={{marginBottom:28,padding:"14px 18px"}}>
          <Lbl style={{marginBottom:10,textAlign:"center"}}>Dealer rotation this game</Lbl>
          <div style={STYLES.trump.dealerPills}>
            {players.map((p,i)=>(
              <div key={p} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{
                  ...STYLES.trump.dealerPillDef,
                  background:i===dealerIdx?"rgba(201,168,76,.16)":"rgba(255,255,255,.04)",
                  border:`1px solid ${i===dealerIdx?"color-mix(in srgb, var(--gold-2) 33%, transparent)":"rgba(255,255,255,.08)"}`,
                  color:i===dealerIdx?"var(--gold-2)":"var(--text-1)",
                  fontWeight:i===dealerIdx?700:400,
                  boxShadow:i===dealerIdx?`0 0 10px color-mix(in srgb, var(--gold-2) 13%, transparent)`:"none"
                }}>{p}{i===dealerIdx&&<span aria-hidden="true" style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:"var(--gold-2)",marginLeft:5,verticalAlign:"middle"}}/>}</div>
                {i<players.length-1&&<span style={{...STYLES.trump.separator, color:"var(--text-3)"}}>›</span>}
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
    <RoundSummary players={players} nominations={noms} hits={hits} scores={scores}
      prevScores={prevScores} round={round} trump={trump} onNext={afterSummary} isLast={round+1>=totalRounds}
      durationMs={lastRoundMs}/>
  );

  // ── END ──
  if(phase==="end"){
    const sorted=[...players].map((p,i)=>({name:p,score:scores[i],idx:i})).sort((a,b)=>b.score-a.score);
    return(
      <Felt style={{paddingBottom:48}}>
        <Confetti/>
        <div style={STYLES.end.outer} className="fade-up">
          <Lbl style={{textAlign:"center",marginBottom:10}}>Game Over</Lbl>
          <h1 style={{...STYLES.end.h1, color:"var(--gold-2)", textShadow:`0 2px 28px rgba(201,168,76,.4)`}}>Final Standings</h1>
          <p style={{...STYLES.end.sub, color:"var(--text-2)"}}>
            {totalRounds} rounds played
            {(() => {
              const totalMs=history.reduce((s,r)=>s+(r.durationMs||0),0);
              const timed=history.filter(r=>r.durationMs>0).length;
              if(totalMs<=0)return null;
              const avg=timed>0?Math.round(totalMs/timed):0;
              return <> · <span style={{fontVariantNumeric:"tabular-nums"}}>⏱ {fmtDuration(totalMs)}</span>{avg>0&&<span style={{color:"var(--text-3)"}}> · avg {fmtDuration(avg)}</span>}</>;
            })()}
          </p>
          <Podium sorted={sorted}/>
          {/* Full list */}
          <Panel style={{marginBottom:0,textAlign:"left"}}>
            {sorted.map((p,i)=>{
              const pc=PLAYER_COLORS[p.idx%PLAYER_COLORS.length];
              return(
                <div key={p.name} className="slide-in" style={{...STYLES.end.listRow, borderBottom:i<sorted.length-1?"1px solid rgba(255,255,255,.055)":"none", animationDelay:`${i*60}ms`}}>
                  <div style={{width:30,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    {i<3 ? <MedalIcon rank={i+1} size={20}/> : <span style={{color:"var(--text-3)",fontSize:14}}>{i+1}</span>}
                  </div>
                  <div style={{...STYLES.end.listBar, background:pc}}/>
                  <div style={{...STYLES.end.listName, flex:1, color:"var(--text-1)"}}>{p.name}</div>
                  <div style={{...STYLES.end.listScore, color:i===0?"var(--gold-2)":"var(--text-1)"}}>
                    {p.score}<span style={{...STYLES.end.listPts, color:"var(--text-3)"}}>pts</span>
                  </div>
                </div>
              );
            })}
          </Panel>
          <Money players={players} scores={scores} stake={stakePerPoint}/>
          <Divider/>
          {confirmPlayAgain?(
            <Panel accent>
              <div style={{...STYLES.end.confirmTitle, color:"var(--text-1)"}}>Play again with same players?</div>
              <div style={{...STYLES.end.confirmSub, color:"var(--text-2)"}}>Scores will reset to zero.</div>
              <div style={STYLES.end.confirmBtns}>
                <Btn v="ghost" full onClick={()=>setConfirmPlayAgain(false)}>Cancel</Btn>
                <Btn v="gold" full onClick={()=>{setConfirmPlayAgain(false);setScores(Array(players.length).fill(0));setHistory([]);setRoundStartedAt(null);setLastRoundMs(null);setPhase("dealerSelect");}}>Confirm →</Btn>
              </div>
            </Panel>
          ):(
            <div style={STYLES.end.ctaRow}>
              <Btn v="ghost" full onClick={()=>setConfirmPlayAgain(true)}>Play Again</Btn>
              <Btn v="gold" full onClick={()=>setPhase("setup")}>New Game</Btn>
            </div>
          )}
        </div>
      </Felt>
    );
  }

  // ── DEALER SELECT ──
  if(phase==="dealerSelect"){
    const nextIdx=(initialDealerIdx+1)%players.length;
    const nextName=players[nextIdx];
    const prevName=players[initialDealerIdx];
    return(
      <Felt center>
        <div style={STYLES.spin.wrap} className="fade-up">
          <h2 style={{...STYLES.spin.heading, color:"var(--gold-2)"}}>Who deals first?</h2>
          <p style={{...STYLES.spin.sub, color:"var(--text-2)"}}>
            {prevName} dealt first last game
          </p>
          <Panel accent style={{marginTop:24,marginBottom:24,textAlign:"center"}}>
            <div style={{color:"var(--text-3)",fontSize:13,marginBottom:6}}>Next in rotation</div>
            <div style={{color:"var(--gold-2)",fontSize:28,fontWeight:800,fontFamily:"'Playfair Display',serif"}}>{nextName}</div>
          </Panel>
          <div style={{display:"flex",flexDirection:"column",gap:12,width:"100%",maxWidth:320}}>
            <Btn v="gold" full onClick={()=>beginRound(0,nextIdx,Array(players.length).fill(0))}>
              Continue rotation → {nextName}
            </Btn>
            <Btn v="ghost" full onClick={()=>setPhase("spin")}>
              Spin again
            </Btn>
          </div>
        </div>
      </Felt>
    );
  }

  // ── SHARED HEADER ──
  const Hdr=()=>(
    <div style={STYLES.hdr.wrap}>
      <div style={STYLES.hdr.topRow}>
        <div>
          <div style={{...STYLES.hdr.title, color:"var(--text-1)", textShadow:`0 1px 14px rgba(201,168,76,.2)`}}>Nominations</div>
          <div style={{...STYLES.hdr.sub, color:"var(--text-3)"}}>
            Round {round+1} of {totalRounds} · {roundCards} cards
            {trump&&<> · Trump: <span style={{color:SUIT_COLOR[trump],fontWeight:700}}>{trump}</span></>}
            {roundStartedAt!=null&&<> · <span style={{fontVariantNumeric:"tabular-nums",color:"var(--gold-2)"}} aria-label="Round time">⏱ {fmtDuration(nowMs-roundStartedAt)}</span></>}
          </div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {trump&&<Card suit={trump} size="sm" glow/>}
          {phase==="play"&&(
            <div style={STYLES.hdr.tabRow}>
              {[
                {id:"game",    icon:<CardIcon size={14}/>,      label:"Game"},
                {id:"table",   icon:<TrophyIcon size={14}/>,    label:"Standings"},
                {id:"history", icon:<ClipboardIcon size={14}/>, label:"History"},
              ].map(({id:t,icon:ic,label})=>(
                <button key={t} aria-label={label} aria-pressed={tab===t} className="tab-pill press" onClick={()=>setTab(t)} style={{
                  padding:"10px 14px",fontSize:12,borderRadius:9,cursor:"pointer",minHeight:44,display:"flex",alignItems:"center",gap:5,
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
    const busted=bustedCalls(nomIdx,dealerIdx,noms,roundCards);
    const doneCount=noms.filter(n=>n!==null).length;

    return(
      <Felt style={{paddingBottom:48}}>
        <Hdr/>
        <div style={{maxWidth:600,margin:"0 auto",padding:"0 18px"}}>
          {/* Order strip */}
          <Panel accent={undefined} style={STYLES.nominate.orderPanel}>
            <Lbl style={{marginBottom:10}}>Nomination order</Lbl>
            <div style={STYLES.nominate.orderStrip}>
              {order.map((pi,pos)=>{
                const done=noms[pi]!==null, active=pi===nomIdx;
                const ordinal=["1st","2nd","3rd"][pos]||(pos+1)+"th";
                return(
                  <div key={pi} style={{display:"flex",alignItems:"center",gap:4}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1}}>
                      <span style={{...STYLES.nominate.ordinal,color:active?C.gold:done?C.green:C.mutedD}}>{ordinal}</span>
                      <div style={{
                        padding:"10px 13px",borderRadius:20,fontSize:12,transition:"all .2s",minHeight:44,display:"flex",alignItems:"center",
                        background:active?"rgba(201,168,76,.2)":done?"rgba(26,107,60,.22)":"rgba(255,255,255,.04)",
                        border:`1px solid ${active?"var(--gold-2)":done?"color-mix(in srgb, var(--green-pos) 53%, transparent)":"rgba(255,255,255,.08)"}`,
                        color:active?"var(--gold-2)":done?"#7ac47a":"var(--text-3)",fontWeight:active?700:400,
                        boxShadow:active?`0 0 12px color-mix(in srgb, var(--gold-2) 13%, transparent)`:"none"
                      }}>{players[pi]}{done?` — ${noms[pi]}`:""}{pi===dealerIdx&&<span aria-hidden="true" style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:"var(--gold-2)",marginLeft:5,verticalAlign:"middle"}}/>}</div>
                    </div>
                    {pos<order.length-1&&<span style={{color:"#2a3a2a",fontSize:12,marginTop:12}}>›</span>}
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* Active caller */}
          <Panel accent style={STYLES.nominate.callerPanel} className="pop-in">
            <div style={STYLES.nominate.callerTop}>
              <div>
                <Lbl style={{marginBottom:6}}>
                  {isDealer?"Dealer's call":"Your call"}
                  {isDealer&&<span style={{color:C.redL,marginLeft:8,fontSize:10}}>· total can't equal {roundCards}</span>}
                </Lbl>
                <div style={{color:"var(--text-1)",fontSize:28,fontWeight:700,fontFamily:"'Playfair Display',serif",lineHeight:1.1}}>{players[nomIdx]}</div>
              </div>
              <div style={STYLES.nominate.callerRight}>
                <div style={{...STYLES.nominate.callerCount,color:"var(--text-3)"}}>{doneCount} of {players.length} called</div>
                <div style={{...STYLES.nominate.callerTricks,color:"var(--gold-2)"}}>{roundCards} tricks</div>
              </div>
            </div>
            <Lbl style={{marginBottom:12}}>How many tricks will you win?</Lbl>
            <div style={STYLES.nominate.chipsWrap}>
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
              <div style={{...STYLES.nominate.bustWarning,color:"var(--red-neg)"}}>
                ⚠ You can't call {busted[0]} — that would make the total equal the tricks available
              </div>
            )}
          </Panel>

          {/* Done list */}
          {noms.some(n=>n!==null)&&(
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {order.filter(pi=>noms[pi]!==null).map(pi=>(
                <div key={pi} style={STYLES.nominate.doneRow}>
                  <div>
                    <div style={{...STYLES.nominate.donePlayerName,color:"var(--text-1)"}}>{players[pi]}</div>
                    <div style={{...STYLES.nominate.doneCalledLbl,color:"var(--text-3)"}}>Called <strong style={{color:"var(--gold-2)"}}>{noms[pi]}</strong></div>
                  </div>
                  <button onClick={()=>changeNom(pi)} style={{...STYLES.nominate.editBtn,color:"var(--text-2)"}}>Edit</button>
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
  const resultIssue=roundResultIssue(noms,hits,roundCards);
  const impossibleResult=resultIssue!==null;

  return(
    <Felt style={{paddingBottom:60}}>
      <Hdr/>
      <div className="max-game-width" style={{maxWidth:600,margin:"0 auto",padding:"0 18px"}}>
        {tab==="table"  &&<Leaderboard players={players} scores={scores}/>}
        {tab==="history"&&<RoundHistory history={history} players={players} onSaveRound={saveRoundEdit}/>}
        {tab==="game"&&(
          <>
            {/* Bust banner */}
            <div style={{
              ...STYLES.play.bustBanner,
              background: nomDiff===0 ? "rgba(239,68,68,.1)" : "var(--bg-raised)",
              border: `1px solid ${nomDiff===0 ? "var(--red-neg)" : "var(--border-subtle)"}`,
            }}>
              <div style={{...STYLES.play.bustLeft,color:"var(--text-2)"}}>
                Nominated: <strong style={{color:"var(--gold-2)",fontVariantNumeric:"tabular-nums"}}>{tNom}</strong> / {roundCards}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                {!anyHit&&(
                  <button onClick={()=>changeNom(nomOrder(dealerIdx,players.length)[players.length-1])}
                    style={{background:"none",border:"none",cursor:"pointer",fontSize:12,color:"var(--text-3)",fontFamily:"system-ui",fontStyle:"italic",textDecoration:"underline",padding:"4px 0",minHeight:44,display:"flex",alignItems:"center"}}>
                    Edit calls
                  </button>
                )}
                <div style={{...STYLES.play.bustRight,color:nomDiff===0?"var(--red-neg)":nomDiff>0?"var(--gold-2)":"var(--green-pos)"}}>
                  {nomDiff===0?"⚠ Bust round!":nomDiff>0?`+${nomDiff} over`:`${Math.abs(nomDiff)} under`}
                </div>
              </div>
            </div>

            {/* Player hit/miss cards */}
            <div style={STYLES.play.cardsWrap}>
              {players.map((name,i)=>{
                const nom=noms[i],hit=hits[i],isDealer=i===dealerIdx;
                const pc=PLAYER_COLORS[i%PLAYER_COLORS.length];
                const accentColor=hit===true?C.green:hit===false?C.red:pc+"99";
                return(
                  <div key={name} className="fade-up" style={{
                    ...STYLES.play.cardInner,
                    background:`linear-gradient(155deg,${pc}0d,var(--bg-surface) 40%)`,
                    border:`1px solid ${pc}33`,
                    borderLeft:`4px solid ${accentColor}`,
                    boxShadow:isDealer?`0 0 0 1.5px color-mix(in srgb, var(--gold-2) 40%, transparent), 0 4px 24px rgba(0,0,0,.5)`:"0 2px 12px rgba(0,0,0,.4)",
                  }}>
                    {/* top glow tint */}
                    {hit===true&&<div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 50% 0%,color-mix(in srgb, var(--green-pos) 4%, transparent),transparent 65%)`,pointerEvents:"none"}}/>}
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
                    <div style={STYLES.play.cardTop}>
                      <div>
                        <div style={STYLES.play.cardName}>{name}</div>
                        <div style={{...STYLES.play.cardScore,color:"var(--gold-2)"}}>
                          {scores[i]}<span style={{...STYLES.play.cardPts,color:"var(--text-3)"}}>pts</span>
                        </div>
                      </div>
                      <div style={STYLES.play.cardRight}>
                        <div style={STYLES.play.cardLbl}>Called</div>
                        <div style={STYLES.play.cardNom}>{nom}</div>
                      </div>
                    </div>
                    <div style={STYLES.play.hitBtns}>
                      {[
                        {val:true, label:"✓  Hit", pts:`+${10+nom}`, activeC:C.gold,  activeBg:"rgba(26,107,60,.2)",    activeBd:C.green},
                        {val:false,label:"✗  Miss",pts:"+0",          activeC:"#e07060",activeBg:"rgba(192,57,43,.18)", activeBd:C.red},
                      ].map(({val,label,pts,activeC,activeBg,activeBd})=>(
                        <button key={String(val)} className="press" onClick={()=>toggleHit(i,val)} style={{
                          ...STYLES.play.hitBtnBase,
                          border:`1.5px solid ${hit===val?activeBd:"var(--border-subtle)"}`,
                          background:hit===val?activeBg:"var(--bg-raised)",
                          color:hit===val?activeC:"var(--text-2)",
                          fontWeight:hit===val?700:400,
                        }}>
                          {label} <span style={{fontSize:12,opacity:.75,fontVariantNumeric:"tabular-nums"}}>{pts}pts</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Impossible result warning */}
            {impossibleResult&&(
              <div className="pop-in" style={{borderRadius:10,padding:"10px 14px",marginBottom:8,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.35)",display:"flex",alignItems:"center",gap:8}}>
                <XCircleIcon size={16} color={C.red}/>
                <span style={{fontSize:13,color:C.red}}>{resultIssue}</span>
              </div>
            )}

            {/* Undo + End */}
            <div style={STYLES.play.undoRow}>
              {anyHit&&<Btn v="ghost" sm onClick={undoHit}>↩ Undo</Btn>}
              {allResolved()&&!confirmEnd&&(
                <button className="press btn-primary" onClick={()=>!impossibleResult&&setConfirmEnd(true)} style={{
                  ...STYLES.play.endRoundBtn,
                  border:`1.5px solid ${impossibleResult?"var(--text-3)":"var(--gold-2)"}`,
                  color:impossibleResult?"var(--text-3)":"var(--gold-2)",
                  boxShadow:impossibleResult?"none":`0 6px 28px color-mix(in srgb, var(--gold-2) 16%, transparent)`,
                  cursor:impossibleResult?"not-allowed":"pointer",
                  opacity:impossibleResult?0.5:1,
                }}>{round+1>=totalRounds?"See Final Results →":`End Round ${round+1} →`}</button>
              )}
            </div>

            {/* Confirm */}
            {confirmEnd&&(
              <Panel accent style={{marginTop:8}} className="pop-in">
                <div style={STYLES.play.confirmTitle}>End round {round+1}?</div>
                <div style={{...STYLES.play.confirmSub,color:"var(--text-2)"}}>Make sure everyone's result is correct before confirming.</div>
                <div style={STYLES.play.confirmBtns}>
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
