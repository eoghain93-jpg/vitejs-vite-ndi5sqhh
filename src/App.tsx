import { useState, useEffect, useRef } from "react";

const CARD_GREEN = "#1a6b3c";
const FELT_GREEN = "#0f4d2a";
const GOLD = "#c9a84c";
const CREAM = "#f5f0e8";
const DARK = "#0a0a0a";
const RED_CARD = "#c0392b";

function getRoundCards(roundIndex, totalRounds) {
  return totalRounds - roundIndex;
}

const TRUMP_SUITS = ["♠", "♥", "♦", "♣"];
const SUIT_NAMES = { "♠": "Spades", "♥": "Hearts", "♦": "Diamonds", "♣": "Clubs" };
const suitColors = { "♠": "#1a1a2e", "♥": RED_CARD, "♦": RED_CARD, "♣": "#1a1a2e" };
const suitBg = { "♠": "#e8eaf0", "♥": "#fde8e8", "♦": "#fde8e8", "♣": "#e8eaf0" };

// ---- SPIN WHEEL ----
function SpinWheel({ players, onDone }) {
  const canvasRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const angleRef = useRef(0);
  const velocityRef = useRef(0);
  const rafRef = useRef(null);

  const colors = ["#1a6b3c","#c9a84c","#2c5f8a","#8a3a6b","#5a8a3a","#8a5a2a","#3a5a8a","#6b4a1a"];
  const count = players.length;
  const slice = (2 * Math.PI) / count;

  function draw(angle) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = cx - 8;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.fillStyle = "#0a1a0e";
    ctx.fill();
    ctx.restore();

    players.forEach((name, i) => {
      const start = angle + i * slice - Math.PI / 2;
      const end = start + slice;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + slice / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = CREAM;
      ctx.font = `bold ${Math.min(14, 120 / count)}px Georgia, serif`;
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 4;
      ctx.fillText(name.length > 8 ? name.slice(0, 7) + "…" : name, r - 10, 5);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, 2 * Math.PI);
    ctx.fillStyle = GOLD;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 13, 0, 2 * Math.PI);
    ctx.fillStyle = DARK;
    ctx.fill();

    // Pointer arrow on the right
    ctx.beginPath();
    ctx.moveTo(cx + r - 2, cy);
    ctx.lineTo(cx + r + 16, cy - 10);
    ctx.lineTo(cx + r + 16, cy + 10);
    ctx.closePath();
    ctx.fillStyle = GOLD;
    ctx.fill();
  }

  useEffect(() => { draw(angleRef.current); }, [players]);

  function spin() {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    velocityRef.current = 0.22 + Math.random() * 0.28;

    function animate() {
      angleRef.current += velocityRef.current;
      velocityRef.current *= 0.986;
      draw(angleRef.current);
      if (velocityRef.current > 0.002) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        // Pointer is at the right (0 degrees). Slices start from top (-PI/2 offset).
        // To find which slice is at the pointer, we need to account for the -PI/2 offset.
        const norm = ((-angleRef.current + Math.PI / 2) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const winIdx = Math.floor(norm / slice) % count;
        setResult(players[winIdx]);
      }
    }
    rafRef.current = requestAnimationFrame(animate);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <canvas ref={canvasRef} width={280} height={280} style={{ display: "block" }} />
      {result ? (
        <div style={{ textAlign: "center" }}>
          <div style={{ color: "#7aaa7a", fontSize: 13, marginBottom: 6 }}>First dealer is</div>
          <div style={{ color: GOLD, fontSize: 34, fontWeight: 900, fontFamily: "'Playfair Display', serif", marginBottom: 20 }}>{result}</div>
          <button onClick={() => onDone(result)} style={{
            padding: "14px 44px", background: `linear-gradient(135deg, ${CARD_GREEN}, #0f5a30)`,
            border: `1px solid ${GOLD}`, borderRadius: 12, color: GOLD, fontSize: 16,
            fontWeight: 800, cursor: "pointer", fontFamily: "'Playfair Display', serif"
          }}>Start Game →</button>
        </div>
      ) : (
        <button onClick={spin} disabled={spinning} style={{
          padding: "14px 48px", background: spinning ? "rgba(255,255,255,0.04)" : `linear-gradient(135deg, ${CARD_GREEN}, #0f5a30)`,
          border: `1px solid ${spinning ? "#3a5a3f" : GOLD}`, borderRadius: 12,
          color: spinning ? "#5a8a5a" : GOLD, fontSize: 16, fontWeight: 800,
          cursor: spinning ? "not-allowed" : "pointer", fontFamily: "'Playfair Display', serif",
          transition: "all 0.3s"
        }}>{spinning ? "Spinning…" : "Spin for Dealer 🎰"}</button>
      )}
    </div>
  );
}

// ---- TRUMP PICKER ----
function TrumpPicker({ onPick }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ color: "#7aaa7a", fontSize: 13, marginBottom: 24, fontStyle: "italic" }}>
        Flip the top card — what's the trump suit?
      </div>
      <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
        {TRUMP_SUITS.map(suit => (
          <button key={suit} onClick={() => onPick(suit)} style={{
            width: 68, height: 92, borderRadius: 12, background: suitBg[suit],
            border: `2px solid ${suitColors[suit]}33`, cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 4, boxShadow: "0 4px 16px rgba(0,0,0,0.5)", transition: "transform 0.15s, box-shadow 0.15s"
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-5px) scale(1.06)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.6)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.5)"; }}
          >
            <span style={{ fontSize: 30, color: suitColors[suit] }}>{suit}</span>
            <span style={{ fontSize: 9, color: suitColors[suit], fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>{SUIT_NAMES[suit]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---- PLAYER CARD ----
function PlayerCard({ name, isDealer, score, nomination, hit, roundActive, onNominate, onToggleHit, roundCards, allNominated, bustedNominations }) {
  const nominated = nomination !== null && nomination !== undefined;

  let borderColor = "#2a4a2f";
  if (roundActive && nominated && allNominated) {
    borderColor = hit === true ? GOLD : hit === false ? "#c0392b" : "#4a7a4f";
  } else if (roundActive && nominated) {
    borderColor = "#4a7a4f";
  }

  return (
    <div style={{
      background: `linear-gradient(145deg, #1c2a1e, #162318)`,
      border: `1px solid ${borderColor}`,
      borderRadius: 16, padding: "16px 18px", position: "relative",
      boxShadow: isDealer ? `0 0 0 2px ${GOLD}, 0 4px 20px rgba(201,168,76,0.15)` : "0 2px 12px rgba(0,0,0,0.4)",
      transition: "all 0.3s ease"
    }}>
      {isDealer && (
        <div style={{
          position: "absolute", top: -10, right: 14,
          background: GOLD, color: DARK, fontSize: 10, fontWeight: 800,
          padding: "2px 10px", borderRadius: 20, letterSpacing: 1, textTransform: "uppercase"
        }}>Dealer</div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: nominated ? 12 : 0 }}>
        <div>
          <div style={{ color: CREAM, fontSize: 16, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{name}</div>
          <div style={{ color: GOLD, fontSize: 20, fontWeight: 800 }}>{score}<span style={{ fontSize: 11, color: "#7a9a7a", marginLeft: 3 }}>pts</span></div>
        </div>
        {nominated && (
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "#7a9a7a", fontSize: 10, marginBottom: 2 }}>Nominated</div>
            <div style={{ color: CREAM, fontSize: 26, fontWeight: 900 }}>{nomination}</div>
          </div>
        )}
      </div>

      {/* Nomination buttons */}
      {roundActive && !allNominated && !nominated && (
        <div>
          <div style={{ color: "#7a9a7a", fontSize: 10, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>How many tricks?</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {Array.from({ length: roundCards + 1 }, (_, i) => {
              const isBusted = bustedNominations.includes(i);
              return (
                <button key={i} onClick={() => !isBusted && onNominate(i)} style={{
                  width: 38, height: 38, borderRadius: 8,
                  border: `1px solid ${isBusted ? "#1e2e1e" : "#3a6a3f"}`,
                  background: isBusted ? "#0e180f" : "rgba(26,107,60,0.25)",
                  color: isBusted ? "#2a3a2a" : CREAM, fontSize: 14, fontWeight: 600,
                  cursor: isBusted ? "not-allowed" : "pointer",
                  textDecoration: isBusted ? "line-through" : "none", transition: "all 0.1s"
                }}>{i}</button>
              );
            })}
          </div>
        </div>
      )}

      {/* Hit / Miss */}
      {roundActive && allNominated && nominated && (
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => onToggleHit(hit === true ? null : true)} style={{
            flex: 1, padding: "11px 0", borderRadius: 10,
            border: `1px solid ${hit === true ? GOLD : "#3a5a3f"}`,
            background: hit === true ? "rgba(201,168,76,0.18)" : "rgba(255,255,255,0.03)",
            color: hit === true ? GOLD : "#7a9a7a", fontWeight: hit === true ? 800 : 400,
            cursor: "pointer", fontSize: 14, transition: "all 0.15s"
          }}>✓ Hit &nbsp;+{10 + nomination}pts</button>
          <button onClick={() => onToggleHit(hit === false ? null : false)} style={{
            flex: 1, padding: "11px 0", borderRadius: 10,
            border: `1px solid ${hit === false ? "#c0392b" : "#3a5a3f"}`,
            background: hit === false ? "rgba(192,57,43,0.18)" : "rgba(255,255,255,0.03)",
            color: hit === false ? "#e07060" : "#7a9a7a", fontWeight: hit === false ? 800 : 400,
            cursor: "pointer", fontSize: 14, transition: "all 0.15s"
          }}>✗ Miss &nbsp;+0pts</button>
        </div>
      )}
    </div>
  );
}

// ---- LEADERBOARD ----
function Leaderboard({ players, scores }) {
  const sorted = [...players].map((p, i) => ({ name: p, score: scores[i] })).sort((a, b) => b.score - a.score);
  return (
    <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 14, padding: "16px 18px", border: "1px solid #2a4a2f" }}>
      <div style={{ color: GOLD, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 14 }}>🏆 Standings</div>
      {sorted.map((p, i) => (
        <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <div style={{
            width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
            background: i === 0 ? GOLD : i === 1 ? "#8a9a9a" : i === 2 ? "#a0724a" : "rgba(255,255,255,0.07)",
            color: i < 3 ? DARK : CREAM, fontSize: 11, fontWeight: 800
          }}>{i + 1}</div>
          <div style={{ flex: 1, color: CREAM, fontSize: 15, fontFamily: "'Playfair Display', serif" }}>{p.name}</div>
          <div style={{ color: GOLD, fontWeight: 700, fontSize: 18 }}>{p.score}<span style={{ fontSize: 11, color: "#7a9a7a", marginLeft: 3 }}>pts</span></div>
        </div>
      ))}
    </div>
  );
}

// ---- MONEY SETTLEMENT ----
function MoneySettlement({ players, scores, stakePerPoint }) {
  const sorted = [...players].map((p, i) => ({ name: p, score: scores[i] })).sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  function formatMoney(pence) {
    if (pence === 0) return "0p";
    const pounds = Math.floor(pence / 100);
    const rem = pence % 100;
    return pounds > 0 ? `£${pounds}.${rem.toString().padStart(2, "0")}` : `${pence}p`;
  }

  return (
    <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 14, padding: "18px 20px", border: `1px solid rgba(201,168,76,0.25)`, marginTop: 16 }}>
      <div style={{ color: GOLD, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>💰 Money Owed to {winner.name}</div>
      <div style={{ color: "#6a8a6a", fontSize: 12, marginBottom: 16, fontStyle: "italic" }}>{stakePerPoint}p per point · winner on {winner.score}pts</div>
      {sorted.slice(1).map((p, i) => {
        const diff = winner.score - p.score;
        const pence = diff * stakePerPoint;
        return (
          <div key={p.name} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "10px 0", borderBottom: i < sorted.length - 2 ? "1px solid #1a2a1a" : "none"
          }}>
            <div style={{ color: CREAM, fontSize: 15, fontFamily: "'Playfair Display', serif" }}>{p.name}</div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#e07060", fontWeight: 800, fontSize: 20 }}>{formatMoney(pence)}</div>
              <div style={{ color: "#4a6a4a", fontSize: 11 }}>{diff} pts behind</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- SETUP ----
function Setup({ onStart }) {
  const [names, setNames] = useState(["", "", "", "", ""]);
  const [rounds, setRounds] = useState(10);
  const [stake, setStake] = useState(5);

  const setName = (i, v) => setNames(n => n.map((x, j) => j === i ? v : x));
  const addPlayer = () => { if (names.length < 8) setNames(n => [...n, ""]); };
  const removePlayer = (i) => { if (names.length > 2) setNames(n => n.filter((_, j) => j !== i)); };
  const valid = names.filter(name => name.trim()).length >= 2;
  const adjustStake = (delta) => setStake(s => Math.max(5, s + delta));

  function formatStake(p) {
    return p >= 100 ? `£${p / 100}` : `${p}p`;
  }

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at 30% 20%, #1a3a22 0%, ${FELT_GREEN} 40%, #050e08 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 50, marginBottom: 8 }}>🃏</div>
          <h1 style={{ color: GOLD, fontSize: 44, fontWeight: 900, margin: 0, fontFamily: "'Playfair Display', serif", letterSpacing: -1 }}>Nominations</h1>
          <p style={{ color: "#7aaa7a", fontSize: 13, marginTop: 8, fontStyle: "italic" }}>The trick-taking scoring companion</p>
        </div>
        <div style={{ background: "rgba(0,0,0,0.45)", borderRadius: 20, padding: 28, border: "1px solid #2a4a2f" }}>
          <div style={{ marginBottom: 22 }}>
            <label style={{ color: GOLD, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 10 }}>Players <span style={{ color: "#5a7a5a", fontStyle: "italic", textTransform: "none", letterSpacing: 0 }}>(top = deals first clockwise)</span></label>
            {names.map((name, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
                <div style={{ color: "#4a6a4a", fontSize: 11, minWidth: 16, textAlign: "center" }}>{i + 1}</div>
                <input value={name} onChange={e => setName(i, e.target.value)} placeholder={`Player ${i + 1}`}
                  style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid #3a5a3f", borderRadius: 10, padding: "10px 14px", color: CREAM, fontSize: 15, outline: "none" }} />
                {names.length > 2 && (
                  <button onClick={() => removePlayer(i)} style={{ width: 38, background: "rgba(192,57,43,0.15)", border: "1px solid rgba(192,57,43,0.3)", borderRadius: 10, color: "#e07060", cursor: "pointer", fontSize: 18 }}>×</button>
                )}
              </div>
            ))}
            {names.length < 8 && (
              <button onClick={addPlayer} style={{ width: "100%", padding: 10, background: "rgba(26,107,60,0.15)", border: "1px dashed #3a6a3f", borderRadius: 10, color: "#7aaa7a", cursor: "pointer", fontSize: 13, marginTop: 4 }}>+ Add Player</button>
            )}
          </div>
          <div style={{ marginBottom: 22 }}>
            <label style={{ color: GOLD, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 10 }}>Rounds</label>
            <div style={{ display: "flex", gap: 8 }}>
              {[5, 7, 10, 13].map(r => (
                <button key={r} onClick={() => setRounds(r)} style={{
                  flex: 1, padding: "10px 0", borderRadius: 10,
                  border: `1px solid ${rounds === r ? GOLD : "#3a5a3f"}`,
                  background: rounds === r ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.03)",
                  color: rounds === r ? GOLD : CREAM, fontWeight: rounds === r ? 700 : 400,
                  cursor: "pointer", fontSize: 15, fontFamily: "'Playfair Display', serif"
                }}>{r}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 26 }}>
            <label style={{ color: GOLD, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 10 }}>Stake per point</label>
            <div style={{ display: "flex", alignItems: "center", gap: 0, background: "rgba(255,255,255,0.03)", borderRadius: 12, border: "1px solid #3a5a3f", overflow: "hidden" }}>
              <button onClick={() => adjustStake(-5)} disabled={stake <= 5} style={{
                width: 52, height: 48, background: "rgba(255,255,255,0.04)", border: "none", borderRight: "1px solid #3a5a3f",
                color: stake <= 5 ? "#2a4a2f" : CREAM, fontSize: 22, cursor: stake <= 5 ? "not-allowed" : "pointer"
              }}>−</button>
              <div style={{ flex: 1, textAlign: "center", color: GOLD, fontSize: 22, fontWeight: 800, fontFamily: "'Playfair Display', serif" }}>
                {formatStake(stake)}
              </div>
              <button onClick={() => adjustStake(5)} style={{
                width: 52, height: 48, background: "rgba(255,255,255,0.04)", border: "none", borderLeft: "1px solid #3a5a3f",
                color: CREAM, fontSize: 22, cursor: "pointer"
              }}>+</button>
            </div>
            <div style={{ color: "#4a6a4a", fontSize: 11, marginTop: 6, textAlign: "center" }}>multiples of 5p · use +/− to set</div>
          </div>
          <button onClick={() => valid && onStart(names.filter(n => n.trim()), rounds, stake)} style={{
            width: "100%", padding: 16, borderRadius: 12,
            background: valid ? `linear-gradient(135deg, ${CARD_GREEN}, #0f5a30)` : "rgba(255,255,255,0.04)",
            border: `1px solid ${valid ? GOLD : "#2a4a2f"}`,
            color: valid ? GOLD : "#3a5a3f", fontSize: 17, fontWeight: 800,
            cursor: valid ? "pointer" : "not-allowed", fontFamily: "'Playfair Display', serif"
          }}>Continue →</button>
        </div>
      </div>
    </div>
  );
}

// ---- MAIN APP ----
export default function App() {
  const [phase, setPhase] = useState("setup");
  const [players, setPlayers] = useState([]);
  const [totalRounds, setTotalRounds] = useState(10);
  const [round, setRound] = useState(0);
  const [dealerIndex, setDealerIndex] = useState(0);
  const [scores, setScores] = useState([]);
  const [nominations, setNominations] = useState([]);
  const [hits, setHits] = useState([]);
  const [trumpSuit, setTrumpSuit] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [stakePerPoint, setStakePerPoint] = useState(5);

  function startGame(playerNames, rounds, stake) {
    setPlayers(playerNames);
    setTotalRounds(rounds);
    setStakePerPoint(stake);
    setScores(Array(playerNames.length).fill(0));
    setPhase("spin");
  }

  function afterSpin(dealerName) {
    const idx = players.indexOf(dealerName);
    setDealerIndex(idx);
    beginRound(0, idx);
  }

  function beginRound(r, dealer) {
    setRound(r);
    setDealerIndex(dealer);
    setNominations(Array(players.length).fill(null));
    setHits(Array(players.length).fill(null));
    setTrumpSuit(null);
    setPhase("trump");
    setShowLeaderboard(false);
  }

  function pickTrump(suit) {
    setTrumpSuit(suit);
    setPhase("game");
  }

  function nominate(i, v) {
    setNominations(prev => prev.map((x, j) => j === i ? v : x));
  }

  function toggleHit(i, val) {
    setHits(prev => prev.map((x, j) => j === i ? val : x));
  }

  function allNominated() {
    return nominations.every(n => n !== null);
  }

  function allResolved() {
    return allNominated() && hits.every(h => h !== null);
  }

  function getBusted(playerIdx) {
    if (playerIdx !== dealerIndex) return [];
    const roundCards = getRoundCards(round, totalRounds);
    const others = nominations.reduce((s, n, i) => i !== dealerIndex ? s + (n ?? 0) : s, 0);
    const forbidden = roundCards - others;
    return forbidden >= 0 && forbidden <= roundCards ? [forbidden] : [];
  }

  function endRound() {
    const newScores = scores.map((s, i) => s + (hits[i] ? 10 + nominations[i] : 0));
    setScores(newScores);
    if (round + 1 >= totalRounds) {
      setPhase("end");
    } else {
      // Clockwise = next player in setup order after current dealer
      const nextDealer = (dealerIndex + 1) % players.length;
      setRound(r => r + 1);
      setDealerIndex(nextDealer);
      setNominations(Array(players.length).fill(null));
      setHits(Array(players.length).fill(null));
      setTrumpSuit(null);
      setPhase("trump");
      setShowLeaderboard(false);
    }
  }

  // Shared font link
  const fontLink = <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&display=swap" rel="stylesheet" />;

  if (phase === "setup") return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at 30% 20%, #1a3a22 0%, ${FELT_GREEN} 40%, #050e08 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "Georgia, serif" }}>
      {fontLink}
      <Setup onStart={startGame} />
    </div>
  );

  // ---- SPIN ----
  if (phase === "spin") return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at 40% 20%, #1a3a22 0%, ${FELT_GREEN} 40%, #050e08 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "Georgia, serif" }}>
      {fontLink}
      <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
        <h2 style={{ color: GOLD, fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 900, marginBottom: 6 }}>Who deals first?</h2>
        <p style={{ color: "#7aaa7a", fontSize: 13, marginBottom: 28, fontStyle: "italic" }}>Spin the wheel to decide</p>
        <SpinWheel players={players} onDone={afterSpin} />
      </div>
    </div>
  );

  // ---- TRUMP ----
  if (phase === "trump") return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at 40% 20%, #1a3a22 0%, ${FELT_GREEN} 40%, #050e08 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "Georgia, serif" }}>
      {fontLink}
      <div style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
        <div style={{ color: GOLD, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>Round {round + 1} of {totalRounds}</div>
        <h2 style={{ color: CREAM, fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 900, marginBottom: 4 }}>{getRoundCards(round, totalRounds)} cards dealt</h2>
        <p style={{ color: "#7aaa7a", fontSize: 13, marginBottom: 36, fontStyle: "italic" }}>{players[dealerIndex]} is dealing</p>
        <TrumpPicker onPick={pickTrump} />
      </div>
    </div>
  );

  const roundCards = getRoundCards(round, totalRounds);
  const totalNom = nominations.reduce((s, n) => s + (n ?? 0), 0);
  const nomDiff = totalNom - roundCards;

  // ---- END ----
  if (phase === "end") {
    const sorted = [...players].map((p, i) => ({ name: p, score: scores[i] })).sort((a, b) => b.score - a.score);
    return (
      <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at 50% 10%, #1a3a22 0%, ${FELT_GREEN} 40%, #050e08 100%)`, padding: 24, fontFamily: "Georgia, serif" }}>
        {fontLink}
        <div style={{ maxWidth: 460, margin: "0 auto", paddingTop: 32, textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 10 }}>🏆</div>
          <h1 style={{ color: GOLD, fontSize: 38, margin: "0 0 4px", fontWeight: 900, fontFamily: "'Playfair Display', serif" }}>Game Over</h1>
          <p style={{ color: "#7aaa7a", fontStyle: "italic", marginBottom: 24 }}>Final Standings</p>
          <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: 20, padding: 20, border: "1px solid #2a4a2f" }}>
            {sorted.map((p, i) => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < sorted.length - 1 ? "1px solid #1a3a1f" : "none" }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  background: i === 0 ? GOLD : i === 1 ? "#8a9a9a" : i === 2 ? "#a0724a" : "rgba(255,255,255,0.06)",
                  color: i < 3 ? DARK : CREAM, fontSize: 15, fontWeight: 800
                }}>{i + 1}</div>
                <div style={{ flex: 1, color: CREAM, fontSize: 17, textAlign: "left", fontFamily: "'Playfair Display', serif" }}>{p.name}</div>
                <div style={{ color: GOLD, fontWeight: 800, fontSize: 20 }}>{p.score}<span style={{ fontSize: 11, color: "#7a9a7a", marginLeft: 3 }}>pts</span></div>
              </div>
            ))}
          </div>
          <MoneySettlement players={players} scores={scores} stakePerPoint={stakePerPoint} />
          <button onClick={() => setPhase("setup")} style={{
            marginTop: 24, padding: "14px 44px", background: `linear-gradient(135deg, ${CARD_GREEN}, #0f5a30)`,
            border: `1px solid ${GOLD}`, borderRadius: 12, color: GOLD, fontSize: 16,
            fontWeight: 800, cursor: "pointer", fontFamily: "'Playfair Display', serif"
          }}>New Game</button>
        </div>
      </div>
    );
  }

  // ---- GAME ----
  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(ellipse at 30% 10%, #1a3a22 0%, ${FELT_GREEN} 40%, #050e08 100%)`, fontFamily: "Georgia, serif", paddingBottom: 48 }}>
      {fontLink}
      <div style={{ padding: "18px 18px 0", maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ color: GOLD, fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900 }}>Nominations</div>
            <div style={{ color: "#7aaa7a", fontSize: 12 }}>Round {round + 1} of {totalRounds} · {roundCards} cards · Trump: <span style={{ color: suitColors[trumpSuit] }}>{trumpSuit}</span></div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{
              width: 50, height: 66, borderRadius: 8, background: suitBg[trumpSuit],
              border: `2px solid ${GOLD}55`, display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "2px 4px 12px rgba(0,0,0,0.5)", fontSize: 28, color: suitColors[trumpSuit]
            }}>{trumpSuit}</div>
            <button onClick={() => setShowLeaderboard(s => !s)} style={{
              padding: "8px 13px", background: showLeaderboard ? "rgba(201,168,76,0.12)" : "rgba(0,0,0,0.3)",
              border: `1px solid ${showLeaderboard ? GOLD : "#3a5a3f"}`, borderRadius: 10,
              color: showLeaderboard ? GOLD : CREAM, cursor: "pointer", fontSize: 12
            }}>{showLeaderboard ? "◀ Game" : "🏆 Table"}</button>
          </div>
        </div>
        <div style={{ display: "flex", gap: 3, marginBottom: 18 }}>
          {Array.from({ length: totalRounds }, (_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < round ? GOLD : i === round ? CARD_GREEN : "rgba(255,255,255,0.1)" }} />
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 18px" }}>
        {showLeaderboard ? (
          <Leaderboard players={players} scores={scores} />
        ) : (
          <>
            {allNominated() && (
              <div style={{
                background: nomDiff === 0 ? "rgba(192,57,43,0.14)" : "rgba(0,0,0,0.22)",
                border: `1px solid ${nomDiff === 0 ? "#c0392b" : "#2a4a2f"}`,
                borderRadius: 10, padding: "10px 14px", marginBottom: 14,
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <div style={{ color: CREAM, fontSize: 13 }}>Total nominated: <strong>{totalNom}</strong> / {roundCards}</div>
                <div style={{ color: nomDiff === 0 ? "#e07060" : nomDiff > 0 ? GOLD : "#7ac47a", fontSize: 12, fontWeight: 700 }}>
                  {nomDiff === 0 ? "⚠ Bust round!" : nomDiff > 0 ? `${nomDiff} over` : `${Math.abs(nomDiff)} under`}
                </div>
              </div>
            )}
            {!allNominated() && (
              <div style={{ background: "rgba(0,0,0,0.2)", borderRadius: 10, padding: "9px 14px", marginBottom: 14, color: "#7aaa7a", fontSize: 12, textAlign: "center" }}>
                Waiting for all nominations…
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              {players.map((name, i) => (
                <PlayerCard
                  key={name} name={name} isDealer={i === dealerIndex}
                  score={scores[i]} nomination={nominations[i]} hit={hits[i]}
                  roundActive={true} onNominate={(v) => nominate(i, v)}
                  onToggleHit={(v) => toggleHit(i, v)}
                  roundCards={roundCards} allNominated={allNominated()}
                  bustedNominations={getBusted(i)}
                />
              ))}
            </div>

            {allResolved() && (
              <button onClick={endRound} style={{
                width: "100%", padding: 16, borderRadius: 12,
                background: `linear-gradient(135deg, ${CARD_GREEN}, #0f5a30)`,
                border: `1px solid ${GOLD}`, color: GOLD, fontSize: 17, fontWeight: 800,
                cursor: "pointer", fontFamily: "'Playfair Display', serif"
              }}>
                {round + 1 >= totalRounds ? "See Final Results →" : `End Round ${round + 1} →`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}