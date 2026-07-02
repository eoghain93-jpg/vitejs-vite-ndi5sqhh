// Small vibration cues on supporting devices (Android Chrome etc.); no-ops elsewhere.
const canVibrate = typeof navigator !== "undefined" && "vibrate" in navigator;

export const haptic = {
  tap:     () => { if(canVibrate) navigator.vibrate(12); },
  success: () => { if(canVibrate) navigator.vibrate([15,40,45]); },
  warn:    () => { if(canVibrate) navigator.vibrate([35,50,35]); },
};
