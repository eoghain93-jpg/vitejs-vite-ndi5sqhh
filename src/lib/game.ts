import type { Suit } from "./constants";

export type RoundRecord = {
  round: number;
  roundCards: number;
  trump: Suit;
  nominations: number[];
  hits: boolean[];
  durationMs?: number;
};

// Cards dealt in a given round: counts down from `total` to 1.
export const getRoundCards = (roundIdx: number, totalRounds: number): number => totalRounds - roundIdx;

// Nomination order: left of dealer calls first, dealer calls last.
export const nomOrder = (dealerIdx: number, playerCount: number): number[] =>
  Array.from({length:playerCount},(_,i)=>(dealerIdx+1+i)%playerCount);

// Scoring rule: 10 points + your nomination if you hit it exactly, nothing otherwise.
export const pointsFor = (nom: number, hit: boolean): number => hit ? 10 + nom : 0;

// Rebuild cumulative scores from the full round history (source of truth after edits).
export const scoresFromHistory = (history: RoundRecord[], playerCount: number): number[] => {
  const scores = Array(playerCount).fill(0);
  for(const r of history)
    for(let i=0;i<playerCount;i++)
      if(r.hits[i]) scores[i] += pointsFor(r.nominations[i], true);
  return scores;
};

// The dealer's forbidden call: the value that would make total nominations equal the tricks available.
export const bustedCalls = (
  forIdx: number, dealerIdx: number, noms: (number|null)[], roundCards: number
): number[] => {
  if(forIdx!==dealerIdx)return[];
  const others=noms.reduce((s: number,n,i)=>i!==dealerIdx?s+(n??0):s,0);
  const f=roundCards-others;
  return f>=0&&f<=roundCards?[f]:[];
};

// Validate a full set of round results. Returns an error message, or null if consistent.
export const roundResultIssue = (
  nominations: (number|null)[], hits: (boolean|null)[], roundCards: number
): string | null => {
  const hitNomTotal = nominations.reduce((s: number,n,i)=>s+(hits[i]===true?(n??0):0),0);
  if(hitNomTotal>roundCards)
    return `Too many tricks claimed — only ${roundCards} available`;
  const allResolved = nominations.every(n=>n!==null)&&hits.every(h=>h!==null);
  if(allResolved&&hits.every(h=>h===true)&&hitNomTotal<roundCards)
    return `${roundCards-hitNomTotal} trick${roundCards-hitNomTotal!==1?"s":""} unaccounted for — at least one player must miss`;
  return null;
};

// ── Money settlement ──────────────────────────────────────────────────────────
// Winner-takes-all: everyone pays the leader (their points behind × stake).
// Pairwise ("all square up"): every pair settles the difference; shown as net per player.
export const pairwiseNet = (scores: number[], stake: number): number[] =>
  scores.map((si)=>scores.reduce((net,sj)=>net+(si-sj)*stake,0));
