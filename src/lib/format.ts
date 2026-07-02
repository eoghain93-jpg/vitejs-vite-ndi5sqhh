export const fmtMoney = (p: number): string => { if(!p)return"0p"; const l=Math.floor(p/100),r=p%100; return l>0?`£${l}.${r.toString().padStart(2,"0")}`:`${p}p`; };

export const fmtStake = (p: number): string => p>=100?`£${(p/100).toFixed(p%100===0?0:2)}`:`${p}p`;

export const fmtDuration = (ms: number): string => {
  if(!ms||ms<0)return"0:00";
  const s=Math.floor(ms/1000), h=Math.floor(s/3600), m=Math.floor((s%3600)/60), sec=s%60;
  const pad=(n:number)=>n.toString().padStart(2,"0");
  return h>0?`${h}:${pad(m)}:${pad(sec)}`:`${m}:${pad(sec)}`;
};

export const fmtAgo = (ms: number): string => {
  if(ms<0)return"just now";
  const s=Math.floor(ms/1000);
  if(s<60)return"just now";
  const m=Math.floor(s/60);
  if(m<60)return`${m} min ago`;
  const h=Math.floor(m/60);
  if(h<24)return`${h} hr ago`;
  const d=Math.floor(h/24);
  return`${d} day${d===1?"":"s"} ago`;
};
