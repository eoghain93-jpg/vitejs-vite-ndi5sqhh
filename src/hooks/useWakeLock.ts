import { useEffect } from "react";

// Keep the screen awake while a game is in progress (the scorer's phone sits
// on the table). Uses the Screen Wake Lock API where available; re-acquires
// after tab switches since the browser releases the lock on hide.
export function useWakeLock(active: boolean): void {
  useEffect(()=>{
    if(!active)return;
    if(typeof navigator==="undefined"||!("wakeLock" in navigator))return;
    let lock: { release: () => Promise<void> } | null = null;
    let cancelled=false;
    const acquire=async()=>{
      try{
        lock=await (navigator as Navigator & { wakeLock: { request(type: "screen"): Promise<never> } }).wakeLock.request("screen");
        if(cancelled)await lock?.release();
      }catch{/* low battery, iframe, or unsupported — fine without it */}
    };
    acquire();
    const onVis=()=>{ if(document.visibilityState==="visible")acquire(); };
    document.addEventListener("visibilitychange",onVis);
    return()=>{
      cancelled=true;
      document.removeEventListener("visibilitychange",onVis);
      lock?.release().catch(()=>{});
    };
  },[active]);
}
