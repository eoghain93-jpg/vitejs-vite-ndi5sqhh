import type { RoundRecord } from "./game";

// Lifetime per-player stats, persisted in localStorage and keyed by
// lowercased name so "Sarah" and "sarah" share a record.
export type PlayerStats = {
  name: string;         // most recent display casing
  games: number;
  wins: number;
  callsMade: number;
  callsHit: number;
  totalPoints: number;
  bestScore: number;
  bestStreak: number;   // longest consecutive-hit run within a single game
  moneyNet: number;     // pence, winner-takes-all settlement
  lastPlayedAt: number;
};

export type StatsStore = { v: 1; players: Record<string, PlayerStats> };

export const STATS_KEY = "nominations-stats-v1";

export function loadStats(): StatsStore {
  try{
    const raw=localStorage.getItem(STATS_KEY);
    if(raw){
      const parsed=JSON.parse(raw);
      if(parsed?.v===1&&parsed.players)return parsed;
    }
  }catch{/* ignore */}
  return { v:1, players:{} };
}

export function clearStats(): void {
  try{localStorage.removeItem(STATS_KEY);}catch{/* ignore */}
}

const blank = (name: string): PlayerStats => ({
  name, games:0, wins:0, callsMade:0, callsHit:0,
  totalPoints:0, bestScore:0, bestStreak:0, moneyNet:0, lastPlayedAt:0,
});

// Record one completed game. Called exactly once, when the final round summary
// is dismissed. Money follows the app's default settlement: everyone pays the
// (first) top scorer their points-behind × stake.
export function recordGame(
  players: string[], scores: number[], stake: number, history: RoundRecord[]
): void {
  if(players.length<2||!history.length)return;
  const store=loadStats();
  const topScore=Math.max(...scores);
  const winnerIdx=scores.indexOf(topScore);
  const potForWinner=scores.reduce((s,sc)=>s+(topScore-sc)*stake,0);
  const now=Date.now();

  players.forEach((name,i)=>{
    const key=name.trim().toLowerCase();
    const p=store.players[key]??blank(name.trim());
    p.name=name.trim();
    p.games+=1;
    if(scores[i]===topScore)p.wins+=1;
    p.totalPoints+=scores[i];
    p.bestScore=Math.max(p.bestScore,scores[i]);
    p.moneyNet+=i===winnerIdx?potForWinner:-(topScore-scores[i])*stake;
    let streak=0;
    for(const r of history){
      p.callsMade+=1;
      if(r.hits[i]){p.callsHit+=1;streak+=1;p.bestStreak=Math.max(p.bestStreak,streak);}
      else streak=0;
    }
    p.lastPlayedAt=now;
    store.players[key]=p;
  });

  try{localStorage.setItem(STATS_KEY,JSON.stringify(store));}catch{/* ignore */}
}
